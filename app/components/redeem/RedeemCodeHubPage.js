import { Fragment } from 'react';
import Link from 'next/link';
import CopyCodeButton from './CopyCodeButton.client';
import RedeemVerificationBadge from './RedeemVerificationBadge.client';
import RedeemVoteButtons from './RedeemVoteButtons.client';
import RedeemWelcomeBackModal from './RedeemWelcomeBackModal.client';
import AdsenseAd from '../AdsenseAd';
import { getRedeemUiTranslations } from '../../../src/lib/server/redeem-codes/redeem-ui-i18n.mjs';
import styles from './RedeemCodeHubPage.module.css';

const DEFAULT_COPY = Object.freeze({
  breadcrumbLabel: 'Breadcrumb',
  eyebrow: 'Redeem code hub',
  lastUpdatedLabel: 'Last updated:',
  selectRegion: 'Select Region',
  searchLabel: 'Search codes',
  searchPlaceholder: 'Search for active codes...',
  filterStatus: 'Filter by status',
  filterAll: 'All Codes',
  filterActive: 'Active',
  filterExpired: 'Expired',
  applyFilters: 'Apply Filters',
  latestActiveCodes: 'Latest Active Codes',
  activeCountSuffix: 'active',
  activeEmpty: 'No active redeem code currently.',
  latestTitle: 'Latest Codes',
  latestTodayTitle: 'Published Today',
  latestCountSuffix: 'listed',
  latestEmpty: 'No matching codes found.',
  expiredTitle: 'Expired Codes',
  expiredCountSuffix: 'archived',
  expiredEmpty: 'No expired codes archived.',
  faqTitle: 'Frequently Asked Questions',
  badgeActive: 'Active',
  badgeExpired: 'Expired',
  publishedLabel: 'Published',
  expiresLabel: 'Expires',
  copyButton: 'Copy Code',
  copiedButton: 'Copied!',
  voteWorked: 'Worked',
  voteExpired: 'Expired',
  verifiedByTeam: 'Verified by the ZenithFCM Team',
  lastVerifiedWorking: 'Last Verified Working',
  welcomeBackTitle: 'Code Copied! Level Up Your Squad',
  welcomeBackCta: 'Explore Top 100 Players',
  welcomeBackBrowseAll: 'Browse All Players',
  welcomeBackDismiss: 'Continue Browsing Codes',
  authorName: 'ASTA',
  authorRole: 'Lead FC Mobile Analyst',
  writtenByLabel: 'Written by',
  reviewedByLabel: 'Reviewed by',
  editorialTeamLabel: 'ZenithFCM Editorial Team',
  editorialPolicyLabel: 'Editorial Standards & Verification Policy',
  methodologyBadge: 'Hands-On Verified',
  methodologyTitle: 'How We Test & Verify FC Mobile Codes',
  methodologyIntro: 'Every promo code published on Zenith undergoes real-device in-game testing before being marked active:',
  methodologyPoints: [
    {
      title: 'Tested on Real Game Accounts',
      desc: 'Our analysts test each code directly in EA SPORTS FC Mobile on iOS and Android devices through the official EA redemption portal (redeem.fcm.ea.com).'
    },
    {
      title: '24/7 EA Stream & Community Tracking',
      desc: 'We monitor official EA Sports YouTube & Twitch broadcasts (such as FC Pro Live), Discord announcements, and community drops in real time.'
    },
    {
      title: 'Community-Validated Expiry & Fast Archival',
      desc: 'When player votes or quota limits indicate a code has expired, our editorial desk re-checks and moves it to the archive immediately. Zero fake generator clutter.'
    }
  ]
});

function formatDate(value, locale = 'en-US') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium'
  }).format(date);
}

