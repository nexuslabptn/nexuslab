/**
 * bio-microscope.js — Interactive Virtual Microscope & Living Cell Explorer (NexusLab BioCenter)
 * 
 * Features:
 *  - 60 FPS requestAnimationFrame canvas rendering.
 *  - Cytoplasmic streaming (Cyclosis) with chloroplast orbital flow.
 *  - Brownian motion & cytoplasmic nutrient diffusion.
 *  - Dynamic optical zoom (40x, 100x, 400x, 1000x) and fine focus blur simulation.
 *  - Interactive specimen slides: Plant Cell (Elodea), Animal Cell (Epithelial), DNA Molecular Helix.
 *  - Clickable organelles with anatomical hit-testing & interactive curriculum inspector.
 *  - Layer slicing (All, Membrane, Organelles, Nucleus).
 *  - Web Audio synthesizer for tactile lab interactions.
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. ORGANELLE SCIENTIFIC KNOWLEDGE BASE (SGK SINH HỌC 9 - 10)
  // -------------------------------------------------------------
  const ORGANELLES = {
    chloroplast: {
      name: 'Lục lạp (Chloroplast)',
      subtype: 'Bào quan quang hợp',
      latin: 'Chloroplastus • Kích thước: 4-6 µm',
      icon: 'fa-leaf',
      color: '#10b981',
      function: 'Chứa chất diệp lục (chlorophyll) hấp thụ năng lượng mặt trời để tổng hợp chất hữu cơ (glucose) và giải phóng O₂ qua quá trình quang hợp.',
      formulaName: 'Phương trình quang hợp tổng quát (Calvin cycle):',
      formula: '6CO₂ + 6H₂O ➔ C₆H₁₂O₆ + 6O₂',
      phenomenon: 'Dòng tế bào chất (cyclosis) cuộn xoay liên tục quanh không bào, vận chuyển lục lạp tới vị trí đón ánh sáng tối ưu mà không bị quang ức chế.',
      quizPrompt: 'Bào quan nào trực tiếp hấp thụ quang năng để tổng hợp chất hữu cơ?',
      quizCorrect: 'Lục lạp (Chloroplast)',
      quizWrong: 'Ti thể (Mitochondrion)'
    },
    plant_nucleus: {
      name: 'Nhân tế bào thực vật (Plant Nucleus)',
      subtype: 'Trung tâm điều khiển di truyền',
      latin: 'Nucleus cellularis • Kích thước: 5-8 µm',
      icon: 'fa-circle-dot',
      color: '#38bdf8',
      function: 'Chứa chất nhiễm sắc (ADN kết hợp protein histone), lưu giữ toàn bộ chương trình di truyền và chỉ huy mọi phản ứng trao đổi chất của tế bào.',
      formulaName: 'Cơ chế sao chép & biểu hiện thông tin gen:',
      formula: 'ADN (Gen) ➔ mARN (Phiên mã) ➔ Protein (Dịch mã)',
      phenomenon: 'Màng nhân kép có các lỗ nhân (nuclear pores) kiểm soát sự lưu thông của mARN, riboxom và enzyme giữa nhân và tế bào chất.',
      quizPrompt: 'Vật chất di truyền của sinh vật nhân thực được bảo quản chủ yếu ở đâu?',
      quizCorrect: 'Bên trong nhân tế bào',
      quizWrong: 'Trong dịch không bào'
    },
    vacuole: {
      name: 'Không bào trung tâm (Central Vacuole)',
      subtype: 'Duy trì áp suất thẩm thấu & dự trữ',
      latin: 'Vacuola centralis • Chiếm 50 - 90% thể tích',
      icon: 'fa-droplet',
      color: '#06b6d4',
      function: 'Chứa dịch tế bào gồm nước, khoáng chất, sắc tố, chất thải; tạo áp suất trương nước (turgor) giúp tế bào và mô cây luôn cứng cáp, vươn cao.',
      formulaName: 'Đẳng thức thế nước của tế bào thực vật:',
      formula: 'Ψ = Ψs + Ψp (Thế nước = Áp suất thẩm thấu + Áp suất trương)',
      phenomenon: 'Khi tế bào no nước, không bào căng phồng ép tế bào chất và lục lạp dạt sát vào thành cellulose.',
      quizPrompt: 'Hiện tượng lá cây bị héo rũ khi gặp hạn là do không bào bị hiện tượng gì?',
      quizCorrect: 'Mất nước (giảm áp suất trương nước)',
      quizWrong: 'Mất hoàn toàn chất diệp lục'
    },
    cell_wall: {
      name: 'Thành tế bào Cellulose (Cell Wall)',
      subtype: 'Khung cấu trúc nâng đỡ bảo vệ',
      latin: 'Paries cellularis • Độ dày: 0.1 - 10 µm',
      icon: 'fa-shield-halved',
      color: '#84cc16',
      function: 'Tạo bởi mạng lưới vi sợi cellulose bền chắc, quy định hình dạng cố định của tế bào thực vật và chống lại sự vỡ tế bào khi hút nhiều nước.',
      formulaName: 'Chuỗi polymer polysaccharide:',
      formula: '(C₆H₁₀O₅)n liên kết bằng cầu nối β-1,4-glycosidic',
      phenomenon: 'Trên thành tế bào có các cầu sinh chất (plasmodesmata) kết nối các tế bào lân cận thành một thể hợp bào liên tục.',
      quizPrompt: 'Vật liệu chính cấu tạo nên thành tế bào thực vật là gì?',
      quizCorrect: 'Cellulose',
      quizWrong: 'Lớp kép Phospholipid'
    },
    animal_membrane: {
      name: 'Màng sinh chất (Plasma Membrane)',
      subtype: 'Màng kép Phospholipid khảm động',
      latin: 'Membrana cellularis • Dày: 7.5 - 10 nm',
      icon: 'fa-shield-halved',
      color: '#f59e0b',
      function: 'Mô hình khảm động Singer & Nicolson: kiểm soát chọn lọc sự xuất nhập của các chất (bán thấm), tiếp nhận thông tin và bảo vệ tế bào.',
      formulaName: 'Định luật khuếch tán thụ động Fick:',
      formula: 'J = -D · (ΔC / Δx) (Khuếch tán theo gradient nồng độ)',
      phenomenon: 'Màng tế bào động vật rất mềm dẻo, liên tục uốn lượn thực bào và ẩm bào để lấy thức ăn từ môi trường.',
      quizPrompt: 'Tế bào động vật khác tế bào thực vật ở chỗ không có thành phần nào ngoài cùng?',
      quizCorrect: 'Không có thành tế bào Cellulose',
      quizWrong: 'Không có màng sinh chất'
    },
    mitochondria: {
      name: 'Ti thể (Mitochondrion)',
      subtype: 'Nhà máy năng lượng tế bào',
      latin: 'Mitochondrion • Kích thước: 0.5 - 2 µm',
      icon: 'fa-bolt',
      color: '#f43f5e',
      function: 'Hô hấp tế bào hiếu khí: oxy hóa pyruvate và acid béo để tổng hợp phân tử ATP - nguồn năng lượng vạn năng cho mọi hoạt động sinh học.',
      formulaName: 'Phương trình hô hấp hiếu khí tạo ATP:',
      formula: 'C₆H₁₂O₆ + 6O₂ ➔ 6CO₂ + 6H₂O + 36-38 ATP',
      phenomenon: 'Màng trong ti thể gấp nếp sâu tạo các mào răng lược (cristae), mang chuỗi truyền electron hô hấp và phức hợp ATP synthase.',
      quizPrompt: 'Đơn vị tiền tệ năng lượng chính mà ti thể sản sinh ra là gì?',
      quizCorrect: 'Adenosine Triphosphate (ATP)',
      quizWrong: 'Glucose tự do'
    },
    golgi: {
      name: 'Bộ máy Golgi (Golgi Apparatus)',
      subtype: 'Hệ thống chế biến, đóng gói & xuất bào',
      latin: 'Apparatus golgiensis',
      icon: 'fa-boxes-packing',
      color: '#a855f7',
      function: 'Gồm các túi dẹt xếp chồng, tiếp nhận protein từ lưới nội chất để hoàn thiện cấu trúc, gắn chuỗi carbohydrate, đóng gói thành bóng túi tiết.',
      formulaName: 'Hành trình chế biến xuất bào:',
      formula: 'Ribosome ➔ Lưới nội chất ➔ Golgi ➔ Túi tiết hòa màng',
      phenomenon: 'Các bóng xuất bào liên tục tách ra từ mặt trans của Golgi, trôi dạt đến hòa nhập vào màng sinh chất.',
      quizPrompt: 'Bào quan nào đóng vai trò chính trong việc đóng gói và bài tiết protein?',
      quizCorrect: 'Bộ máy Golgi',
      quizWrong: 'Lục lạp'
    },
    animal_nucleus: {
      name: 'Nhân tế bào động vật (Animal Nucleus)',
      subtype: 'Bộ não điều khiển di truyền',
      latin: 'Nucleus • Kích thước: 5-10 µm',
      icon: 'fa-circle-dot',
      color: '#38bdf8',
      function: 'Bao bọc bởi màng nhân kép, chứa hạch nhân (nhân con tổng hợp rRNA) và chất nhiễm sắc mang 46 nhiễm sắc thể (ở người).',
      formulaName: 'Độ dài ADN trong mỗi tế bào người:',
      formula: '~2 mét ADN cuộn chặt quanh octamer protein Histone',
      phenomenon: 'Trong pha phân bào, màng nhân biến mất tạm thời để bộ máy thoi phân bào phân chia đồng đều nhiễm sắc thể về 2 cực.',
      quizPrompt: 'Cấu trúc nào bên trong nhân tế bào chịu trách nhiệm tổng hợp ribosome?',
      quizCorrect: 'Nhân con (Hạch nhân / Nucleolus)',
      quizWrong: 'Không bào'
    },
    dna_helix: {
      name: 'Cấu trúc Xoắn kép ADN (DNA Double Helix)',
      subtype: 'Phân tử mang thông tin di truyền',
      latin: 'Acidum Desoxyribonucleinicum (DNA)',
      icon: 'fa-dna',
      color: '#00f2fe',
      function: 'Hai chuỗi polynucleotide xoắn đều song song ngược chiều quanh một trục chung. Các base nitơ liên kết theo nguyên tắc bổ sung A-T (2 liên kết H), G-X (3 liên kết H).',
      formulaName: 'Quy tắc bổ sung Watson - Crick:',
      formula: 'A = T;  G = X  ⇒  %A + %G = %T + %X = 50%',
      phenomenon: 'Mỗi chu kỳ xoắn dài 34 Å gồm 10 cặp nucleotide, đường kính 20 Å. Trục đường-phosphate quay ra ngoài, các bazơ nitơ hướng vào trong.',
      quizPrompt: 'Theo nguyên tắc bổ sung, base Adenine (A) liên kết với base nào trong ADN?',
      quizCorrect: 'Thymine (T) bằng 2 liên kết Hydro',
      quizWrong: 'Guanine (G) bằng 3 liên kết Hydro'
    },
    transcription: {
      name: 'Chạc Tái bản & Phiên mã mARN',
      subtype: 'Cơ chế truyền đạt thông tin di truyền',
      latin: 'Transcriptio genica • ARN Polymerase',
      icon: 'fa-arrows-split-up-and-left',
      color: '#f59e0b',
      function: 'Enzyme ARN polymerase bám vào vùng khởi động của gen, tách 2 mạch ADN và trượt dọc mạch khuôn 3\'→5\' để tổng hợp mạch mARN 5\'→3\'.',
      formulaName: 'Nguyên tắc bổ sung trong phiên mã:',
      formula: 'A_gốc ➔ U_mARN;  T_gốc ➔ A_mARN;  G_gốc ➔ X_mARN;  X_gốc ➔ G_mARN',
      phenomenon: 'Các hạt ribonucleotide tự do (A, U, G, X) liên tục va chạm Brownian và được enzyme xúc tác gắn vào đầu 3\'-OH tự do của chuỗi mARN non.',
      quizPrompt: 'Trong phân tử mARN phiên mã, base nào thay thế cho Thymine (T)?',
      quizCorrect: 'Uracil (U)',
      quizWrong: 'Cytosine (X)'
    }
  };

  // -------------------------------------------------------------
  // 2. SIMULATION STATE
  // -------------------------------------------------------------
  const state = {
    specimen: 'plant',          // 'plant' | 'animal' | 'dna'
    isRunning: true,
    zoom: 100,                  // 40, 100, 400, 1000
    targetZoom: 100,
    currentScale: 1.0,          // Interpolated scale factor
    focus: 100,                 // 100 is optimal sharp focal plane
    light: 90,                  // % illumination
    layer: 'all',               // 'all' | 'membrane' | 'organelles' | 'nucleus'
    speed: 1.0,                 // streaming speed factor
    selectedKey: 'chloroplast',
    hoveredKey: null,
    
    // Dynamic Simulation Objects
    time: 0,
    chloroplasts: [],
    mitochondria: [],
    cytoplasmParticles: [],
    dnaPairs: [],
    mrnaParticles: []
  };

  // Canvas context
  let canvas = null;
  let ctx = null;
  let animId = null;
  let lastTime = 0;

  // Sound Synth via Web Audio API
  let audioCtx = null;
  function playBioTone(freq, type = 'sine', duration = 0.08, vol = 0.06) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // 3. INITIALIZATION & DATA CREATION
  // -------------------------------------------------------------
  function initSimulationData() {
    // 1. Plant chloroplasts (orbiting in an ellipse around the central vacuole)
    state.chloroplasts = [];
    const countChl = 12;
    for (let i = 0; i < countChl; i++) {
      state.chloroplasts.push({
        angle: (i / countChl) * Math.PI * 2,
        rx: 135 + (i % 3) * 12,
        ry: 95 + (i % 2) * 14,
        size: 14 + (i % 3) * 2,
        speed: 0.22 + (i % 4) * 0.03,
        granaCount: 3 + (i % 3)
      });
    }

    // 2. Animal Mitochondria (distributed in cytoplasm)
    state.mitochondria = [
      { x: -105, y: -55, angle: 0.35, len: 26, width: 14 },
      { x: -85, y: 80, angle: -0.6, len: 28, width: 15 },
      { x: 95, y: -75, angle: 0.9, len: 24, width: 13 },
      { x: 110, y: 65, angle: -0.2, len: 30, width: 16 },
      { x: -45, y: -110, angle: 1.4, len: 22, width: 12 },
      { x: 60, y: 115, angle: 0.8, len: 25, width: 13 },
      { x: 125, y: -15, angle: -1.1, len: 27, width: 14 }
    ];

    // 3. Cytoplasm Brownian particles (Nutrients / Solutes)
    state.cytoplasmParticles = [];
    for (let i = 0; i < 35; i++) {
      state.cytoplasmParticles.push({
        x: (Math.random() - 0.5) * 260,
        y: (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? 'rgba(52, 211, 153, 0.65)' : 'rgba(56, 189, 248, 0.65)'
      });
    }

    // 4. DNA Double Helix Base Pairs
    state.dnaPairs = [];
    const baseLetters = [
      { left: 'A', right: 'T', colorL: '#ef4444', colorR: '#38bdf8' },
      { left: 'G', right: 'X', colorL: '#eab308', colorR: '#10b981' },
      { left: 'T', right: 'A', colorL: '#38bdf8', colorR: '#ef4444' },
      { left: 'X', right: 'G', colorL: '#10b981', colorR: '#eab308' }
    ];
    for (let i = 0; i < 28; i++) {
      const type = baseLetters[i % baseLetters.length];
      state.dnaPairs.push({
        yIndex: i - 14,
        type: type
      });
    }

    // 5. mRNA incoming nucleotide particles
    state.mrnaParticles = [];
    const rnaTypes = ['A', 'U', 'G', 'X'];
    for (let i = 0; i < 18; i++) {
      state.mrnaParticles.push({
        x: Math.random() * 240 - 120,
        y: Math.random() * 240 - 120,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        base: rnaTypes[i % rnaTypes.length],
        alpha: Math.random() * 0.5 + 0.5
      });
    }
  }

  // -------------------------------------------------------------
  // 4. CANVAS RESIZING & DPR SCALING
  // -------------------------------------------------------------
  function resizeCanvas() {
    if (!canvas) return;
    const parent = canvas.parentElement;
    const size = Math.min(parent.clientWidth, parent.clientHeight || parent.clientWidth);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }

  // -------------------------------------------------------------
  // 5. MAIN ANIMATION & RENDERING LOOP (60 FPS)
  // -------------------------------------------------------------
  function renderLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (dt > 0.05) dt = 0.05;

    if (state.isRunning) {
      // Gentle slow down when hovering canvas, freeze completely when pointing at an organelle
      const speedMult = state.hoveredKey ? 0 : (state.isHoveringCanvas ? 0.25 : 1.0);
      state.time += dt * state.speed * speedMult;
      updateSimulationPhysics(dt, speedMult);
    }

    // Smooth Zoom Interpolation
    const targetScale = state.targetZoom / 100;
    state.currentScale += (targetScale - state.currentScale) * 0.12;

    drawMicroscopeScene();
    animId = requestAnimationFrame(renderLoop);
  }

  function updateSimulationPhysics(dt, speedMult) {
    if (speedMult === 0) return; // Frozen under cursor: effortless clicking!

    const currentSpeed = dt * state.speed * speedMult;

    // 1. Orbit chloroplasts around central vacuole (Cyclosis)
    state.chloroplasts.forEach(chl => {
      chl.angle += chl.speed * currentSpeed;
    });

    // 2. Diffuse cytoplasmic Brownian particles (gentle, steady)
    const boundR = state.specimen === 'plant' ? 140 : 130;
    state.cytoplasmParticles.forEach(p => {
      p.x += p.vx * speedMult + (Math.random() - 0.5) * 0.15 * speedMult;
      p.y += p.vy * speedMult + (Math.random() - 0.5) * 0.15 * speedMult;
      if (Math.hypot(p.x, p.y) > boundR) {
        p.vx = -p.vx;
        p.vy = -p.vy;
      }
    });

    // 3. DNA Transcription particles floating
    state.mrnaParticles.forEach(p => {
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;
      if (Math.abs(p.x) > 130) p.vx = -p.vx;
      if (Math.abs(p.y) > 130) p.vy = -p.vy;
    });
  }

  // -------------------------------------------------------------
  // 6. DRAW SCENE: DISPATCH ACCORDING TO SPECIMEN
  // -------------------------------------------------------------
  function drawMicroscopeScene() {
    if (!canvas || !ctx) return;
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight || w;
    const cx = w / 2;
    const cy = h / 2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Illumination Gradient Background inside microscope lens
    const lightVal = state.light / 100;
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.52);
    if (state.specimen === 'plant') {
      bgGrad.addColorStop(0, `rgba(16, 185, 129, ${0.16 * lightVal})`);
      bgGrad.addColorStop(0.65, `rgba(6, 78, 59, ${0.10 * lightVal})`);
      bgGrad.addColorStop(1, '#020617');
    } else if (state.specimen === 'animal') {
      bgGrad.addColorStop(0, `rgba(245, 158, 11, ${0.14 * lightVal})`);
      bgGrad.addColorStop(0.65, `rgba(180, 83, 9, ${0.08 * lightVal})`);
      bgGrad.addColorStop(1, '#020617');
    } else {
      bgGrad.addColorStop(0, `rgba(0, 242, 254, ${0.16 * lightVal})`);
      bgGrad.addColorStop(0.65, `rgba(12, 74, 110, ${0.10 * lightVal})`);
      bgGrad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Apply Zoom & Center translation
    ctx.translate(cx, cy);
    ctx.scale(state.currentScale, state.currentScale);

    // Draw active specimen
    if (state.specimen === 'plant') {
      drawPlantCell();
    } else if (state.specimen === 'animal') {
      drawAnimalCell();
    } else if (state.specimen === 'dna') {
      drawDnaStructure();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 7. SPECIMEN 1: PLANT CELL (ELODEA - THỰC VẬT)
  // -------------------------------------------------------------
  function drawPlantCell() {
    const showMembrane = state.layer === 'all' || state.layer === 'membrane';
    const showOrganelles = state.layer === 'all' || state.layer === 'organelles';
    const showNucleus = state.layer === 'all' || state.layer === 'nucleus';

    const cellW = 320;
    const cellH = 220;
    const cornerR = 30;

    // A. Outer Cell Wall (Thành Cellulose vững chắc)
    if (showMembrane) {
      const isWallActive = state.selectedKey === 'cell_wall' || state.hoveredKey === 'cell_wall';
      
      // Outer primary wall
      ctx.strokeStyle = isWallActive ? '#a3e635' : 'rgba(132, 204, 22, 0.85)';
      ctx.lineWidth = isWallActive ? 9 : 7;
      ctx.beginPath();
      ctx.roundRect(-cellW / 2, -cellH / 2, cellW, cellH, cornerR);
      ctx.stroke();

      // Middle lamella / Secondary wall inner stroke
      ctx.strokeStyle = 'rgba(77, 124, 15, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-cellW / 2 + 5, -cellH / 2 + 5, cellW - 10, cellH - 10, cornerR - 4);
      ctx.stroke();

      // Plasmodesmata pores (Cầu sinh chất trên thành tế bào)
      ctx.fillStyle = '#4ade80';
      for (let px = -cellW / 2 + 50; px <= cellW / 2 - 50; px += 45) {
        ctx.fillRect(px, -cellH / 2 - 2, 4, 10);
        ctx.fillRect(px, cellH / 2 - 8, 4, 10);
      }
    }

    // Cytoplasm fill
    ctx.fillStyle = 'rgba(6, 95, 70, 0.2)';
    ctx.beginPath();
    ctx.roundRect(-cellW / 2 + 8, -cellH / 2 + 8, cellW - 16, cellH - 16, cornerR - 6);
    ctx.fill();

    // B. Central Vacuole (Không bào trung tâm lớn duy trì áp suất thẩm thấu)
    if (showOrganelles) {
      const isVacActive = state.selectedKey === 'vacuole' || state.hoveredKey === 'vacuole';
      const vacW = 200;
      const vacH = 130;
      const vacPulse = Math.sin(state.time * 1.5) * 2;

      ctx.save();
      const vacGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, vacW / 2);
      vacGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      vacGrad.addColorStop(0.85, 'rgba(14, 116, 144, 0.2)');
      vacGrad.addColorStop(1, 'rgba(6, 182, 212, 0.55)');

      ctx.fillStyle = vacGrad;
      ctx.strokeStyle = isVacActive ? '#22d3ee' : 'rgba(34, 211, 238, 0.5)';
      ctx.lineWidth = isVacActive ? 3.5 : 2;
      ctx.beginPath();
      ctx.roundRect(-vacW / 2 + vacPulse, -vacH / 2 + vacPulse, vacW - vacPulse * 2, vacH - vacPulse * 2, 22);
      ctx.fill();
      ctx.stroke();

      // Tonoplast label inside
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('KHÔNG BÀO TRUNG TÂM', 0, -4);
      ctx.font = '9px Plus Jakarta Sans';
      ctx.fillStyle = '#67e8f9';
      ctx.fillText('(Duy trì áp suất trương nước)', 0, 12);
      ctx.restore();
    }

    // C. Cytoplasmic Streaming Flow Guide Lines
    if (showOrganelles) {
      ctx.save();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 135, 95, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // D. Chloroplasts (Lục lạp di chuyển theo dòng tế bào chất - Cyclosis)
    if (showOrganelles) {
      const isChlActive = state.selectedKey === 'chloroplast' || state.hoveredKey === 'chloroplast';

      state.chloroplasts.forEach((chl, idx) => {
        const cx = Math.cos(chl.angle) * chl.rx;
        const cy = Math.sin(chl.angle) * chl.ry;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(chl.angle + Math.PI / 2);

        // Chloroplast outer envelope
        const chlGrad = ctx.createLinearGradient(-chl.size, 0, chl.size, 0);
        chlGrad.addColorStop(0, '#15803d');
        chlGrad.addColorStop(0.5, '#22c55e');
        chlGrad.addColorStop(1, '#166534');

        ctx.fillStyle = chlGrad;
        ctx.strokeStyle = isChlActive ? '#00ff9d' : '#14532d';
        ctx.lineWidth = isChlActive ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, chl.size, chl.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Internal Thylakoid Grana Discs (Hạt grana xếp chồng)
        ctx.strokeStyle = 'rgba(20, 83, 45, 0.8)';
        ctx.lineWidth = 1.5;
        for (let g = -chl.granaCount / 2; g <= chl.granaCount / 2; g++) {
          ctx.beginPath();
          ctx.moveTo(g * 3.5, -chl.size * 0.35);
          ctx.lineTo(g * 3.5, chl.size * 0.35);
          ctx.stroke();
        }

        ctx.restore();
      });
    }

    // E. Plant Nucleus (Nhân tế bào nằm nép bên góc vì không bào ép)
    if (showNucleus) {
      const nucX = 95;
      const nucY = -65;
      const nucR = 24;
      const isNucActive = state.selectedKey === 'plant_nucleus' || state.hoveredKey === 'plant_nucleus';

      ctx.save();
      const nucGrad = ctx.createRadialGradient(nucX - 6, nucY - 6, 4, nucX, nucY, nucR);
      nucGrad.addColorStop(0, '#7dd3fc');
      nucGrad.addColorStop(0.65, '#0284c7');
      nucGrad.addColorStop(1, '#0369a1');

      ctx.fillStyle = nucGrad;
      ctx.strokeStyle = isNucActive ? '#00f2fe' : 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = isNucActive ? 3.5 : 2;
      ctx.beginPath();
      ctx.arc(nucX, nucY, nucR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Nucleolus (Nhân con / hạch nhân)
      ctx.fillStyle = '#0c4a6e';
      ctx.beginPath();
      ctx.arc(nucX + 4, nucY - 3, 7, 0, Math.PI * 2);
      ctx.fill();

      // Nuclear pores dots
      ctx.fillStyle = '#bae6fd';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.arc(nucX + Math.cos(a) * (nucR - 2), nucY + Math.sin(a) * (nucR - 2), 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // F. Cytoplasm Brownian particles
    if (showOrganelles) {
      state.cytoplasmParticles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  // -------------------------------------------------------------
  // 8. SPECIMEN 2: ANIMAL CELL (HUMAN EPITHELIAL - ĐỘNG VẬT)
  // -------------------------------------------------------------
  function drawAnimalCell() {
    const showMembrane = state.layer === 'all' || state.layer === 'membrane';
    const showOrganelles = state.layer === 'all' || state.layer === 'organelles';
    const showNucleus = state.layer === 'all' || state.layer === 'nucleus';

    const baseR = 135;

    // A. Plasma Membrane (Màng sinh chất uốn lượn linh động)
    if (showMembrane) {
      const isMemActive = state.selectedKey === 'animal_membrane' || state.hoveredKey === 'animal_membrane';

      ctx.save();
      ctx.beginPath();
      const points = 16;
      for (let i = 0; i < points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const wave = Math.sin(theta * 4 + state.time * 2) * 5 + Math.cos(theta * 3 - state.time) * 4;
        const r = baseR + wave;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Cytosol background fill
      const cytoGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, baseR);
      cytoGrad.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
      cytoGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.08)');
      cytoGrad.addColorStop(1, 'rgba(180, 83, 9, 0.22)');
      ctx.fillStyle = cytoGrad;
      ctx.fill();

      // Lipid bilayer boundary stroke
      ctx.strokeStyle = isMemActive ? '#fbbf24' : 'rgba(245, 158, 11, 0.85)';
      ctx.lineWidth = isMemActive ? 5 : 3.5;
      ctx.stroke();

      // Fluid mosaic proteins floating in membrane
      ctx.fillStyle = '#38bdf8';
      for (let p = 0; p < Math.PI * 2; p += Math.PI / 4) {
        const px = Math.cos(p + state.time * 0.1) * (baseR + 2);
        const py = Math.sin(p + state.time * 0.1) * (baseR + 2);
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // B. Prominent Animal Nucleus (Nhân lớn nằm giữa tế bào)
    if (showNucleus) {
      const isNucActive = state.selectedKey === 'animal_nucleus' || state.hoveredKey === 'animal_nucleus';
      const nucR = 42;

      ctx.save();
      const nGrad = ctx.createRadialGradient(-8, -8, 6, 0, 0, nucR);
      nGrad.addColorStop(0, '#93c5fd');
      nGrad.addColorStop(0.5, '#2563eb');
      nGrad.addColorStop(1, '#1e3a8a');

      ctx.fillStyle = nGrad;
      ctx.strokeStyle = isNucActive ? '#60a5fa' : 'rgba(96, 165, 250, 0.8)';
      ctx.lineWidth = isNucActive ? 4 : 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, nucR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dense Nucleolus (Hạch nhân tổng hợp rARN)
      ctx.fillStyle = '#172554';
      ctx.beginPath();
      ctx.arc(8, -6, 12, 0, Math.PI * 2);
      ctx.fill();

      // Chromatin thread textures (Sợi chất nhiễm sắc)
      ctx.strokeStyle = 'rgba(191, 219, 254, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-10, 10, 14, 0, Math.PI * 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12, 12, 10, Math.PI * 0.5, Math.PI * 1.8);
      ctx.stroke();

      // Nuclear pores
      ctx.fillStyle = '#dbeafe';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (nucR - 2), Math.sin(a) * (nucR - 2), 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // C. Mitochondria (Ti thể hình hạt gạo với màng mào răng lược)
    if (showOrganelles) {
      const isMitoActive = state.selectedKey === 'mitochondria' || state.hoveredKey === 'mitochondria';

      state.mitochondria.forEach(mito => {
        ctx.save();
        ctx.translate(mito.x, mito.y);
        ctx.rotate(mito.angle + Math.sin(state.time * 2 + mito.x) * 0.05);

        // Outer membrane
        ctx.fillStyle = '#e11d48';
        ctx.strokeStyle = isMitoActive ? '#fb7185' : '#9f1239';
        ctx.lineWidth = isMitoActive ? 3 : 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, mito.len / 2, mito.width / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner membrane Cristae folds (Nếp mào răng lược)
        ctx.strokeStyle = '#fecdd3';
        ctx.lineWidth = 1.5;
        const folds = 4;
        const step = mito.len / (folds + 1);
        for (let f = 1; f <= folds; f++) {
          const fx = -mito.len / 2 + f * step;
          ctx.beginPath();
          ctx.moveTo(fx, -mito.width * 0.35);
          ctx.lineTo(fx + (f % 2 === 0 ? 3 : -3), 0);
          ctx.lineTo(fx, mito.width * 0.35);
          ctx.stroke();
        }

        ctx.restore();
      });
    }

    // D. Golgi Apparatus (Bộ máy Golgi xếp tầng)
    if (showOrganelles) {
      const isGolgiActive = state.selectedKey === 'golgi' || state.hoveredKey === 'golgi';
      const gx = -55;
      const gy = 45;

      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(-0.5);

      ctx.strokeStyle = isGolgiActive ? '#c084fc' : '#9333ea';
      ctx.lineWidth = isGolgiActive ? 3.5 : 2.5;
      ctx.lineCap = 'round';

      // 4 Curved Cisternae sacs
      for (let c = 0; c < 4; c++) {
        const rad = 28 + c * 7;
        ctx.beginPath();
        ctx.arc(0, 0, rad, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();
      }

      // Secretory vesicles budded off (Túi tiết bong bóng)
      ctx.fillStyle = '#e9d5ff';
      const vOffsets = [[-25, 20], [-35, 12], [-28, -25], [-40, -10]];
      vOffsets.forEach(([vx, vy]) => {
        ctx.beginPath();
        ctx.arc(vx + Math.sin(state.time * 3 + vx) * 2, vy, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // E. Cytoplasmic Solute Particles
    if (showOrganelles) {
      state.cytoplasmParticles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  // -------------------------------------------------------------
  // 9. SPECIMEN 3: DNA DOUBLE HELIX & MOLECULAR GENETICS
  // -------------------------------------------------------------
  function drawDnaStructure() {
    const isDnaActive = state.selectedKey === 'dna_helix' || state.hoveredKey === 'dna_helix';
    const isTransActive = state.selectedKey === 'transcription' || state.hoveredKey === 'transcription';

    const helixHeight = 360;
    const strandWidth = 85;
    const speed = state.time * 1.8;

    ctx.save();

    // Background floating ribonucleotides (A, U, G, X)
    state.mrnaParticles.forEach(p => {
      ctx.fillStyle = p.base === 'U' ? 'rgba(234, 179, 8, 0.7)' :
                      p.base === 'A' ? 'rgba(239, 68, 68, 0.7)' :
                      p.base === 'G' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(34, 197, 94, 0.7)';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(p.base, p.x, p.y);
    });

    // Draw Double Helix Spine & Base Pairs
    state.dnaPairs.forEach(pair => {
      const y = pair.yIndex * 14;
      const angle = (pair.yIndex * 0.35) + speed;
      const x1 = Math.cos(angle) * strandWidth;
      const x2 = -x1;
      const z1 = Math.sin(angle); // depth: z > 0 is front, z < 0 is behind
      const isBehind = z1 < 0;

      // Base pair horizontal hydrogen bond bridge
      ctx.strokeStyle = isBehind ? 'rgba(71, 85, 105, 0.4)' : (isDnaActive ? '#00f2fe' : 'rgba(148, 163, 184, 0.85)');
      ctx.lineWidth = isBehind ? 1.5 : (isDnaActive ? 3 : 2);
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();

      // Hydrogen bond dashed divider in the center
      if (!isBehind) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(-8, y);
        ctx.lineTo(8, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Left Nitrogenous Base Nucleotide
      ctx.fillStyle = isBehind ? '#334155' : pair.type.colorL;
      ctx.beginPath();
      ctx.arc(x1, y, isBehind ? 3.5 : 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Right Nitrogenous Base Nucleotide
      ctx.fillStyle = isBehind ? '#334155' : pair.type.colorR;
      ctx.beginPath();
      ctx.arc(x2, y, isBehind ? 3.5 : 5.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sugar-Phosphate Backbones (Trục đường - photphat xoắn)
    function drawBackbone(phaseOffset) {
      ctx.beginPath();
      for (let y = -helixHeight / 2; y <= helixHeight / 2; y += 4) {
        const angle = (y / 14 * 0.35) + speed + phaseOffset;
        const x = Math.cos(angle) * strandWidth;
        if (y === -helixHeight / 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = isDnaActive ? '#00f2fe' : '#0284c7';
    ctx.lineWidth = 3.5;
    drawBackbone(0);

    ctx.strokeStyle = isDnaActive ? '#38bdf8' : '#0369a1';
    ctx.lineWidth = 3.5;
    drawBackbone(Math.PI);

    // Transcription Bubble (ARN Polymerase complex synthesising mRNA)
    const transY = Math.sin(state.time * 0.8) * 45;
    const bubbleX = 75;

    // RNA Polymerase enzyme blob
    ctx.fillStyle = isTransActive ? 'rgba(245, 158, 11, 0.45)' : 'rgba(217, 119, 6, 0.35)';
    ctx.strokeStyle = isTransActive ? '#fbbf24' : '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bubbleX - 35, transY - 24, 75, 48, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('RNA Poly', bubbleX + 2, transY - 5);
    ctx.fillStyle = '#fef08a';
    ctx.font = '8px Plus Jakarta Sans';
    ctx.fillText('Phiên mã ➔', bubbleX + 2, transY + 9);

    // Growing single-stranded mRNA ribbon trailing out
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bubbleX + 35, transY);
    ctx.bezierCurveTo(bubbleX + 70, transY - 20, bubbleX + 90, transY + 25, bubbleX + 130, transY + 5);
    ctx.stroke();

    // mRNA Bases labels on strand
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.fillText("5'-AUGGCAUX-3'", bubbleX + 85, transY + 36);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 10. INTERACTIVE CONTROLS & EVENT HANDLERS
  // -------------------------------------------------------------
  window.loadSpecimen = function (type) {
    if (state.specimen === type) return;
    state.specimen = type;
    playBioTone(520, 'triangle', 0.09, 0.12);

    // Update buttons UI
    document.querySelectorAll('.bio-slide-btn').forEach(btn => {
      btn.classList.remove('active', 'border-2', 'border-emerald-500', 'bg-emerald-950/60', 'text-emerald-300', 'shadow-md');
      btn.classList.add('bg-slate-900', 'border-slate-800', 'text-slate-400');
    });
    const activeBtn = document.getElementById(`slideBtn-${type}`);
    if (activeBtn) {
      activeBtn.classList.add('active', 'border-2', 'border-emerald-500', 'bg-emerald-950/60', 'text-emerald-300', 'shadow-md');
      activeBtn.classList.remove('bg-slate-900', 'border-slate-800', 'text-slate-400');
    }

    renderQuickChips(type);

    // Default active organelle per specimen
    if (type === 'plant') selectOrganelle('chloroplast');
    else if (type === 'animal') selectOrganelle('animal_membrane');
    else if (type === 'dna') selectOrganelle('dna_helix');
  };

  window.setZoom = function (val) {
    state.targetZoom = val;
    state.zoom = val;
    playBioTone(650, 'sine', 0.05, 0.08);

    document.querySelectorAll('.zoom-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-emerald-500', 'text-slate-950', 'font-bold', 'shadow-sm');
      btn.classList.add('bg-slate-800', 'text-slate-300');
    });
    const activeBtn = document.getElementById(`zoomBtn-${val}`);
    if (activeBtn) {
      activeBtn.classList.add('active', 'bg-emerald-500', 'text-slate-950', 'font-bold', 'shadow-sm');
      activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
    }

    const badge = document.getElementById('badgeObjective');
    if (badge) badge.innerText = `Vật kính: ${val}x`;
    const zoomDisp = document.getElementById('valZoomDisplay');
    if (zoomDisp) zoomDisp.innerText = `${val}x`;

    const scaleDisp = document.getElementById('scaleDisplay');
    if (scaleDisp) {
      scaleDisp.innerText = val === 40 ? '25 µm' : val === 100 ? '10 µm' : val === 400 ? '2.5 µm' : '1.0 µm';
    }
  };

  window.updateFocus = function (val) {
    state.focus = parseFloat(val);
    const disp = document.getElementById('valFocus');
    if (disp) disp.innerText = `${Math.round(val)}%`;

    const diff = Math.abs(state.focus - 100);
    const isOptimal = diff <= 12;

    const ind = document.getElementById('focusIndicator');
    if (ind) {
      if (isOptimal) {
        ind.className = 'absolute top-4 right-6 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none transition-all';
        ind.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>Tiêu cự chuẩn nét</span>';
      } else {
        ind.className = 'absolute top-4 right-6 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none transition-all';
        ind.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-400"></span><span>Chưa đúng tiêu cự</span>';
      }
    }

    // Apply real CSS blur filter to canvas for authentic optical microscope feel
    if (canvas) {
      const blurPx = isOptimal ? 0 : Math.min(8, (diff - 12) * 0.12);
      canvas.style.filter = blurPx > 0 ? `blur(${blurPx.toFixed(1)}px)` : 'none';
    }
  };

  window.updateLight = function (val) {
    state.light = parseFloat(val);
    const disp = document.getElementById('valLight');
    if (disp) disp.innerText = `${Math.round(val)}%`;
  };

  window.setLayer = function (layer) {
    state.layer = layer;
    playBioTone(400, 'sine', 0.04, 0.06);

    document.querySelectorAll('.layer-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-teal-500/20', 'text-teal-300', 'border-teal-500/40');
      btn.classList.add('bg-slate-800/80', 'text-slate-400', 'border-slate-700/60');
    });
    const activeBtn = document.getElementById(`layerBtn-${layer}`);
    if (activeBtn) {
      activeBtn.classList.add('active', 'bg-teal-500/20', 'text-teal-300', 'border-teal-500/40');
      activeBtn.classList.remove('bg-slate-800/80', 'text-slate-400', 'border-slate-700/60');
    }
  };

  window.toggleBioSimulation = function () {
    state.isRunning = !state.isRunning;
    const icon = document.getElementById('bioPlayIcon');
    const label = document.getElementById('bioPlayLabel');
    if (state.isRunning) {
      if (icon) icon.className = 'fa-solid fa-pause';
      if (label) label.innerText = 'Tạm dừng dòng chảy';
    } else {
      if (icon) icon.className = 'fa-solid fa-play';
      if (label) label.innerText = 'Tiếp tục dòng chảy';
    }
    playBioTone(330, 'sine', 0.06, 0.1);
  };

  window.resetBioMicroscope = function () {
    state.targetZoom = 100;
    state.zoom = 100;
    state.focus = 100;
    state.light = 90;
    state.layer = 'all';
    state.isRunning = true;

    const sliderFocus = document.getElementById('sliderFocus');
    if (sliderFocus) sliderFocus.value = 100;
    const sliderLight = document.getElementById('sliderLight');
    if (sliderLight) sliderLight.value = 90;

    setZoom(100);
    updateFocus(100);
    updateLight(90);
    setLayer('all');
    loadSpecimen('plant');

    const icon = document.getElementById('bioPlayIcon');
    const label = document.getElementById('bioPlayLabel');
    if (icon) icon.className = 'fa-solid fa-pause';
    if (label) label.innerText = 'Tạm dừng dòng chảy';

    playBioTone(440, 'triangle', 0.15, 0.15);
  };

  // -------------------------------------------------------------
  // 11. CLICK & HIT TESTING FOR ANATOMICAL INSPECTION
  // -------------------------------------------------------------
  function getCanvasCenterCoords(evt) {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    // Account for current zoom scale
    return {
      x: x / state.currentScale,
      y: y / state.currentScale
    };
  }

  function detectOrganelleAtCoords(x, y) {
    if (state.specimen === 'plant') {
      // 1. Check Plant Nucleus (approx x: 95, y: -65, r: 24)
      if (Math.hypot(x - 95, y - (-65)) <= 35) return 'plant_nucleus';
      // 2. Check Vacuole (center, width 200, height 130)
      if (Math.abs(x) <= 85 && Math.abs(y) <= 55) return 'vacuole';
      // 3. Check Chloroplasts (orbiting)
      for (const chl of state.chloroplasts) {
        const cx = Math.cos(chl.angle) * chl.rx;
        const cy = Math.sin(chl.angle) * chl.ry;
        if (Math.hypot(x - cx, y - cy) <= chl.size + 14) return 'chloroplast';
      }
      // 4. Check Cell wall (outer border ring)
      if ((Math.abs(x) >= 115 && Math.abs(x) <= 175) || (Math.abs(y) >= 75 && Math.abs(y) <= 125)) {
        return 'cell_wall';
      }

    } else if (state.specimen === 'animal') {
      // 1. Check Animal Nucleus (center, r: 42)
      if (Math.hypot(x, y) <= 46) return 'animal_nucleus';
      // 2. Check Mitochondria
      for (const mito of state.mitochondria) {
        if (Math.hypot(x - mito.x, y - mito.y) <= 28) return 'mitochondria';
      }
      // 3. Check Golgi (approx x: -55, y: 45)
      if (Math.hypot(x - (-55), y - 45) <= 35) return 'golgi';
      // 4. Check Plasma membrane (outer border)
      if (Math.hypot(x, y) >= 105 && Math.hypot(x, y) <= 155) return 'animal_membrane';

    } else if (state.specimen === 'dna') {
      // 1. Check Transcription bubble (ARN Polymerase)
      const transY = Math.sin(state.time * 0.8) * 45;
      if (x >= 35 && x <= 120 && Math.abs(y - transY) <= 35) return 'transcription';
      // 2. Check DNA helix
      if (Math.abs(x) <= 100) return 'dna_helix';
    }
    return null;
  }

  // Quick Chips catalog for instant clicking without chasing moving elements
  const SPECIMEN_CHIPS = {
    plant: [
      { key: 'chloroplast', label: '🌿 Lục lạp (Quang hợp)' },
      { key: 'plant_nucleus', label: '🔵 Nhân tế bào' },
      { key: 'vacuole', label: '💧 Không bào trung tâm' },
      { key: 'cell_wall', label: '🛡️ Thành Cellulose' }
    ],
    animal: [
      { key: 'animal_nucleus', label: '🔵 Nhân tế bào' },
      { key: 'mitochondria', label: '⚡ Ti thể (ATP)' },
      { key: 'golgi', label: '📦 Bộ máy Golgi' },
      { key: 'animal_membrane', label: '🛡️ Màng sinh chất' }
    ],
    dna: [
      { key: 'dna_helix', label: '🧬 Xoắn kép ADN' },
      { key: 'transcription', label: '✂️ Phiên mã & ARN Pol' }
    ]
  };

  function renderQuickChips(specimenType) {
    const container = document.getElementById('quickOrganelleChips');
    if (!container) return;
    const chips = SPECIMEN_CHIPS[specimenType] || [];
    container.innerHTML = chips.map(chip => {
      const isActive = state.selectedKey === chip.key;
      const activeCls = isActive
        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
        : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/80 hover:text-white';
      return `<button type="button" onclick="selectOrganelle('${chip.key}')" class="organelle-chip px-2.5 py-1 rounded-lg text-[11px] border transition-all duration-150 ${activeCls}" data-key="${chip.key}">${chip.label}</button>`;
    }).join('');
  }
  window.renderQuickChips = renderQuickChips;

  function selectOrganelle(key) {
    const data = ORGANELLES[key];
    if (!data) return;
    state.selectedKey = key;
    playBioTone(587.33, 'triangle', 0.12, 0.12);

    const inspectName = document.getElementById('inspectName');
    const inspectSubtype = document.getElementById('inspectSubtype');
    const inspectLatin = document.getElementById('inspectLatin');
    const inspectFunction = document.getElementById('inspectFunction');
    const inspectFormulaBox = document.getElementById('inspectFormulaBox');
    const inspectFormulaText = document.getElementById('inspectFormulaText');
    const inspectPhenomenon = document.getElementById('inspectPhenomenon');
    const inspectIconWrap = document.getElementById('inspectIconWrap');
    const inspectQuizPrompt = document.getElementById('inspectQuizPrompt');
    const inspectQuizFeedback = document.getElementById('inspectQuizFeedback');

    if (inspectName) inspectName.innerText = data.name;
    if (inspectSubtype) inspectSubtype.innerText = data.subtype;
    if (inspectLatin) inspectLatin.innerText = data.latin;
    if (inspectFunction) inspectFunction.innerText = data.function;
    if (inspectFormulaText) inspectFormulaText.innerText = data.formula;
    if (inspectPhenomenon) inspectPhenomenon.innerText = data.phenomenon;

    if (inspectIconWrap) {
      inspectIconWrap.innerHTML = `<i class="fa-solid ${data.icon}"></i>`;
    }

    if (inspectQuizPrompt) inspectQuizPrompt.innerText = data.quizPrompt;
    if (inspectQuizFeedback) inspectQuizFeedback.classList.add('hidden');

    // Update Quick Chips styling
    document.querySelectorAll('#quickOrganelleChips .organelle-chip').forEach(btn => {
      const isCurrent = btn.getAttribute('data-key') === key;
      if (isCurrent) {
        btn.className = 'organelle-chip px-2.5 py-1 rounded-lg text-[11px] border transition-all duration-150 bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm';
      } else {
        btn.className = 'organelle-chip px-2.5 py-1 rounded-lg text-[11px] border transition-all duration-150 bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/80 hover:text-white';
      }
    });

    // Update Lens Status Bar
    const statusEl = document.getElementById('organelleLensStatus');
    const statusText = document.getElementById('organelleLensStatusText');
    if (statusText) {
      statusText.innerHTML = `Đang soi: <b class="text-emerald-400 font-bold">${data.name}</b>`;
    }
    if (statusEl) {
      statusEl.classList.remove('border-amber-400/80');
      statusEl.classList.add('border-emerald-500/50');
    }
  }
  window.selectOrganelle = selectOrganelle;

  window.answerInspectQuiz = function (isCorrect) {
    const feedback = document.getElementById('inspectQuizFeedback');
    if (!feedback) return;
    feedback.classList.remove('hidden', 'text-emerald-400', 'text-rose-400');
    if (isCorrect) {
      feedback.classList.add('text-emerald-400');
      feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Chính xác! Bạn đã nắm vững kiến thức bài học SGK.</span>';
      playBioTone(784, 'sine', 0.15, 0.2);
    } else {
      feedback.classList.add('text-rose-400');
      feedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <span>Chưa chính xác! Hãy đọc lại phần tóm tắt phía trên nhé.</span>';
      playBioTone(240, 'sawtooth', 0.18, 0.15);
    }
  };

  // Canvas pointer events: rock-solid, zero floating jitter
  function setupPointerEvents() {
    if (!canvas) return;

    canvas.addEventListener('mouseenter', () => {
      state.isHoveringCanvas = true;
    });

    canvas.addEventListener('mousemove', (e) => {
      state.isHoveringCanvas = true;
      const coords = getCanvasCenterCoords(e);
      const detected = detectOrganelleAtCoords(coords.x, coords.y);
      state.hoveredKey = detected;

      const statusEl = document.getElementById('organelleLensStatus');
      const statusText = document.getElementById('organelleLensStatusText');

      if (detected && ORGANELLES[detected]) {
        canvas.style.cursor = 'pointer';
        if (statusText) {
          statusText.innerHTML = `<span class="text-amber-300 font-semibold">🔍 Nhắm thấy: ${ORGANELLES[detected].name}</span> <span class="text-slate-400 text-[10px]">(Bấm để chọn)</span>`;
        }
        if (statusEl) {
          statusEl.classList.add('border-amber-400/80');
        }
      } else {
        canvas.style.cursor = 'crosshair';
        if (statusEl) {
          statusEl.classList.remove('border-amber-400/80');
        }
        if (statusText) {
          if (state.selectedKey && ORGANELLES[state.selectedKey]) {
            statusText.innerHTML = `Đang soi: <b class="text-emerald-400 font-bold">${ORGANELLES[state.selectedKey].name}</b>`;
          } else {
            statusText.innerText = 'Thị kính: Bấm bào quan trên hình hoặc chọn thanh bên dưới';
          }
        }
      }
    });

    canvas.addEventListener('mouseleave', () => {
      state.hoveredKey = null;
      state.isHoveringCanvas = false;
      canvas.style.cursor = 'crosshair';

      const statusEl = document.getElementById('organelleLensStatus');
      const statusText = document.getElementById('organelleLensStatusText');
      if (statusEl) {
        statusEl.classList.remove('border-amber-400/80');
      }
      if (statusText) {
        if (state.selectedKey && ORGANELLES[state.selectedKey]) {
          statusText.innerHTML = `Đang soi: <b class="text-emerald-400 font-bold">${ORGANELLES[state.selectedKey].name}</b>`;
        } else {
          statusText.innerText = 'Thị kính: Bấm bào quan trên hình hoặc chọn thanh bên dưới';
        }
      }
    });

    canvas.addEventListener('click', (e) => {
      const coords = getCanvasCenterCoords(e);
      const detected = detectOrganelleAtCoords(coords.x, coords.y);
      if (detected) {
        selectOrganelle(detected);
      }
    });

    canvas.addEventListener('touchstart', (e) => {
      const coords = getCanvasCenterCoords(e);
      const detected = detectOrganelleAtCoords(coords.x, coords.y);
      if (detected) {
        selectOrganelle(detected);
      }
    }, { passive: true });
  }

  // -------------------------------------------------------------
  // 12. BOOTSTRAP ON DOM READY
  // -------------------------------------------------------------
  function initBioMicroscope() {
    canvas = document.getElementById('microscopeCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    initSimulationData();
    resizeCanvas();
    setupPointerEvents();
    renderQuickChips('plant');
    selectOrganelle('chloroplast');

    window.addEventListener('resize', resizeCanvas);
    animId = requestAnimationFrame(renderLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBioMicroscope);
  } else {
    initBioMicroscope();
  }
})();
