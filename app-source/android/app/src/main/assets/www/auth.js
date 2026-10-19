/**
 * NEXUSLAB - Scientific Virtual Simulation Suite
 * Advanced Authentication, Audio Synthesizer, 3D Tilt & Gamification Engine (auth.js)
 * Full Animation, 60 FPS Micro-Interactions, 29-Lab Tracking, Avatar Customizer & Audio FX.
 */

(function () {
    // -------------------------------------------------------------
    // 1. DYNAMIC FONT & HIGH-TECH STYLES INJECTION
    // -------------------------------------------------------------
    function injectGlobalStyles() {
        if (!document.getElementById('nexusGlobalStyles')) {
            // Load Vietnamese optimized Google Fonts
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap&subset=vietnamese';
            document.head.appendChild(link);

            const style = document.createElement('style');
            style.id = 'nexusGlobalStyles';
            style.textContent = `
                /* Ensure flawless Vietnamese font rendering across all elements */
                body, button, input, select, textarea {
                    font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', system-ui, -apple-system, sans-serif !important;
                }
                .font-mono, [class*="font-mono"] {
                    font-family: 'JetBrains Mono', monospace !important;
                }

                /* Futuristic 3D Perspective Container */
                .nexus-perspective {
                    perspective: 1200px;
                }

                /* Animated Conic Glow Borders */
                @keyframes nexusRotateBorder {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .nexus-glow-border {
                    position: relative;
                    z-index: 0;
                    overflow: hidden;
                }
                .nexus-glow-border::before {
                    content: '';
                    position: absolute;
                    z-index: -2;
                    left: -50%;
                    top: -50%;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(transparent, rgba(0, 242, 254, 0.6), transparent 30%);
                    animation: nexusRotateBorder 6s linear infinite;
                }
                .nexus-glow-border::after {
                    content: '';
                    position: absolute;
                    z-index: -1;
                    inset: 1.5px;
                    background: rgba(11, 15, 36, 0.95);
                    border-radius: inherit;
                }

                /* Laser Scanning Line Animation */
                @keyframes nexusLaserScan {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 0.8; }
                    100% { transform: translateY(1000%); opacity: 0; }
                }
                .nexus-laser-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #00f2fe, #00ff9d, transparent);
                    animation: nexusLaserScan 4s ease-in-out infinite;
                    pointer-events: none;
                }

                /* Shimmering XP Bar */
                @keyframes nexusShimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .nexus-shimmer-bar {
                    background: linear-gradient(90deg, #00f2fe 0%, #00ff9d 50%, #4facfe 100%);
                    background-size: 200% 100%;
                    animation: nexusShimmer 3s infinite linear;
                }

                /* Tilt Smoothing */
                .nexus-tilt-card {
                    transform-style: preserve-3d;
                    transition: transform 0.15s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.25s ease;
                    will-change: transform;
                }

                /* Sound Pulse */
                @keyframes nexusSoundWave {
                    0%, 100% { height: 4px; }
                    50% { height: 14px; }
                }
                .sound-bar-1 { animation: nexusSoundWave 0.8s ease-in-out infinite; }
                .sound-bar-2 { animation: nexusSoundWave 1.1s ease-in-out infinite 0.2s; }
                .sound-bar-3 { animation: nexusSoundWave 0.9s ease-in-out infinite 0.4s; }
            `;
            document.head.appendChild(style);
        }
    }

    // -------------------------------------------------------------
    // 2. WEB AUDIO API SYNTHESIZER (Pure JS Sci-Fi Audio FX)
    // -------------------------------------------------------------
    const NexusAudio = {
        ctx: null,
        enabled: localStorage.getItem('nexus_audio_mute') !== 'true',

        init() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
        },

        toggle() {
            this.enabled = !this.enabled;
            localStorage.setItem('nexus_audio_mute', (!this.enabled).toString());
            updateSoundIcon();
            if (this.enabled) {
                this.beep(880, 'sine', 0.08, 0.05);
                showAuthToast('Âm thanh hiệu ứng: ĐÃ BẬT 🔊', 'info');
            } else {
                showAuthToast('Âm thanh hiệu ứng: ĐÃ TẮT 🔇', 'info');
            }
        },

        beep(freq = 600, type = 'sine', duration = 0.08, gainVal = 0.04) {
            if (!this.enabled) return;
            try {
                this.init();
                if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {}
        },

        hover() {
            this.beep(1200, 'sine', 0.02, 0.015);
        },

        click() {
            this.beep(850, 'triangle', 0.04, 0.035);
        },

        tab() {
            this.beep(520, 'sine', 0.05, 0.03);
            setTimeout(() => this.beep(780, 'sine', 0.05, 0.03), 40);
        },

        success() {
            if (!this.enabled) return;
            this.beep(523.25, 'sine', 0.12, 0.04);
            setTimeout(() => this.beep(659.25, 'sine', 0.12, 0.04), 90);
            setTimeout(() => this.beep(783.99, 'sine', 0.18, 0.05), 180);
            setTimeout(() => this.beep(1046.50, 'sine', 0.3, 0.06), 270);
        },

        warp() {
            if (!this.enabled) return;
            try {
                this.init();
                if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.16);
                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.18);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.18);
            } catch (e) {}
        }
    };

    function updateSoundIcon() {
        const icons = document.querySelectorAll('.nexus-sound-btn');
        icons.forEach(btn => {
            if (NexusAudio.enabled) {
                btn.innerHTML = `
                    <span class="flex items-center gap-1 text-cyan-400">
                        <span class="w-1 bg-cyan-400 rounded sound-bar-1 inline-block"></span>
                        <span class="w-1 bg-cyan-400 rounded sound-bar-2 inline-block"></span>
                        <span class="w-1 bg-cyan-400 rounded sound-bar-3 inline-block"></span>
                    </span>
                    <span class="text-[11px] font-mono font-bold hidden sm:inline">Âm Thanh: Bật</span>
                `;
                btn.title = "Tắt âm thanh hiệu ứng";
            } else {
                btn.innerHTML = `
                    <span class="text-slate-500">🔇</span>
                    <span class="text-[11px] font-mono text-slate-500 hidden sm:inline">Âm Thanh: Tắt</span>
                `;
                btn.title = "Bật âm thanh hiệu ứng";
            }
        });
    }

    // -------------------------------------------------------------
    // 3. COMPLETE REGISTRY OF ALL 29 KHTN LAB SIMULATIONS
    // -------------------------------------------------------------
    const NEXUS_LABS = [
        // VẬT LÝ (8 BÀI)
        { id: 'ly1', subject: 'Vật Lý', code: 'PHY-01', name: 'Động Năng & Thế Năng (Máng Nghiêng)', file: 'ly1.html', icon: '⚡', grade: 'Lớp 9', desc: 'Mô phỏng va chạm con lăn và miếng gỗ, khảo sát chuyển hóa thế năng và động năng.' },
        { id: 'ly2', subject: 'Vật Lý', code: 'PHY-02', name: 'Định Luật Ohm & Điện Trở Dây Dẫn', file: 'ly2.html', icon: '🔋', grade: 'Lớp 9', desc: 'Đo cường độ dòng điện $I$, hiệu điện thế $U$, điện trở suất của các kim loại.' },
        { id: 'ly3', subject: 'Vật Lý', code: 'PHY-03', name: 'Khúc Xạ Ánh Sáng & Lăng Kính', file: 'ly3.html', icon: '🌈', grade: 'Lớp 9', desc: 'Tán sắc ánh sáng trắng qua lăng kính tam giác và góc khúc xạ tới hạn.' },
        { id: 'ly4', subject: 'Vật Lý', code: 'PHY-04', name: 'Đòn Bẩy & Cân Bằng Lực Cơ Học', file: 'ly4.html', icon: '⚖️', grade: 'Lớp 8', desc: 'Quy tắc mômen lực, cánh tay đòn và điểm tựa trong đời sống hàng ngày.' },
        { id: 'ly5', subject: 'Vật Lý', code: 'PHY-05', name: 'Lực Đẩy Archimedes & Sự Nổi', file: 'ly5.html', icon: '🌊', grade: 'Lớp 8', desc: 'Đo thể tích chất lỏng bị chiếm chỗ, tính lực đẩy $F_A = d \\cdot V$.' },
        { id: 'ly6', subject: 'Vật Lý', code: 'PHY-06', name: 'Thấu Kính Hội Tụ & Phân Kỳ', file: 'ly6.html', icon: '🔍', grade: 'Lớp 9', desc: 'Quang tâm, tiêu cự, tiêu điểm, dựng ảnh thật/ảnh ảo sắc nét.' },
        { id: 'ly7', subject: 'Vật Lý', code: 'PHY-07', name: 'Cảm Ứng Điện Từ Faraday', file: 'ly7.html', icon: '🧲', grade: 'Lớp 9', desc: 'Nam châm chuyển động qua cuộn dây sinh ra dòng điện cảm ứng xoay chiều.' },
        { id: 'ly8', subject: 'Vật Lý', code: 'PHY-08', name: 'Sự Nở Vì Nhiệt & Băng Kép Kim Loại', file: 'ly8.html', icon: '🌡️', grade: 'Lớp 6-8', desc: 'Thí nghiệm độ giãn nở của đồng, sắt, nhôm và ứng dụng rơ-le nhiệt tự ngắt.' },
        { id: 'lysand', subject: 'Vật Lý', code: 'PHY-SAND', name: 'NexusLab Sandbox Vật Lý Đa Năng', file: 'lysand.html', icon: '⚡', grade: 'Lớp 8-9-10', desc: 'Mô phỏng NexusLab tổng hợp Cơ năng Skate Park, Laser Snell, Thấu kính & Faraday.' },

        // HÓA HỌC (9 BÀI + 1 SANDBOX)
        { id: 'hoa1', subject: 'Hóa Học', code: 'CHM-01', name: 'Động Học Phân Tử Khí & Áp Suất', file: 'hoa1.html', icon: '💨', grade: 'Lớp 8-9', desc: 'Mô phỏng Brownian motion, định luật khí lý tưởng $P-V-T$.' },
        { id: 'hoa2', subject: 'Hóa Học', code: 'CHM-02', name: 'Chuẩn Độ Axit - Bazơ & Thang Đo pH', file: 'hoa2.html', icon: '🧪', grade: 'Lớp 8-9', desc: 'Đổi màu chất chỉ thị phenolphtalein, quỳ tím và chuẩn độ $HCl + NaOH$.' },
        { id: 'hoa3', subject: 'Hóa Học', code: 'CHM-03', name: 'Phản Ứng Trao Đổi & Kết Tủa Hóa Học', file: 'hoa3.html', icon: '💧', grade: 'Lớp 9', desc: 'Tạo kết tủa trắng $BaSO_4$, kết tủa xanh $Cu(OH)_2$ và điều kiện ion trao đổi.' },
        { id: 'hoa4', subject: 'Hóa Học', code: 'CHM-04', name: 'Tách Chất & Chưng Cất Phân Đoạn', file: 'hoa4.html', icon: '🔥', grade: 'Lớp 8', desc: 'Tách hỗn hợp nước - rượu theo điểm sôi nhiệt độ bằng bình sinh hàn.' },
        { id: 'hoa5', subject: 'Hóa Học', code: 'CHM-05', name: 'Điện Phân Dung Dịch Đồng Sunfat (CuSO4)', file: 'hoa5.html', icon: '⚡', grade: 'Lớp 9', desc: 'Bám kim loại Đồng đỏ ở cực âm catot, sủi bọt khí Oxi ở cực dương anot.' },
        { id: 'hoa6', subject: 'Hóa Học', code: 'CHM-06', name: 'Kim Loại Tác Dụng Axit (Sinh Khí H2)', file: 'hoa6.html', icon: '🫧', grade: 'Lớp 8-9', desc: 'Phản ứng sủi bọt khí mãnh liệt của $Zn, Fe, Mg$ trong axit clohiđric.' },
        { id: 'hoa7', subject: 'Hóa Học', code: 'CHM-07', name: 'Tốc Độ Phản Ứng & Nhiệt Độ / Nồng Độ', file: 'hoa7.html', icon: '⏱️', grade: 'Lớp 9', desc: 'Ảnh hưởng của nồng độ chất phản ứng và nhiệt độ đến tốc độ phản ứng hóa học.' },
        { id: 'hoa8', subject: 'Hóa Học', code: 'CHM-08', name: 'Đốt Cháy Magie & Phản Ứng Tỏa Nhiệt', file: 'hoa8.html', icon: '✨', grade: 'Lớp 8', desc: 'Ánh sáng trắng chói lòa của dải Mg khi cháy trong không khí tạo $MgO$.' },
        { id: 'hoa9', subject: 'Hóa Học', code: 'CHM-09', name: 'Ăn Mòn Kim Loại Điện Hóa & Bảo Vệ', file: 'hoa9.html', icon: '🛡️', grade: 'Lớp 9', desc: 'Quá trình gỉ sét của đinh sắt và phương pháp gắn kẽm hy sinh bảo vệ catot.' },
        { id: 'hoasand', subject: 'Hóa Học', code: 'CHM-SAND', name: 'NexusLab Sandbox Hóa Học Đa Năng', file: 'hoasand.html', icon: '🧪', grade: 'Lớp 8-9-10', desc: 'Mô phỏng NexusLab tổng hợp Kim loại, Khí đốt CH₄/C₂H₄, Nước Brom, Tráng gương Bạc & Tinh bột.' },

        // SINH HỌC (12 BÀI)
        { id: 'sinh1', subject: 'Sinh Học', code: 'BIO-01', name: 'Cấu Trúc Không Gian ADN Xoắn Kép 3D', file: 'sinh1.html', icon: '🧬', grade: 'Lớp 9', desc: 'Nguyên tắc bổ sung A-T, G-X, xoay 3D 360 độ và tính toán số liên kết Hydro.' },
        { id: 'sinh2', subject: 'Sinh Học', code: 'BIO-02', name: 'Nguyên Phân & Chu Kỳ Tế Bào Sống', file: 'sinh2.html', icon: '🔬', grade: 'Lớp 9', desc: 'Quan sát các kỳ Đầu, Giữa, Sau, Cuối với thoi vô sắc và nhiễm sắc thể nhân đôi.' },
        { id: 'sinh3', subject: 'Sinh Học', code: 'BIO-03', name: 'Thẩm Thấu & Co Nguyên Sinh Tế Bào', file: 'sinh3.html', icon: '🧅', grade: 'Lớp 8-9', desc: 'Tế bào biểu bì củ hành tím trong dung dịch ưu trương muối ăn và hồi nguyên sinh.' },
        { id: 'sinh4', subject: 'Sinh Học', code: 'BIO-04', name: 'Quang Hợp & Sự Tạo Tinh Bột Ở Lá', file: 'sinh4.html', icon: '🍃', grade: 'Lớp 7-8', desc: 'Thí nghiệm bịt băng đen một phần lá, nhuộm iot xác định tinh bột quang hợp.' },
        { id: 'sinh5', subject: 'Sinh Học', code: 'BIO-05', name: 'Cấu Tạo Tim & Hệ Tuần Hoàn Máu', file: 'sinh5.html', icon: '❤️', grade: 'Lớp 8', desc: 'Tâm nhĩ, tâm thất, vòng tuần hoàn lớn và vòng tuần hoàn nhỏ đập theo nhịp.' },
        { id: 'sinh6', subject: 'Sinh Học', code: 'BIO-06', name: 'Cấu Trúc Tế Bào Nhân Thực (Thực & Động Vật)', file: 'sinh6.html', icon: '🧫', grade: 'Lớp 6-8', desc: 'So sánh thành cellulose, lục lạp, không bào lớn giữa tế bào thực vật và động vật.' },
        { id: 'sinh7', subject: 'Sinh Học', code: 'BIO-07', name: 'Thoát Hơi Nước & Khí Khổng Đóng Mở', file: 'sinh7.html', icon: '💧', grade: 'Lớp 7-8', desc: 'Tế bào hình hạt đậu trương nước mở khí khổng và cơ chế điều tiết nước ở lá.' },
        { id: 'sinh8', subject: 'Sinh Học', code: 'BIO-08', name: 'Phản Xạ Tủy Sống & Cung Phản Xạ', file: 'sinh8.html', icon: '🧠', grade: 'Lớp 8', desc: '5 khâu của cung phản xạ: cơ quan thụ cảm, noron hướng tâm, trung ương, ly tâm, cơ.' },
        { id: 'sinh9', subject: 'Sinh Học', code: 'BIO-09', name: 'Hô Hấp Tế Bào & Sự Thải Khí CO2', file: 'sinh9.html', icon: '🌱', grade: 'Lớp 7-8', desc: 'Hạt nảy mầm hô hấp thải khí cacbonic làm đục nước vôi trong $Ca(OH)_2$.' },
        { id: 'sinh10', subject: 'Sinh Học', code: 'BIO-10', name: 'Lai Một Cặp Tính Trạng (Quy Luật Mendel)', file: 'sinh10.html', icon: '🫛', grade: 'Lớp 9', desc: 'Phép lai hoa đỏ x hoa trắng ở đậu Hà Lan, lưới Punnett F1 đồng tính, F2 tỉ lệ 3:1.' },
        { id: 'sinh11', subject: 'Sinh Học', code: 'BIO-11', name: 'Quá Trình Thụ Tinh & Phát Triển Phôi', file: 'sinh11.html', icon: '🐣', grade: 'Lớp 8-9', desc: 'Sự kết hợp giữa tinh trùng và trứng tạo hợp tử, quá trình phân cắt phôi dâu.' },
        { id: 'sinh12', subject: 'Sinh Học', code: 'BIO-12', name: 'Màng Sinh Chất Khảm Động (Fluid Mosaic)', file: 'sinh12.html', icon: '🌐', grade: 'Lớp 9', desc: 'Lớp kép phospholipid, protein xuyên màng và cơ chế khuếch tán chọn lọc.' },
        { id: 'sinhsand', subject: 'Sinh Học', code: 'BIO-SAND', name: 'NexusLab Sandbox Sinh Học Đa Năng', file: 'sinhsand.html', icon: '🧬', grade: 'Lớp 9-10', desc: 'Mô phỏng Di truyền Mendel (Punnett 3:1 & 9:3:3:1), Tái bản & Dịch mã ADN, Chu kỳ Tế bào và Thẩm thấu màng.' }
    ];

    // -------------------------------------------------------------
    // 4. STORAGE & PERSISTENCE (SECURITY HARDENED)
    // -------------------------------------------------------------
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function hashPassword(plain, salt = 'nexus_salt_v2_2026') {
        if (!plain) return '';
        if (typeof plain === 'string' && plain.startsWith('nx_hash_')) return plain;
        let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
        const s = String(plain) + ':' + salt;
        for (let i = 0; i < s.length; i++) {
            const ch = s.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 'nx_hash_' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
    }

    const STORAGE_KEY_USERS = 'nexus_lab_users_v2';
    const STORAGE_KEY_CURRENT = 'nexus_current_user_v2';

    const DEFAULT_ACCOUNTS = [
        {
            id: 'user_hs_01',
            email: 'hocsinh@nexus.edu.vn',
            password: hashPassword('123456'),
            name: 'Nguyễn Hải Đăng',
            role: 'student',
            roleLabel: 'Học sinh',
            grade: 'Lớp 9A1',
            school: 'Trường THCS Khoa Học Thực Nghiệm',
            avatar: '👨‍🎓',
            xp: 1650,
            level: 'Level 4 - Nhà Nghiên Cứu Tập Sự',
            badges: ['Cơ học Siêu đẳng', 'Pha chế Axit-Bazơ', 'Giải mã DNA', 'Thực nghiệm An toàn'],
            completedLabs: ['ly1', 'ly3', 'hoa1', 'hoa2', 'sinh1', 'sinh2']
        },
        {
            id: 'user_gv_01',
            email: 'giaovien@nexus.edu.vn',
            password: hashPassword('123456'),
            name: 'ThS. Hoàng Tuấn Anh',
            role: 'teacher',
            roleLabel: 'Giáo viên',
            grade: 'Bộ môn Khoa Học Tự Nhiên',
            school: 'Trường THCS-THPT Chuyên Hà Nội',
            avatar: '👨‍🏫',
            xp: 9200,
            level: 'Master - Chuyên Gia Hướng Dẫn KHTN',
            badges: ['Cố vấn Khoa học', 'Bậc thầy 60 FPS', 'Tổ chức Phòng Lab', 'Bảo trợ Sáng tạo', 'Xuất sắc Toàn diện'],
            completedLabs: NEXUS_LABS.map(l => l.id)
        }
    ];

    function initDatabase() {
        if (!localStorage.getItem(STORAGE_KEY_USERS)) {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
        }
    }

    function getAllUsers() {
        initDatabase();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || DEFAULT_ACCOUNTS;
        } catch (e) {
            return DEFAULT_ACCOUNTS;
        }
    }

    function saveAllUsers(users) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }

    function getCurrentUser() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_CURRENT);
            if (!data) return null;
            const parsed = JSON.parse(data);
            if (parsed && parsed.password) delete parsed.password;
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function setCurrentUser(user) {
        if (user) {
            const sanitized = Object.assign({}, user);
            delete sanitized.password; // Do not persist password in active session storage
            localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(sanitized));
        } else {
            localStorage.removeItem(STORAGE_KEY_CURRENT);
        }
        updateAllHeaders();
    }

    // -------------------------------------------------------------
    // 5. AUTH LOGIC: LOGIN, REGISTER, LOGOUT, AVATAR UPDATE
    // -------------------------------------------------------------
    function login(email, password) {
        email = (email || '').trim().toLowerCase();
        const users = getAllUsers();
        const hashedInput = hashPassword(password);
        
        // Match either salted hash or legacy plaintext with automatic upgrade
        let userIndex = -1;
        const user = users.find((u, idx) => {
            const emailMatch = u.email && u.email.toLowerCase() === email;
            if (!emailMatch) return false;
            const passMatch = u.password === hashedInput || u.password === password;
            if (passMatch) {
                userIndex = idx;
                return true;
            }
            return false;
        });

        if (user) {
            // Upgrade legacy password to salted hash if needed
            if (user.password !== hashedInput) {
                user.password = hashedInput;
                users[userIndex] = user;
                saveAllUsers(users);
            }
            setCurrentUser(user);
            NexusAudio.success();
            showAuthToast(`Xin chào mừng, ${escapeHtml(user.name)}! Đăng nhập thành công.`, 'success');
            return { success: true, user: getCurrentUser() };
        } else {
            NexusAudio.beep(250, 'sawtooth', 0.15, 0.05);
            showAuthToast('Email hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.', 'error');
            return { success: false, message: 'Sai thông tin đăng nhập' };
        }
    }

    function register(userData) {
        const users = getAllUsers();
        const email = (userData.email || '').trim().toLowerCase();

        if (!email || !userData.password || !userData.name) {
            NexusAudio.beep(250, 'sawtooth', 0.15, 0.05);
            showAuthToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
            return { success: false, message: 'Thiếu thông tin' };
        }

        if (users.some(u => u.email && u.email.toLowerCase() === email)) {
            NexusAudio.beep(250, 'sawtooth', 0.15, 0.05);
            showAuthToast('Email này đã được sử dụng! Vui lòng chọn email khác.', 'error');
            return { success: false, message: 'Email đã tồn tại' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            email: email,
            password: hashPassword(userData.password),
            name: escapeHtml(userData.name.trim()),
            role: userData.role === 'teacher' ? 'teacher' : 'student',
            roleLabel: userData.role === 'teacher' ? 'Giáo viên' : 'Học sinh',
            grade: escapeHtml(userData.grade || 'Lớp 9'),
            school: escapeHtml(userData.school || 'Trường THCS / THPT'),
            avatar: userData.role === 'teacher' ? '👨‍🏫' : '👨‍🎓',
            xp: 200,
            level: 'Level 1 - Thành Viên Mới',
            badges: ['Tân Binh Phòng Lab'],
            completedLabs: []
        };

        users.push(newUser);
        saveAllUsers(users);
        setCurrentUser(newUser);
        NexusAudio.success();
        showAuthToast(`Đăng ký thành công! Chào mừng ${newUser.name} gia nhập NexusLab.`, 'success');
        return { success: true, user: newUser };
    }

    function logout() {
        const current = getCurrentUser();
        const name = current ? current.name : '';
        NexusAudio.beep(350, 'sine', 0.1, 0.04);
        setCurrentUser(null);
        showAuthToast(name ? `Đã đăng xuất tài khoản ${name}.` : 'Đã đăng xuất an toàn.', 'info');
        updateAllHeaders();
    }

    function changeUserAvatar(newAvatar) {
        const user = getCurrentUser();
        if (!user) return;
        user.avatar = newAvatar;
        setCurrentUser(user);
        const users = getAllUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = user;
            saveAllUsers(users);
        }
        NexusAudio.click();
        showAuthToast(`Đã đổi Avatar thành ${newAvatar}`, 'success');
        openProfileModal(); // Refresh profile UI
    }

    function toggleLabCompletion(labId) {
        const user = getCurrentUser();
        if (!user) return;
        if (!user.completedLabs) user.completedLabs = [];
        const isDone = user.completedLabs.includes(labId);

        if (isDone) {
            user.completedLabs = user.completedLabs.filter(id => id !== labId);
            user.xp = Math.max(0, (user.xp || 0) - 50);
            NexusAudio.beep(350, 'sine', 0.08);
            showAuthToast(`Đã hủy trạng thái hoàn thành bài ${labId.toUpperCase()}`, 'info');
        } else {
            user.completedLabs.push(labId);
            user.xp = (user.xp || 0) + 50;
            NexusAudio.success();
            showAuthToast(`⚡ +50 XP: Đã đánh dấu hoàn thành ${labId.toUpperCase()}!`, 'success');
        }

        // Recalculate level
        const count = user.completedLabs.length;
        if (count >= 25) user.level = 'Master - Nhà Khoa Học Đỉnh Cao';
        else if (count >= 18) user.level = 'Level 5 - Chuyên Gia Thực Nghiệm';
        else if (count >= 10) user.level = 'Level 4 - Nhà Nghiên Cứu Tập Sự';
        else if (count >= 5) user.level = 'Level 3 - Thực Tập Sinh KHTN';
        else if (count >= 2) user.level = 'Level 2 - Khám Phá Phòng Lab';
        else user.level = 'Level 1 - Thành Viên Mới';

        setCurrentUser(user);
        const users = getAllUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = user;
            saveAllUsers(users);
        }
        openProfileModal('labs'); // Keep on labs tab
    }

    // -------------------------------------------------------------
    // 6. UI TOAST NOTIFICATION
    // -------------------------------------------------------------
    function showAuthToast(msg, type = 'info') {
        let toast = document.getElementById('nexusAuthToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'nexusAuthToast';
            toast.className = 'fixed bottom-6 right-6 z-[9999] pointer-events-none transition-all duration-300 transform translate-y-10 opacity-0';
            document.body.appendChild(toast);
        }

        const styles = {
            success: 'border-cyan-400/60 bg-slate-950/95 text-cyan-300 shadow-[0_0_30px_rgba(0,242,254,0.45)]',
            error: 'border-rose-500/60 bg-slate-950/95 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.45)]',
            info: 'border-blue-400/60 bg-slate-950/95 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.45)]'
        };

        const icons = {
            success: '✓',
            error: '✕',
            info: '⚡'
        };

        toast.innerHTML = `
            <div class="px-5 py-3.5 rounded-2xl border backdrop-blur-2xl flex items-center gap-3 font-mono text-xs ${styles[type] || styles.info}">
                <span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">${icons[type] || '•'}</span>
                <span class="font-semibold">${escapeHtml(msg)}</span>
            </div>
        `;

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        });

        clearTimeout(window.__nexusToastTimeout);
        window.__nexusToastTimeout = setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            toast.classList.remove('translate-y-0', 'opacity-100');
        }, 3600);
    }

    // -------------------------------------------------------------
    // 7. INJECT MODALS (AUTH TERMINAL & RESEARCH PROFILE PASSPORT)
    // -------------------------------------------------------------
    function injectModals() {
        injectGlobalStyles();

        // 7.1 Auth Modal
        if (!document.getElementById('nexusAuthModal')) {
            const modalEl = document.createElement('div');
            modalEl.id = 'nexusAuthModal';
            modalEl.className = 'fixed inset-0 z-[9990] hidden flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl transition-opacity';
            modalEl.onclick = function (e) {
                if (e.target === modalEl) closeAuthModal();
            };

            modalEl.innerHTML = `
                <div class="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,242,254,0.3)] text-slate-100 backdrop-blur-3xl overflow-hidden">
                    <div class="nexus-laser-line"></div>

                    <!-- Close button -->
                    <button type="button" onclick="NexusAuth.closeAuthModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all border border-slate-700">
                        ✕
                    </button>

                    <!-- Header icon & brand -->
                    <div class="text-center space-y-2 mb-6">
                        <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-400 flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(0,242,254,0.5)]">
                            ⚡
                        </div>
                        <h3 id="nexusModalTitle" class="text-2xl font-black tracking-tight text-white">CỔNG XÁC THỰC LAB</h3>
                        <p id="nexusModalSubtitle" class="text-xs text-slate-400 font-mono">Đăng nhập tài khoản để đồng bộ hóa 29 phòng lab KHTN</p>
                    </div>

                    <!-- Mode Tab Selector -->
                    <div class="flex p-1 mb-5 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono">
                        <button id="nexusTabLogin" type="button" onclick="NexusAuth.switchTab('login')" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            ĐĂNG NHẬP
                        </button>
                        <button id="nexusTabRegister" type="button" onclick="NexusAuth.switchTab('register')" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all text-slate-400 hover:text-white">
                            TẠO HỒ SƠ MỚI
                        </button>
                    </div>

                    <!-- Fast Demo Account Pill Buttons -->
                    <div id="nexusDemoPills" class="mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono">
                        <div class="text-slate-400 mb-2 flex items-center justify-between">
                            <span class="flex items-center gap-1.5"><span class="text-cyan-400">⚡</span> Đăng nhập nhanh (1-Click Demo):</span>
                            <span class="text-emerald-400 text-[10px] uppercase font-bold">Khuyên Dùng</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" onclick="NexusAuth.quickFillDemo('student')" class="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 text-cyan-300 transition-all text-left flex items-center gap-2">
                                <span class="text-xl">👨‍🎓</span>
                                <div class="truncate">
                                    <div class="font-bold text-white">Học Sinh Demo</div>
                                    <div class="text-[9px] text-slate-400">Pass: 123456</div>
                                </div>
                            </button>
                            <button type="button" onclick="NexusAuth.quickFillDemo('teacher')" class="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-blue-950/60 border border-slate-700 hover:border-blue-400 text-blue-300 transition-all text-left flex items-center gap-2">
                                <span class="text-xl">👨‍🏫</span>
                                <div class="truncate">
                                    <div class="font-bold text-white">Giáo Viên Demo</div>
                                    <div class="text-[9px] text-slate-400">Pass: 123456</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Form -->
                    <form id="nexusAuthForm" onsubmit="NexusAuth.handleFormSubmit(event)" class="space-y-3.5">
                        <!-- Extra Register Field: Name -->
                        <div id="nexusFieldGroupRegister" class="space-y-3 hidden">
                            <div>
                                <label class="block text-xs font-mono text-slate-300 mb-1">Họ và tên thí nghiệm viên *</label>
                                <input type="text" id="nexusInputName" placeholder="Ví dụ: Nguyễn Văn An" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs font-mono">
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-xs font-mono text-slate-300 mb-1">Vai trò</label>
                                    <select id="nexusInputRole" class="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 text-xs font-mono">
                                        <option value="student">👨‍🎓 Học sinh</option>
                                        <option value="teacher">👨‍🏫 Giáo viên</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-mono text-slate-300 mb-1">Khối / Lớp</label>
                                    <input type="text" id="nexusInputGrade" placeholder="Lớp 9, 10,..." value="Lớp 9A" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs font-mono">
                                </div>
                            </div>
                        </div>

                        <!-- Email -->
                        <div>
                            <label class="block text-xs font-mono text-slate-300 mb-1">Email / Tài khoản người dùng *</label>
                            <input type="email" id="nexusInputEmail" required placeholder="user@nexus.edu.vn" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs font-mono">
                        </div>

                        <!-- Password -->
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <label class="text-xs font-mono text-slate-300">Mật khẩu bảo mật *</label>
                                <span class="text-[10px] text-cyan-400 font-mono">Mặc định: 123456</span>
                            </div>
                            <div class="relative">
                                <input type="password" id="nexusInputPassword" required placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs font-mono pr-10">
                                <button type="button" onclick="NexusAuth.togglePasswordVisibility()" class="absolute right-3 top-2.5 text-slate-400 hover:text-cyan-400 text-xs">
                                    👁
                                </button>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" id="nexusSubmitBtn" class="w-full mt-3 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all">
                            XÁC NHẬN ĐĂNG NHẬP
                        </button>
                    </form>

                    <!-- Footer link to standalone login page -->
                    <div class="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <a href="login.html" class="text-cyan-400 hover:underline flex items-center gap-1">
                            <span>Mở cổng toàn màn hình (login.html) ↗</span>
                        </a>
                        <span class="text-slate-500">KHTN 2026-2027</span>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEl);
        }

        // 7.2 Comprehensive Profile & Achievement Passport Modal
        if (!document.getElementById('nexusProfileModal')) {
            const profileEl = document.createElement('div');
            profileEl.id = 'nexusProfileModal';
            profileEl.className = 'fixed inset-0 z-[9990] hidden flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl transition-opacity';
            profileEl.onclick = function (e) {
                if (e.target === profileEl) closeProfileModal();
            };

            profileEl.innerHTML = `
                <div class="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900/98 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,242,254,0.3)] text-slate-100 backdrop-blur-3xl overflow-hidden">
                    <div class="nexus-laser-line"></div>

                    <!-- Header bar -->
                    <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                            <span class="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">HỒ SƠ NGHIÊN CỨU & TIẾN ĐỘ THÍ NGHIỆM</span>
                        </div>
                        <button type="button" onclick="NexusAuth.closeProfileModal()" class="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all border border-slate-700">
                            ✕
                        </button>
                    </div>

                    <!-- Scrollable content area -->
                    <div id="nexusProfileContent" class="p-6 space-y-6 overflow-y-auto flex-1">
                        <!-- Rendered dynamically -->
                    </div>
                </div>
            `;
            document.body.appendChild(profileEl);
        }
    }

    // -------------------------------------------------------------
    // 8. MODAL INTERACTION HANDLERS & PROFILE TABS
    // -------------------------------------------------------------
    let currentAuthTab = 'login';
    let currentProfileTab = 'overview';

    function openAuthModal(tab = 'login') {
        injectModals();
        NexusAudio.click();
        switchAuthTab(tab);
        const modal = document.getElementById('nexusAuthModal');
        if (modal) modal.classList.remove('hidden');
    }

    function closeAuthModal() {
        NexusAudio.click();
        const modal = document.getElementById('nexusAuthModal');
        if (modal) modal.classList.add('hidden');
    }

    function switchAuthTab(tab) {
        currentAuthTab = tab;
        NexusAudio.tab();
        const modalTitle = document.getElementById('nexusModalTitle');
        const modalSub = document.getElementById('nexusModalSubtitle');
        const tabLogin = document.getElementById('nexusTabLogin');
        const tabRegister = document.getElementById('nexusTabRegister');
        const fieldReg = document.getElementById('nexusFieldGroupRegister');
        const submitBtn = document.getElementById('nexusSubmitBtn');
        const demoPills = document.getElementById('nexusDemoPills');

        if (!modalTitle) return;

        if (tab === 'login') {
            modalTitle.textContent = 'CỔNG XÁC THỰC LAB';
            modalSub.textContent = 'Đăng nhập tài khoản để đồng bộ hóa 29 phòng lab KHTN';
            tabLogin.className = 'flex-1 py-2.5 text-xs font-mono font-bold rounded-xl transition-all bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
            tabRegister.className = 'flex-1 py-2.5 text-xs font-mono font-bold rounded-xl transition-all text-slate-400 hover:text-white';
            fieldReg.classList.add('hidden');
            demoPills.classList.remove('hidden');
            submitBtn.textContent = 'XÁC NHẬN ĐĂNG NHẬP';
        } else {
            modalTitle.textContent = 'TẠO THẺ NGHIÊN CỨU';
            modalSub.textContent = 'Đăng ký hồ sơ để lưu danh và nhận huy hiệu nhà khoa học trẻ';
            tabRegister.className = 'flex-1 py-2.5 text-xs font-mono font-bold rounded-xl transition-all bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
            tabLogin.className = 'flex-1 py-2.5 text-xs font-mono font-bold rounded-xl transition-all text-slate-400 hover:text-white';
            fieldReg.classList.remove('hidden');
            demoPills.classList.add('hidden');
            submitBtn.textContent = 'HOÀN TẤT ĐĂNG KÝ HỒ SƠ';
        }
    }

    function quickFillDemo(role) {
        NexusAudio.tab();
        const emailInput = document.getElementById('nexusInputEmail');
        const passInput = document.getElementById('nexusInputPassword');
        if (role === 'student') {
            emailInput.value = 'hocsinh@nexus.edu.vn';
            passInput.value = '123456';
        } else {
            emailInput.value = 'giaovien@nexus.edu.vn';
            passInput.value = '123456';
        }
        showAuthToast(`Đã tự động điền tài khoản: ${role === 'student' ? 'Học sinh' : 'Giáo viên'}`, 'info');
    }

    function togglePasswordVisibility() {
        NexusAudio.click();
        const passInput = document.getElementById('nexusInputPassword');
        if (passInput) {
            passInput.type = passInput.type === 'password' ? 'text' : 'password';
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('nexusInputEmail').value;
        const pass = document.getElementById('nexusInputPassword').value;

        if (currentAuthTab === 'login') {
            const res = login(email, pass);
            if (res.success) closeAuthModal();
        } else {
            const name = document.getElementById('nexusInputName').value;
            const role = document.getElementById('nexusInputRole').value;
            const grade = document.getElementById('nexusInputGrade').value;
            const res = register({ email, password: pass, name, role, grade });
            if (res.success) closeAuthModal();
        }
    }

    // -------------------------------------------------------------
    // 9. PROFILE PASSPORT MODAL (OVERVIEW, 29 LABS, SETTINGS)
    // -------------------------------------------------------------
    function openProfileModal(activeTab = 'overview') {
        injectModals();
        currentProfileTab = activeTab;
        const user = getCurrentUser();
        if (!user) {
            openAuthModal('login');
            return;
        }

        const content = document.getElementById('nexusProfileContent');
        if (!content) return;

        const totalLabs = NEXUS_LABS.length; // 29
        const completedLabs = user.completedLabs || [];
        const completedCount = completedLabs.length;
        const percent = Math.min(100, Math.round((completedCount / totalLabs) * 100));

        // Available avatars for interactive customizer
        const avatarOptions = ['👨‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬', '🧑‍💻', '⚡', '🧬', '🧪', '⚛️', '🚀', '🔭', '💡'];

        content.innerHTML = `
            <!-- Navigation Tabs in Profile -->
            <div class="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono text-xs mb-4">
                <button type="button" onclick="NexusAuth.setProfileTab('overview')" class="flex-1 py-2 font-bold rounded-xl transition-all ${currentProfileTab === 'overview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}">
                    👤 TỔNG QUAN & CẤP ĐỘ
                </button>
                <button type="button" onclick="NexusAuth.setProfileTab('labs')" class="flex-1 py-2 font-bold rounded-xl transition-all ${currentProfileTab === 'labs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}">
                    🧪 29 BÀI THÍ NGHIỆM (${completedCount}/${totalLabs})
                </button>
            </div>

            ${currentProfileTab === 'overview' ? `
                <!-- TAB 1: OVERVIEW & PASSPORT -->
                <div class="space-y-6">
                    <!-- Identity Card -->
                    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
                        <!-- Avatar & Interactive Customizer Trigger -->
                        <div class="relative group/avatar cursor-pointer" onclick="document.getElementById('avatarPickerBox').classList.toggle('hidden')">
                            <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(0,242,254,0.3)] group-hover/avatar:scale-105 transition-all">
                                ${escapeHtml(user.avatar || '👨‍🎓')}
                            </div>
                            <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-cyan-500 text-slate-950 text-[9px] font-mono font-bold">
                                Đổi ✎
                            </span>
                        </div>

                        <!-- User Info -->
                        <div class="flex-1 text-center sm:text-left min-w-0">
                            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h4 class="text-xl font-bold text-white truncate">${escapeHtml(user.name)}</h4>
                                <span class="text-xs font-mono px-2.5 py-0.5 rounded-full ${user.role === 'teacher' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'}">
                                    ${escapeHtml(user.roleLabel || 'Học sinh')}
                                </span>
                            </div>
                            <p class="text-xs text-slate-400 font-mono mt-1">${escapeHtml(user.email)}</p>
                            <p class="text-xs text-slate-400 font-mono mt-0.5">${escapeHtml(user.grade || 'Lớp 9')} • ${escapeHtml(user.school || 'Trường THCS-THPT Thực Nghiệm')}</p>
                        </div>
                    </div>

                    <!-- Interactive Avatar Picker Dropdown -->
                    <div id="avatarPickerBox" class="hidden p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                        <div class="text-xs font-mono text-cyan-300 font-bold">Chọn biểu tượng đại diện mới:</div>
                        <div class="flex flex-wrap gap-2">
                            ${avatarOptions.map(av => `
                                <button type="button" onclick="NexusAuth.changeAvatar('${av}')" class="w-10 h-10 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 flex items-center justify-center text-xl transition-all">
                                    ${av}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Stats 3 Cards -->
                    <div class="grid grid-cols-3 gap-3 text-center font-mono">
                        <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Điểm Thưởng XP</div>
                            <div class="text-lg font-black text-cyan-400 mt-1">${(user.xp || 100).toLocaleString()} XP</div>
                        </div>
                        <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Tiến Độ Phòng Lab</div>
                            <div class="text-lg font-black text-emerald-400 mt-1">${completedCount} / ${totalLabs}</div>
                        </div>
                        <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Cấp Độ Hiện Tại</div>
                            <div class="text-xs font-black text-blue-400 mt-1 truncate">${user.level ? user.level.split('-')[0] : 'Level 1'}</div>
                        </div>
                    </div>

                    <!-- XP & Lab Completion Shimmer Bar -->
                    <div>
                        <div class="flex justify-between text-xs font-mono mb-2">
                            <span class="text-slate-300">Tỷ lệ hoàn thành chương trình KHTN:</span>
                            <span class="text-cyan-400 font-bold">${percent}%</span>
                        </div>
                        <div class="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                            <div class="h-full nexus-shimmer-bar rounded-full transition-all duration-700" style="width: ${percent}%;"></div>
                        </div>
                    </div>

                    <!-- Badges -->
                    <div>
                        <div class="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2.5">Huy hiệu thành tích khoa học</div>
                        <div class="flex flex-wrap gap-2">
                            ${(user.badges || ['Tân Binh']).map(b => `
                                <span class="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/20 text-cyan-300 font-mono text-xs flex items-center gap-1.5 shadow-sm">
                                    <span>🏅</span> <span>${b}</span>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : `
                <!-- TAB 2: INTERACTIVE 29 LAB MATRIX -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                        <span>Nhấp vào bài để mở hoặc bấm nút tròn để tích điểm hoàn thành:</span>
                        <span class="text-cyan-400 font-bold">${completedCount} / 29 Đã Xong</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                        ${NEXUS_LABS.map(lab => {
                            const isDone = completedLabs.includes(lab.id);
                            return `
                                <div class="p-3 rounded-xl bg-slate-950/80 border ${isDone ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'} flex items-center justify-between gap-3 text-xs font-mono hover:border-cyan-500/50 transition-all group">
                                    <div class="flex items-center gap-2.5 min-w-0">
                                        <button type="button" onclick="NexusAuth.toggleLab('${lab.id}')" class="w-6 h-6 rounded-lg ${isDone ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 border border-slate-700 text-transparent hover:text-slate-500'} flex items-center justify-center transition-all text-xs" title="Đánh dấu đã hoàn thành (+50 XP)">
                                            ✓
                                        </button>
                                        <div class="min-w-0">
                                            <div class="font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                                                <span class="mr-1">${lab.icon}</span> ${lab.name}
                                            </div>
                                            <div class="text-[10px] text-slate-400 truncate">
                                                <span class="${lab.subject === 'Vật Lý' ? 'text-cyan-400' : lab.subject === 'Hóa Học' ? 'text-teal-400' : 'text-emerald-400'}">${lab.code}</span> • ${lab.grade}
                                            </div>
                                        </div>
                                    </div>
                                    <a href="${lab.file}" onclick="NexusAuth.playWarp()" class="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase font-bold transition-all flex items-center gap-1 shrink-0">
                                        Vào Lab &rarr;
                                    </a>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `}

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
                <button type="button" onclick="NexusAuth.logout(); NexusAuth.closeProfileModal();" class="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold transition-all flex items-center gap-1.5">
                    <span>🚪</span> Đăng xuất
                </button>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="NexusAuth.closeProfileModal()" class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all">
                        Đóng
                    </button>
                </div>
            </div>
        `;

        document.getElementById('nexusProfileModal').classList.remove('hidden');
    }

    function closeProfileModal() {
        NexusAudio.click();
        const modal = document.getElementById('nexusProfileModal');
        if (modal) modal.classList.add('hidden');
    }

    function setProfileTab(tab) {
        NexusAudio.tab();
        openProfileModal(tab);
    }

    // -------------------------------------------------------------
    // 10. HEADER SYNCHRONIZATION ACROSS ALL PAGES
    // -------------------------------------------------------------
    function updateAllHeaders() {
        const user = getCurrentUser();

        // 1. Target standard auth slot containers
        const slots = document.querySelectorAll('#authHeaderSlot, .nexus-auth-slot');
        slots.forEach(slot => renderHeaderSlot(slot, user));

        // 2. Mobile slots
        const mobileSlots = document.querySelectorAll('#authMobileSlot, .nexus-auth-mobile-slot');
        mobileSlots.forEach(mslot => renderMobileSlot(mslot, user));

        // 3. Fallback auto mount for lab pages
        if (slots.length === 0) {
            autoLocateAndMountHeader(user);
        }

        updateSoundIcon();
    }

    function renderHeaderSlot(container, user) {
        if (!container) return;

        if (user) {
            container.innerHTML = `
                <div class="relative group/user flex items-center gap-2">
                    <!-- Sound toggle button -->
                    <button type="button" onclick="NexusAuth.toggleSound()" class="nexus-sound-btn px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer">
                    </button>

                    <!-- User profile badge -->
                    <button type="button" onclick="NexusAuth.toggleUserDropdown(event)" class="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-slate-200 shadow-[0_0_15px_rgba(0,242,254,0.15)] hover:shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-all cursor-pointer">
                        <div class="relative">
                            <span class="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-sm">
                                ${escapeHtml(user.avatar || '👨‍🎓')}
                            </span>
                            <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse"></span>
                        </div>
                        <div class="text-left hidden sm:block max-w-[120px] truncate">
                            <div class="text-xs font-bold text-white truncate">${escapeHtml(user.name)}</div>
                            <div class="text-[10px] text-cyan-400 font-mono truncate">${escapeHtml(user.roleLabel || 'Thành viên')}</div>
                        </div>
                        <span class="text-xs text-slate-400 ml-0.5 font-bold">▾</span>
                    </button>

                    <!-- Dropdown on Click / Hover -->
                    <div id="nexusUserDropdownMenu" class="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-950/98 border border-cyan-500/30 p-2.5 shadow-2xl backdrop-blur-3xl hidden group-hover/user:block hover:block z-50">
                        <div class="px-3 py-2 border-b border-slate-800 text-xs font-mono">
                            <div class="text-white font-bold truncate">${escapeHtml(user.name)}</div>
                            <div class="text-[10px] text-cyan-400 mt-0.5">${user.xp || 100} XP • ${escapeHtml(user.level ? user.level.split('-')[0] : 'Level 1')}</div>
                        </div>
                        <div class="py-1 space-y-1 text-xs font-mono">
                            <button type="button" onclick="NexusAuth.openProfileModal('overview')" class="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all">
                                <span>👤</span> Hồ sơ & Cấp độ
                            </button>
                            <button type="button" onclick="NexusAuth.openProfileModal('labs')" class="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all">
                                <span>🧪</span> 29 Bài Thí Nghiệm
                            </button>
                            <a href="login.html" class="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all">
                                <span>🔄</span> Đổi tài khoản
                            </a>
                            <button type="button" onclick="NexusAuth.logout()" class="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 transition-all border-t border-slate-800 mt-1">
                                <span>🚪</span> Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="flex items-center gap-2">
                    <!-- Sound toggle button -->
                    <button type="button" onclick="NexusAuth.toggleSound()" class="nexus-sound-btn px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer">
                    </button>

                    <button type="button" onclick="NexusAuth.openAuthModal('login')" class="px-3.5 py-1.5 text-xs font-mono font-semibold rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                        <span>⚡</span>
                        <span>ĐĂNG NHẬP</span>
                    </button>
                    <a href="login.html" class="hidden sm:inline-flex px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-all items-center gap-1">
                        <span>Đăng ký</span>
                    </a>
                </div>
            `;
        }
    }

    function renderMobileSlot(container, user) {
        if (!container) return;
        if (user) {
            container.innerHTML = `
                <div class="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div class="flex items-center gap-2 truncate cursor-pointer" onclick="NexusAuth.openProfileModal()">
                        <span class="text-xl">${escapeHtml(user.avatar || '👨‍🎓')}</span>
                        <div class="truncate text-left">
                            <div class="font-bold text-white truncate">${escapeHtml(user.name)}</div>
                            <div class="text-[10px] text-cyan-400">${escapeHtml(user.roleLabel || 'Thành viên')}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="NexusAuth.openProfileModal()" class="px-2.5 py-1 text-[11px] rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Hồ sơ
                        </button>
                        <button type="button" onclick="NexusAuth.logout()" class="px-2 py-1 text-[11px] rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Thoát
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="w-full flex items-center gap-2">
                    <button type="button" onclick="NexusAuth.openAuthModal('login')" class="flex-1 py-2 text-xs font-mono font-semibold rounded-xl bg-slate-900 border border-slate-700 text-slate-300">Đăng Nhập</button>
                    <button type="button" onclick="NexusAuth.openAuthModal('register')" class="flex-1 py-2 text-xs font-mono font-bold rounded-xl bg-cyan-500 text-slate-950">Đăng Ký</button>
                </div>
            `;
        }
    }

    function autoLocateAndMountHeader(user) {
        const headerActions = document.querySelector('header .flex.items-center.gap-2');
        if (headerActions && !document.getElementById('authHeaderSlot')) {
            const slot = document.createElement('div');
            slot.id = 'authHeaderSlot';
            slot.className = 'flex items-center ml-1';
            headerActions.appendChild(slot);
            renderHeaderSlot(slot, user);
        }
    }

    function toggleUserDropdown(e) {
        if (e) e.stopPropagation();
        NexusAudio.click();
        const menu = document.getElementById('nexusUserDropdownMenu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }

    // -------------------------------------------------------------
    // 11. 3D CARD TILT & HOVER AUDIO ENGINE
    // -------------------------------------------------------------
    function init3DTiltAndEffects() {
        // Only apply subtle 3D hover tilt to pure link navigation tiles on portal pages
        // Never apply to interactive simulations, canvas containers, or controls cards
        const isLabSimPage = /(?:ly|hoa|sinh)(?:[0-9]+|sand)\.html/i.test(window.location.pathname);
        if (isLabSimPage) {
            // Lab simulation pages: Keep all cards rock-solid and stable for clicking
            return;
        }

        const cards = document.querySelectorAll('.lab-card:not(#bioMicroscopeSection):not(.no-tilt)');
        cards.forEach(card => {
            // Do not tilt cards containing interactive inputs, sliders, or canvas
            if (card.querySelector('canvas, input, button, select') || card.closest('#bioMicroscopeSection')) return;
            card.classList.add('nexus-tilt-card');
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                card.style.transform = `perspective(1000px) rotateX(${-y / 50}deg) rotateY(${x / 50}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });

        // Add subtle hover sound to main interactive buttons
        const actionButtons = document.querySelectorAll('button, a[href*=".html"]');
        actionButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => NexusAudio.hover());
        });
    }

    // -------------------------------------------------------------
    // 12. LAB VISIT AUTO TRACKING
    // -------------------------------------------------------------
    function autoTrackLabVisit() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        const match = filename.match(/^(ly[1-8]|hoa[1-9]|sinh([1-9]|1[0-2])|lysand|hoasand)$/);
        if (match) {
            const labId = match[0];
            const user = getCurrentUser();
            if (user) {
                if (!user.completedLabs) user.completedLabs = [];
                if (!user.completedLabs.includes(labId)) {
                    user.completedLabs.push(labId);
                    user.xp = (user.xp || 0) + 50;
                    setCurrentUser(user);
                    const users = getAllUsers();
                    const idx = users.findIndex(u => u.id === user.id);
                    if (idx !== -1) {
                        users[idx] = user;
                        saveAllUsers(users);
                    }
                    setTimeout(() => {
                        NexusAudio.success();
                        showAuthToast(`⚡ +50 XP: Đã hoàn thành thực hành bài ${labId.toUpperCase()}!`, 'success');
                    }, 1000);
                }
            }
        }
    }

    // Global listener for closing dropdowns and keyboard shortcuts
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('nexusUserDropdownMenu');
        if (menu && !menu.classList.contains('hidden')) {
            const dropdownContainer = menu.closest('.group\\/user');
            if (!dropdownContainer || !dropdownContainer.contains(e.target)) {
                menu.classList.add('hidden');
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAuthModal();
            closeProfileModal();
            const menu = document.getElementById('nexusUserDropdownMenu');
            if (menu) menu.classList.add('hidden');
        }
    });

    // -------------------------------------------------------------
    // 13. EXPOSE PUBLIC API
    // -------------------------------------------------------------
    window.NexusAuth = {
        login,
        register,
        logout,
        escapeHtml,
        hashPassword,
        getCurrentUser,
        getAllUsers,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
        setProfileTab,
        switchTab: switchAuthTab,
        quickFillDemo,
        togglePasswordVisibility,
        handleFormSubmit,
        toggleUserDropdown,
        changeAvatar: changeUserAvatar,
        toggleLab: toggleLabCompletion,
        toggleSound: () => NexusAudio.toggle(),
        playWarp: () => NexusAudio.warp(),
        playSuccess: () => NexusAudio.success(),
        playClick: () => NexusAudio.click(),
        showToast: showAuthToast,
        updateHeaders: updateAllHeaders,
        labs: NEXUS_LABS
    };

    // Backward compatible aliases
    window.openModal = function (mode) { openAuthModal(mode === 'register' ? 'register' : 'login'); };
    window.closeModal = function () { closeAuthModal(); };
    window.handleAuthSubmit = function (e) { handleFormSubmit(e); };

    // -------------------------------------------------------------
    // 14. SCIENTIFIC MATH AUTO-RENDER ENGINE (KaTeX & Resilient Fallback)
    // -------------------------------------------------------------
    function initKaTeXAutoRenderer() {
        // Inject KaTeX CSS
        if (!document.getElementById('nexusKaTeXCSS')) {
            const link = document.createElement('link');
            link.id = 'nexusKaTeXCSS';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
            document.head.appendChild(link);
        }

        // Instant fallback so users NEVER see raw $$$ or LaTeX commands
        function fallbackMathFormat() {
            try {
                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: function(node) {
                            const tag = node.parentElement ? node.parentElement.tagName.toLowerCase() : '';
                            if (['script', 'style', 'textarea', 'pre', 'code'].includes(tag)) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            if (node.nodeValue && node.nodeValue.includes('$')) {
                                return NodeFilter.FILTER_ACCEPT;
                            }
                            return NodeFilter.FILTER_SKIP;
                        }
                    }
                );

                const nodesToProcess = [];
                while (walker.nextNode()) {
                    nodesToProcess.push(walker.currentNode);
                }

                nodesToProcess.forEach(node => {
                    const val = node.nodeValue;
                    if (/\$(?!\s)([^$\n]+?)(?<!\s)\$/.test(val)) {
                        const span = document.createElement('span');
                        span.className = 'nexus-math-rendered';
                        span.innerHTML = val.replace(/\$(?!\s)([^$\n]+?)(?<!\s)\$/g, (match, formula) => {
                            if (formula.startsWith('{')) return match;
                            let clean = formula
                                .replace(/\\mathcal\{P\}/g, '𝒫')
                                .replace(/\\Delta\s*l/g, 'Δ<i>l</i>')
                                .replace(/\\cdot/g, ' &middot; ')
                                .replace(/\\text\{([^}]+)\}/g, ' $1')
                                .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<sup>$1</sup>/<sub>$2</sub>')
                                .replace(/\\sin\s*/g, 'sin ')
                                .replace(/\\Omega/g, 'Ω')
                                .replace(/\\,/g, ' ')
                                .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
                                .replace(/_([a-zA-Z0-9])/g, '<sub>$1</sub>')
                                .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
                                .replace(/\^([a-zA-Z0-9])/g, '<sup>$1</sup>');
                            return `<span class="inline-math font-mono text-cyan-300 font-semibold px-0.5">${clean}</span>`;
                        });
                        if (node.parentNode) {
                            node.parentNode.replaceChild(span, node);
                        }
                    }
                });
            } catch (e) {
                console.warn('Math fallback warning:', e);
            }
        }

        function runKaTeX() {
            if (typeof renderMathInElement === 'function') {
                try {
                    renderMathInElement(document.body, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "$", right: "$", display: false },
                            { left: "\\(", right: "\\)", display: false },
                            { left: "\\[", right: "\\]", display: true }
                        ],
                        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
                        throwOnError: false
                    });
                } catch (err) {
                    console.warn('KaTeX render warning:', err);
                }
            }
        }

        // Execute fallback right away
        fallbackMathFormat();

        // Load KaTeX CDN
        if (typeof renderMathInElement === 'function') {
            runKaTeX();
        } else {
            const scriptKatex = document.createElement('script');
            scriptKatex.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
            scriptKatex.defer = true;
            scriptKatex.onload = () => {
                const scriptAuto = document.createElement('script');
                scriptAuto.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
                scriptAuto.defer = true;
                scriptAuto.onload = runKaTeX;
                document.head.appendChild(scriptAuto);
            };
            document.head.appendChild(scriptKatex);
        }
    }

    function onReady() {
        initDatabase();
        injectModals();
        updateAllHeaders();
        autoTrackLabVisit();
        init3DTiltAndEffects();
        initKaTeXAutoRenderer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();
