/**
 * course-quiz.js — Hệ Thống Trắc Nghiệm Dự Đoán Tiền Thí Nghiệm & Giải Thích Hiện Tượng Chuẩn SGK
 * Áp dụng cho toàn bộ 29 khóa học: Vật lý (ly1-8), Hóa học (hoa1-9), Sinh học (sinh1-12)
 * Hỗ trợ giao diện nền trắng hiện đại (White Theme) và công thức KaTeX chuẩn xác 100%.
 */

(function () {
  'use strict';

  // 1. DATABASE 29 BÀI HỌC CHUẨN SGK GDPT 2018
  const COURSE_DB = {
    // --- VẬT LÝ ---
    'ly1.html': {
      title: 'Vật Lý 9 - Động Năng (Máng Nghiêng & Miếng Gỗ)',
      category: 'physics',
      question: 'Thả viên bi từ độ cao h trên máng nghiêng va chạm vào miếng gỗ trên mặt sàn nằm ngang. Nếu tăng độ cao thả bi lên gấp đôi (2h) hoặc tăng khối lượng viên bi lên gấp đôi (2m), quãng đường s miếng gỗ bị đẩy trượt sẽ thay đổi thế nào?',
      options: [
        'A. Quãng đường s không thay đổi.',
        'B. Quãng đường s bị đẩy trượt dài hơn do động năng của viên bi lớn hơn.',
        'C. Quãng đường s bị đẩy trượt ngắn hơn do lực ma sát tăng lên.',
        'D. Miếng gỗ đứng yên không chuyển động.'
      ],
      correctIndex: 1,
      explanation: 'Viên bi thả ở độ cao càng lớn thì khi chạm chân dốc vận tốc v càng lớn (v = \\sqrt{2gh}); khối lượng m càng lớn thì động năng của viên bi càng lớn theo công thức W_đ = \\frac{1}{2}mv^2. Khi va chạm, viên bi truyền động năng sinh công đẩy miếng gỗ trượt quãng đường s dài hơn chống lại lực ma sát (A_{ms} = F_{ms} \\cdot s = W_đ).',
      formulas: [
        'W_đ = \\frac{1}{2}mv^2 \\quad (J)',
        'v = \\sqrt{2gh} \\quad (m/s)',
        'A = F_{ms} \\cdot s = W_đ'
      ],
      sgkSummary: 'Động năng của một vật phụ thuộc vào khối lượng m và vận tốc v của vật. Khối lượng càng lớn và chuyển động càng nhanh thì động năng của vật càng lớn và khả năng sinh công càng cao.'
    },

    'ly2.html': {
      title: 'Vật Lý 9 - Thế Năng & Bảo Toàn Cơ Năng',
      category: 'physics',
      question: 'Một vật được ném thẳng đứng lên cao từ mặt đất. Bỏ qua sức cản không khí, trong quá trình vật chuyển động lên cao đến điểm cao nhất, cơ năng của vật biến đổi như thế nào?',
      options: [
        'A. Cả động năng và thế năng của vật cùng tăng.',
        'B. Động năng tăng lên còn thế năng giảm xuống.',
        'C. Động năng chuyển hóa thành thế năng, tổng cơ năng được bảo toàn không đổi.',
        'D. Cơ năng giảm dần về 0 khi vật lên đến đỉnh.'
      ],
      correctIndex: 2,
      explanation: 'Khi vật bay lên cao, độ cao h tăng dần nên thế năng trọng trường W_t = mgh tăng dần. Do tác dụng của trọng lực làm chậm chuyển động, vận tốc v giảm dần nên động năng W_đ = \\frac{1}{2}mv^2 giảm dần. Động năng đã chuyển hóa hoàn toàn thành thế năng tại vị trí cao nhất (v = 0).',
      formulas: [
        'W_t = mgh \\quad (J)',
        'W_đ = \\frac{1}{2}mv^2 \\quad (J)',
        'W = W_đ + W_t = \\text{hằng số}'
      ],
      sgkSummary: 'Trong quá trình chuyển động trong trọng trường, nếu chỉ chịu tác dụng của trọng lực thì động năng và thế năng có thể chuyển hóa qua lại lẫn nhau, nhưng tổng cơ năng W luôn được bảo toàn.'
    },

    'ly3.html': {
      title: 'Vật Lý 9 - Hiện Tượng Khúc Xạ Ánh Sáng',
      category: 'physics',
      question: 'Chiếu một tia sáng từ không khí (chiết suất n₁ ≈ 1.0) vào một khối nước trong suốt (chiết suất n₂ ≈ 1.33) với góc tới i = 45°. Góc khúc xạ r trong nước sẽ có độ lớn như thế nào so với góc tới i?',
      options: [
        'A. r > i (Tia khúc xạ lệch xa pháp tuyến hơn).',
        'B. r = i (Tia sáng truyền thẳng không bị đổi hướng).',
        'C. r < i (Tia khúc xạ lệch lại gần pháp tuyến hơn).',
        'D. r = 90° (Tia sáng đi sát mặt phân cách).'
      ],
      correctIndex: 2,
      explanation: 'Ánh sáng truyền từ môi trường chiết quang kém (không khí) sang môi trường chiết quang hơn (nước) nên vận tốc ánh sáng giảm xuống. Theo định luật khúc xạ ánh sáng (Snell), tỉ số \\frac{\\sin i}{\\sin r} = \\frac{n_2}{n_1} > 1 \\implies \\sin r < \\sin i \\implies r < i.',
      formulas: [
        'n_1 \\sin i = n_2 \\sin r',
        '\\sin r = \\frac{n_1}{n_2} \\sin i \\implies r \\approx 32.1° < 45°'
      ],
      sgkSummary: 'Hiện tượng khúc xạ ánh sáng là hiện tượng tia sáng bị gãy khúc tại mặt phân cách giữa hai môi trường trong suốt khác nhau. Khi truyền từ không khí vào nước thì tia khúc xạ nằm trong mặt phẳng tới và góc khúc xạ r nhỏ hơn góc tới i.'
    },

    'ly4.html': {
      title: 'Vật Lý 9 - Thấu Kính Hội Tụ & Tạo Ảnh',
      category: 'physics',
      question: 'Đặt một ngọn nến vuông góc với trục chính của thấu kính hội tụ có tiêu cự f = 12 cm, cách thấu kính một khoảng d = 24 cm (đúng bằng d = 2f). Ảnh thu được trên màn chắn có tính chất gì?',
      options: [
        'A. Ảnh ảo, cùng chiều và lớn hơn vật.',
        'B. Ảnh thật, ngược chiều và có kích thước bằng đúng vật (k = -1).',
        'C. Ảnh thật, cùng chiều và nhỏ hơn vật.',
        'D. Không hứng được ảnh trên màn.'
      ],
      correctIndex: 1,
      explanation: 'Áp dụng công thức thấu kính: \\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d\'} \\implies \\frac{1}{d\'} = \\frac{1}{12} - \\frac{1}{24} = \\frac{1}{24} \\implies d\' = 24\\text{ cm} > 0 (ảnh thật hứng được trên màn). Độ phóng đại k = -\\frac{d\'}{d} = -\\frac{24}{24} = -1 (ngược chiều và cao bằng vật).',
      formulas: [
        '\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d\'}',
        'd\' = \\frac{d \\cdot f}{d - f} = 24\\text{ cm}',
        'k = -\\frac{d\'}{d} = -1'
      ],
      sgkSummary: 'Vật đặt ngoài khoảng tiêu cự của thấu kính hội tụ luôn cho ảnh thật ngược chiều với vật. Đặc biệt khi d = 2f, ảnh thật cách thấu kính d\' = 2f và có kích thước bằng đúng vật.'
    },

    'ly5.html': {
      title: 'Vật Lý 9 - Thấu Kính Phân Kỳ',
      category: 'physics',
      question: 'Đặt một ngọn nến sáng trước một thấu kính phân kỳ tại mọi vị trí ngoài hoặc trong tiêu cự. Ảnh của ngọn nến quan sát được qua thấu kính luôn có đặc điểm gì?',
      options: [
        'A. Luôn là ảnh thật, ngược chiều và phóng to.',
        'B. Luôn là ảnh ảo, cùng chiều, nhỏ hơn vật và nằm trong khoảng tiêu cự.',
        'C. Luôn là ảnh ảo, cùng chiều và lớn hơn vật.',
        'D. Ảnh bị lộn ngược và hứng được trên màn hứng phía sau.'
      ],
      correctIndex: 1,
      explanation: 'Thấu kính phân kỳ làm phân kỳ chùm tia tới song song thành chùm tia ló có đường kéo dài đi qua tiêu điểm F. Do các đường kéo dài cắt nhau ở phía trước thấu kính, ảnh tạo bởi thấu kính phân kỳ luôn là ảnh ảo (d\' < 0), cùng chiều, nhỏ hơn vật (|d\'| < d) và luôn nằm trong khoảng tiêu cự.',
      formulas: [
        '\\frac{1}{-|f|} = \\frac{1}{d} + \\frac{1}{d\'} \\implies d\' = -\\frac{d \\cdot |f|}{d + |f|} < 0',
        '|d\'| < |f| \\quad (\\text{luôn nằm trong khoảng tiêu cự})'
      ],
      sgkSummary: 'Thấu kính phân kỳ luôn cho ảnh ảo, cùng chiều và nhỏ hơn vật tại mọi khoảng cách d > 0. Ảnh ảo này không hứng được trên màn chắn mà chỉ quan sát được bằng mắt.'
    },

    'ly6.html': {
      title: 'Vật Lý 9 - Định Luật Ôm Cho Đoạn Mạch',
      category: 'physics',
      question: 'Đặt một hiệu điện thế U = 12 V vào hai đầu điện trở R = 24 Ω. Cường độ dòng điện I đo được là bao nhiêu? Nếu tăng hiệu điện thế U lên gấp đôi (24 V) thì I sẽ thay đổi thế nào?',
      options: [
        'A. I = 0.5 A; khi U tăng gấp đôi thì I tăng gấp đôi lên 1.0 A.',
        'B. I = 2.0 A; khi U tăng gấp đôi thì I giảm một nửa.',
        'C. I = 0.5 A; khi U tăng thì I giữ nguyên không đổi.',
        'D. I = 288 A; cường độ dòng điện tỉ lệ nghịch với hiệu điện thế.'
      ],
      correctIndex: 0,
      explanation: 'Theo định luật Ôm: I = \\frac{U}{R} = \\frac{12}{24} = 0.5\\text{ A}. Vì điện trở R của dây dẫn không đổi, cường độ dòng điện I tỉ lệ thuận với hiệu điện thế U. Do đó khi U tăng gấp đôi lên 24 V thì I = \\frac{24}{24} = 1.0\\text{ A} (tăng gấp đôi).',
      formulas: [
        'I = \\frac{U}{R} \\quad (A)',
        'U = I \\cdot R \\quad (V)',
        'R = \\frac{U}{I} = \\text{hằng số} \\quad (\\Omega)'
      ],
      sgkSummary: 'Định luật Ôm: Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế đặt vào hai đầu dây và tỉ lệ nghịch với điện trở của dây.'
    },

    'ly7.html': {
      title: 'Vật Lý 9 - Đoạn Mạch Nối Tiếp & Song Song',
      category: 'physics',
      question: 'Có hai điện trở R₁ = 10 Ω và R₂ = 20 Ω. Tính điện trở tương đương khi mắc nối tiếp (R_nt) và khi mắc song song (R_ss):',
      options: [
        'A. R_nt = 30 Ω; R_ss ≈ 6.67 Ω.',
        'B. R_nt = 15 Ω; R_ss = 30 Ω.',
        'C. R_nt = 10 Ω; R_ss = 20 Ω.',
        'D. R_nt = 30 Ω; R_ss = 30 Ω.'
      ],
      correctIndex: 0,
      explanation: 'Khi mắc nối tiếp: R_{nt} = R_1 + R_2 = 10 + 20 = 30\\ \\Omega. Khi mắc song song: \\frac{1}{R_{ss}} = \\frac{1}{R_1} + \\frac{1}{R_2} = \\frac{1}{10} + \\frac{1}{20} = \\frac{3}{20} \\implies R_{ss} = \\frac{20}{3} \\approx 6.67\\ \\Omega (nhỏ hơn từng điện trở thành phần).',
      formulas: [
        '\\text{Nối tiếp: } R_{tđ} = R_1 + R_2 + ... + R_n',
        '\\text{Song song: } \\frac{1}{R_{tđ}} = \\frac{1}{R_1} + \\frac{1}{R_2} \\implies R_{tđ} = \\frac{R_1 R_2}{R_1 + R_2}'
      ],
      sgkSummary: 'Đoạn mạch nối tiếp có điện trở tương đương lớn hơn từng điện trở thành phần. Đoạn mạch song song có điện trở tương đương nhỏ hơn mỗi điện trở thành phần.'
    },

    'ly8.html': {
      title: 'Vật Lý 9 - Cảm Ứng Điện Từ & Định Luật Faraday',
      category: 'physics',
      question: 'Khi di chuyển cực Bắc (N) của thanh nam châm lại gần một cuộn dây dẫn kín nối với kim điện kế, hiện tượng gì xảy ra?',
      options: [
        'A. Kim điện kế đứng yên bất động.',
        'B. Kim điện kế bị lệch khỏi vạch số 0 chứng tỏ có dòng điện cảm ứng xuất hiện.',
        'C. Cuộn dây bị nóng đỏ bốc cháy.',
        'D. Nam châm bị hút dính chặt và mất từ tính.'
      ],
      correctIndex: 1,
      explanation: 'Khi đưa nam châm lại gần cuộn dây, số đường sức từ xuyên qua tiết diện cuộn dây tăng lên (từ thông \\Phi biến thiên). Theo định luật cảm ứng điện từ Faraday, sự biến thiên từ thông sinh ra suất điện động cảm ứng e_c = -N \\frac{\\Delta\\Phi}{\\Delta t}, tạo thành dòng điện cảm ứng làm lệch kim điện kế.',
      formulas: [
        '\\Phi = B \\cdot S \\cdot \\cos\\alpha \\quad (Wb)',
        'e_c = -N \\frac{\\Delta\\Phi}{\\Delta t} \\quad (V)',
        'i_c = \\frac{e_c}{R}'
      ],
      sgkSummary: 'Hiện tượng cảm ứng điện từ: Dòng điện xuất hiện trong cuộn dây dẫn kín khi số đường sức từ xuyên qua tiết diện của cuộn dây đó biến thiên. Chiều dòng điện tuân theo định luật Len-xơ chống lại nguyên nhân sinh ra nó.'
    },

    // --- HÓA HỌC ---
    'hoa1.html': {
      title: 'Hóa Học 9 - Tính Chất Vật Lý Của Kim Loại',
      category: 'chemistry',
      question: 'Trong tất cả các kim loại thường gặp, kim loại nào có khả năng dẫn điện và dẫn nhiệt tốt nhất?',
      options: [
        'A. Đồng (Cu).',
        'B. Bạc (Ag).',
        'C. Nhôm (Al).',
        'D. Sắt (Fe).'
      ],
      correctIndex: 1,
      explanation: 'Bạc (Ag) là kim loại dẫn điện và dẫn nhiệt tốt nhất. Thứ tự dẫn điện giảm dần của các kim loại phổ biến là: Bạc (Ag) > Đồng (Cu) > Vàng (Au) > Nhôm (Al) > Sắt (Fe). Trên thực tế dây điện dùng Đồng và Nhôm vì giá thành rẻ hơn Bạc rất nhiều.',
      formulas: [
        '\\text{Thứ tự dẫn điện/nhiệt: } \\text{Ag} > \\text{Cu} > \\text{Au} > \\text{Al} > \\text{Fe}'
      ],
      sgkSummary: 'Kim loại có tính dẻo, tính dẫn điện, tính dẫn nhiệt và ánh kim. Các tính chất vật lý chung này do các electron tự do trong mạng tinh thể kim loại quyết định.'
    },

    'hoa2.html': {
      title: 'Hóa Học 9 - Dãy Hoạt Động Hóa Học Của Kim Loại',
      category: 'chemistry',
      question: 'Ngâm một chiếc đinh sắt (Fe) sạch vào ống nghiệm chứa dung dịch đồng(II) sunfat (CuSO₄) màu xanh lam. Hiện tượng quan sát được sau một thời gian là gì?',
      options: [
        'A. Không có phản ứng hóa học xảy ra.',
        'B. Có lớp kim loại màu đỏ bám trên đinh sắt, màu xanh lam của dung dịch nhạt dần.',
        'C. Sủi bọt khí không màu mùi hắc mãnh liệt.',
        'D. Xuất hiện kết tủa màu vàng tươi lắng xuống.'
      ],
      correctIndex: 1,
      explanation: 'Trong dãy hoạt động hóa học, Sắt đứng trước Đồng (Fe > Cu) nên Sắt có tính khử mạnh hơn, đẩy được ion Cu²⁺ ra khỏi dung dịch muối: Fe + CuSO₄ -> FeSO₄ + Cu↓. Kim loại Đồng sinh ra có màu đỏ bám ngoài đinh sắt; ion Cu²⁺ màu xanh lam bị khử làm màu dung dịch nhạt dần chuyển sang màu lục rất nhạt của Fe²⁺.',
      formulas: [
        '\\text{Fe} + \\text{CuSO}_4 \\longrightarrow \\text{FeSO}_4 + \\text{Cu}\\downarrow\\text{ (đỏ)}',
        '\\text{Fe} + \\text{Cu}^{2+} \\longrightarrow \\text{Fe}^{2+} + \\text{Cu}\\downarrow'
      ],
      sgkSummary: 'Dãy hoạt động hóa học của kim loại: K > Na > Ca > Mg > Al > Zn > Fe > Pb > (H) > Cu > Ag > Au. Kim loại đứng trước (trừ K, Na, Ca, Ba) đẩy được kim loại đứng sau ra khỏi dung dịch muối.'
    },

    'hoa3.html': {
      title: 'Hóa Học 9 - Kim Loại Tác Dụng Với Axit',
      category: 'chemistry',
      question: 'Cho viên Kẽm (Zn) vào ống nghiệm chứa dung dịch axit clohiđric (HCl). Đưa que đóm đang cháy lại gần miệng ống nghiệm thì có hiện tượng gì?',
      options: [
        'A. Viên kẽm tan sủi bọt khí; khí sinh ra cháy kèm tiếng nổ "bốp!" đặc trưng của Hidro.',
        'B. Dung dịch đổi sang màu đen và que diêm tắt lịm.',
        'C. Xuất hiện kết tủa trắng không tan.',
        'D. Không có hiện tượng vì Kẽm không tan trong axit HCl.'
      ],
      correctIndex: 0,
      explanation: 'Kẽm đứng trước Hiđro trong dãy hoạt động hóa học nên tác dụng mãnh liệt với axit HCl giải phóng khí Hiđro (H₂): Zn + 2HCl -> ZnCl₂ + H₂↑. Khí H₂ thu được ở miệng ống nghiệm kết hợp với Oxi trong không khí tạo hỗn hợp nổ nhẹ phát ra tiếng nổ "bốp!": 2H₂ + O₂ -> 2H₂O.',
      formulas: [
        '\\text{Zn} + 2\\text{HCl} \\longrightarrow \\text{ZnCl}_2 + \\text{H}_2\\uparrow',
        '2\\text{H}_2 + \\text{O}_2 \\xrightarrow{t^\\circ} 2\\text{H}_2\\text{O}'
      ],
      sgkSummary: 'Các kim loại đứng trước Hiđro trong dãy hoạt động tác dụng được với dung dịch axit loãng (HCl, H₂SO₄ loãng) giải phóng khí Hiđro (H₂) và tạo thành muối.'
    },

    'hoa4.html': {
      title: 'Hóa Học 9 - Axit Tác Dụng Với Bazơ (Phản Ứng Trung Hòa)',
      category: 'chemistry',
      question: 'Nhỏ vài giọt phenolphtalein vào dung dịch NaOH thấy dung dịch hóa hồng. Sau đó nhỏ từ từ từng giọt dung dịch axit HCl vào khuấy đều đến khi axit dư. Hiện tượng quan sát được là:',
      options: [
        'A. Dung dịch chuyển sang màu hồng đậm hơn.',
        'B. Xuất hiện kết tủa màu nâu đỏ lắng xuống.',
        'C. Màu hồng của dung dịch nhạt dần rồi mất màu hoàn toàn trở lại trong suốt.',
        'D. Dung dịch chuyển sang màu xanh lam đậm.'
      ],
      correctIndex: 2,
      explanation: 'Phản ứng trung hòa diễn ra: NaOH + HCl -> NaCl + H₂O. Khi axit HCl trung hòa hết lượng ion OH⁻ trong bazơ đưa pH về 7 (hoặc pH < 7 khi axit dư), môi trường kiềm bị triệt tiêu khiến chỉ thị phenolphtalein mất màu hồng và dung dịch trở lại trong suốt.',
      formulas: [
        '\\text{NaOH} + \\text{HCl} \\longrightarrow \\text{NaCl} + \\text{H}_2\\text{O}',
        '\\text{H}^+ + \\text{OH}^- \\longrightarrow \\text{H}_2\\text{O} \\quad (\\Delta H < 0)'
      ],
      sgkSummary: 'Phản ứng giữa dung dịch axit và bazơ là phản ứng trung hòa, tạo thành muối và nước. Hiện tượng đổi màu của chất chỉ thị (quỳ tím, phenolphtalein) chứng minh sự thay đổi pH của dung dịch.'
    },

    'hoa5.html': {
      title: 'Hóa Học 9 - Phản Ứng Trao Đổi Trong Dung Dịch',
      category: 'chemistry',
      question: 'Nhỏ vài giọt dung dịch Bari clorua (BaCl₂) vào ống nghiệm chứa dung dịch Axit sunfuric (H₂SO₄). Hiện tượng quan sát được là:',
      options: [
        'A. Xuất hiện kết tủa trắng sữa dày đặc không tan trong axit dư.',
        'B. Sủi bọt khí màu vàng lục có mùi hắc.',
        'C. Xuất hiện kết tủa màu đỏ gạch.',
        'D. Dung dịch đổi sang màu xanh thẫm.'
      ],
      correctIndex: 0,
      explanation: 'Phản ứng trao đổi ion xảy ra tức thì giữa ion Ba²⁺ và SO₄²⁻ tạo ra kết tủa Bari sunfat (BaSO₄) màu trắng sữa: BaCl₂ + H₂SO₄ -> BaSO₄↓ + 2HCl. Kết tủa BaSO₄ có độ tan cực kỳ nhỏ và hoàn toàn không tan trong axit mạnh như HCl, HNO₃ dư.',
      formulas: [
        '\\text{BaCl}_2 + \\text{H}_2\\text{SO}_4 \\longrightarrow \\text{BaSO}_4\\downarrow\\text{ (trắng)} + 2\\text{HCl}',
        '\\text{Ba}^{2+} + \\text{SO}_4^{2-} \\longrightarrow \\text{BaSO}_4\\downarrow'
      ],
      sgkSummary: 'Phản ứng trao đổi trong dung dịch các chất điện li chỉ xảy ra khi có ít nhất một trong các điều kiện sau: tạo thành chất kết tủa, tạo thành chất bay hơi (khí), hoặc tạo thành chất điện li yếu (nước).'
    },

    'hoa6.html': {
      title: 'Hóa Học 9 - Tính Chất Hóa Học Của Bazơ',
      category: 'chemistry',
      question: 'Cho dung dịch NaOH vào dung dịch CuSO₄ thu được kết tủa xanh lam Cu(OH)₂. Lọc lấy kết tủa này rồi nung nóng trên ngọn lửa đèn cồn thì kết tủa chuyển thành màu gì?',
      options: [
        'A. Chuyển sang màu đỏ gạch.',
        'B. Chuyển sang màu đen của Đồng(II) oxit (CuO).',
        'C. Giữ nguyên màu xanh lam không đổi.',
        'D. Chuyển sang màu trắng đục.'
      ],
      correctIndex: 1,
      explanation: 'Ban đầu tạo kết tủa xanh lam: CuSO₄ + 2NaOH -> Cu(OH)₂↓ + Na₂SO₄. Khi nung nóng, bazơ không tan Cu(OH)₂ bị nhiệt phân hủy thành oxit bazơ tương ứng là Đồng(II) oxit màu đen và hơi nước: Cu(OH)₂ -> CuO + H₂O.',
      formulas: [
        '\\text{CuSO}_4 + 2\\text{NaOH} \\longrightarrow \\text{Cu(OH)}_2\\downarrow\\text{ (xanh)} + \\text{Na}_2\\text{SO}_4',
        '\\text{Cu(OH)}_2 \\xrightarrow{t^\\circ} \\text{CuO (đen)} + \\text{H}_2\\text{O}'
      ],
      sgkSummary: 'Các bazơ không tan (như Cu(OH)₂, Fe(OH)₃, Al(OH)₃) bị nhiệt phân hủy ở nhiệt độ cao tạo thành oxit bazơ và nước, trong khi các bazơ kiềm tan (NaOH, KOH) không bị nhiệt phân hủy.'
    },

    'hoa7.html': {
      title: 'Hóa Học 9 - Điều Chế & Thử Tính Chất Khí Oxi',
      category: 'chemistry',
      question: 'Nung nóng tinh thể thuốc tím (KMnO₄) trong ống nghiệm rồi thu khí oxi sinh ra vào bình tam giác. Đưa que đóm còn tàn đỏ vào miệng bình thì hiện tượng gì xảy ra?',
      options: [
        'A. Que đóm bùng cháy sáng dữ dội.',
        'B. Que đóm tắt ngay lập tức.',
        'C. Bình khí phát nổ mạnh.',
        'D. Que đóm cháy với ngọn lửa màu xanh nhạt.'
      ],
      correctIndex: 0,
      explanation: 'Thuốc tím bị nhiệt phân sinh ra khí oxi: 2KMnO₄ -> K₂MnO₄ + MnO₂ + O₂↑. Khí Oxi duy trì sự cháy rất mạnh, khi gặp que đóm còn tàn than hồng (C), phản ứng C + O₂ -> CO₂ tỏa nhiệt lớn làm ngọn lửa bùng cháy rực rỡ.',
      formulas: [
        '2\\text{KMnO}_4 \\xrightarrow{t^\\circ} \\text{K}_2\\text{MnO}_4 + \\text{MnO}_2 + \\text{O}_2\\uparrow',
        '\\text{C} + \\text{O}_2 \\xrightarrow{t^\\circ} \\text{CO}_2 \\quad (\\Delta H < 0)'
      ],
      sgkSummary: 'Khí oxi là đơn chất không màu, không mùi, ít tan trong nước, nặng hơn không khí và có tính chất đặc trưng là duy trì sự sống và duy trì sự cháy mãnh liệt.'
    },

    'hoa8.html': {
      title: 'Hóa Học 9 - Các Yếu Tố Ảnh Hưởng Đến Tốc Độ Phản Ứng',
      category: 'chemistry',
      question: 'Cho cùng một khối lượng đá vôi (CaCO₃) phản ứng với cùng thể tích dung dịch axit HCl 1M. Trường hợp nào phản ứng xảy ra nhanh nhất và sủi bọt khí CO₂ mãnh liệt nhất?',
      options: [
        'A. Dùng đá vôi dạng khối lớn ở nhiệt độ phòng.',
        'B. Dùng đá vôi nghiền thành bột mịn và đun nóng nhẹ dung dịch.',
        'C. Làm lạnh dung dịch axit xuống gần 0°C.',
        'D. Thêm nước cất vào để pha loãng dung dịch axit.'
      ],
      correctIndex: 1,
      explanation: 'Nghiền mịn làm tăng diện tích bề mặt tiếp xúc giữa CaCO₃ và ion H⁺; đun nóng làm tăng động năng và tần số va chạm hiệu quả giữa các phân tử. Cả hai yếu tố cùng làm tốc độ phản ứng v tăng lên cực đại.',
      formulas: [
        '\\text{CaCO}_3 + 2\\text{HCl} \\longrightarrow \\text{CaCl}_2 + \\text{CO}_2\\uparrow + \\text{H}_2\\text{O}',
        'v = k [\\text{HCl}]^2 \\quad (\\text{tăng theo diện tích bề mặt và nhiệt độ})'
      ],
      sgkSummary: 'Tốc độ phản ứng hóa học phụ thuộc vào: diện tích tiếp xúc của các chất, nhiệt độ, nồng độ các chất phản ứng, áp suất (với chất khí) và sự có mặt của chất xúc tác.'
    },

    'hoa9.html': {
      title: 'Hóa Học 9 - Hợp Chất Hữu Cơ: Mêtan & Rượu Etylic',
      category: 'chemistry',
      question: 'Đốt cháy hoàn toàn một lượng rượu etylic (C₂H₅OH) rồi dẫn sản phẩm cháy qua cốc đựng dung dịch nước vôi trong dư (Ca(OH)₂). Hiện tượng quan sát được là:',
      options: [
        'A. Nước vôi trong xuất hiện kết tủa trắng đục (CaCO₃).',
        'B. Nước vôi trong chuyển sang màu hồng tím.',
        'C. Không có hiện tượng vì phản ứng cháy chỉ sinh ra nước.',
        'D. Cốc nước vôi trong chuyển sang màu đen.'
      ],
      correctIndex: 0,
      explanation: 'Rượu etylic cháy sinh ra khí cacbonic (CO₂) và hơi nước: C₂H₅OH + 3O₂ -> 2CO₂ + 3H₂O. Khi khí CO₂ sục vào nước vôi trong dư, phản ứng tạo kết tủa trắng canxi cacbonat: CO₂ + Ca(OH)₂ -> CaCO₃↓ + H₂O.',
      formulas: [
        '\\text{C}_2\\text{H}_5\\text{OH} + 3\\text{O}_2 \\xrightarrow{t^\\circ} 2\\text{CO}_2 + 3\\text{H}_2\\text{O}',
        '\\text{CO}_2 + \\text{Ca(OH)}_2 \\longrightarrow \\text{CaCO}_3\\downarrow\\text{ (trắng)} + \\text{H}_2\\text{O}'
      ],
      sgkSummary: 'Rượu etylic là hợp chất hữu cơ dễ cháy, cháy với ngọn lửa màu xanh tỏa nhiều nhiệt và sinh ra khí cacbonic cùng nước. Phản ứng làm đục nước vôi trong dùng để nhận biết sản phẩm chứa cacbon.'
    },

    // --- SINH HỌC ---
    'sinh1.html': {
      title: 'Sinh Học 9 - Menđen & Lai Một Cặp Tính Trạng',
      category: 'biology',
      question: 'Cho cây đậu Hà Lan thuần chủng hạt vàng (AA) lai với hạt xanh (aa), thu được F₁ toàn hạt vàng (Aa). Cho các cây F₁ tự thụ phấn, tỉ lệ phân li kiểu hình hạt ở thế hệ F₂ là:',
      options: [
        'A. 1 hạt vàng : 1 hạt xanh.',
        'B. 3 hạt vàng : 1 hạt xanh (75% vàng : 25% xanh).',
        'C. 100% hạt vàng.',
        'D. 9 hạt vàng : 7 hạt xanh.'
      ],
      correctIndex: 1,
      explanation: 'Cơ thể F₁ có kiểu gen dị hợp Aa cho 2 loại giao tử với tỉ lệ 1A : 1a. Khi tự thụ phấn (Aa × Aa), tổ hợp giao tử ở F₂ cho tỉ lệ kiểu gen là 1AA : 2Aa : 1aa, tương ứng với kiểu hình là 3 hạt vàng : 1 hạt xanh.',
      formulas: [
        'P: AA \\times aa \\implies F_1: Aa \\text{ (100\\% Vàng)}',
        'F_1 \\times F_1: Aa \\times Aa \\implies F_2: 1AA : 2Aa : 1aa',
        '\\text{Tỉ lệ kiểu hình } F_2: 3\\text{ Vàng} : 1\\text{ Xanh}'
      ],
      sgkSummary: 'Quy luật phân li của Menđen: Trong quá trình phát sinh giao tử, mỗi nhân tố di truyền trong cặp nhân tố di truyền phân li về một giao tử và giữ nguyên bản chất như ở cơ thể thuần chủng của P.'
    },

    'sinh2.html': {
      title: 'Sinh Học 9 - Lai Hai Cặp Tính Trạng & Phân Li Độc Lập',
      category: 'biology',
      question: 'Menđen lai hai thứ đậu Hà Lan thuần chủng hạt vàng, trơn (AABB) với hạt xanh, nhăn (aabb), được F₁ toàn hạt vàng, trơn (AaBb). Cho F₁ tự thụ phấn, tỉ lệ phân li kiểu hình ở F₂ là:',
      options: [
        'A. 9 vàng, trơn : 3 vàng, nhăn : 3 xanh, trơn : 1 xanh, nhăn.',
        'B. 3 vàng, trơn : 1 xanh, nhăn.',
        'C. 1 : 1 : 1 : 1.',
        'D. 15 vàng, trơn : 1 xanh, nhăn.'
      ],
      correctIndex: 0,
      explanation: 'Do hai cặp gen nằm trên các cặp NST tương đồng khác nhau nên chúng phân li độc lập. Tỉ lệ kiểu hình chung bằng tích tỉ lệ của các cặp tính trạng riêng rẽ: (3 Vàng : 1 Xanh)(3 Trơn : 1 Nhăn) = 9 Vàng, trơn : 3 Vàng, nhăn : 3 Xanh, trơn : 1 Xanh, nhăn.',
      formulas: [
        'F_1: AaBb \\implies 4\\text{ loại giao tử: } 1AB : 1Ab : 1aB : 1ab',
        'F_2 = (3A\\_ : 1aa)(3B\\_ : 1bb) = 9A\\_B\\_ : 3A\\_bb : 3aaB\\_ : 1aabb'
      ],
      sgkSummary: 'Quy luật phân li độc lập: Khi lai hai bố mẹ thuần chủng khác nhau về hai cặp tính trạng tương phản thì sự di truyền của cặp tính trạng này không phụ thuộc vào sự di truyền của cặp tính trạng kia.'
    },

    'sinh3.html': {
      title: 'Sinh Học 9 - Quá Trình Nguyên Phân',
      category: 'biology',
      question: 'Trong các kỳ của quá trình nguyên phân, các nhiễm sắc thể (NST) đóng xoắn cực đại và xếp thành một hàng trên mặt phẳng xích đạo của thoi vô sắc ở kỳ nào?',
      options: [
        'A. Kỳ đầu.',
        'B. Kỳ giữa.',
        'C. Kỳ sau.',
        'D. Kỳ cuối.'
      ],
      correctIndex: 1,
      explanation: 'Ở kỳ giữa (Metaphase), các NST kép co xoắn cực đại và có hình thái rõ nét nhất, tập trung thành một hàng trên mặt phẳng xích đạo. Đây là thời điểm thích hợp nhất để quan sát và đếm bộ NST của loài dưới kính hiển vi.',
      formulas: [
        '\\text{Kỳ giữa: } 2n\\text{ NST kép}',
        '\\text{Kết quả nguyên phân: } 1\\text{ TB } (2n) \\longrightarrow 2\\text{ TB con } (2n)'
      ],
      sgkSummary: 'Nguyên phân là phương thức sinh sản của tế bào, giúp cơ thể lớn lên và tái sinh mô. Kết quả tạo ra 2 tế bào con có bộ nhiễm sắc thể giống nhau và giống hệt tế bào mẹ.'
    },

    'sinh4.html': {
      title: 'Sinh Học 9 - Quá Trình Giảm Phân Tạo Giao Tử',
      category: 'biology',
      question: 'Từ 1 tế bào sinh dục chín có bộ nhiễm sắc thể lưỡng bội (2n), sau 2 lần phân bào liên tiếp của giảm phân sẽ tạo ra:',
      options: [
        'A. 2 tế bào con có bộ NST 2n.',
        'B. 4 tế bào con (giao tử) có bộ NST giảm đi một nửa (n).',
        'C. 4 tế bào con giữ nguyên bộ NST 2n.',
        'D. 1 tế bào duy nhất có bộ NST 4n.'
      ],
      correctIndex: 1,
      explanation: 'Giảm phân gồm 2 lần phân bào liên tiếp nhưng NST chỉ nhân đôi 1 lần ở kì trung gian trước giảm phân I. Vì vậy kết thúc giảm phân tạo ra 4 tế bào con đơn bội (n), số lượng NST giảm đi một nửa so với tế bào mẹ ban đầu.',
      formulas: [
        '2n \\xrightarrow{\\text{Nhân đôi}} 2n\\text{ kép} \\xrightarrow{\\text{GP I}} 2 \\text{ TB } (n\\text{ kép}) \\xrightarrow{\\text{GP II}} 4 \\text{ TB } (n\\text{ đơn})'
      ],
      sgkSummary: 'Giảm phân là sự phân chia của tế bào sinh dục ở thời kì chín, qua 2 lần phân bào liên tiếp tạo ra 4 tế bào con có bộ nhiễm sắc thể đơn bội (n).'
    },

    'sinh5.html': {
      title: 'Sinh Học 9 - Cấu Trúc & Tự Nhân Đôi Của ADN',
      category: 'biology',
      question: 'Theo nguyên tắc bổ sung trong chuỗi xoắn kép ADN (Mô hình Oát-xơn & Cric), các nuclêôtit giữa hai mạch đơn liên kết với nhau như thế nào?',
      options: [
        'A. A liên kết với X, G liên kết với T.',
        'B. A liên kết với T bằng 2 liên kết hiđro; G liên kết với X bằng 3 liên kết hiđro.',
        'C. A liên kết với G, T liên kết với X.',
        'D. Các nuclêôtit gắn ngẫu nhiên không có quy tắc.'
      ],
      correctIndex: 1,
      explanation: 'Các bazơ nitơ purin có kích thước lớn liên kết đặc hiệu với pirimiđin có kích thước nhỏ qua cầu liên kết hiđro: A liên kết với T bằng 2 liên kết hiđro (A = T), G liên kết với X bằng 3 liên kết hiđro (G ≡ X).',
      formulas: [
        'A = T, \\quad G = X',
        'N = 2A + 2G = 2T + 2X',
        'L = \\frac{N}{2} \\cdot 3.4\\text{ \\AA}, \\quad H = 2A + 3G'
      ],
      sgkSummary: 'Phân tử ADN có cấu trúc xoắn kép gồm hai mạch song song ngược chiều liên kết theo nguyên tắc bổ sung. Quá trình nhân đôi diễn ra theo nguyên tắc bán bảo toàn và nguyên tắc bổ sung.'
    },

    'sinh6.html': {
      title: 'Sinh Học 9 - Quá Trình Phiên Mã (Tổng Hợp ARN)',
      category: 'biology',
      question: 'Trong quá trình phiên mã tổng hợp mARN từ mạch khuôn ADN, nuclêôtit loại Ađênin (A) trên mạch khuôn của gen sẽ liên kết bổ sung với nuclêôtit loại nào của môi trường?',
      options: [
        'A. Timin (T).',
        'B. Uraxin (U).',
        'C. Guanin (G).',
        'D. Xitôzin (X).'
      ],
      correctIndex: 1,
      explanation: 'Trong phân tử ARN không có Timin (T) mà được thay thế bằng Uraxin (U). Vì vậy khi enzim ARN pôlimeaza tổng hợp mARN: A(khuôn) liên kết với U(môi trường), T(khuôn) liên kết với A, G liên kết với X, và X liên kết với G.',
      formulas: [
        'A_{\\text{khuôn}} - U_{\\text{ARN}}, \\quad T_{\\text{khuôn}} - A_{\\text{ARN}}',
        'G_{\\text{khuôn}} - X_{\\text{ARN}}, \\quad X_{\\text{khuôn}} - G_{\\text{ARN}}'
      ],
      sgkSummary: 'Phiên mã là quá trình truyền thông tin di truyền từ mạch khuôn ADN sang phân tử mARN diễn ra trong nhân tế bào theo nguyên tắc bổ sung.'
    },

    'sinh7.html': {
      title: 'Sinh Học 9 - Quá Trình Dịch Mã (Tổng Hợp Prôtêin)',
      category: 'biology',
      question: 'Quá trình dịch mã tổng hợp chuỗi pôlipeptit diễn ra tại bào quan nào trong tế bào chất?',
      options: [
        'A. Ribôxôm.',
        'B. Ti thể.',
        'C. Nhân con.',
        'D. Bộ máy Gôngi.'
      ],
      correctIndex: 0,
      explanation: 'Ribôxôm là nhà máy dịch mã của tế bào. Ribôxôm trượt dọc theo phân tử mARN theo chiều 5\' -> 3\', đọc từng bộ ba mã sao (côđon) để đối mã với các tARN mang axit amin tương ứng, gắn các axit amin lại bằng liên kết peptit.',
      formulas: [
        '\\text{Số aa chuỗi hoàn chỉnh} = \\frac{N_{mARN}}{3} - 2 = \\frac{N_{ADN}}{6} - 2'
      ],
      sgkSummary: 'Bản chất mối quan hệ: Gen (ADN) -> mARN -> Prôtêin -> Tính trạng. Trình tự nuclêôtit trên gen quy định trình tự axit amin trong prôtêin biểu hiện thành tính trạng cơ thể.'
    },

    'sinh8.html': {
      title: 'Sinh Học 9 - Đột Biến Gen',
      category: 'biology',
      question: 'Các dạng đột biến điểm liên quan đến một cặp nuclêôtit trong cấu trúc của gen gồm:',
      options: [
        'A. Mất, thêm, hoặc thay thế một cặp nuclêôtit.',
        'B. Mất đoạn, lặp đoạn, đảo đoạn nhiễm sắc thể.',
        'C. Đa bội hóa toàn bộ bộ NST.',
        'D. Chuyển đoạn tương hỗ.'
      ],
      correctIndex: 0,
      explanation: 'Đột biến điểm là đột biến xảy ra tại 1 cặp nucleotit gồm 3 dạng: mất 1 cặp nu, thêm 1 cặp nu (gây dịch khung đọc mã), hoặc thay thế 1 cặp nu (chỉ làm thay đổi tối đa 1 axit amin hoặc giữ nguyên do tính thoái hóa của mã di truyền).',
      formulas: [
        '\\text{Dạng đột biến: Mất 1 cặp } (N - 2), \\text{ Thêm 1 cặp } (N + 2), \\text{ Thay thế 1 cặp } (N \\text{ không đổi})'
      ],
      sgkSummary: 'Đột biến gen là những biến đổi trong cấu trúc của gen liên quan tới một hoặc một số cặp nuclêôtit, làm xuất hiện các alen mới cung cấp nguyên liệu cho tiến hóa và chọn giống.'
    },

    'sinh9.html': {
      title: 'Sinh Học 9 - Đột Biến Cấu Trúc Nhiễm Sắc Thể',
      category: 'biology',
      question: 'Hiện tượng một đoạn nhiễm sắc thể bị đứt ra rồi quay 180° gắn lại vào vị trí cũ thuộc dạng đột biến cấu trúc NST nào?',
      options: [
        'A. Mất đoạn.',
        'B. Đảo đoạn nhiễm sắc thể.',
        'C. Lặp đoạn.',
        'D. Chuyển đoạn không tương hỗ.'
      ],
      correctIndex: 1,
      explanation: 'Đột biến đảo đoạn là hiện tượng một đoạn NST bị đứt ra, quay ngược 180 độ rồi gắn lại vào vị trí cũ, làm thay đổi trật tự phân bố của các gen trên NST đó nhưng không làm thay đổi số lượng gen.',
      formulas: [
        '\\text{Các dạng: Mất đoạn, Lặp đoạn, Đảo đoạn, Chuyển đoạn}'
      ],
      sgkSummary: 'Đột biến cấu trúc nhiễm sắc thể là những biến đổi trong cấu trúc của NST, thường làm mất cân bằng gen, gây giảm sức sống hoặc vô sinh ở sinh vật.'
    },

    'sinh10.html': {
      title: 'Sinh Học 9 - Di Truyền Liên Kết Giới Tính & Phả Hệ',
      category: 'biology',
      question: 'Ở người, bệnh mù màu đỏ - xanh lục do gen lặn m nằm trên vùng không tương đồng của nhiễm sắc thể X quy định. Bố bình thường (XᴹY) và mẹ mang gen bệnh dị hợp (XᴹXᵐ) thì tỉ lệ con trai bị bệnh mù màu là bao nhiêu?',
      options: [
        'A. 0% (Không có con trai nào bị bệnh).',
        'B. 50% số con trai sinh ra bị bệnh mù màu (XᵐY).',
        'C. 100% con trai bị bệnh.',
        'D. 25% con trai bị bệnh.'
      ],
      correctIndex: 1,
      explanation: 'Mẹ mang gen dị hợp XᴹXᵐ tạo ra 2 loại trứng với tỉ lệ: 50% Xᴹ và 50% Xᵐ. Bố cho tinh trùng Y thụ tinh với trứng Xᵐ sẽ sinh con trai bị bệnh (XᵐY) chiếm 50% tổng số con trai sinh ra (di truyền chéo từ mẹ sang con trai).',
      formulas: [
        'P: X^M Y \\times X^M X^m',
        '\\text{Con trai: } 1 X^M Y \\text{ (bình thường)} : 1 X^m Y \\text{ (bị mù màu)} \\implies 50\\%'
      ],
      sgkSummary: 'Di truyền liên kết với giới tính là hiện tượng di truyền của các tính trạng mà gen quy định nằm trên nhiễm sắc thể giới tính X hoặc Y, thường có hiện tượng di truyền chéo hoặc di truyền thẳng.'
    },

    'sinh11.html': {
      title: 'Sinh Học 9 - Hệ Sinh Thái: Chuỗi & Lưới Thức Ăn',
      category: 'biology',
      question: 'Trong chuỗi thức ăn: "Cây cỏ -> Sâu ăn lá -> Chim sâu -> Rắn -> Đại bàng", sinh vật đóng vai trò là sinh vật sản xuất là:',
      options: [
        'A. Cây cỏ (Sinh vật tự dưỡng quang hợp).',
        'B. Sâu ăn lá.',
        'C. Rắn.',
        'D. Đại bàng.'
      ],
      correctIndex: 0,
      explanation: 'Cây cỏ là sinh vật sản xuất vì có chất diệp lục, có khả năng quang hợp hấp thụ năng lượng mặt trời để tổng hợp chất hữu cơ từ CO₂ và H₂O, là nguồn cung cấp thức ăn ban đầu cho tất cả các sinh vật tiêu thụ trong chuỗi thức ăn.',
      formulas: [
        '\\text{Quang hợp: } 6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{Ánh sáng, diệp lục}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2'
      ],
      sgkSummary: 'Chuỗi thức ăn là một dãy nhiều loài sinh vật có quan hệ dinh dưỡng với nhau, mỗi loài là một mắt xích. Mở đầu chuỗi thức ăn thường là sinh vật sản xuất (thực vật quang hợp).'
    },

    'sinh12.html': {
      title: 'Sinh Học 9 - Cân Bằng Sinh Học & Khống Chế Sinh Học',
      category: 'biology',
      question: 'Hiện tượng số lượng cá thể của một quần thể bị kìm hãm ở mức độ nhất định bởi số lượng cá thể của quần thể khác trong quần xã được gọi là:',
      options: [
        'A. Cạnh tranh cùng loài.',
        'B. Khống chế sinh học (Đảm bảo cân bằng sinh thái).',
        'C. Thích nghi sinh thái.',
        'D. Thoái hóa giống.'
      ],
      correctIndex: 1,
      explanation: 'Khống chế sinh học là hiện tượng số lượng cá thể của một quần thể bị kìm hãm ở mức độ nhất định bởi quần thể khác (ví dụ mối quan hệ vật ăn thịt - con mồi, vật kí sinh - vật chủ). Nhờ đó số lượng cá thể mỗi loài dao động quanh vị trí cân bằng sinh thái.',
      formulas: [
        '\\text{Vật ăn thịt} \\rightleftharpoons \\text{Con mồi} \\implies \\text{Cân bằng sinh thái bền vững}'
      ],
      sgkSummary: 'Khống chế sinh học làm cho số lượng cá thể của mỗi quần thể dao động trong thế cân bằng, từ đó dẫn đến trạng thái cân bằng sinh học trong toàn bộ quần xã sinh vật.'
    }
  };

  // 2. PHÁT HIỆN TRANG HIỆN TẠI
  function getCurrentPageKey() {
    const raw = window.location.pathname || window.location.href || '';
    const filename = raw.split(/[\\/]/).pop().split('?')[0].split('#')[0].toLowerCase();
    if (COURSE_DB[filename]) return filename;
    for (const key in COURSE_DB) {
      if (filename === key || filename.startsWith(key.replace('.html', ''))) return key;
    }
    return null;
  }

  // Ensure KaTeX is loaded for scientific formulas
  function ensureKaTeX() {
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(link);
    }
    if (!window.katex && !document.getElementById('katex-js')) {
      const s = document.createElement('script');
      s.id = 'katex-js';
      s.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      s.onload = () => {
        if (!document.getElementById('katex-autorender')) {
          const auto = document.createElement('script');
          auto.id = 'katex-autorender';
          auto.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js';
          auto.onload = () => {
            const exp = document.getElementById('nexusQuizStepExplanation');
            if (exp && window.renderMathInElement) {
              try { window.renderMathInElement(exp); } catch (e) {}
            }
          };
          document.head.appendChild(auto);
        }
      };
      document.head.appendChild(s);
    }
  }

  // 3. TIÊM CSS GIAO DIỆN NỀN TRẮNG HIỆN ĐẠI & TRẮC NGHIỆM
  function injectWhiteThemeAndStyles() {
    ensureKaTeX();
    let effectiveTheme = 'light';
    if (window.NexusTheme && window.NexusTheme.getEffective) {
      effectiveTheme = window.NexusTheme.getEffective();
    } else {
      const savedTheme = localStorage.getItem('nexus_theme') || 'light';
      if (savedTheme === 'system') {
        effectiveTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
      } else {
        effectiveTheme = savedTheme === 'dark' ? 'dark' : 'light';
      }
    }

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    if (!window.__nexusQuizThemeListenerAttached) {
      window.__nexusQuizThemeListenerAttached = true;
      window.addEventListener('nexusThemeChanged', (e) => {
        if (e && e.detail && e.detail.theme === 'dark') {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      });
    }

    if (document.getElementById('nexus-course-quiz-white-theme')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'nexus-course-quiz-white-theme';
    styleEl.innerHTML = `
      /* White Theme Overrides (Chỉ áp dụng khi không ở Dark Mode) */
      :root {
        --lab-bg: #ffffff;
        --lab-surface: #f8fafc;
        --lab-card: #ffffff;
        --lab-border: #cbd5e1;
        --lab-text: #020617;
        --lab-muted: #334155;
      }
      html:not(.dark) body, html.light body {
        background-color: #ffffff !important;
        color: #020617 !important;
        font-weight: 600;
      }
      /* Soft panels */
      html:not(.dark) .bg-slate-900, html:not(.dark) .bg-slate-950, html:not(.dark) .bg-\\[\\#040711\\], html:not(.dark) .bg-\\[\\#0f172a\\] {
        background-color: #ffffff !important;
        border-color: #cbd5e1 !important;
        color: #020617 !important;
      }
      html:not(.dark) .bg-slate-900\\/80, html:not(.dark) .bg-slate-900\\/90, html:not(.dark) .bg-slate-800\\/80 {
        background-color: rgba(255, 255, 255, 0.96) !important;
        border-color: #cbd5e1 !important;
        color: #020617 !important;
      }
      html:not(.dark) .bg-slate-800, html:not(.dark) .bg-slate-850 {
        background-color: #f8fafc !important;
        border-color: #cbd5e1 !important;
        color: #020617 !important;
      }
      html:not(.dark) .text-white {
        color: #020617 !important;
        font-weight: 700 !important;
      }
      html:not(.dark) .text-slate-400, html:not(.dark) .text-slate-300 {
        color: #1e293b !important;
        font-weight: 600 !important;
      }
      html:not(.dark) .text-slate-500 {
        color: #334155 !important;
        font-weight: 600 !important;
      }
      html:not(.dark) .border-slate-800, html:not(.dark) .border-slate-700 {
        border-color: #cbd5e1 !important;
      }

      /* Quiz Modal Backdrop & Container */
      #nexusQuizModalOverlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      #nexusQuizModalOverlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      .nexus-quiz-card {
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8);
        width: 100%;
        max-width: 650px;
        max-height: 90vh;
        overflow-y: auto;
        color: #0f172a;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        transform: scale(0.96) translateY(10px);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #nexusQuizModalOverlay.active .nexus-quiz-card {
        transform: scale(1) translateY(0);
      }

      /* Option Radio Card */
      .nexus-option-btn {
        width: 100%;
        text-align: left;
        padding: 12px 16px;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        background: #f8fafc;
        color: #1e293b;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      .nexus-option-btn:hover {
        border-color: #3b82f6;
        background: #eff6ff;
        color: #1d4ed8;
      }
      .nexus-option-btn.selected {
        border-color: #2563eb;
        background: #dbeafe;
        color: #1e40af;
        box-shadow: 0 0 0 1px #2563eb;
      }

      /* Floating Header Button */
      #nexusBtnShowExplanation {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 9999px;
        background: #2563eb;
        color: #ffffff;
        font-weight: 700;
        font-size: 13px;
        box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5), 0 0 0 2px #ffffff;
        cursor: pointer;
        border: none;
        transition: transform 0.15s ease, background-color 0.15s ease;
      }
      #nexusBtnShowExplanation:hover {
        background: #1d4ed8;
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 4. KHỞI TẠO MODAL DỰ ĐOÁN & GIẢI THÍCH
  function initCourseQuiz() {
    const pageKey = getCurrentPageKey();
    if (!pageKey) return; // Không áp dụng cho sandbox hay trang ngoài

    const courseData = COURSE_DB[pageKey];
    let userSelectedIdx = null;
    let hasSubmitted = false;
    let hasCompletedLab = false;

    // Tạo Overlay Modal
    const overlay = document.createElement('div');
    overlay.id = 'nexusQuizModalOverlay';
    overlay.innerHTML = `
      <div class="nexus-quiz-card">
        <!-- Header -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; border-top-left-radius: 20px; border-top-right-radius: 20px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 16px;">
              <i class="fa-solid fa-clipboard-question"></i>
            </div>
            <div>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #2563eb;">Khởi Động Thí Nghiệm</div>
              <h2 style="font-size: 16px; font-weight: 800; margin: 0; color: #0f172a;">${courseData.title}</h2>
            </div>
          </div>
          <button id="nexusBtnCloseModal" type="button" style="background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <!-- Step 1: Dự đoán -->
          <div id="nexusQuizStepQuestion">
            <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid #3b82f6;">
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">🎯 BƯỚC 1: DỰ ĐOÁN KẾT QUẢ THÍ NGHIỆM</div>
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.5;">${courseData.question}</div>
            </div>

            <div id="nexusOptionsList" style="margin-bottom: 20px;">
              ${courseData.options.map((opt, idx) => `
                <button type="button" class="nexus-option-btn" data-index="${idx}">
                  <span style="width: 22px; height: 22px; border-radius: 50%; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;" class="radio-indicator">${String.fromCharCode(65 + idx)}</span>
                  <span>${opt}</span>
                </button>
              `).join('')}
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button id="nexusBtnSkipQuiz" type="button" style="padding: 10px 18px; border-radius: 10px; font-size: 12px; font-weight: 700; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; cursor: pointer;">Bỏ Qua & Vào Thí Nghiệm</button>
              <button id="nexusBtnSubmitQuiz" type="button" style="padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 800; background: #2563eb; color: #ffffff; border: none; cursor: pointer;">Xác Nhận Dự Đoán ✓</button>
            </div>
          </div>

          <!-- Step 1.5: Ghi nhận dự đoán (Chưa tiết lộ đáp án, yêu cầu làm thí nghiệm trước) -->
          <div id="nexusQuizStepConfirmed" style="display: none;">
            <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 16px; padding: 22px; text-align: center; margin-bottom: 20px;">
              <div style="font-size: 42px; line-height: 1; margin-bottom: 10px;">🎯</div>
              <div style="font-size: 17px; font-weight: 900; color: #166534; margin-bottom: 8px;">ĐÃ GHI NHẬN DỰ ĐOÁN CỦA BẠN!</div>
              <div style="font-size: 13px; color: #15803d; line-height: 1.6; font-weight: 700; margin-bottom: 14px;">
                Phương án bạn đã chọn: <br/>
                <span id="nexusConfirmedOptionText" style="display: inline-block; margin-top: 4px; color: #0f172a; background: #dcfce7; padding: 4px 12px; border-radius: 8px; border: 1px solid #86efac;"></span>
              </div>
              <div style="font-size: 13px; color: #334155; line-height: 1.6; background: #ffffff; border-radius: 12px; padding: 14px; border: 1px solid #cbd5e1; text-align: left;">
                <div style="font-weight: 800; color: #2563eb; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-flask"></i> NHIỆM VỤ TIẾP THEO:
                </div>
                Hãy tự tay thực hiện các thao tác trên phòng thí nghiệm ảo (kéo thả vật dụng, chỉnh thanh trượt, bật đèn/công tắc...) để tự mình quan sát hiện tượng thực tế.<br/>
                <div style="margin-top: 6px; color: #0f172a; font-weight: 700;">
                  ⚡ Sau khi làm xong thí nghiệm, hãy bấm nút <b>"🔬 Hoàn Thành Thí Nghiệm & Xem Kết Quả"</b> ở góc màn hình để mở khóa đáp án chuẩn SGK và công thức!
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: center;">
              <button id="nexusBtnStartLabNow" type="button" style="padding: 12px 28px; border-radius: 12px; font-size: 13px; font-weight: 800; background: #2563eb; color: #ffffff; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(37,99,235,0.35);">
                <span>Bắt Đầu Làm Thí Nghiệm Ngay</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Step 2: Kết quả & Giải thích SGK (Chỉ xuất hiện sau khi hoàn thành thí nghiệm) -->
          <div id="nexusQuizStepExplanation" style="display: none;">
            <div id="nexusFeedbackBanner" style="padding: 14px 18px; border-radius: 12px; margin-bottom: 16px;"></div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 16px;">
              <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-magnifying-glass-chart" style="color: #2563eb;"></i> Giải Thích Hiện Tượng Thí Nghiệm:
              </div>
              <div style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 12px;">
                ${courseData.explanation}
              </div>

              ${courseData.formulas && courseData.formulas.length ? `
                <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;">
                  <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; margin-bottom: 6px;">📐 Công Thức Khoa Học Chuẩn SGK:</div>
                  <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #0f172a; line-height: 1.8;">
                    ${courseData.formulas.map(f => `<div style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; margin-bottom: 4px;">$$${f}$$</div>`).join('')}
                  </div>
                </div>
              ` : ''}

              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 14px; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 800; color: #1d4ed8; margin-bottom: 2px;">📖 KIẾN THỨC TRỌNG TÂM SGK:</div>
                <div style="font-size: 12px; color: #1e3a8a; line-height: 1.5;">${courseData.sgkSummary}</div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button id="nexusBtnDismissExplanation" type="button" style="padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 800; background: #059669; color: #ffffff; border: none; cursor: pointer;">Đã Hiểu - Tiếp Tục Thí Nghiệm ✓</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Floating Button để mở modal / hoàn thành thí nghiệm
    const floatBtn = document.createElement('button');
    floatBtn.id = 'nexusBtnShowExplanation';
    floatBtn.type = 'button';
    floatBtn.innerHTML = `
      <i class="fa-solid fa-clipboard-question"></i>
      <span>Dự Đoán Kết Quả</span>
    `;

    function updateFloatBtnState() {
      if (!hasSubmitted) {
        floatBtn.innerHTML = `
          <i class="fa-solid fa-clipboard-question"></i>
          <span>Dự Đoán Kết Quả</span>
        `;
        floatBtn.style.background = '#2563eb';
      } else if (!hasCompletedLab) {
        floatBtn.innerHTML = `
          <i class="fa-solid fa-flask-vial"></i>
          <span>Hoàn Thành TN & Xem Kết Quả</span>
        `;
        floatBtn.style.background = '#059669';
        floatBtn.style.boxShadow = '0 6px 20px rgba(5,150,105,0.45)';
      } else {
        floatBtn.innerHTML = `
          <i class="fa-solid fa-graduation-cap"></i>
          <span>Xem Lời Giải Thích SGK</span>
        `;
        floatBtn.style.background = '#2563eb';
      }
    }

    floatBtn.onclick = () => {
      if (!hasSubmitted) {
        showModal('question');
      } else if (!hasCompletedLab) {
        hasCompletedLab = true;
        updateFloatBtnState();
        showModal('explanation');
      } else {
        showModal('explanation');
      }
    };
    document.body.appendChild(floatBtn);

    // Xử lý chọn đáp án
    const optBtns = overlay.querySelectorAll('.nexus-option-btn');
    optBtns.forEach(btn => {
      btn.onclick = () => {
        optBtns.forEach(b => {
          b.classList.remove('selected');
          b.querySelector('.radio-indicator').style.borderColor = '#cbd5e1';
          b.querySelector('.radio-indicator').style.background = 'transparent';
          b.querySelector('.radio-indicator').style.color = 'inherit';
        });
        btn.classList.add('selected');
        const indicator = btn.querySelector('.radio-indicator');
        indicator.style.borderColor = '#2563eb';
        indicator.style.background = '#2563eb';
        indicator.style.color = '#ffffff';
        userSelectedIdx = parseInt(btn.dataset.index, 10);
      };
    });

    // Nút nộp bài dự đoán: Ghi nhận và KHÔNG đưa kết quả ngay mà đợi làm xong thí nghiệm
    const submitBtn = overlay.querySelector('#nexusBtnSubmitQuiz');
    submitBtn.onclick = () => {
      if (userSelectedIdx === null) {
        alert('Vui lòng chọn 1 phương án dự đoán trước khi tiếp tục!');
        return;
      }
      hasSubmitted = true;
      hasCompletedLab = false;
      updateFloatBtnState();

      // Hiển thị giao diện đã ghi nhận
      const qStep = overlay.querySelector('#nexusQuizStepQuestion');
      const confStep = overlay.querySelector('#nexusQuizStepConfirmed');
      const confText = overlay.querySelector('#nexusConfirmedOptionText');
      if (confText) confText.innerText = courseData.options[userSelectedIdx];

      qStep.style.display = 'none';
      confStep.style.display = 'block';
    };

    // Nút bắt đầu làm thí nghiệm ngay từ màn hình xác nhận
    const startLabBtn = overlay.querySelector('#nexusBtnStartLabNow');
    if (startLabBtn) {
      startLabBtn.onclick = () => overlay.classList.remove('active');
    }

    // Nút bỏ qua
    const skipBtn = overlay.querySelector('#nexusBtnSkipQuiz');
    skipBtn.onclick = () => {
      hasSubmitted = true;
      hasCompletedLab = true;
      updateFloatBtnState();
      overlay.classList.remove('active');
    };

    // Nút đóng modal
    const closeBtn = overlay.querySelector('#nexusBtnCloseModal');
    closeBtn.onclick = () => overlay.classList.remove('active');

    // Nút hoàn tất giải thích
    const dismissBtn = overlay.querySelector('#nexusBtnDismissExplanation');
    dismissBtn.onclick = () => overlay.classList.remove('active');

    function renderMathOn(el) {
      if (!el) return;
      if (typeof window.renderMathInElement === 'function') {
        try {
          window.renderMathInElement(el, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        } catch (e) {}
      } else if (window.katex && window.katex.renderToString) {
        try {
          el.innerHTML = el.innerHTML.replace(/\$\$([\s\S]+?)\$\$/g, (m, tex) => {
            return window.katex.renderToString(tex, { displayMode: true, throwOnError: false });
          }).replace(/\$([^$]+?)\$/g, (m, tex) => {
            return window.katex.renderToString(tex, { displayMode: false, throwOnError: false });
          });
        } catch (e) {}
      }
    }

    function renderExplanationView() {
      const qStep = overlay.querySelector('#nexusQuizStepQuestion');
      const expStep = overlay.querySelector('#nexusQuizStepExplanation');
      const banner = overlay.querySelector('#nexusFeedbackBanner');

      const isCorrect = userSelectedIdx === courseData.correctIndex;
      if (isCorrect) {
        banner.style.background = '#ecfdf5';
        banner.style.border = '1px solid #10b981';
        banner.style.color = '#065f46';
        banner.innerHTML = `
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-circle-check" style="color: #059669; font-size: 16px;"></i> CHÍNH XÁC! DỰ ĐOÁN CỦA BẠN HOÀN TOÀN ĐÚNG!
          </div>
          <div style="font-size: 12px; line-height: 1.5;">
            Bạn đã chọn phương án <b>${courseData.options[userSelectedIdx]}</b>. Thí nghiệm thực tế và lý thuyết đã chứng minh điều này!
          </div>
        `;
      } else {
        banner.style.background = '#fff1f2';
        banner.style.border = '1px solid #f43f5e';
        banner.style.color = '#9f1239';
        banner.innerHTML = `
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-circle-xmark" style="color: #e11d48; font-size: 16px;"></i> DỰ ĐOÁN CHƯA CHÍNH XÁC!
          </div>
          <div style="font-size: 12px; line-height: 1.5;">
            Bạn đã dự đoán: <i>${courseData.options[userSelectedIdx]}</i>.<br/>
            Đáp án chuẩn SGK là: <b style="color: #059669;">${courseData.options[courseData.correctIndex]}</b>. Hãy xem giải thích chi tiết dưới đây!
          </div>
        `;
      }

      qStep.style.display = 'none';
      expStep.style.display = 'block';

      renderMathOn(expStep);
    }

    function showModal(step) {
      const qStep = overlay.querySelector('#nexusQuizStepQuestion');
      const confStep = overlay.querySelector('#nexusQuizStepConfirmed');
      const expStep = overlay.querySelector('#nexusQuizStepExplanation');
      if (step === 'question') {
        qStep.style.display = 'block';
        if (confStep) confStep.style.display = 'none';
        expStep.style.display = 'none';
        renderMathOn(qStep);
      } else {
        qStep.style.display = 'none';
        if (confStep) confStep.style.display = 'none';
        renderExplanationView();
      }
      overlay.classList.add('active');
    }

    // Expose Global Helper
    window.NexusCourseQuiz = {
      open: () => overlay.classList.add('active'),
      close: () => overlay.classList.remove('active'),
      completeLab: () => {
        hasCompletedLab = true;
        updateFloatBtnState();
        showModal('explanation');
      }
    };

    // Tự động hiển thị modal câu hỏi trắc nghiệm khi vừa bước vào khóa học
    setTimeout(() => {
      showModal('question');
    }, 400);
  }

  // Khởi động khi tải xong DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectWhiteThemeAndStyles();
      initCourseQuiz();
    });
  } else {
    injectWhiteThemeAndStyles();
    initCourseQuiz();
  }
})();
