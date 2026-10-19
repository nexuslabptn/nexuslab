/**
 * NexusLab macOS Packager Script
 * Assembles native macOS application bundle (NexusLab.app) and distribution ZIP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const DIST_DIR = path.join(APP_DIR, 'dist');
const MAC_TEMPLATE = path.join(process.env.HOME, '.local', 'electron-mac', 'template', 'Electron.app');
const MAC_APP_OUTPUT = path.join(DIST_DIR, 'NexusLab.app');
const MAC_ZIP_OUTPUT = path.join(DIST_DIR, 'NexusLab-macOS.zip');

console.log('==========================================');
console.log(' Building NexusLab macOS Application (.app)');
console.log('==========================================');

if (!fs.existsSync(MAC_TEMPLATE)) {
  console.error('Error: macOS Electron runtime template not found at ' + MAC_TEMPLATE);
  process.exit(1);
}

// Clean previous build
if (fs.existsSync(MAC_APP_OUTPUT)) {
  fs.rmSync(MAC_APP_OUTPUT, { recursive: true, force: true });
}
if (fs.existsSync(MAC_ZIP_OUTPUT)) {
  fs.unlinkSync(MAC_ZIP_OUTPUT);
}

console.log('-> Copying macOS Electron app template...');
execSync(`cp -R "${MAC_TEMPLATE}" "${MAC_APP_OUTPUT}"`);

// Rename executable
const origExe = path.join(MAC_APP_OUTPUT, 'Contents', 'MacOS', 'Electron');
const targetExe = path.join(MAC_APP_OUTPUT, 'Contents', 'MacOS', 'NexusLab');
if (fs.existsSync(origExe)) {
  fs.renameSync(origExe, targetExe);
}

// Update Info.plist
console.log('-> Configuring application bundle Info.plist...');
const plistPath = path.join(MAC_APP_OUTPUT, 'Contents', 'Info.plist');
try {
  execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName NexusLab" "${plistPath}"`);
  execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleName NexusLab" "${plistPath}"`);
  execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.nexuslab.app" "${plistPath}"`);
  execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable NexusLab" "${plistPath}"`);
} catch (e) {
  console.warn('PlistBuddy notice:', e.message);
}

// Copy application icon
if (fs.existsSync('/tmp/NexusLab.icns')) {
  fs.copyFileSync('/tmp/NexusLab.icns', path.join(MAC_APP_OUTPUT, 'Contents', 'Resources', 'electron.icns'));
}

// Ensure app.asar exists or build it
let asarPath = path.join(DIST_DIR, 'NexusLab-Windows-x64', 'resources', 'app.asar');
if (!fs.existsSync(asarPath)) {
  console.log('-> Rebuilding app.asar...');
  const stagingDir = path.join(DIST_DIR, 'app_staging');
  fs.mkdirSync(stagingDir, { recursive: true });
  fs.readdirSync(APP_DIR).forEach(item => {
    if (item.endsWith('.html') || (item.endsWith('.js') && !item.startsWith('scripts'))) {
      fs.copyFileSync(path.join(APP_DIR, item), path.join(stagingDir, item));
    }
  });
  ['public', 'vendor'].forEach(dir => {
    const srcDir = path.join(APP_DIR, dir);
    if (fs.existsSync(srcDir)) fs.cpSync(srcDir, path.join(stagingDir, dir), { recursive: true });
  });
  ['package.json', 'electron-main.js', 'preload.js', 'icon.png'].forEach(file => {
    const src = path.join(APP_DIR, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(stagingDir, file));
  });
  asarPath = path.join(DIST_DIR, 'app.asar');
  execSync(`npx asar pack "${stagingDir}" "${asarPath}"`, {
    env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}` }
  });
  fs.rmSync(stagingDir, { recursive: true, force: true });
}

console.log('-> Injecting application payload into macOS bundle...');
const resDir = path.join(MAC_APP_OUTPUT, 'Contents', 'Resources');
const defaultAsar = path.join(resDir, 'default_app.asar');
if (fs.existsSync(defaultAsar)) {
  fs.unlinkSync(defaultAsar);
}
fs.copyFileSync(asarPath, path.join(resDir, 'app.asar'));

// Optimize bundle size (strip unnecessary Chromium locale folders)
const allowedLocales = ['en.lproj', 'Base.lproj'];
fs.readdirSync(resDir).forEach(item => {
  if (item.endsWith('.lproj') && !allowedLocales.includes(item)) {
    fs.rmSync(path.join(resDir, item), { recursive: true, force: true });
  }
});

// Compress into ZIP archive preserving macOS symlinks & metadata
console.log('-> Compressing NexusLab-macOS.zip with ditto...');
execSync(`ditto -c -k --sequesterRsrc "${MAC_APP_OUTPUT}" "${MAC_ZIP_OUTPUT}"`);

const zipSizeMB = (fs.statSync(MAC_ZIP_OUTPUT).size / (1024 * 1024)).toFixed(1);

console.log('==========================================');
console.log(' SUCCESS! macOS Application built:');
console.log(` - App Bundle: ${MAC_APP_OUTPUT}`);
console.log(` - ZIP Archive: ${MAC_ZIP_OUTPUT} (${zipSizeMB} MB)`);
console.log('==========================================');
