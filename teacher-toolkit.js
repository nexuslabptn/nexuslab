/**
 * teacher-toolkit.js — NexusLab Teacher Toolkit & Classroom Presentation Engine
 * Cung cấp bộ công cụ chuyên dụng cho Giáo viên giảng dạy trên màn hình máy chiếu / TV tương tác:
 *  1. Bút vẽ bảng tương tác (Screen Annotation Canvas) với chế độ Bút thường, Bút dạ quang (Highlighter), Tẩy (Eraser).
 *  2. Chấm Laser đỏ (Laser Pointer) siêu nét dẫn hướng chú ý của học sinh.
 *  3. Thẻ lý thuyết & công thức SGK nhanh (Quick Theory Drawer) chuẩn GDPT 2018 Lớp 9 - 10.
 *  4. Câu hỏi khảo sát nhanh trước thí nghiệm (Quick Class Quiz) có KaTeX và lời giải chuẩn SGK.
 *  5. Điều khiển thời gian: Làm chậm 0.25x, 0.5x, 1.0x, Tạm dừng & Chạy từng bước (Step Forward).
 *  6. Chế độ trình chiếu toàn màn hình (Classroom Fullscreen).
 *  7. Nút bật/tắt thu nhỏ linh hoạt (Floating Toggle Dock) không che chắn nội dung bài học.
 */

