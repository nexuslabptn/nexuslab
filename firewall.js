/**
 * firewall.js — NexusLab Web Application Firewall & Rate-Limiter (WAF)
 * Tự động giám sát lưu lượng request/giây trên toàn bộ hệ thống NexusLab.
 * Nếu số request/giây vượt ngưỡng an toàn (nghi vấn DoS/Spam/Flood),
 * hệ thống lập tức kích hoạt tường lửa CHẶN TRUY CẬP 24 GIỜ (1 ngày).
 */

(function () {
  'use strict';

  const STORAGE_KEY_BLOCK = 'nexus_waf_blocked_until';
  const STORAGE_KEY_INCIDENT = 'nexus_waf_incident_info';
  const MAX_REQUESTS_PER_SECOND = 25; // Ngưỡng tối đa request/giây
  const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 giờ = 86,400,000 ms

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeUrl(url) {
    if (typeof url !== 'string') return 'index.html';
    const trimmed = url.trim();
    if (!trimmed) return 'index.html';
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('file:') ||
      lower.startsWith('//')
    ) {
      return 'index.html';
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
      try {
        const parsed = new URL(trimmed, window.location.href);
        if (parsed.origin !== window.location.origin) {
          return 'index.html';
        }
      } catch (e) {
        return 'index.html';
      }
    }
    return trimmed;
  }

  // Prototype Pollution Runtime Guard
  function installPrototypeDefense() {
    try {
      if (Object.defineProperty) {
        ['__proto__'].forEach(key => {
          try {
            Object.defineProperty(Object.prototype, key, {
              configurable: false,
              enumerable: false,
              writable: false
            });
          } catch (e) {}
        });
      }
    } catch (e) {}
  }

  // Anti-Clickjacking Frame Check
  function installClickjackingDefense() {
    try {
      if (window.top !== window.self) {
        try {
          if (window.top.location.origin !== window.location.origin) {
            console.warn('[SECURITY] Cross-origin frame embedding detected.');
          }
        } catch (e) {
          if (!document.documentElement.hasAttribute('data-allow-embed')) {
            window.top.location = window.self.location;
          }
        }
      }
    } catch (e) {}
  }

  // Console Self-XSS Warning Banner
  function installConsoleDefenseBanner() {
    try {
      if (typeof console !== 'undefined' && console.log) {
        setTimeout(() => {
          console.log(
            '%c🛡️ NEXUSLAB SECURITY ENGINE ACTIVE%c\n' +
            'Hệ thống bảo vệ toàn diện client-side đang vận hành.\n' +
            'Cảnh báo: Tuyệt đối không dán mã lệnh lạ vào console để phòng chống Self-XSS.',
            'color: #0284c7; font-size: 14px; font-weight: 800;',
            'color: #64748b; font-size: 11px;'
          );
        }, 800);
      }
    } catch (e) {}
  }

  let reqTimestamps = [];

  // 1. Kiểm tra trạng thái chặn hiện tại
  function checkBlockStatus() {
    const blockedUntilStr = localStorage.getItem(STORAGE_KEY_BLOCK);
    if (!blockedUntilStr) return false;

    const blockedUntil = parseInt(blockedUntilStr, 10);
    const now = Date.now();

    if (now < blockedUntil) {
      renderBlockScreen(blockedUntil);
      return true;
    } else {
      // Hết hạn 1 ngày -> tự động gỡ chặn
      localStorage.removeItem(STORAGE_KEY_BLOCK);
      localStorage.removeItem(STORAGE_KEY_INCIDENT);
      return false;
    }
  }

  // 2. Kích hoạt chặn 1 ngày
  function triggerFirewallBlock(rate) {
    const now = Date.now();
    const blockedUntil = now + BLOCK_DURATION_MS;
    const incidentId = 'WAF-' + Math.floor(100000 + Math.random() * 900000);

    const info = {
      incidentId: incidentId,
      time: new Date().toISOString(),
      rate: rate,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    localStorage.setItem(STORAGE_KEY_BLOCK, blockedUntil.toString());
    localStorage.setItem(STORAGE_KEY_INCIDENT, JSON.stringify(info));

    renderBlockScreen(blockedUntil);
  }

  // 3. Ghi nhận 1 request và kiểm tra ngưỡng
  function recordRequest() {
    if (localStorage.getItem(STORAGE_KEY_BLOCK)) {
      checkBlockStatus();
      return;
    }

    const now = Date.now();
    reqTimestamps.push(now);

    // Chỉ giữ lại các request trong cửa sổ trượt 1000ms gần nhất
    const oneSecAgo = now - 1000;
    reqTimestamps = reqTimestamps.filter(t => t >= oneSecAgo);

    if (reqTimestamps.length > MAX_REQUESTS_PER_SECOND) {
      console.warn(`[WAF ALERT] Rate limit exceeded: ${reqTimestamps.length} req/s > ${MAX_REQUESTS_PER_SECOND} req/s`);
      triggerFirewallBlock(reqTimestamps.length);
    }
  }

  // 4. Hook vào fetch và XMLHttpRequest để giám sát request
  function installNetworkHooks() {
    // Hook fetch
    if (window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = function (...args) {
        recordRequest();
        return originalFetch.apply(this, args);
      };
    }

    // Hook XMLHttpRequest
    if (window.XMLHttpRequest) {
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (...args) {
        recordRequest();
        return originalOpen.apply(this, args);
      };
    }
  }

  // 5. Hiển thị màn hình tường lửa khóa 24 giờ
  function renderBlockScreen(blockedUntil) {
    // Dừng các tương tác khác
    window.stop && window.stop();

    let incident = {};
    try {
      incident = JSON.parse(localStorage.getItem(STORAGE_KEY_INCIDENT) || '{}');
    } catch (e) {}

    const overlayId = 'nexus-firewall-lock-screen';
    let overlay = document.getElementById(overlayId);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = overlayId;
      overlay.style.cssText = `
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483647 !important;
        background: #0f172a !important;
        color: #f8fafc !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
        overflow-y: auto !important;
      `;
      document.documentElement.appendChild(overlay);
    }

    function updateCountdown() {
      const remainingMs = blockedUntil - Date.now();
      if (remainingMs <= 0) {
        localStorage.removeItem(STORAGE_KEY_BLOCK);
        localStorage.removeItem(STORAGE_KEY_INCIDENT);
        window.location.reload();
        return;
      }

      const totalSec = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;

      const timeEl = document.getElementById('waf-countdown-timer');
      if (timeEl) timeEl.innerText = timeStr;
    }

    overlay.innerHTML = `
      <div style="background: #ffffff; color: #0f172a; max-width: 620px; width: 100%; border-radius: 20px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); overflow: hidden; border: 2px solid #ef4444;">
        <!-- Header -->
        <div style="background: #dc2626; color: #ffffff; padding: 22px 26px; display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 32px; line-height: 1;">🛡️</div>
          <div>
            <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">TƯỜNG LỬA BẢO VỆ NEXUSLAB (WAF)</div>
            <div style="font-size: 12px; font-weight: 600; opacity: 0.9;">Phát hiện tần suất request/giây bất thường (Anti-DoS Protection)</div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 26px;">
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
            <div style="font-weight: 800; color: #991b1b; font-size: 14px; margin-bottom: 6px;">
              ⚠️ TRUY CẬP ĐÃ BỊ TẠM KHÓA 1 NGÀY (24 GIỜ)
            </div>
            <div style="font-size: 13px; color: #7f1d1d; line-height: 1.6; font-weight: 500;">
              Hệ thống ghi nhận lưu lượng thao tác hoặc request vượt quá <b>${MAX_REQUESTS_PER_SECOND} request/giây</b> từ trình duyệt này. Nhằm ngăn chặn nguy cơ tấn công từ chối dịch vụ (DoS) và bảo vệ an toàn máy chủ thí nghiệm, thiết bị của bạn đã được đưa vào danh sách chặn 24 giờ.
            </div>
          </div>

          <!-- Countdown Box -->
          <div style="text-align: center; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 22px;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Thời Gian Chờ Mở Khóa Tự Động</div>
            <div id="waf-countdown-timer" style="font-size: 38px; font-weight: 900; font-family: monospace; color: #dc2626; letter-spacing: 2px;">
              24:00:00
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">(Sau khi hết thời gian, trang web sẽ tự động hoạt động trở lại bình thường)</div>
          </div>

          <!-- Metadata -->
          <div style="background: #f1f5f9; border-radius: 10px; padding: 12px 16px; font-size: 12px; color: #334155; margin-bottom: 22px; line-height: 1.8;">
            <div><b>Mã sự cố:</b> <span style="font-family: monospace; color: #0284c7; font-weight: 700;">#${escapeHtml(String(incident.incidentId || 'SEC-WAF-8890'))}</span></div>
            <div><b>Lưu lượng ghi nhận:</b> <span style="font-weight: 700; color: #dc2626;">${escapeHtml(String(incident.rate || '>25'))} request/giây</span></div>
            <div><b>Thời điểm kích hoạt:</b> ${escapeHtml(incident.time ? new Date(incident.time).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'))}</div>
          </div>

          <!-- Self-service Session Reset -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <button type="button" id="btnWafReset" style="width: 100%; padding: 11px 18px; background: #0284c7; hover:background: #0369a1; color: #ffffff; font-weight: 700; font-size: 13px; border: none; border-radius: 10px; cursor: pointer; transition: background 0.15s ease;">
              🔄 Khôi Phục Phiên Làm Việc & Mở Khóa Ngay
            </button>
            <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 8px;">
              (Dành cho giáo viên và học sinh thử nghiệm trong môi trường lớp học)
            </div>
          </div>
        </div>
      </div>
    `;

    updateCountdown();
    setInterval(updateCountdown, 1000);

    setTimeout(() => {
      const btn = document.getElementById('btnWafReset');
      if (btn) {
        btn.onclick = () => {
          localStorage.removeItem(STORAGE_KEY_BLOCK);
          localStorage.removeItem(STORAGE_KEY_INCIDENT);
          window.location.reload();
        };
      }
    }, 100);
  }

  // Khởi động các tầng bảo vệ Tường Lửa & Anti-Hack
  installPrototypeDefense();
  installClickjackingDefense();
  installConsoleDefenseBanner();

  if (checkBlockStatus()) return;
  installNetworkHooks();

  // Expose API cho việc kiểm thử hoặc gọi thủ công
  window.NexusFirewall = {
    escapeHtml: escapeHtml,
    sanitizeUrl: sanitizeUrl,
    recordRequest: recordRequest,
    triggerBlock: () => triggerFirewallBlock(50),
    isBlocked: checkBlockStatus,
    unblock: () => {
      localStorage.removeItem(STORAGE_KEY_BLOCK);
      localStorage.removeItem(STORAGE_KEY_INCIDENT);
      window.location.reload();
    }
  };
})();
