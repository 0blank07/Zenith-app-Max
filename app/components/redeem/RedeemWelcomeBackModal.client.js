'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './RedeemCodeHubPage.module.css';

export default function RedeemWelcomeBackModal({
  title = 'Code Copied! Level Up Your Squad',
  description = 'While your FC Mobile in-game pack is on its way, scout the highest-rated meta cards with our Top 100 player rankings and squad builder.',
  ctaLabel = 'Explore Top 10 Players',
  browseAllLabel = 'Redeem at EA Site',
  dismissLabel = 'Continue Browsing Codes'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [actionSource, setActionSource] = useState('copy'); // 'copy' | 'ea'

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      if (!target || !(target instanceof Element)) return;

      const triggerEl = target.closest('button, a, [data-welcome-trigger]');
      if (!triggerEl) return;

      const isCopyTrigger =
        triggerEl.dataset?.status !== undefined ||
        triggerEl.dataset?.welcomeTrigger === 'copy' ||
        triggerEl.classList?.contains(styles.codeButton) ||
        Boolean(triggerEl.closest(`.${styles.codeButton}`)) ||
        Boolean(triggerEl.closest('[data-welcome-trigger="copy"]'));

      const isEaTrigger =
        triggerEl.dataset?.welcomeTrigger === 'ea' ||
        triggerEl.getAttribute('href')?.includes('redeem.fcm.ea.com') ||
        Boolean(triggerEl.closest('a[href*="redeem.fcm.ea.com"]')) ||
        Boolean(triggerEl.closest('[data-welcome-trigger="ea"]'));

      if (isCopyTrigger || isEaTrigger) {
        // Crucial: DO NOT prevent default or stop propagation!
        // Copy to clipboard or external link navigation must proceed uninterrupted.
        setActionSource(isEaTrigger ? 'ea' : 'copy');
        setIsOpen(true);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-back-title"
    >
      <div className={styles.modalCard}>
        <button
          type="button"
          className={styles.modalCloseButton}
          onClick={handleDismiss}
          aria-label={dismissLabel || 'Close'}
        >
          ✕
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.modalIcon} aria-hidden="true">
            🏆
          </div>
          <span className={styles.modalEyebrow}>
            {actionSource === 'ea' ? 'EA Redemption Underway' : 'Code Copied to Clipboard'}
          </span>
          <h2 id="welcome-back-title" className={styles.modalTitle}>
            {title}
          </h2>
          <p className={styles.modalDescription}>{description}</p>
        </div>

        <div className={styles.modalActions}>
          <Link
            href="/top-10/st"
            className={styles.modalCtaPrimary}
            onClick={handleDismiss}
          >
            {ctaLabel} →
          </Link>
          <a
            href="https://redeem.fcm.ea.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.modalCtaSecondary}
            onClick={handleDismiss}
          >
            {browseAllLabel}
          </a>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.modalDismissText}
            onClick={handleDismiss}
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
