process.env.NODE_ENV = 'production';
const { createServer: createHttpsServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const NextServer = require('next/dist/server/next-server').default;
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
const hostname = process.env.HOSTNAME || 'foodie.khfc.co.kr';
const port = parseInt(process.env.PORT, 10) || 3000;
const protocol = (process.env.PROTOCOL || 'https').toLowerCase();

const nextConfig = JSON.parse(process.env.__NEXT_PRIVATE_STANDALONE_CONFIG || '{}');

const app = new NextServer({
  hostname,
  port,
  dir: path.join(__dirname),
  dev,
  conf: nextConfig,
});
const handle = app.getRequestHandler();

let server;
if (protocol === 'https') {
  if (!process.env.TLS_KEY_PATH || !process.env.TLS_CERT_PATH) {
    throw new Error('HTTPS requires TLS_KEY_PATH and TLS_CERT_PATH pointing to separately managed certificate files.');
  }
  const httpsOptions = {
    key: fs.readFileSync(process.env.TLS_KEY_PATH),
    cert: fs.readFileSync(process.env.TLS_CERT_PATH),
  };
  server = createHttpsServer(httpsOptions, (req, res) => handleRequest(req, res));
} else {
  server = createHttpServer((req, res) => handleRequest(req, res));
}

async function handleRequest(req, res) {
  // Intranet runtime: all application resources and API calls stay on this origin.
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
  try {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Explicit public audit downloads only; never accept arbitrary filesystem paths.
    const securityDownloads = new Set([
      '/security/sbom.cdx.json', '/security/inventory.json',
      '/security/dependency-security-20261115.md',
      '/security/server-security-20261115.md',
      '/security/runtime-security-20261115.md',
    ]);
    if (securityDownloads.has(pathname)) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, HEAD');
        res.end();
        return;
      }
      const filename = path.basename(pathname);
      const file = path.join(__dirname, 'public', 'security', filename);
      if (!fs.existsSync(file)) { res.statusCode = 404; res.end('Not found'); return; }
      res.setHeader('Content-Type', filename.endsWith('.json') ? 'application/json; charset=utf-8' : 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-store');
      res.end(req.method === 'HEAD' ? undefined : fs.readFileSync(file));
      return;
    }

    // Static assets serving
    if (pathname.startsWith('/_next/static/')) {
      const decodedPathname = decodeURIComponent(pathname);
      const filePath = path.join(__dirname, '.next/static', decodedPathname.replace('/_next/static/', ''));
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.webp': 'image/webp',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
          '.ttf': 'font/ttf',
          '.otf': 'font/otf',
        };
        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.end(fs.readFileSync(filePath));
        return;
      }
    } else if (pathname.startsWith('/images/') || pathname.startsWith('/icons/') || pathname === '/favicon.ico') {
      const decodedPathname = decodeURIComponent(pathname);
      const filePath = path.join(__dirname, 'public', decodedPathname);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.json': 'application/json',
          '.webp': 'image/webp',
        };
        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.end(fs.readFileSync(filePath));
        return;
      }
    }

    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    res.statusCode = 500;
    res.end('internal server error');
  }
}

server
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`> Ready on ${protocol}://${hostname}:${port}`);
  });

module.exports = server;
