/**
 * sandbox-ai.js — Floating Sci-AI Assistant for NexusLab Sandbox (Ctrl + L)
 * 
 * Features:
 * 1. Global shortcut Ctrl + L (and floating badge) to toggle the AI Assistant.
 * 2. Instant snapshot: gõ "data" hoặc "dữ liệu" để xem số liệu ngay thời điểm đó.
 * 3. Live Auto Data Streamer: gõ "data auto" hoặc "auto data" để mở BẢNG DỮ LIỆU THEO DÕI LIÊN TỤC (có nút tắt).
 * 4. AI Điều Khiển Hộ (AI Pilot): Người dùng có thể nhờ AI điều khiển thông số, đổi môi trường, nâng hạ thanh, bật tắt thiết bị...
 * 5. Kết nối API Keys từ api.txt (OpenAI, Gemini, xKiro) và có offline fallback chuẩn SGK.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'nexus_ai_config_v1';

  // 5 Google Gemini Models with Best Use & API Model IDs
  const GEMINI_MODELS = [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      bestUse: 'Coding, general AI, agents',
      badge: 'Gemini 3.8 Flash'
    },
    {
      id: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash',
      bestUse: 'Coding, multi-step tasks',
      badge: 'Gemini 3.7 Flash'
    },
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      bestUse: 'General chat, multimodal',
      badge: 'Gemini 3.6 Flash'
    },
    {
      id: 'gemini-3.5-flash',
      name: 'Gemini 3.5 Flash',
      bestUse: 'Everyday tasks',
      badge: 'Gemini 3.5 Flash'
    },
    {
      id: 'gemini-3.5-flash-lite',
      name: 'Gemini 3.5 Flash-Lite',
      bestUse: 'Fast, lightweight tasks',
      badge: 'Gemini 3.5 Lite'
    }
  ];

  let config = {
    provider: 'gemini', // 'gemini' | 'xkiro' | 'openai'
    openaiKey: '',
    geminiKey: '',
    geminiModel: 'gemini-3.5-flash-lite',
    xkiroKey: '',
    xkiroBaseUrl: 'https://api.xkiro.com/v1',
    xkiroModel: 'qwen/qwen3.8-omni-flash:free'
  };

  let isInitialized = false;
  let isOpen = false;
  let autoDataTimer = null;

  // Load configuration from api.txt and localStorage
  async function loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        config = Object.assign(config, JSON.parse(saved));
      }
    } catch (e) {}

    try {
      const res = await fetch('api.txt');
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n');
        lines.forEach(line => {
          line = line.trim();
          if (!line || line.startsWith('#')) return;
          const eq = line.indexOf('=');
          if (eq !== -1) {
            const key = line.slice(0, eq).trim();
            const val = line.slice(eq + 1).trim();
            const isRealKey = (v) => v && !v.startsWith('YOUR_') && !v.includes('API_KEY_HERE');
            if (key === 'OPENAI_API_KEY' && isRealKey(val) && !config.openaiKey) config.openaiKey = val;
            if (key === 'GEMINI_API_KEY' && isRealKey(val) && !config.geminiKey) config.geminiKey = val;
            if (key === 'GEMINI_MODEL' && val) config.geminiModel = val;
            if (key === 'XKIRO_API_KEY' && isRealKey(val) && !config.xkiroKey) config.xkiroKey = val;
            if (key === 'XKIRO_BASE_URL' && val) config.xkiroBaseUrl = val;
            if (key === 'XKIRO_MODEL' && val) config.xkiroModel = val;
          }
        });

        // Set active provider according to available keys
        if (config.geminiKey) config.provider = 'gemini';
        else if (config.xkiroKey) config.provider = 'xkiro';
        else if (config.openaiKey) config.provider = 'openai';
      }
    } catch (err) {}
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {}
  }

  // Inject UI Styles
  function injectStyles() {
    if (document.getElementById('nexusAIStyles')) return;
    const style = document.createElement('style');
    style.id = 'nexusAIStyles';
    style.textContent = `
      #nexusAiFloatBtn {
        position: fixed;
        right: 20px;
        bottom: 24px;
        z-index: 9980;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 9999px;
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.95), rgba(59, 130, 246, 0.95));
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: #040711;
        font: 800 12px/1 "Plus Jakarta Sans", system-ui, sans-serif;
        box-shadow: 0 8px 30px rgba(6, 182, 212, 0.45);
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      #nexusAiFloatBtn:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(6, 182, 212, 0.55);
      }
      #nexusAiModal {
        position: fixed;
        right: 24px;
        bottom: 80px;
        width: 450px;
        max-width: calc(100vw - 32px);
        height: 620px;
        max-height: calc(100vh - 110px);
        z-index: 9990;
        background: rgba(10, 16, 32, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(6, 182, 212, 0.4);
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(6, 182, 212, 0.25);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: "Plus Jakarta Sans", system-ui, sans-serif;
        color: #f1f5f9;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      #nexusAiModal.hidden {
        display: none;
      }
      .nexus-ai-bubble-user {
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.25));
        border: 1px solid rgba(6, 182, 212, 0.4);
        border-radius: 16px 16px 4px 16px;
        align-self: flex-end;
      }
      .nexus-ai-bubble-bot {
        background: rgba(20, 28, 52, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px 16px 16px 4px;
        align-self: flex-start;
      }
      .nexus-data-card {
        background: rgba(4, 9, 20, 0.9);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 12px;
        padding: 10px;
        margin-top: 6px;
        font-family: "JetBrains Mono", monospace;
        font-size: 11px;
      }
      
      /* LIVE AUTO-DATA HUD OVERLAY */
      #nexusAutoDataHUD {
        position: fixed;
        top: 75px;
        left: 24px;
        z-index: 9970;
        width: 320px;
        max-width: calc(100vw - 48px);
        background: rgba(8, 14, 30, 0.94);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1.5px solid #06b6d4;
        border-radius: 18px;
        box-shadow: 0 15px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(6, 182, 212, 0.25);
        color: #f1f5f9;
        font-family: "Plus Jakarta Sans", system-ui, sans-serif;
        overflow: hidden;
        transition: all 0.2s ease;
      }
      #nexusAutoDataHUD.hidden {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Inject Modal HTML & Auto-Data HUD
  function injectModalHTML() {
    if (document.getElementById('nexusAiModal')) return;

    // 1. Floating trigger button
    const btn = document.createElement('button');
    btn.id = 'nexusAiFloatBtn';
    btn.type = 'button';
    btn.title = 'Bấm phím Ctrl + L để gọi Trợ lý AI';
    btn.innerHTML = `
      <i class="fa-solid fa-wand-magic-sparkles text-sm"></i>
      <span>Sci-AI</span>
      <span class="px-1.5 py-0.5 rounded bg-slate-950/20 text-[10px] font-mono font-extrabold ml-1">Ctrl+L</span>
    `;
    btn.onclick = toggleModal;
    document.body.appendChild(btn);

    // 2. Chat Modal
    const modal = document.createElement('div');
    modal.id = 'nexusAiModal';
    modal.className = 'hidden';
    modal.innerHTML = `
      <!-- Modal Header -->
      <div style="padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: rgba(6, 11, 24, 0.85);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #06b6d4, #3b82f6); display: flex; align-items: center; justify-content: center; color: #040711; font-weight: 900;">
            <i class="fa-solid fa-robot"></i>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px; color: #ffffff; display: flex; align-items: center; gap: 6px;">
              <span>NexusLab Sci-AI Pilot</span>
              <span id="aiModelBadge" style="font-size: 9px; padding: 2px 6px; border-radius: 999px; background: rgba(6,182,212,0.2); color: #67e8f9; border: 1px solid rgba(6,182,212,0.4); font-family: 'JetBrains Mono', monospace;">Gemini</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">Hỏi đáp, trích xuất dữ liệu & nhờ AI điều khiển</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="btnAiSettings" type="button" title="Cài đặt API Key & Nhà cung cấp AI" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 6px; font-size: 14px; border-radius: 8px;">
            <i class="fa-solid fa-gear"></i>
          </button>
          <button id="btnAiClose" type="button" title="Đóng bảng AI" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 6px; font-size: 14px; border-radius: 8px;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Quick Action Buttons & Prompt Chips Bar -->
      <div style="padding: 8px 14px; background: rgba(8, 14, 28, 0.95); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; gap: 6px; overflow-x: auto; scrollbar-width: thin;">
        <button type="button" onclick="window.NexusAI.sendMessageQuick('data')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(6,182,212,0.15); color: #38bdf8; border: 1px solid rgba(6,182,212,0.3); cursor: pointer; white-space: nowrap;">
          <i class="fa-solid fa-chart-simple"></i> Data lúc này
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('data auto')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); cursor: pointer; white-space: nowrap;">
          <i class="fa-solid fa-tower-broadcast"></i> Data Auto
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('thí nghiệm este hóa ch3cooh và c2h5oh')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4); cursor: pointer; white-space: nowrap;">
          🍋 Este Hóa CH₃COOH + C₂H₅OH
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('đo ph giấy chỉ thị vạn năng')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.4); cursor: pointer; white-space: nowrap;">
          📏 Đo pH Vạn Năng (1-14)
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('nhiệt độ phản ứng tỏa nhiệt nhiệt kế')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4); cursor: pointer; white-space: nowrap;">
          🌡️ Đo Nhiệt Độ Phản Ứng
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('biến trở định luật ôm mạch điện')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); cursor: pointer; white-space: nowrap;">
          🎛️ Biến Trở & Định Luật Ôm
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('công thức tính chu kỳ con lắc đơn l = 1m')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(6,182,212,0.2); color: #67e8f9; border: 1px solid rgba(6,182,212,0.4); cursor: pointer; white-space: nowrap;">
          ⏱️ Bấm Giờ Dao Động Con Lắc
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('vì sao Cu không tác dụng với HCl và H2SO4 loãng?')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(244,63,94,0.15); color: #fb7185; border: 1px solid rgba(244,63,94,0.3); cursor: pointer; white-space: nowrap;">
          ❓ Vì sao Cu không tan trong axit loãng?
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('đồng tác dụng với h2so4 đặc nóng')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); cursor: pointer; white-space: nowrap;">
          🔥 Cu + H₂SO₄ đặc nóng
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('phản ứng bacl2 và h2so4 kết tủa trắng')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); cursor: pointer; white-space: nowrap;">
          ❄️ BaCl₂ + H₂SO₄
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('phản ứng cuso4 và naoh kết tủa xanh')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(14,165,233,0.15); color: #38bdf8; border: 1px solid rgba(14,165,233,0.3); cursor: pointer; white-space: nowrap;">
          💎 CuSO₄ + NaOH
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('phản ứng fecl3 và naoh kết tủa nâu đỏ')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(217,119,6,0.15); color: #fbbf24; border: 1px solid rgba(217,119,6,0.3); cursor: pointer; white-space: nowrap;">
          🍂 FeCl₃ + NaOH
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('nhôm tác dụng dung dịch kiềm naoh')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(14,165,233,0.15); color: #7dd3fc; border: 1px solid rgba(14,165,233,0.3); cursor: pointer; white-space: nowrap;">
          🌾 Al + NaOH
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('cho đá vôi caco3 vào axit hcl')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(148,163,184,0.15); color: #e2e8f0; border: 1px solid rgba(148,163,184,0.3); cursor: pointer; white-space: nowrap;">
          🪨 CaCO₃ + HCl
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('giải thích hiện tượng phenol tác dụng với naoh dung dịch trong suốt')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(236,72,153,0.2); color: #f472b6; border: 1px solid rgba(236,72,153,0.4); cursor: pointer; white-space: nowrap;">
          🌸 Phenol + NaOH (trong suốt)
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('phản ứng nhiệt phân kmno4 thuốc tím và thử que đóm')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.4); cursor: pointer; white-space: nowrap;">
          🟣 Nhiệt phân KMnO₄
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('khí nh3 tác dụng khí hcl tạo khói trắng')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(148,163,184,0.2); color: #cbd5e1; border: 1px solid rgba(148,163,184,0.4); cursor: pointer; white-space: nowrap;">
          ☁️ NH₃ + HCl (khói trắng)
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('phản ứng ba(oh)2 và h2so4 kết tủa trắng')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(56,189,248,0.2); color: #38bdf8; border: 1px solid rgba(56,189,248,0.4); cursor: pointer; white-space: nowrap;">
          🧪 Ba(OH)₂ + H₂SO₄
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('phản ứng feso4 và naoh kết tủa trắng xanh hóa nâu đỏ')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); cursor: pointer; white-space: nowrap;">
          🌿 FeSO₄ + NaOH
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('tính số mol của 16g Cu và tính thể tích ở đkc')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); cursor: pointer; white-space: nowrap;">
          🧮 Tính n=m/M & V khí
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('công thức tính chu kỳ con lắc đơn l = 1m')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(6,182,212,0.2); color: #67e8f9; border: 1px solid rgba(6,182,212,0.4); cursor: pointer; white-space: nowrap;">
          ⏱️ Chu kỳ con lắc T
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('giải thích hiện tượng cảm ứng điện từ faraday cuộn dây và nam châm')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4); cursor: pointer; white-space: nowrap;">
          🧲 Cảm ứng Faraday
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('định luật hooke lực kế lò xo')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(244,63,94,0.2); color: #fb7185; border: 1px solid rgba(244,63,94,0.4); cursor: pointer; white-space: nowrap;">
          ⚙️ Lực kế Hooke
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('phản ứng trung hòa phenolphthalein')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(236,72,153,0.15); color: #f472b6; border: 1px solid rgba(236,72,153,0.3); cursor: pointer; white-space: nowrap;">
          🌸 Trung hòa Phenol
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('thí nghiệm natri vào nước có phenolphthalein')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(236,72,153,0.2); color: #f472b6; border: 1px solid rgba(236,72,153,0.4); cursor: pointer; white-space: nowrap;">
          🌸 Na + Nước + Phenol
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('cho natri vào nước')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); cursor: pointer; white-space: nowrap;">
          ⚡ Na + Nước
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('điều chế hidro từ zn và hcl')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(20,184,166,0.15); color: #2dd4bf; border: 1px solid rgba(20,184,166,0.3); cursor: pointer; white-space: nowrap;">
          ⚡ Zn + HCl
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('làm phản ứng tráng gương bạc')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(148,163,184,0.15); color: #cbd5e1; border: 1px solid rgba(148,163,184,0.3); cursor: pointer; white-space: nowrap;">
          🪞 Tráng gương
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('tinh bột và iot đổi màu')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); cursor: pointer; white-space: nowrap;">
          🌾 Tinh bột + Iod
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('danh sách model')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); cursor: pointer; white-space: nowrap;">
          <i class="fa-solid fa-microchip"></i> Models Gemini
        </button>
        <button type="button" onclick="window.NexusAI.sendMessageQuick('xóa thí nghiệm')" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); cursor: pointer; white-space: nowrap;">
          🗑️ Xóa thí nghiệm
        </button>
      </div>

      <!-- Settings Panel (Collapsible) -->
      <div id="aiSettingsPanel" style="display: none; padding: 14px; background: rgba(4, 8, 18, 0.95); border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 11px;">
        <div style="font-weight: 700; color: #67e8f9; margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>⚙️ Cấu Hình API Key & Model (từ api.txt hoặc trực tiếp)</span>
          <button id="btnCloseSettings" type="button" style="background:none; border:none; color:#94a3b8; cursor:pointer;">✕</button>
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display: block; color: #cbd5e1; margin-bottom: 4px;">Nhà cung cấp AI:</label>
          <select id="selAiProvider" style="width: 100%; padding: 6px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff;">
            <option value="gemini">Google Gemini (Khuyên dùng - 5 models)</option>
            <option value="xkiro">xKiro / Qwen (OpenAI-compatible)</option>
            <option value="openai">OpenAI (ChatGPT gpt-4o-mini)</option>
          </select>
        </div>

        <!-- Google Gemini Model Selector -->
        <div id="grpGeminiModel" style="margin-bottom: 8px;">
          <label style="display: block; color: #cbd5e1; margin-bottom: 4px;">Mô hình Google Gemini (Model):</label>
          <select id="selGeminiModel" style="width: 100%; padding: 6px 8px; background: #0f172a; border: 1px solid #06b6d4; border-radius: 8px; color: #fff; font-size: 11px;">
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Coding, general AI, agents)</option>
            <option value="gemini-3.7-flash">Gemini 3.7 Flash (Coding, multi-step tasks)</option>
            <option value="gemini-3.6-flash">Gemini 3.6 Flash (General chat, multimodal)</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (Everyday tasks)</option>
            <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Fast, lightweight tasks)</option>
          </select>
          <div id="geminiModelDesc" style="margin-top: 4px; font-size: 10px; color: #38bdf8; line-height: 1.4;">
            💡 Best use: Coding, general AI, agents
          </div>
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; color: #cbd5e1; margin-bottom: 4px;">API Key:</label>
          <input type="password" id="inputApiKey" placeholder="Dán API Key hoặc điền vào api.txt" style="width: 100%; padding: 6px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff; font-family: monospace;">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
          <button id="btnSaveAiKey" type="button" style="padding: 6px 14px; background: #06b6d4; color: #040711; font-weight: 700; border-radius: 8px; border: none; cursor: pointer;">Lưu Cấu Hình</button>
        </div>
      </div>

      <!-- Messages Scroll Area -->
      <div id="aiChatMessages" style="flex: 1; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
        <div class="nexus-ai-bubble-bot" style="padding: 12px 14px; max-width: 90%; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0 0 6px 0;">Xin chào! Tôi là <b>Sci-AI Pilot</b> có khả năng <b>vừa giải thích kiến thức, vừa điều khiển hộ thí nghiệm</b>.</p>
          <p style="margin: 0 0 6px 0; color: #67e8f9;">💡 <b>Các lệnh thông minh bạn có thể yêu cầu:</b></p>
          <ul style="margin: 0; padding-left: 18px; color: #cbd5e1; font-size: 11px;">
            <li>Gõ <b>"danh sách model"</b>: Xem và chọn 5 model Google Gemini (3.8 Flash, 3.7 Flash, 3.6 Flash, 3.5 Flash, 3.5 Flash-Lite).</li>
            <li>Gõ <b>"data"</b>: Chụp số liệu cảm biến ngay lúc này.</li>
            <li>Gõ <b>"data auto"</b>: Mở bảng theo dõi dữ liệu tự động cập nhật liên tục (có nút tắt).</li>
            <li><b>"AI tăng điện áp lên 24V"</b> hoặc <b>"AI nâng thanh ở giữa lên"</b>: AI sẽ tự động điều khiển bàn thí nghiệm cho bạn!</li>
          </ul>
        </div>
      </div>

      <!-- Input Bar -->
      <div style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(6, 11, 24, 0.9);">
        <form id="aiChatForm" style="display: flex; gap: 8px;" onsubmit="event.preventDefault(); window.NexusAI.sendMessage();">
          <input type="text" id="aiInputPrompt" placeholder="Nhờ AI điều khiển, hỏi kiến thức, hoặc gõ 'data'..." autocomplete="off" style="flex: 1; padding: 10px 14px; background: #0b1329; border: 1px solid #1e293b; border-radius: 12px; color: #fff; font-size: 12px; outline: none;">
          <button type="submit" id="btnAiSend" style="padding: 10px 16px; background: #06b6d4; color: #040711; font-weight: 800; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // 3. Floating Live Auto-Data Monitor HUD (with Close Button)
    const autoHud = document.createElement('div');
    autoHud.id = 'nexusAutoDataHUD';
    autoHud.className = 'hidden';
    autoHud.innerHTML = `
      <div style="padding: 10px 14px; background: rgba(6, 182, 212, 0.15); border-bottom: 1px solid rgba(6, 182, 212, 0.3); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #34d399; animation: pulse 1.5s infinite;"></span>
          <span style="font-weight: 800; font-size: 11px; color: #67e8f9; letter-spacing: 0.5px; text-transform: uppercase;">THEO DÕI DATA AUTO</span>
        </div>
        <button id="btnCloseAutoData" type="button" title="Tắt theo dõi liên tục" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
          ✕ TẮT THEO DÕI
        </button>
      </div>
      <div id="nexusAutoDataContent" style="padding: 12px; font-size: 11px; max-height: 380px; overflow-y: auto;">
        Đang khởi động cảm biến dữ liệu...
      </div>
      <div style="padding: 6px 12px; background: rgba(4, 9, 20, 0.8); border-top: 1px solid rgba(255,255,255,0.06); font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between;">
        <span>Tần số: 10 Hz (Real-time)</span>
        <span>Phím tắt: Ctrl + L</span>
      </div>
    `;
    document.body.appendChild(autoHud);

    // Event listeners
    document.getElementById('btnAiClose').onclick = toggleModal;
    document.getElementById('btnAiSettings').onclick = toggleSettings;
    document.getElementById('btnCloseSettings').onclick = toggleSettings;
    document.getElementById('btnSaveAiKey').onclick = handleSaveSettings;
    document.getElementById('btnCloseAutoData').onclick = stopAutoData;
    document.getElementById('selAiProvider').onchange = (e) => {
      config.provider = e.target.value;
      const grpGemini = document.getElementById('grpGeminiModel');
      if (grpGemini) grpGemini.style.display = (config.provider === 'gemini') ? 'block' : 'none';
      updateActiveKeyInput();
    };
    const selGemini = document.getElementById('selGeminiModel');
    if (selGemini) {
      selGemini.onchange = (e) => {
        config.geminiModel = e.target.value;
        updateGeminiModelDesc();
      };
    }
  }

  function updateGeminiModelDesc() {
    const sel = document.getElementById('selGeminiModel');
    const desc = document.getElementById('geminiModelDesc');
    if (!sel || !desc) return;
    const found = GEMINI_MODELS.find(m => m.id === sel.value);
    if (found) {
      desc.innerHTML = `💡 <b>Mục đích tốt nhất (Best use):</b> ${found.bestUse} | <code>${found.id}</code>`;
    }
  }

  function toggleSettings() {
    const panel = document.getElementById('aiSettingsPanel');
    if (!panel) return;
    const isShown = panel.style.display !== 'none';
    panel.style.display = isShown ? 'none' : 'block';
    if (!isShown) {
      document.getElementById('selAiProvider').value = config.provider;
      const grpGemini = document.getElementById('grpGeminiModel');
      if (grpGemini) grpGemini.style.display = (config.provider === 'gemini') ? 'block' : 'none';
      const selGemini = document.getElementById('selGeminiModel');
      if (selGemini) {
        selGemini.value = config.geminiModel || 'gemini-3.5-flash-lite';
        updateGeminiModelDesc();
      }
      updateActiveKeyInput();
    }
  }

  function updateActiveKeyInput() {
    const inp = document.getElementById('inputApiKey');
    if (!inp) return;
    if (config.provider === 'openai') inp.value = config.openaiKey || '';
    else if (config.provider === 'gemini') inp.value = config.geminiKey || '';
    else if (config.provider === 'xkiro') inp.value = config.xkiroKey || '';
  }

  function handleSaveSettings() {
    const prov = document.getElementById('selAiProvider').value;
    const key = document.getElementById('inputApiKey').value.trim();
    config.provider = prov;
    if (prov === 'openai') config.openaiKey = key;
    else if (prov === 'gemini') {
      config.geminiKey = key;
      const selModel = document.getElementById('selGeminiModel');
      if (selModel) config.geminiModel = selModel.value;
    }
    else if (prov === 'xkiro') config.xkiroKey = key;
    saveConfig();
    updateModelBadge();
    toggleSettings();
    const modelInfo = (prov === 'gemini') ? ` - Model: ${config.geminiModel}` : '';
    appendBotMessage(`✅ Đã lưu cấu hình AI (${prov.toUpperCase()}${modelInfo}) thành công!`);
  }

  function updateModelBadge() {
    const badge = document.getElementById('aiModelBadge');
    if (badge) {
      if (config.provider === 'openai') {
        badge.innerText = 'ChatGPT';
      } else if (config.provider === 'gemini') {
        const found = GEMINI_MODELS.find(m => m.id === config.geminiModel);
        badge.innerText = found ? found.badge : 'Gemini 3.5';
      } else {
        badge.innerText = 'xKiro (Qwen-3.8)';
      }
    }
  }

  function toggleModal() {
    const modal = document.getElementById('nexusAiModal');
    if (!modal) return;
    isOpen = !isOpen;
    if (isOpen) {
      modal.classList.remove('hidden');
      updateModelBadge();
      const inp = document.getElementById('aiInputPrompt');
      if (inp) setTimeout(() => inp.focus(), 100);
    } else {
      modal.classList.add('hidden');
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatAiResponse(raw) {
    if (!raw || typeof raw !== 'string') return '';
    if (raw.includes('nexus-ai-safe-box')) return raw;
    const escaped = escapeHtml(raw);
    return escaped
      .replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, '<pre style="background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 8px; overflow-x: auto; font-family: monospace; margin: 6px 0;"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\*([^*]+)\*/g, '<i>$1</i>')
      .replace(/\n/g, '<br/>');
  }

  function renderLatexInElement(el) {
    if (!el) return;
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false
        });
        return;
      } catch (e) {}
    }
    if (window.katex && window.katex.renderToString) {
      try {
        // Display math $$...$$
        el.innerHTML = el.innerHTML.replace(/\$\$([\s\S]+?)\$\$/g, (match, tex) => {
          try {
            return window.katex.renderToString(tex, { displayMode: true, throwOnError: false });
          } catch (e) {
            return match;
          }
        });
        // Inline math $...$
        el.innerHTML = el.innerHTML.replace(/\$([^\$\n]+?)\$/g, (match, tex) => {
          try {
            return window.katex.renderToString(tex, { displayMode: false, throwOnError: false });
          } catch (e) {
            return match;
          }
        });
      } catch (e) {}
    }
  }

  function appendUserMessage(text) {
    const chat = document.getElementById('aiChatMessages');
    if (!chat) return;
    const msg = document.createElement('div');
    msg.className = 'nexus-ai-bubble-user';
    msg.style.cssText = 'padding: 10px 14px; max-width: 82%; font-size: 12px; line-height: 1.5; color: #e0f2fe;';
    msg.innerText = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function appendBotMessage(htmlContent) {
    const chat = document.getElementById('aiChatMessages');
    if (!chat) return;
    const msg = document.createElement('div');
    msg.className = 'nexus-ai-bubble-bot';
    msg.style.cssText = 'padding: 12px 14px; max-width: 90%; font-size: 12px; line-height: 1.5; color: #f1f5f9;';
    msg.innerHTML = htmlContent;
    renderLatexInElement(msg);
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  // -------------------------------------------------------------
  // LIVE AUTO-DATA CONTROLLER (Theo dõi liên tục, có nút tắt)
  // -------------------------------------------------------------
  function startAutoData() {
    const hud = document.getElementById('nexusAutoDataHUD');
    if (!hud) return;
    hud.classList.remove('hidden');

    if (autoDataTimer) clearInterval(autoDataTimer);

    function updateHud() {
      if (typeof window.getSandboxData === 'function') {
        const data = window.getSandboxData();
        const content = document.getElementById('nexusAutoDataContent');
        if (content) {
          content.innerHTML = data.formattedHtml;
        }
      }
    }

    updateHud();
    autoDataTimer = setInterval(updateHud, 120);
  }

  function stopAutoData() {
    const hud = document.getElementById('nexusAutoDataHUD');
    if (hud) hud.classList.add('hidden');
    if (autoDataTimer) {
      clearInterval(autoDataTimer);
      autoDataTimer = null;
    }
  }

  // -------------------------------------------------------------
  // GEMINI MODEL SWITCHER & COMMAND PROCESSOR
  // -------------------------------------------------------------
  function switchGeminiModel(modelId) {
    const found = GEMINI_MODELS.find(m => m.id === modelId);
    if (!found) return;
    config.provider = 'gemini';
    config.geminiModel = found.id;
    saveConfig();
    updateModelBadge();

    const selProv = document.getElementById('selAiProvider');
    if (selProv) selProv.value = 'gemini';
    const grpGemini = document.getElementById('grpGeminiModel');
    if (grpGemini) grpGemini.style.display = 'block';
    const selModel = document.getElementById('selGeminiModel');
    if (selModel) {
      selModel.value = found.id;
      updateGeminiModelDesc();
    }
    updateActiveKeyInput();

    appendBotMessage(`
      <div style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.35); border-radius: 12px; padding: 10px 12px;">
        <div style="color: #67e8f9; font-weight: 800; font-size: 12px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-microchip"></i> ĐÃ CHUYỂN SANG GOOGLE GEMINI: ${found.name}
        </div>
        <div style="font-size: 11px; color: #ffffff; line-height: 1.5;">
          <b>API Model ID:</b> <code style="color: #38bdf8;">${found.id}</code><br/>
          <b>Mục đích tốt nhất (Best use):</b> <span style="color: #a5f3fc;">${found.bestUse}</span>
        </div>
      </div>
    `);
  }

  function tryExecuteModelCommand(prompt) {
    const p = prompt.toLowerCase().trim();

    // 1. List Gemini Models Table
    if (p.includes('danh sách model') || p.includes('model gemini') || p.includes('models gemini') || p.includes('xem model') || p === 'model' || p === 'models') {
      let rowsHtml = GEMINI_MODELS.map(m => {
        const isActive = config.provider === 'gemini' && config.geminiModel === m.id;
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 6px; border-radius: 10px; background: ${isActive ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${isActive ? '#06b6d4' : 'rgba(255,255,255,0.08)'};">
            <div>
              <div style="font-weight: 800; color: ${isActive ? '#67e8f9' : '#ffffff'}; font-size: 11px; display: flex; align-items: center; gap: 6px;">
                <span>${m.name}</span>
                ${isActive ? '<span style="background: #10b981; color: #040711; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 999px;">ĐANG DÙNG</span>' : ''}
              </div>
              <div style="color: #cbd5e1; font-size: 10px; margin-top: 2px;">
                <b>Best use:</b> <i>${m.bestUse}</i>
              </div>
              <div style="color: #64748b; font-family: 'JetBrains Mono', monospace; font-size: 9px; margin-top: 1px;">
                ID: <code>${m.id}</code>
              </div>
            </div>
            <button type="button" onclick="window.NexusAI.switchGeminiModel('${m.id}')" style="padding: 5px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; background: ${isActive ? '#10b981' : '#06b6d4'}; color: #040711; border: none; cursor: pointer; white-space: nowrap;">
              ${isActive ? '✓ Đang chọn' : 'Chọn Model'}
            </button>
          </div>
        `;
      }).join('');

      return {
        handled: true,
        html: `
          <div style="font-weight: 800; color: #67e8f9; margin-bottom: 8px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-list-check"></i> DANH SÁCH 5 MÔ HÌNH GOOGLE GEMINI
          </div>
          ${rowsHtml}
          <div style="margin-top: 6px; font-size: 10px; color: #94a3b8;">
            💡 Bạn có thể bấm trực tiếp nút <b>[Chọn Model]</b> ở trên hoặc gõ: <code>gemini 3.8</code>, <code>gemini 3.7</code>, <code>gemini 3.6</code>, <code>gemini 3.5</code>, <code>gemini lite</code>.
          </div>
        `
      };
    }

    // 2. Switch to a specific model
    for (const m of GEMINI_MODELS) {
      let isMatch = false;
      if (m.id === 'gemini-3.8-flash' && (p.includes('3.8') || p.includes('gemini 3.8'))) isMatch = true;
      else if (m.id === 'gemini-3.7-flash' && (p.includes('3.7') || p.includes('gemini 3.7'))) isMatch = true;
      else if (m.id === 'gemini-3.6-flash' && (p.includes('3.6') || p.includes('gemini 3.6'))) isMatch = true;
      else if (m.id === 'gemini-3.5-flash-lite' && (p.includes('lite') || p.includes('flash-lite') || p.includes('flash lite') || p.includes('3.5 lite'))) isMatch = true;
      else if (m.id === 'gemini-3.5-flash' && !p.includes('lite') && (p.includes('3.5') || p.includes('gemini 3.5'))) isMatch = true;

      if (isMatch) {
        switchGeminiModel(m.id);
        return { handled: true, isSilent: true };
      }
    }

    // 3. Switch to Gemini provider
    if (p === 'gemini' || p.includes('đổi sang gemini') || p.includes('chuyển sang gemini') || p.includes('dùng gemini')) {
      const target = config.geminiModel || 'gemini-3.5-flash-lite';
      switchGeminiModel(target);
      return { handled: true, isSilent: true };
    }

    return null;
  }

  // -------------------------------------------------------------
  // AI PILOT COMMAND EXECUTION (Nhờ AI điều khiển hộ)
  // -------------------------------------------------------------
  function tryExecuteAIControlCommand(prompt) {
    if (typeof window.executeSandboxCommand !== 'function') return null;

    const p = prompt.toLowerCase().trim();

    // If the prompt is purely an inquiry / explanation question, don't hijack it as a control command unless explicitly commanded
    const isQuestion = p.includes('vì sao') || p.includes('tại sao') || p.includes('giải thích') || p.includes('sao cu') || p.includes('như thế nào') || p.includes('có phản ứng không') || p.includes('?');
    if (isQuestion) return null;

    let res = null;

    // Check for clear experiment / dọn bàn
    if (p.includes('xóa thí nghiệm') || p.includes('dọn bàn') || p.includes('xóa vật dụng') || p.includes('xóa hết') || p.includes('clear') || p === 'xóa' || p.includes('xoa') || p.includes('rửa') || p.includes('reset') || p.includes('làm lại') || p.includes('dọn')) {
      res = window.executeSandboxCommand('clearSim');
    } else if (p.includes('chế độ sáng') || p.includes('chế độ tối') || p.includes('sáng tối') || p.includes('chỉnh sáng') || p.includes('chỉnh tối') || p === 'sáng' || p === 'tối') {
      if (p.includes('sáng') && !p.includes('tối')) res = window.executeSandboxCommand('setTheme', 'light');
      else if (p.includes('tối') && !p.includes('sáng')) res = window.executeSandboxCommand('setTheme', 'dark');
      else res = window.executeSandboxCommand('toggleTheme');
    } else if (
      p.includes('na_h2o_phenol') ||
      ((p.includes('na') || p.includes('natri')) && (p.includes('phenol') || p.includes('phenolphthalein') || p.includes('hồng')))
    ) {
      res = window.executeSandboxCommand('setupReaction', 'Na_H2O_Phenol');
    } else if (p.includes('cho natri vào nước') || p.includes('na + h2o') || p.includes('natri và nước') || p.includes('thả natri')) {
      res = window.executeSandboxCommand('setupReaction', 'Na_H2O');
    } else if (p.includes('điều chế hidro') || p.includes('điều chế h2') || p.includes('zn + hcl') || p.includes('kẽm và hcl') || p.includes('kẽm + axit')) {
      res = window.executeSandboxCommand('setupReaction', 'Zn_HCl');
    } else if (p.includes('cu + h2so4') || p.includes('đồng và h2so4') || p.includes('đồng + h2so4') || p.includes('h2so4 đặc') || p.includes('cu_h2so4') || (p.includes('đồng') && p.includes('đặc'))) {
      res = window.executeSandboxCommand('setupReaction', 'Cu_H2SO4_dac');
    } else if (p.includes('cu + hcl') || p.includes('đồng và hcl') || p.includes('đồng + hcl') || p.includes('cu_hcl')) {
      res = window.executeSandboxCommand('setupReaction', 'Cu_HCl');
    } else if (p.includes('bacl2') || p.includes('baso4') || p.includes('kết tủa bari') || p.includes('bari và sunfat') || p.includes('nhận biết sunfat')) {
      res = window.executeSandboxCommand('setupReaction', 'BaCl2_H2SO4');
    } else if (p.includes('cuso4 + naoh') || p.includes('đồng hidroxit') || p.includes('cu(oh)2') || p.includes('kết tủa xanh')) {
      res = window.executeSandboxCommand('setupReaction', 'CuSO4_NaOH');
    } else if (p.includes('fecl3') || p.includes('sắt 3') || p.includes('sắt iii') || p.includes('fe(oh)3') || p.includes('kết tủa nâu đỏ')) {
      res = window.executeSandboxCommand('setupReaction', 'FeCl3_NaOH');
    } else if (p.includes('al + naoh') || p.includes('nhôm và naoh') || p.includes('nhôm tan trong kiềm') || p.includes('nhôm và kiềm') || p.includes('nhôm tác dụng dung dịch kiềm')) {
      res = window.executeSandboxCommand('setupReaction', 'Al_NaOH');
    } else if (p.includes('caco3') || p.includes('đá vôi') || p.includes('canxi cacbonat')) {
      res = window.executeSandboxCommand('setupReaction', 'CaCO3_HCl');
    } else if (p.includes('agno3 + hcl') || p.includes('bạc nitrat và hcl') || p.includes('kết tủa agcl') || p.includes('nhận biết cl')) {
      res = window.executeSandboxCommand('setupReaction', 'AgNO3_HCl');
    } else if (p.includes('cu + agno3') || p.includes('đồng và agno3') || p.includes('đồng đẩy bạc')) {
    } else if (p.includes('con lắc đơn') || p.includes('con lắc') || p.includes('treo con lắc')) {
      res = window.executeSandboxCommand('spawnApparatus', 'pendulum');
    } else if (p.includes('thước đo') || p.includes('thước milimet') || p.includes('thước')) {
      res = window.executeSandboxCommand('spawnApparatus', 'ruler');
    } else if (p.includes('lực kế') || p.includes('lò xo') || p.includes('lực kế lò xo')) {
      res = window.executeSandboxCommand('spawnApparatus', 'dynamometer');
    } else if ((p.includes('phenol') && (p.includes('naoh') || p.includes('kiềm'))) || p.includes('phenol_naoh')) {
      res = window.executeSandboxCommand('setupReaction', 'Phenol_NaOH');
    } else if (p.includes('nhiệt phân thuốc tím') || (p.includes('kmno4') && p.includes('nhiệt')) || p.includes('kmno4_heat')) {
      res = window.executeSandboxCommand('setupReaction', 'KMnO4_Heat');
    } else if ((p.includes('so2') && (p.includes('kmno4') || p.includes('thuốc tím'))) || p.includes('so2_kmno4')) {
      res = window.executeSandboxCommand('setupReaction', 'SO2_KMnO4');
    } else if ((p.includes('h2o2') && (p.includes('nhiệt') || p.includes('phân hủy'))) || p.includes('h2o2_o2') || p.includes('oxi già')) {
      res = window.executeSandboxCommand('setupReaction', 'H2O2_O2');
    } else if ((p.includes('cuso4') && p.includes('nh3')) || p.includes('phức đồng') || p.includes('cuso4_nh3')) {
      res = window.executeSandboxCommand('setupReaction', 'CuSO4_NH3');
    } else if ((p.includes('nh3') && p.includes('hcl')) || p.includes('khói trắng') || p.includes('nh3_hcl')) {
      res = window.executeSandboxCommand('setupReaction', 'NH3_HCl');
    } else if ((p.includes('ba(oh)2') && p.includes('h2so4')) || p.includes('baoh2_h2so4')) {
      res = window.executeSandboxCommand('setupReaction', 'BaOH2_H2SO4');
    } else if ((p.includes('feso4') && p.includes('naoh')) || p.includes('feso4_naoh')) {
      res = window.executeSandboxCommand('setupReaction', 'FeSO4_NaOH');
    } else if ((p.includes('na2co3') && p.includes('hcl')) || p.includes('na2co3_hcl')) {
      res = window.executeSandboxCommand('setupReaction', 'Na2CO3_HCl');
    } else if (p.includes('cu + agno3') || p.includes('đồng và agno3') || p.includes('đồng đẩy bạc')) {
      res = window.executeSandboxCommand('setupReaction', 'Cu_AgNO3');
    } else if (p.includes('trung hòa') || p.includes('phenolphthalein')) {
      res = window.executeSandboxCommand('setupReaction', 'Neutralization');
    } else if (p.includes('tráng gương') || p.includes('tráng bạc') || p.includes('glucose') || p.includes('glucozo')) {
      res = window.executeSandboxCommand('setupReaction', 'Glucose');
    } else if (p.includes('tinh bột và iot') || p.includes('tinh bột + iod') || p.includes('tinh bột')) {
      res = window.executeSandboxCommand('setupReaction', 'Starch_Iodine');
    } else if (p.includes('sắt và cuso4') || p.includes('fe + cuso4') || p.includes('mạ đồng')) {
      res = window.executeSandboxCommand('setupReaction', 'Fe_CuSO4');
    } else if (p.includes('etilen và brom') || p.includes('mất màu brom') || p.includes('c2h4 + br2')) {
      res = window.executeSandboxCommand('setupReaction', 'C2H4_Br2');
    } else if (p.includes('este hóa') || p.includes('este hoa') || p.includes('ch3cooh + c2h5oh') || p.includes('axit axetic và rượu') || p.includes('etyl axetat') || p.includes('chuối chín')) {
      res = window.executeSandboxCommand('setupReaction', 'Esterification');
    } else if (p.includes('đo ph') || p.includes('giấy ph') || p.includes('thang ph') || p.includes('thử ph')) {
      res = window.executeSandboxCommand('testPH');
    } else if (p.includes('đo nhiệt độ') || p.includes('đo nhiệt') || p.includes('nhiệt kế') || p.includes('cắm nhiệt kế')) {
      res = window.executeSandboxCommand('measureTemp');
    } else if (p.includes('nhỏ giọt') || p.includes('pipette') || p.includes('ống hút nhỏ giọt')) {
      res = window.executeSandboxCommand('dropPipette');
    } else if (p.includes('đồng hồ bấm giờ') || p.includes('bấm giờ') || p.includes('stopwatch')) {
      res = window.executeSandboxCommand('spawnApparatus', 'stopwatch');
    } else if (p.includes('thước đo góc') || p.includes('đo góc') || p.includes('thước đo độ') || p.includes('protractor')) {
      res = window.executeSandboxCommand('spawnApparatus', 'protractor');
    } else if (p.includes('biến trở') || p.includes('rheostat') || p.includes('chỉnh điện trở')) {
      res = window.executeSandboxCommand('spawnApparatus', 'circuit');
    } else if (p.includes('bật laser') || p.includes('bật đèn laser')) {
      res = window.executeSandboxCommand('setLaser', true);
    } else if (p.includes('tắt laser') || p.includes('tắt đèn laser')) {
      res = window.executeSandboxCommand('setLaser', false);
    } else if (p.includes('góc laser') || p.includes('chỉnh góc') || p.includes('quay laser')) {
      const match = p.match(/-?\d+(\.\d+)?/);
      const angle = match ? parseFloat(match[0]) : (p.includes('lên') ? -25 : p.includes('xuống') ? 25 : 0);
      res = window.executeSandboxCommand('setLaserAngle', angle);
    } else if (p.includes('chùm tia') || p.includes('3 tia') || p.includes('5 tia') || p.includes('1 tia')) {
      const rays = p.includes('5') ? 5 : p.includes('1') ? 1 : 3;
      res = window.executeSandboxCommand('setLaserRays', rays);
    } else if (p.includes('thấu kính hội tụ') || p.includes('kính hội tụ') || p.includes('lăng kính hội tụ')) {
      res = window.executeSandboxCommand('spawnApparatus', 'converging_lens');
    } else if (p.includes('thấu kính phân kỳ') || p.includes('kính phân kỳ') || p.includes('lăng kính phân kỳ')) {
      res = window.executeSandboxCommand('spawnApparatus', 'diverging_lens');
    } else if (p.includes('lăng kính') || p.includes('lăng kính tán sắc')) {
      res = window.executeSandboxCommand('spawnApparatus', 'prism');
    } else if (p.includes('tăng điện áp') || p.includes('tăng u') || p.includes('u =') || p.includes('volt')) {
      const match = p.match(/\d+(\.\d+)?/);
      const val = match ? parseFloat(match[0]) : 24;
      res = window.executeSandboxCommand('setVoltage', val);
    } else if (p.includes('giảm điện áp')) {
      res = window.executeSandboxCommand('setVoltage', 6);
    } else if (p.includes('đổi môi trường') || p.includes('môi trường') || p.includes('trọng lực')) {
      if (p.includes('mặt trăng')) res = window.executeSandboxCommand('setEnv', 'moon');
      else if (p.includes('thanh') || p.includes('động năng')) res = window.executeSandboxCommand('setEnv', 'pillar');
      else if (p.includes('sao hỏa')) res = window.executeSandboxCommand('setEnv', 'mars');
      else if (p.includes('không trọng lực')) res = window.executeSandboxCommand('setEnv', 'zero');
      else res = window.executeSandboxCommand('setEnv', 'earth');
    } else if (p.includes('nâng thanh') || p.includes('lên thanh') || p.includes('tăng độ cao')) {
      res = window.executeSandboxCommand('adjustPillar', 'up');
    } else if (p.includes('hạ thanh') || p.includes('xuống thanh') || p.includes('giảm độ cao')) {
      res = window.executeSandboxCommand('adjustPillar', 'down');
    } else if (p.includes('tắt ma sát') || p.includes('ma sát bằng 0') || p.includes('không ma sát')) {
      res = window.executeSandboxCommand('setFriction', 0);
    } else if (p.includes('tăng ma sát')) {
      res = window.executeSandboxCommand('setFriction', 0.08);
    } else if (p.includes('đóng khóa k') || p.includes('bật công tắc')) {
      res = window.executeSandboxCommand('setSwitch', true);
    } else if (p.includes('ngắt khóa k') || p.includes('tắt công tắc')) {
      res = window.executeSandboxCommand('setSwitch', false);
    } else if (p.includes('thả bóng') || p.includes('chạy') || p.includes('bắt đầu')) {
      res = window.executeSandboxCommand('startSim');
    } else if (p.includes('tạm dừng') || p.includes('dừng')) {
      res = window.executeSandboxCommand('pauseSim');
    } else if (p.includes('đặt lại') || p.includes('làm mới')) {
      res = window.executeSandboxCommand('resetSim');
    } else if (p.includes('bật đèn cồn') || p.includes('đun nóng') || p.includes('bật lửa')) {
      res = window.executeSandboxCommand('setBurner', true);
    } else if (p.includes('tắt đèn cồn') || p.includes('dập lửa')) {
      res = window.executeSandboxCommand('setBurner', false);
    } else if (p.includes('natri') || p.includes('na')) {
      res = window.executeSandboxCommand('addReagent', { type: 'metal', id: 'Na' });
    } else if (p.includes('magie') || p.includes('mg')) {
      res = window.executeSandboxCommand('addReagent', { type: 'metal', id: 'Mg' });
    } else if (p.includes('nhôm') || p.includes('al')) {
      res = window.executeSandboxCommand('addReagent', { type: 'metal', id: 'Al' });
    } else if (p.includes('sắt') || p.includes('fe')) {
      res = window.executeSandboxCommand('addReagent', { type: 'metal', id: 'Fe' });
    } else if (p.includes('kẽm') || p.includes('zn')) {
      res = window.executeSandboxCommand('addReagent', { type: 'metal', id: 'Zn' });
    } else if (p.includes('đồng') || p.includes('cu')) {
      res = window.executeSandboxCommand('addReagent', { type: 'metal', id: 'Cu' });
    } else if (p.includes('đá vôi') || p.includes('caco3')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solid', id: 'CaCO3' });
    } else if (p.includes('kmno4') || p.includes('thuốc tím')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'KMnO4' });
    } else if (p.includes('h2o2') || p.includes('oxi già')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'H2O2' });
    } else if (p.includes('nh3') || p.includes('amoniac')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'NH3' });
    } else if (p.includes('ba(oh)2') || p.includes('bari hidroxit')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'Ba(OH)2' });
    } else if (p.includes('feso4')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'FeSO4' });
    } else if (p.includes('na2co3')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'Na2CO3' });
    } else if (p.includes('h2so4 đặc') || p.includes('h2so4 dac')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'H2SO4_dac' });
    } else if (p.includes('h2so4') || p.includes('sunfuric')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'H2SO4' });
    } else if (p.includes('hcl') || p.includes('axit clohidric')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'HCl' });
    } else if (p.includes('nước cất') || p.includes('nước') || p.includes('h2o')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'H2O' });
    } else if (p.includes('bacl2') || p.includes('bari clorua')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'BaCl2' });
    } else if (p.includes('agno3') || p.includes('bạc nitrat')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'AgNO3' });
    } else if (p.includes('fecl3') || p.includes('sắt iii') || p.includes('sắt 3')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'FeCl3' });
    } else if (p.includes('nước vôi') || p.includes('ca(oh)2')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'CaOH2' });
    } else if (p.includes('phenol') && !p.includes('phenolphthalein')) {
      res = window.executeSandboxCommand('addReagent', { type: 'organic', id: 'Phenol' });
    } else if (p.includes('phenolphthalein')) {
      res = window.executeSandboxCommand('addReagent', { type: 'indicator', id: 'Phenol' });
    } else if (p.includes('cuso4') || p.includes('đồng sunfat')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'CuSO4' });
    } else if (p.includes('naoh') || p.includes('kiềm') || p.includes('natri hidroxit')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'NaOH' });
    } else if (p.includes('brom') || p.includes('br2')) {
      res = window.executeSandboxCommand('addReagent', { type: 'solution', id: 'Br2' });
    } else if (p.includes('etilen') || p.includes('c2h4')) {
      res = window.executeSandboxCommand('addReagent', { type: 'gas', id: 'C2H4' });
    } else if (p.includes('so2')) {
      res = window.executeSandboxCommand('addReagent', { type: 'gas', id: 'SO2' });
    } else if (p.includes('glucozo') || p.includes('glucose')) {
      res = window.executeSandboxCommand('addReagent', { type: 'organic', id: 'Glucose' });
    } else if (p.includes('tinh bột') || p.includes('tinh bot') || p.includes('iod') || p.includes('iot')) {
      res = window.executeSandboxCommand('addReagent', { type: 'organic', id: 'Starch_Iodine' });
    } else if (p.includes('quỳ tím')) {
      res = window.executeSandboxCommand('testLitmus');
    } else if (p.includes('que diêm')) {
      res = window.executeSandboxCommand('testMatch');
    } else if (p.includes('điều khiển') || p.includes('tối ưu')) {
      res = window.executeSandboxCommand('autoOptimize');
    }

    return res;
  }

  // Real-Time Snapshot Data Generator
  function generateDataReport() {
    if (typeof window.getSandboxData === 'function') {
      const data = window.getSandboxData();
      return `
        <div style="font-weight: 800; color: #38bdf8; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display:flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-chart-column"></i>
            <span>BÁO CÁO SỐ LIỆU THỜI GIAN THỰC</span>
          </div>
          <button onclick="window.NexusAI.startAutoData()" style="padding: 2px 8px; font-size: 10px; font-weight: bold; background: #06b6d4; color: #040711; border-radius: 6px; border: none; cursor: pointer;">
            Bật Data Auto
          </button>
        </div>
        <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 11px;">Trích xuất tự động tại thời điểm này:</p>
        <div class="nexus-data-card">
          ${data.formattedHtml}
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #34d399;">
          ⚡ Gõ <b>"data auto"</b> nếu muốn mở bảng tự động theo dõi liên tục.
        </div>
      `;
    }

    return `
      <div style="color: #f87171;">
        <i class="fa-solid fa-triangle-exclamation"></i> Không thể lấy dữ liệu: Sàn thí nghiệm chưa khởi tạo hook <code>getSandboxData()</code>.
      </div>
    `;
  }

  // -------------------------------------------------------------
  // ADVANCED LOCAL SCI-MATH ENGINE (Tính Toán & Giải Công Thức Offline)
  // -------------------------------------------------------------
  function computeOfflineSciMath(prompt) {
    const p = prompt.toLowerCase().trim();

    // 1. Gas volume at standard conditions (GDPT 2018: 25°C, 1 bar -> 24.79 L/mol)
    const gasMolMatch = p.match(/(?:tính\s*(?:thể tích|v)|thể tích|v\s*=)\s*(?:của\s*)?([0-9]+(?:\.[0-9]+)?)\s*(?:mol)/i) ||
                        p.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:mol)\s*(?:chất\s*khí|khí|ở\s*đkc)?\s*(?:có\s*thể\s*tích|tính\s*v|thể tích)/i);
    if (gasMolMatch) {
      const n = parseFloat(gasMolMatch[1]);
      const V = +(n * 24.79).toFixed(4);
      return `
        <div style="font-weight: 800; color: #34d399; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-calculator"></i> TÍNH THỂ TÍCH KHÍ Ở ĐIỀU KIỆN CHUẨN (ĐKC - GDPT 2018)
        </div>
        <p style="margin: 0 0 4px 0; color: #cbd5e1; font-size: 12px;">Theo chuẩn GDPT 2018 (IUPAC: $25^\\circ\\text{C}, 1\\text{ bar}$), 1 mol khí chiếm thể tích <b>24.79 L</b>:</p>
        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0;">
          $$V = n \\times 24.79 = ${n} \\times 24.79 = \\mathbf{${V}}\\text{ (Lít)}$$
        </div>
        <div style="font-size: 11px; color: #94a3b8;">
          ✓ Số mol $n = ${n}\\text{ mol}$ $\\implies$ Thể tích thu được là <b>${V} lít</b> (ở 25°C, 1 bar).
        </div>
      `;
    }

    // Cases: "tính số mol ... lít khí"
    const gasVolMatch = p.match(/(?:tính\s*(?:số\s*mol|mol|n)|có\s*bao\s*nhiêu\s*mol)\s*(?:của\s*)?([0-9]+(?:\.[0-9]+)?)\s*(?:l|lít|lit)/i) ||
                        p.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:l|lít|lit)\s*(?:khí|ở\s*đkc)?\s*(?:có\s*bao\s*nhiêu\s*mol|tính\s*mol)/i);
    if (gasVolMatch) {
      const V = parseFloat(gasVolMatch[1]);
      const n = +(V / 24.79).toFixed(4);
      return `
        <div style="font-weight: 800; color: #34d399; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-calculator"></i> TÍNH SỐ MOL CHẤT KHÍ TỪ THỂ TÍCH (ĐKC - GDPT 2018)
        </div>
        <p style="margin: 0 0 4px 0; color: #cbd5e1; font-size: 12px;">Công thức tính số mol khí ở điều kiện chuẩn ($25^\\circ\\text{C}, 1\\text{ bar}$):</p>
        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0;">
          $$n = \\frac{V}{24.79} = \\frac{${V}}{24.79} \\approx \\mathbf{${n}}\\text{ (mol)}$$
        </div>
        <div style="font-size: 11px; color: #94a3b8;">
          ✓ Với thể tích $V = ${V}\\text{ L}$, chất khí chứa xấp xỉ <b>${n} mol</b>.
        </div>
      `;
    }

    // 2. Molar mass & mole calculation n = m / M
    const MOLAR_MAP = {
      'cu': { name: 'Đồng (Cu)', M: 64 },
      'fe': { name: 'Sắt (Fe)', M: 56 },
      'al': { name: 'Nhôm (Al)', M: 27 },
      'zn': { name: 'Kẽm (Zn)', M: 65 },
      'mg': { name: 'Magie (Mg)', M: 24 },
      'na': { name: 'Natri (Na)', M: 23 },
      'k': { name: 'Kali (K)', M: 39 },
      'ca': { name: 'Canxi (Ca)', M: 40 },
      'ba': { name: 'Bari (Ba)', M: 137 },
      'ag': { name: 'Bạc (Ag)', M: 108 },
      'o2': { name: 'Khí Oxi (O₂)', M: 32 },
      'h2': { name: 'Khí Hiđro (H₂)', M: 2 },
      'co2': { name: 'Khí Cacbonic (CO₂)', M: 44 },
      'so2': { name: 'Khí Sunfurơ (SO₂)', M: 64 },
      'hcl': { name: 'Axit clohiđric (HCl)', M: 36.5 },
      'h2so4': { name: 'Axit sunfuric (H₂SO₄)', M: 98 },
      'naoh': { name: 'Natri hiđroxit (NaOH)', M: 40 },
      'caco3': { name: 'Đá vôi (CaCO₃)', M: 100 },
      'cuso4': { name: 'Đồng sunfat (CuSO₄)', M: 160 },
      'bacl2': { name: 'Bari clorua (BaCl₂)', M: 208 },
      'baso4': { name: 'Bari sunfat (BaSO₄)', M: 233 },
      'kmno4': { name: 'Thuốc tím (KMnO₄)', M: 158 },
      'h2o2': { name: 'Oxi già (H₂O₂)', M: 34 },
      'nh3': { name: 'Amoniac (NH₃)', M: 17 },
      'feso4': { name: 'Sắt(II) sunfat (FeSO₄)', M: 152 },
      'na2co3': { name: 'Natri cacbonat (Na₂CO₃)', M: 106 },
      'c6h5oh': { name: 'Phenol (C₆H₅OH)', M: 94 },
      'phenol': { name: 'Phenol (C₆H₅OH)', M: 94 },
      'glucozo': { name: 'Glucozơ (C₆H₁₂O₆)', M: 180 },
      'glucose': { name: 'Glucozơ (C₆H₁₂O₆)', M: 180 },
      'h2o': { name: 'Nước (H₂O)', M: 18 }
    };

    const molMassMatch = p.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:g|gam)\s*([a-z0-9\(\)]+)/i) ||
                         p.match(/(?:tính\s*mol|số\s*mol)\s*(?:của\s*)?([0-9]+(?:\.[0-9]+)?)\s*(?:g|gam)?\s*([a-z0-9\(\)]+)/i);
    if (molMassMatch) {
      const mass = parseFloat(molMassMatch[1]);
      const subKey = molMassMatch[2].toLowerCase();
      if (MOLAR_MAP[subKey]) {
        const sub = MOLAR_MAP[subKey];
        const n = +(mass / sub.M).toFixed(4);
        return `
          <div style="font-weight: 800; color: #38bdf8; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-flask-vial"></i> TÍNH SỐ MOL TỪ KHỐI LƯỢNG (n = m / M)
          </div>
          <p style="margin: 0 0 4px 0; color: #cbd5e1; font-size: 12px;">Chất: <b>${sub.name}</b> (Khối lượng mol $M = ${sub.M}\\text{ g/mol}$)</p>
          <div style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0;">
            $$n = \\frac{m}{M} = \\frac{${mass}}{${sub.M}} = \\mathbf{${n}}\\text{ (mol)}$$
          </div>
          <div style="font-size: 11px; color: #94a3b8;">
            ✓ Khối lượng $m = ${mass}\\text{ g}$ $\\implies$ Số mol tương ứng là <b>${n} mol</b>.
          </div>
        `;
      }
    }

    // 3. Nồng độ mol C_M = n / V
    const cmMatch = p.match(/(?:tính\s*cm|nồng độ mol).*?([0-9]+(?:\.[0-9]+)?)\s*mol.*?([0-9]+(?:\.[0-9]+)?)\s*(l|lít|ml)/i) ||
                    p.match(/([0-9]+(?:\.[0-9]+)?)\s*mol.*?trong\s*([0-9]+(?:\.[0-9]+)?)\s*(l|lít|ml)/i);
    if (cmMatch) {
      const n = parseFloat(cmMatch[1]);
      let vol = parseFloat(cmMatch[2]);
      const unit = cmMatch[3].toLowerCase();
      if (unit === 'ml') vol = vol / 1000;
      const CM = +(n / vol).toFixed(4);
      return `
        <div style="font-weight: 800; color: #a855f7; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-calculator"></i> TÍNH NỒNG ĐỘ MOL CỦA DUNG DỊCH (C_M)
        </div>
        <p style="margin: 0 0 4px 0; color: #cbd5e1; font-size: 12px;">Số mol chất tan $n = ${n}\\text{ mol}$, thể tích dung dịch $V = ${vol}\\text{ L}$:</p>
        <div style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0;">
          $$C_M = \\frac{n}{V} = \\frac{${n}}{${vol}} = \\mathbf{${CM}}\\text{ (M hoặc mol/L)}$$
        </div>
      `;
    }

    // 4. Định luật Ohm: I = U / R
    const ohmMatch = p.match(/(?:tính\s*i|dòng điện).*?u\s*=\s*([0-9]+(?:\.[0-9]+)?).*?r\s*=\s*([0-9]+(?:\.[0-9]+)?)/i) ||
                     p.match(/u\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*v.*?r\s*=\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (ohmMatch) {
      const U = parseFloat(ohmMatch[1]);
      const R = parseFloat(ohmMatch[2]);
      const I = +(U / R).toFixed(4);
      const P = +(U * I).toFixed(4);
      return `
        <div style="font-weight: 800; color: #eab308; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-bolt"></i> TÍNH DÒNG ĐIỆN THEO ĐỊNH LUẬT OHM
        </div>
        <p style="margin: 0 0 4px 0; color: #cbd5e1; font-size: 12px;">Hiệu điện thế $U = ${U}\\text{ V}$, Điện trở $R = ${R}\\ \\Omega$:</p>
        <div style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0;">
          $$I = \\frac{U}{R} = \\frac{${U}}{${R}} = \\mathbf{${I}}\\text{ (A)}$$
          $$P = U \\times I = ${U} \\times ${I} = \\mathbf{${P}}\\text{ (W)}$$
        </div>
        <div style="font-size: 11px; color: #94a3b8;">
          ✓ Cường độ dòng điện qua mạch: <b>${I} A</b>; Công suất tiêu thụ: <b>${P} W</b>.
        </div>
      `;
    }

    // 5. Chu kỳ con lắc đơn T = 2*pi*sqrt(l/g)
    const pendulumMatch = p.match(/(?:con lắc|chu kỳ|tính t).*?l\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*(?:m|cm)/i) ||
                          p.match(/l\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*(?:m|cm).*?(?:chu kỳ|tính t)/i);
    if (pendulumMatch) {
      let l = parseFloat(pendulumMatch[1]);
      if (p.includes('cm') && !p.includes(' ' + l + 'm')) l = l / 100;
      const g = 9.8;
      const T = +(2 * Math.PI * Math.sqrt(l / g)).toFixed(4);
      const f = +(1 / T).toFixed(4);
      return `
        <div style="font-weight: 800; color: #06b6d4; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-stopwatch"></i> TÍNH CHU KỲ CON LẮC ĐƠN
        </div>
        <p style="margin: 0 0 4px 0; color: #cbd5e1; font-size: 12px;">Chiều dài dây treo $l = ${l}\\text{ m}$, gia tốc trọng trường $g = 9.8\\text{ m/s}^2$:</p>
        <div style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0;">
          $$T = 2\\pi \\sqrt{\\frac{l}{g}} = 2\\pi \\sqrt{\\frac{${l}}{9.8}} \\approx \\mathbf{${T}}\\text{ (giây)}$$
          $$f = \\frac{1}{T} \\approx \\mathbf{${f}}\\text{ (Hz)}$$
        </div>
        <div style="font-size: 11px; color: #94a3b8;">
          ✓ Chu kỳ dao động riêng của con lắc là <b>${T} s</b> (tần số <b>${f} Hz</b>). Lưu ý: Chu kỳ <b>không phụ thuộc</b> vào khối lượng quả bóng!
        </div>
      `;
    }

    // 6. Định luật Hooke: F = k * delta_l => delta_l = F / k
    const hookeMatch = p.match(/(?:độ dãn|delta l|lò xo).*?k\s*=\s*([0-9]+(?:\.[0-9]+)?).*?f\s*=\s*([0-9]+(?:\.[0-9]+)?)/i) ||
                       p.match(/k\s*=\s*([0-9]+(?:\.[0-9]+)?).*?f\s*=\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (hookeMatch) {
      const k = parseFloat(hookeMatch[1]);
      const F = parseFloat(hookeMatch[2]);
      const dL = +(F / k).toFixed(4);
      const dL_cm = +(dL * 100).toFixed(2);
      return `
        <div style="font-weight: 800; color: #f43f5e; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-arrows-up-down"></i> TÍNH ĐỘ BIẾN DẠNG LÒ XO (ĐỊNH LUẬT HOOKE)
        </div>
        <p style="margin: 0 0 4px 0; color: #cbd5e1; font-size: 12px;">Độ cứng $k = ${k}\\text{ N/m}$, Lực tác dụng $F = ${F}\\text{ N}$:</p>
        <div style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0;">
          $$\\Delta l = \\frac{F}{k} = \\frac{${F}}{${k}} = \\mathbf{${dL}}\\text{ m} = \\mathbf{${dL_cm}}\\text{ cm}$$
        </div>
      `;
    }

    // 7. Sinh học / Di truyền / ADN: Chiều dài gen L = (N / 2) * 3.4
    const adnMatch = p.match(/(?:gen|adn|chiều dài).*?([0-9]+)\s*(?:nu|nucleotit|nucleotide)/i) ||
                     p.match(/n\s*=\s*([0-9]+)\s*(?:nu)?.*?tính\s*(?:chiều dài|l)/i);
    if (adnMatch) {
      const N = parseInt(adnMatch[1], 10);
      const L = +((N / 2) * 3.4).toFixed(2);
      const M = N * 300;
      const C = +(N / 20).toFixed(1);
      return `
        <div style="font-weight: 800; color: #10b981; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-dna"></i> TÍNH THÔNG SỐ PHÂN TỬ ADN / GEN
        </div>
        <p style="margin: 0 0 4px 0; color: #cbd5e1; font-size: 12px;">Tổng số nuclêôtit của gen: $N = ${N}\\text{ nu}$:</p>
        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0;">
          $$L = \\frac{N}{2} \\times 3.4 = \\frac{${N}}{2} \\times 3.4 = \\mathbf{${L}}\\text{ \\AA} = \\mathbf{${+(L/10).toFixed(2)}}\\text{ nm}$$
          $$M = N \\times 300 = ${N} \\times 300 = \\mathbf{${M}}\\text{ đvC}$$
          $$C = \\frac{N}{20} = \\mathbf{${C}}\\text{ chu kỳ xoắn}$$
        </div>
      `;
    }

    // 8. General calculator (e.g. "tính 12 * 24.79")
    const calcMatch = p.match(/tính\s*([0-9\.\s\+\-\*\/\(\)\^]+)/i);
    if (calcMatch) {
      const rawExpr = calcMatch[1].trim();
      if (/^[0-9\.\s\+\-\*\/\(\)]+$/.test(rawExpr) && rawExpr.length > 2) {
        try {
          const val = Function('"use strict"; return (' + rawExpr + ')')();
          if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
            const formatted = Number.isInteger(val) ? val : +val.toFixed(4);
            return `
              <div style="font-weight: 800; color: #38bdf8; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-calculator"></i> KẾT QUẢ PHÉP TÍNH NHANH
              </div>
              <div style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); padding: 8px 12px; border-radius: 8px; margin: 6px 0; font-size: 13px;">
                $$${rawExpr.replace(/\*/g, '\\times').replace(/\//g, '\\div')} = \\mathbf{${formatted}}$$
              </div>
            `;
          }
        } catch (e) {}
      }
    }

    return null;
  }

  // Smart Offline Fallback (Local AI Lập Trình Sẵn Chuyên Sâu)
  function getSmartOfflineFallback(prompt) {
    const p = prompt.toLowerCase();

    // Check Math Engine first
    const mathAns = computeOfflineSciMath(prompt);
    if (mathAns) return mathAns;

    let answer = '';

    // 1. Phản ứng của Đồng (Cu) với axit - Giải thích cốt lõi cho thắc mắc của học sinh
    if (p.includes('sao cu') || p.includes('tại sao đồng') || p.includes('cu + hcl') || p.includes('cu + h2so4') || p.includes('đồng và axit') || p.includes('đồng + hcl') || p.includes('đồng + h2so4') || p.includes('cu không tan') || (p.includes('đồng') && p.includes('axit')) || ((p.includes('đồng') || p.includes('cu')) && (p.includes('hcl') || p.includes('h2so4') || p.includes('axit') || p.includes('không tan')))) {
      answer = `
        <b style="color: #f43f5e; font-size: 13px;">Bản chất phản ứng của Kim loại Đồng (Cu) với các Axit:</b><br/>
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li>❌ <b>Với axit HCl và H₂SO₄ loãng (Điều kiện thường):</b><br/>
            $$\\text{Cu} + \\text{HCl} \\longrightarrow \\text{KHÔNG PHẢN ỨNG!}$$
            $$\\text{Cu} + \\text{H}_2\\text{SO}_4\\text{ (loãng)} \\longrightarrow \\text{KHÔNG PHẢN ỨNG!}$$
            <b>Giải thích chuẩn SGK:</b> Dựa vào <b>dãy hoạt động hóa học của kim loại</b>:<br/>
            $$\\text{K} > \\text{Na} > \\text{Ca} > \\text{Mg} > \\text{Al} > \\text{Zn} > \\text{Fe} > \\text{Pb} > \\mathbf{(H)} > \\mathbf{Cu} > \\text{Ag} > \\text{Au}$$
            Kim loại Đồng $(\\text{Cu})$ đứng <b>sau nguyên tố Hiđro (H)</b>, thế điện cực chuẩn $E^\\circ(\\text{Cu}^{2+}/\\text{Cu}) = +0.34\\text{ V} > E^\\circ(2\\text{H}^+/\\text{H}_2) = 0.00\\text{ V}$. Tính khử của Đồng yếu hơn Hiđro, do đó ion $\\text{H}^+$ trong các axit thông thường <b>không thể oxi hóa được Cu</b>. Mẩu đồng giữ nguyên vẹn, <b>tuyệt đối không sủi bọt khí</b> và dung dịch trong suốt.
          </li>
          <li style="margin-top: 8px;">✔️ <b>Với axit H₂SO₄ ĐẶC, NÓNG (Khi đun với đèn cồn):</b><br/>
            $$\\text{Cu} + 2\\text{H}_2\\text{SO}_4\\text{ (đặc)} \\xrightarrow{t^\\circ} \\text{CuSO}_4 + \\text{SO}_2\\uparrow + 2\\text{H}_2\\text{O}$$
            <b>Hiện tượng:</b> Kim loại đồng tan dần, dung dịch chuyển sang <b>màu xanh lam đậm</b> đặc trưng của muối $\\text{CuSO}_4$, đồng thời sủi bọt khí <b>$\\text{SO}_2$ (khí sunfurơ mùi hắc)</b>. Đưa que diêm lại gần sẽ bị dập tắt ngay do $\\text{SO}_2$ không duy trì sự cháy.<br/>
            <b>Bản chất:</b> Lúc này $\\text{H}_2\\text{SO}_4$ đặc thể hiện tính oxi hóa cực mạnh của lưu huỳnh số oxi hóa cao nhất $(+6)$, đưa $\\text{Cu}^0$ lên $\\text{Cu}^{+2}$.
          </li>
        </ul>
      `;
    }
    // 2. BaCl2 + H2SO4 (Nhận biết gốc Sunfat)
    else if (p.includes('bacl2') || p.includes('baso4') || p.includes('kết tủa bari') || p.includes('bari') || p.includes('nhận biết sunfat')) {
      answer = `
        <b style="color: #38bdf8;">Phản ứng nhận biết gốc Sunfat bằng Bari clorua (BaCl₂):</b><br/>
        $$\\text{BaCl}_2 + \\text{H}_2\\text{SO}_4 \\longrightarrow \\text{BaSO}_4\\downarrow\\text{ (trắng)} + 2\\text{HCl}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Ngay khi nhỏ $\\text{BaCl}_2$ vào $\\text{H}_2\\text{SO}_4$, lập tức xuất hiện <b>kết tủa màu trắng sữa dày đặc</b> của $\\text{BaSO}_4$.</li>
          <li><b>Đặc tính:</b> Kết tủa $\\text{BaSO}_4$ cực kỳ bền vững, <b>không tan</b> trong dung dịch axit mạnh dư (kể cả $\\text{HCl}$ hay $\\text{HNO}_3$).</li>
          <li><b>Ý nghĩa phân tích:</b> Muối Bari là thuốc thử số 1 để nhận biết sự có mặt của ion sunfat $(\\text{SO}_4^{2-})$.</li>
        </ul>
      `;
    }
    // 3. CuSO4 + 2NaOH -> Cu(OH)2 và nhiệt phân thành CuO
    else if (p.includes('cuso4') || p.includes('cu(oh)2') || p.includes('đồng hidroxit') || p.includes('kết tủa xanh')) {
      answer = `
        <b style="color: #38bdf8;">Phản ứng tạo Đồng(II) hiđroxit và Nhiệt phân:</b><br/>
        $$\\text{CuSO}_4 + 2\\text{NaOH} \\longrightarrow \\text{Cu(OH)}_2\\downarrow\\text{ (xanh lam)} + \\text{Na}_2\\text{SO}_4$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Dung dịch $\\text{CuSO}_4$ màu xanh lam khi gặp dung dịch kiềm $\\text{NaOH}$ tạo thành <b>kết tủa dạng keo nhầy màu xanh lam tươi</b> $\\text{Cu(OH)}_2$.</li>
          <li><b>Nung nóng với đèn cồn:</b> Khi đưa đèn cồn vào đáy ống nghiệm đun sôi:
            $$\\text{Cu(OH)}_2 \\xrightarrow{t^\\circ} \\text{CuO}\\downarrow\\text{ (màu đen)} + \\text{H}_2\\text{O}$$
            Kết tủa xanh lam nhanh chóng chuyển hóa thành chất rắn màu đen của Đồng(II) oxit $(\\text{CuO})$!
          </li>
        </ul>
      `;
    }
    // 4. FeCl3 + 3NaOH -> Fe(OH)3 (Kết tủa nâu đỏ)
    else if (p.includes('fecl3') || p.includes('sắt 3') || p.includes('sắt iii') || p.includes('fe(oh)3') || p.includes('nâu đỏ')) {
      answer = `
        <b style="color: #f97316;">Phản ứng tạo Sắt(III) hiđroxit (Fe(OH)₃):</b><br/>
        $$\\text{FeCl}_3 + 3\\text{NaOH} \\longrightarrow \\text{Fe(OH)}_3\\downarrow\\text{ (nâu đỏ)} + 3\\text{NaCl}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Dung dịch $\\text{FeCl}_3$ màu vàng nâu khi tác dụng với kiềm lập tức sinh ra <b>kết tủa màu nâu đỏ vón cục</b> của $\\text{Fe(OH)}_3$.</li>
          <li><b>Phân biệt ion sắt trong SGK:</b>
            <br/>• Muối $\\text{Fe}^{2+}$ tạo kết tủa trắng xanh $\\text{Fe(OH)}_2$ (để trong không khí hóa nâu đỏ).
            <br/>• Muối $\\text{Fe}^{3+}$ tạo kết tủa nâu đỏ $\\text{Fe(OH)}_3$ bền vững ngay lập tức.
          </li>
        </ul>
      `;
    }
    // 5. Al + NaOH (Nhôm tan trong kiềm)
    else if (p.includes('al + naoh') || p.includes('nhôm và naoh') || p.includes('nhôm tan') || p.includes('nhôm và kiềm') || (p.includes('nhôm') && p.includes('kiềm'))) {
      answer = `
        <b style="color: #34d399;">Phản ứng đặc trưng: Nhôm (Al) tan trong dung dịch kiềm bazơ NaOH:</b><br/>
        $$2\\text{Al} + 2\\text{NaOH} + 2\\text{H}_2\\text{O} \\longrightarrow 2\\text{NaAlO}_2 + 3\\text{H}_2\\uparrow$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Miếng nhôm sủi bọt khí $\\text{H}_2$ mãnh liệt, dung dịch nóng lên nhiều và lá nhôm tan dần đến hết.</li>
          <li><b>Cơ chế phản ứng:</b> Đầu tiên màng oxit lưỡng tính $\\text{Al}_2\\text{O}_3$ bọc ngoài bị kiềm hòa tan. Sau đó kim loại $\\text{Al}$ khử nước tạo $\\text{Al(OH)}_3$ và khí $\\text{H}_2$. Kết tủa $\\text{Al(OH)}_3$ tiếp tục tan trong $\\text{NaOH}$ tạo muối tan Natri aluminat $(\\text{NaAlO}_2)$, làm phản ứng diễn ra liên tục.</li>
        </ul>
      `;
    }
    // 6. CaCO3 + 2HCl (Đá vôi và axit)
    else if (p.includes('caco3') || p.includes('đá vôi') || p.includes('cacbonat')) {
      answer = `
        <b style="color: #e2e8f0;">Phản ứng giữa Đá Vôi (CaCO₃) và Axit clohidric (HCl):</b><br/>
        $$\\text{CaCO}_3 + 2\\text{HCl} \\longrightarrow \\text{CaCl}_2 + \\text{CO}_2\\uparrow + \\text{H}_2\\text{O}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Mẩu đá vôi tan dần, sủi bọt khí Cacbonic $(\\text{CO}_2)$ không màu xối xả.</li>
          <li><b>Thử que diêm:</b> Đưa que diêm đang cháy lại gần miệng ống nghiệm $\\to$ <b>Ngọn lửa bị dập tắt ngay lập tức</b> vì $\\text{CO}_2$ không duy trì sự cháy.</li>
          <li><b>Thử nước vôi trong:</b> Dẫn khí $\\text{CO}_2$ qua dung dịch $\\text{Ca(OH)}_2$ trong suốt sẽ làm nước vôi bị <b>vẩn đục trắng</b>: $\\text{CO}_2 + \\text{Ca(OH)}_2 \\to \\text{CaCO}_3\\downarrow + \\text{H}_2\\text{O}$.</li>
        </ul>
      `;
    }
    // 7. Cu + 2AgNO3 (Đồng đẩy Bạc)
    else if (p.includes('cu + agno3') || p.includes('đồng và agno3') || p.includes('đồng đẩy bạc') || (p.includes('đồng') && p.includes('bạc'))) {
      answer = `
        <b style="color: #38bdf8;">Phản ứng Đồng (Cu) đẩy Bạc (Ag) ra khỏi dung dịch AgNO₃:</b><br/>
        $$\\text{Cu} + 2\\text{AgNO}_3 \\longrightarrow \\text{Cu(NO}_3)_2 + 2\\text{Ag}\\downarrow$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Nhúng lá đồng đỏ vào dung dịch $\\text{AgNO}_3$ không màu, sau một thời gian thấy các <b>tinh thể kim loại Bạc màu xám trắng lấp lánh</b> bám phủ ngoài lá đồng; dung dịch chuyển dần sang <b>màu xanh lam nhạt</b> của ion $\\text{Cu}^{2+}$.</li>
          <li><b>Quy tắc:</b> Trong dãy hoạt động hóa học, $\\text{Cu}$ đứng trước $\\text{Ag}$ nên có tính khử mạnh hơn, đẩy được $\\text{Ag}^+$ ra khỏi muối.</li>
        </ul>
      `;
    }
    // 8. AgNO3 + HCl (Nhận biết ion Cl-)
    else if (p.includes('agno3 + hcl') || p.includes('agcl') || p.includes('nhận biết cl')) {
      answer = `
        <b style="color: #cbd5e1;">Phản ứng nhận biết ion Clorua (Cl⁻) bằng Bạc nitrat (AgNO₃):</b><br/>
        $$\\text{AgNO}_3 + \\text{HCl} \\longrightarrow \\text{AgCl}\\downarrow\\text{ (trắng vón)} + \\text{HNO}_3$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Xuất hiện <b>kết tủa màu trắng vón cục</b> của $\\text{AgCl}$ lắng xuống đáy.</li>
          <li><b>Đặc tính:</b> Kết tủa $\\text{AgCl}$ không tan trong axit mạnh dư như $\\text{HNO}_3$. Dùng để nhận biết axit $\\text{HCl}$ và các muối clorua.</li>
        </ul>
      `;
    }
    // 8B. Phenol tác dụng NaOH & Tính tan của Phenol (Vẩn đục hóa trong suốt)
    else if (p.includes('phenol') && (p.includes('naoh') || p.includes('kiềm') || p.includes('trong suốt') || p.includes('vẩn đục') || p.includes('đục') || p.includes('nước') || p.includes('tan') || p.includes('co2'))) {
      answer = `
        <b style="color: #ec4899; font-size: 13px;">Bản chất phản ứng của Phenol (C₆H₅OH) với NaOH & Giải thích tính tan:</b><br/>
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li><b>Hiện tượng 1: Tính tan trong nước lạnh (Vẩn đục nhũ tương):</b><br/>
            Phenol có vòng benzen $(-\\text{C}_6\\text{H}_5)$ kỵ nước chiếm tỉ lệ lớn trong phân tử, nên ở nhiệt độ phòng phenol <b>rất ít tan trong nước lạnh</b> (khoảng $8.3\\text{ g}/100\\text{ g } \\text{H}_2\\text{O}$ ở $20^\\circ\\text{C}$). Khi cho tinh thể phenol vào nước cất, nó phân tán tạo thành <b>nhũ tương vẩn đục màu trắng sữa</b>.
          </li>
          <li style="margin-top: 8px;"><b>Hiện tượng 2: Tác dụng với dung dịch kiềm NaOH (Chuyển sang trong suốt hoàn toàn):</b><br/>
            $$\\text{C}_6\\text{H}_5\\text{OH (vẩn đục)} + \\text{NaOH} \\longrightarrow \\text{C}_6\\text{H}_5\\text{ONa (tan)} + \\text{H}_2\\text{O}$$
            <b>Giải thích chuẩn SGK:</b> Phenol có tính axit yếu (mạnh hơn ancol nhờ hiệu ứng liên hợp $p-\\pi$ của vòng benzen hút electron của nhóm $-\\text{OH}$ làm liên kết $\\text{O}-\\text{H}$ phân cực mạnh). Phenol phản ứng với bazơ mạnh $\\text{NaOH}$ tạo thành muối <b>Natri phenolat ($\\text{C}_6\\text{H}_5\\text{ONa}$)</b>. Đây là hợp chất ion phân ly hoàn toàn trong nước, tan rất tốt, do đó toàn bộ kết tủa vẩn đục tan hết, dung dịch <b>trở nên trong suốt như nước cất</b>!
            <br/><i>(Lưu ý: Nếu cho kim loại Natri vào nước trước: $2\\text{Na} + 2\\text{H}_2\\text{O} \\to 2\\text{NaOH} + \\text{H}_2\\uparrow$. Dung dịch sinh ra kiềm $\\text{NaOH}$, sau đó thả phenol vào cũng sẽ xảy ra phản ứng trên và dung dịch trong suốt!)</i>
          </li>
          <li style="margin-top: 8px;"><b>Hiện tượng 3: Tái kết tủa khi sục khí CO₂ hoặc thêm Axit:</b><br/>
            $$\\text{C}_6\\text{H}_5\\text{ONa} + \\text{CO}_2 + \\text{H}_2\\text{O} \\longrightarrow \\text{C}_6\\text{H}_5\\text{OH}\\downarrow\\text{ (vẩn đục trở lại)} + \\text{NaHCO}_3$$
            $$\\text{C}_6\\text{H}_5\\text{ONa} + \\text{HCl} \\longrightarrow \\text{C}_6\\text{H}_5\\text{OH}\\downarrow\\text{ (vẩn đục trở lại)} + \\text{NaCl}$$
            <b>Bản chất:</b> Phenol là axit rất yếu ($pK_a \\approx 10$), yếu hơn cả axit cacbonic ($\\text{H}_2\\text{CO}_3$). Do vậy, khí $\\text{CO}_2$ hoặc axit vô cơ mạnh sẽ đẩy phenol ra khỏi muối phenolat, làm dung dịch <b>vẩn đục trở lại</b>!
          </li>
        </ul>
      `;
    }
    // 8C. KMnO4 nhiệt phân & thuốc tím
    else if (p.includes('kmno4') || p.includes('thuốc tím') || p.includes('nhiệt phân thuốc tím')) {
      answer = `
        <b style="color: #a855f7; font-size: 13px;">Phản ứng của Kali pemanganat (KMnO₄ - Thuốc tím):</b><br/>
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li><b>Nhiệt phân điều chế Oxi trong phòng thí nghiệm:</b><br/>
            $$2\\text{KMnO}_4 \\xrightarrow{t^\\circ} \\text{K}_2\\text{MnO}_4 + \\text{MnO}_2\\downarrow\\text{ (đen)} + \\text{O}_2\\uparrow$$
            <b>Hiện tượng:</b> Tinh thể màu tím đen bị phân hủy giải phóng khí Oxi ($\\text{O}_2$). Khi đưa que đóm còn tàn đỏ lại gần miệng ống nghiệm, <b>que đóm bùng cháy sáng chói</b>!
          </li>
          <li style="margin-top: 8px;"><b>Mất màu tím với khí SO₂ (Tính oxi hóa mạnh của Mn⁺⁷):</b><br/>
            $$5\\text{SO}_2 + 2\\text{KMnO}_4 + 2\\text{H}_2\\text{O} \\longrightarrow \\text{K}_2\\text{SO}_4 + 2\\text{MnSO}_4\\text{ (không màu)} + 2\\text{H}_2\\text{SO}_4$$
            Dung dịch thuốc tím bị mất màu tím đặc trưng, chuyển sang trong suốt không màu. Dùng để nhận biết khí $\\text{SO}_2$.
          </li>
        </ul>
      `;
    }
    // 8D. H2O2 Nước Oxi Già
    else if (p.includes('h2o2') || p.includes('oxi già') || p.includes('hydrogen peroxide')) {
      answer = `
        <b style="color: #38bdf8;">Phản ứng phân hủy Nước Oxi Già (H₂O₂):</b><br/>
        $$2\\text{H}_2\\text{O}_2 \\xrightarrow{\\text{xúc tác } \\text{MnO}_2,\\, t^\\circ} 2\\text{H}_2\\text{O} + \\text{O}_2\\uparrow$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Khi đun nóng hoặc có xúc tác $\\text{MnO}_2$, bọt khí Oxi ($\\text{O}_2$) sủi lên xối xả.</li>
          <li><b>Thử que đóm:</b> Đưa que đóm còn tàn đỏ lại gần miệng ống nghiệm $\\to$ <b>Que đóm bùng cháy dữ dội</b> chứng minh có khí oxi thoát ra!</li>
        </ul>
      `;
    }
    // 8E. Amoniac NH3 & Khói trắng, Phức đồng
    else if (p.includes('nh3') || p.includes('amoniac') || p.includes('khói trắng') || p.includes('phức đồng')) {
      answer = `
        <b style="color: #67e8f9;">Các phản ứng đặc trưng của Amoniac (NH₃):</b><br/>
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li><b>Tác dụng với khí HCl $\\to$ Khói trắng dày đặc:</b><br/>
            $$\\text{NH}_{3\\text{ (khí)}} + \\text{HCl}_{\\text{ (khí)}} \\longrightarrow \\text{NH}_4\\text{Cl}_{\\text{ (rắn)}}$$
            Hai đũa thủy tinh nhúng vào dung dịch $\\text{NH}_3$ đặc và $\\text{HCl}$ đặc đưa lại gần nhau sinh ra làn <b>khói trắng mịt mù</b> do tinh thể muối amoni clorua cực mịn bay lơ lửng.
          </li>
          <li style="margin-top: 8px;"><b>Tác dụng với CuSO₄ tạo kết tủa rồi tan thành phức chất màu xanh thẫm:</b><br/>
            $$\\text{CuSO}_4 + 2\\text{NH}_3 + 2\\text{H}_2\\text{O} \\longrightarrow \\text{Cu(OH)}_2\\downarrow\\text{ (xanh lam)} + (\\text{NH}_4)_2\\text{SO}_4$$
            Khi nhỏ tiếp $\\text{NH}_3$ đến dư, kết tủa $\\text{Cu(OH)}_2$ tan ra:
            $$\\text{Cu(OH)}_2 + 4\\text{NH}_3 \\longrightarrow [\\text{Cu}(\\text{NH}_3)_4](\\text{OH})_2\\text{ (dung dịch phức chất xanh lam thẫm)}$$
            Dung dịch trong suốt có màu xanh lam thẫm đặc trưng (nước Schweizer hòa tan xenlulozơ).
          </li>
        </ul>
      `;
    }
    // 8F. Ba(OH)2 + H2SO4
    else if ((p.includes('ba(oh)2') || p.includes('bari')) && (p.includes('h2so4') || p.includes('sunfuric') || p.includes('dẫn điện'))) {
      answer = `
        <b style="color: #38bdf8;">Phản ứng giữa Bari hiđroxit Ba(OH)₂ và Axit Sunfuric H₂SO₄:</b><br/>
        $$\\text{Ba(OH)}_2 + \\text{H}_2\\text{SO}_4 \\longrightarrow \\text{BaSO}_4\\downarrow\\text{ (kết tủa trắng)} + 2\\text{H}_2\\text{O}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Xuất hiện ngay lập tức kết tủa màu trắng sữa $\\text{BaSO}_4$ không tan trong axit dư. Phản ứng đồng thời tỏa nhiệt.</li>
          <li><b>Biến thiên độ dẫn điện:</b> Cả cation $\\text{Ba}^{2+}$ và anion $\\text{SO}_4^{2-}$ đều chuyển thành kết tủa không tan, $\\text{H}^+$ và $\\text{OH}^-$ tạo $\\text{H}_2\\text{O}$ không dẫn điện. Tại điểm tương đương, <b>độ dẫn điện của dung dịch giảm về gần bằng 0</b> (bóng đèn thử mạch điện tắt hẳn)!</li>
        </ul>
      `;
    }
    // 8G. FeSO4 + NaOH
    else if (p.includes('feso4') || (p.includes('sắt 2') || p.includes('sắt ii') || p.includes('trắng xanh'))) {
      answer = `
        <b style="color: #4ade80;">Phản ứng tạo Sắt(II) hiđroxit Fe(OH)₂ và sự chuyển màu trong không khí:</b><br/>
        $$\\text{FeSO}_4 + 2\\text{NaOH} \\longrightarrow \\text{Fe(OH)}_2\\downarrow\\text{ (trắng xanh)} + \\text{Na}_2\\text{SO}_4$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng ban đầu:</b> Xuất hiện kết tủa <b>màu trắng xanh</b> của $\\text{Fe(OH)}_2$.</li>
          <li><b>Sự biến đổi màu trong không khí ẩm:</b> Để ngoài không khí một thời gian, kết tủa trắng xanh nhanh chóng bị oxi hòa tan oxi hóa chuyển dần sang <b>màu nâu đỏ</b> của $\\text{Fe(OH)}_3$:
            $$4\\text{Fe(OH)}_2\\text{ (trắng xanh)} + \\text{O}_2 + 2\\text{H}_2\\text{O} \\longrightarrow 4\\text{Fe(OH)}_3\\downarrow\\text{ (nâu đỏ)}$$
          </li>
        </ul>
      `;
    }
    // 8H. Na2CO3 + HCl
    else if (p.includes('na2co3') || p.includes('natri cacbonat')) {
      answer = `
        <b style="color: #e2e8f0;">Phản ứng giữa Natri cacbonat (Na₂CO₃) và Axit HCl:</b><br/>
        $$\\text{Na}_2\\text{CO}_3 + 2\\text{HCl} \\longrightarrow 2\\text{NaCl} + \\text{CO}_2\\uparrow + \\text{H}_2\\text{O}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Dung dịch sủi bọt khí $\\text{CO}_2$ mạnh mẽ, không màu, không mùi.</li>
          <li><b>Thử que diêm:</b> Đưa que diêm đang cháy lại gần miệng ống nghiệm $\\to$ <b>Ngọn lửa tắt ngay</b> vì $\\text{CO}_2$ không duy trì sự cháy.</li>
        </ul>
      `;
    }
    // 9A. Natri tác dụng Nước có sẵn Phenolphthalein
    else if ((p.includes('na') || p.includes('natri')) && (p.includes('phenol') || p.includes('phenolphthalein') || p.includes('hồng'))) {
      answer = `
        <b style="color: #ec4899; font-size: 13px;">Thí nghiệm Natri (Na) tác dụng Nước (H₂O) có sẵn Chỉ thị Phenolphthalein:</b><br/>
        $$2\\text{Na} + 2\\text{H}_2\\text{O} \\longrightarrow 2\\text{NaOH} + \\text{H}_2\\uparrow$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng quan sát:</b>
            <br/>• Mẩu Natri nóng chảy thành viên bi bạc tròn xoe, chạy nhanh trên mặt nước và sủi bọt khí $\\text{H}_2\\uparrow$ mãnh liệt.
            <br/>• Toàn bộ dung dịch trong cốc chuyển ngay sang <b>màu hồng cánh sen (hồng đậm) rực rỡ</b>!
          </li>
          <li><b>Giải thích bản chất hóa học chuẩn SGK:</b>
            <br/>• Phản ứng sinh ra dung dịch <b>Natri hiđroxit (NaOH)</b> là một bazơ kiềm tan mạnh, điện li hoàn toàn giải phóng lượng lớn ion hiđroxit:
            $$\\text{NaOH} \\longrightarrow \\text{Na}^+ + \\text{OH}^- \\quad (\\text{pH} \\approx 13.5)$$
            <br/>• Chỉ thị <b>Phenolphthalein</b> không màu trong nước nguyên chất $(\\text{pH} = 7)$, nhưng khi nồng độ $[\\text{OH}^-]$ tăng cao $(\\text{pH} > 8.3)$, vòng lacton mở ra tạo cấu trúc quinoid liên hợp, làm dung dịch <b>hóa màu hồng cánh sen</b>.
            <br/>• Nếu tiếp tục nhỏ axit $(\\text{HCl}$ hoặc $\\text{H}_2\\text{SO}_4)$ vào đến khi trung hòa hết bazơ $\\text{NaOH}$, dung dịch sẽ <b>mất màu hồng và trở lại trong suốt</b>!
          </li>
        </ul>
      `;
    }
    // 9. Phản ứng trung hòa & Chỉ thị Phenolphthalein
    else if (p.includes('trung hòa') || p.includes('phenol') || p.includes('phenolphthalein') || p.includes('chuẩn độ')) {
      answer = `
        <b style="color: #f472b6;">Phản ứng Trung Hòa Axit - Bazơ & Chỉ thị Phenolphthalein:</b><br/>
        $$\\text{NaOH} + \\text{HCl} \\longrightarrow \\text{NaCl} + \\text{H}_2\\text{O}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Đổi màu chỉ thị:</b>
            <br/>• Nhỏ dung dịch Phenolphthalein vào kiềm $\\text{NaOH}$ $(\\text{pH} > 8.3) \\to$ Dung dịch có <b>màu hồng cánh sen đậm</b> rực rỡ.
            <br/>• Nhỏ từ từ dung dịch axit $\\text{HCl}$ vào trung hòa hết ion $\\text{OH}^-$ đạt $\\text{pH} = 7 \\to$ Dung dịch <b>mất màu hồng hoàn toàn, trở lại trong suốt</b>!
          </li>
          <li><b>Phương trình ion thu gọn:</b> $\\text{H}^+ + \\text{OH}^- \\longrightarrow \\text{H}_2\\text{O}$ (phản ứng tỏa nhiệt).</li>
        </ul>
      `;
    }
    // 10. Fe + CuSO4 -> FeSO4 + Cu (Đinh sắt vào đồng sunfat)
    else if (p.includes('fe + cuso4') || p.includes('sắt và cuso4') || p.includes('mạ đồng')) {
      answer = `
        <b style="color: #38bdf8;">Phản ứng Kim loại Sắt (Fe) đẩy Đồng (Cu) ra khỏi dung dịch CuSO₄:</b><br/>
        $$\\text{Fe} + \\text{CuSO}_4 \\longrightarrow \\text{FeSO}_4 + \\text{Cu}\\downarrow$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Ngâm đinh sắt vào dung dịch $\\text{CuSO}_4$ màu xanh lam, lớp <b>kim loại Đồng màu đỏ gạch</b> bám ngoài đinh sắt, màu xanh lam của dung dịch nhạt dần chuyển sang màu lục rất nhạt của $\\text{FeSO}_4$.</li>
          <li><b>Bản chất:</b> Sắt đứng trước Đồng trong dãy hoạt động hóa học $(\\text{Fe} > \\text{Cu})$ nên đẩy được Đồng ra khỏi muối.</li>
        </ul>
      `;
    }
    // 11. Na + H2O
    else if (p.includes('natri') || p.includes('na') || p.includes('nóng chảy')) {
      answer = `
        <b style="color: #fbbf24;">Phản ứng của Natri (Na) với nước:</b><br/>
        $$2\\text{Na} + 2\\text{H}_2\\text{O} \\longrightarrow 2\\text{NaOH} + \\text{H}_2\\uparrow$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Mẩu Natri nóng chảy vo tròn thành viên bi bạc chạy nhanh trên mặt nước, sủi bọt khí $\\text{H}_2\\uparrow$, bốc khói trắng và ngọn lửa vàng tí tách do tỏa nhiệt lớn.</li>
          <li><b>Bản chất:</b> Dung dịch thu được là $\\text{NaOH}$ có tính kiềm mạnh ($\\text{pH} \\approx 13.5$), làm quỳ tím hóa xanh và phenolphthalein hóa hồng.</li>
        </ul>
      `;
    }
    // 12. Zn + HCl
    else if (p.includes('kẽm') || p.includes('zn') || p.includes('điều chế hidro') || p.includes('hidro') || p.includes('h2')) {
      answer = `
        <b style="color: #2dd4bf;">Phản ứng điều chế khí Hidro (H₂) trong phòng thí nghiệm:</b><br/>
        $$\\text{Zn} + 2\\text{HCl} \\longrightarrow \\text{ZnCl}_2 + \\text{H}_2\\uparrow$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Viên kẽm tan dần, bọt khí $\\text{H}_2$ không màu sủi tăm đều đặn từ bề mặt viên kẽm.</li>
          <li><b>Thử que diêm:</b> Thu khí $\\text{H}_2$ vào ống nghiệm rồi đưa que diêm đang cháy lại gần miệng ống, khí $\\text{H}_2$ cháy kèm <b>tiếng nổ "BỐP!"</b> đặc trưng: $2\\text{H}_2 + \\text{O}_2 \\xrightarrow{t^\\circ} 2\\text{H}_2\\text{O}$.</li>
        </ul>
      `;
    }
    // 13. Glucose tráng bạc
    else if (p.includes('tráng gương') || p.includes('tráng bạc') || p.includes('glucose') || p.includes('glucozo')) {
      answer = `
        <b style="color: #e2e8f0;">Phản ứng Tráng Bạc của Glucose (Glucozơ):</b><br/>
        $$\\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{Ag}_2\\text{O} \\xrightarrow{\\text{NH}_3,\\, t^\\circ} \\text{C}_6\\text{H}_{12}\\text{O}_7 + 2\\text{Ag}\\downarrow$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Khi đun nóng nhẹ bằng đèn cồn, nhóm anđehit $(-\\text{CHO})$ trong phân tử glucose khử ion $\\text{Ag}^+$ thành kim loại Bạc $(\\text{Ag})$ bám sáng bóng loáng như gương lên thành ống nghiệm.</li>
          <li><b>Ứng dụng:</b> Tráng ruột phích giữ nhiệt, sản xuất gương soi trong công nghiệp.</li>
        </ul>
      `;
    }
    // 14. Tinh bột + I2
    else if (p.includes('tinh bột') || p.includes('iot') || p.includes('iod')) {
      answer = `
        <b style="color: #c084fc;">Tương tác giữa Tinh Bột và Dung dịch Iod (I₂):</b><br/>
        $$\\text{Tinh bột} + \\text{I}_2 \\rightleftharpoons \\text{Phức chất màu xanh tím}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Ở nhiệt độ thường, chuỗi xoắn amylose của tinh bột hấp phụ các phân tử Iod tạo màu xanh tím thẫm đặc trưng (dùng nhận biết tinh bột).</li>
          <li><b>Khi đun nóng:</b> Các chuỗi xoắn duỗi thẳng ra, phân tử Iod bị giải phóng làm <b>mất màu</b>. Để nguội thì cuộn xoắn trở lại và tái xuất hiện màu xanh tím!</li>
        </ul>
      `;
    }
    // 15. C2H4 + Br2
    else if (p.includes('etilen') || p.includes('c2h4') || p.includes('brom')) {
      answer = `
        <b style="color: #fb923c;">Phản ứng cộng của Etilen với Nước Brom:</b><br/>
        $$\\text{CH}_2=\\text{CH}_2 + \\text{Br}_2 \\longrightarrow \\text{CH}_2\\text{Br}-\\text{CH}_2\\text{Br}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Hiện tượng:</b> Dẫn khí Etilen $(\\text{C}_2\\text{H}_4)$ vào ống nghiệm chứa nước Brom $(\\text{Br}_2)$ màu da cam, dung dịch bị <b>mất màu hoàn toàn</b>.</li>
          <li><b>Bản chất:</b> Do liên kết đôi $\\text{C}=\\text{C}$ có 1 liên kết $\\pi$ kém bền dễ đứt ra để liên kết với các nguyên tử Brom. Dùng phân biệt anken với ankan.</li>
        </ul>
      `;
    }
    // 16. Quỳ tím / Thang đo pH
    else if (p.includes('quỳ tím') || p.includes('ph') || p.includes('axit') || p.includes('bazo')) {
      answer = `
        <b style="color: #f87171;">Thang đo pH và Chất chỉ thị màu Quỳ Tím:</b><br/>
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li>🔴 <b>Môi trường Axit (pH &lt; 7):</b> Nồng độ $[\\text{H}^+] > [\\text{OH}^-]$, giấy quỳ tím hóa đỏ (ví dụ: $\\text{HCl}$, $\\text{H}_2\\text{SO}_4$).</li>
          <li>🟣 <b>Môi trường Trung tính (pH = 7):</b> $[\\text{H}^+] = [\\text{OH}^-]$, giấy quỳ tím giữ nguyên màu tím (ví dụ: nước cất $\\text{H}_2\\text{O}$).</li>
          <li>🔵 <b>Môi trường Kiềm / Bazơ (pH &gt; 7):</b> $[\\text{OH}^-] > [\\text{H}^+]$, giấy quỳ tím hóa xanh (ví dụ: $\\text{NaOH}$, $\\text{KOH}$). Dung dịch phenolphthalein chuyển sang màu hồng đậm.</li>
        </ul>
      `;
    }
    // 17. Dãy hoạt động hóa học của kim loại
    else if (p.includes('kim loại') || p.includes('dãy hoạt động') || p.includes('đẩy kim loại')) {
      answer = `
        <b style="color: #38bdf8;">Dãy hoạt động hóa học của Kim Loại:</b><br/>
        $$\\text{K} > \\text{Na} > \\text{Ca} > \\text{Mg} > \\text{Al} > \\text{Zn} > \\text{Fe} > \\text{Pb} > \\mathbf{(H)} > \\text{Cu} > \\text{Ag} > \\text{Au}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li>Kim loại đứng trước $\\text{Mg}$ $(\\text{K, Na, Ca})$ phản ứng với nước ở nhiệt độ thường tạo bazơ kiềm $+ \\text{H}_2\\uparrow$.</li>
          <li>Kim loại đứng trước $\\text{H}$ tác dụng với dung dịch axit loãng $(\\text{HCl, H}_2\\text{SO}_4)$ giải phóng khí $\\text{H}_2\\uparrow$. Kim loại sau $\\text{H}$ $(\\text{Cu, Ag, Au})$ không phản ứng.</li>
          <li>Kim loại đứng trước (trừ $\\text{K, Na, Ca}$) đẩy được kim loại đứng sau ra khỏi dung dịch muối: $\\text{Fe} + \\text{CuSO}_4 \\to \\text{FeSO}_4 + \\text{Cu}\\downarrow$.</li>
        </ul>
      `;
    }
    // 18. ĐKC (Điều kiện chuẩn)
    else if (p.includes('đkc') || p.includes('điều kiện chuẩn') || p.includes('thể tích mol')) {
      answer = `
        <b style="color: #34d399;">Điều kiện chuẩn (ĐKC) theo chương trình GDPT 2018 (IUPAC):</b><br/>
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Nhiệt độ chuẩn:</b> $25^\\circ\\text{C} = 298.15\\text{ K}$.</li>
          <li><b>Áp suất chuẩn:</b> $1\\text{ bar} = 100\\text{ kPa} = 10^5\\text{ Pa}$.</li>
          <li><b>Thể tích mol của chất khí ở ĐKC:</b> $V_m = 24.79\\text{ lít/mol}$.</li>
          <li><b>Công thức tính thể tích khí:</b> $V = n \\times 24.79\\text{ (Lít)}$. <i>(Lưu ý: Không dùng công thức cũ $22.4\\text{ L}$ vốn dành cho $0^\\circ\\text{C}, 1\\text{ atm}$).</i></li>
        </ul>
      `;
    }
    // 19. Cơ năng, động năng, thế năng
    else if (p.includes('động năng') || p.includes('thế năng') || p.includes('cơ năng') || p.includes('bảo toàn')) {
      answer = `
        <b style="color: #38bdf8;">Định luật Bảo toàn Cơ năng:</b><br/>
        $$W = W_đ + W_t = \\frac{1}{2}mv^2 + mgh = \\text{hằng số}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li>Khi vật chuyển động trong trọng trường chỉ chịu tác dụng của trọng lực, động năng và thế năng chuyển hóa qua lại lẫn nhau nhưng tổng cơ năng $W$ không đổi.</li>
          <li>Với quả cầu lăn không trượt trên máng: Có thêm động năng quay $W = 0.7 mv^2 + mgh$. Máng trượt có thanh ở giữa cho phép bạn kéo điều chỉnh độ cao rào thế năng!</li>
        </ul>
      `;
    }
    // 20. Quang học thấu kính
    else if (p.includes('thấu kính') || p.includes('tiêu cự') || p.includes('hội tụ') || p.includes('phân kỳ')) {
      answer = `
        <b style="color: #38bdf8;">Quang học Thấu Kính (Lenses):</b><br/>
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li><b>Thấu kính hội tụ (↕):</b> Có tiêu cự $f > 0$. Chùm tia sáng tới song song với trục chính khúc xạ hội tụ tại tiêu điểm ảnh thật $F'$ phía sau thấu kính.</li>
          <li><b>Thấu kính phân kỳ (⤹⤸):</b> Có tiêu cự $f < 0$. Chùm tia sáng tới song song bị loe rộng ra, đường kéo dài của chùm tia ló cắt nhau tại tiêu điểm ảo $F'$.</li>
          <li><b>Độ tụ của thấu kính:</b> $D = \\frac{1}{f}\\text{ (dp)}$.</li>
        </ul>
      `;
    }
    // 21. Khúc xạ ánh sáng & Lăng kính
    else if (p.includes('khúc xạ') || p.includes('snell') || p.includes('lăng kính') || p.includes('tán sắc')) {
      answer = `
        <b style="color: #fb7185;">Định luật Khúc xạ Ánh sáng & Lăng kính Snell:</b><br/>
        $$n_1 \\sin(i) = n_2 \\sin(r)$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li>Khi tia sáng đi từ môi trường chiết quang kém sang môi trường chiết quang hơn $(n_2 > n_1)$, góc khúc xạ $r < i$.</li>
          <li><b>Lăng kính tán sắc:</b> Ánh sáng trắng bị tán sắc thành dải 7 màu cầu vồng liên tục (Đỏ, Da cam, Vàng, Lục, Lam, Chàm, Tím) vì chiết suất của thủy tinh phụ thuộc bước sóng: $n_{\\text{tím}} > n_{\\text{đỏ}}$ nên tia tím bị lệch nhiều nhất, tia đỏ bị lệch ít nhất!</li>
        </ul>
      `;
    }
    // 22. Định luật Ohm & Mạch điện
    else if (p.includes('ohm') || p.includes('điện trở') || p.includes('dòng điện') || p.includes('mạch điện')) {
      answer = `
        <b style="color: #34d399;">Định luật Ohm cho đoạn mạch:</b><br/>
        $$I = \\frac{U}{R}$$
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li>Cường độ dòng điện $I$ tỉ lệ thuận với hiệu điện thế $U$ hai đầu đoạn mạch và tỉ lệ nghịch với điện trở $R$.</li>
          <li><b>Công suất tỏa nhiệt (Joule-Lenz):</b> $P = U \\cdot I = I^2 R = \\frac{U^2}{R}$.</li>
        </ul>
      `;
    }
    // 23. Con lắc đơn & Chu kỳ dao động
    else if (p.includes('con lắc') || p.includes('con lắc đơn') || p.includes('chu kỳ con lắc')) {
      answer = `
        <b style="color: #38bdf8; font-size: 13px;">Lý thuyết & Công thức Con Lắc Đơn:</b><br/>
        $$T = 2\\pi \\sqrt{\\frac{l}{g}} \\quad \\text{và} \\quad f = \\frac{1}{2\\pi} \\sqrt{\\frac{g}{l}}$$
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li><b>Chu kỳ dao động $T$ (s):</b> Phụ thuộc vào chiều dài dây treo $l$ và gia tốc trọng trường $g$. Với $l = 1\\text{ m}, g = 9.8\\text{ m/s}^2 \\implies T \\approx 2.006\\text{ s}$.</li>
          <li><b>Đặc điểm cốt lõi chuẩn SGK:</b> Chu kỳ dao động điều hòa của con lắc đơn <b>hoàn toàn KHÔNG phụ thuộc vào khối lượng $m$</b> của quả bóng (ở góc lệch bé $\\alpha_0 \\le 10^\\circ$).</li>
          <li><b>Bảo toàn cơ năng:</b> $W = \\frac{1}{2}m v^2 + mgl(1 - \\cos\\alpha) = \\text{hằng số}$. Vận tốc cực đại tại vị trí cân bằng: $v_{\\max} = \\sqrt{2gl(1-\\cos\\alpha_0)}$.</li>
        </ul>
      `;
    }
    // 24. Cảm ứng điện từ Faraday & Định luật Lenz
    else if (p.includes('cảm ứng điện từ') || p.includes('faraday') || p.includes('lenz') || p.includes('từ thông') || (p.includes('nam châm') && p.includes('cuộn'))) {
      answer = `
        <b style="color: #fbbf24; font-size: 13px;">Hiện tượng Cảm Ứng Điện Từ & Định luật Faraday:</b><br/>
        $$\\Phi = B \\cdot S \\cdot \\cos\\alpha \\quad \\text{và} \\quad e_c = -\\frac{\\Delta \\Phi}{\\Delta t}$$
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li><b>Hiện tượng:</b> Khi đưa nam châm lại gần hoặc kéo ra xa cuộn dây kín (solenoid), số đường sức từ xuyên qua tiết diện cuộn dây thay đổi $\\implies$ <b>từ thông $\\Phi$ biến thiên</b>, làm xuất hiện dòng điện cảm ứng $I_c$ khiến kim điện kế bị lệch!</li>
          <li><b>Khi nam châm đứng yên:</b> Từ thông không biến thiên $(\\Delta \\Phi = 0) \\implies e_c = 0$, kim điện kế chỉ về vạch số 0.</li>
          <li><b>Định luật Lenz về chiều dòng điện:</b> Dòng điện cảm ứng có chiều sao cho từ trường do nó sinh ra có tác dụng chống lại sự biến thiên của từ thông ban đầu sinh ra nó.</li>
        </ul>
      `;
    }
    // 25. Lực kế lò xo & Định luật Hooke
    else if (p.includes('lực kế') || p.includes('hooke') || p.includes('độ dãn lò xo') || p.includes('lực đàn hồi')) {
      answer = `
        <b style="color: #f43f5e; font-size: 13px;">Lực Đàn Hồi & Định luật Hooke:</b><br/>
        $$F_{đh} = k \\cdot |\\Delta l| = k \\cdot |l - l_0|$$
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li>Trong giới hạn đàn hồi, lực đàn hồi của lò xo tỉ lệ thuận với độ biến dạng $|\\Delta l|$ của nó.</li>
          <li><b>Nguyên lý lực kế:</b> Khi treo vật nặng khối lượng $m$, ở trạng thái cân bằng: $P = F_{đh} \\implies mg = k \\cdot \\Delta l \\implies \\Delta l = \\frac{mg}{k}$. Dựa vào độ dãn của lò xo, thang đo milimet sẽ chỉ thị chính xác độ lớn trọng lực tác dụng lên vật.</li>
        </ul>
      `;
    }
    // 26. Phản ứng Este Hóa (Axit axetic + Rượu etylic)
    else if (p.includes('este hóa') || p.includes('este') || p.includes('axit axetic') || p.includes('rượu etylic') || p.includes('ch3cooh') || p.includes('c2h5oh') || p.includes('etyl axetat')) {
      answer = `
        <b style="color: #f59e0b; font-size: 13px;">Phản ứng Este Hóa (Axit Axetic + Rượu Etylic):</b><br/>
        $$\\text{CH}_3\\text{COOH} + \\text{C}_2\\text{H}_5\\text{OH} \\xrightleftharpoons[t^\\circ]{\\text{H}_2\\text{SO}_4\\text{ đ}} \\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{H}_2\\text{O}$$
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li><b>Hiện tượng:</b> Hỗn hợp sau khi đun nóng với $\\text{H}_2\\text{SO}_4$ đặc sẽ tạo thành chất lỏng <b>Etyl axetat $(\\text{CH}_3\\text{COOC}_2\\text{H}_5)$</b> nhẹ hơn nước, không tan, tách thành lớp dầu nổi lên trên mặt nước và tỏa hương thơm hoa quả (mùi chuối chín) ngào ngạt.</li>
          <li><b>Vai trò của H₂SO₄ đặc:</b> Vừa là <b>chất xúc tác</b> tăng tốc độ phản ứng, vừa là chất <b>hút nước mạnh</b> làm chuyển dịch cân bằng hóa học sang chiều thuận theo nguyên lý Le Chatelier, nâng cao hiệu suất este hóa.</li>
          <li><b>Tính chất thuận nghịch:</b> Phản ứng este hóa là phản ứng thuận nghịch, este sinh ra có thể bị thủy phân ngược lại trong môi trường axit.</li>
        </ul>
      `;
    }
    // 27. Giấy thử pH Vạn năng toàn dải 1-14
    else if (p.includes('giấy ph') || p.includes('ph vạn năng') || p.includes('thang ph') || p.includes('bảng màu ph') || p.includes('thử ph')) {
      answer = `
        <b style="color: #10b981; font-size: 13px;">Giấy Thử pH Vạn Năng (Universal pH Indicator):</b><br/>
        $$\\text{pH} = -\\log_{10}[\\text{H}^+]$$
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li><b>Nguyên lý:</b> Giấy thử được tẩm hỗn hợp nhiều chất chỉ thị nhạy màu giúp chỉ thị chính xác dải pH từ 1 đến 14:
            <ul style="padding-left: 16px; margin: 4px 0;">
              <li>🔴 <b>pH 1–3:</b> Đỏ đậm đến đỏ cam (Axit mạnh: $\\text{HCl, H}_2\\text{SO}_4$).</li>
              <li>🟠 <b>pH 4–6:</b> Cam đến vàng nhạt (Axit yếu: giấm $\\text{CH}_3\\text{COOH}$).</li>
              <li>🟢 <b>pH 7:</b> Xanh lục (Trung tính: nước cất $\\text{H}_2\\text{O}$, muối $\\text{NaCl}$).</li>
              <li>🔵 <b>pH 8–11:</b> Xanh lục lam đến lam đậm (Bazơ yếu đến trung bình: $\\text{NaHCO}_3, \\text{NH}_3$).</li>
              <li>🟣 <b>pH 12–14:</b> Tím thẫm đến tím than (Kiềm mạnh: $\\text{NaOH, Ba(OH)}_2$).</li>
            </ul>
          </li>
          <li><b>Ưu điểm vượt trội so với quỳ tím:</b> Quỳ tím chỉ phân biệt tính axit/bazơ nhị phân (đỏ/xanh), trong khi giấy pH vạn năng cho phép xác định định lượng cụ thể giá trị pH dung dịch.</li>
        </ul>
      `;
    }
    // 28. Biến trở con chạy & Định luật Ôm
    else if (p.includes('biến trở') || p.includes('rheostat') || p.includes('con chạy') || p.includes('điện trở con chạy')) {
      answer = `
        <b style="color: #38bdf8; font-size: 13px;">Biến Trở Con Chạy & Điều Khiển Dòng Điện Mạch:</b><br/>
        $$R_{\\text{bt}} = \\rho \\frac{l}{S} \\quad \\implies \\quad I = \\frac{U}{R_0 + R_{\\text{bt}}}$$
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li><b>Cấu tạo:</b> Dây dẫn hợp kim có điện trở suất lớn quấn đều đặn quanh trụ sứ cách điện, kèm con chạy tiếp xúc trượt trên cuộn dây.</li>
          <li><b>Nguyên lý hoạt động:</b> Khi di chuyển con chạy, chiều dài $l$ của phần dây có dòng điện chạy qua thay đổi $\\implies$ làm thay đổi điện trở $R_{\\text{bt}}$ của biến trở.</li>
          <li><b>Tác dụng:</b> Điều chỉnh cường độ dòng điện $I$ trong mạch và hiệu điện thế hai đầu tải tiêu thụ (ví dụ: điều chỉnh độ sáng bóng đèn).</li>
        </ul>
      `;
    }
    // 29. Đồng hồ bấm giờ & Thước đo góc
    else if (p.includes('đồng hồ bấm giờ') || p.includes('stopwatch') || p.includes('bấm giờ') || p.includes('thước đo góc') || p.includes('protractor')) {
      answer = `
        <b style="color: #a855f7; font-size: 13px;">Dụng Cụ Đo Lường Trong Thực Hành Vật Lý:</b><br/>
        <ul style="padding-left: 18px; margin: 6px 0;">
          <li>⏱️ <b>Đồng hồ bấm giờ điện tử (Digital Stopwatch):</b> Độ chính xác cao tới $0.01\\text{ s}$. Trong thí nghiệm con lắc đơn, để giảm sai số ngẫu nhiên do phản xạ bấm tay, ta đo thời gian của <b>$10$ hoặc $20$ dao động toàn phần</b> rồi tính chu kỳ: $T = \\frac{t}{N}$.</li>
          <li>📐 <b>Thước đo góc (Protractor 0°–180°):</b> Dùng để đo góc lệch ban đầu $\\alpha_0$ của con lắc đơn (yêu cầu $\\alpha_0 \\le 10^\\circ$ để thỏa mãn dao động điều hòa), hoặc đo góc tới $i$ và góc khúc xạ $r$ trong định luật Snell.</li>
        </ul>
      `;
    }
    // Default Fallback
    else {
      answer = `
        Xin chào! Tôi là <b>Local Sci-AI Pilot</b> đã được lập trình sẵn toàn bộ cơ sở dữ liệu KHTN Hóa học & Vật lý Lớp 8-9-10-11.<br/>
        Bạn có thể:
        <ul style="padding-left: 18px; margin: 4px 0;">
          <li>Bấm vào các nút gợi ý nhanh ở thanh trên: <b>Vì sao Cu không tan trong axit loãng?</b>, <b>Cu + H₂SO₄ đặc nóng</b>, <b>BaCl₂ + H₂SO₄</b>, <b>CuSO₄ + NaOH</b>, <b>FeCl₃ + NaOH</b>, <b>Al + NaOH</b>, <b>CaCO₃ + HCl</b>, <b>Trung hòa Phenol</b>...</li>
          <li>Gõ lệnh điều khiển: <i>"Xóa thí nghiệm"</i>, <i>"Bật đèn cồn"</i>, <i>"Thêm natri"</i>, <i>"Sáng/Tối"</i>...</li>
          <li>Gõ <b>"data"</b> để xem bảng số liệu tức thời, hoặc <b>"data auto"</b> để mở bảng đo liên tục!</li>
        </ul>
      `;
    }

    return `
      <div>${answer}</div>
      <div style="margin-top: 8px; padding: 6px 10px; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 8px; font-size: 11px; color: #a5f3fc;">
        💡 <i>Câu trả lời từ Local Sci-AI (Offline Knowledge Engine chuẩn SGK). Bạn cũng có thể cấu hình thêm API Key trong file <code>api.txt</code> để kết nối Gemini 3.8 / xKiro!</i>
      </div>
    `;
  }

  // Call External AI Providers
  async function callAI(prompt) {
    const prov = config.provider;
    let apiKey = (prov === 'openai' ? config.openaiKey : prov === 'gemini' ? config.geminiKey : config.xkiroKey);

    if (!apiKey) {
      return getSmartOfflineFallback(prompt);
    }

    try {
      if (prov === 'gemini') {
        const model = config.geminiModel || 'gemini-3.5-flash-lite';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Bạn là trợ lý AI thông minh chuyên gia thí nghiệm NexusLab KHTN Việt Nam (SGK Lớp 8-9-10). Trả lời ngắn gọn, chuẩn xác khoa học và dễ hiểu bằng tiếng Việt: ${prompt}`
              }]
            }]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 503) {
            throw new Error(`Model ${model} đang tạm thời quá tải trên hệ thống Google (503 High Demand). Bạn có thể bấm nút "Models Gemini" để đổi sang model khác như gemini-3.5-flash-lite hoặc gemini-3.5-flash!`);
          }
          throw new Error(errData.error?.message || `Lỗi Gemini HTTP ${res.status}`);
        }

        const json = await res.json();
        return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được câu trả lời từ Gemini.';

      } else if (prov === 'openai') {
        const url = 'https://api.openai.com/v1/chat/completions';
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Bạn là chuyên gia thí nghiệm ảo NexusLab KHTN Việt Nam. Hãy trả lời ngắn gọn, chuẩn mực kiến thức SGK bằng tiếng Việt.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Lỗi OpenAI HTTP ${res.status}`);
        }

        const json = await res.json();
        return json.choices?.[0]?.message?.content || 'Không nhận được câu trả lời từ OpenAI.';

      } else if (prov === 'xkiro') {
        const baseUrl = config.xkiroBaseUrl || 'https://api.groq.com/openai/v1';
        const model = config.xkiroModel || 'llama-3.1-8b-instant';
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: 'Bạn là trợ lý ảo phòng lab NexusLab. Trả lời bằng tiếng Việt súc tích, chuẩn khoa học.' },
              { role: 'user', content: prompt }
            ]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Lỗi xKiro HTTP ${res.status}`);
        }

        const json = await res.json();
        return json.choices?.[0]?.message?.content || 'Không nhận được câu trả lời từ xKiro.';
      }
    } catch (err) {
      return `
        <div class="nexus-ai-safe-box" style="color: #f87171; margin-bottom: 6px;">
          <b>Lỗi kết nối API (${prov.toUpperCase()}):</b> ${escapeHtml(err.message)}
        </div>
        <div style="font-size: 11px; color: #94a3b8;">
          💡 Bạn có thể kiểm tra lại API Key trong file <code>api.txt</code> hoặc bấm vào icon ⚙️ ở góc trên bên phải để cập nhật Key mới!
        </div>
      `;
    }
  }

  // Send Message Routine
  async function sendMessage() {
    const input = document.getElementById('aiInputPrompt');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendUserMessage(text);
    processQuery(text);
  }

  function sendMessageQuick(cmd) {
    appendUserMessage(cmd);
    processQuery(cmd);
  }

  async function processQuery(text) {
    const lower = text.toLowerCase();

    // 1. Check for "DATA AUTO" command (Start live stream HUD)
    if (lower.includes('data auto') || lower.includes('auto data') || lower.includes('theo dõi liên tục') || lower.includes('live data')) {
      startAutoData();
      appendBotMessage(`
        <div style="color: #34d399; font-weight: 700; margin-bottom: 4px;">
          <i class="fa-solid fa-tower-broadcast"></i> ĐÃ BẬT BẢNG DATA THEO DÕI LIÊN TỤC!
        </div>
        <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
          Bảng số liệu thời gian thực đã hiển thị nổi trên màn hình thí nghiệm và đang tự động cập nhật liên tục. Bạn có thể bấm nút <b>[✕ TẮT THEO DÕI]</b> trên bảng bất cứ lúc nào!
        </p>
      `);
      return;
    }

    // 2. Check for "STOP AUTO DATA" command
    if (lower.includes('tắt data auto') || lower.includes('tắt auto data') || lower.includes('dừng theo dõi')) {
      stopAutoData();
      appendBotMessage(`⏹️ Đã tắt Bảng Data theo dõi liên tục.`);
      return;
    }

    // 3. Check for snapshot "DATA" command
    if (/data|dữ liệu|du lieu|thông số|thong so|báo cáo|report/i.test(lower)) {
      const reportHtml = generateDataReport();
      appendBotMessage(reportHtml);
      return;
    }

    // 4. Check for Gemini Model Selection / Listing Commands
    const modelCmdResult = tryExecuteModelCommand(text);
    if (modelCmdResult && modelCmdResult.handled) {
      if (modelCmdResult.html) appendBotMessage(modelCmdResult.html);
      return;
    }

    // 5. Check for AI Pilot Command Execution (Nhờ AI điều khiển hộ)
    const controlResult = tryExecuteAIControlCommand(text);
    if (controlResult) {
      appendBotMessage(`
        <div style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.35); border-radius: 10px; padding: 10px;">
          <div style="font-weight: 800; color: #38bdf8; margin-bottom: 4px; display: flex; items-center; gap: 6px;">
            <i class="fa-solid fa-robot"></i> AI ĐÃ ĐIỀU KHIỂN HỘ THÍ NGHIỆM!
          </div>
          <div style="font-size: 12px; color: #ffffff;">
            ${controlResult.message || 'Đã áp dụng thông số mới thành công.'}
          </div>
        </div>
      `);
      return;
    }

    // 6. Otherwise, query external AI
    const loadingId = 'aiLoading_' + Date.now();
    const modelName = config.provider === 'gemini' ? (GEMINI_MODELS.find(m => m.id === config.geminiModel)?.name || config.geminiModel) : config.provider.toUpperCase();
    appendBotMessage(`<span id="${loadingId}"><i class="fa-solid fa-spinner fa-spin"></i> Đang tham vấn AI (${modelName})...</span>`);

    const answer = await callAI(text);
    const loadingEl = document.getElementById(loadingId);
    const formattedAnswer = formatAiResponse(answer);
    if (loadingEl && loadingEl.parentElement) {
      loadingEl.parentElement.innerHTML = formattedAnswer;
      renderLatexInElement(loadingEl.parentElement);
    } else {
      appendBotMessage(formattedAnswer);
    }
  }

  // Setup Global Keyboard Listener (Ctrl + L)
  function setupKeyboardListener() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        toggleModal();
      }
    });
  }

  // Public API
  window.NexusAI = {
    toggle: toggleModal,
    open: () => { if (!isOpen) toggleModal(); },
    close: () => { if (isOpen) toggleModal(); },
    sendMessage: sendMessage,
    sendMessageQuick: sendMessageQuick,
    switchGeminiModel: switchGeminiModel,
    showData: () => {
      if (!isOpen) toggleModal();
      appendBotMessage(generateDataReport());
    },
    startAutoData: startAutoData,
    stopAutoData: stopAutoData
  };

  // Bootstrap
  async function init() {
    if (isInitialized) return;
    isInitialized = true;
    injectStyles();
    injectModalHTML();
    setupKeyboardListener();
    await loadConfig();
    updateModelBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
