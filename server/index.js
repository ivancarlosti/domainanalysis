import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const STATIC_DIR = path.resolve(__dirname, '..', 'dist');

const AUTH_METHOD = (process.env.AUTH_METHOD || 'none').toLowerCase();
const ACCOUNT_LOGIN = process.env.ACCOUNT_LOGIN || '';
const ACCOUNT_PASSWORD = process.env.ACCOUNT_PASSWORD || '';
const RECAPTCHA_CLIENTID = process.env.RECAPTCHA_CLIENTID || '';
const RECAPTCHA_CLIENTSECRET = process.env.RECAPTCHA_CLIENTSECRET || '';

const KEYCLOAK_BASE_URL = (process.env.KEYCLOAK_BASE_URL || '').replace(/\/+$/, '');
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || '';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || '';
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';
const KEYCLOAK_REDIRECT_URI = (process.env.KEYCLOAK_REDIRECT_URI || '').replace(/\/+$/, '');
const KEYCLOAK_EMAIL_ACCOUNT = process.env.KEYCLOAK_EMAIL_ACCOUNT || '';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const sessions = new Map();
const oauthStates = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessions) if (v.expiresAt < now) sessions.delete(k);
  for (const [k, v] of oauthStates) if (v < now) oauthStates.delete(k);
}, 60_000).unref();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser(SESSION_SECRET));

function getSession(req) {
  const sid = req.signedCookies?.sid;
  if (!sid) return null;
  const sess = sessions.get(sid);
  if (!sess) return null;
  if (sess.expiresAt < Date.now()) {
    sessions.delete(sid);
    return null;
  }
  return { sid, ...sess };
}

function createSession(user) {
  const sid = crypto.randomBytes(24).toString('hex');
  sessions.set(sid, { user, expiresAt: Date.now() + SESSION_TTL_MS });
  return sid;
}

function setSessionCookie(res, sid) {
  res.cookie('sid', sid, {
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    maxAge: SESSION_TTL_MS,
    path: '/'
  });
}

function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

app.get('/api/config', (_req, res) => {
  res.json({
    authMethod: AUTH_METHOD,
    recaptchaClientId: AUTH_METHOD === 'account' && RECAPTCHA_CLIENTID && RECAPTCHA_CLIENTSECRET ? RECAPTCHA_CLIENTID : ''
  });
});

app.get('/api/auth/me', (req, res) => {
  if (AUTH_METHOD === 'none') {
    return res.json({ authenticated: true, user: { name: 'guest' } });
  }
  const sess = getSession(req);
  if (!sess) return res.json({ authenticated: false });
  res.json({ authenticated: true, user: sess.user });
});

app.post('/api/auth/login', async (req, res) => {
  if (AUTH_METHOD !== 'account') return res.status(400).json({ error: 'wrong-method' });
  if (!ACCOUNT_LOGIN || !ACCOUNT_PASSWORD) return res.status(500).json({ error: 'account-not-configured' });

  const { username, password, recaptchaToken } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing' });

  if (RECAPTCHA_CLIENTID && RECAPTCHA_CLIENTSECRET) {
    if (!recaptchaToken) return res.status(400).json({ error: 'recaptcha-required' });
    try {
      const params = new URLSearchParams({ secret: RECAPTCHA_CLIENTSECRET, response: recaptchaToken });
      const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: params
      });
      const data = await verify.json();
      if (!data.success) return res.status(401).json({ error: 'recaptcha-failed' });
    } catch (e) {
      return res.status(500).json({ error: 'recaptcha-error' });
    }
  }

  if (!safeEqual(username, ACCOUNT_LOGIN) || !safeEqual(password, ACCOUNT_PASSWORD)) {
    return res.status(401).json({ error: 'invalid' });
  }
  const sid = createSession({ name: username });
  setSessionCookie(res, sid);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  const sid = req.signedCookies?.sid;
  if (sid) sessions.delete(sid);
  res.clearCookie('sid', { path: '/' });
  if (AUTH_METHOD === 'keycloak' && KEYCLOAK_BASE_URL && KEYCLOAK_REALM) {
    const logoutUrl = `${KEYCLOAK_BASE_URL}/realms/${encodeURIComponent(KEYCLOAK_REALM)}/protocol/openid-connect/logout`;
    return res.json({ ok: true, redirect: logoutUrl });
  }
  res.json({ ok: true });
});

function callbackUri() {
  const base = KEYCLOAK_REDIRECT_URI || '';
  return `${base}/api/auth/keycloak/callback`;
}

app.get('/api/auth/keycloak/login', (_req, res) => {
  if (AUTH_METHOD !== 'keycloak') return res.status(400).send('wrong-method');
  if (!KEYCLOAK_BASE_URL || !KEYCLOAK_REALM || !KEYCLOAK_CLIENT_ID) {
    return res.status(500).send('keycloak-not-configured');
  }
  const state = crypto.randomBytes(16).toString('hex');
  oauthStates.set(state, Date.now() + 10 * 60 * 1000);
  const url = new URL(`${KEYCLOAK_BASE_URL}/realms/${encodeURIComponent(KEYCLOAK_REALM)}/protocol/openid-connect/auth`);
  url.searchParams.set('client_id', KEYCLOAK_CLIENT_ID);
  url.searchParams.set('redirect_uri', callbackUri());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', state);
  res.redirect(url.toString());
});

app.get('/api/auth/keycloak/callback', async (req, res) => {
  if (AUTH_METHOD !== 'keycloak') return res.status(400).send('wrong-method');
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send('missing-params');

  const exp = oauthStates.get(state);
  if (!exp || exp < Date.now()) return res.status(400).send('invalid-state');
  oauthStates.delete(state);

  try {
    const tokenUrl = `${KEYCLOAK_BASE_URL}/realms/${encodeURIComponent(KEYCLOAK_REALM)}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: callbackUri(),
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET
    });
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    if (!tokenRes.ok) return res.status(401).send('token-exchange-failed');
    const tokens = await tokenRes.json();

    const userInfoRes = await fetch(
      `${KEYCLOAK_BASE_URL}/realms/${encodeURIComponent(KEYCLOAK_REALM)}/protocol/openid-connect/userinfo`,
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    if (!userInfoRes.ok) return res.status(401).send('userinfo-failed');
    const userInfo = await userInfoRes.json();

    if (KEYCLOAK_EMAIL_ACCOUNT && userInfo.email && userInfo.email.toLowerCase() !== KEYCLOAK_EMAIL_ACCOUNT.toLowerCase()) {
      return res.status(403).send('email-not-authorized');
    }

    const sid = createSession({
      name: userInfo.preferred_username || userInfo.name || userInfo.email || 'user',
      email: userInfo.email || ''
    });
    setSessionCookie(res, sid);
    res.redirect('/');
  } catch (err) {
    console.error('Keycloak callback error', err);
    res.status(500).send('callback-error');
  }
});

app.use(express.static(STATIC_DIR, { index: false, maxAge: '1h' }));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[domainanalysis] auth=${AUTH_METHOD} listening on :${PORT}`);
});