(function () {
  'use strict';
  if (window.__nexusTeacherToolkitInitialized) return;
  window.__nexusTeacherToolkitInitialized = true;

  // -------------------------------------------------------------
  // 1. DATA: SGK 2018 THEORY CARDS & FORMULAS (Lớp 9 & 10)
  // -------------------------------------------------------------
  const SGK_THEORY_DATA = {
    physics: [
      {
        grade: 'Vật Lý 9 - Điện Học',
        title: 'Định Luật Ohm Cho Đoạn Mạch',
        formula: 'I = \\frac{U}{R} \\iff U = I \\cdot R',
        desc: 'Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế giữa hai đầu dây và tỉ lệ nghịch với điện trở của dây.',
        vars: [
          { sym: 'I', unit: 'Ampe (A)', label: 'Cường độ dòng điện' },
          { sym: 'U', unit: 'Vôn (V)', label: 'Hiệu điện thế giữa hai đầu đoạn mạch' },
          { sym: 'R', unit: 'Ôm (\\Omega)', label: 'Điện trở của vật dẫn' }
        ],
        notes: 'Khi mắc nối tiếp: $I = I_1 = I_2$, $U = U_1 + U_2$, $R_{td} = R_1 + R_2$. Khi mắc song song: $U = U_1 = U_2$, $I = I_1 + I_2$, $\\frac{1}{R_{td}} = \\frac{1}{R_1} + \\frac{1}{R_2}$.'
      },
      {
        grade: 'Vật Lý 9 - Điện Học',
        title: 'Công & Công Suất Điện - Định Luật Joule-Lenz',
        formula: 'P = U \\cdot I = I^2 \\cdot R = \\frac{U^2}{R} \\quad | \\quad Q = I^2 \\cdot R \\cdot t',
        desc: 'Nhiệt lượng tỏa ra ở dây dẫn khi có dòng điện chạy qua tỉ lệ thuận với bình phương cường độ dòng điện, điện trở và thời gian dòng điện chạy qua.',
        vars: [
          { sym: 'P', unit: 'Oát (W)', label: 'Công suất điện tiêu thụ' },
          { sym: 'Q', unit: 'Jun (J)', label: 'Nhiệt lượng tỏa ra' },
          { sym: 't', unit: 'Giây (s)', label: 'Thời gian dòng điện chạy qua' }
        ],
        notes: 'Nếu cường độ dòng điện I vượt quá giới hạn định mức của thiết bị, hiệu ứng Joule-Lenz sẽ làm đứt cầu chì hoặc nhảy aptomat để bảo vệ an toàn.'
      },
      {
        grade: 'Vật Lý 9 - Quang Học',
        title: 'Định Luật Khúc Xạ Ánh Sáng & Phản Xạ Toàn Phần',
        formula: 'n_1 \\cdot \\sin(i) = n_2 \\cdot \\sin(r) \\quad | \\quad \\sin(i_{gh}) = \\frac{n_2}{n_1} \\ (n_1 > n_2)',
        desc: 'Tia khúc xạ nằm trong mặt phẳng tới và ở phía bên kia pháp tuyến so với tia tới. Góc tới i và góc khúc xạ r tuân theo định luật Snell.',
        vars: [
          { sym: 'i', unit: 'Độ (°)', label: 'Góc tới giữa tia sáng và pháp tuyến' },
          { sym: 'r', unit: 'Độ (°)', label: 'Góc khúc xạ' },
          { sym: 'n_1, n_2', unit: 'Hệ số', label: 'Chiết suất môi trường tới và môi trường khúc xạ' }
        ],
        notes: 'Điều kiện xảy ra phản xạ toàn phần: Ánh sáng truyền từ môi trường chiết quang hơn sang kém hơn ($n_1 > n_2$) và góc tới $i \\ge i_{gh}$.'
      },
      {
        grade: 'Vật Lý 9 - Quang Học',
        title: 'Công Thức Thấu Kính Mỏng (Hội Tụ & Phân Kỳ)',
        formula: '\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d\'} \\quad | \\quad k = -\\frac{d\'}{d} = \\frac{\\overline{A\'B\'}}{\\overline{AB}}',
        desc: 'Mối liên hệ giữa tiêu cự f, khoảng cách vật d và khoảng cách ảnh d\' qua thấu kính mỏng.',
        vars: [
          { sym: 'f', unit: 'cm / m', label: 'Tiêu cự (f > 0: Hội tụ; f < 0: Phân kỳ)' },
          { sym: 'd', unit: 'cm', label: 'Khoảng cách từ vật đến quang tâm O' },
          { sym: 'd\'', unit: 'cm', label: 'Khoảng cách từ ảnh đến O (d\' > 0: Ảnh thật; d\' < 0: Ảnh ảo)' },
          { sym: 'k', unit: 'Hệ số', label: 'Độ phóng đại ảnh (k > 0: cùng chiều; k < 0: ngược chiều)' }
        ],
        notes: 'Thấu kính phân kỳ luôn cho ảnh ảo, cùng chiều và nhỏ hơn vật, nằm trong khoảng tiêu cự.'
      },
      {
        grade: 'Vật Lý 10 - Cơ Học',
        title: 'Định Luật II Newton & Chuyển Động Có Ma Sát',
        formula: '\\vec{F}_{hl} = m \\cdot \\vec{a} \\iff a = \\frac{F - F_{ms}}{m} = \\frac{F - \\mu \\cdot m \\cdot g}{m}',
        desc: 'Gia tốc của một vật cùng hướng với lực tác dụng lên vật. Độ lớn của gia tốc tỉ lệ thuận với độ lớn lực và tỉ lệ nghịch với khối lượng.',
        vars: [
          { sym: 'a', unit: 'm/s²', label: 'Gia tốc của vật' },
          { sym: 'F', unit: 'Newton (N)', label: 'Lực kéo hoặc lực tác dụng' },
          { sym: 'F_{ms}', unit: 'Newton (N)', label: 'Lực ma sát cản trở chuyển động ($F_{ms} = \\mu N$)' },
          { sym: 'm', unit: 'kg', label: 'Khối lượng vật chuyển động' }
        ],
        notes: 'Nếu vật chuyển động trên mặt phẳng nghiêng góc $\\alpha$: $a = g(\\sin\\alpha - \\mu \\cos\\alpha)$.'
      },
      {
        grade: 'Vật Lý 10 - Năng Lượng',
        title: 'Định Luật Bảo Toàn Cơ Năng',
        formula: 'W = W_đ + W_t = \\frac{1}{2} m v^2 + m g h = \\text{hằng số}',
        desc: 'Khi một vật chuyển động trong trọng trường chỉ chịu tác dụng của trọng lực, cơ năng của vật là một đại lượng bảo toàn.',
        vars: [
          { sym: 'W_đ', unit: 'Jun (J)', label: 'Động năng của vật (\\frac{1}{2}mv^2)' },
          { sym: 'W_t', unit: 'Jun (J)', label: 'Thế năng trọng trường của vật (mgh)' },
          { sym: 'W', unit: 'Jun (J)', label: 'Cơ năng toàn phần của hệ' }
        ],
        notes: 'Tại vị trí cao nhất trên máng trượt / con lắc: $W_đ = 0, W_t = \\max$. Tại vị trí thấp nhất: $W_t = 0, W_đ = \\max$. Khi có ma sát: $W_2 - W_1 = A_{ms} < 0$.'
      }
    ],

    chemistry: [
      {
        grade: 'Hóa Học 9 - Đại Cương',
        title: 'Dãy Hoạt Động Hóa Học Của Kim Loại',
        formula: 'K > Na > Ca > Mg > Al > Zn > Fe > Ni > Sn > Pb > (H) > Cu > Hg > Ag > Pt > Au',
        desc: 'Mẹo nhớ chuẩn SGK: Khi Nào Cần May Áo Záp Sắt Nhìn Sang Phố Hỏi Cửa Hàng Á Phi Âu.',
        vars: [
          { sym: 'K, Na, Ca', unit: 'Kim loại kiềm', label: 'Tác dụng mãnh liệt với nước ở nhiệt độ thường giải phóng H₂' },
          { sym: 'Mg đến Pb', unit: 'Đứng trước H', label: 'Đẩy được Hiđro ra khỏi dung dịch axit loãng (HCl, H₂SO₄ loãng)' },
          { sym: 'Cu, Ag, Au', unit: 'Đứng sau H', label: 'Không tác dụng axit loãng; kim loại đứng trước đẩy kim loại đứng sau ra khỏi dung dịch muối' }
        ],
        notes: 'Ví dụ: $Fe + CuSO_4 \\to FeSO_4 + Cu\\downarrow$ (đồng màu đỏ bám trên thanh sắt, dung dịch xanh lam nhạt dần).'
      },
      {
        grade: 'Hóa Học 9 - Axit & Bazơ',
        title: 'Thang Đo pH & Chất Chỉ Thị Màu',
        formula: '\\text{pH} = -\\log[H^+] \\quad | \\quad [H^+][OH^-] = 10^{-14}',
        desc: 'Thang pH từ 0 đến 14 đo nồng độ ion H+ để xác định tính axit hoặc bazơ của dung dịch.',
        vars: [
          { sym: 'pH < 7', unit: 'Axit', label: 'Quỳ tím hóa Đỏ; Phenolphtalein không đổi màu (trong suốt)' },
          { sym: 'pH = 7', unit: 'Trung tính', label: 'Quỳ tím giữ nguyên màu tím (nước cất, muối NaCl trung hòa)' },
          { sym: 'pH > 7', unit: 'Kiềm/Bazơ', label: 'Quỳ tím hóa Xanh; Phenolphtalein hóa Hồng sẫm' }
        ],
        notes: 'Chuẩn độ trung hòa: $H^+ + OH^- \\to H_2O$. Điểm tương đương khi mol $H^+ = \\text{mol } OH^-$.'
      },
      {
        grade: 'Hóa Học 10 - Tốc Độ Phản Ứng',
        title: 'Tốc Độ Phản Ứng & Các Yếu Tố Ảnh Hưởng',
        formula: 'v = k \\cdot [A]^a \\cdot [B]^b \\quad | \\quad \\frac{v_{T+10}}{v_T} = \\gamma \\ (\\gamma = 2 \\div 4)',
        desc: 'Tốc độ phản ứng hóa học đặc trưng cho sự biến thiên nồng độ chất phản ứng hoặc sản phẩm trong một đơn vị thời gian.',
        vars: [
          { sym: 'Nồng độ', unit: 'mol/L', label: 'Tăng nồng độ làm tăng số va chạm hiệu quả giữa các phân tử $\\to$ tốc độ tăng' },
          { sym: 'Nhiệt độ', unit: '°C / K', label: 'Tăng nhiệt độ làm tăng động năng hạt $\\to$ tỉ lệ hạt hoạt hóa tăng mạnh' },
          { sym: 'Diện tích', unit: 'm²', label: 'Bột mịn có diện tích tiếp xúc lớn hơn dạng khối $\\to$ phản ứng nhanh hơn' },
          { sym: 'Chất xúc tác', unit: 'MnO₂, Pt...', label: 'Làm giảm năng lượng hoạt hóa Ea mà không bị tiêu hao sau phản ứng' }
        ],
        notes: 'Quy tắc Van\'t Hoff: Khi nhiệt độ tăng thêm 10°C, tốc độ phản ứng thường tăng từ 2 đến 4 lần.'
      },
      {
        grade: 'Hóa Học 10 - Nhiệt Hóa Học',
        title: 'Biến Thiên Enthalpy Chuẩn Của Phản Ứng',
        formula: '\\Delta_r H^\\circ_{298} = \\sum \\Delta_f H^\\circ_{298}(\\text{sp}) - \\sum \\Delta_f H^\\circ_{298}(\\text{cđ})',
        desc: 'Nhiệt lượng tỏa ra hoặc thu vào của một phản ứng hóa học ở điều kiện chuẩn (298K, 1 bar).',
        vars: [
          { sym: '\\Delta_r H < 0', unit: 'kJ', label: 'Phản ứng TỎA NHIỆT: Hệ giải phóng nhiệt ra môi trường, nhiệt độ bình tăng lên (đốt cháy, hòa tan kiềm)' },
          { sym: '\\Delta_r H > 0', unit: 'kJ', label: 'Phản ứng THU NHIỆT: Hệ hấp thụ nhiệt từ môi trường, nhiệt độ bình giảm xuống (nhiệt phân CaCO₃)' }
        ],
        notes: 'Quy ước quốc tế: Dấu âm ($-$) là tỏa nhiệt (nhiệt thoát ra), dấu dương ($+$) là thu nhiệt (nhiệt đi vào).'
      }
    ],

    biology: [
      {
        grade: 'Sinh Học 9 - Di Truyền',
        title: 'Quy Luật Phân Ly & Phân Ly Độc Lập Mendel',
        formula: 'P: Aa \\times Aa \\to F_1: 1AA : 2Aa : 1aa \\quad (3 \\text{ Trội} : 1 \\text{ Lặn})',
        desc: 'Mỗi tính trạng do một cặp alen quy định. Trong quá trình phát sinh giao tử, các alen trong cặp phân ly đồng đều về các giao tử.',
        vars: [
          { sym: 'Lai 1 cặp (Monohybrid)', unit: 'Tỉ lệ KH 3:1', label: 'Phân ly KG $1AA : 2Aa : 1aa$; KH: 75% Trội : 25% Lặn' },
          { sym: 'Lai 2 cặp (Dihybrid)', unit: 'Tỉ lệ KH 9:3:3:1', label: '$AaBb \\times AaBb \\to (3:1)(3:1) = 9 A-B- : 3 A-bb : 3 aaB- : 1 aabb$' },
          { sym: 'Lai phân tích', unit: 'Kiểm tra KG', label: 'Lai giữa cá thể mang tính trạng trội với cá thể đồng hợp lặn ($aa$)' }
        ],
        notes: 'Điều kiện nghiệm đúng: Bố mẹ thuần chủng, số lượng cá thể phân tích đủ lớn, các alen trội lặn hoàn toàn và phân ly độc lập.'
      },
      {
        grade: 'Sinh Học 9 - Di Truyền Phân Tử',
        title: 'Cấu Trúc ADN & Cơ Chế Nhân Đôi - Phiên Mã - Dịch Mã',
        formula: 'N = 2A + 2G = 2T + 2X \\quad | \\quad H = 2A + 3G \\quad | \\quad L = \\frac{N}{2} \\cdot 3.4 \\text{ \\AA}',
        desc: 'ADN xoắn kép theo nguyên tắc bổ sung A liên kết với T bằng 2 liên kết hidro, G liên kết với X bằng 3 liên kết hidro.',
        vars: [
          { sym: 'Nhân đôi ADN', unit: 'Nhân / Tế bào chất', label: 'Bán bảo tồn: Mỗi phân tử con gồm 1 mạch cũ và 1 mạch mới tổng hợp' },
          { sym: 'Phiên mã (mARN)', unit: 'A-U, T-A, G-X, X-G', label: 'Mạch mã gốc ADN làm khuôn tổng hợp sợi mARN đơn' },
          { sym: 'Dịch mã (Protein)', unit: 'Ribosome', label: 'Bộ ba mã sao (Codon) trên mARN liên kết với anticodon của tARN để gắn axit amin' }
        ],
        notes: 'Đột biến gen (thay thế, mất, thêm nucleotit) có thể làm thay đổi axit amin tương ứng trong chuỗi polypeptide.'
      },
      {
        grade: 'Sinh Học 10 - Tế Bào Học',
        title: 'Chu Kỳ Tế Bào & Nguyên Phân (Mitosis)',
        formula: '2^k \\text{ tế bào con sau } k \\text{ lần phân chia (Bộ NST giữ nguyên } 2n)',
        desc: 'Quá trình phân bào đảm bảo bộ nhiễm sắc thể của tế bào con hoàn toàn giống hệt tế bào mẹ ban đầu.',
        vars: [
          { sym: 'Kỳ đầu (Prophase)', unit: '2n kép', label: 'NST bắt đầu co xoắn, màng nhân tiêu biến, thoi phân bào xuất hiện' },
          { sym: 'Kỳ giữa (Metaphase)', unit: '2n kép cực đại', label: 'Các NST co xoắn cực đại, xếp thành 1 hàng trên mặt phẳng xích đạo' },
          { sym: 'Kỳ sau (Anaphase)', unit: '4n đơn', label: 'Từng chromatid tách nhau tại tâm động phân ly về 2 cực tế bào' },
          { sym: 'Kỳ cuối (Telophase)', unit: '2 tế bào con 2n', label: 'Màng nhân tái lập, tế bào chất phân chia ở vách ngăn trung tâm' }
        ],
        notes: 'Ý nghĩa: Giúp cơ thể sinh trưởng về kích thước, tái tạo mô bị tổn thương và duy trì tính ổn định của loài.'
      },
      {
        grade: 'Sinh Học 10 - Sinh Lý Tế Bào',
        title: 'Thẩm Thấu & Vận Chuyển Qua Màng Sinh Chất',
        formula: 'P_{tt} = R \\cdot T \\cdot C \\quad (\\text{Dòng nước dịch chuyển từ nơi thế nước cao sang nơi thế nước thấp})',
        desc: 'Nước tự do khuếch tán qua màng bán thấm hoặc kênh protein aquaporin tùy theo nồng độ chất tan môi trường.',
        vars: [
          { sym: 'Ưu trương (Hypertonic)', unit: '$C_{ngoài} > C_{trong}$', label: 'Nước thoát ra khỏi tế bào $\\to$ Tế bào thực vật bị Co Nguyên Sinh' },
          { sym: 'Đẳng trương (Isotonic)', unit: '$C_{ngoài} = C_{trong}$', label: 'Nước vào bằng nước ra $\\to$ Tế bào giữ nguyên trạng thái cân bằng' },
          { sym: 'Nhược trương (Hypotonic)', unit: '$C_{ngoài} < C_{trong}$', label: 'Nước ồ ạt tràn vào $\\to$ Tế bào trương nước (tế bào động vật có thể vỡ)' }
        ],
        notes: 'Khi tế bào thực vật co nguyên sinh, màng sinh chất tách rời khỏi thành cellulose cứng cáp, để lại khoảng trống chứa dịch môi trường.'
      }
    ]
  };

  // -------------------------------------------------------------
  // 2. DATA: QUICK CLASS QUIZZES (Khảo sát dự đoán hiện tượng)
  // -------------------------------------------------------------
  const QUICK_CLASS_QUIZZES = {
    physics: [
      {
        q: 'Khi giữ nguyên hiệu điện thế U giữa 2 đầu đoạn mạch mà tăng điện trở R lên gấp đôi thì cường độ dòng điện I sẽ như thế nào?',
        opts: [
          { txt: 'Tăng lên gấp 2 lần', correct: false },
          { txt: 'Giảm đi 2 lần (do I tỉ lệ nghịch với R theo định luật Ohm)', correct: true },
          { txt: 'Không đổi vì U không đổi', correct: false },
          { txt: 'Giảm đi 4 lần', correct: false }
        ],
        exp: 'Theo Định luật Ohm: $I = \\frac{U}{R}$. Khi U không đổi và R tăng gấp đôi, I sẽ giảm đi đúng 2 lần.'
      },
      {
        q: 'Chiếu một tia sáng từ nước (chiết suất n = 1.33) sang không khí (n = 1.0) với góc tới i = 60°. Biết góc tới hạn i_gh ≈ 48.8°. Hiện tượng gì xảy ra?',
        opts: [
          { txt: 'Tia sáng khúc xạ ra không khí với góc r = 90°', correct: false },
          { txt: 'Xảy ra hiện tượng phản xạ toàn phần, không có tia khúc xạ thoát ra ngoài', correct: true },
          { txt: 'Tia sáng truyền thẳng không đổi hướng', correct: false },
          { txt: 'Tia sáng bị hấp thụ hoàn toàn tại mặt phân cách', correct: false }
        ],
        exp: 'Vì ánh sáng truyền từ môi trường chiết quang hơn sang kém hơn ($n_1 > n_2$) và góc tới $i = 60^\\circ > i_{gh} = 48.8^\\circ$, nên toàn bộ tia sáng bị phản xạ trở lại môi trường nước (Phản xạ toàn phần).'
      },
      {
        q: 'Một vật thả trượt không vận tốc đầu từ đỉnh máng cong nhẵn (bỏ qua ma sát). Khi vật xuống đến chân máng, đại lượng nào đạt giá trị cực đại?',
        opts: [
          { txt: 'Thế năng trọng trường Wt', correct: false },
          { txt: 'Động năng Wđ và vận tốc v', correct: true },
          { txt: 'Gia tốc trọng trường g', correct: false },
          { txt: 'Khối lượng m của vật', correct: false }
        ],
        exp: 'Theo Định luật Bảo toàn cơ năng $W = W_đ + W_t = \\text{const}$. Tại đỉnh $W_t = \\max, W_đ = 0$. Tại chân máng độ cao $h = 0 \\implies W_t = 0$, toàn bộ thế năng đã chuyển hóa thành động năng đạt cực đại $W_đ = \\frac{1}{2}mv^2$.'
      }
    ],

    chemistry: [
      {
        q: 'Cho một mẩu kim loại Đồng (Cu) vào ống nghiệm chứa dung dịch Axit Clohiđric (HCl) loãng. Quan sát thấy hiện tượng gì?',
        opts: [
          { txt: 'Sủi bọt khí H₂ mãnh liệt và dung dịch chuyển sang màu xanh', correct: false },
          { txt: 'Không có hiện tượng gì xảy ra vì Cu đứng sau Hiđro trong dãy hoạt động hóa học', correct: true },
          { txt: 'Tạo kết tủa màu trắng xám dưới đáy ống nghiệm', correct: false },
          { txt: 'Ống nghiệm nóng lên phát nổ', correct: false }
        ],
        exp: 'Trong Dãy hoạt động hóa học, kim loại Đồng (Cu) đứng sau Hiđro (H) nên không có khả năng khử ion $H^+$ trong axit loãng, do đó không phản ứng.'
      },
      {
        q: 'Nhỏ 2 giọt dung dịch Phenolphtalein không màu vào cốc chứa dung dịch NaOH 0.1M, dung dịch sẽ đổi sang màu gì?',
        opts: [
          { txt: 'Màu đỏ gạch', correct: false },
          { txt: 'Màu hồng tươi / hồng cánh sen', correct: true },
          { txt: 'Màu xanh dương đậm', correct: false },
          { txt: 'Mất màu hoàn toàn', correct: false }
        ],
        exp: 'Dung dịch NaOH có tính kiềm mạnh (pH ≈ 13 > 8.3). Phenolphtalein là chất chỉ thị đặc trưng chuyển từ không màu sang màu hồng tươi trong môi trường bazơ.'
      },
      {
        q: 'Tại sao khi đốt than tổ ong người ta thường đập nhỏ than hoặc mở rộng cửa lò gió?',
        opts: [
          { txt: 'Để giảm bớt nhiệt lượng tỏa ra', correct: false },
          { txt: 'Để tăng diện tích tiếp xúc và tăng nồng độ Oxy, giúp phản ứng cháy diễn ra nhanh và hoàn toàn hơn', correct: true },
          { txt: 'Để than không sinh ra khí độc CO', correct: false },
          { txt: 'Để hạ nhiệt độ kích hoạt phản ứng', correct: false }
        ],
        exp: 'Đập nhỏ than làm tăng diện tích bề mặt tiếp xúc giữa than và không khí; mở cửa gió cung cấp nhiều O₂ (tăng nồng độ chất phản ứng), theo lý thuyết động học giúp tốc độ phản ứng tăng mạnh.'
      }
    ],

    biology: [
      {
        q: 'Ở đậu Hà Lan, gen A quy định hạt vàng trội hoàn toàn so với gen a hạt xanh. Cho cây dị hợp Aa tự thụ phấn, tỉ lệ kiểu hình ở đời con F1 là bao nhiêu?',
        opts: [
          { txt: '100% hạt vàng', correct: false },
          { txt: '3 hạt vàng : 1 hạt xanh (75% vàng : 25% xanh)', correct: true },
          { txt: '1 hạt vàng : 1 hạt xanh', correct: false },
          { txt: '9 hạt vàng : 7 hạt xanh', correct: false }
        ],
        exp: 'Sơ đồ lai: $Aa \\times Aa \\to 1AA : 2Aa : 1aa$. Kiểu hình gồm ($1AA + 2Aa$) = 3 vàng và ($1aa$) = 1 xanh. Tỉ lệ chuẩn 3:1 theo quy luật phân ly của Mendel.'
      },
      {
        q: 'Hiện tượng gì xảy ra khi đặt một mẩu biểu bì vảy hành tím vào giọt nước muối sinh lý đặc (dung dịch ưu trương NaCl 10%)?',
        opts: [
          { txt: 'Tế bào hút nước trương phồng và vỡ tung', correct: false },
          { txt: 'Tế bào mất nước, không bào co lại, màng sinh chất tách rời khỏi thành cellulose (Co nguyên sinh)', correct: true },
          { txt: 'Lục lạp phân chia nhanh chóng', correct: false },
          { txt: 'Không có hiện tượng gì xảy ra', correct: false }
        ],
        exp: 'Dung dịch muối đặc có nồng độ chất tan cao hơn trong tế bào chất (ưu trương). Theo cơ chế thẩm thấu, nước từ không bào khuếch tán ra ngoài môi trường khiến màng sinh chất co rúm tách khỏi thành tế bào (hiện tượng co nguyên sinh).'
      },
      {
        q: 'Trong quá trình nguyên phân của tế bào nhân thực, các nhiễm sắc thể co xoắn cực đại và xếp thành một hàng trên mặt phẳng xích đạo của thoi phân bào tại kỳ nào?',
        opts: [
          { txt: 'Kỳ đầu (Prophase)', correct: false },
          { txt: 'Kỳ giữa (Metaphase)', correct: true },
          { txt: 'Kỳ sau (Anaphase)', correct: false },
          { txt: 'Kỳ cuối (Telophase)', correct: false }
        ],
        exp: 'Ở Kỳ giữa (Metaphase), các NST kép co xoắn cực đại đạt hình thái đặc trưng nhất và xếp thành một hàng trên tấm xích đạo, sẵn sàng cho việc phân ly ở kỳ sau.'
      }
    ]
  };

  // -------------------------------------------------------------
  // 3. DETECT CURRENT SUBJECT & PAGE CONTEXT
  // -------------------------------------------------------------
  function detectSubject() {
    const path = (window.location.pathname || window.location.href).toLowerCase();
    if (path.includes('hoa') || path.includes('chem')) return 'chemistry';
    if (path.includes('sinh') || path.includes('bio')) return 'biology';
    return 'physics'; // default to physics
  }

  const currentSubject = detectSubject();

  // Helper: KaTeX safe renderer with Unicode fallback
  function renderMathSafely(element) {
    if (!element) return;
    if (window.renderMathInElement && typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(element, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
        return;
      } catch (e) {}
    }
    // Fallback: Format basic LaTeX notation to clean readable text if KaTeX is not loaded
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.nodeValue && node.nodeValue.includes('$')) {
        node.nodeValue = node.nodeValue.replace(/\$([^$]+)\$/g, (m, math) => {
          return math
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
            .replace(/\\cdot/g, '·')
            .replace(/\\times/g, '×')
            .replace(/\\to/g, '→')
            .replace(/\\implies/g, '⇒')
            .replace(/\\iff/g, '⇔')
            .replace(/\\approx/g, '≈')
            .replace(/\\le/g, '≤')
            .replace(/\\ge/g, '≥')
            .replace(/\\Omega/g, 'Ω')
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\Delta/g, 'Δ')
            .replace(/\\mu/g, 'μ')
            .replace(/\\pi/g, 'π')
            .replace(/\\circ/g, '°')
            .replace(/\\sin/g, 'sin')
            .replace(/\\cos/g, 'cos')
            .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
            .replace(/\\text\{([^}]+)\}/g, '$1')
            .replace(/\\quad/g, '  ')
            .replace(/\\sum/g, 'Σ');
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 4. INJECT STYLES FOR TEACHER TOOLKIT
  // -------------------------------------------------------------
  function injectToolkitStyles() {
    if (document.getElementById('nexusTeacherToolkitStyles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'nexusTeacherToolkitStyles';
    styleEl.textContent = `
      /* Teacher Toolkit Floating Bar */
      #nexusTeacherBar {
        position: fixed;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99998;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 9999px;
        background: rgba(15, 23, 42, 0.94);
        border: 1px solid rgba(56, 189, 248, 0.35);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.1);
        color: #f1f5f9;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: 12px;
        font-weight: 600;
        user-select: none;
        touch-action: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      #nexusTeacherBar.hidden-bar {
        display: none !important;
      }

      /* Floating Dock Trigger Button */
      #nexusTeacherDockTrigger {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99990;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 16px;
        border-radius: 9999px;
        background: #0284c7;
        background: linear-gradient(135deg, #0284c7, #0369a1);
        border: 1px solid rgba(56, 189, 248, 0.6);
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 8px 24px -4px rgba(2, 132, 199, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        user-select: none;
      }
      #nexusTeacherDockTrigger:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px -4px rgba(2, 132, 199, 0.65), 0 0 0 2px rgba(56, 189, 248, 0.8);
      }
      #nexusTeacherDockTrigger.active-dock {
        background: linear-gradient(135deg, #0f172a, #1e293b);
        border-color: #38bdf8;
      }

      /* Toolbar Buttons */
      .nexus-tb-btn {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 9px;
        border-radius: 9999px;
        background: rgba(30, 41, 59, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.2);
        color: #e2e8f0;
        transition: all 0.15s ease;
        font-size: 11px;
        font-weight: 700;
      }
      .nexus-tb-btn:hover {
        background: rgba(51, 65, 85, 0.95);
        border-color: rgba(56, 189, 248, 0.6);
        color: #ffffff;
        transform: translateY(-1px);
      }
      .nexus-tb-btn.active {
        background: linear-gradient(135deg, #0284c7, #06b6d4);
        color: #ffffff;
        border-color: #38bdf8;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
      }
      .nexus-tb-btn.active-laser {
        background: linear-gradient(135deg, #e11d48, #f43f5e);
        color: #ffffff;
        border-color: #fb7185;
        box-shadow: 0 0 14px rgba(244, 63, 94, 0.5);
      }
      .nexus-tb-btn.active-highlighter {
        background: linear-gradient(135deg, #ca8a04, #eab308);
        color: #000000;
        border-color: #fde047;
        box-shadow: 0 0 12px rgba(234, 179, 8, 0.4);
      }
      .nexus-tb-btn.active-eraser {
        background: linear-gradient(135deg, #475569, #64748b);
        color: #ffffff;
        border-color: #94a3b8;
      }

      /* Annotation Canvas Overlay */
      #nexusAnnotationCanvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 99990;
        pointer-events: none;
        display: block;
        touch-action: none;
      }
      #nexusAnnotationCanvas.active-pen {
        pointer-events: auto;
        cursor: crosshair;
      }
      #nexusAnnotationCanvas.active-eraser {
        pointer-events: auto;
        cursor: cell;
      }

      /* Laser Pointer Dot Overlay */
      #nexusLaserDot {
        position: fixed;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #ff0044;
        box-shadow: 0 0 15px 4px rgba(255, 0, 68, 0.9), 0 0 35px 10px rgba(255, 0, 68, 0.4);
        pointer-events: none;
        z-index: 99995;
        display: none;
        transform: translate(-50%, -50%);
        transition: width 0.08s, height 0.08s;
      }

      /* Color Palette Pill */
      .nexus-color-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: transform 0.15s, border-color 0.15s;
      }
      .nexus-color-dot:hover {
        transform: scale(1.25);
      }
      .nexus-color-dot.selected {
        border-color: #ffffff;
        transform: scale(1.2);
        box-shadow: 0 0 8px currentColor;
      }

      /* Slide-over Theory Drawer */
      #nexusTheoryDrawer {
        position: fixed;
        top: 0;
        right: -480px;
        width: min(460px, 92vw);
        height: 100vh;
        z-index: 99999;
        background: rgba(15, 23, 42, 0.97);
        border-left: 1px solid rgba(56, 189, 248, 0.25);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
        color: #f8fafc;
        transition: right 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      #nexusTheoryDrawer.open {
        right: 0;
      }

      /* Quick Class Quiz Modal */
      #nexusQuizModal {
        position: fixed;
        inset: 0;
        background: rgba(4, 7, 17, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      #nexusQuizModal.open {
        display: flex;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // -------------------------------------------------------------
  // 5. ANNOTATION ENGINE (Bút vẽ bảng, Dạ quang, Tẩy & Laser pointer)
  // -------------------------------------------------------------
  let canvasEl, ctx;
  let isPenActive = false;
  let isLaserActive = false;
  let isEraserActive = false;
  let isHighlighterActive = false;
  let isDrawing = false;
  let penColor = '#ef4444'; // Red default
  let penSize = 3.5;
  let strokes = []; // { mode, color, size, points: [{x,y}] }
  let currentStroke = null;
  let laserDotEl;

  function initAnnotation() {
    canvasEl = document.createElement('canvas');
    canvasEl.id = 'nexusAnnotationCanvas';
    document.body.appendChild(canvasEl);
    ctx = canvasEl.getContext('2d');

    laserDotEl = document.createElement('div');
    laserDotEl.id = 'nexusLaserDot';
    document.body.appendChild(laserDotEl);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = Math.round(window.innerWidth * dpr);
      canvasEl.height = Math.round(window.innerHeight * dpr);
      canvasEl.style.width = window.innerWidth + 'px';
      canvasEl.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawStrokes();
    }
    window.addEventListener('resize', resize);
    resize();

    // Pointer events with pointer capture
    canvasEl.addEventListener('pointerdown', (e) => {
      if (!isPenActive && !isEraserActive && !isHighlighterActive) return;
      isDrawing = true;
      try { canvasEl.setPointerCapture(e.pointerId); } catch (err) {}

      const mode = isEraserActive ? 'eraser' : (isHighlighterActive ? 'highlighter' : 'pen');
      const strokeSize = isEraserActive ? 24 : (isHighlighterActive ? 18 : penSize);
      const strokeColor = isEraserActive ? '#000000' : (isHighlighterActive ? 'rgba(250, 204, 21, 0.4)' : penColor);

      currentStroke = {
        mode: mode,
        color: strokeColor,
        size: strokeSize,
        points: [{ x: e.clientX, y: e.clientY }]
      };
      strokes.push(currentStroke);

      if (mode === 'eraser') {
        eraseAtPoint(e.clientX, e.clientY, strokeSize);
      } else {
        drawPoint(e.clientX, e.clientY, strokeColor, strokeSize, mode);
      }
    });

    window.addEventListener('pointermove', (e) => {
      // Laser Dot Follower
      if (isLaserActive) {
        laserDotEl.style.left = e.clientX + 'px';
        laserDotEl.style.top = e.clientY + 'px';
      }

      // Drawing
      if (!isDrawing || !currentStroke) return;
      const pt = { x: e.clientX, y: e.clientY };
      currentStroke.points.push(pt);

      if (currentStroke.mode === 'eraser') {
        eraseAtPoint(e.clientX, e.clientY, currentStroke.size);
        return;
      }

      const pts = currentStroke.points;
      if (pts.length > 1) {
        const p1 = pts[pts.length - 2];
        const p2 = pts[pts.length - 1];
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = currentStroke.color;
        ctx.lineWidth = currentStroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (currentStroke.mode === 'highlighter') {
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (isDrawing) {
        isDrawing = false;
        currentStroke = null;
        try { canvasEl.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    });

    // Keyboard Shortcuts: C = Clear, Ctrl+Z = Undo, Esc = Close
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.key === 'c' || e.key === 'C') {
        clearAnnotation();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        undoStroke();
      } else if (e.key === 'Escape') {
        setPenMode(false);
        setLaserMode(false);
        setEraserMode(false);
        setHighlighterMode(false);
        closeTheoryDrawer();
        closeQuizModal();
      }
    });
  }

  function eraseAtPoint(x, y, radius) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPoint(x, y, color, size, mode) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function redrawStrokes() {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const stroke of strokes) {
      if (!stroke.points.length) continue;
      if (stroke.mode === 'eraser') continue; // Eraser strokes are applied directly

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  function undoStroke() {
    if (strokes.length > 0) {
      strokes.pop();
      redrawStrokes();
    }
  }

  function clearAnnotation() {
    strokes = [];
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function setPenMode(active) {
    isPenActive = active;
    if (isPenActive) {
      setLaserMode(false);
      setEraserMode(false);
      setHighlighterMode(false);
      canvasEl.className = 'active-pen';
      document.getElementById('btnTeacherPen')?.classList.add('active');
    } else {
      if (!isEraserActive && !isHighlighterActive) {
        canvasEl.className = '';
      }
      document.getElementById('btnTeacherPen')?.classList.remove('active');
    }
  }

  function setHighlighterMode(active) {
    isHighlighterActive = active;
    if (isHighlighterActive) {
      setPenMode(false);
      setLaserMode(false);
      setEraserMode(false);
      canvasEl.className = 'active-pen';
      document.getElementById('btnTeacherHighlighter')?.classList.add('active-highlighter');
    } else {
      if (!isPenActive && !isEraserActive) {
        canvasEl.className = '';
      }
      document.getElementById('btnTeacherHighlighter')?.classList.remove('active-highlighter');
    }
  }

  function setEraserMode(active) {
    isEraserActive = active;
    if (isEraserActive) {
      setPenMode(false);
      setLaserMode(false);
      setHighlighterMode(false);
      canvasEl.className = 'active-eraser';
      document.getElementById('btnTeacherEraser')?.classList.add('active-eraser');
    } else {
      if (!isPenActive && !isHighlighterActive) {
        canvasEl.className = '';
      }
      document.getElementById('btnTeacherEraser')?.classList.remove('active-eraser');
    }
  }

  function setLaserMode(active) {
    isLaserActive = active;
    if (isLaserActive) {
      setPenMode(false);
      setEraserMode(false);
      setHighlighterMode(false);
      laserDotEl.style.display = 'block';
      document.getElementById('btnTeacherLaser')?.classList.add('active-laser');
    } else {
      laserDotEl.style.display = 'none';
      document.getElementById('btnTeacherLaser')?.classList.remove('active-laser');
    }
  }

  // -------------------------------------------------------------
  // 6. TIME TELEMETRY (Slow-mo 0.25x, 0.5x, 1x & Step Forward)
  // -------------------------------------------------------------
  let currentSpeed = 1.0;

  function setSimSpeed(speed) {
    currentSpeed = speed;
    if (window.setLabSpeed && typeof window.setLabSpeed === 'function') {
      window.setLabSpeed(speed);
    }
    // Visual feedback
    document.querySelectorAll('.nexus-speed-btn').forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
    });
  }

  function stepForwardFrame() {
    if (window.__nexusLabStepFrame && typeof window.__nexusLabStepFrame === 'function') {
      window.__nexusLabStepFrame();
    } else if (window.renderWorkbench && typeof window.renderWorkbench === 'function') {
      window.renderWorkbench();
    }
  }

  // -------------------------------------------------------------
  // 7. THEORY DRAWER RENDERER
  // -------------------------------------------------------------
  let drawerEl;
  let activeTheoryTab = currentSubject;

  function initTheoryDrawer() {
    drawerEl = document.createElement('div');
    drawerEl.id = 'nexusTheoryDrawer';
    drawerEl.innerHTML = `
      <div style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 16px;">
            📖
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px; color: #f8fafc; letter-spacing: -0.3px;">Thẻ Lý Thuyết SGK Nhanh</div>
            <div style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">CHUẨN GDPT 2018 (LỚP 9 - 10)</div>
          </div>
        </div>
        <button id="btnCloseTheoryDrawer" style="all: unset; cursor: pointer; padding: 6px 10px; border-radius: 8px; background: rgba(255,255,255,0.06); color: #cbd5e1; font-size: 14px; font-weight: bold;">
          ✕
        </button>
      </div>

      <!-- Subject Tabs -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); padding: 8px 16px; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(10,15,30,0.6);">
        <button class="nexus-theory-tab-btn" data-sub="physics" style="all: unset; cursor: pointer; text-align: center; padding: 6px; border-radius: 8px; font-size: 11px; font-weight: 700; transition: all 0.2s;">
          ⚡ Vật Lý
        </button>
        <button class="nexus-theory-tab-btn" data-sub="chemistry" style="all: unset; cursor: pointer; text-align: center; padding: 6px; border-radius: 8px; font-size: 11px; font-weight: 700; transition: all 0.2s;">
          🧪 Hóa Học
        </button>
        <button class="nexus-theory-tab-btn" data-sub="biology" style="all: unset; cursor: pointer; text-align: center; padding: 6px; border-radius: 8px; font-size: 11px; font-weight: 700; transition: all 0.2s;">
          🧬 Sinh Học
        </button>
      </div>

      <!-- Scrollable Cards Container -->
      <div id="nexusTheoryCardsList" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px;">
      </div>

      <!-- Footer Info -->
      <div style="padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(10,15,30,0.8); font-size: 11px; color: #94a3b8; display: flex; align-items: center; justify-content: space-between;">
        <span>Phóng to: <strong style="color: #38bdf8;">Ctrl + / -</strong></span>
        <span>NexusLab v3.5 Pro</span>
      </div>
    `;
    document.body.appendChild(drawerEl);

    document.getElementById('btnCloseTheoryDrawer').addEventListener('click', closeTheoryDrawer);

    drawerEl.querySelectorAll('.nexus-theory-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTheoryTab = btn.dataset.sub;
        renderTheoryCards();
      });
    });

    renderTheoryCards();
  }

  function renderTheoryCards() {
    const listEl = document.getElementById('nexusTheoryCardsList');
    if (!listEl) return;

    // Update tab button styles
    drawerEl.querySelectorAll('.nexus-theory-tab-btn').forEach(btn => {
      const active = btn.dataset.sub === activeTheoryTab;
      btn.style.background = active ? 'rgba(56, 189, 248, 0.25)' : 'transparent';
      btn.style.color = active ? '#38bdf8' : '#94a3b8';
      btn.style.border = active ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent';
    });

    const cards = SGK_THEORY_DATA[activeTheoryTab] || [];
    listEl.innerHTML = cards.map(c => `
      <div style="background: rgba(30, 41, 59, 0.65); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(56,189,248,0.3);">
            ${c.grade}
          </span>
          <span style="font-size: 10px; color: #94a3b8; font-weight: bold;">SGK GDPT 2018</span>
        </div>
        <div style="font-size: 13px; font-weight: 800; color: #ffffff;">${c.title}</div>
        
        <!-- Formula Box -->
        <div style="background: rgba(10, 15, 30, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 10px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #38bdf8; overflow-x: auto;">
          $${c.formula}$
        </div>

        <p style="font-size: 11.5px; color: #cbd5e1; line-height: 1.5; margin: 0;">${c.desc}</p>

        <!-- Variables Breakdown -->
        <div style="background: rgba(15, 23, 42, 0.5); border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
          ${c.vars.map(v => `
            <div style="display: flex; justify-content: space-between; gap: 8px;">
              <span style="color: #f1f5f9; font-weight: 600;"><strong style="color: #38bdf8; font-family: 'JetBrains Mono';">$${v.sym}$</strong>: ${v.label}</span>
              <span style="color: #94a3b8; font-family: 'JetBrains Mono'; font-size: 10px;">[${v.unit}]</span>
            </div>
          `).join('')}
        </div>

        <!-- Practical Exam Note -->
        <div style="font-size: 10.5px; color: #fde047; background: rgba(234, 179, 8, 0.1); border-left: 3px solid #eab308; padding: 6px 8px; border-radius: 4px; line-height: 1.4;">
          💡 <strong>Lưu ý giảng dạy:</strong> ${c.notes}
        </div>
      </div>
    `).join('');

    renderMathSafely(listEl);
  }

  function toggleTheoryDrawer() {
    if (drawerEl.classList.contains('open')) {
      closeTheoryDrawer();
    } else {
      openTheoryDrawer();
    }
  }

  function openTheoryDrawer() {
    drawerEl.classList.add('open');
    document.getElementById('btnTeacherTheory')?.classList.add('active');
  }

  function closeTheoryDrawer() {
    drawerEl?.classList.remove('open');
    document.getElementById('btnTeacherTheory')?.classList.remove('active');
  }

  // -------------------------------------------------------------
  // 8. QUICK CLASS QUIZ MODAL
  // -------------------------------------------------------------
  let quizModalEl;
  let currentQuizIdx = 0;
  let activeQuizSubject = currentSubject;

  function initQuizModal() {
    quizModalEl = document.createElement('div');
    quizModalEl.id = 'nexusQuizModal';
    quizModalEl.innerHTML = `
      <div style="max-width: 580px; width: 100%; background: #0b1329; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 24px; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); color: #ffffff; display: flex; flex-direction: column; gap: 16px; position: relative;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              ❓
            </div>
            <div>
              <div style="font-weight: 800; font-size: 15px; letter-spacing: -0.3px;">Khảo Sát & Dự Đoán Hiện Tượng Trước Giờ Thí Nghiệm</div>
              <div style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono';">QUICK CLASSROOM CONCEPT CHECK</div>
            </div>
          </div>
          <button id="btnCloseQuizModal" style="all: unset; cursor: pointer; padding: 6px 10px; border-radius: 8px; background: rgba(255,255,255,0.06); color: #cbd5e1; font-size: 14px; font-weight: bold;">
            ✕
          </button>
        </div>

        <!-- Question Counter & Body -->
        <div id="nexusQuizBody" style="display: flex; flex-direction: column; gap: 14px;"></div>

        <!-- Navigation Buttons -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
          <button id="btnPrevQuiz" style="all: unset; cursor: pointer; padding: 8px 14px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); font-size: 12px; font-weight: 700; color: #cbd5e1;">
            ← Câu trước
          </button>
          <span id="txtQuizPagination" style="font-size: 11px; font-family: 'JetBrains Mono'; color: #94a3b8;">1 / 3</span>
          <button id="btnNextQuiz" style="all: unset; cursor: pointer; padding: 8px 14px; border-radius: 10px; background: #0284c7; border: 1px solid #38bdf8; font-size: 12px; font-weight: 700; color: #ffffff;">
            Câu tiếp theo →
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(quizModalEl);

    document.getElementById('btnCloseQuizModal').addEventListener('click', closeQuizModal);
    document.getElementById('btnPrevQuiz').addEventListener('click', () => {
      const questions = QUICK_CLASS_QUIZZES[activeQuizSubject] || [];
      if (currentQuizIdx > 0) {
        currentQuizIdx--;
        renderQuizQuestion();
      }
    });
    document.getElementById('btnNextQuiz').addEventListener('click', () => {
      const questions = QUICK_CLASS_QUIZZES[activeQuizSubject] || [];
      if (currentQuizIdx < questions.length - 1) {
        currentQuizIdx++;
        renderQuizQuestion();
      } else {
        closeQuizModal();
      }
    });
  }

  function renderQuizQuestion() {
    const questions = QUICK_CLASS_QUIZZES[activeQuizSubject] || [];
    const q = questions[currentQuizIdx];
    const bodyEl = document.getElementById('nexusQuizBody');
    const pagEl = document.getElementById('txtQuizPagination');
    if (!q || !bodyEl) return;

    pagEl.textContent = `Câu ${currentQuizIdx + 1} / ${questions.length}`;

    bodyEl.innerHTML = `
      <div style="font-size: 14px; font-weight: 700; line-height: 1.5; color: #f8fafc;">
        <span style="color: #38bdf8; font-family: 'JetBrains Mono';">Q${currentQuizIdx + 1}:</span> ${q.q}
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${q.opts.map((opt, i) => `
          <button class="nexus-quiz-opt-btn" data-correct="${opt.correct}" style="all: unset; cursor: pointer; padding: 12px 14px; border-radius: 12px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(148, 163, 184, 0.2); font-size: 12.5px; font-weight: 600; color: #e2e8f0; display: flex; align-items: center; gap: 10px; transition: all 0.15s ease;">
            <span style="width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 11px; font-family: 'JetBrains Mono'; font-weight: 800; color: #94a3b8;">
              ${String.fromCharCode(65 + i)}
            </span>
            <span>${opt.txt}</span>
          </button>
        `).join('')}
      </div>
      <div id="nexusQuizExp" style="display: none; padding: 12px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; font-size: 12px; line-height: 1.5; color: #a7f3d0;">
        <strong>💡 Lời giải chi tiết:</strong> ${q.exp}
      </div>
    `;

    bodyEl.querySelectorAll('.nexus-quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        btn.style.background = isCorrect ? '#065f46' : '#881337';
        btn.style.borderColor = isCorrect ? '#10b981' : '#f43f5e';
        btn.style.color = '#ffffff';
        const expEl = document.getElementById('nexusQuizExp');
        if (expEl) {
          expEl.style.display = 'block';
          renderMathSafely(expEl);
        }
      });
    });

    renderMathSafely(bodyEl);
  }

  function toggleQuizModal() {
    if (quizModalEl.classList.contains('open')) {
      closeQuizModal();
    } else {
      openQuizModal();
    }
  }

  function openQuizModal() {
    quizModalEl.classList.add('open');
    currentQuizIdx = 0;
    renderQuizQuestion();
  }

  function closeQuizModal() {
    quizModalEl?.classList.remove('open');
  }

  // -------------------------------------------------------------
  // 9. TEACHER FLOATING TOOLBAR & FLOATING DOCK TRIGGER
  // -------------------------------------------------------------
  let barEl;
  let dockTriggerEl;
  let isBarMinimized = false;

  function initTeacherToolbar() {
    // 1. Floating Dock Trigger (Góc dưới phải để mở/đóng thanh công cụ)
    dockTriggerEl = document.createElement('button');
    dockTriggerEl.id = 'nexusTeacherDockTrigger';
    dockTriggerEl.innerHTML = `
      <span style="font-size: 15px;">👨‍🏫</span>
      <span>Trợ Giảng SGK</span>
    `;
    dockTriggerEl.title = 'Bật/Tắt Bộ Công Cụ Trợ Giảng SGK & Bút Vẽ Bảng';
    document.body.appendChild(dockTriggerEl);

    dockTriggerEl.addEventListener('click', () => {
      if (barEl.classList.contains('hidden-bar')) {
        showToolbar();
      } else {
        hideToolbar();
      }
    });

    // 2. Main Floating Presentation Bar
    barEl = document.createElement('div');
    barEl.id = 'nexusTeacherBar';
    barEl.innerHTML = `
      <!-- Drag Grip & Subject Indicator -->
      <div id="nexusTeacherGrip" style="display: flex; align-items: center; gap: 6px; padding-right: 8px; border-right: 1px solid rgba(255,255,255,0.15); cursor: grab;" title="Kéo để di chuyển thanh công cụ">
        <span style="font-size: 14px;">🎓</span>
        <span style="font-weight: 800; font-size: 11px; letter-spacing: -0.2px; color: #38bdf8;">NexusLab Pro</span>
      </div>

      <!-- Pen & Annotation Tools -->
      <button id="btnTeacherPen" class="nexus-tb-btn" title="Bút vẽ tự do lên màn hình">
        <span>✏️</span>
        <span>Bút</span>
      </button>

      <!-- Highlighter (Dạ quang) -->
      <button id="btnTeacherHighlighter" class="nexus-tb-btn" title="Bút dạ quang đánh dấu văn bản">
        <span>🖍️</span>
        <span>Dạ quang</span>
      </button>

      <!-- Eraser (Tẩy) -->
      <button id="btnTeacherEraser" class="nexus-tb-btn" title="Tẩy nét vẽ">
        <span>🧹</span>
      </button>

      <!-- Laser Pointer -->
      <button id="btnTeacherLaser" class="nexus-tb-btn" title="Chấm Laser Đỏ chiếu điểm chú ý">
        <span>🔴</span>
        <span>Laser</span>
      </button>

      <!-- Color Palette -->
      <div style="display: flex; align-items: center; gap: 4px; padding: 0 4px;">
        <div class="nexus-color-dot selected" data-color="#ef4444" style="background: #ef4444;" title="Đỏ"></div>
        <div class="nexus-color-dot" data-color="#38bdf8" style="background: #38bdf8;" title="Xanh Cyan"></div>
        <div class="nexus-color-dot" data-color="#eab308" style="background: #eab308;" title="Vàng"></div>
        <div class="nexus-color-dot" data-color="#10b981" style="background: #10b981;" title="Xanh Lục"></div>
        <div class="nexus-color-dot" data-color="#ffffff" style="background: #ffffff;" title="Trắng"></div>
      </div>

      <!-- Clear Canvas -->
      <button id="btnTeacherClear" class="nexus-tb-btn" title="Xóa toàn bộ nét vẽ (Phím tắt C)">
        <span>🗑️</span>
      </button>

      <!-- Theory Drawer Toggle -->
      <button id="btnTeacherTheory" class="nexus-tb-btn" title="Bảng tra cứu công thức SGK GDPT 2018">
        <span>📖</span>
        <span>Lý thuyết SGK</span>
      </button>

      <!-- Quick Class Quiz -->
      <button id="btnTeacherQuiz" class="nexus-tb-btn" title="Khảo sát dự đoán hiện tượng lớp học">
        <span>❓</span>
        <span>Khảo sát</span>
      </button>

      <!-- Time Telemetry Controls (0.25x, 0.5x, 1x & Step) -->
      <div style="display: flex; align-items: center; gap: 2px; padding-left: 4px; border-left: 1px solid rgba(255,255,255,0.15);">
        <button class="nexus-tb-btn nexus-speed-btn" data-speed="0.25" title="Chuyển động siêu chậm 0.25x">
          0.25x
        </button>
        <button class="nexus-tb-btn nexus-speed-btn" data-speed="0.5" title="Làm chậm 0.5x">
          0.5x
        </button>
        <button class="nexus-tb-btn nexus-speed-btn active" data-speed="1.0" title="Tốc độ chuẩn 1.0x">
          1x
        </button>
        <button id="btnTeacherStep" class="nexus-tb-btn" title="Chạy từng bước (+1 frame)">
          <span>⏭️</span>
        </button>
      </div>

      <!-- Fullscreen Toggle -->
      <button id="btnTeacherFullscreen" class="nexus-tb-btn" title="Toàn màn hình máy chiếu / Smart TV">
        <span>⛶</span>
      </button>

      <!-- Minimize Button -->
      <button id="btnTeacherMinimize" class="nexus-tb-btn" title="Thu nhỏ thanh công cụ" style="padding: 5px 6px;">
        <span>✕</span>
      </button>
    `;
    document.body.appendChild(barEl);

    function showToolbar() {
      barEl.classList.remove('hidden-bar');
      dockTriggerEl.classList.add('active-dock');
    }

    function hideToolbar() {
      barEl.classList.add('hidden-bar');
      dockTriggerEl.classList.remove('active-dock');
      setPenMode(false);
      setLaserMode(false);
      setEraserMode(false);
      setHighlighterMode(false);
    }

    // Event Listeners for Toolbar Actions
    document.getElementById('btnTeacherPen').addEventListener('click', (e) => {
      e.stopPropagation();
      setPenMode(!isPenActive);
    });

    document.getElementById('btnTeacherHighlighter').addEventListener('click', (e) => {
      e.stopPropagation();
      setHighlighterMode(!isHighlighterActive);
    });

    document.getElementById('btnTeacherEraser').addEventListener('click', (e) => {
      e.stopPropagation();
      setEraserMode(!isEraserActive);
    });

    document.getElementById('btnTeacherLaser').addEventListener('click', (e) => {
      e.stopPropagation();
      setLaserMode(!isLaserActive);
    });

    document.getElementById('btnTeacherClear').addEventListener('click', (e) => {
      e.stopPropagation();
      clearAnnotation();
    });

    document.getElementById('btnTeacherTheory').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheoryDrawer();
    });

    document.getElementById('btnTeacherQuiz').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleQuizModal();
    });

    document.getElementById('btnTeacherStep').addEventListener('click', (e) => {
      e.stopPropagation();
      stepForwardFrame();
    });

    document.getElementById('btnTeacherMinimize').addEventListener('click', (e) => {
      e.stopPropagation();
      hideToolbar();
    });

    // Color picker
    barEl.querySelectorAll('.nexus-color-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        barEl.querySelectorAll('.nexus-color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        penColor = dot.dataset.color;
        if (!isPenActive && !isHighlighterActive) setPenMode(true);
      });
    });

    // Speed buttons
    barEl.querySelectorAll('.nexus-speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setSimSpeed(parseFloat(btn.dataset.speed));
      });
    });

    // Fullscreen toggle
    document.getElementById('btnTeacherFullscreen').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Safe Smooth Draggable Logic with Viewport Boundary Constraints
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let initialBarLeft = 0;
    let initialBarTop = 0;

    const gripEl = document.getElementById('nexusTeacherGrip');

    gripEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || e.target.closest('.nexus-color-dot')) return;
      isDragging = true;
      try { gripEl.setPointerCapture(e.pointerId); } catch (err) {}

      const rect = barEl.getBoundingClientRect();
      initialBarLeft = rect.left;
      initialBarTop = rect.top;
      startMouseX = e.clientX;
      startMouseY = e.clientY;

      barEl.style.transition = 'none';
      barEl.style.transform = 'none';
      barEl.style.left = initialBarLeft + 'px';
      barEl.style.top = initialBarTop + 'px';
      gripEl.style.cursor = 'grabbing';
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;

      const maxLeft = Math.max(10, window.innerWidth - barEl.offsetWidth - 10);
      const maxTop = Math.max(10, window.innerHeight - barEl.offsetHeight - 10);

      const targetLeft = Math.max(10, Math.min(maxLeft, initialBarLeft + dx));
      const targetTop = Math.max(10, Math.min(maxTop, initialBarTop + dy));

      barEl.style.left = targetLeft + 'px';
      barEl.style.top = targetTop + 'px';
    });

    window.addEventListener('pointerup', (e) => {
      if (isDragging) {
        isDragging = false;
        try { gripEl.releasePointerCapture(e.pointerId); } catch (err) {}
        gripEl.style.cursor = 'grab';
        barEl.style.transition = 'opacity 0.2s ease';
      }
    });
  }

  // -------------------------------------------------------------
  // 10. INITIALIZATION
  // -------------------------------------------------------------
  function init() {
    injectToolkitStyles();
    initAnnotation();
    initTheoryDrawer();
    initQuizModal();
    initTeacherToolbar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
