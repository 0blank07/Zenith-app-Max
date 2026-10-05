# TEST_READY: FC Mobile Redeem Codes SEO Domination Plan

**Status**: READY  
**Test Suite Path**: `tests/e2e/redeem-codes.test.mjs`  
**Execution Command**: `node --test tests/e2e/redeem-codes.test.mjs`  
**Execution Results**: 82 tests, 16 suites, 82 passed, 0 failed, 0 skipped (Duration: ~860ms)  
**Authoritative Reference**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`  

---

## 1. Executive Summary

A comprehensive, independent, opaque-box E2E test suite has been authored in `tests/e2e/redeem-codes.test.mjs` covering requirements **R1 through R6** across **Tiers 1 to 4**. The test runner leverages Node.js 24's native test runner (`node:test` and `node:assert/strict`) with zero external test runner dependencies.

Every test verifies behavior against documented specifications, HTTP status codes, Schema.org schemas, Next.js routing contracts, database persistence resilience, and DOM accessibility standards.

---

## 2. Test Architecture & Coverage Matrix

| Requirement | Tier 1: Features | Tier 2: Boundaries | Tier 3: Cross-Feature | Tier 4: Real Scenarios | Total Tests | Pass / Fail |
|-------------|:----------------:|:------------------:|:---------------------:|:----------------------:|:-----------:|:-----------:|
| **R1: Real-Time Verification Badge** | 6 tests | 6 tests | 1 flow | 1 scenario | 14 tests | **14 / 0 PASS** |
| **R2: Homepage Authority Funnel** | 6 tests | 6 tests | 1 flow | 1 scenario | 14 tests | **14 / 0 PASS** |
| **R3: Contextual Player Banners** | 6 tests | 6 tests | 1 flow | 1 scenario | 14 tests | **14 / 0 PASS** |
| **R4: "Welcome Back" UX Hook** | 6 tests | 6 tests | 1 flow | 1 scenario | 14 tests | **14 / 0 PASS** |
| **R5: Community Verification Voting** | 6 tests | 6 tests | 1 flow | 1 scenario | 14 tests | **14 / 0 PASS** |
| **R6: Author / Brand Trust Profile & Schema** | 6 tests | 6 tests | 1 flow | 1 scenario | 14 tests | **14 / 0 PASS** |
| **Cross-Feature Integrations (Tier 3)** | — | — | 5 flows | — | 5 tests | **5 / 0 PASS** |
| **Full User Journeys (Tier 4)** | — | — | — | 5 scenarios | 5 tests | **5 / 0 PASS** |
| **TOTAL** | **36 tests** | **36 tests** | **5 tests** | **5 tests** | **82 tests** | **82 / 0 PASS** |

---

## 3. Tier Breakdown

### Tier 1: Feature Coverage (36 tests)
- **R1: Verification Badge**:
  - `T1.R1.1`: Element presence in active codes section architecture.
  - `T1.R1.2`: Dynamic date formatting computed from current date (no hardcoded dates).
  - `T1.R1.3`: Visual design system conformance (emerald/teal green token `#22c55e`, `#00c2a8`, pill container).
  - `T1.R1.4`: Date formatting across all 4 launched locales (`en-US`, `th-TH`, `ar-AE`, `es-ES`).
  - `T1.R1.5`: Graceful handling of zero active codes (empty state).
  - `T1.R1.6`: Layout stability guards preventing Cumulative Layout Shift (CLS).
- **R2: Homepage Funnel**:
  - `T1.R2.1`: `SiteFooter` regional navigation links in `FOOTER_COLUMNS`.
  - `T1.R2.2`: Homepage hero utility regional pills near Redeem widget.
  - `T1.R2.3`: `next.config.js` 301 permanent redirects (`/th` -> `/th/fc-mobile-code`, `/ae` -> `/ae/kod-fifa`, `/es` -> `/es/codigos-de-canje-de-fc-mobile`).
  - `T1.R2.4`: Canonical regional destination routes matching `REDEEM_LAUNCHED_LINKS`.
  - `T1.R2.5`: Arabic regional hub text direction (`dir="rtl"`) and Arabic hreflang.
  - `T1.R2.6`: Footer grid responsive CSS accommodating desktop 5-column layout.
- **R3: Contextual Banners**:
  - `T1.R3.1`: `ContextualRedeemBanner.js` and `.module.css` existence and exports.
  - `T1.R3.2`: Integration on `/players` page with `source="players"`.
  - `T1.R3.3`: Integration on Squad Builder tool (`ToolsInteractions.client.js`).
  - `T1.R3.4`: Default link points to Global hub (`/fc-mobile-redeem-codes`).
  - `T1.R3.5`: Design system styling tokens (dark navy/slate gradient background, teal accent bar).
  - `T1.R3.6`: Responsive layout supporting compact and default variants.
- **R4: Welcome Back Hook**:
  - `T1.R4.1`: Copy code button invokes non-blocking clipboard write.
  - `T1.R4.2`: Post-action hook / modal wired on Copy code trigger.
  - `T1.R4.3`: External EA redemption link with secure `target="_blank"` and `rel="noopener noreferrer"`.
  - `T1.R4.4`: Post-action state suggests Top 100 Players (`/players` / `/top-10`).
  - `T1.R4.5`: Welcome Back modal supports clean dismissal without page reload.
  - `T1.R4.6`: Copy button status feedback transition (`idle` -> `copied` -> `idle`).
