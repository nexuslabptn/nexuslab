/**
 * lab-controls.js — Shared Start/Pause + Reset dock for every NexusLab simulation page.
 *
 * WHY THIS WORKS FOR ALL LABS WITHOUT TOUCHING THEIR CODE
 * -------------------------------------------------------
 * Every lab animates through window.requestAnimationFrame (verified: no lab uses setInterval).
 * This script must be loaded in <head> BEFORE the lab's own scripts. It wraps:
 *   1. requestAnimationFrame  -> while paused, frame callbacks are queued instead of executed,
 *                                so every RAF-driven loop freezes exactly where it is.
 *   2. performance.now()      -> returns a "virtual clock" that stops while paused, and RAF
 *                                timestamps are shifted by the same offset. Labs that compute
 *                                dt = now - last therefore do NOT see a huge time jump on resume.
 *   3. CSS animations         -> paused via a class on <html>.
 *
 * Reset performs a clean page reload (the only way to guarantee that every canvas, slider,
 * table and internal variable returns to its initial configuration) and restores scroll
 * position. A second click within 2.5 s is required so recorded data is not lost by accident.
 *
 * Opt-out: pages with their own native controls can set <html data-lab-controls="native">.
 * Keyboard: P = pause/resume, Shift+R = reset (ignored while typing in form fields).
 */
