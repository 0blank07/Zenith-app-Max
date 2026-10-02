d# ZenithFCM Search Performance Root-Cause Report

**Date:** 2026-09-30  
**Scope:** `zenithfcm.com` homepage search, `/players` search, modern squad-builder search, modern compare-player search, shared search API, and legacy search implementations.  
**Status:** Investigation complete; no production or application fix was implemented.

## Executive conclusion

The slow behavior has a shared root cause: all modern search surfaces call the same uncached dynamic proxy (`/internal-api/players/search`), and its direct database path performs work that is too expensive for autocomplete and picker requests:

1. It scans player names with `translate(lower(name), ...) LIKE '%query%'`. The leading wildcard and runtime expression prevent a normal name index from being useful.
2. It runs a full `COUNT(*)` query before the result query, sequentially, for every search.
3. It then runs a second `SELECT *` query and normalizes full player rows.
4. Missing color fields can trigger up to five sequential fallback HTTP requests per search.
5. The proxy is `cache: 'no-store'`, so repeated keystrokes and repeated users do not share results.

This is amplified by client behavior: each modern surface intentionally waits 300–350 ms before requesting, squad search asks for up to 220 records, and compare/squad then repeat filtering and string construction in the browser. The tools pages also send almost 1 MB of HTML/player data before the user starts searching.

The highest-confidence solution is to build a dedicated lightweight, indexed player-search endpoint: use a normalized indexed search column or PostgreSQL trigram index, parameterized predicates, a small projection, no exact count for autocomplete, short-lived caching, and one canonical response contract. Defer colors and prices until a player is selected or visible.

## Production measurements

Measurements were made against `https://zenithfcm.com` on 2026-09-30 using three requests per page and direct requests to the internal search endpoint. Network conditions and Cloudflare/server load can affect individual samples, so these are directional production observations rather than a capacity benchmark.

| Request | HTTP result | Response size | Observed timings |
|---|---:|---:|---:|
| `/internal-api/players/search?q=ron&limit=20&offset=0&rank=0` | 200 | 44,902 bytes | 700, 642, 1,194 ms |
| `/internal-api/players/search?q=mbappe&limit=20&offset=0&rank=0` | 200 | 44,889 bytes | 2,389, 2,744, 2,208 ms |
| `/internal-api/players/search?q=zzz-no-player&limit=20&offset=0&rank=0` | 200 | 78 bytes | 3,043, 2,105, 3,413 ms |
| `/` | 200 | about 429 KB | 705–3,333 ms |
| `/players` | 200 | about 423 KB | 767–3,666 ms |
| `/tools/squad-builder` | 200 | about 983 KB | 2,380–3,747 ms |
| `/tools/player-compare` | 200 | about 982 KB | 2,125–3,082 ms |

The search endpoint returns HTTP 200 even for no results, so a slow negative search is still spent scanning/counting rather than failing fast. `/players` returns `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`. The squad-builder page was observed with `X-Nextjs-Cache: HIT` and `s-maxage=4320000`, but its response is still large enough to add hydration and parsing cost.

## Request paths by surface

| Surface | Client behavior | Shared server behavior | Main latency exposure |
|---|---|---|---|
| Homepage | `HomeDashboardInteractions.client.js:190-194`; 300 ms debounce at `:264-267`; limit 20 | `/internal-api` re-exports `/api/players/search` | Database scan, count, full-row serialization, optional color fallback |
| `/players` | `PlayersDatabaseInteractions.client.js:956-1040`; 350 ms debounce; page size 50 | Same proxy | Same database work plus `/players` server-side filter metadata load |
| Squad builder | `ToolsInteractions.client.js:1266-1339`; 350 ms debounce; limit 220 | Same proxy | Large response, database work, repeated client filtering/normalization |
| Compare | `ComparePlayersTool.client.js:188-246`; 350 ms debounce; limit 20 | Same proxy | Remote search plus an unnecessary local pool scan when remote search is available |
| Legacy paths | `assets/js/views/squadBuilder.js`, `assets/js/app.js`, and legacy API client | Often external `/players`/`/players/search` paths | Duplicate behavior, longer debounce, no cancellation in some paths, inconsistent query parameters |

## Root causes and evidence

### 1. Unindexed runtime text expression is the primary database bottleneck

