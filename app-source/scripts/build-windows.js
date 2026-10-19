/**
 * NexusLab Windows Packager Script
 * Assembles standalone Windows x64 binary suite with NexusLab.exe
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const DIST_DIR = path.join(APP_DIR, 'dist');
const WIN_TEMPLATE = path.join(process.env.HOME, '.local', 'electron-win', 'template');
const WIN_OUTPUT = path.join(DIST_DIR, 'NexusLab-Windows-x64');

console.log('==========================================');
console.log(' Building NexusLab Windows Executable (.exe)');
console.log('==========================================');

if (!fs.existsSync(WIN_TEMPLATE)) {
  console.error('Error: Windows Electron runtime template not found at ' + WIN_TEMPLATE);
  process.exit(1);
}

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Clean and recreate Windows output folder
if (fs.existsSync(WIN_OUTPUT)) {
  fs.rmSync(WIN_OUTPUT, { recursive: true, force: true });
}

console.log('-> Copying Windows Electron runtime...');
fs.cpSync(WIN_TEMPLATE, WIN_OUTPUT, { recursive: true });

// Rename electron.exe to NexusLab.exe
const origExe = path.join(WIN_OUTPUT, 'electron.exe');
const targetExe = path.join(WIN_OUTPUT, 'NexusLab.exe');
if (fs.existsSync(origExe)) {
  fs.renameSync(origExe, targetExe);
}

// Remove default_app.asar
const defaultAsar = path.join(WIN_OUTPUT, 'resources', 'default_app.asar');
if (fs.existsSync(defaultAsar)) {
  fs.unlinkSync(defaultAsar);
}

// Create staging app directory
const STAGING_DIR = path.join(DIST_DIR, 'app_staging');
if (fs.existsSync(STAGING_DIR)) {
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}
fs.mkdirSync(STAGING_DIR, { recursive: true });

console.log('-> Staging application assets & core engines...');

// Copy core manifest and entrypoints
const filesToCopy = [
  'package.json',
  'electron-main.js',
  'preload.js',
  'icon.png'
];

filesToCopy.forEach(file => {
  const src = path.join(APP_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(STAGING_DIR, file));
  }
});

// Copy all HTML and JS files
fs.readdirSync(APP_DIR).forEach(item => {
  if (item.endsWith('.html') || (item.endsWith('.js') && !item.startsWith('scripts'))) {
    fs.copyFileSync(path.join(APP_DIR, item), path.join(STAGING_DIR, item));
  }
});

// Copy directories
['public', 'vendor'].forEach(dir => {
  const srcDir = path.join(APP_DIR, dir);
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, path.join(STAGING_DIR, dir), { recursive: true });
  }
});

// Pack into app.asar or place in resources/app
console.log('-> Packaging app archive (app.asar)...');
const asarTarget = path.join(WIN_OUTPUT, 'resources', 'app.asar');
try {
  execSync(`npx asar pack "${STAGING_DIR}" "${asarTarget}"`, {
    env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}` },
    stdio: 'inherit'
  });
  console.log('-> app.asar created successfully!');
} catch (e) {
  console.warn('-> Fallback to unpacked resources/app directory');
  fs.cpSync(STAGING_DIR, path.join(WIN_OUTPUT, 'resources', 'app'), { recursive: true });
}

// Clean up staging
fs.rmSync(STAGING_DIR, { recursive: true, force: true });

// Optimize package size: strip unnecessary locales and redundant DirectX 12 compiler (DirectX 11 ANGLE is used)
console.log('-> Optimizing Windows bundle for GitHub distribution (<100MB)...');
const winLocales = path.join(WIN_OUTPUT, 'locales');
if (fs.existsSync(winLocales)) {
  fs.readdirSync(winLocales).forEach(loc => {
    if (loc !== 'en-US.pak' && loc !== 'vi.pak') {
      try { fs.unlinkSync(path.join(winLocales, loc)); } catch (e) {}
    }
  });
}
['dxcompiler.dll', 'vk_swiftshader.dll', 'LICENSES.chromium.html'].forEach(f => {
  const p = path.join(WIN_OUTPUT, f);
  if (fs.existsSync(p)) {
    try { fs.unlinkSync(p); } catch (e) {}
  }
});

// Create ZIP distribution with maximum compression
console.log('-> Creating portable Windows ZIP archive (level 9)...');
const zipOutput = path.join(DIST_DIR, 'NexusLab-Windows-x64.zip');
if (fs.existsSync(zipOutput)) {
  fs.unlinkSync(zipOutput);
}
execSync(`cd "${DIST_DIR}" && zip -r -9 -q "NexusLab-Windows-x64.zip" "NexusLab-Windows-x64"`);

// Copy standalone NexusLab.exe to dist root as NexusLab-Windows.exe
const standaloneExe = path.join(DIST_DIR, 'NexusLab-Windows.exe');
fs.copyFileSync(targetExe, standaloneExe);

console.log('==========================================');
console.log(' SUCCESS! Windows Application built:');
console.log(` - Folder:   ${WIN_OUTPUT}`);
console.log(` - Executable: ${targetExe}`);
console.log(` - Standalone: ${standaloneExe}`);
console.log(` - ZIP Archive: ${zipOutput} (${(fs.statSync(zipOutput).size / (1024*1024)).toFixed(1)} MB)`);
console.log('==========================================');
