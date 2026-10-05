import Link from 'next/link';
import styles from './ContextualRedeemBanner.module.css';

const DEFAULT_CONTENT = {
  default: {
    eyebrow: 'Free FC Mobile Rewards',
    title: 'Claim Free Player Packs & Gems',
    description: "Upgrade your squad faster with today's verified working redeem codes. Updated daily with official EA FC Mobile drops.",
    ctaText: 'View Active Codes'
  },
  compact: {
    eyebrow: 'Active Rewards',
    title: 'Need Coins or Packs to Build Your Squad?',
    description: "Redeem today's verified FC Mobile gift codes for free gems, player packs & coins.",
    ctaText: 'View Active Codes'
  }
};

export default function ContextualRedeemBanner({
  variant = 'default',
  source = 'general',
  title,
  description,
  ctaText,
  href = '/fc-mobile-redeem-codes',
  className = ''
}) {
  const isCompact = variant === 'compact' || variant === 'squad';
  const defaults = isCompact ? DEFAULT_CONTENT.compact : DEFAULT_CONTENT.default;

  const resolvedEyebrow = defaults.eyebrow;
  const resolvedTitle = title || defaults.title;
  const resolvedDescription = description || defaults.description;
  const resolvedCtaText = ctaText || defaults.ctaText;

  return (
    <section
      className={`${styles.banner} ${isCompact ? styles.compact : ''} ${className}`.trim()}
      role="region"
      aria-label="FC Mobile Redeem Codes Promotion"
      data-banner-source={source}
    >
      <div className={styles.accentBar} aria-hidden="true" />

      <div className={styles.mainContent}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>

        <div className={styles.textContent}>
          <div className={styles.eyebrow}>
            <span className={styles.pulseDot} aria-hidden="true" />
            <span>{resolvedEyebrow}</span>
          </div>
          <h2 className={styles.title}>{resolvedTitle}</h2>
          <p className={styles.description}>{resolvedDescription}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <Link
          href={href}
          className={styles.ctaButton}
          data-link=""
          data-nav-link=""
        >
          <span>{resolvedCtaText}</span>
          <svg
            className={styles.ctaArrow}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
