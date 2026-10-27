'use client';

import { useState, useEffect } from 'react';
import styles from './RedeemCodeHubPage.module.css';

function formatVerificationDate(dateValue, locale = 'en-US') {
  try {
    const d = dateValue ? new Date(dateValue) : new Date();
    const resolved = Number.isNaN(d.getTime()) ? new Date() : d;
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(resolved);
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
  updatedAt = '',
  className = ''
}) {
  const [dateText, setDateText] = useState(() => formatVerificationDate(updatedAt, locale));

  useEffect(() => {
    setDateText(formatVerificationDate(updatedAt, locale));
  }, [locale, updatedAt]);

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
