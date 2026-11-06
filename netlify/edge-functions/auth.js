// Password protection for the whole site (HTTP Basic Auth at the Netlify edge).
// The password is NOT in the repo: set SITE_PASSWORD in Netlify
// (Site configuration > Environment variables). The username is ignored.
// If SITE_PASSWORD is not set, the site stays locked (fails closed).

function safeEqual(a, b) {
  // Constant-time-ish comparison so response time does not leak the password.
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export default async (request, context) => {
  const password = Netlify.env.get('SITE_PASSWORD');
  if (!password) {
    return new Response('This site is locked: no password has been configured.', { status: 503 });
  }

  const header = request.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    try {
      const decoded = atob(encoded);
      const given = decoded.slice(decoded.indexOf(':') + 1);
      if (safeEqual(given, password)) return context.next();
    } catch {
      // fall through to 401
    }
  }

  return new Response('Password required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Why Do Patients Come Back? (preview)", charset="UTF-8"' },
  });
};

export const config = { path: '/*' };