`app/api/players/search/route.js:426-440` builds a `SELECT * FROM player_stats` query and applies:

```sql
translate(lower(name), ...) LIKE '%query%'
```

This has a leading wildcard and applies functions to the column for every row. The existing `scripts/add_indexes.mjs:28-30` creates `idx_player_stats_name_trgm` on `name`, but the query operates on `translate(lower(name), ...)`, so that index is not guaranteed to support this expression. The report cannot claim the exact query plan without a production `EXPLAIN (ANALYZE, BUFFERS)`, but the query shape is sufficient to identify a likely sequential scan and is consistent with the measured 2–3 second negative searches.

**Impact:** every typed query can scan the player table; a no-match query receives no early result benefit.

### 2. Exact count doubles the expensive search work

At `route.js:461-476`, the route first executes `SELECT COUNT(*)` by replacing `SELECT *`, then executes the sorted paginated query at `:484-504`. These are sequential, not parallel. Autocomplete needs a bounded list, not an exact total.

**Impact:** every request pays for a count plus data retrieval, even when the UI only displays 20 or 220 rows.

### 3. Full-row selection and normalization are too expensive for search

The database path selects every column with `SELECT *` (`route.js:426`, `:492`) and normalizes all returned records (`:506`). Search results include card/media/color/stat fields that are unnecessary for compare lookup and excessive for text autocomplete.

**Impact:** more database I/O, JSON serialization, response transfer, and client parsing. The production 20-row responses are approximately 45 KB, which is large for autocomplete.

### 4. Color enrichment can add five serial network round trips

When returned rows lack color data, `enrichPayloadColors` (`route.js:195-223`) loops ranks 1 through 5 and awaits each `/api/players/by-ids` call sequentially (`:205-212`). The unresolved-ID calculation also calls `rows.find(...)` for each row (`:198-201`).

**Impact:** a search that otherwise completed can become dependent on several additional backend calls. This is especially harmful on cold or partially populated records.

### 5. The fallback proxy path has multiple sequential attempts

If the database path is unavailable, `route.js:563-678` can try specialized search, the standard players endpoint, and a fuzzy fallback for each backend candidate. Each `fetchJson` call has a four-second timeout (`:263-269`). Candidate requests run concurrently, but losing requests are not aborted after `Promise.any` returns.

**Impact:** degraded configurations can approach multi-second or timeout latency and consume backend/database capacity even after a winner exists.

### 6. Client debounce creates unavoidable perceived delay

The modern homepage waits 300 ms (`HomeDashboardInteractions.client.js:262-267`). `/players`, squad builder, and compare use 350 ms timers. This is not the root cause of multi-second responses, but it adds a fixed delay before server work begins.

**Impact:** the user experiences at least 300–350 ms even with an instant backend; slow production requests stack on top of that.

### 7. Squad builder requests and processes far too many rows

`ToolsInteractions.client.js:1266-1274` defaults to 220 results. The client then filters those results again across position, league, club, nation, skill, rating, auctionability, and text at `:2125-2143`.

**Impact:** larger server responses and more browser normalization/render work for a picker that normally displays a small visible result set.

### 8. Compare performs duplicate local and remote work

`ComparePlayersTool.client.js:174-186` scans the complete normalized player pool locally. When `searchPlayers` is supplied, the visible result path uses remote results (`:248-250`), yet the local scan still recomputes searchable strings. The remote response is filtered again at `:204-220`.

**Impact:** wasted main-thread work on every query and inconsistent result semantics between local and server filtering.

### 9. `/players` has cold-render overhead before search is usable

`app/players/page.js:50-57` awaits `fetchAllPlayerFilterMetadata` before rendering the client search. The database fast path in `src/lib/server/top-players.mjs:607-616` reads all metadata columns from `player_stats`. Its fallback can fetch up to 100 pages of 500 rows with concurrency six (`:541-549`, `:631-658`). The metadata cache is one hour (`:10`, `:546`, `:690-694`), but each process/instance can have its own cache.

**Impact:** first visits and cold instances spend time preparing filter options before the user can search.

### 10. Search results trigger unrelated price fan-out

`PlayersDatabaseInteractions.client.js:811-824` requests live price individually for tradable search results in batches of 25. Squad tooling similarly performs one `/api/player-price` request per target at `ToolsInteractions.client.js:1897-1903`.

