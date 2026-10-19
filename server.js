// NexusLab EdTech Server - Node.js Built-in Static Server
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.apk': 'application/vnd.android.package-archive',
  '.exe': 'application/vnd.microsoft.portable-executable',
  '.zip': 'application/zip'
};

const server = http.createServer((req, res) => {
  // Parse URL & prevent path traversal
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);
  if (pathname === '/' || pathname === '') pathname = '/index.html';

  const safePath = path.normalize(path.join(ROOT_DIR, pathname));
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access denied');
  }

  // Security: Deny direct public access to sensitive files, hidden directories, and credentials
  const baseName = path.basename(safePath).toLowerCase();
  const relPath = path.relative(ROOT_DIR, safePath).replace(/\\/g, '/');
  const isBlocked = 
    baseName.startsWith('.') || 
    baseName === 'api.txt' || 
    baseName === 'server.js' || 
    baseName === 'package.json' || 
    baseName === 'package-lock.json' ||
    relPath.startsWith('.git') ||
    relPath.startsWith('.next') ||
    relPath.startsWith('src/') ||
    relPath.includes('..');

  if (isBlocked) {
    res.writeHead(403, { 
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
    return res.end('403 Forbidden: Access to sensitive file is denied.');
  }

  fs.stat(safePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      });
      return res.end(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>404 Not Found - NexusLab</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #040711; color: #fff;">
          <h1 style="color: #06b6d4; font-size: 48px;">404</h1>
          <p>Không tìm thấy trang: <code>${pathname}</code></p>
          <a href="/index.html" style="color: #10b981; font-weight: bold; text-decoration: none;">&larr; Về Trang Chủ NexusLab</a>
        </body>
        </html>
      `);
    }

    let filePathToServe = safePath;
    if (stats.isDirectory()) {
      filePathToServe = path.join(safePath, 'index.html');
    }

    const ext = path.extname(filePathToServe).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePathToServe, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('500 Internal Server Error: ' + readErr.message);
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://generativelanguage.googleapis.com https://api.openai.com https://api.xkiro.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; connect-src 'self' https://generativelanguage.googleapis.com https://api.openai.com https://api.xkiro.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
      });
      res.end(content);
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.log(`Port ${PORT} đang bận, tự động chuyển sang port ${nextPort}...`);
    server.listen(nextPort);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`
  ==============================================================
   🚀 NEXUSLAB VIRTUAL SCIENCE SUITE - LOCAL SERVER IS RUNNING
  ==============================================================
   - Cổng Chính (Home):       http://localhost:${actualPort}/index.html
   - Cổng Vật Lý (Physics):   http://localhost:${actualPort}/ly.html
   - Cổng Hóa Học (Chemistry): http://localhost:${actualPort}/hoa.html
   - Cổng Sinh Học (Biology):  http://localhost:${actualPort}/sinh.html
   --------------------------------------------------------------
   🎮 PHÒNG THÍ NGHIỆM TỰ DO (NEXUSLAB SANDBOX):
   - Sandbox Vật Lý:          http://localhost:${actualPort}/lysand.html
   - Sandbox Hóa Học:         http://localhost:${actualPort}/hoasand.html
   - Sandbox Sinh Học:        http://localhost:${actualPort}/sinhsand.html
   --------------------------------------------------------------
   👨‍🏫 CHẾ ĐỘ GIẢNG DẠY (TEACHER TOOLKIT):
   - Nhấn icon 👨‍🏫 (góc dưới phải) trên bất kỳ trang nào để mở:
     + Bút vẽ màn hình & Laser Pointer
     + Thẻ tra cứu công thức SGK GDPT 2018
     + Trắc nghiệm tương tác lớp học
     + Điều khiển tốc độ thời gian 0.25x / 0.5x / Step
  ==============================================================
  `);
});

module.exports = server;
