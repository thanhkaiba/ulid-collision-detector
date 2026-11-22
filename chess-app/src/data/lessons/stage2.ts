import type { Lesson } from './types';

export const STAGE2: Lesson[] = [
  {
    id: 'pawn-structures',
    stage: 2,
    title: 'Cấu trúc tốt quyết định kế hoạch',
    summary: 'Tốt cô lập, tốt treo, chuỗi tốt, đa số tốt.',
    minutes: 40,
    blocks: [
      {
        kind: 'text',
        md: `"Tốt là linh hồn của cờ vua" (Philidor). Cấu trúc tốt cho biết **kế hoạch đúng** cho cả hai bên. Học cấu trúc là học kế hoạch, không phải học biến.

### Tốt cô lập ở cột d (IQP)
- Bên có IQP: không gian, cột e và c nửa mở, tiền đồn e5 cho mã. Kế hoạch: **tấn công vua** khi còn nhiều quân, đẩy d4-d5 để mở thế.
- Bên chống IQP: **phong tỏa** d5, đổi quân nhẹ, vào cờ tàn để tấn công tốt yếu.

### Tốt treo (hanging pawns c4-d4 hoặc c5-d5)
Linh hoạt nhưng dễ bị tấn công. Bên có: đẩy một tốt đúng lúc để mở đường. Bên chống: ép đối phương đẩy sớm, rồi phong tỏa.

### Cấu trúc Carlsbad (sau cxd5 exd5)
Trắng: **tấn công thiểu số** b4-b5 tạo tốt yếu c6. Đen: tấn công cánh vua bằng ...f5 hoặc ...Ne4, hoặc phản ứng ...a6, ...b5.

### Chuỗi tốt (Pháp: e5-d4 vs e6-d5)
Tấn công vào **chân chuỗi** (d4 bằng ...c5, ...Nc6, ...Qb6). Bên có không gian tấn công cánh mà chuỗi hướng tới (Trắng: cánh vua).

### Đa số tốt
Đa số ở cánh hậu (3 vs 2) tạo tốt thông xa trong cờ tàn. Đa số ở trung tâm cho tấn công trung cuộc.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/pp2bppp/2n1pn2/8/2BP4/2N2N2/PP3PPP/R1BQR1K1 w - - 0 1',
        caption: 'IQP điển hình. Trắng: Bg5, Qd3/Qe2, Rad1, rồi d5 hoặc Ne5 tấn công. Đen: ...b6, ...Bb7, ...Nb4-d5 phong tỏa, đổi quân.',
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/pp2bppp/2n2n2/2pp4/3P4/2N1PN2/PP2BPPP/R2Q1RK1 b - - 0 1',
        caption: 'Đen có tốt treo c5-d5 (sau khi Trắng đổi ở c4/e6). Trắng muốn ép ...c4 hoặc ...d4 rồi phong tỏa; Đen giữ linh hoạt, chuẩn bị ...d4.',
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/pp1nbppp/2p2n2/3p4/3P1B2/2NBP3/PPQ2PPP/R3K1NR w KQ - 0 1',
        caption: 'Carlsbad. Kế hoạch Trắng: Nf3, O-O, Rab1, b4-b5 (tấn công thiểu số). Kế hoạch Đen: ...Re8, ...Nf8, ...Ne4 hoặc ...g6, ...Ng7, ...f5.',
      },
      { kind: 'puzzles', themes: ['advancedPawn', 'promotion'], rating: [1500, 1900], count: 6, intro: 'Tốt thông và phong cấp trong trung cuộc: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: Pawn Structure Chess (Andrew Soltis)', url: 'https://www.google.com/search?q=Pawn+Structure+Chess+Soltis', note: 'Chuẩn mực về chủ đề này.' },
    ],
  },

  {
    id: 'minor-pieces',
    stage: 2,
    title: 'Quân nhẹ: tượng tốt, tượng xấu, mã vs tượng',
    summary: 'Đổi quân nào, giữ quân nào.',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `### Tượng tốt và tượng xấu
Tượng bị tốt mình chặn (cùng màu ô với tốt) là **tượng xấu**. Quy tắc: đặt tốt ở ô **khác màu** với tượng còn lại. Tượng xấu nhưng đứng ngoài chuỗi tốt (ví dụ Bg5 của Trắng ở cấu trúc Pháp) vẫn ổn.

### Mã vs tượng
- Mã mạnh: thế cờ **đóng**, có tiền đồn, tốt cả hai bên gần nhau.
- Tượng mạnh: thế cờ **mở**, tốt ở cả hai cánh, cờ tàn có tốt thông ở xa.
- Mã rất yếu khi phải chống tốt thông xa.

### Cặp tượng
Trị giá khoảng nửa tốt ở thế mở. Có cặp tượng: tránh đổi tượng, mở thế cờ, đẩy tốt lấy không gian. Chống cặp tượng: đổi một tượng, đóng thế, tìm tiền đồn cho mã.

### Nguyên tắc đổi quân
- Đang hơn chất: đổi **quân**, giữ tốt.
- Đang kém chất: đổi **tốt**, giữ quân.
- Đang bị tấn công: đổi quân tấn công của đối phương, nhất là quân đứng gần vua bạn.
- Có không gian: đừng đổi (đối phương chật chội).`,
      },
      {
        kind: 'diagram',
        fen: '8/5pk1/4p1p1/3pP2p/3P1P2/6P1/4B1K1/3b4 w - - 0 1',
        caption: 'Hai tượng cùng màu nhưng Trắng có tượng xấu (tốt d4, e5, f4 cùng màu ô), Đen có tượng tốt. Dù vật chất bằng nhau, Đen đứng tốt hơn rõ rệt.',
      },
      {
        kind: 'diagram',
        fen: '8/pp3kpp/2p5/3pN3/3P4/8/PPP2KPP/8 b - - 0 1',
        caption: 'Mã e5 ở tiền đồn, thế cờ nửa đóng: mã hơn hẳn tượng xấu c8 trước đó đã đổi đi. Bên có mã nên giữ thế đóng.',
      },
      { kind: 'puzzles', themes: ['bishopEndgame', 'knightEndgame'], rating: [1500, 1900], count: 6, intro: 'Cờ tàn quân nhẹ: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: Simple Chess (Michael Stean)', url: 'https://www.google.com/search?q=Simple+Chess+Michael+Stean', note: 'Mỏng, rất rõ về quân nhẹ, cột mở, tốt yếu.' },
      { label: "Sách: How to Reassess Your Chess (Silman)", url: 'https://www.google.com/search?q=How+to+Reassess+Your+Chess+Silman', note: 'Phương pháp "mất cân bằng" để lập kế hoạch.' },
    ],
  },

  {
    id: 'attack-king',
    stage: 2,
    title: 'Tấn công vua',
    summary: 'Khi nào được tấn công, và tấn công như thế nào.',
    minutes: 35,
    blocks: [
      {
        kind: 'text',
        md: `### Điều kiện để tấn công
Tấn công chỉ thành công khi có **lợi thế cục bộ**: nhiều quân hơn ở khu vực vua đối phương, hoặc vua họ hở, hoặc họ chưa nhập thành trong khi trung tâm mở. Tấn công không đủ điều kiện = thí quân mất không.

### Công cụ
- **Mở cột/đường chéo** hướng vào vua: đẩy tốt h hoặc f, thí tốt để mở.
- **Loại quân phòng thủ**: đổi mã f6 (f3), tượng phòng thủ.
- **Thí quân phá vỡ**: Bxh7+ (quà Hy Lạp), Nxf7, Rxg7. Điều kiện Bxh7+: mã có thể tới g5, hậu tới h5/h4, Đen không có mã f6 hay tượng che g5.
- **Đưa thêm quân**: tấn công cần ít nhất 3 quân. Xe nâng lên hàng 3 (Rf3-h3, Re3-g3).

### Vua đối phương ở giữa bàn
Mở trung tâm ngay, kể cả thí tốt. Đừng cho họ thời gian nhập thành.

### Tấn công khi nhập thành khác phía
Cuộc đua: đẩy tốt cánh có vua đối phương, không đổi quân tấn công, thí tốt để mở cột. Ai nhanh hơn thắng.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/ppp2ppp/2n5/3pP3/3Pn3/3B1N2/PP3PPP/R1BQK2R w KQ - 0 1',
        caption: 'Điều kiện của Bxh7+: tượng d3, mã f3 (sẽ tới g5), hậu có đường tới h5, tốt e5 đã đuổi mã f6. Đen có mã e4 nhưng Trắng vẫn có thể cân nhắc Bxe4 trước.',
      },
      { kind: 'puzzles', themes: ['kingsideAttack', 'sacrifice'], rating: [1500, 1900], count: 8, intro: 'Tấn công cánh vua với thí quân: 8 bài.' },
      { kind: 'puzzles', themes: ['exposedKing'], rating: [1500, 1900], count: 6, intro: 'Vua hở, vua ở giữa: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: The Art of Attack in Chess (Vukovic)', url: 'https://www.google.com/search?q=Art+of+Attack+in+Chess+Vukovic', note: 'Kinh điển về tấn công vua, có cả chương riêng về Bxh7+.' },
    ],
  },

  {
    id: 'defence',
    stage: 2,
    title: 'Phòng thủ và phản công',
    summary: 'Kỹ năng ít được luyện nhất, nhưng cứu được nhiều ván nhất.',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `### Nguyên tắc phòng thủ
1. **Đừng hoảng.** Đánh giá: mối đe dọa thật sự là gì? Nhiều "tấn công" chỉ là dọa.
2. **Đổi quân tấn công**, đặc biệt là hậu. Không hậu, ít tấn công.
3. **Đừng tạo điểm yếu mới**: đi tốt trước vua chỉ khi bắt buộc.
4. **Trả lại chất đúng lúc** để giết tấn công.
5. **Phản công ở trung tâm**: cách tốt nhất chống tấn công biên là đánh trung tâm.

### Tìm nước phòng thủ
Khi bị tấn công, các nước duy nhất thường là: bắt quân tấn công, chặn, hoặc **phản chiếu / phản đe dọa** lớn hơn. Hãy liệt kê mọi nước của đối phương trước khi chọn nước của mình.

### Pháo đài (fortress)
Trong cờ tàn kém chất, một số thế cờ đối phương không thể phá dù hơn nhiều: tượng khác màu, xe vs xe + tốt biên, hậu vs xe + tốt. Biết pháo đài tồn tại là động lực để chiến đấu.`,
      },
      { kind: 'puzzles', themes: ['defensiveMove'], rating: [1500, 1900], count: 8, intro: 'Tìm nước phòng thủ duy nhất: 8 bài.' },
      { kind: 'puzzles', themes: ['equality'], rating: [1300, 1900], count: 4, intro: 'Thoát khỏi thế thua về cân bằng: 4 bài.' },
      { kind: 'puzzles', themes: ['intermezzo'], rating: [1500, 1900], count: 6, intro: 'Nước chen (zwischenzug), vũ khí phản công: 6 bài.' },
    ],
  },

  {
    id: 'endgames-advanced',
    stage: 2,
    title: 'Cờ tàn nâng cao',
    summary: 'Xe chống tốt, Vancura, tượng khác màu, hậu chống tốt.',
    minutes: 40,
    blocks: [
      {
        kind: 'text',
        md: `### Xe chống tốt
Xe thường thắng tốt, trừ khi tốt đã tới hàng 6-7 với vua hỗ trợ và vua bên có xe ở xa. Nguyên tắc: xe **đứng sau** tốt thông (Tarrasch), cả tốt mình lẫn tốt đối phương.

### Thế Vancura (xe + tốt biên hàng 6 vs xe, hòa)
Tốt a6 của Trắng, xe Trắng a8, vua Đen ở cánh vua. Đen hòa bằng cách đặt xe ở **hàng 6 (f6/g6)** tấn công tốt từ bên, chiếu vua Trắng từ bên khi nó đến gần. Xe Đen không được đứng sau tốt trong thế này.

### Tượng khác màu
Hơn một tốt hầu như luôn hòa. Hơn hai tốt thắng nếu hai tốt **cách nhau ít nhất 2 cột**. Bên hơn: đặt tốt ở ô khác màu với tượng đối phương.

### Hậu chống tốt hàng 7
Hậu thắng tốt ở cột b, d, e, g (bằng cách tiếp cận dần). Tốt ở cột **a, c, f, h** hòa nếu vua hậu ở xa: tốt xe nhờ pat, tốt tượng nhờ thí vào góc.

### Mã chống tốt
Mã cản tốt được trừ tốt biên hàng 7. Mã + vua vs tốt thông: giữ mã trước tốt.`,
      },
      {
        kind: 'diagram',
        fen: 'R7/8/P4k2/8/8/8/5r2/4K3 b - - 0 1',
        caption: 'Vancura: Đen hòa bằng ...Rf6! rồi giữ xe ở hàng 6 tấn công tốt a6 từ bên. Khi vua Trắng tới b5, Đen chiếu từ bên (Rb6+). Vua Đen đứng ở g7 để xe Trắng không chiếu được.',
      },
      { kind: 'puzzles', themes: ['rookEndgame'], rating: [1600, 2000], count: 6, intro: 'Cờ tàn xe nâng cao: 6 bài.' },
      { kind: 'puzzles', themes: ['queenEndgame', 'queenRookEndgame'], rating: [1500, 2000], count: 6, intro: 'Cờ tàn hậu: 6 bài.' },
      { kind: 'puzzles', themes: ['zugzwang'], rating: [1500, 2000], count: 6, intro: 'Zugzwang: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: 100 Endgames You Must Know (de la Villa)', url: 'https://www.google.com/search?q=100+Endgames+You+Must+Know', note: 'Đúng 100 thế, đủ tới 2200.' },
      { label: 'Lichess: Endgame studies & practice', url: 'https://lichess.org/practice' },
    ],
  },

  {
    id: 'calculation',
    stage: 2,
    title: 'Tính toán: nước ứng viên, cây biến, kiểm tra ngược',
    summary: 'Phương pháp để tính xa và chính xác.',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `### Nước ứng viên (Kotov)
Trước khi tính, **liệt kê** 2-4 nước đáng xem (theo thứ tự chiếu, bắt, đe dọa, rồi nước cải thiện vị trí). Chỉ sau đó mới tính từng nước. Lỗi phổ biến: tính một nước thật sâu rồi đi nước khác chưa tính.

### Cây biến
Với mỗi ứng viên, tìm các **đáp trả mạnh nhất** của đối phương (cũng theo chiếu-bắt-đe dọa). Đừng tính biến mà đối phương "giúp" bạn.

### Kiểm tra ngược (blunder check)
Sau khi chọn nước, nhìn thế cờ **như thể bạn là đối phương** trong 10 giây: họ có chiếu, bắt quân, đòn chiến thuật nào không?

### Tính xa bằng "đá kê" (stepping stones)
Khi biến dài, dừng ở các thế cờ trung gian rõ ràng, "chụp ảnh" chúng, rồi tính tiếp từ đó.

### Phương pháp Woodpecker
Giải một bộ 300-1000 bài tập, rồi giải lại **cùng bộ** nhanh hơn, 4-7 vòng. Mục tiêu là nhận diện mẫu tức thì chứ không phải bài mới. App này: dùng "Lỗi của chính bạn" và các bài theo chủ đề, làm lại nhiều lần.`,
      },
      { kind: 'puzzles', themes: ['long', 'veryLong'], rating: [1600, 2000], count: 8, intro: 'Biến dài: 8 bài. Tính hết biến trước khi đi nước đầu.' },
      { kind: 'puzzles', themes: ['quietMove'], rating: [1600, 2000], count: 6, intro: 'Nước lặng trong tính toán: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: The Woodpecker Method (Smith & Tikkanen)', url: 'https://www.google.com/search?q=Woodpecker+Method+Smith+Tikkanen' },
      { label: 'Sách: Think Like a Grandmaster (Kotov)', url: 'https://www.google.com/search?q=Think+Like+a+Grandmaster+Kotov', note: 'Nguồn gốc của "nước ứng viên" và "cây biến".' },
    ],
  },

  {
    id: 'opening-repertoire',
    stage: 2,
    title: 'Xây kho khai cuộc theo hiểu biết',
    summary: 'Từ "chơi theo nguyên tắc" đến có hệ thống riêng.',
    minutes: 20,
    blocks: [
      {
        kind: 'text',
        md: `### Khi nào cần kho khai cuộc
Khoảng 1500-1600, khi bạn thấy thua ngay sau khai cuộc vì đối phương biết nhiều hơn. Trước đó, thời gian học khai cuộc nên dành cho chiến thuật.

### Cách xây
1. Chọn khai cuộc hợp **phong cách** (thích tấn công: Ý/Scotch, Sicilian; thích chắc: QGD, Caro-Kann, London).
2. Với mỗi biến chính, học **ý tưởng và kế hoạch** trước, biến cụ thể sau.
3. Dùng **Lichess Opening Explorer** lọc theo rating của bạn: xem đối thủ cùng trình thực sự đi gì, không phải kiện tướng đi gì.
4. Tạo **study** trên Lichess cho mỗi khai cuộc, thêm biến mới mỗi khi thua vì không biết.
5. Xem 5-10 **ván kiện tướng** trong khai cuộc đó để nắm kế hoạch trung cuộc.

### Spaced repetition
Lúc này Chessable (hoặc study Lichess + tự ôn) mới đáng dùng. Ôn biến như học từ vựng.

### Sicilian cho người muốn tấn công
Nếu muốn chuyển từ 1...e5 sang Sicilian, bắt đầu với **Accelerated Dragon** hoặc **Taimanov**: ít lý thuyết ép buộc hơn Najdorf.`,
      },
      { kind: 'puzzles', themes: ['opening'], rating: [1500, 1900], count: 6, intro: 'Chiến thuật khai cuộc ở trình độ cao hơn: 6 bài.' },
    ],
    resources: [
      { label: 'Lichess Opening Explorer', url: 'https://lichess.org/analysis#explorer' },
      { label: 'Lichess Studies', url: 'https://lichess.org/study', note: 'Tạo study riêng cho mỗi khai cuộc.' },
      { label: 'Wikibooks Chess Opening Theory', url: 'https://en.wikibooks.org/wiki/Chess_Opening_Theory' },
    ],
  },

  {
    id: 'planning',
    stage: 2,
    title: 'Đánh giá thế cờ và lập kế hoạch',
    summary: 'Phương pháp mất cân bằng của Silman.',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `### Danh sách mất cân bằng (imbalances)
Khi không có chiến thuật, liệt kê sự khác biệt giữa hai bên:
1. Quân nhẹ (tượng vs mã, cặp tượng)
2. Cấu trúc tốt (yếu, thông, cô lập)
3. Không gian
4. Vật chất
5. Kiểm soát cột/đường chéo/ô then chốt
6. Thời gian (phát triển, tempo)
7. An toàn vua
8. Chủ động (ai đang ép ai phản ứng)

### Từ mất cân bằng đến kế hoạch
Kế hoạch là **khai thác mất cân bằng có lợi** và **hóa giải cái bất lợi**. Ví dụ: có cặp tượng → mở thế cờ; có mã vs tượng xấu → đóng thế cờ, tìm tiền đồn; đối phương có tốt yếu → dồn quân vào tốt đó.

### "Nước mơ ước"
Hỏi: nếu được đi 3 nước liên tiếp, bạn đặt quân ở đâu? Rồi tìm cách tiến tới đó. Kỹ thuật này tạo ra kế hoạch khi bạn bí.

### Ván mẫu
Học chiến lược hiệu quả nhất qua **ván có bình luận từng nước**. Logical Chess: Move by Move (Chernev) là lựa chọn số một; sau đó là tuyển tập ván Capablanca, Karpov.`,
      },
      {
        kind: 'diagram',
        fen: '2r2rk1/pp1bppbp/3p1np1/q7/3BP3/2N2P2/PPPQ2PP/1K1R3R w - - 0 1',
        caption: 'Nhập thành khác phía. Mất cân bằng: Trắng có không gian trung tâm và kế hoạch h4-h5, g4; Đen có cột c và kế hoạch ...b5-b4, ...Rc8xc3. Ai nhanh hơn? Trắng nên Bxf6 để giảm quân tấn công rồi h4.',
      },
      { kind: 'puzzles', themes: ['middlegame', 'quietMove'], rating: [1600, 2000], count: 6, intro: 'Nước đi chiến lược: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: Logical Chess Move by Move (Chernev)', url: 'https://www.google.com/search?q=Logical+Chess+Move+by+Move+Chernev' },
      { label: 'Sách: My System (Nimzowitsch)', url: 'https://www.google.com/search?q=My+System+Nimzowitsch', note: 'Đọc sau Simple Chess và Capablanca, không đọc trước.' },
    ],
  },
];
