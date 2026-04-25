import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT || 3337;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml',
  '.gif':'image/gif','.ico':'image/x-icon','.woff2':'font/woff2',
  '.woff':'font/woff','.ttf':'font/ttf','.pdf':'application/pdf',
};
http.createServer((req, res) => {
  let requestPath;
  try {
    requestPath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }

  const fp = path.resolve(ROOT, `.${requestPath}`);
  if (!fp.startsWith(ROOT + path.sep) && fp !== ROOT) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log('http://127.0.0.1:' + PORT));
