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
- Bên có IQP: không gian, cột e nửa mở và cột c mở cho xe, tiền đồn e5 cho mã. Kế hoạch: **tấn công vua** khi còn nhiều quân, đẩy d4-d5 để mở thế.
- Bên chống IQP: **phong tỏa** d5, đổi quân nhẹ, vào cờ tàn để tấn công tốt yếu.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/pp2bppp/2n1pn2/8/2BP4/2N2N2/PP3PPP/R1BQR1K1 w - - 3 10',
        marks: ['d4:yellow', 'f3e5:blue', 'd4d5:blue', 'c6b4', 'd5'],
        caption: 'IQP thật sau 1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O Nc6 7.Nc3 cxd4 8.exd4 Be7 9.Re1 O-O (Gambit Hậu chấp nhận). Tốt d4 (vòng vàng) không có tốt bạn ở cột c và e. Xanh dương là kế hoạch Trắng: mã vào tiền đồn e5, đẩy d4-d5 để mở thế, thêm Bg5, Qd3, Rad1. Xanh lá là kế hoạch Đen: mã ...Nb4 rồi tới d5 để phong tỏa, thêm ...b6, ...Bb7 và đổi quân.',
      },
      {
        kind: 'text',
        md: `### Tốt treo (hanging pawns c4-d4 hoặc c5-d5)
Linh hoạt nhưng dễ bị tấn công. Bên có: đẩy một tốt đúng lúc để mở đường. Bên chống: ép đối phương đẩy sớm, rồi phong tỏa.`,
      },
      {
        kind: 'diagram',
        fen: 'rnr3k1/4qpp1/p3b2p/1Bpp4/8/Q3PN2/PP3PPP/2R1K2R w K - 0 16',
        lastMove: 'b6c5',
        marks: ['c5:yellow', 'd5:yellow', 'a3c5:red', 'c1c5:red'],
        caption: 'Fischer – Spassky 1972 (ván 6), sau 15.dxc5 bxc5. Đen có cặp tốt treo c5-d5 (vòng vàng): hai tốt đứng cạnh nhau, không có tốt bạn ở cột b và e. Hậu a3 và xe c1 đã nhắm vào c5 (mũi tên đỏ); tốt c5 còn bị ghim vì sau nó là hậu e7 không được bảo vệ. Trắng muốn ép một tốt phải tiến rồi phong tỏa ô trước nó.',
      },
      {
        kind: 'diagram',
        fen: '2r2qk1/r2n2p1/p3p2p/2pp4/4P3/Q7/PP2BPPP/2R2RK1 b - - 0 20',
        lastMove: 'e3e4',
        marks: ['e4d5:red'],
        caption: 'Cùng ván, sau 20.e4: tốt e đánh thẳng vào d5, buộc Đen quyết định ngay. Sau {dxe4 Bc4} tượng nhắm e6 và Đen còn một loạt tốt cô lập (c5, e6, e4). Spassky chọn {d4}: hai tốt vẫn liền nhau nhưng đứng yên trên ô đen, ô c4 thuộc về tượng Trắng và đa số tốt cánh vua của Trắng được tự do tiến. Xem trọn ván trong mục "Từng nước một".',
      },
      {
        kind: 'text',
        md: `### Cấu trúc Carlsbad (sau cxd5 exd5)
Trắng: **tấn công thiểu số** b4-b5 tạo tốt yếu c6. Đen: đổi tượng ô trắng bằng ...Bf5, đưa mã tới e4 hoặc d6, và tìm phản công ở cánh vua.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqrnk1/pp2bppp/2p2n2/3p2B1/3P4/2NBPN2/PPQ2PPP/R4RK1 w - - 7 11',
        marks: ['b2b4:blue', 'c6:yellow', 'f6e4', 'c8f5'],
        caption: 'Carlsbad thật sau 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 c6 6.Qc2 Be7 7.e3 Nbd7 8.Bd3 O-O 9.Nf3 Re8 10.O-O Nf8. Mũi tên xanh dương: hai tốt a-b của Trắng tiến đánh ba tốt a-b-c của Đen (tấn công thiểu số) để tạo tốt yếu c6 (vòng vàng), ví dụ {Rab1 Ng6 b4 a6 a4 Bd6 b5}. Mũi tên xanh lá: Đen đưa mã vào e4 và đổi tượng ô trắng bằng ...Bf5, ví dụ {Rab1 Ne4 Bf4 Bf5}.',
      },
      {
        kind: 'text',
        md: `### Chuỗi tốt (Pháp: e5-d4 vs e6-d5)
Tấn công vào **chân chuỗi** (d4 bằng ...c5, ...Nc6, ...Qb6). Bên có không gian tấn công cánh mà chuỗi hướng tới (Trắng: cánh vua).`,
      },
      {
        kind: 'diagram',
        fen: 'r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6',
        lastMove: 'd8b6',
        marks: ['d4:red', 'c5d4:red', 'c6d4:red', 'b6b2:red'],
        caption: 'Phòng thủ Pháp, biến tiến: 1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6. Chuỗi tốt trắng c3-d4-e5 có chân là d4 (vòng đỏ): tốt c5 và mã c6 cùng đánh nó, hậu b6 nhắm b2 và sẽ đánh d4 qua ô c5 khi tốt đã đổi. Chuỗi trắng chỉ về cánh vua, nên Trắng tìm không gian và tấn công ở bên đó.',
      },
      {
        kind: 'text',
        md: `### Đa số tốt
Đa số ở cánh hậu (3 vs 2) tạo tốt thông xa trong cờ tàn. Đa số ở trung tâm cho tấn công trung cuộc.`,
      },
      {
        kind: 'diagram',
        fen: '8/8/6p1/3kp2p/P6P/3K2P1/8/8 w - - 0 1',
        marks: ['a4a8:blue', 'e5:yellow'],
        caption: 'Vật chất bằng nhau, mỗi bên một tốt thông: a4 của Trắng (thứ mà đa số cánh hậu tạo ra) và e5 của Đen. Tốt a ở xa nên vua đen phải bỏ trung tâm để đuổi nó, còn vua trắng ăn e5 rồi các tốt cánh vua. Máy đánh giá Trắng thắng dù bên nào đi trước, ví dụ {a5 e4+ Ke3 Kc4 a6 Kb5 Kxe4 Kxa6}: vua đen ăn được tốt a nhưng đã ở quá xa.',
      },
      { kind: 'puzzles', themes: ['advancedPawn', 'promotion'], rating: [1500, 1900], count: 6, intro: 'Tốt tiến xa, tốt thông và phong cấp: 6 bài.' },
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
Tượng bị tốt mình chặn (cùng màu ô với tốt) là **tượng xấu**. Quy tắc: đặt tốt ở ô **khác màu** với tượng còn lại. Tượng xấu nhưng đứng ngoài chuỗi tốt (ví dụ Bg5 của Trắng ở cấu trúc Pháp) vẫn ổn.`,
      },
      {
        kind: 'diagram',
        fen: '8/5pk1/1b2p1p1/3pP2p/3P1P1P/4B1P1/6K1/8 w - - 0 1',
        marks: ['b6d4:red'],
        caption: 'Hai tượng cùng màu (ô đen) nhưng Trắng có tượng xấu (tốt d4, e5, f4, g3, h4 cùng màu ô với tượng), Đen có tượng tốt (tốt Đen đều ở ô trắng, tượng b6 lại nhắm vào tốt d4, mũi tên đỏ). Dù vật chất bằng nhau, Đen đứng tốt hơn: máy đánh giá Đen hơn gần một tốt.',
      },
      {
        kind: 'text',
        md: `### Mã vs tượng
- Mã mạnh: thế cờ **đóng**, có tiền đồn, tốt cả hai bên gần nhau.
- Tượng mạnh: thế cờ **mở**, tốt ở cả hai cánh, cờ tàn có tốt thông ở xa.
- Mã rất yếu khi phải chống tốt thông xa.`,
      },
      {
        kind: 'diagram',
        fen: '8/1b2k2p/p1p3p1/1p1pN3/1P1P4/P1P1K1P1/7P/8 w - - 0 1',
        marks: ['e5:yellow', 'e3f4:blue', 'f4g5:blue'],
        caption: 'Mã e5 ở tiền đồn (vòng vàng) không thể bị tốt đuổi, thế cờ đóng: tốt Đen đều ở ô trắng nên tượng b7 xấu, chỉ biết giữ c6. Mã hơn hẳn tượng xấu, vua Trắng sẽ vào qua f4-g5 (mũi tên xanh dương), máy đánh giá Trắng thắng. Bên có mã nên giữ thế đóng.',
      },
      {
        kind: 'text',
        md: `### Cặp tượng
Trị giá khoảng nửa tốt ở thế mở. Có cặp tượng: tránh đổi tượng, mở thế cờ, đẩy tốt lấy không gian. Chống cặp tượng: đổi một tượng, đóng thế, tìm tiền đồn cho mã.`,
      },
      {
        kind: 'diagram',
        fen: '6k1/pp3ppp/2n1b3/8/8/4BB2/PP3PPP/6K1 w - - 0 1',
        marks: ['e3:blue', 'f3:blue', 'c6e5'],
        caption: 'Thế mở, tốt ở cả hai cánh, vật chất bằng nhau: cặp tượng e3, f3 (vòng xanh dương) của Trắng nhìn được cả hai cánh. Máy cho Trắng hơn khoảng nửa tốt, đúng như con số ở trên. Đen muốn đổi bớt một tượng, ví dụ đưa mã tới e5 đánh tượng f3 (mũi tên xanh lá); Trắng thì tránh đổi, giữ cả hai tượng.',
      },
      {
        kind: 'text',
        md: `### Nguyên tắc đổi quân
- Đang hơn chất: đổi **quân**, giữ tốt.
- Đang kém chất: đổi **tốt**, giữ quân.
- Đang bị tấn công: đổi quân tấn công của đối phương, nhất là quân đứng gần vua bạn.
- Có không gian: đừng đổi (đối phương chật chội).`,
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
Tấn công chỉ thành công khi có **lợi thế cục bộ**: nhiều quân hơn ở khu vực vua đối phương, hoặc vua họ hở, hoặc họ chưa nhập thành trong khi trung tâm mở. Tấn công không đủ điều kiện = thí quân mất không.`,
      },
      {
        kind: 'text',
        md: `### Công cụ
- **Mở cột/đường chéo** hướng vào vua: đẩy tốt h hoặc f, thí tốt để mở.
- **Loại quân phòng thủ**: đổi mã f6 (f3), tượng phòng thủ.
- **Thí quân phá vỡ**: Bxh7+ (quà Hy Lạp), Nxf7, Rxg7. Điều kiện Bxh7+: mã có thể tới g5, hậu tới h5/h4, Đen không có mã f6 hay tượng che g5.
- **Đưa thêm quân**: tấn công cần ít nhất 3 quân. Xe nâng lên hàng 3 (Rf3-h3, Re3-g3).`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/pppn1ppp/2n1p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 0 1',
        caption: 'Đủ điều kiện của Bxh7+: tượng d3 (mũi tên đỏ), mã f3 sẽ tới g5 (mũi tên xanh dương), hậu d1 tới được h5 (vòng vàng) ngay khi mã rời f3, tốt e5 đã đuổi mã f6, tượng Đen ở b4 không canh g5, tượng c8 bị tốt e6 chặn. Thử {Bxh7+ Kxh7 Ng5+ Kg8 Qh5}: Đen chỉ tránh được chiếu hết bằng cách bỏ hậu lấy mã (...Qxg5, có thể sau ...Bxc3+).',
        marks: ['d3h7:red', 'f3g5:blue', 'h5:yellow'],
      },
      {
        kind: 'text',
        md: `### Vua đối phương ở giữa bàn
Mở trung tâm ngay, kể cả thí tốt. Đừng cho họ thời gian nhập thành.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6',
        lastMove: 'f6d5',
        marks: ['e8:red', 'd2d4:blue', 'g5f7:red'],
        caption: 'Phòng thủ hai mã: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 (Đen nên đi 5...Na5). Vua đen còn ở e8 (vòng đỏ). Trắng mở trung tâm ngay: {d4 exd4 O-O} thí tốt, nhập thành rồi đưa xe ra cột e; máy đánh giá Trắng hơn rõ. Cách sắc hơn là thí mã {Nxf7 Kxf7 Qf3+} kéo vua ra giữa bàn.',
      },
      {
        kind: 'text',
        md: `### Tấn công khi nhập thành khác phía
Cuộc đua: đẩy tốt cánh có vua đối phương, không đổi quân tấn công, thí tốt để mở cột. Ai nhanh hơn thắng.`,
      },
      {
        kind: 'diagram',
        fen: 'r2q1rk1/3nbppp/p2pbn2/1p2p3/4P1P1/1NN1BP2/PPPQ3P/2KR1B1R w - - 0 12',
        lastMove: 'b7b5',
        marks: ['g4g5:blue', 'b5b4:blue', 'g8:red', 'c1:red'],
        caption: 'Najdorf, tấn công kiểu Anh: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e5 7.Nb3 Be6 8.f3 Be7 9.Qd2 O-O 10.O-O-O Nbd7 11.g4 b5. Hai vua ở hai cánh (vòng đỏ). Trắng đẩy g5 đuổi mã f6, quân che vua đen; Đen đẩy ...b4 đuổi mã c3, quân che vua trắng. Máy chọn {g5 Nh5 Nd5} cho Trắng: không bên nào được phí một nhịp.',
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
5. **Phản công ở trung tâm**: cách tốt nhất chống tấn công biên là đánh trung tâm.`,
      },
      {
        kind: 'text',
        md: `### Tìm nước phòng thủ
Khi bị tấn công, các nước duy nhất thường là: bắt quân tấn công, chặn, hoặc **phản chiếu / phản đe dọa** lớn hơn. Hãy liệt kê mọi nước của đối phương trước khi chọn nước của mình.`,
      },
      {
        kind: 'text',
        md: `### Pháo đài (fortress)
Trong cờ tàn kém chất, một số thế cờ đối phương không thể phá dù hơn nhiều: tượng khác màu, xe vs xe + tốt biên, hậu vs xe + tốt. Biết pháo đài tồn tại là động lực để chiến đấu.`,
      },
      {
        kind: 'diagram',
        fen: '8/2b5/5k2/5P2/4P3/5K2/4B3/8 w - - 0 1',
        marks: ['f6:yellow', 'e5:red', 'c7e5:blue'],
        caption: 'Tượng khác màu: Trắng hơn hai tốt nhưng không thắng được. Vua đen đứng ngay trước tốt f (vòng vàng), còn vua và tượng đen cùng canh ô e5 (vòng đỏ) nên tốt e không tiến được. Đen chỉ cần đi tượng qua lại trên đường chéo b8-h2; máy đánh giá hòa (0.00) dù bên nào đi trước.',
      },
      { kind: 'puzzles', themes: ['defensiveMove'], rating: [1500, 1900], count: 8, intro: 'Tìm nước phòng thủ duy nhất: 8 bài.' },
      { kind: 'puzzles', themes: ['defensiveMove'], rating: [1100, 1500], count: 4, intro: 'Phòng thủ, mức dễ hơn: 4 bài.' },
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
Xe thường thắng tốt, trừ khi tốt đã tới hàng 6-7 với vua hỗ trợ và vua bên có xe ở xa. Nguyên tắc: xe **đứng sau** tốt thông (Tarrasch), cả tốt mình lẫn tốt đối phương.`,
      },
      {
        kind: 'diagram',
        fen: '4R3/8/8/8/K7/4pk2/8/8 w - - 0 1',
        marks: ['e8e3:blue', 'd2:yellow'],
        caption: 'Xe đứng sau tốt e3 (mũi tên xanh dương) và vua trắng a4 còn kịp về: Trắng thắng. Ví dụ {Kb4 e2 Kc3 Kf2 Kd2}: vua trắng tới d2 (vòng vàng) cùng xe canh e1, tốt không phong cấp được và sẽ mất.',
      },
      {
        kind: 'diagram',
        fen: '4R3/K7/8/8/8/4pk2/8/8 w - - 0 1',
        marks: ['a7:red', 'e3:yellow'],
        caption: 'Cùng thế, chỉ khác vua trắng ở a7, quá xa. Tốt e3 (hàng 6 tính từ phía Đen) có vua hỗ trợ, xe chỉ còn cách đổi lấy tốt: hòa. Ví dụ {Kb6 e2 Kc5 Kf2 Kd4 e1=Q Rxe1 Kxe1}.',
      },
      {
        kind: 'text',
        md: `### Thế Vancura (xe + tốt biên hàng 6 vs xe, hòa)
Tốt a6 của Trắng, xe Trắng a8 đứng trước tốt, vua Đen ở g7 hoặc h7. Đen hòa bằng cách đặt xe ở **hàng 6 (ví dụ f6)** tấn công tốt từ bên cạnh, và chiếu ngang vua Trắng khi nó đến gần tốt.`,
      },
      {
        kind: 'diagram',
        fen: 'R7/6k1/P4r2/8/8/8/8/3K4 w - - 0 1',
        marks: ['f6a6:red', 'g7:yellow'],
        caption: 'Thế Vancura (hòa). Xe đen ở f6 tấn công tốt a6 từ bên cạnh (mũi tên đỏ) nên xe trắng bị trói ở a8. Khi vua trắng tới b5 để bảo vệ tốt, Đen chiếu ngang và vua trắng không có chỗ nấp: {Kc2 Kh7 Kb3 Kg7 Kb4 Kh7 Kb5 Rf5+}. Nếu Trắng đẩy a7, xe đen về a6 đứng sau tốt. Vua đen ở g7 hoặc h7 (vòng vàng) để tránh đòn xiên: nếu vua đứng xa hơn ở hàng 7 (ví dụ e7), khi tốt ở a7 và xe đen ở a6, Trắng có Rh8; Đen ăn ...Rxa7 thì Rh7+ xiên bắt xe.',
      },
      {
        kind: 'text',
        md: `### Tượng khác màu
Hơn một tốt hầu như luôn hòa. Hơn hai tốt thường thắng nếu hai tốt **cách xa nhau** (ở giữa có ít nhất hai cột, càng xa càng dễ); tốt e và g chẳng hạn vẫn thường hòa. Bên hơn: đặt tốt ở ô khác màu với tượng đối phương.`,
      },
      {
        kind: 'diagram',
        fen: '8/3k4/8/1P6/2K3P1/4b3/8/5B2 w - - 0 1',
        marks: ['b5:yellow', 'g4:yellow'],
        caption: 'Hai tốt b và g cách nhau bốn cột, cùng đứng ô trắng, khác màu với tượng đen (ô đen) nên tượng đen không tấn công được chúng. Vua đen chỉ chặn được một tốt, tượng đen phải lo tốt còn lại, và vua trắng đi hỗ trợ. Máy đánh giá Trắng thắng dù bên nào đi trước.',
      },
      {
        kind: 'diagram',
        fen: '5b2/8/4k3/4P1P1/5K2/8/4B3/8 w - - 0 1',
        marks: ['e6:yellow', 'f8g7:blue'],
        caption: 'Tốt e và g chỉ cách nhau một cột: vua đen ở e6 (vòng vàng) chặn tốt e mà vẫn đứng gần tốt g, tượng đen canh ô g7 (mũi tên xanh dương). Hơn hai tốt nhưng máy đánh giá hòa (0.00) dù bên nào đi trước.',
      },
      {
        kind: 'text',
        md: `### Hậu chống tốt hàng 7
Hậu thắng tốt ở cột b, d, e, g (bằng cách tiếp cận dần). Tốt ở cột **a, c, f, h** hòa nếu vua hậu ở xa: tốt xe nhờ pat, tốt tượng nhờ vua chạy vào góc bỏ mặc tốt (hậu ăn tốt là pat).`,
      },
      {
        kind: 'diagram',
        fen: '6K1/8/8/8/8/8/2p4Q/1k6 w - - 0 1',
        marks: ['c2:red', 'a1:yellow'],
        caption: 'Tốt c2, vua trắng ở xa: hòa. Khi bị chiếu, vua đen chạy vào góc a1 (vòng vàng) bỏ mặc tốt, vì lúc đó ăn tốt c2 là pat. Ví dụ {Qb8+ Ka2 Qf4 Kb2 Qd2 Kb1 Qb4+ Ka1}: Đen lại dọa phong cấp, Trắng không có thời gian đưa vua lại gần.',
      },
      {
        kind: 'diagram',
        fen: '6K1/8/8/8/8/8/3p3Q/2k5 w - - 0 1',
        marks: ['d1:yellow'],
        caption: 'Đổi sang tốt d2: Trắng thắng (máy tìm ra chiếu hết). Hậu chiếu và ghim để ép vua đen phải đứng lên ô d1 (vòng vàng) chặn chính tốt của mình; mỗi lần như thế Trắng có một nước rảnh để đưa vua lại gần.',
      },
      {
        kind: 'text',
        md: `### Mã chống tốt
Mã kịp tới trước tốt thường cản được tốt; khó nhất là tốt biên đã tới hàng 7, vì ở góc mã rất ít ô. Mã + vua vs tốt thông: giữ mã trước tốt.`,
      },
      {
        kind: 'diagram',
        fen: '7K/8/8/8/8/8/3pk3/3N4 w - - 0 1',
        marks: ['d1:yellow'],
        caption: 'Mã đứng ngay trên ô phong cấp d1 (vòng vàng). Bị vua đen đuổi, nó nhảy sang một ô vẫn canh d1, ví dụ {Nb2 Ke3 Kg7}: tốt không tiến được, hòa.',
      },
      {
        kind: 'diagram',
        fen: '7K/8/8/8/3N4/2k5/p7/8 w - - 0 1',
        marks: ['a1:yellow', 'b3:red', 'c2:red'],
        caption: 'Tốt biên a2 đã tới hàng 7. Mã chỉ canh được ô a1 (vòng vàng) từ b3 hoặc c2 (vòng đỏ), nhưng vua đen c3 canh cả hai ô đó, lại đang đánh mã: tốt phong cấp, Đen thắng.',
      },
      { kind: 'puzzles', themes: ['rookEndgame'], rating: [1600, 2000], count: 6, intro: 'Cờ tàn xe nâng cao: 6 bài.' },
      { kind: 'puzzles', themes: ['queenEndgame', 'queenRookEndgame'], rating: [1500, 2000], count: 6, intro: 'Cờ tàn hậu: 6 bài.' },
      { kind: 'puzzles', themes: ['zugzwang'], rating: [1500, 2000], count: 6, intro: 'Zugzwang: 6 bài.' },
      { kind: 'practice', ids: ['q-vs-pawn7', 'mate-two-bishops', 'lucena', 'philidor'], intro: 'Các thế cờ kỹ thuật: Hậu chống Tốt hàng 7, chiếu hết bằng hai Tượng, và ôn lại Lucena, Philidor.' },
    ],
    resources: [
      { label: 'Sách: 100 Endgames You Must Know (de la Villa)', url: 'https://www.google.com/search?q=100+Endgames+You+Must+Know', note: 'Đúng 100 thế, đủ tới 2200.' },
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
Nếu muốn chuyển từ 1.e4 e5 sang 1.e4 c5 (Sicilian), bắt đầu với **Accelerated Dragon** hoặc **Taimanov**: ít lý thuyết ép buộc hơn Najdorf.`,
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
        fen: '2rq1rk1/pp1bppbp/3p1np1/4n3/3NP3/1BN1BP2/PPPQ2PP/1K1R3R b - - 0 1',
        caption: 'Nhập thành khác phía (Dragon, biến Nam Tư). Mất cân bằng: Trắng có trung tâm e4-f3 vững và kế hoạch g4, h4-h5, Bh6 đổi Tượng g7; Đen có cột c nửa mở và kế hoạch ...Nc4, ...b5, có khi thí ...Rxc3. Ai nhanh hơn? Mỗi nhịp đều quý.',
      },
      { kind: 'puzzles', themes: ['middlegame', 'quietMove'], rating: [1600, 2000], count: 6, intro: 'Nước đi chiến lược: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: Logical Chess Move by Move (Chernev)', url: 'https://www.google.com/search?q=Logical+Chess+Move+by+Move+Chernev' },
      { label: 'Sách: My System (Nimzowitsch)', url: 'https://www.google.com/search?q=My+System+Nimzowitsch', note: 'Đọc sau Simple Chess và Capablanca, không đọc trước.' },
    ],
  },
];
