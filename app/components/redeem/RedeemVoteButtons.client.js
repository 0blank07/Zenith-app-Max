'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './RedeemCodeHubPage.module.css';
import { useAuth } from '../auth/AuthContext.client';
const LOCAL_STORAGE_KEY = 'zenith_redeem_user_votes';

// Module-level batching queue for GET /api/redeem-codes/vote?ids=...
let pendingIds = new Set();
let batchTimer = null;
const idListeners = new Map();

function requestVoteCounts(codeId, callback) {
  if (!codeId) return () => {};

  if (!idListeners.has(codeId)) {
    idListeners.set(codeId, new Set());
  }
  idListeners.get(codeId).add(callback);
  pendingIds.add(codeId);

  if (!batchTimer) {
    batchTimer = setTimeout(async () => {
      const idsToFetch = Array.from(pendingIds);
      pendingIds.clear();
      batchTimer = null;

      if (!idsToFetch.length) return;

      try {
        const query = idsToFetch.map(encodeURIComponent).join(',');
        const res = await fetch(`/api/redeem-codes/vote?ids=${query}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && data?.votes) {
          for (const [id, counts] of Object.entries(data.votes)) {
            const callbacks = idListeners.get(id);
            if (callbacks) {
              callbacks.forEach((cb) => cb(counts));
            }
          }
        }
      } catch {
        // Graceful offline fallback: keep existing counts
      }
    }, 40);
  }

  return () => {
    const callbacks = idListeners.get(codeId);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        idListeners.delete(codeId);
      }
    }
  };
}

export default function RedeemVoteButtons({
  codeId,
  initialWorked = 0,
  initialExpired = 0,
  workedLabel = 'Worked',
  expiredLabel = 'Expired',
  className = ''
}) {
  const [counts, setCounts] = useState({
    worked: Number(initialWorked) || 0,
    expired: Number(initialExpired) || 0
  });
  const [userVote, setUserVote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Check localStorage for existing user vote
    try {
      const storedJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedJson) {
        const votes = JSON.parse(storedJson);
        if (votes && typeof votes === 'object' && votes[codeId]) {
          setUserVote(votes[codeId]);
        }
      }
    } catch {
      // Ignore localStorage errors (e.g. private browsing mode)
    }

    // Subscribe to batch vote count fetch
    const unsubscribe = requestVoteCounts(codeId, (voteData) => {
      if (!mountedRef.current) return;
      if (voteData && typeof voteData === 'object') {
        setCounts({
          worked: Number(voteData.worked) || 0,
          expired: Number(voteData.expired) || 0
        });
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [codeId]);

  const { authenticated, openAuthModal } = useAuth();

  const handleVote = async (voteType) => {
    if (!codeId || userVote || submitting) return;

    if (!authenticated) {
      openAuthModal({ promptText: 'Sign in with Google, Discord, or Facebook to verify this code.' });
      return;
    }

    setSubmitting(true);
    setUserVote(voteType);

    // Optimistic UI update
    setCounts((prev) => ({
      ...prev,
      [voteType]: prev[voteType] + 1
    }));

    // Save in localStorage immediately to prevent repeat voting
    try {
      const storedJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      const existing = storedJson ? JSON.parse(storedJson) : {};
      existing[codeId] = voteType;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // Ignore localStorage storage errors
    }

    // Submit vote to API
    try {
      const response = await fetch('/api/redeem-codes/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codeId, voteType })
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.success && !result.offline) {
          if (mountedRef.current) {
            setCounts({
              worked: Number(result.worked) || 0,
              expired: Number(result.expired) || 0
            });
          }
        }
      }
    } catch {
      // Handle offline / graceful fallback smoothly without showing error alerts
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const hasVoted = Boolean(userVote);

  return (
    <div
      className={`${styles.voteGroup} ${className}`.trim()}
      role="group"
      aria-label="Community verification voting"
    >
      <button
        type="button"
        className={`${styles.voteButton} ${styles.voteWorked} ${userVote === 'worked' ? styles.voteActiveWorked : ''}`}
        onClick={() => handleVote('worked')}
        disabled={hasVoted || submitting}
        aria-pressed={userVote === 'worked'}
        aria-label={`${workedLabel}: ${counts.worked}`}
        title={hasVoted ? `${workedLabel} (${counts.worked})` : `Vote ${workedLabel}`}
      >
        <span className={styles.voteIcon} aria-hidden="true">👍</span>
        <span className={styles.voteText}>{workedLabel}</span>
        <span className={styles.voteCount}>{counts.worked}</span>
      </button>

      <button
        type="button"
        className={`${styles.voteButton} ${styles.voteExpired} ${userVote === 'expired' ? styles.voteActiveExpired : ''}`}
        onClick={() => handleVote('expired')}
        disabled={hasVoted || submitting}
        aria-pressed={userVote === 'expired'}
        aria-label={`${expiredLabel}: ${counts.expired}`}
        title={hasVoted ? `${expiredLabel} (${counts.expired})` : `Vote ${expiredLabel}`}
      >
        <span className={styles.voteIcon} aria-hidden="true">👎</span>
        <span className={styles.voteText}>{expiredLabel}</span>
        <span className={styles.voteCount}>{counts.expired}</span>
      </button>
    </div>
  );
}