**Impact:** search completion can be followed by many additional requests, increasing network contention and causing the page to continue looking busy.

### 11. Legacy and modern implementations are inconsistent

The repository contains multiple active-looking search implementations. Legacy squad search uses a 500 ms debounce and no request cancellation, and `assets/js/views/squadBuilder.js:399-442` sends duplicate/contradictory query keys. Legacy compare also lacks an abort/request-generation guard. The modern paths use the local proxy and `cache: 'no-store'`.

**Impact:** behavior differs by route/runtime, slow responses can overwrite newer legacy queries, and improvements made to one path do not benefit all users.

## Recommended production solution

### Priority 0: measure before changing behavior

Add structured timings and request IDs around:

- client input-to-request and request-to-render by surface;
- proxy total time;
- database connection acquisition, count, and data query time;
- fallback stage and backend URL;
- color enrichment time and number of calls;
- response bytes and result count.

For production database validation, capture `EXPLAIN (ANALYZE, BUFFERS)` for representative short, common, long, and no-match queries. Do not log raw user queries if privacy policy does not permit it; use query length or a hash.

### Priority 1: replace the hot query

Create a dedicated search projection/table or a stored normalized-name column, for example:

- normalized lowercase/diacritic-free name;
- `rank`, `player_id`, `id`, `name`, `ovr`, `position`;
- only card/media fields required by the selected UI profile.

Use a PostgreSQL GIN trigram index on the same expression/column used by the predicate, or a purpose-built prefix/full-text strategy. Keep all values parameterized. Verify with `EXPLAIN`, not only an index existence check.

### Priority 2: remove unnecessary work from autocomplete

- Do not run exact `COUNT(*)` for homepage, compare, or squad picker.
- Use `limit + 1` or cursor pagination to determine `has_more`.
- Replace `SELECT *` with explicit columns.
- Add a response profile such as `autocomplete`, `picker`, and `database`.
- Return no more than 20–40 rows for autocomplete/compare and a bounded smaller page for squad picking.

### Priority 3: eliminate serial enrichment and fan-out

- Include required color fields in the primary projection or batch them in one query.
- Do not make up to five serial rank requests from the search endpoint.
- Lazy-load live prices only for visible/selected players, or provide one batched price endpoint with short-lived caching.

### Priority 4: cache and simplify the service contract

- Add a short TTL cache for normalized query/filter combinations at the edge or server layer.
- Use one canonical search backend and response schema.
- Abort losing fallback candidates after the first valid response.
- Keep compatibility routes as thin aliases rather than probing multiple APIs in the hot path.

### Priority 5: reduce browser work

- Skip compare's local full-pool scan when remote search is active.
- Precompute a normalized `searchText` once per player instead of rebuilding and normalizing strings per keystroke.
- Let the server be authoritative for squad filters; retain only selected-player exclusion locally.
- Keep one active request per input and preserve request-generation guards in every runtime.
- Consider reducing debounce to approximately 150–250 ms only after backend latency is fixed; lowering it first would increase server load.

### Priority 6: isolate or retire duplicate legacy search paths

Route legacy squad/compare/search requests through the same canonical endpoint or clearly mark them as legacy-only. Remove duplicate query aliases and add cancellation/stale-response protection where legacy pages remain supported.

## Acceptance criteria for the eventual fix

These should be measured in production-like staging and then production:

| Metric | Target |
|---|---:|
| Search API p50 | under 150 ms |
| Search API p95 | under 300 ms |
| No-match search p95 | under 300 ms |
| Autocomplete response size | under 15 KB |
| Database search plan | indexed scan; no full table scan for normal queries |
| Extra color requests per search | 0 |
| Exact count queries per autocomplete request | 0 |
| Squad picker rows requested | no more than the visible/result cap |
| Stale responses replacing newer queries | 0 |

## Investigation limitations

The repository does not expose production database credentials or query plans in this workspace, so this investigation did not run `EXPLAIN ANALYZE` against the production database. The root cause is nevertheless high confidence from the deployed endpoint timings, the exact production request path, and the SQL/query structure. Query-plan capture and per-stage instrumentation are the first validation steps before implementing the remediation.

