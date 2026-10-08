'use client';

import React, { useState, useEffect } from 'react';
import styles from './AuthToast.module.css';

const ERROR_MESSAGES = {
  invalid_state: 'Authentication verification failed or expired. Please try signing in again.',
  state_expired: 'Sign-in session expired. Please try signing in again.',
  provider_rejected: 'Sign-in was cancelled or rejected by the provider.',
  provider_unavailable: 'The authentication service is temporarily unavailable. Please try again shortly.',
  provider_already_linked: 'This social account is already linked to another Zenith user.',
  account_deactivated: 'Your Zenith account has been deactivated. Please contact support.',
  login_failed: 'Sign-in could not be completed. Please try again.',
  unauthenticated: 'You must be signed in to perform this action.',
  user_mismatch: 'Account verification mismatch. Please sign in again.',
  missing_code: 'Missing authorization code from provider. Please try again.',
  server_error: 'A temporary server error occurred during sign-in. Please try again.'
};

export default function AuthToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      const authParam = params.get('auth');
      const authSuccess = params.get('auth_success');
      const authCanceled = params.get('auth_canceled');
      const authError = params.get('auth_error');

      if (!authParam && !authSuccess && !authCanceled && !authError) {
        return;
      }

      let toastConfig = null;

      if (authParam === 'welcome') {
        toastConfig = {
          title: 'Welcome to Zenith!',
          message: 'Your Zenith account is ready. Explore the database and build your dream squad.',
          type: 'success',
          icon: '🎉'
        };
      } else if (authParam === 'linked' || authSuccess === 'provider_linked') {
        toastConfig = {
          title: 'Account Connected',
          message: 'Your social sign-in method has been successfully linked to Zenith.',
          type: 'success',
          icon: '✅'
        };
      } else if (authSuccess === 'already_linked') {
        toastConfig = {
          title: 'Already Connected',
          message: 'This provider account is already connected to your Zenith profile.',
          type: 'info',
          icon: 'ℹ️'
        };
      } else if (authCanceled === '1' || authCanceled === 'true') {
        toastConfig = {
          title: 'Sign-in Cancelled',
          message: 'Sign-in was cancelled. You can continue browsing freely as a guest.',
          type: 'warning',
          icon: 'ℹ️'
        };
      } else if (authError) {
        const errorKey = String(authError).toLowerCase();
        const friendlyMessage = ERROR_MESSAGES[errorKey] || decodeURIComponent(authError);
        toastConfig = {
          title: 'Authentication Notice',
          message: friendlyMessage,
          type: 'error',
          icon: '⚠️'
        };
      }

      if (toastConfig) {
        setToast(toastConfig);

        // Sanitize URL cleanly to prevent replay upon page refresh
        params.delete('auth');
        params.delete('auth_success');
        params.delete('auth_canceled');
        params.delete('auth_error');

        const remainingQuery = params.toString();
        const cleanUrl =
          url.pathname + (remainingQuery ? `?${remainingQuery}` : '') + url.hash;

        window.history.replaceState({}, document.title, cleanUrl);

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
          setToast(null);
        }, 5000);

        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.warn('[Zenith Auth] Error parsing auth URL parameters:', err);
    }
  }, []);

  if (!toast) return null;

  const styleClassMap = {
    success: styles.toastSuccess,
    error: styles.toastError,
    warning: styles.toastWarning,
    info: styles.toastInfo
  };

  const toastCardClass = `${styles.toastCard} ${styleClassMap[toast.type] || styles.toastInfo}`;

  return (
    <div
      className={styles.toastContainer}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className={toastCardClass}>
        <div className={styles.toastIcon} aria-hidden="true">
          {toast.icon}
        </div>
        <div className={styles.toastBody}>
          <h4 className={styles.toastTitle}>{toast.title}</h4>
          <p className={styles.toastMessage}>{toast.message}</p>
        </div>
        <button
          type="button"
          className={styles.toastCloseBtn}
          onClick={() => setToast(null)}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
