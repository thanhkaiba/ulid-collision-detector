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
        caption: 'IQP thật sau 1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O Nc6 7.Nc3 cxd4 8.exd4 Be7 9.Re1 O-O (Gambit Hậu chấp nhận). Tốt d4 (vòng vàng) không có tốt bạn ở cột c và e. Xanh dương là kế hoạch Trắng: mã vào tiền đồn e5, đẩy d4-d5 để mở thế, thêm Bg5, Qd3, Rad1. Xanh lá là kế hoạch Đen: mã ...Nb4 rồi tới d5 để phong tỏa, thêm ...b6, ...Bb7 và đổi quân. Bấm “▶ Chạy” để xem một biến: hai bên dàn quân, Đen đổi tượng, rồi Trắng gỡ thế bằng d4-d5.',
        intro: ['d4', 'd5', 'c4', 'dxc4', 'Nf3', 'Nf6', 'e3', 'e6', 'Bxc4', 'c5', 'O-O', 'Nc6', 'Nc3', 'cxd4', 'exd4', 'Be7', 'Re1', 'O-O'],
        line: ['Bg5', 'b6', 'a3', 'Bb7', 'Qd3', 'h6', 'Bf4', 'Bd6', 'Bxd6', 'Qxd6', 'd5', 'exd5', 'Nxd5'],
        lineNotes: [
          'Tượng ghim mã f6, quân đang canh ô d5.',
          'Đen chuẩn bị đưa tượng c8 ra b7, nhìn vào ô d5.',
          'a3 lấy ô b4, không cho mã c6 đi đường b4-d5.',
          '',
          'Hậu lên d3, cùng tượng c4 hướng về cánh vua Đen.',
          'Đen đuổi tượng g5.',
          '',
          'Đen đổi tượng ô đen: bên chống IQP muốn bớt quân.',
          '',
          '',
          'Đột phá d4-d5: tốt cô lập tự đổi đi, đường cho quân Trắng được mở.',
          '',
          'Tốt yếu không còn, mã trắng đứng ở d5. Đẩy d5 đúng lúc là cách bên có IQP gỡ thế khi tấn công không thành.',
        ],
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
        caption: 'Fischer – Spassky 1972 (ván 6), sau 15.dxc5 bxc5. Đen có cặp tốt treo c5-d5 (vòng vàng): hai tốt đứng cạnh nhau, không có tốt bạn ở cột b và e. Hậu a3 và xe c1 đã nhắm vào c5 (mũi tên đỏ); tốt c5 còn bị ghim vì sau nó là hậu e7 không được bảo vệ. Trắng muốn ép một tốt phải tiến rồi phong tỏa ô trước nó. Bấm “▶ Chạy” để xem ván thật tiếp theo, tới 20.e4.',
        intro: ['c4', 'e6', 'Nf3', 'd5', 'd4', 'Nf6', 'Nc3', 'Be7', 'Bg5', 'O-O', 'e3', 'h6', 'Bh4', 'b6', 'cxd5', 'Nxd5', 'Bxe7', 'Qxe7', 'Nxd5', 'exd5', 'Rc1', 'Be6', 'Qa4', 'c5', 'Qa3', 'Rc8', 'Bb5', 'a6', 'dxc5', 'bxc5'],
        line: ['O-O', 'Ra7', 'Be2', 'Nd7', 'Nd4', 'Qf8', 'Nxe6', 'fxe6', 'e4'],
        lineNotes: [
          'Fischer nhập thành, áp lực vào c5 vẫn còn.',
          'Xe lên a7 để giữ hàng 7.',
          'Tốt a6 đánh tượng nên tượng lui e2.',
          '',
          'Mã nhảy d4, ngay trước tốt d5, đánh tượng e6.',
          '',
          'Đổi mã lấy tượng e6, quân đang bảo vệ d5.',
          'Đen ăn lại bằng tốt f: tốt e6 cũng thành mục tiêu.',
          'Tốt e đánh vào d5: hình tiếp theo.',
        ],
      },
      {
        kind: 'diagram',
        fen: '2r2qk1/r2n2p1/p3p2p/2pp4/4P3/Q7/PP2BPPP/2R2RK1 b - - 0 20',
        lastMove: 'e3e4',
        marks: ['e4d5:red'],
        caption: 'Cùng ván, sau 20.e4: tốt e đánh thẳng vào d5, buộc Đen quyết định ngay. Sau {dxe4 Bc4} tượng nhắm e6 và Đen còn một loạt tốt cô lập (c5, e6, e4). Spassky chọn {d4}: hai tốt vẫn liền nhau nhưng đứng yên trên ô đen, ô c4 thuộc về tượng Trắng và đa số tốt cánh vua của Trắng được tự do tiến. Bấm “▶ Chạy” để xem đa số tốt đó tiến lên trong ván thật; xem trọn ván trong mục "Từng nước một".',
        intro: ['c4', 'e6', 'Nf3', 'd5', 'd4', 'Nf6', 'Nc3', 'Be7', 'Bg5', 'O-O', 'e3', 'h6', 'Bh4', 'b6', 'cxd5', 'Nxd5', 'Bxe7', 'Qxe7', 'Nxd5', 'exd5', 'Rc1', 'Be6', 'Qa4', 'c5', 'Qa3', 'Rc8', 'Bb5', 'a6', 'dxc5', 'bxc5', 'O-O', 'Ra7', 'Be2', 'Nd7', 'Nd4', 'Qf8', 'Nxe6', 'fxe6', 'e4'],
        line: ['d4', 'f4', 'Qe7', 'e5', 'Rb8', 'Bc4', 'Kh8', 'Qh3', 'Nf8', 'b3', 'a5', 'f5'],
        lineNotes: [
          'Spassky chọn d4: hai tốt đứng yên, ô c4 bỏ trống.',
          'Đa số tốt cánh vua của Trắng bắt đầu tiến.',
          '',
          'Tốt e5 lấy ô d6 và f6 của các quân Đen.',
          '',
          'Tượng vào c4, ô Đen đã nhường, nhắm tốt e6.',
          '',
          'Hậu sang h3, nhắm cả e6 lẫn h6.',
          '',
          'b3 giữ tượng c4 đứng vững.',
          '',
          'f5: Trắng phá vào cánh vua Đen; Fischer thắng ván này.',
        ],
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
        caption: 'Carlsbad thật sau 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 c6 6.Qc2 Be7 7.e3 Nbd7 8.Bd3 O-O 9.Nf3 Re8 10.O-O Nf8. Mũi tên xanh dương: hai tốt a-b của Trắng tiến đánh ba tốt a-b-c của Đen (tấn công thiểu số) để tạo tốt yếu c6 (vòng vàng), ví dụ {Rab1 Ng6 b4 a6 a4 Bd6 b5}. Mũi tên xanh lá: Đen đưa mã vào e4 và đổi tượng ô trắng bằng ...Bf5, ví dụ {Rab1 Ne4 Bf4 Bf5}. Bấm “▶ Chạy” để xem biến tấn công thiểu số.',
        intro: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5', 'c6', 'Qc2', 'Be7', 'e3', 'Nbd7', 'Bd3', 'O-O', 'Nf3', 'Re8', 'O-O', 'Nf8'],
        line: ['Rab1', 'Ng6', 'b4', 'a6', 'a4', 'Bd6', 'b5', 'axb5', 'axb5'],
        lineNotes: [
          'Xe lên b1, đứng sau tốt b sắp tiến.',
          '',
          'Bắt đầu tấn công thiểu số.',
          'Đen đi a6 để cản b5.',
          'a4 yểm trợ cho b5.',
          '',
          'b5 đánh vào tốt c6.',
          '',
          'Cột a mở. Nếu bxc6 bxc6, Đen có tốt yếu c6; nếu Đen ăn ...cxb5, tốt d5 thành tốt cô lập.',
        ],
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
        caption: 'Phòng thủ Pháp, biến tiến: 1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6. Chuỗi tốt trắng c3-d4-e5 có chân là d4 (vòng đỏ): tốt c5 và mã c6 cùng đánh nó, hậu b6 nhắm b2 và sẽ đánh d4 qua ô c5 khi tốt đã đổi. Chuỗi trắng chỉ về cánh vua, nên Trắng tìm không gian và tấn công ở bên đó. Bấm “▶ Chạy” để xem Đen dồn thêm quân vào d4.',
        intro: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6'],
        line: ['Be2', 'cxd4', 'cxd4', 'Nh6', 'b3', 'Nf5', 'Bb2', 'Bb4+', 'Kf1'],
        lineNotes: [
          '',
          'Đen đổi tốt, mở cột c và đánh thẳng vào d4.',
          '',
          'Mã đi đường vòng h6-f5 để đánh d4 thêm một lần.',
          'Trắng chuẩn bị Bb2 để giữ d4.',
          'Ba quân đen (mã c6, mã f5, hậu b6) cùng nhắm d4.',
          '',
          'Đen chiếu để Trắng mất quyền nhập thành.',
          'Vua lên f1, d4 vẫn có đủ ba quân giữ (mã f3, tượng b2, hậu d1).',
        ],
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
        line: ['a5', 'e4+', 'Ke3', 'Kc4', 'a6', 'Kb5', 'Kxe4'],
        lineNotes: [
          'Tốt a tiến, kéo vua đen theo.',
          '',
          'Vua trắng đứng chặn trước tốt e.',
          'Vua đen phải đi đuổi tốt a.',
          '',
          'Vua đen sắp ăn được tốt a6.',
          'Vua trắng ăn e4. Đen ăn a6 thì vua trắng đã kịp tới g6 và h5 trước.',
        ],
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
        marks: ['e5:yellow', 'e3f4:blue', 'f4e5:blue', 'e5d6:blue'],
        caption: 'Mã e5 ở tiền đồn (vòng vàng) không thể bị tốt đuổi, thế cờ đóng: tốt Đen đều ở ô trắng nên tượng b7 xấu, chỉ biết giữ c6. Mã hơn hẳn tượng xấu: vua Trắng tiến lên f4, rồi khi mã nhường chỗ thì vào e5 và d6 (mũi tên xanh dương), máy đánh giá Trắng thắng. Bên có mã nên giữ thế đóng. Bấm “▶ Chạy” để xem.',
        line: ['Kf4', 'Kf6', 'Nd7+', 'Kf7', 'Ke5', 'Ke7', 'Nb6', 'h5', 'h3', 'Kf7', 'Kd6'],
        lineNotes: [
          'Vua trắng tiến lên f4.',
          'Vua đen đứng f6 để giữ ô g5.',
          'Mã chiếu đẩy vua đen lui.',
          '',
          'Vua trắng vào e5 thay cho g5.',
          '',
          'Mã sang b6, nhắm tốt d5.',
          '',
          'Nước chờ.',
          '',
          'Vua trắng vào d6: tượng b7 chỉ biết đứng giữ c6, Trắng thắng.',
        ],
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
        caption: 'Đủ điều kiện của Bxh7+: tượng d3 (mũi tên đỏ), mã f3 sẽ tới g5 (mũi tên xanh dương), hậu d1 tới được h5 (vòng vàng) ngay khi mã rời f3, tốt e5 đã đuổi mã f6, tượng Đen ở b4 không canh g5, tượng c8 bị tốt e6 chặn. Thử {Bxh7+ Kxh7 Ng5+ Kg8 Qh5}: Đen chỉ tránh được chiếu hết bằng cách bỏ hậu lấy mã (...Qxg5, có thể sau ...Bxc3+). Bấm “▶ Chạy” để xem đòn thí.',
        marks: ['d3h7:red', 'f3g5:blue', 'h5:yellow'],
        line: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Qxg5', 'Bxg5'],
        lineNotes: [
          'Thí tượng, kéo vua ra h7.',
          '',
          'Mã chiếu từ g5, mở đường cho hậu d1 tới h5.',
          '',
          'Dọa Qh7#. Theo máy, Đen tốt nhất là bỏ hậu lấy mã.',
          '',
          'Trắng đã đổi tượng và mã lấy hậu cùng tốt h7: hơn hẳn.',
        ],
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
        caption: 'Phòng thủ hai mã: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 (Đen nên đi 5...Na5). Vua đen còn ở e8 (vòng đỏ). Trắng mở trung tâm ngay: {d4 exd4 O-O} thí tốt, nhập thành rồi đưa xe ra cột e; máy đánh giá Trắng hơn rõ. Cách sắc hơn là thí mã {Nxf7 Kxf7 Qf3+} kéo vua ra giữa bàn. Bấm “▶ Chạy” để xem {d4 exd4 O-O}, rồi đòn Nxf7 khi vua đen vẫn kẹt ở giữa.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5'],
        line: ['d4', 'exd4', 'O-O', 'Be7', 'Nxf7', 'Kxf7', 'Qh5+', 'g6', 'Bxd5+'],
        lineNotes: [
          'Mở trung tâm ngay, chấp thí tốt.',
          '',
          'Nhập thành, xe f1 sẵn sàng sang cột e.',
          'Đen phát triển, nhưng vua vẫn chưa nhập thành.',
          'Lúc này mới thí mã: vua đen bị kéo ra.',
          '',
          'Hậu chiếu và cùng tượng c4 đánh mã d5.',
          '',
          'Trắng lấy lại quân, vua đen trơ trọi: máy đánh giá Trắng hơn gần hai tốt.',
        ],
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
        caption: 'Najdorf, tấn công kiểu Anh: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e5 7.Nb3 Be6 8.f3 Be7 9.Qd2 O-O 10.O-O-O Nbd7 11.g4 b5. Hai vua ở hai cánh (vòng đỏ). Trắng đẩy g5 đuổi mã f6, quân che vua đen; Đen đẩy ...b4 đuổi mã c3, quân che vua trắng. Máy chọn {g5 Nh5 Nd5} cho Trắng: không bên nào được phí một nhịp. Bấm “▶ Chạy” để xem tiếp.',
        intro: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Be7', 'Qd2', 'O-O', 'O-O-O', 'Nbd7', 'g4', 'b5'],
        line: ['g5', 'Nh5', 'Nd5', 'Bxd5', 'exd5', 'f5'],
        lineNotes: [
          'Đuổi mã f6, quân che vua đen.',
          'Mã ra biên h5.',
          'Mã vào d5 ngay, đánh tượng e7: không phí nhịp nào.',
          'Đen đổi mã mạnh này.',
          'Trắng ăn lại bằng tốt, có thêm không gian.',
          'Đen phản công bằng ...f5, mở cột f cho xe.',
        ],
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
        caption: 'Tượng khác màu: Trắng hơn hai tốt nhưng không thắng được. Vua đen đứng ngay trước tốt f (vòng vàng), còn vua và tượng đen cùng canh ô e5 (vòng đỏ) nên tốt e không tiến được. Đen chỉ cần đi tượng qua lại trên đường chéo b8-h2; máy đánh giá hòa (0.00) dù bên nào đi trước. Bấm “▶ Chạy” để xem Trắng thử mà không tiến được.',
        line: ['Kg4', 'Bb8', 'Kh5', 'Bc7', 'Bc4', 'Bb8', 'e5+', 'Bxe5'],
        lineNotes: [
          'Vua trắng tìm đường vòng.',
          'Đen chỉ đi tượng qua lại trên đường chéo b8-h2.',
          '',
          '',
          '',
          '',
          'Muốn đẩy e5, Trắng phải bỏ tốt.',
          'Tượng ăn tốt. Hơn một tốt với tượng khác màu: hòa.',
        ],
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
        line: ['Kb4', 'e2', 'Kc3', 'Kf2', 'Kd2', 'Kf3', 'Rxe2'],
        lineNotes: [
          'Vua trắng chạy về phía tốt.',
          '',
          '',
          'Vua đen giữ ô e1.',
          'Vua trắng đứng cạnh e2 và cùng xe canh e1.',
          '',
          'Tốt e2 được vua d2 bảo vệ nên xe ăn an toàn: Trắng thắng.',
        ],
      },
      {
        kind: 'diagram',
        fen: '4R3/K7/8/8/8/4pk2/8/8 w - - 0 1',
        marks: ['a7:red', 'e3:yellow'],
        caption: 'Cùng thế, chỉ khác vua trắng ở a7, quá xa. Tốt e3 (hàng 6 tính từ phía Đen) có vua hỗ trợ, xe chỉ còn cách đổi lấy tốt: hòa. Ví dụ {Kb6 e2 Kc5 Kf2 Kd4 e1=Q Rxe1 Kxe1}.',
        line: ['Kb6', 'e2', 'Kc5', 'Kf2', 'Kd4', 'e1=Q', 'Rxe1', 'Kxe1'],
        lineNotes: [
          'Vua trắng chạy về, nhưng còn quá xa.',
          '',
          '',
          'Vua đen yểm trợ ô e1.',
          'Vua trắng tới d4, chậm một nhịp so với ván trên.',
          'Tốt phong cấp, xe phải đổi lấy hậu mới.',
          '',
          'Chỉ còn hai vua: hòa.',
        ],
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
        caption: 'Thế Vancura (hòa). Xe đen ở f6 tấn công tốt a6 từ bên cạnh (mũi tên đỏ) nên xe trắng bị trói ở a8. Khi vua trắng tới b5 để bảo vệ tốt, Đen chiếu ngang và vua trắng không có chỗ nấp: {Kc2 Kh7 Kb3 Kg7 Kb4 Kh7 Kb5 Rf5+}. Nếu Trắng đẩy a7, xe đen về a6 đứng sau tốt. Vua đen ở g7 hoặc h7 (vòng vàng) để tránh đòn xiên: nếu vua đứng xa hơn ở hàng 7 (ví dụ e7), khi tốt ở a7 và xe đen ở a6, Trắng có Rh8; Đen ăn ...Rxa7 thì Rh7+ xiên bắt xe. Bấm “▶ Chạy” để xem chuỗi chiếu ngang.',
        line: ['Kc2', 'Kh7', 'Kb3', 'Kg7', 'Kb4', 'Kh7', 'Kb5', 'Rf5+', 'Kb4', 'Rf4+', 'Kc5', 'Rf5+', 'Kd4', 'Rf6'],
        lineNotes: [
          'Vua trắng đi về phía tốt.',
          'Đen chỉ đi vua qua lại g7-h7, xe giữ ở f6.',
          '',
          '',
          '',
          '',
          'Vua tới b5 để bảo vệ tốt.',
          'Chiếu ngang ngay.',
          '',
          'Tiếp tục chiếu: vua trắng không có chỗ nấp.',
          '',
          '',
          'Muốn tránh chiếu, vua trắng phải rời xa tốt.',
          'Xe về lại f6 đánh tốt a6: trở lại thế ban đầu, hòa.',
        ],
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
        caption: 'Hai tốt b và g cách nhau bốn cột, cùng đứng ô trắng, khác màu với tượng đen (ô đen) nên tượng đen không tấn công được chúng. Vua đen chỉ chặn được một tốt, tượng đen phải lo tốt còn lại, và vua trắng đi hỗ trợ. Máy đánh giá Trắng thắng dù bên nào đi trước. Bấm “▶ Chạy” để xem vua trắng sang hỗ trợ tốt g.',
        line: ['Kd5', 'Bd2', 'Bd3', 'Bh6', 'Ke4', 'Ke6', 'Bc4+', 'Kd6', 'Kf5', 'Be3', 'g5'],
        lineNotes: [
          'Vua trắng tiến vào trung tâm.',
          '',
          '',
          'Tượng đen canh ô g5, cản tốt g.',
          '',
          '',
          'Chiếu đẩy vua đen lui về d6, xa tốt g.',
          'Vua đen phải ở gần để giữ tốt b.',
          'Vua trắng sang hỗ trợ tốt g.',
          '',
          'Tốt g tiến cùng vua: tượng đen một mình không cản nổi, vua đen bị tốt b giữ chân.',
        ],
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
        caption: 'Tốt c2, vua trắng ở xa: hòa. Khi bị chiếu, vua đen chạy vào góc a1 (vòng vàng) bỏ mặc tốt, vì lúc đó ăn tốt c2 là pat. Ví dụ {Qb8+ Ka2 Qf4 Kb2 Qd2 Kb1 Qb4+ Ka1}: Đen lại dọa phong cấp, Trắng không có thời gian đưa vua lại gần. Bấm “▶ Chạy” để xem tới thế pat.',
        line: ['Qb8+', 'Ka2', 'Qf4', 'Kb2', 'Qd2', 'Kb1', 'Qb4+', 'Ka1', 'Qc3+', 'Kb1', 'Qb3+', 'Ka1', 'Qxc2'],
        lineNotes: [
          '',
          '',
          'Hậu canh ô c1.',
          '',
          'Hậu ghim tốt c2 vào vua b2.',
          'Vua đen giữ tốt.',
          '',
          'Vua đen vào góc a1: ăn c2 là pat, còn nếu Trắng đi vua thì Đen phong cấp.',
          '',
          '',
          '',
          'Lại vào góc.',
          'Ăn tốt: vua đen không còn nước đi mà không bị chiếu, pat, hòa.',
        ],
      },
      {
        kind: 'diagram',
        fen: '6K1/8/8/8/8/8/3p3Q/2k5 w - - 0 1',
        marks: ['d1:yellow'],
        caption: 'Đổi sang tốt d2: Trắng thắng (máy tìm ra chiếu hết). Hậu chiếu và ghim để ép vua đen phải đứng lên ô d1 (vòng vàng) chặn chính tốt của mình; mỗi lần như thế Trắng có một nước rảnh để đưa vua lại gần. Bấm “▶ Chạy” để xem một vòng như vậy.',
        line: ['Qc7+', 'Kb2', 'Qb6+', 'Kc2', 'Qc5+', 'Kb2', 'Qb4+', 'Kc2', 'Qc4+', 'Kb2', 'Qd3', 'Kc1', 'Qc3+', 'Kd1', 'Kh7'],
        lineNotes: [
          'Hậu chiếu, mỗi lần một bước tiến lại gần tốt.',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          'Hậu đứng ngay trước tốt, đánh d2.',
          'Vua đen phải về giữ tốt.',
          'Chiếu: vua đen chỉ còn ô d1.',
          'Vua đen chặn chính tốt của mình.',
          'Nước rảnh: vua trắng tiến một bước. Lặp lại cách này cho tới khi vua tới gần và chiếu hết.',
        ],
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
        line: ['Nb2', 'Ke3', 'Kg7', 'Kd4', 'Kf6', 'Kc3', 'Nd1+'],
        lineNotes: [
          'Từ b2 mã vẫn canh d1.',
          '',
          'Vua trắng tranh thủ đi lại gần.',
          '',
          '',
          'Vua đen đánh mã.',
          'Mã chiếu và về lại d1: tốt vẫn bị chặn, hòa.',
        ],
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
Trước khi tính, **liệt kê** 2-4 nước đáng xem (theo thứ tự chiếu, bắt, đe dọa, rồi nước cải thiện vị trí). Chỉ sau đó mới tính từng nước. Lỗi phổ biến: tính một nước thật sâu rồi đi nước khác chưa tính.`,
      },
      {
        kind: 'diagram',
        fen: '4r1k1/pp1q1ppp/2n5/8/2B5/5Q2/PP3PPP/4R1K1 w - - 0 1',
        marks: ['e1e8:blue', 'f3f7:blue', 'c4f7:blue'],
        caption: 'Trắng đi. Liệt kê các nước chiếu trước: {Rxe8+}, {Qxf7+} và {Bxf7+} (ba mũi tên). Nước đầu tiên ai cũng thấy chỉ đổi xe, thế cờ gần cân bằng. Chỉ khi xét đủ ứng viên mới thấy {Qxf7+ Kh8 Rxe8+ Qxe8 Qxe8#}: vua không ăn được hậu vì tượng c4 bảo vệ f7.',
        line: ['Qxf7+', 'Kh8', 'Rxe8+', 'Qxe8', 'Qxe8#'],
        lineNotes: [
          'Hậu ăn f7 chiếu: vua không ăn lại được vì tượng c4 bảo vệ f7.',
          '',
          'Đổi xe, kéo hậu đen về e8.',
          '',
          'Chiếu hết.',
        ],
      },
      {
        kind: 'text',
        md: `### Cây biến
Với mỗi ứng viên, tìm các **đáp trả mạnh nhất** của đối phương (cũng theo chiếu-bắt-đe dọa). Đừng tính biến mà đối phương "giúp" bạn.`,
      },
      {
        kind: 'diagram',
        fen: '4r1k1/pp1q1ppp/2n5/8/2B5/5Q2/PP3PPP/4R1K1 w - - 0 1',
        marks: ['c4f7:blue', 'd7f7:red'],
        caption: 'Cây biến của ứng viên {Bxf7+}. Đáp trả "giúp" Trắng là {Bxf7+ Kh8 Bxe8}, mất xe. Đáp trả mạnh nhất là ăn bằng hậu (mũi tên đỏ): {Bxf7+ Qxf7 Rxe8+ Qxe8} và Trắng mất tượng chỉ để lấy một tốt. Cùng thế cờ, ứng viên {Qxf7+} thì không có đáp trả nào cứu được Đen. Bấm “▶ Chạy” để xem nhánh đáp trả mạnh nhất.',
        line: ['Bxf7+?', 'Qxf7', 'Rxe8+', 'Qxe8'],
        lineNotes: [
          'Ứng viên Bxf7+.',
          'Đáp trả mạnh nhất: ăn bằng hậu, không lui vua.',
          '',
          'Hậu đen ăn lại. Trắng mất tượng, chỉ lấy được một tốt.',
        ],
      },
      {
        kind: 'text',
        md: `### Kiểm tra ngược (blunder check)
Sau khi chọn nước, nhìn thế cờ **như thể bạn là đối phương** trong 10 giây: họ có chiếu, bắt quân, đòn chiến thuật nào không?`,
      },
      {
        kind: 'text',
        md: `### Tính xa bằng "đá kê" (stepping stones)
Khi biến dài, dừng ở các thế cờ trung gian rõ ràng, "chụp ảnh" chúng, rồi tính tiếp từ đó.`,
      },
      {
        kind: 'text',
        md: `### Phương pháp Woodpecker
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
    minutes: 35,
    blocks: [
      {
        kind: 'text',
        md: `### Khi nào cần kho khai cuộc
Kho khai cuộc (repertoire) là bộ khai cuộc bạn chọn sẵn: một hệ thống khi cầm Trắng, một cách đáp 1.e4 và một cách đáp 1.d4 khi cầm Đen. Dấu hiệu đã đến lúc xây (thường quanh 1500-1600):
- Phân tích ván bằng máy, bạn hay kém khoảng một tốt trở lên trước nước 15 mà không để mất quân hay bỏ sót đòn nào rõ.
- Bạn gặp đi gặp lại một thế cờ mà không biết kế hoạch.

Nếu bạn vẫn thua chủ yếu vì để quân hay bỏ sót đòn đôi, thời gian nên dành cho chiến thuật trước.`,
      },
      {
        kind: 'text',
        md: `### Cách xây, từng bước
1. **Chọn theo phong cách.** Thích thế mở, tấn công: Ván cờ Ý hay Scotch cho Trắng, Sicilia cho Đen. Thích thế chắc: Gambit Hậu từ chối, Caro-Kann (1.e4 c6), London.
2. **Dựng khung tối thiểu.** Ví dụ từ các bài trong ứng dụng này: Trắng 1.e4 và Ván cờ Ý; Đen 1...e5 chống 1.e4, Gambit Hậu từ chối chống 1.d4. Sau đó bổ sung dần những gì còn thiếu, như cách đáp 1...c5 hay 1...e6 khi bạn cầm Trắng.
3. **Ý tưởng trước, biến sau.** Với mỗi khai cuộc, viết ra: cấu trúc tốt hay gặp, ô và quân mà hai bên nhắm tới, đòn phá tốt của bạn. Ví dụ Gambit Hậu từ chối: ...e5 hoặc ...c5 để giải phóng tượng c8. Rồng cấp tốc: ...d5 chỉ trong một nước (xem dưới).
4. **Lichess Opening Explorer (trình khám phá khai cuộc), tab Lichess**: lọc rating quanh mức của bạn và thể loại bạn hay chơi. Ở mỗi nước của đối phương, chuẩn bị đáp cho 2-3 nước phổ biến nhất; nước hiếm thì chơi theo nguyên tắc.
5. **Mỗi khai cuộc một study trên Lichess**, mỗi biến một chương, ghi chú bằng lời vì sao đi nước đó. Sau mỗi ván, tìm nước đầu tiên ván đi ra khỏi study, tra Explorer rồi thêm 1-2 nước. Ví dụ: thua vì 4.Ng5 d5 5.exd5 Nxd5? trong Hai Mã thì thêm 5...Na5 kèm ghi chú "Nxd5 cho phép Nxf7".
6. **Xem 5-10 ván kiện tướng** (tab Masters của Explorer) trong khai cuộc đó để thấy kế hoạch trung cuộc.
7. **Ôn lặp ngắt quãng** (spaced repetition): ôn lại sau 1 ngày, 3 ngày, 1 tuần, như học từ vựng. Chessable làm việc này tự động; chương dạng "Interactive lesson" của Lichess study cũng cho bạn tự đoán nước.`,
      },
      {
        kind: 'text',
        md: `### Phòng thủ Sicilia (Sicilian Defence) cho người thích phản công
1...c5 tranh ô d4 từ cánh và không cho Trắng thế cờ đối xứng. Sau 2.Nf3, 3.d4 cxd4 4.Nxd4 (gọi là Sicilia mở), Đen đổi một tốt cánh (tốt c) lấy một tốt trung tâm (tốt d) của Trắng:
- Đen có thêm tốt trung tâm và **cột c nửa mở** (cột không còn tốt của mình) cho xe.
- Trắng phát triển nhanh hơn và có nhiều chỗ hơn.

Thế cờ lệch nên cả hai bên đều chơi để thắng. Nên bắt đầu với **Rồng cấp tốc (Accelerated Dragon)** hoặc **Taimanov**: ít biến bắt buộc phải thuộc hơn Najdorf (1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6), nơi Trắng có nhiều đòn tấn công sắc mà Đen phải nhớ chính xác.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        lastMove: 'e2e4',
        marks: ['c7c5:blue', 'd4:yellow'],
        orientation: 'black',
        caption: 'Thế cờ sau 1.e4. Mũi tên xanh: 1...c5 canh ô d4 (vòng vàng) từ cánh. Bấm “▶ Chạy” để xem Sicilia mở dẫn tới Rồng cấp tốc, từng nước một.',
        intro: ['e4'],
        line: ['c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'],
        lineNotes: [
          'c5 canh ô d4 từ cánh: Đen tranh trung tâm mà không chơi đối xứng.',
          'Mã ra, chuẩn bị d4.',
          'Mã ra và canh thêm ô d4.',
          'Trắng mở trung tâm, chấp nhận đổi tốt.',
          'Đen đổi tốt c lấy tốt d: Đen còn hai tốt trung tâm (d7, e7), Trắng chỉ còn e4.',
          'Mã trắng ăn lại, đứng giữa bàn. Cột c không còn tốt đen: đó là cột nửa mở cho xe đen.',
          'Rồng cấp tốc: chuẩn bị ...Bg7 lên đường chéo dài a1-h8, nhắm qua d4 tới cánh hậu Trắng. "Cấp tốc" vì Đen chưa đi ...d6 như Rồng thường.',
        ],
      },
      {
        kind: 'text',
        md: `### Rồng cấp tốc 1: Trắng chơi Be3, f3, Qd2
Trong Rồng thường (đã có ...d6), Trắng hay chơi Be3, f3, Qd2, nhập thành dài rồi đẩy g4, h4, h5 vào vua Đen: gọi là **tấn công Nam Tư** (Yugoslav Attack). Trong Rồng cấp tốc tốt d còn ở d7, nên Đen phá trung tâm bằng **...d5 chỉ một nước**, trước khi Trắng kịp tấn công. Khi đối phương tấn công ở cánh, phá trung tâm là cách phản công tốt nhất.

Sai lầm hay gặp: theo thói quen đi ...d6 ở thế này. Máy cho nước đó kém ...d5 khoảng 0,8 tốt: Đen tự biến thành Rồng thường, đúng thế Trắng muốn tấn công.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pp1ppp1p/2n3p1/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5',
        lastMove: 'g7g6',
        marks: ['f8g7', 'd7d5:blue'],
        orientation: 'black',
        caption: 'Thế cờ sau 4...g6. Mũi tên xanh lá: tượng sẽ lên g7. Mũi tên xanh dương: tốt d còn ở d7 nên ...d5 đi một nước là tới. Bấm “▶ Chạy” để xem đòn phá trung tâm.',
        intro: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'],
        line: ['Nc3', 'Bg7', 'Be3', 'Nf6', 'f3', 'O-O', 'Qd2', 'd5', 'O-O-O', 'Nxd4', 'Qxd4', 'Nxe4', 'Qxd5'],
        lineNotes: [
          'Mã ra, canh thêm d5 và e4.',
          'Tượng lên đường chéo dài, nhìn qua d4 tới tận b2.',
          'Tượng giữ mã d4.',
          'Mã ra, đánh e4 và chuẩn bị nhập thành.',
          'Trắng giữ e4 bằng tốt f, chuẩn bị Qd2, nhập thành dài rồi g4, h4.',
          '',
          '',
          'd5 đánh ngay tốt e4: vì tốt d còn ở d7, Đen phá trung tâm chỉ trong một nước.',
          '',
          'Đổi mã để kéo hậu trắng lên d4.',
          '',
          'Mã ăn e4 và mở đường chéo: tượng g7 giờ đánh hậu d4. Trắng không ăn được mã (Nxe4 thì ...Bxd4).',
          'Hậu tránh và lấy lại tốt d5. Thế cờ cân bằng, tượng g7 của Đen rất mạnh trên đường chéo dài.',
        ],
      },
      {
        kind: 'text',
        md: `### Rồng cấp tốc 2: thế kìm Maróczy (5.c4)
Chính vì ...d5 mà nhiều người cầm Trắng chọn 5.c4: hai tốt c4 và e4 cùng canh ô d5. Thế này gọi là **thế kìm Maróczy** (Maróczy Bind): Đen có ít chỗ hơn, nên không vội phá mà:
- **đổi bớt quân** bằng ...Nxd4 (thế chật thì đổi quân cho thoáng);
- đưa **...Be6, ...Qa5, ...Rfc8** nhắm vào tốt c4 và cột c;
- chờ thời cơ đẩy **...a6 rồi ...b5**, hoặc ...f5, để phá thế kìm.

Sai lầm hay gặp: cố đẩy ...d5 khi thế kìm đã dựng. Sau 5.c4 Nf6 6.Nc3 d5? 7.cxd5 Trắng ăn được tốt, máy cho Trắng hơn khoảng hai tốt.

Nếu Trắng đổi 5.Nxc6 bxc6: Đen có thêm một tốt trung tâm và cột b nửa mở. Cẩn thận 6.Qd4: hậu đánh xe h8 vì tượng chưa ra g7; đáp 6...Nf6.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pp1ppp1p/2n3p1/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5',
        lastMove: 'g7g6',
        marks: ['c2c4:blue', 'd5:yellow'],
        orientation: 'black',
        caption: 'Thế cờ sau 4...g6. Mũi tên xanh: 5.c4 dựng thế kìm Maróczy, cùng tốt e4 canh ô d5 (vòng vàng). Bấm “▶ Chạy” để xem cách Đen dàn quân chống thế kìm.',
        intro: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'],
        line: ['c4', 'Nf6', 'Nc3', 'd6', 'Be2', 'Nxd4', 'Qxd4', 'Bg7', 'Be3', 'O-O', 'Qd2', 'Be6', 'O-O', 'Qa5', 'Rac1', 'Rfc8', 'b3', 'a6'],
        lineNotes: [
          'Thế kìm Maróczy: tốt c4 và e4 cùng canh ô d5.',
          'Mã ra, đánh e4.',
          'Mã giữ e4 và canh thêm d5.',
          'Đen đặt tốt ở d6: ...d5 giờ quá khó, Đen chuyển sang kế hoạch khác.',
          '',
          'Đổi mã: thế chật thì đổi quân cho thoáng.',
          '',
          'Tượng lên g7, sẵn sàng nhập thành.',
          '',
          'Đen nhập thành.',
          '',
          'Tượng nhắm vào tốt c4.',
          '',
          'Hậu ra a5: ghim mã c3 vào hậu d2 và nhìn tốt a2.',
          '',
          'Xe lên cột c nửa mở, nhắm c4.',
          'Trắng phải giữ c4 bằng tốt b.',
          'a6 chuẩn bị ...b5 phá thế kìm. Trắng nhỉnh hơn chút nhờ nhiều chỗ, Đen thế chắc và có đòn phá: cuộc đấu dựa vào kế hoạch.',
        ],
      },
      {
        kind: 'text',
        md: `### Taimanov: linh hoạt, ít phải thuộc
1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6. Nước 2...e6 mở đường cho tượng f8 và canh ô d5; 4...Nc6 ra quân và đánh mã d4.

Đặc điểm của Taimanov: Đen **chưa vội quyết định** chỗ cho mã g8, tượng f8 và tốt d7, mà đợi xem Trắng dàn quân thế nào. Các nước điển hình:
- **...Qc7**: canh ô e5 để Trắng khó đẩy e5, và nhìn dọc đường chéo b8-h2.
- **...a6**: lấy ô b5, để mã và tượng Trắng không vào đó quấy hậu c7 hay ô d6.
- **...Nf6** rồi **...Bb4**: tượng đánh mã c3, quân đang giữ e4.

Vì sao ...a6 quan trọng: sau 5.Nc3 Qc7 6.Be2, nếu Đen ra ngay 6...Nf6 khi chưa có ...a6, Trắng có 7.Ndb5 đánh hậu c7. Đen vẫn ổn nếu lui đúng 7...Qb8, còn lui ...Qa5 hay ...Qe5 thì máy cho kém hơn một tốt trở lên.

Nếu Trắng đi 5.Nb5 nhắm ô d6, đáp 5...d6 rồi ...a6 đuổi mã.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pp1p1ppp/2n1p3/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5',
        lastMove: 'b8c6',
        marks: ['a7a6', 'd8c7'],
        orientation: 'black',
        caption: 'Taimanov: 1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6. Tốt d vẫn ở d7, mã g8 và tượng f8 chưa ra; trước hết là ...Qc7 và ...a6 (mũi tên). Bấm “▶ Chạy” để xem một cách dàn quân điển hình.',
        intro: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6'],
        line: ['Nc3', 'Qc7', 'Be2', 'a6', 'O-O', 'Nf6', 'Be3', 'Bb4', 'Na4'],
        lineNotes: [
          'Mã ra, giữ e4.',
          'Hậu c7 canh ô e5; Đen chưa cần đi tốt d.',
          '',
          'a6 lấy ô b5 của mã và tượng Trắng.',
          '',
          'Đến lúc này Đen mới ra mã g8, đánh e4.',
          '',
          'Tượng đánh mã c3, quân đang giữ e4: dọa ...Bxc3 rồi ...Nxe4 ăn tốt.',
          'Mã tránh sang a4. Đừng tham 9...Nxe4?: 10.Nxc6 Qxc6 11.Nb6 đánh xe a8, rồi Qd4 đánh cùng lúc g7, mã e4 và tượng b4. Đen nên lui ...Be7 hoặc nhập thành.',
        ],
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
8. Chủ động (ai đang ép ai phản ứng)`,
      },
      {
        kind: 'diagram',
        fen: '2rq1rk1/pp1bppbp/3p1np1/4n3/3NP3/1BN1BP2/PPPQ2PP/1K1R3R b - - 10 12',
        lastMove: 'c1b1',
        marks: ['g2g4:blue', 'e3h6:blue', 'e5c4', 'c8c3:red'],
        caption: 'Rồng, biến Nam Tư: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Ne5 12.Kb1. Mất cân bằng: nhập thành khác phía (an toàn vua), Trắng có trung tâm e4-f3 vững, Đen có cột c nửa mở. Kế hoạch Trắng (xanh dương): g4, h4-h5, Bh6 đổi tượng g7. Kế hoạch Đen: ...Nc4, ...b5, có khi thí xe ở c3 (mũi tên đỏ). Ai nhanh hơn? Mỗi nhịp đều quý. Bấm “▶ Chạy” để xem cuộc đua hai cánh.',
        intro: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'Bc4', 'Bd7', 'O-O-O', 'Rc8', 'Bb3', 'Ne5', 'Kb1'],
        line: ['Nc4', 'Bxc4', 'Rxc4', 'g4', 'b5', 'h4', 'h5', 'gxh5', 'Nxh5', 'b3', 'Rc8', 'Nde2', 'b4', 'Nd5'],
        lineNotes: [
          'Mã vào c4, đánh hậu d2 và tượng e3.',
          'Trắng đổi luôn mã mạnh này.',
          'Xe lên c4, ép theo cột c.',
          'Trắng bắt đầu đẩy tốt cánh vua.',
          'Đen đáp lại bằng ...b5, chuẩn bị ...b4 đuổi mã c3.',
          '',
          'Đen chặn tốt h, không cho h4-h5 dễ dàng.',
          'Trắng phá bằng gxh5, mở cột g.',
          '',
          'Đuổi xe c4.',
          '',
          '',
          '...b4 đánh mã c3.',
          'Mã vào d5. Hai bên cùng tấn công vua bên kia, mỗi nhịp đều quý.',
        ],
      },
      {
        kind: 'text',
        md: `### Từ mất cân bằng đến kế hoạch
Kế hoạch là **khai thác mất cân bằng có lợi** và **hóa giải cái bất lợi**. Ví dụ: có cặp tượng → mở thế cờ; có mã vs tượng xấu → đóng thế cờ, tìm tiền đồn; đối phương có tốt yếu → dồn quân vào tốt đó.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqk2r/pppp1ppp/4pn2/8/2PP4/P1P5/4PPPP/R1BQKBNR b KQkq - 0 5',
        lastMove: 'b2c3',
        marks: ['f2f3:blue', 'e2e4:blue', 'c3:yellow', 'c4:yellow', 'b7b6'],
        caption: 'Nimzo-Ấn, biến Sämisch: 1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.a3 Bxc3+ 5.bxc3. Trắng có cặp tượng và trung tâm, nên muốn mở thế cờ bằng f3 và e4 (mũi tên xanh dương). Đen có cấu trúc tốt hơn: tốt chồng c3-c4 (vòng vàng) là mục tiêu, nên Đen giữ thế cờ đóng và dồn quân vào c4 bằng ...b6, ...Ba6, ...Nc6-a5. Mỗi bên chơi theo mất cân bằng của mình. Bấm “▶ Chạy” để xem hai kế hoạch đi song song.',
        intro: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'a3', 'Bxc3+', 'bxc3'],
        line: ['b6', 'f3', 'Ba6', 'e4', 'Nc6', 'Bg5', 'Na5'],
        lineNotes: [
          'Chuẩn bị đưa tượng ra a6.',
          'Trắng chuẩn bị e4.',
          'Tượng đánh tốt c4.',
          'Trắng dựng trung tâm lớn.',
          'Mã sẽ đi tiếp tới a5.',
          'Tượng ghim mã f6 vào hậu d8.',
          'Tượng a6 và mã a5 cùng đánh tốt c4.',
        ],
      },
      {
        kind: 'text',
        md: `### "Nước mơ ước"
Hỏi: nếu được đi 3 nước liên tiếp, bạn đặt quân ở đâu? Rồi tìm cách tiến tới đó. Kỹ thuật này tạo ra kế hoạch khi bạn bí.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbq1rk1/1p2bppp/p2p1n2/4p3/4P3/1NN5/PPP1BPPP/R1BQ1RK1 w - - 4 9',
        marks: ['c1g5:blue', 'c3d5:blue', 'd5:yellow'],
        caption: 'Najdorf: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be2 e5 7.Nb3 Be7 8.O-O O-O. Nếu được đi 3 nước liền, Trắng chọn Bg5, Bxf6 rồi Nd5: mã f6 giữ d5 bị đổi đi, mã trắng vào d5 (vòng vàng) nơi không tốt đen nào đuổi được, còn tượng ô đen của Đen bị chính tốt d6, e5 chặn. Trên thực tế Đen sẽ chống lại (...Be6, ...Nbd7 tranh ô d5), nhưng "nước mơ ước" đã cho Trắng một mục tiêu rõ ràng. Bấm “▶ Chạy” để xem Trắng thực hiện nó khi Đen có chống lại.',
        intro: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be2', 'e5', 'Nb3', 'Be7', 'O-O', 'O-O'],
        line: ['Bg5', 'Be6', 'a4', 'Nc6', 'Bxf6', 'Bxf6', 'Nd5'],
        lineNotes: [
          'Nước mơ ước thứ nhất.',
          'Đen tranh ô d5 bằng tượng.',
          'a4 ngăn ...b5.',
          '',
          'Đổi mã f6, quân đang giữ d5.',
          '',
          'Mã vào d5, nơi không tốt đen nào đuổi được nó.',
        ],
      },
      {
        kind: 'text',
        md: `### Ván mẫu
Học chiến lược hiệu quả nhất qua **ván có bình luận từng nước**. Logical Chess: Move by Move (Chernev) là lựa chọn số một; sau đó là tuyển tập ván Capablanca, Karpov.`,
      },
      { kind: 'puzzles', themes: ['middlegame', 'quietMove'], rating: [1600, 2000], count: 6, intro: 'Nước đi chiến lược: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: Logical Chess Move by Move (Chernev)', url: 'https://www.google.com/search?q=Logical+Chess+Move+by+Move+Chernev' },
      { label: 'Sách: My System (Nimzowitsch)', url: 'https://www.google.com/search?q=My+System+Nimzowitsch', note: 'Đọc sau Simple Chess và Capablanca, không đọc trước.' },
    ],
  },
];
