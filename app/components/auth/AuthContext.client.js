'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export const AuthContext = createContext({
  user: null,
  loading: true,
  authenticated: false,
  authModalOpen: false,
  linkingModalOpen: false,
  authModalOptions: { returnTo: '/', promptText: '' },
  openAuthModal: () => {},
  closeAuthModal: () => {},
  openLinkingModal: () => {},
  closeLinkingModal: () => {},
  login: () => {},
  logout: async () => {},
  unlink: async () => ({ success: false, error: 'Not initialized' }),
  refreshSession: async () => null
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [linkingModalOpen, setLinkingModalOpen] = useState(false);
  const [authModalOptions, setAuthModalOptions] = useState({ returnTo: '/', promptText: '' });

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const data = await response.json();
      if (data && data.authenticated && data.user) {
        setUser(data.user);
        return data.user;
      }

      setUser(null);
      return null;
    } catch (err) {
      // Non-blocking error handling: fallback to unauthenticated guest state
      console.warn('[Zenith Auth] Failed to retrieve current session:', err?.message || err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const openAuthModal = useCallback((returnToOrOptions, promptText) => {
    let resolvedReturnTo = '/';
    let resolvedPromptText = '';

    if (typeof returnToOrOptions === 'string') {
      resolvedReturnTo = returnToOrOptions;
      if (typeof promptText === 'string') {
        resolvedPromptText = promptText;
      }
    } else if (returnToOrOptions && typeof returnToOrOptions === 'object') {
      if (returnToOrOptions.returnTo) resolvedReturnTo = returnToOrOptions.returnTo;
      if (returnToOrOptions.promptText) resolvedPromptText = returnToOrOptions.promptText;
    } else if (typeof window !== 'undefined') {
      resolvedReturnTo = window.location.pathname + window.location.search;
    }

    setAuthModalOptions({
      returnTo: resolvedReturnTo,
      promptText: resolvedPromptText
    });
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const openLinkingModal = useCallback(() => {
    setLinkingModalOpen(true);
  }, []);

  const closeLinkingModal = useCallback(() => {
    setLinkingModalOpen(false);
  }, []);

  const login = useCallback((provider, returnTo) => {
    const validProviders = ['google', 'discord', 'facebook'];
    const selectedProvider = String(provider || '').trim().toLowerCase();

    if (!validProviders.includes(selectedProvider)) {
      console.error(`[Zenith Auth] Unsupported provider: ${provider}`);
      return;
    }

    if (typeof window === 'undefined') return;

    let targetReturnTo = returnTo;
    if (!targetReturnTo) {
      targetReturnTo = window.location.pathname + window.location.search;
    }

    const loginUrl = `/api/auth/${selectedProvider}/login?returnTo=${encodeURIComponent(targetReturnTo)}`;
    window.location.href = loginUrl;
  }, []);

  const logout = useCallback(async (returnTo) => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Accept: 'application/json' }
      });
    } catch (err) {
      console.error('[Zenith Auth] Logout request failed:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        if (returnTo) {
          window.location.href = returnTo;
        } else {
          window.location.reload();
        }
      }
    }
  }, []);

  const unlink = useCallback(async (provider) => {
    try {
      const response = await fetch('/api/auth/unlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ provider })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data?.error || 'Failed to disconnect provider'
        };
      }

      setUser((prevUser) => {
        if (!prevUser) return null;
        const normalizedProvider = String(provider).toLowerCase();
        return {
          ...prevUser,
          providers: (prevUser.providers || []).filter(
            (p) => String(p).toLowerCase() !== normalizedProvider
          ),
          linkedAccounts: (prevUser.linkedAccounts || []).filter(
            (acc) => String(acc.provider).toLowerCase() !== normalizedProvider
          )
        };
      });

      return {
        success: true,
        remainingProviders: data.remainingProviders || []
      };
    } catch (err) {
      console.error('[Zenith Auth] Unlink error:', err);
      return {
        success: false,
        error: err?.message || 'Network error while disconnecting provider'
      };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authenticated: Boolean(user),
    authModalOpen,
    linkingModalOpen,
    authModalOptions,
    openAuthModal,
    closeAuthModal,
    openLinkingModal,
    closeLinkingModal,
    login,
    logout,
    unlink,
    refreshSession
  }), [
    user,
    loading,
    authModalOpen,
    linkingModalOpen,
    authModalOptions,
    openAuthModal,
    closeAuthModal,
    openLinkingModal,
    closeLinkingModal,
    login,
    logout,
    unlink,
    refreshSession
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
