const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow = null;
let server = null;
let serverPort = 8080;

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
  '.exe': 'application/vnd.microsoft.portable-executable'
};

function startInternalServer(callback) {
  const rootDir = __dirname;
  server = http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      let pathname = decodeURIComponent(parsedUrl.pathname);
      if (pathname === '/' || pathname === '') pathname = '/index.html';

      const safePath = path.normalize(path.join(rootDir, pathname));
      if (!safePath.startsWith(rootDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('403 Forbidden: Access denied');
      }

      fs.stat(safePath, (err, stats) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(`
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>404 Not Found - NexusLab Desktop</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #050713; color: #fff;">
              <h1 style="color: #0284c7; font-size: 48px;">404</h1>
              <p>Không tìm thấy trang: <code>${pathname}</code></p>
              <a href="/index.html" style="color: #059669; font-weight: bold; text-decoration: none;">&larr; Về Trang Chủ NexusLab</a>
            </body>
            </html>
          `);
        }

        let fileToServe = safePath;
        if (stats.isDirectory()) {
          fileToServe = path.join(safePath, 'index.html');
        }

        const ext = path.extname(fileToServe).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(fileToServe, (readErr, content) => {
          if (readErr) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('500 Internal Server Error: ' + readErr.message);
          }

          res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          });
          res.end(content);
        });
      });
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server exception: ' + e.message);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      serverPort++;
      server.listen(serverPort);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(serverPort, () => {
    serverPort = server.address().port;
    console.log(`[NexusLab Desktop] Internal server running at http://localhost:${serverPort}`);
    callback(serverPort);
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 680,
    center: true,
    title: 'NEXUSLAB - Phòng Thí Nghiệm Khoa Học Ảo GDPT 2018',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    autoHideMenuBar: false,
    backgroundColor: '#050713'
  });

  mainWindow.maximize();
  mainWindow.loadURL(`http://localhost:${port}/index.html`);

  const template = [
    {
      label: 'Điều Hướng',
      submenu: [
        { label: 'Trang Chủ NexusLab', click: () => mainWindow.loadURL(`http://localhost:${port}/index.html`) },
        { type: 'separator' },
        { label: 'Phòng Thí Nghiệm Vật Lý', click: () => mainWindow.loadURL(`http://localhost:${port}/ly.html`) },
        { label: 'Sandbox Mạch Điện & Quang Học (Vật Lý)', click: () => mainWindow.loadURL(`http://localhost:${port}/lysand.html`) },
        { type: 'separator' },
        { label: 'Phòng Thí Nghiệm Hóa Học', click: () => mainWindow.loadURL(`http://localhost:${port}/hoa.html`) },
        { label: 'Sandbox Pha Chế Phản Ứng (Hóa Học)', click: () => mainWindow.loadURL(`http://localhost:${port}/hoasand.html`) },
        { type: 'separator' },
        { label: 'Phòng Thí Nghiệm Sinh Học', click: () => mainWindow.loadURL(`http://localhost:${port}/sinh.html`) },
        { label: 'Sandbox Di Truyền & Tế Bào (Sinh Học)', click: () => mainWindow.loadURL(`http://localhost:${port}/sinhsand.html`) },
        { type: 'separator' },
        { label: 'Đăng Nhập / Phân Quyền', click: () => mainWindow.loadURL(`http://localhost:${port}/login.html`) },
        { type: 'separator' },
        { label: 'Thoát Ứng Dụng', role: 'quit' }
      ]
    },
    {
      label: 'Hiển Thị',
      submenu: [
        { label: 'Tải Lại (Reload)', role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { label: 'Toàn Màn Hình (Fullscreen F11)', role: 'togglefullscreen', accelerator: 'F11' },
        { type: 'separator' },
        { label: 'Phóng To', role: 'zoomIn' },
        { label: 'Thu Nhỏ', role: 'zoomOut' },
        { label: 'Tỉ Lệ Mặc Định 100%', role: 'resetZoom' }
      ]
    },
    {
      label: 'Giảng Dạy (Teacher Toolkit)',
      submenu: [
        {
          label: 'Bật Bút Vẽ & Laser Pointer',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (window.teacherToolkit && window.teacherToolkit.toggleDrawer) {
                window.teacherToolkit.toggleDrawer();
              } else {
                const btn = document.querySelector('[data-teacher-tool="toggle"]');
                if (btn) btn.click();
              }
            `);
          }
        },
        {
          label: 'Chuyển Đổi Giao Diện Sáng / Tối',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (window.toggleTheme) {
                window.toggleTheme();
              } else {
                const btn = document.getElementById('theme-toggle-btn');
                if (btn) btn.click();
              }
            `);
          }
        }
      ]
    },
    {
      label: 'Trợ Giúp',
      submenu: [
        {
          label: 'Về NexusLab Virtual Science Suite',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Về NexusLab Virtual Science Suite',
              message: 'NexusLab EdTech Platform v1.0.0\\nBản quyền © 2026-2027 NexusLab\\nChuẩn hóa GDPT 2018 (Vật Lý, Hóa Học, Sinh Học)\\nTương thích 100% Windows và Android'
            });
          }
        },
        {
          label: 'Công Cụ Nhà Phát Triển (DevTools)',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools()
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startInternalServer((port) => {
    createWindow(port);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(serverPort);
    }
  });
});

app.on('window-all-closed', () => {
  if (server) {
    try {
      server.close();
    } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