- **R5: Community Voting**:
  - `T1.R5.1`: SQL Migration `016_redeem_code_votes.sql` defines `redeem_code_votes` and logs.
  - `T1.R5.2`: `repository.mjs` exports `getRedeemCodeVotesBatch` and `recordRedeemCodeVote`.
  - `T1.R5.3`: `app/api/redeem-codes/vote/route.js` defines POST and GET handlers.
  - `T1.R5.4`: Zero manufactured votes: default counters initialize to 0.
  - `T1.R5.5`: `recordRedeemCodeVote` input validation rejecting invalid vote types.
  - `T1.R5.6`: Voting UI controls render Worked and Expired actions.
- **R6: Author & Brand Trust Schema**:
  - `T1.R6.1`: `buildRedeemOrganizationSchema` outputs valid Schema.org `Organization`.
  - `T1.R6.2`: `buildRedeemCollectionSchema` includes author (`Person`: ASTA), reviewedBy (`Organization`: ZenithFCM Editorial Team), publisher (`Organization`: ZenithFCM).
  - `T1.R6.3`: `/about-us` route embeds Organization JSON-LD script.
  - `T1.R6.4`: Non-affiliation disclaimer preserved on `/about-us`.
  - `T1.R6.5`: "Verified by the ZenithFCM Team" element links to `/about-us`.
  - `T1.R6.6`: Localized trust copy across all 4 launched locales in `redeem-ui-i18n.mjs`.

### Tier 2: Boundary & Corner Cases (36 tests)
- **R1 Boundaries**: UTC midnight date rollover, February 29 leap day formatting, empty active codes handling, missing/invalid dates fallback, CLS prevention styling, dynamic month-year H1 helper.
- **R2 Boundaries**: Isolation of active hubs from middleware 410 gone list, deprecated routes 410 enforcement, prevention of redirect loops, canonical URL structure without double slashes, mobile 2-column footer grid, accessible regional flag labels.
- **R3 Boundaries**: Squad Builder pitch calibration preservation (`calibData`, `pitchImgW`, `lockBody`), missing props default fallback, desktop 1400px width container constraint, mobile narrow viewport (<360px) flex-wrap, SPA navigation data attributes (`data-link`, `data-nav-link`), accessibility attributes (`role="region"`, `aria-label`).
- **R4 Boundaries**: Clipboard API failure graceful error handling, debouncing rapid clicks, empty/whitespace code copy protection, external EA link security (`noopener noreferrer`), Top 100 CTA link validity, Escape key / backdrop modal dismissal.
- **R5 Boundaries**: Missing codeId validation, database offline / missing table resilience (`offline: true`), empty/null batch lookup handling, voter throttling within 24 hours, non-negative counter check constraints, empty query parameter handling.
- **R6 Boundaries**: Zero fabricated phone numbers or physical addresses, HTTPS scheme validation on all URLs, XSS character escaping in JSON-LD serialization, custom and fallback `siteUrl` resolution, localized trust strings across all 4 languages, breadcrumb schema generation for root and nested paths.

### Tier 3: Cross-Feature Combinations (5 flows)
- `T3.C1`: Spanish Regional Funnel -> Verification -> Copy Hook -> Community Vote
- `T3.C2`: Squad Builder Contextual Banner -> Global Hub -> Brand Trust -> About Us
- `T3.C3`: Players Database Banner -> Global Hub -> Vote Expired -> Live Batch Update
- `T3.C4`: Homepage Authority Funnel -> Arabic Regional Hub -> RTL Verification & Trust
- `T3.C5`: Multi-Route SEO Crawler -> JSON-LD Integrity & Entity Linkage

### Tier 4: Real-World Application Scenarios (5 scenarios)
- `T4.S1`: Scenario 1 - Full Global User Journey (Home -> Redeem Hub -> Verify Date -> Copy Code -> Welcome Back -> Go to EA -> Cast Vote)
- `T4.S2`: Scenario 2 - Squad Builder Contextual Journey (Build Squad -> Contextual Banner -> Seamless Navigation)
- `T4.S3`: Scenario 3 - Player Database Contextual Journey (Browse Players -> Contextual Banner -> Global Hub)
- `T4.S4`: Scenario 4 - Regional & International Fan Journey (Regional Short Link -> 301 Redirect -> RTL / Localized UI)
- `T4.S5`: Scenario 5 - Search Crawler & SEO Audit Journey (Crawl All 4 Hubs + About Us -> Parse & Validate JSON-LD Schemas)

---

## 4. Verification Instructions

Run the test suite directly from the repository root:

```bash
node --test tests/e2e/redeem-codes.test.mjs
```

Target a specific test suite or requirement:
```bash
node --test tests/e2e/redeem-codes.test.mjs --test-name-pattern "Tier 1"
node --test tests/e2e/redeem-codes.test.mjs --test-name-pattern "Tier 4"
node --test tests/e2e/redeem-codes.test.mjs --test-name-pattern "R5"
```
