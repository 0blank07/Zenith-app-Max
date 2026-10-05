'use client';

import { useState, useEffect } from 'react';
import styles from './RedeemCodeHubPage.module.css';

function formatTodayDate(locale = 'en-US') {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());
  }
}

export default function RedeemVerificationBadge({
  locale = 'en-US',
  label = 'Last Verified Working',
  className = ''
}) {
  const [dateText, setDateText] = useState(() => formatTodayDate(locale));

  useEffect(() => {
    setDateText(formatTodayDate(locale));
  }, [locale]);

  return (
    <div
      className={`${styles.verificationBadge} ${className}`.trim()}
      aria-label={`${label}: ${dateText}`}
    >
      <span className={styles.verificationCheck} aria-hidden="true">
        ✅
      </span>
      <span className={styles.verificationContent}>
        <span className={styles.verificationLabel}>{label}:</span>{' '}
        <span className={styles.verificationDate} suppressHydrationWarning>
          {dateText}
        </span>
      </span>
    </div>
  );
}
