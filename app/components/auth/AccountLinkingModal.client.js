'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from './AuthContext.client';
import { GoogleIcon, DiscordIcon, FacebookIcon } from './ProviderIcons';
import styles from './AccountLinkingModal.module.css';

const ALL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: <GoogleIcon size={20} />,
    boxClass: styles.iconBoxGoogle
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: <DiscordIcon size={20} />,
    boxClass: styles.iconBoxDiscord
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <FacebookIcon size={20} />,
    boxClass: styles.iconBoxFacebook
  }
];

export default function AccountLinkingModal({
  isOpen: propIsOpen,
  onClose: propOnClose
}) {
  const {
    linkingModalOpen,
    closeLinkingModal,
    user,
    unlink
  } = useAuth();

  const [busyProvider, setBusyProvider] = useState(null);
  const [confirmProvider, setConfirmProvider] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const cardRef = useRef(null);

  const isOpen = propIsOpen !== undefined ? propIsOpen : linkingModalOpen;
  const handleClose = propOnClose || closeLinkingModal;

  // Reset local states on close
  useEffect(() => {
    if (!isOpen) {
      setBusyProvider(null);
      setConfirmProvider(null);
      setFeedback(null);
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

  const handleBackdropClick = useCallback((e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen || !user) return null;

  const userProviders = Array.isArray(user.providers)
    ? user.providers.map((p) => String(p).toLowerCase())
    : [];

  const linkedAccounts = Array.isArray(user.linkedAccounts)
    ? user.linkedAccounts
    : [];

  const distinctConnectedCount = userProviders.length;
  const isSoleProvider = distinctConnectedCount <= 1;

  const handleConnect = (providerId) => {
    if (typeof window === 'undefined') return;
    setBusyProvider(providerId);
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/${providerId}/login?action=link&returnTo=${encodeURIComponent(returnTo)}`;
  };

  const handleDisconnect = async (providerId) => {
    if (isSoleProvider) return;
    setBusyProvider(providerId);
    setFeedback(null);

    const result = await unlink(providerId);
    setBusyProvider(null);
    setConfirmProvider(null);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} account disconnected successfully.`
      });
    } else {
      setFeedback({
        type: 'error',
        message: result.error || 'Failed to disconnect account.'
      });
    }
  };

  // Initials for avatar fallback
  const displayName = user.displayName || user.name || 'Zenith User';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'Z';

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
        aria-labelledby="zenith-linking-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close account management dialog"
        >
          ✕
        </button>

        <div className={styles.modalHeader}>
          <h2 id="zenith-linking-modal-title" className={styles.modalTitle}>
            Manage Connected Accounts
          </h2>
          <p className={styles.modalSubtitle}>
            Connect multiple social accounts so you can sign in to Zenith using any of them.
          </p>
        </div>

        {/* User Summary Card */}
        <div className={styles.userProfileCard}>
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={displayName}
              width={44}
              height={44}
              className={styles.userAvatar}
              unoptimized
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {initial}
            </div>
          )}
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userEmail}>{user.email || 'No email attached'}</span>
          </div>
        </div>

        {feedback && (
          <div
            className={`${styles.alertFeedback} ${
              feedback.type === 'success' ? styles.alertSuccess : styles.alertError
            }`}
            role="status"
          >
            {feedback.message}
          </div>
        )}

        {/* Providers Section */}
        <div className={styles.providersSectionTitle}>Sign-in Providers</div>
        <div className={styles.providersList}>
          {ALL_PROVIDERS.map((provider) => {
            const isConnected = userProviders.includes(provider.id);
            const accountDetails = linkedAccounts.find(
              (acc) => String(acc.provider).toLowerCase() === provider.id
            );
            const isConfirming = confirmProvider === provider.id;
            const isBusy = busyProvider === provider.id;

            return (
              <div
                key={provider.id}
                className={`${styles.providerCard} ${
                  isConnected ? styles.providerCardConnected : ''
                }`}
              >
                <div className={styles.providerMeta}>
                  <div className={`${styles.providerIconBox} ${provider.boxClass}`}>
                    {provider.icon}
                  </div>
                  <div className={styles.providerDetails}>
                    <div className={styles.providerName}>
                      {provider.name}
                      {isConnected ? (
                        <span className={styles.connectedBadge}>Connected</span>
                      ) : (
                        <span className={styles.notConnectedBadge}>Not Connected</span>
                      )}
                    </div>
                    <div className={styles.providerSubtext}>
                      {isConnected
                        ? accountDetails?.displayName || accountDetails?.email || 'Linked to your Zenith account'
                        : 'Not currently linked'}
                    </div>
                  </div>
                </div>

                <div className={styles.providerAction}>
                  {isConnected ? (
                    isConfirming ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.disconnectBtn}`}
                          onClick={() => handleDisconnect(provider.id)}
                          disabled={isBusy}
                        >
                          {isBusy ? 'Removing...' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--color-text-muted)'
                          }}
                          onClick={() => setConfirmProvider(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.disconnectBtn}`}
                        onClick={() => setConfirmProvider(provider.id)}
                        disabled={isSoleProvider || isBusy}
                        title={
                          isSoleProvider
                            ? 'You must keep at least one sign-in method connected to your account.'
                            : `Disconnect ${provider.name}`
                        }
                      >
                        Disconnect
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.connectBtn}`}
                      onClick={() => handleConnect(provider.id)}
                      disabled={isBusy}
                    >
                      {isBusy ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sole Provider Warning Callout */}
        {isSoleProvider && (
          <div className={styles.lastProviderNotice} role="note">
            <span aria-hidden="true">ℹ️</span>
            <span>
              <strong>One login method active:</strong> You must keep at least one sign-in method
              connected to your account. Connect another provider before disconnecting this one.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
