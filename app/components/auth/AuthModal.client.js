'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext.client';
import { GoogleIcon, DiscordIcon, FacebookIcon } from './ProviderIcons';
import styles from './AuthModal.module.css';

export default function AuthModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  returnTo: propReturnTo,
  promptText: propPromptText
}) {
  const {
    authModalOpen,
    closeAuthModal,
    authModalOptions,
    login
  } = useAuth();

  const [loadingProvider, setLoadingProvider] = useState(null);
  const cardRef = useRef(null);

  const isOpen = propIsOpen !== undefined ? propIsOpen : authModalOpen;
  const handleClose = propOnClose || closeAuthModal;
  const returnTo = propReturnTo || authModalOptions?.returnTo || '/';
  const promptText = propPromptText || authModalOptions?.promptText;

  // Reset loading state when closed
  useEffect(() => {
    if (!isOpen) {
      setLoadingProvider(null);
    }
  }, [isOpen]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleClose]);

  const handleProviderClick = useCallback((provider) => {
    setLoadingProvider(provider);
    login(provider, returnTo);
  }, [login, returnTo]);

  const handleBackdropClick = useCallback((e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={styles.modalCard}
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zenith-auth-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close authentication dialog"
        >
          ✕
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.brandBadge}>
            ⚡ Zenith Account
          </div>
          <h2 id="zenith-auth-modal-title" className={styles.modalTitle}>
            Sign in to Zenith
          </h2>
          <p className={styles.modalSubtitle}>
            {promptText || 'Connect with your preferred account to sync squads, save watchlists, and manage your profile.'}
          </p>
        </div>

        <div className={styles.providersStack}>
          {/* Google Button */}
          <button
            type="button"
            className={`${styles.providerBtn} ${styles.btnGoogle}`}
            onClick={() => handleProviderClick('google')}
            disabled={Boolean(loadingProvider)}
            aria-label="Continue with Google"
          >
            <span className={styles.btnIcon}>
              <GoogleIcon size={20} />
            </span>
            <span className={styles.btnLabel}>
              {loadingProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
            </span>
            {loadingProvider === 'google' && <span className={styles.spinner} />}
          </button>

          {/* Discord Button */}
          <button
            type="button"
            className={`${styles.providerBtn} ${styles.btnDiscord}`}
            onClick={() => handleProviderClick('discord')}
            disabled={Boolean(loadingProvider)}
            aria-label="Continue with Discord"
          >
            <span className={styles.btnIcon}>
              <DiscordIcon size={20} />
            </span>
            <span className={styles.btnLabel}>
              {loadingProvider === 'discord' ? 'Connecting to Discord...' : 'Continue with Discord'}
            </span>
            {loadingProvider === 'discord' && <span className={styles.spinner} />}
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            className={`${styles.providerBtn} ${styles.btnFacebook}`}
            onClick={() => handleProviderClick('facebook')}
            disabled={Boolean(loadingProvider)}
            aria-label="Continue with Facebook"
          >
            <span className={styles.btnIcon}>
              <FacebookIcon size={20} />
            </span>
            <span className={styles.btnLabel}>
              {loadingProvider === 'facebook' ? 'Connecting to Facebook...' : 'Continue with Facebook'}
            </span>
            {loadingProvider === 'facebook' && <span className={styles.spinner} />}
          </button>
        </div>

        <div className={styles.trustFooter}>
          <span className={styles.trustIcon} aria-hidden="true">🔒</span>
          <span>No password needed. We only request your public profile and email.</span>
        </div>

        <div className={styles.guestActionWrapper}>
          <button
            type="button"
            className={styles.guestDismissBtn}
            onClick={handleClose}
          >
            Keep browsing as guest
          </button>
        </div>
      </div>
    </div>
  );
}
