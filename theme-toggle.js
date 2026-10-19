/**
 * theme-toggle.js — Hệ Thống Chuyển Đổi Giao Diện Trắng / Đen & Trung Tâm Hiển Thị NexusLab
 * Hỗ trợ toàn bộ hệ thống NexusLab: Portal, 29 bài học mô phỏng, NexusLab Sandbox và Modal.
 * Cung cấp:
 *  - Chế độ Sáng Siêu Nét (Clean Light) & Tối Không Gian (Deep Cyber Dark)
 *  - Chế độ Chữ Siêu Đậm (Ultra Bold Contrast Engine) - Chữ ĐỀU ĐẬM, sắc nét trên cả 2 chế độ
 *  - Chế độ Lọc Ánh Sáng Xanh Bảo Vệ Mắt (Eye-Care Warm Light)
 *  - Bộ tổng hợp âm thanh tương tác xúc giác (Web Audio Sci-Fi Click)
 *  - Phím tắt Ctrl + M (hoặc ⌘ + M trên Mac) & Shift + T
 *  - Floating HUD Pill + Trung Tâm Điều Khiển Giao Diện Toàn Diện (Display Studio)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'nexus_theme';         // 'light' | 'dark' | 'system'
  const STORAGE_BOLD_KEY = 'nexus_bold_text'; // 'true' | 'false'
  const STORAGE_EYE_KEY = 'nexus_eye_care';   // 'true' | 'false'
  const STORAGE_SOUND_KEY = 'nexus_sound';    // 'true' | 'false'

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');
  const shortcutLabel = isMac ? '⌘M' : 'Ctrl+M';

  // 1. Quản lý trạng thái
  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    } catch (e) {}
    return 'light'; // Mặc định là 'light' (trắng)
  }

  function getSavedBold() {
    try {
      const saved = localStorage.getItem(STORAGE_BOLD_KEY);
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true; // Mặc định bật chữ siêu đậm theo yêu cầu người dùng
  }

  function getSavedEyeCare() {
    try {
      return localStorage.getItem(STORAGE_EYE_KEY) === 'true';
    } catch (e) {}
    return false;
  }

  function getSavedSound() {
    try {
      const saved = localStorage.getItem(STORAGE_SOUND_KEY);
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true;
  }

  let currentMode = getSavedTheme();      // 'light' | 'dark' | 'system'
  let isBoldActive = getSavedBold();
  let isEyeCareActive = getSavedEyeCare();
  let isSoundActive = getSavedSound();

  // Phát hiện theme hệ điều hành
  const systemDarkQuery = (typeof window !== 'undefined' && window.matchMedia)
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  function resolveEffectiveTheme(mode) {
    if (mode === 'system') {
      return (systemDarkQuery && systemDarkQuery.matches) ? 'dark' : 'light';
    }
    return mode === 'dark' ? 'dark' : 'light';
  }

  // Bộ tổng hợp âm thanh Web Audio API (Zero lag, không cần file ngoài)
  function playHapticSound(type) {
    if (!isSoundActive) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';

      if (type === 'light') {
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.07);
      } else if (type === 'dark') {
        osc.frequency.setValueAtTime(760, now);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.07);
      } else {
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.05);
      }

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // 2. Hàm áp dụng Theme chính
  function applyTheme(mode, save = true, playAudio = false) {
    currentMode = mode;
    if (save) {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch (e) {}
    }

    const effective = resolveEffectiveTheme(mode);
    const html = document.documentElement;
    const body = document.body;

    if (effective === 'dark') {
      html.classList.remove('light');
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
      if (body) {
        body.classList.remove('light');
        body.classList.add('dark');
        body.style.backgroundColor = '#050713';
        body.style.color = '#f8fafc';
      }
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      html.setAttribute('data-theme', 'light');
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
        body.style.backgroundColor = '#ffffff';
        body.style.color = '#020617';
      }
    }

    if (playAudio) {
      playHapticSound(effective);
    }

    // Cập nhật DOM các nút & modal
    updateThemeControlsUI();

    // Phát sự kiện thông báo để canvas / sandbox / biểu đồ vẽ lại
    try {
      window.dispatchEvent(new CustomEvent('nexusThemeChanged', {
        detail: {
          theme: effective,
          mode: mode
        }
      }));
    } catch (e) {}
  }

  // 3. Tùy chỉnh Độ đậm chữ (Bold Contrast)
  function setBoldContrast(enabled, save = true) {
    isBoldActive = !!enabled;
    if (save) {
      try {
        localStorage.setItem(STORAGE_BOLD_KEY, isBoldActive ? 'true' : 'false');
      } catch (e) {}
    }
    const html = document.documentElement;
    if (isBoldActive) {
      html.classList.add('bold-contrast');
    } else {
      html.classList.remove('bold-contrast');
    }
    const toggleInput = document.getElementById('nexusToggleBoldText');
    if (toggleInput) toggleInput.checked = isBoldActive;
  }

  // 4. Chế độ Chăm Sóc Mắt (Eye-Care Light)
  function setEyeCare(enabled, save = true) {
    isEyeCareActive = !!enabled;
    if (save) {
      try {
        localStorage.setItem(STORAGE_EYE_KEY, isEyeCareActive ? 'true' : 'false');
      } catch (e) {}
    }
    const html = document.documentElement;
    if (isEyeCareActive) {
      html.classList.add('nexus-eye-care');
    } else {
      html.classList.remove('nexus-eye-care');
    }
    const toggleInput = document.getElementById('nexusToggleEyeCare');
    if (toggleInput) toggleInput.checked = isEyeCareActive;
  }

  // 5. Âm thanh phản hồi
  function setSoundActive(enabled, save = true) {
    isSoundActive = !!enabled;
    if (save) {
      try {
        localStorage.setItem(STORAGE_SOUND_KEY, isSoundActive ? 'true' : 'false');
      } catch (e) {}
    }
    const toggleInput = document.getElementById('nexusToggleSound');
    if (toggleInput) toggleInput.checked = isSoundActive;
  }

  // Đảo nhanh giữa Trắng & Đen
  function toggleTheme() {
    const effective = resolveEffectiveTheme(currentMode);
    const nextMode = effective === 'dark' ? 'light' : 'dark';
    applyTheme(nextMode, true, true);
  }

  // Lắng nghe thay đổi theme từ hệ thống nếu đang ở chế độ 'system'
  if (systemDarkQuery) {
    try {
      systemDarkQuery.addEventListener('change', () => {
        if (currentMode === 'system') {
          applyTheme('system', false, false);
        }
      });
    } catch (e) {}
  }

  // Khởi động các class ban đầu ngay trên <html>
  applyTheme(currentMode, false, false);
  setBoldContrast(isBoldActive, false);
  setEyeCare(isEyeCareActive, false);

  // 6. Tiêm bộ CSS chuẩn hóa toàn diện & đồng bộ cho cả 2 chế độ
  function injectThemeStyles() {
    if (document.getElementById('nexus-theme-unified-css')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'nexus-theme-unified-css';
    styleEl.innerHTML = `
      /* ========================================================
         NEXUSLAB MASTER THEME ENGINE (Trắng / Đen Siêu Đậm & Tương Phản)
         ======================================================== */

      /* CHẾ ĐỘ TRẮNG (LIGHT MODE) - ĐẬM ĐÀ, RÕ RÀNG, SẮC SẢO */
      html.light, html.light body {
        background-color: #ffffff !important;
        color: #020617 !important;
      }
      html.light h1, html.light h2, html.light h3, html.light h4, html.light h5, html.light h6 {
        color: #020617 !important;
        font-weight: 800 !important;
        letter-spacing: -0.015em;
      }
      html.light p, html.light span, html.light li, html.light label {
        color: inherit;
      }
      html.light .text-white,
      html.light .text-slate-100,
      html.light .text-slate-200 {
        color: #020617 !important;
        font-weight: 700 !important;
      }
      html.light .text-slate-300,
      html.light .text-slate-400 {
        color: #1e293b !important;
        font-weight: 600 !important;
      }
      html.light .text-slate-500,
      html.light .text-slate-600 {
        color: #334155 !important;
        font-weight: 600 !important;
      }
      html.light .glass-panel,
      html.light .glass-card,
      html.light .glass-box,
      html.light .glass-nav {
        background-color: #ffffff !important;
        border-color: #cbd5e1 !important;
        color: #020617 !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
      }
      html.light .bg-slate-900,
      html.light .bg-slate-950,
      html.light .bg-cyberDark,
      html.light .bg-physicsDark,
      html.light .bg-chemDark,
      html.light .bg-bioDark {
        background-color: #ffffff !important;
        color: #020617 !important;
        border-color: #cbd5e1 !important;
      }
      html.light .bg-slate-900\\/90,
      html.light .bg-slate-900\\/80,
      html.light .bg-slate-950\\/90,
      html.light .bg-slate-950\\/80,
      html.light .bg-slate-900\\/50,
      html.light .bg-slate-900\\/60,
      html.light .bg-slate-900\\/40 {
        background-color: rgba(255, 255, 255, 0.96) !important;
        color: #020617 !important;
        border-color: #cbd5e1 !important;
      }
      html.light .bg-slate-800,
      html.light .bg-slate-850,
      html.light .bg-physicsSurface,
      html.light .bg-chemSurface,
      html.light .bg-bioSurface {
        background-color: #f8fafc !important;
        color: #020617 !important;
        border-color: #cbd5e1 !important;
      }
      html.light .bg-slate-800\\/80,
      html.light .bg-slate-800\\/50 {
        background-color: rgba(248, 250, 252, 0.95) !important;
        color: #020617 !important;
        border-color: #cbd5e1 !important;
      }
      html.light .border-slate-800,
      html.light .border-slate-700,
      html.light .border-slate-700\\/60,
      html.light .border-white\\/10,
      html.light .border-white\\/15,
      html.light .border-white\\/5,
      html.light .border-physicsBorder,
      html.light .border-chemBorder,
      html.light .border-bioBorder {
        border-color: #cbd5e1 !important;
      }
      html.light input:not([type="checkbox"]):not([type="radio"]),
      html.light select,
      html.light textarea,
      html.light .glass-input {
        background-color: #ffffff !important;
        color: #020617 !important;
        border-color: #94a3b8 !important;
        font-weight: 600 !important;
      }
      html.light .cyber-grid,
      html.light .quantum-grid,
      html.light .chem-grid,
      html.light .bio-grid {
        background-color: #ffffff !important;
        background-size: 32px 32px !important;
        background-image: radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px) !important;
      }

      /* CHẾ ĐỘ ĐEN (DARK MODE) - TRẮNG SÁNG ĐẬM, SẮC NÉT, TINH TẾ */
      html.dark, html.dark body {
        background-color: #050713 !important;
        color: #f8fafc !important;
      }
      html.dark h1, html.dark h2, html.dark h3, html.dark h4, html.dark h5, html.dark h6 {
        color: #ffffff !important;
        font-weight: 800 !important;
        letter-spacing: -0.015em;
      }
      html.dark p, html.dark span, html.dark li, html.dark label {
        color: inherit;
      }
      html.dark .text-white,
      html.dark .text-slate-100,
      html.dark .text-slate-200 {
        color: #ffffff !important;
        font-weight: 700 !important;
      }
      html.dark .text-slate-300,
      html.dark .text-slate-400 {
        color: #e2e8f0 !important;
        font-weight: 600 !important;
      }
      html.dark .text-slate-500,
      html.dark .text-slate-600 {
        color: #cbd5e1 !important;
        font-weight: 600 !important;
      }
      html.dark .text-slate-900,
      html.dark .text-slate-800,
      html.dark .text-slate-700 {
        color: #f8fafc !important;
      }
      html.dark .glass-panel,
      html.dark .glass-card,
      html.dark .glass-box,
      html.dark .glass-nav {
        background-color: rgba(11, 15, 36, 0.88) !important;
        border-color: rgba(0, 242, 254, 0.25) !important;
        color: #f8fafc !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7) !important;
      }
      html.dark .bg-slate-900,
      html.dark .bg-slate-950,
      html.dark .bg-cyberDark,
      html.dark .bg-physicsDark,
      html.dark .bg-chemDark,
      html.dark .bg-bioDark {
        background-color: #070b1a !important;
        color: #f8fafc !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
      }
      html.dark .bg-slate-900\\/90,
      html.dark .bg-slate-900\\/80,
      html.dark .bg-slate-950\\/90,
      html.dark .bg-slate-950\\/80,
      html.dark .bg-slate-900\\/50,
      html.dark .bg-slate-900\\/60,
      html.dark .bg-slate-900\\/40 {
        background-color: rgba(7, 11, 26, 0.92) !important;
        color: #f8fafc !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
      }
      html.dark .bg-slate-800,
      html.dark .bg-slate-850,
      html.dark .bg-physicsSurface,
      html.dark .bg-chemSurface,
      html.dark .bg-bioSurface,
      html.dark .bg-slate-50,
      html.dark .bg-slate-100,
      html.dark .bg-slate-200 {
        background-color: #0f172a !important;
        color: #f8fafc !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
      }
      html.dark .bg-white,
      html.dark .bg-white\/90,
      html.dark .bg-white\/95 {
        background-color: #090e24 !important;
        color: #f8fafc !important;
        border-color: rgba(255, 255, 255, 0.14) !important;
      }
      html.dark .bg-slate-800\\/80,
      html.dark .bg-slate-800\\/50 {
        background-color: rgba(15, 23, 42, 0.85) !important;
        color: #f8fafc !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
      }
      html.dark .border-slate-800,
      html.dark .border-slate-700,
      html.dark .border-slate-700\\/60,
      html.dark .border-white\\/10,
      html.dark .border-white\\/15,
      html.dark .border-white\\/5,
      html.dark .border-physicsBorder,
      html.dark .border-chemBorder,
      html.dark .border-bioBorder,
      html.dark .border-slate-200,
      html.dark .border-slate-300 {
        border-color: rgba(255, 255, 255, 0.14) !important;
      }
      html.dark input:not([type="checkbox"]):not([type="radio"]),
      html.dark select,
      html.dark textarea,
      html.dark .glass-input {
        background-color: #080d20 !important;
        color: #ffffff !important;
        border-color: #334155 !important;
        font-weight: 600 !important;
      }
      html.dark .cyber-grid,
      html.dark .quantum-grid,
      html.dark .chem-grid,
      html.dark .bio-grid {
        background-color: #050713 !important;
        background-size: 32px 32px !important;
        background-image: radial-gradient(circle, rgba(0, 242, 254, 0.18) 1.2px, transparent 1.2px) !important;
      }

      /* TĂNG CƯỜNG ĐỘ ĐẬM VĂN BẢN (BOLD CONTRAST ENGINE) */
      html.bold-contrast body,
      html.bold-contrast * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      html.bold-contrast h1, html.bold-contrast h2, html.bold-contrast h3,
      html.bold-contrast h4, html.bold-contrast h5, html.bold-contrast h6 {
        font-weight: 900 !important;
      }
      html.bold-contrast .font-bold,
      html.bold-contrast .font-extrabold,
      html.bold-contrast strong,
      html.bold-contrast b {
        font-weight: 900 !important;
      }
      html.bold-contrast p,
      html.bold-contrast span,
      html.bold-contrast div,
      html.bold-contrast li,
      html.bold-contrast button,
      html.bold-contrast a {
        font-weight: 600;
      }
      html.bold-contrast .text-xs,
      html.bold-contrast .text-sm {
        font-weight: 600 !important;
      }

      /* CHẾ ĐỘ BẢO VỆ MẮT (EYE-CARE WARM LIGHT) */
      html.nexus-eye-care body {
        filter: sepia(0.2) saturate(0.95) hue-rotate(-8deg);
      }
      #nexusThemeFloatContainer, #nexusDisplayCenterModal {
        filter: none !important;
      }

      /* QUIZ MODAL STYLING */
      html.dark .nexus-quiz-card {
        background: #090e24 !important;
        color: #ffffff !important;
        border: 1px solid rgba(0, 242, 254, 0.4) !important;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 242, 254, 0.25) !important;
      }
      html.dark .nexus-option-btn {
        background: #0d1430 !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
        font-weight: 600 !important;
      }
      html.dark .nexus-option-btn:hover {
        background: #1a254c !important;
        border-color: #38bdf8 !important;
        color: #38bdf8 !important;
      }
      html.dark .nexus-option-btn.selected {
        background: #1e3a8a !important;
        color: #ffffff !important;
        border-color: #60a5fa !important;
        box-shadow: 0 0 15px rgba(96, 165, 250, 0.3) !important;
      }
      html.light .nexus-quiz-card {
        background: #ffffff !important;
        color: #020617 !important;
        border: 1px solid #cbd5e1 !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2) !important;
      }
      html.light .nexus-option-btn {
        background: #f8fafc !important;
        color: #020617 !important;
        border-color: #cbd5e1 !important;
        font-weight: 600 !important;
      }
      html.light .nexus-option-btn:hover {
        background: #f1f5f9 !important;
        border-color: #2563eb !important;
        color: #2563eb !important;
      }
      html.light .nexus-option-btn.selected {
        background: #eff6ff !important;
        color: #1d4ed8 !important;
        border-color: #3b82f6 !important;
      }

      /* ========================================================
         FLOATING ACTION CAPSULE (HUD CONTROLLER)
         ======================================================== */
      #nexusThemeFloatContainer {
        position: fixed;
        bottom: 22px;
        left: 22px;
        z-index: 99999;
        display: flex;
        align-items: center;
        user-select: none;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      .nexus-theme-pill {
        display: inline-flex;
        align-items: center;
        border-radius: 9999px;
        padding: 4px;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }
      html.light .nexus-theme-pill {
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #cbd5e1;
        box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.15), 0 0 0 1px #f1f5f9;
        color: #020617;
      }
      html.light .nexus-theme-pill:hover {
        border-color: #2563eb;
        box-shadow: 0 14px 35px -5px rgba(37, 99, 235, 0.25);
        transform: translateY(-2px);
      }
      html.dark .nexus-theme-pill {
        background: rgba(11, 18, 42, 0.94);
        border: 2px solid #00f2fe;
        box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 242, 254, 0.35);
        color: #f8fafc;
      }
      html.dark .nexus-theme-pill:hover {
        border-color: #38bdf8;
        box-shadow: 0 14px 35px -5px rgba(0, 242, 254, 0.55);
        transform: translateY(-2px);
      }

      .nexus-pill-toggle-btn {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 5px 11px;
        border-radius: 9999px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        font-family: inherit;
        font-size: 12px;
        font-weight: 800;
        transition: all 0.2s ease;
      }
      .nexus-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .nexus-theme-pill:hover .nexus-icon-wrapper {
        transform: rotate(20deg) scale(1.1);
      }
      .nexus-pill-kbd {
        font-size: 9px;
        font-family: ui-monospace, monospace;
        font-weight: 700;
        padding: 2px 5px;
        border-radius: 6px;
        letter-spacing: 0.05em;
      }
      html.light .nexus-pill-kbd {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
      }
      html.dark .nexus-pill-kbd {
        background: rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .nexus-pill-divider {
        width: 1px;
        height: 18px;
        margin: 0 2px;
      }
      html.light .nexus-pill-divider {
        background: #e2e8f0;
      }
      html.dark .nexus-pill-divider {
        background: rgba(255, 255, 255, 0.18);
      }

      .nexus-pill-settings-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        transition: all 0.2s ease;
      }
      html.light .nexus-pill-settings-btn:hover {
        background: #f1f5f9;
        color: #2563eb;
      }
      html.dark .nexus-pill-settings-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #00f2fe;
      }

      /* ========================================================
         TRUNG TÂM ĐIỀU KHIỂN GIAO DIỆN (DISPLAY STUDIO MODAL)
         ======================================================== */
      #nexusDisplayCenterModal {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        padding: 20px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.25s ease;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      #nexusDisplayCenterModal.nexus-modal-active {
        pointer-events: auto;
        opacity: 1;
      }
      .nexus-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(2, 6, 23, 0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      .nexus-modal-card {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 440px;
        margin-bottom: 50px;
        border-radius: 24px;
        padding: 22px;
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        transform: translateY(15px) scale(0.96);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #nexusDisplayCenterModal.nexus-modal-active .nexus-modal-card {
        transform: translateY(0) scale(1);
      }
      html.light .nexus-modal-card {
        background: #ffffff;
        border: 2px solid #cbd5e1;
        box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px #e2e8f0;
        color: #020617;
      }
      html.dark .nexus-modal-card {
        background: #090e24;
        border: 2px solid rgba(0, 242, 254, 0.4);
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 242, 254, 0.25);
        color: #f8fafc;
      }

      .nexus-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid;
      }
      html.light .nexus-modal-header {
        border-color: #e2e8f0;
      }
      html.dark .nexus-modal-header {
        border-color: rgba(255, 255, 255, 0.1);
      }
      .nexus-modal-title-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .nexus-modal-badge {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }
      html.light .nexus-modal-badge {
        background: #eff6ff;
        color: #2563eb;
        border: 1px solid #bfdbfe;
      }
      html.dark .nexus-modal-badge {
        background: rgba(0, 242, 254, 0.15);
        color: #00f2fe;
        border: 1px solid rgba(0, 242, 254, 0.3);
      }
      .nexus-modal-title {
        font-size: 15px;
        font-weight: 800;
        line-height: 1.2;
      }
      .nexus-modal-subtitle {
        font-size: 11px;
        font-weight: 600;
        opacity: 0.75;
        margin-top: 2px;
      }
      .nexus-modal-close-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: inherit;
        opacity: 0.65;
        transition: opacity 0.2s;
      }
      .nexus-modal-close-btn:hover {
        opacity: 1;
      }

      .nexus-modal-section {
        margin-bottom: 16px;
      }
      .nexus-section-label {
        display: block;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 8px;
        opacity: 0.7;
      }

      .nexus-theme-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .nexus-theme-opt-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 10px 6px;
        border-radius: 14px;
        cursor: pointer;
        border: 2px solid transparent;
        background: transparent;
        color: inherit;
        position: relative;
        transition: all 0.2s ease;
      }
      html.light .nexus-theme-opt-btn {
        background: #f8fafc;
        border-color: #e2e8f0;
      }
      html.light .nexus-theme-opt-btn:hover {
        border-color: #2563eb;
        background: #f1f5f9;
      }
      html.light .nexus-theme-opt-btn.active {
        background: #eff6ff;
        border-color: #2563eb;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.15);
      }
      html.dark .nexus-theme-opt-btn {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.1);
      }
      html.dark .nexus-theme-opt-btn:hover {
        border-color: #00f2fe;
        background: #141f3d;
      }
      html.dark .nexus-theme-opt-btn.active {
        background: rgba(0, 242, 254, 0.12);
        border-color: #00f2fe;
        box-shadow: 0 0 15px rgba(0, 242, 254, 0.25);
      }
      .nexus-theme-opt-icon {
        font-size: 20px;
        margin-bottom: 4px;
      }
      .nexus-theme-opt-name {
        font-size: 11px;
        font-weight: 800;
        display: block;
      }
      .nexus-theme-opt-desc {
        display: none;
      }
      .nexus-check-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 900;
      }
      .nexus-theme-opt-btn.active .nexus-check-badge {
        display: flex;
      }
      html.light .nexus-check-badge {
        background: #2563eb;
        color: #ffffff;
      }
      html.dark .nexus-check-badge {
        background: #00f2fe;
        color: #040817;
      }

      .nexus-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-radius: 14px;
        margin-bottom: 8px;
        transition: background-color 0.2s;
      }
      html.light .nexus-toggle-row {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
      }
      html.dark .nexus-toggle-row {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .nexus-toggle-info {
        display: flex;
        flex-direction: column;
        padding-right: 12px;
      }
      .nexus-toggle-title {
        font-size: 12px;
        font-weight: 800;
      }
      .nexus-toggle-desc {
        font-size: 10px;
        font-weight: 600;
        opacity: 0.7;
        margin-top: 2px;
        line-height: 1.35;
      }

      /* iOS Style Toggle Switch */
      .nexus-switch {
        position: relative;
        display: inline-block;
        width: 42px;
        height: 24px;
        flex-shrink: 0;
      }
      .nexus-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .nexus-slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background-color: #cbd5e1;
        transition: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: 9999px;
      }
      html.dark .nexus-slider {
        background-color: #334155;
      }
      .nexus-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      input:checked + .nexus-slider {
        background-color: #2563eb;
      }
      html.dark input:checked + .nexus-slider {
        background-color: #00f2fe;
      }
      input:checked + .nexus-slider:before {
        transform: translateX(18px);
      }
      html.dark input:checked + .nexus-slider:before {
        background-color: #040817;
      }

      .nexus-modal-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid;
      }
      html.light .nexus-modal-footer {
        border-color: #e2e8f0;
      }
      html.dark .nexus-modal-footer {
        border-color: rgba(255, 255, 255, 0.1);
      }
      .nexus-footer-sync-info {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        font-weight: 700;
        opacity: 0.8;
      }
      .nexus-sync-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pulse 2s infinite;
      }
      .nexus-footer-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .nexus-footer-reset-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 8px;
        border-radius: 8px;
        color: inherit;
        opacity: 0.65;
        transition: all 0.2s;
      }
      .nexus-footer-reset-btn:hover {
        opacity: 1;
      }
      .nexus-footer-done-btn {
        padding: 6px 14px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 800;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
      }
      html.light .nexus-footer-done-btn {
        background: #020617;
        color: #ffffff;
      }
      html.light .nexus-footer-done-btn:hover {
        background: #1e293b;
      }
      html.dark .nexus-footer-done-btn {
        background: #00f2fe;
        color: #040817;
      }
      html.dark .nexus-footer-done-btn:hover {
        background: #38bdf8;
      }

      /* ========================================================
         NAVBAR HEADER INTEGRATION BUTTONS
         ======================================================== */
      .nexus-theme-nav-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      }
      html.light .nexus-theme-nav-btn {
        background: #f1f5f9;
        color: #020617;
        border: 1.5px solid #cbd5e1;
      }
      html.light .nexus-theme-nav-btn:hover {
        background: #e2e8f0;
        border-color: #2563eb;
        color: #2563eb;
      }
      html.dark .nexus-theme-nav-btn {
        background: rgba(15, 23, 42, 0.85);
        color: #f8fafc;
        border: 1.5px solid rgba(0, 242, 254, 0.4);
      }
      html.dark .nexus-theme-nav-btn:hover {
        background: rgba(30, 41, 59, 0.95);
        border-color: #00f2fe;
        color: #00f2fe;
      }

      @media (max-width: 640px) {
        #nexusThemeFloatContainer {
          bottom: 16px;
          left: 16px;
        }
        .nexus-modal-card {
          margin-bottom: 20px;
          padding: 18px;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 7. Cập nhật giao diện toàn bộ các nút & modal
  function updateThemeControlsUI() {
    const effective = resolveEffectiveTheme(currentMode);
    const isDark = effective === 'dark';

    // SVG icon mặt trời
    const sunSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
      </svg>
    `;

    // SVG icon mặt trăng sao
    const moonSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      </svg>
    `;

    // A. Cập nhật Floating HUD
    const iconWrapper = document.getElementById('nexusThemeIconWrapper');
    if (iconWrapper) {
      iconWrapper.innerHTML = isDark ? moonSvg : sunSvg;
    }
    const pillLabel = document.getElementById('nexusPillLabel');
    if (pillLabel) {
      pillLabel.innerText = isDark ? 'Tối Đậm' : 'Sáng Đậm';
    }
    const pillKbd = document.getElementById('nexusPillKbd');
    if (pillKbd) {
      pillKbd.innerText = shortcutLabel;
    }

    // B. Cập nhật Navbar buttons
    const navBtns = document.querySelectorAll('.nexus-theme-nav-btn');
    navBtns.forEach(btn => {
      btn.innerHTML = `
        <span>${isDark ? '🌙 Tối Đậm' : '☀️ Sáng Đậm'}</span>
      `;
      btn.title = `Chuyển sang chế độ ${isDark ? 'Sáng' : 'Tối'} (${shortcutLabel})`;
    });

    // C. Cập nhật Sandbox headers
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    if (themeIcon) {
      themeIcon.className = isDark ? 'fa-solid fa-moon text-amber-400' : 'fa-solid fa-sun text-amber-500';
    }
    if (themeLabel) {
      themeLabel.innerText = isDark ? 'Giao diện: Đen' : 'Giao diện: Trắng';
    }

    // D. Cập nhật Modal options
    const themeOptBtns = document.querySelectorAll('.nexus-theme-opt-btn');
    themeOptBtns.forEach(btn => {
      const mode = btn.getAttribute('data-theme-mode');
      if (mode === currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Mở / Đóng Modal Display Center
  function openDisplayModal() {
    const modal = document.getElementById('nexusDisplayCenterModal');
    if (modal) {
      modal.classList.add('nexus-modal-active');
      playHapticSound('neutral');
    }
  }

  function closeDisplayModal() {
    const modal = document.getElementById('nexusDisplayCenterModal');
    if (modal) {
      modal.classList.remove('nexus-modal-active');
    }
  }

  function toggleDisplayModal() {
    const modal = document.getElementById('nexusDisplayCenterModal');
    if (modal && modal.classList.contains('nexus-modal-active')) {
      closeDisplayModal();
    } else {
      openDisplayModal();
    }
  }

  // 8. Khởi tạo cấu trúc DOM hoàn chỉnh
  function initThemeDOM() {
    injectThemeStyles();

    // 8A. Tạo Floating HUD Pill
    if (!document.getElementById('nexusThemeFloatContainer')) {
      const container = document.createElement('div');
      container.id = 'nexusThemeFloatContainer';
      container.innerHTML = `
        <div class="nexus-theme-pill" title="Nhấp chuyển đổi Sáng / Tối (${shortcutLabel})">
          <button type="button" id="nexusQuickToggleBtn" class="nexus-pill-toggle-btn">
            <span class="nexus-icon-wrapper" id="nexusThemeIconWrapper"></span>
            <span class="nexus-pill-label" id="nexusPillLabel"></span>
            <kbd class="nexus-pill-kbd" id="nexusPillKbd">${shortcutLabel}</kbd>
          </button>
          <div class="nexus-pill-divider"></div>
          <button type="button" id="nexusDetailOpenBtn" class="nexus-pill-settings-btn" title="Cài đặt giao diện & chi tiết hiển thị">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      `;
      document.body.appendChild(container);

      document.getElementById('nexusQuickToggleBtn').addEventListener('click', toggleTheme);
      document.getElementById('nexusDetailOpenBtn').addEventListener('click', toggleDisplayModal);
    }

    // 8B. Tạo Modal Trung Tâm Điều Khiển Giao Diện
    if (!document.getElementById('nexusDisplayCenterModal')) {
      const modal = document.createElement('div');
      modal.id = 'nexusDisplayCenterModal';
      modal.innerHTML = `
        <div class="nexus-modal-backdrop" id="nexusModalBackdrop"></div>
        <div class="nexus-modal-card">
          <!-- Header -->
          <div class="nexus-modal-header">
            <div class="nexus-modal-title-group">
              <div class="nexus-modal-badge">🎨</div>
              <div>
                <h3 class="nexus-modal-title">Trung Tâm Hiển Thị & Giao Diện</h3>
                <p class="nexus-modal-subtitle">Tùy biến độ đậm chữ, tương phản và màu sắc NexusLab</p>
              </div>
            </div>
            <button type="button" class="nexus-modal-close-btn" id="nexusModalCloseBtn">&times;</button>
          </div>

          <!-- Body -->
          <div class="nexus-modal-body">
            <!-- 1. Chọn Theme -->
            <div class="nexus-modal-section">
              <label class="nexus-section-label">CHẾ ĐỘ NỀN & MÀU SẮC</label>
              <div class="nexus-theme-grid">
                <button type="button" class="nexus-theme-opt-btn" data-theme-mode="light">
                  <div class="nexus-theme-opt-icon">☀️</div>
                  <span class="nexus-theme-opt-name">Sáng Siêu Nét</span>
                  <div class="nexus-check-badge">&#10003;</div>
                </button>

                <button type="button" class="nexus-theme-opt-btn" data-theme-mode="dark">
                  <div class="nexus-theme-opt-icon">🌙</div>
                  <span class="nexus-theme-opt-name">Tối Không Gian</span>
                  <div class="nexus-check-badge">&#10003;</div>
                </button>

                <button type="button" class="nexus-theme-opt-btn" data-theme-mode="system">
                  <div class="nexus-theme-opt-icon">💻</div>
                  <span class="nexus-theme-opt-name">Theo Thiết Bị</span>
                  <div class="nexus-check-badge">&#10003;</div>
                </button>
              </div>
            </div>

            <!-- 2. Độ Đậm Chữ -->
            <div class="nexus-modal-section">
              <label class="nexus-section-label">ĐỘ TƯƠNG PHẢN & PHÔNG CHỮ</label>
              <div class="nexus-toggle-row">
                <div class="nexus-toggle-info">
                  <span class="nexus-toggle-title">🔤 Chữ Siêu Đậm (Ultra Bold Contrast)</span>
                  <span class="nexus-toggle-desc">Làm đậm toàn bộ tiêu đề, nội dung và công thức toán học, cực kỳ sắc nét và dễ đọc.</span>
                </div>
                <label class="nexus-switch">
                  <input type="checkbox" id="nexusToggleBoldText">
                  <span class="nexus-slider"></span>
                </label>
              </div>
            </div>

            <!-- 3. Tiện ích học tập -->
            <div class="nexus-modal-section">
              <label class="nexus-section-label">TIỆN ÍCH HỌC TẬP</label>
              <div class="nexus-toggle-row">
                <div class="nexus-toggle-info">
                  <span class="nexus-toggle-title">👁️ Lọc Ánh Sáng Xanh (Bảo Vệ Mắt)</span>
                  <span class="nexus-toggle-desc">Tông màu ấm dịu mắt, chống mỏi mắt khi học tập và nghiên cứu thí nghiệm ban đêm.</span>
                </div>
                <label class="nexus-switch">
                  <input type="checkbox" id="nexusToggleEyeCare">
                  <span class="nexus-slider"></span>
                </label>
              </div>

              <div class="nexus-toggle-row">
                <div class="nexus-toggle-info">
                  <span class="nexus-toggle-title">🔊 Âm Thanh Phản Hồi (Sci-Fi Audio)</span>
                  <span class="nexus-toggle-desc">Âm thanh click cơ học nhẹ nhàng khi thao tác chuyển đổi giao diện.</span>
                </div>
                <label class="nexus-switch">
                  <input type="checkbox" id="nexusToggleSound">
                  <span class="nexus-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="nexus-modal-footer">
            <div class="nexus-footer-sync-info">
              <span class="nexus-sync-dot"></span>
              <span>Đồng bộ 29 bài SGK & 3 Sandbox</span>
            </div>
            <div class="nexus-footer-actions">
              <button type="button" class="nexus-footer-reset-btn" id="nexusResetThemeSettingsBtn">Mặc Định</button>
              <button type="button" class="nexus-footer-done-btn" id="nexusDoneThemeBtn">Hoàn Tất</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Gắn sự kiện đóng modal
      document.getElementById('nexusModalBackdrop').addEventListener('click', closeDisplayModal);
      document.getElementById('nexusModalCloseBtn').addEventListener('click', closeDisplayModal);
      document.getElementById('nexusDoneThemeBtn').addEventListener('click', closeDisplayModal);

      // Reset mặc định
      document.getElementById('nexusResetThemeSettingsBtn').addEventListener('click', () => {
        applyTheme('light', true, true);
        setBoldContrast(true, true);
        setEyeCare(false, true);
        setSoundActive(true, true);
      });

      // Tùy chọn Theme 3 nút
      const themeBtns = modal.querySelectorAll('.nexus-theme-opt-btn');
      themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-theme-mode');
          applyTheme(mode, true, true);
        });
      });

      // Switch Chữ Siêu Đậm
      const boldSwitch = document.getElementById('nexusToggleBoldText');
      boldSwitch.checked = isBoldActive;
      boldSwitch.addEventListener('change', (e) => {
        setBoldContrast(e.target.checked, true);
        playHapticSound('neutral');
      });

      // Switch Chăm Sóc Mắt
      const eyeSwitch = document.getElementById('nexusToggleEyeCare');
      eyeSwitch.checked = isEyeCareActive;
      eyeSwitch.addEventListener('change', (e) => {
        setEyeCare(e.target.checked, true);
        playHapticSound('neutral');
      });

      // Switch Âm Thanh
      const soundSwitch = document.getElementById('nexusToggleSound');
      soundSwitch.checked = isSoundActive;
      soundSwitch.addEventListener('change', (e) => {
        setSoundActive(e.target.checked, true);
        if (e.target.checked) playHapticSound('neutral');
      });
    }

    // 8C. Bổ sung nút vào .nexus-theme-nav-slot trên Header
    const navSlots = document.querySelectorAll('.nexus-theme-nav-slot');
    navSlots.forEach(slot => {
      if (!slot.querySelector('.nexus-theme-nav-btn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nexus-theme-nav-btn';
        btn.onclick = toggleTheme;
        slot.appendChild(btn);
      }
    });

    // 8D. Lắng nghe phím tắt Ctrl + M (⌘ + M trên Mac) và Shift + T
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDisplayModal();
        return;
      }
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if ((isCmdOrCtrl && e.key.toLowerCase() === 'm') || (e.shiftKey && e.key.toLowerCase() === 't')) {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        toggleTheme();
      }
    });

    // Cập nhật giao diện toàn diện
    updateThemeControlsUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeDOM);
  } else {
    initThemeDOM();
  }

  // 9. Export API toàn cục
  window.NexusTheme = {
    get: () => currentMode,
    getEffective: () => resolveEffectiveTheme(currentMode),
    set: (mode) => applyTheme(mode, true, true),
    toggle: toggleTheme,
    setBold: (val) => setBoldContrast(val, true),
    setEyeCare: (val) => setEyeCare(val, true),
    setSound: (val) => setSoundActive(val, true),
    openSettings: openDisplayModal,
    closeSettings: closeDisplayModal
  };

})();