(function () {
    'use strict';
    if (window.__nexusLabControls) return;
    window.__nexusLabControls = true;

    var htmlEl = document.documentElement;
    if (htmlEl.getAttribute('data-lab-controls') === 'native') return;

    // ------------------------------------------------------------------
    // 1. Virtual clock + RAF wrapper
    // ------------------------------------------------------------------
    var nativeRAF = window.requestAnimationFrame.bind(window);
    var nativeCAF = window.cancelAnimationFrame.bind(window);
    var nativeNow = performance.now.bind(performance);

    var paused = false;
    var pauseStartedAt = 0;   // native time when the current pause began
    var pausedTotal = 0;      // accumulated paused duration (ms)
    var queued = new Map();   // virtualId -> callback (callbacks requested while paused)
    var nextVirtualId = 1e9;  // far above native RAF ids to avoid collisions

    function virtualNow() {
        var now = nativeNow();
        var currentPause = paused ? (now - pauseStartedAt) : 0;
        return now - pausedTotal - currentPause;
    }

    // Schedule through the native RAF, shifting the timestamp onto the virtual clock.
    function scheduleNative(cb) {
        return nativeRAF(function (ts) { cb(ts - pausedTotal); });
    }

    window.requestAnimationFrame = function (cb) {
        if (typeof cb !== 'function') return 0;
        if (paused) {
            var id = nextVirtualId++;
            queued.set(id, cb);
            return id;
        }
        return scheduleNative(cb);
    };

    window.cancelAnimationFrame = function (id) {
        if (queued.has(id)) { queued.delete(id); return; }
        nativeCAF(id);
    };

    try {
        performance.now = virtualNow;
    } catch (e) {
        /* Extremely old browsers: performance.now not writable — RAF timestamps are still shifted. */
    }

    function setPaused(next) {
        if (next === paused) return;
        if (next) {
            paused = true;
            pauseStartedAt = nativeNow();
            htmlEl.classList.add('lab-paused');
        } else {
            pausedTotal += nativeNow() - pauseStartedAt;
            paused = false;
            htmlEl.classList.remove('lab-paused');
            // Flush every frame callback that was requested during the pause.
            var pending = Array.from(queued.values());
            queued.clear();
            pending.forEach(scheduleNative);
        }
        renderDock();
    }

    // ------------------------------------------------------------------
    // 2. Reset (clean reload with scroll restore)
    // ------------------------------------------------------------------
    var SCROLL_KEY = 'nexusLabScroll:' + location.pathname;
    var resetArmedUntil = 0;

    function requestReset() {
        var now = Date.now();
        if (now > resetArmedUntil) {
            // First click only arms the reset (protects recorded data tables).
            resetArmedUntil = now + 2500;
            renderDock();
            setTimeout(renderDock, 2600);
            return;
        }
        try { sessionStorage.setItem(SCROLL_KEY, String(window.scrollY)); } catch (e) { /* storage blocked */ }
        location.reload();
    }

    function restoreScroll() {
        try {
            var y = sessionStorage.getItem(SCROLL_KEY);
            if (y !== null) {
                sessionStorage.removeItem(SCROLL_KEY);
                window.scrollTo(0, parseInt(y, 10) || 0);
            }
        } catch (e) { /* storage blocked */ }
    }

    // ------------------------------------------------------------------
    // 3. Dock UI (self-contained styles, no Tailwind dependency)
    // ------------------------------------------------------------------
    var dock, btnPause, btnReset, statusEl;

    function injectStyles() {
        var css = [
            '#labDock{position:fixed;left:16px;bottom:16px;z-index:9990;display:flex;align-items:center;gap:6px;',
            'padding:6px;border-radius:14px;background:rgba(10,15,30,.92);border:1px solid rgba(148,163,184,.25);',
            'box-shadow:0 8px 24px rgba(0,0,0,.45);font:600 12px/1 "Plus Jakarta Sans",system-ui,sans-serif;color:#e2e8f0}',
            '#labDock button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:8px 12px;',
            'border-radius:10px;background:#1e293b;border:1px solid #334155;transition:background .15s,border-color .15s}',
            '#labDock button:hover{background:#273449}',
            '#labDock button:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}',
            '#labDock .lab-dock-pause.is-paused{background:#065f46;border-color:#10b981}',
            '#labDock .lab-dock-reset.is-armed{background:#7f1d1d;border-color:#f87171}',
            '#labDock .lab-dock-status{display:inline-flex;align-items:center;gap:6px;padding:0 8px;color:#94a3b8;white-space:nowrap}',
            '#labDock .lab-dock-dot{width:8px;height:8px;border-radius:50%;background:#10b981}',
            '#labDock.is-paused .lab-dock-dot{background:#f59e0b}',
            '#labDock svg{width:14px;height:14px;fill:currentColor}',
            /* Freeze CSS animations of the page (but not the dock itself) while paused. */
            'html.lab-paused body *:not(#labDock):not(#labDock *){animation-play-state:paused!important}',
            '@media (max-width:640px){#labDock .lab-dock-status span:last-child{display:none}}'
        ].join('');
        var style = document.createElement('style');
        style.id = 'labDockStyles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    var ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    var ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>';
    var ICON_RESET = '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>';

    function buildDock() {
        dock = document.createElement('div');
        dock.id = 'labDock';
        dock.setAttribute('role', 'toolbar');
        dock.setAttribute('aria-label', 'Điều khiển mô phỏng');

        statusEl = document.createElement('div');
        statusEl.className = 'lab-dock-status';
        statusEl.setAttribute('aria-live', 'polite');

        btnPause = document.createElement('button');
        btnPause.type = 'button';
        btnPause.className = 'lab-dock-pause';
        btnPause.title = 'Tạm dừng / Tiếp tục toàn bộ mô phỏng (phím P)';
        btnPause.addEventListener('click', function () { setPaused(!paused); });

        btnReset = document.createElement('button');
        btnReset.type = 'button';
        btnReset.className = 'lab-dock-reset';
        btnReset.title = 'Đặt lại toàn bộ thí nghiệm về trạng thái ban đầu (Shift+R)';
        btnReset.addEventListener('click', requestReset);

        dock.appendChild(statusEl);
        dock.appendChild(btnPause);
        dock.appendChild(btnReset);
        document.body.appendChild(dock);
        renderDock();
    }

    function renderDock() {
        if (!dock) return;
        dock.classList.toggle('is-paused', paused);
        statusEl.innerHTML = '<span class="lab-dock-dot"></span><span>' +
            (paused ? 'Đã tạm dừng' : 'Đang chạy') + '</span>';
        btnPause.classList.toggle('is-paused', paused);
        btnPause.innerHTML = paused ? (ICON_PLAY + '<span>Tiếp tục</span>') : (ICON_PAUSE + '<span>Tạm dừng</span>');
        btnPause.setAttribute('aria-pressed', String(paused));
        var armed = Date.now() < resetArmedUntil;
        btnReset.classList.toggle('is-armed', armed);
        btnReset.innerHTML = ICON_RESET + '<span>' + (armed ? 'Nhấn lần nữa để đặt lại' : 'Đặt lại') + '</span>';
    }

    // ------------------------------------------------------------------
    // 4. Keyboard shortcuts
    // ------------------------------------------------------------------
    function isTypingTarget(el) {
        if (!el) return false;
        var tag = (el.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    }

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
        if (e.key === 'p' || e.key === 'P') {
            e.preventDefault();
            setPaused(!paused);
        } else if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
            e.preventDefault();
            requestReset();
        }
    });

    // Pausing automatically when the tab is hidden saves CPU; resume is left to the user.
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) setPaused(true);
    });

    // Public API (useful for labs that want to integrate with the dock).
    window.NexusLabControls = {
        pause: function () { setPaused(true); },
        resume: function () { setPaused(false); },
        toggle: function () { setPaused(!paused); },
        isPaused: function () { return paused; },
        reset: function () { resetArmedUntil = Date.now() + 2500; requestReset(); }
    };

    function onReady() {
        injectStyles();
        buildDock();
        restoreScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();