function renderCodeCard(entry, locale, copy) {
  return (
    <article key={entry.id} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={`${styles.status} ${entry.status === 'active' ? styles.statusActive : styles.statusExpired}`}>
          {entry.status === 'active' ? copy.badgeActive : copy.badgeExpired}
        </span>
        <span className={styles.scope}>{entry.scopeLabel}</span>
      </div>

      <h3 className={styles.cardTitle}>{entry.title}</h3>
      <div data-welcome-trigger="copy" className={styles.codeButtonWrapper}>
        <CopyCodeButton 
          codeValue={entry.codeValue} 
          className={styles.codeButton} 
          copiedLabel={copy.copiedButton} 
          idleLabel={entry.codeValue} 
          aria-label={copy.copyButton}
        />
      </div>

      {entry.status === 'active' && (
        <a 
          href="https://redeem.fcm.ea.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.redeemLink}
          data-welcome-trigger="ea"
        >
          {copy.redeemAtEa || 'Redeem at EA Site'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      )}

      <div className={styles.votingRow}>
        <RedeemVoteButtons
          codeId={entry.id}
          initialWorked={entry.workedCount || 0}
          initialExpired={entry.expiredCount || 0}
          workedLabel={copy.voteWorked}
          expiredLabel={copy.voteExpired}
        />
      </div>

      <div className={styles.cardFooter}>
        <span>
          <strong>{copy.publishedLabel}:</strong> {formatDate(entry.publishedAt, locale)}
        </span>
        <span>
          <strong>{copy.expiresLabel}:</strong> {formatDate(entry.expiresAt, locale)}
        </span>
      </div>
    </article>
  );
}

export default function RedeemCodeHubPage({ pageData }) {
  const route = pageData?.route || {};
  const section = pageData?.section || {};
  const activeCodes = Array.isArray(pageData?.activeCodes) ? pageData.activeCodes : [];
  const latestCodes = Array.isArray(pageData?.latestCodes) ? pageData.latestCodes : [];
  const expiredCodes = Array.isArray(pageData?.expiredCodes) ? pageData.expiredCodes : [];
  const availability = pageData?.availability || {};
  const links = Array.isArray(pageData?.links) ? pageData.links : [];
  const faqEntries = Array.isArray(pageData?.faq) ? pageData.faq : [];
  const updatedAt = pageData?.updatedAt || '';
  const locale = route.locale || 'en-US';
  const isRtl = route.textDirection === 'rtl';
  const translations = getRedeemUiTranslations(route.hreflang || 'en');
  const copy = {
    ...DEFAULT_COPY,
    ...translations,
    ...(route.copy || {})
  };

  return (
    <div className={`${styles.page} ${isRtl ? styles.rtl : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <nav className={styles.breadcrumbs} aria-label={copy.breadcrumbLabel}>
        {(route.breadcrumb || []).map((entry, index) => (
          <span key={`${entry.path}-${index}`}>
            {index > 0 ? ' / ' : ''}
            <Link href={entry.path}>{entry.name}</Link>
          </span>
        ))}
      </nav>

      <header className={styles.header}>
        <span className={styles.eyebrow}>{copy.eyebrow}</span>
        <h1 className={styles.title}>{route.h1}</h1>
        <p className={styles.description}>{route.intro}</p>
        {route.globalCodeNote ? (
          <p className={styles.description} style={{ marginTop: '8px', opacity: 0.8 }}>
            {route.globalCodeNote}
          </p>
        ) : null}
        <div className={styles.authorByline}>
          <div className={styles.authorAvatar} aria-hidden="true">
            {copy.authorName ? copy.authorName.slice(0, 2).toUpperCase() : 'AS'}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.bylinePrefix}>{copy.writtenByLabel}</span>
            <strong className={styles.authorName}>{copy.authorName}</strong>
            <span className={styles.authorRole}>{copy.authorRole}</span>
          </div>
        </div>
        <div className={styles.updatedAt}>
          {copy.lastUpdatedLabel} {formatDate(updatedAt, locale)}
        </div>
      </header>

      <div className={styles.dashboard}>
        {links.length > 0 && (
          <section className={styles.linkPanel}>
            <h2 className={styles.linkPanelTitle}>{copy.selectRegion}</h2>
            <div className={styles.links}>
              {links.map((entry) => (
                <Link key={entry.href} href={entry.href} className={route.path === entry.href ? styles.activeLink : ''}>
                  {entry.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <form className={styles.filters} action={route.path} method="get">
          <label className={styles.field}>
            <span className={styles.label}>{copy.searchLabel}</span>
            <input
              className={styles.input}
              type="search"
              name="q"
              defaultValue={pageData?.search || ''}
              placeholder={copy.searchPlaceholder}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{copy.filterStatus}</span>
            <select className={styles.select} name="section" defaultValue={section.value || 'all'}>
              <option value="all">{copy.filterAll}</option>
              <option value="active">{copy.filterActive}</option>
              <option value="expired">{copy.filterExpired}</option>
            </select>
          </label>

          <button className={styles.button} type="submit">
            {copy.applyFilters}
          </button>
        </form>
      </div>

      {!availability.isConfigured ? (
        <section className={styles.availabilityCard}>
          <h2 className={styles.sectionTitle}>{availability.title}</h2>
          <p className={styles.empty}>{availability.description}</p>
        </section>
      ) : (
        <>
          {section.showActive && (
            <>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{copy.latestActiveCodes}</h2>
                  <span className={styles.sectionMeta}>{`${activeCodes.length} ${copy.activeCountSuffix}`}</span>
                </div>
                <div className={styles.verificationRow}>
                  <RedeemVerificationBadge locale={locale} label={copy.lastVerifiedWorking} />
                  <Link href="/about-us" className={styles.trustBadge}>
                    <svg
                      className={styles.trustIcon}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <span>{copy.verifiedByTeam}</span>
                  </Link>
                </div>

                {activeCodes.length ? (
                  <div className={styles.cards}>{activeCodes.map((entry) => renderCodeCard(entry, locale, copy))}</div>
                ) : (
                  <p className={styles.empty}>{copy.activeEmpty}</p>
                )}
              </section>
              <div style={{ minHeight: '280px', width: '100%', margin: '20px 0 40px', contain: 'layout style', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AdsenseAd slot="3323774708" style={{ margin: 0, minHeight: '280px', width: '100%' }} />
              </div>
            </>
          )}

          {copy.howToSteps && (
            <section className={styles.howToSection}>
              <h2 className={styles.howToTitle}>{copy.howToTitle}</h2>
              <p className={styles.howToIntro}>{copy.howToIntro}</p>
              
              <div className={styles.howToGrid}>
                {copy.howToSteps.map((step, idx) => (
                  <div key={idx} className={styles.howToStep}>
                    <div className={styles.howToStepNumber}>{idx + 1}</div>
                    <div className={styles.howToStepContent}>
                      <h3 className={styles.howToStepTitle}>{step.title.replace(/^\d+\.\s*/, '')}</h3>
                      <p className={styles.howToStepText}>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.howToFooter}>
                <span>{copy.howToFooter}</span>
                <a href="https://redeem.fcm.ea.com/" target="_blank" rel="noopener noreferrer" className={styles.howToButton}>
                  {copy.howToButton}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            </section>
          )}

          {Array.isArray(copy.methodologyPoints) && copy.methodologyPoints.length > 0 && (
            <div className={styles.methodologyCard}>
              <div className={styles.methodologyHeader}>
                <div className={styles.methodologyTitleGroup}>
                  <span className={styles.methodologyBadge}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {copy.methodologyBadge}
                  </span>
                  <h3 className={styles.methodologyTitle}>{copy.methodologyTitle}</h3>
                </div>
                <Link href="/about-us" className={styles.methodologyPolicyLink}>
                  {copy.editorialPolicyLabel} →
                </Link>
              </div>
              <p className={styles.methodologyIntro}>{copy.methodologyIntro}</p>
              <div className={styles.methodologyGrid}>
                {copy.methodologyPoints.map((point, pIdx) => (
                  <div key={pIdx} className={styles.methodologyPoint}>
                    <div className={styles.methodologyPointNumber}>{pIdx + 1}</div>
                    <div className={styles.methodologyPointContent}>
                      <h4 className={styles.methodologyPointTitle}>{point.title}</h4>
                      <p className={styles.methodologyPointDesc}>{point.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.showExpired && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{copy.expiredTitle}</h2>
                <span className={styles.sectionMeta}>{`${expiredCodes.length} ${copy.expiredCountSuffix}`}</span>
              </div>
              {expiredCodes.length ? (
                <div className={styles.cards}>
                  {expiredCodes.map((entry, index) => (
                    <Fragment key={entry.id}>
                      {renderCodeCard(entry, locale, copy)}
                      {(index === 2 || index === 8) && (
                        <div style={{ gridColumn: '1 / -1', minHeight: '280px', width: '100%', margin: '16px 0', contain: 'layout style', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <AdsenseAd slot="2010693034" style={{ margin: 0, minHeight: '280px', width: '100%' }} />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>{copy.expiredEmpty}</p>
              )}
            </section>
          )}
        </>
      )}

      {Array.isArray(copy.guideSections) && copy.guideSections.length > 0 && (
        <section className={styles.guideContainer} aria-label="Guía y Consejos de Códigos">
          {copy.guideSections.map((sec, idx) => (
            <article key={idx} className={styles.guideCard}>
              {sec.title && <h2 className={styles.guideTitle}>{sec.title}</h2>}
              {sec.intro && <p className={styles.guideIntro}>{sec.intro}</p>}
              {Array.isArray(sec.paragraphs) && sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className={styles.guideText}>{p}</p>
              ))}
              {Array.isArray(sec.bullets) && (
                <ul className={styles.guideList}>
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx} className={styles.guideListItem}>{b}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}

      {faqEntries.length > 0 && (
        <section className={styles.faq}>
          <h2 className={styles.faqTitle}>{copy.faqTitle}</h2>
          <div className={styles.faqList}>
            {faqEntries.map((entry) => (
              <details key={entry.question}>
                <summary>
                  <h3 className={styles.faqQuestion}>{entry.question}</h3>
                </summary>
                <p>{entry.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <RedeemWelcomeBackModal
        title={copy.welcomeBackTitle}
        ctaLabel={copy.welcomeBackCta}
        browseAllLabel={copy.welcomeBackBrowseAll}
        dismissLabel={copy.welcomeBackDismiss}
      />
    </div>
  );
}
