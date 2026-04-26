import React, { useEffect, useState } from 'react';
import { Loader2, LogIn } from 'lucide-react';

export type AuthMethod = 'none' | 'account' | 'keycloak';

export interface AuthConfig {
  authMethod: AuthMethod;
  recaptchaClientId?: string;
}

export interface AuthUser {
  name?: string;
  email?: string;
}

interface AuthContextValue {
  config: AuthConfig;
  user: AuthUser | null;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthGate');
  return ctx;
};

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SCRIPT_ID = 'recaptcha-v3-script';

const ensureRecaptcha = (siteKey: string) =>
  new Promise<void>((resolve, reject) => {
    if (window.grecaptcha) return resolve();
    const existing = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('recaptcha-load-failed')));
      return;
    }
    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('recaptcha-load-failed'));
    document.head.appendChild(script);
  });

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cfgRes, meRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/auth/me', { credentials: 'same-origin' })
        ]);
        if (!cfgRes.ok) throw new Error('config-failed');
        const cfg = (await cfgRes.json()) as AuthConfig;
        const me = await meRes.json().catch(() => ({ authenticated: false }));
        if (cancelled) return;
        setConfig(cfg);
        if (me.authenticated) setUser(me.user || {});
      } catch (e) {
        if (!cancelled) setError('Failed to contact server');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      setUser(null);
      if (data?.redirect) {
        window.location.href = data.redirect;
        return;
      }
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSubmitting(true);
    setError(null);
    try {
      let recaptchaToken: string | undefined;
      if (config.recaptchaClientId) {
        await ensureRecaptcha(config.recaptchaClientId);
        await new Promise<void>(resolve => window.grecaptcha!.ready(() => resolve()));
        recaptchaToken = await window.grecaptcha!.execute(config.recaptchaClientId, { action: 'login' });
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password, recaptchaToken })
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error === 'invalid' ? 'Invalid credentials' : (payload.error || 'login-failed'));
        return;
      }
      const meRes = await fetch('/api/auth/me', { credentials: 'same-origin' });
      const me = await meRes.json();
      if (me.authenticated) setUser(me.user || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'login-error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (user) {
    return <AuthContext.Provider value={{ config, user, logout }}>{children}</AuthContext.Provider>;
  }

  if (config.authMethod === 'keycloak') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-sm w-full text-center space-y-4">
          <h2 className="text-xl text-gray-700 dark:text-gray-100">Sign in required</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Authenticate via your identity provider to continue.</p>
          <a
            href="/api/auth/keycloak/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            <LogIn size={16} /> Sign in with Keycloak
          </a>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={submitLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-sm w-full space-y-4"
      >
        <h2 className="text-xl text-gray-700 dark:text-gray-100">Sign in</h2>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            autoFocus
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !username || !password}
          className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded transition-colors"
        >
          {submitting ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />} Sign in
        </button>
        {config.recaptchaClientId && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
            Protected by reCAPTCHA — Google{' '}
            <a className="underline" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy</a> &{' '}
            <a className="underline" href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms</a>.
          </p>
        )}
      </form>
    </div>
  );
};

export default AuthGate;
