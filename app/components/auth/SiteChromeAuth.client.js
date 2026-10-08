'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthContext.client';
import styles from './SiteChromeAuth.module.css';

export default function SiteChromeAuth() {
  const {
    user,
    loading,
    authenticated,
    openAuthModal,
    openLinkingModal,
    logout
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    if (!dropdownOpen) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // Loading skeleton to eliminate layout shifts (CLS = 0)
  if (loading) {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.skeletonPill} aria-hidden="true" />
      </div>
    );
  }

  // Guest State: Clean Sign In button
  if (!authenticated || !user) {
    return (
      <div className={styles.authWrapper}>
        <button
          type="button"
          className={styles.signInBtn}
          onClick={() => openAuthModal()}
          aria-label="Sign in to Zenith"
        >
          <span className={styles.signInIcon} aria-hidden="true">⚡</span>
          <span>Sign In</span>
        </button>
      </div>
    );
  }

  // Authenticated State: User Avatar & Dropdown Menu
  const displayName = user.displayName || user.name || 'User';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'Z';
  const userProviders = Array.isArray(user.providers) ? user.providers : [];

  return (
    <div className={styles.authWrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label={`User menu for ${displayName}`}
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={displayName}
            width={30}
            height={30}
            className={styles.avatarImg}
            unoptimized
          />
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            {initial}
          </div>
        )}
        <span className={styles.userDisplayName}>{displayName}</span>
        <span className={`${styles.caretIcon} ${dropdownOpen ? styles.caretOpen : ''}`} aria-hidden="true">
          ▼
        </span>
      </button>

      {dropdownOpen && (
        <div className={styles.dropdownMenu} role="menu" aria-label="Account options">
          <div className={styles.dropdownHeader}>
            <p className={styles.dropdownUserName}>{displayName}</p>
            {user.email && <p className={styles.dropdownUserEmail}>{user.email}</p>}
            <div className={styles.providerBadgesRow}>
              {userProviders.map((p) => (
                <span key={p} className={styles.providerMiniBadge}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={styles.dropdownItem}
            role="menuitem"
            onClick={() => {
              setDropdownOpen(false);
              openLinkingModal();
            }}
          >
            <span className={styles.dropdownItemIcon} aria-hidden="true">⚙️</span>
            <span>Manage Linked Accounts</span>
          </button>

          <Link
            href="/tools/squad-builder"
            className={styles.dropdownItem}
            role="menuitem"
            onClick={() => setDropdownOpen(false)}
          >
            <span className={styles.dropdownItemIcon} aria-hidden="true">🏟️</span>
            <span>Saved Squads</span>
          </Link>

          <Link
            href="/tools/watchlist"
            className={styles.dropdownItem}
            role="menuitem"
            onClick={() => setDropdownOpen(false)}
          >
            <span className={styles.dropdownItemIcon} aria-hidden="true">❤️</span>
            <span>My Watchlist</span>
          </Link>

          <div className={styles.dropdownDivider} />

          <button
            type="button"
            className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
            role="menuitem"
            onClick={() => {
              setDropdownOpen(false);
              logout();
            }}
          >
            <span className={styles.dropdownItemIcon} aria-hidden="true">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
