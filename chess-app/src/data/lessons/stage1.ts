import type { Lesson } from './types';

export const STAGE1: Lesson[] = [
  {
    id: 'opening-white-italian',
    stage: 1,
    title: 'Khai cuộc cho Trắng: Ván cờ Ý',
    summary: 'Một hệ thống duy nhất, dễ hiểu, dùng được tới 2000.',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `### Vì sao chọn Ván cờ Ý (1.e4 e5 2.Nf3 Nc6 3.Bc4)
- Tuân thủ mọi nguyên tắc: trung tâm, phát triển, nhập thành sớm.
- Tượng c4 nhắm vào f7, điểm yếu nhất của Đen.
- Kế hoạch rõ ràng, ít phải học thuộc.

### Kế hoạch "Ý chậm" (Giuoco Pianissimo)
Sau 3...Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O: Trắng chơi **Re1, Nbd2, Bb3, Nf1-g3, h3** rồi tùy tình hình đẩy d4. Ý tưởng: xây dựng chắc, đưa mã sang g3 hướng về vua Đen.

### Nếu Đen chơi 3...Nf6 (Hai Mã)
Người mới hay thích 4.Ng5 nhưng biến đó rất sắc và Đen có nhiều cách tốt. Ở trình độ này hãy chơi đơn giản **4.d3** rồi kế hoạch như trên.

### Bẫy cần biết
- Sau 3...Nd4 (Gambit Blackburne Shilling) đừng tham 4.Nxe5?? vì 4...Qg5! đánh cùng lúc mã e5 và tốt g2, Trắng mất quân. Đáp đúng là 4.Nxd4 exd4 5.O-O (rồi c3 hoặc d3); 4.O-O, 4.c3 hay 4.Nc3 cũng tốt.
- Nếu Đen đi ...Bg4 ghim mã f3 và Trắng đã có Nc3, hãy nhớ mẫu chiếu hết Légal ở bài tập dưới.`,
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d3', 'd7d6', 'e1g1', 'e8g8', 'f1e1', 'a7a6', 'b1d2', 'c5a7', 'c4b3', 'c8e6'],
        prompt: 'Đi lại kế hoạch Ý chậm cho Trắng: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O 7.Re1 a6 8.Nbd2 Ba7 9.Bb3 Be6.',
        explain: 'Trắng đã sẵn sàng: Nf1 rồi Ng3, h3, và d4 khi thích hợp. Tượng lui b3 trước để ...d5 hay ...Na5 không đuổi được với nhịp; nếu Đen đổi ...Bxb3 thì Qxb3 vẫn tốt.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: 'rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6',
        moves: ['c4f7', 'e8e7', 'c3d5'],
        prompt: 'Chiếu hết Légal. Đen vừa tham ăn hậu bằng 5...Bxd1. Trắng chiếu hết trong 2 nước.',
        explain: '6.Bxf7+ Ke7 7.Nd5#. Ba quân nhẹ phối hợp chiếu hết vua đứng giữa bàn. Mẫu này xảy ra khi Đen ghim mã f3 bằng Bg4 quá sớm.',
        verify: 'mate',
      },
      {
        kind: 'task',
        fen: 'r1bqkbnr/pppp1ppp/8/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        moves: ['f3d4', 'e5d4', 'e1g1'],
        alternatives: ['e1g1', 'c2c3', 'b1c3'],
        prompt: 'Đen đi 3...Nd4?! (Blackburne Shilling). Trắng đáp đúng.',
        explain: 'Nxd4 exd4 rồi O-O (sau đó c3 hoặc d3): Trắng phát triển bình thường và hơn chút. O-O, c3, Nc3 ngay cũng được. Tuyệt đối không 4.Nxe5?? Qg5!.',
        verify: 'best',
      },
      {
        kind: 'puzzles',
        themes: ['attackingF2F7', 'opening'],
        rating: [900, 1300],
        count: 6,
        intro: 'Khai thác f7/f2 trong khai cuộc: 6 bài.',
      },
    ],
    resources: [
      { label: 'Wikibooks: Italian Game', url: 'https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bc4', note: 'Lý thuyết mở, miễn phí (CC BY-SA).' },
      { label: 'Lichess Opening Explorer', url: 'https://lichess.org/analysis#explorer', note: 'Xem thống kê nước đi của kiện tướng và người chơi cùng trình độ.' },
    ],
  },

  {
    id: 'opening-black-e4',
    stage: 1,
    title: 'Khai cuộc cho Đen chống 1.e4: 1...e5',
    summary: 'Chơi đối xứng, lành mạnh, học được nhiều về trung cuộc mở.',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `### Vì sao 1...e5
Đen cũng chiếm trung tâm và phát triển tự nhiên. Các phòng thủ bất đối xứng (Sicilian, French) rất tốt nhưng đòi hỏi hiểu biết cấu trúc tốt; để sau 1500.

### Chống Ý (3.Bc4): 3...Bc5
Đi gương Trắng: ...Nf6, ...d6, ...O-O, ...a6, ...Ba7. Nếu Trắng đi c3 và d4 sớm: 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Bd2 Bxd2+ 8.Nbxd2 d5! Đen giải tỏa trung tâm và cân bằng. Nếu 6.e5 thì 6...d5!; nếu 7.Nc3 thì 7...Nxe4 (biến sắc, nên xem kỹ).

### Chống 4.Ng5 (nếu bạn đi 3...Nf6)
4...d5 5.exd5 **Na5!** (không 5...Nxd5? 6.Nxf7! Fried Liver). Sau 6.Bb5+ c6 7.dxc6 bxc6 Đen kém một tốt nhưng phát triển nhanh hơn, đủ bù đắp.

### Chống Ruy López (3.Bb5): 3...a6 4.Ba4 Nf6 5.O-O Be7
Rồi ...b5, ...d6, ...O-O. Đây là hệ thống đóng kinh điển, chơi theo nguyên tắc là đủ.

### Chống Scotch (3.d4): 3...exd4 4.Nxd4 Bc5
Tượng tấn công mã d4; sau 5.Be3 Qf6 6.c3 Nge7 Đen thoải mái. Nếu 5.Nb3 thì 5...Bb6; nếu 5.Nxc6 thì 5...Qf6.`,
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d4', 'e5d4', 'c3d4', 'c5b4', 'c1d2', 'b4d2', 'b1d2', 'd7d5'],
        prompt: 'Đi lại cho Đen: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Bd2 Bxd2+ 8.Nbxd2 d5.',
        explain: 'Đen đã đổi tượng và đánh d5 đúng lúc: trung tâm Trắng bị tấn công, Đen phát triển hết quân nhẹ.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: 'r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5',
        moves: ['c6a5'],
        alternatives: ['b7b5', 'c6d4'],
        prompt: 'Sau 4.Ng5 d5 5.exd5. Đen tìm nước đúng (không phải 5...Nxd5?).',
        explain: 'Na5! tấn công tượng c4. Nxd5? cho phép 6.Nxf7 Kxf7 7.Qf3+ với tấn công rất mạnh. b5 (Ulvestad) và Nd4 (Fritz) cũng chơi được nhưng sắc hơn và kém Na5 một chút.',
        verify: 'best',
      },
      {
        kind: 'puzzles',
        themes: ['opening', 'attackingF2F7'],
        rating: [1000, 1400],
        count: 6,
        intro: 'Khai cuộc mở: 6 bài khi đối phương vi phạm nguyên tắc.',
      },
    ],
    resources: [
      { label: 'Wikibooks: 1.e4 e5', url: 'https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5', note: 'Mọi biến chính kèm ý tưởng.' },
    ],
  },

  {
    id: 'opening-black-d4',
    stage: 1,
    title: 'Khai cuộc cho Đen chống 1.d4: Gambit Hậu từ chối',
    summary: 'Chắc chắn, tự nhiên, không cần nhớ nhiều.',
    minutes: 25,
    blocks: [
      {
        kind: 'text',
        md: `### Gambit Hậu từ chối (QGD): 1.d4 d5 2.c4 e6
Đen giữ tốt d5, phát triển ...Nf6, ...Be7, ...O-O, ...Nbd7, ...c6 hoặc ...c5. Tượng c8 là vấn đề duy nhất; giải quyết bằng ...b6 và ...Bb7, hoặc ...dxc4 rồi ...c5 hay ...e5 (giải phóng).

### Kế hoạch chính
- Nếu Trắng đổi cxd5 exd5 (Cấu trúc Carlsbad): tượng c8 đã thoát, tìm cách đưa ra f5 hoặc g4; mã f6-e4 hoặc đi ...Re8, ...Nf8, ...Ne6/...Ng6. Trắng thường tấn công thiểu số b4-b5.
- Nếu Trắng chơi Bg5: ...Be7, ...O-O, ...h6 rồi ...Nbd7, ...c6. Đừng sợ Bxf6: Đen có cặp tượng.
- Chống London (2.Bf4): ...c5, ...Nc6, ...Qb6 tấn công b2 sớm.

### Lỗi cần tránh
Đừng đi ...dxc4 sớm rồi cố giữ tốt bằng ...b5: Trắng mở cột a và lấy lại tốt với lợi thế.`,
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'c1g5', 'f8e7', 'e2e3', 'e8g8', 'g1f3', 'b8d7', 'a1c1', 'c7c6'],
        prompt: 'Đi lại cho Đen: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6.',
        explain: 'Thế cờ QGD chính thống. Kế hoạch tiếp theo của Đen: sau 8.Bd3 dxc4 9.Bxc4 thì ...Nd5 (đổi quân) rồi ...e5, hoặc ...b5; cũng có thể ...h6 trước.',
        verify: 'line',
      },
      {
        kind: 'puzzles',
        themes: ['queensideAttack', 'middlegame'],
        rating: [1000, 1400],
        count: 5,
        intro: 'Trung cuộc đóng: 5 bài chiến thuật cánh hậu.',
      },
    ],
    resources: [
      { label: "Wikibooks: Queen's Gambit Declined", url: 'https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._c4/2...e6' },
    ],
  },

  {
    id: 'tactics-3',
    stage: 1,
    title: 'Chiến thuật 3: đánh lạc hướng, dụ, diệt quân bảo vệ',
    summary: 'Ba kỹ thuật "phá phòng thủ" trước khi ra đòn.',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `### Tư duy chung
Khi đòn của bạn bị **một quân duy nhất** cản trở, hãy hỏi: làm sao đẩy nó đi (đánh lạc hướng), kéo vua/hậu vào ô xấu (dụ), hay đơn giản đổi nó đi (diệt quân bảo vệ)?

### Đánh lạc hướng (deflection)
Ép quân phòng thủ rời khỏi vị trí, thường bằng cách thí quân. Ví dụ kinh điển: hậu đối phương canh hàng cuối, bạn thí xe để kéo hậu đi rồi chiếu hết.

### Dụ (attraction / decoy)
Kéo vua hoặc hậu đến một ô cụ thể để đòn đôi hoặc chiếu hết xuất hiện. Thí một quân kéo vua (hoặc hậu) vào ô mà mã đòn đôi được vua và hậu là mẫu rất hay gặp.

### Diệt quân bảo vệ (removing the defender)
Bắt hoặc đổi quân đang bảo vệ mục tiêu. Hãy nhìn xem mỗi quân đối phương đang "làm việc" gì; quân nào làm hai việc là quân quá tải (overloaded).`,
      },
      { kind: 'puzzles', themes: ['deflection'], rating: [1000, 1400], count: 6, intro: 'Đánh lạc hướng: 6 bài.' },
      { kind: 'puzzles', themes: ['attraction'], rating: [1000, 1400], count: 6, intro: 'Dụ vua/hậu: 6 bài.' },
      { kind: 'puzzles', themes: ['capturingDefender'], rating: [1000, 1400], count: 6, intro: 'Diệt quân bảo vệ: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: Chess Tactics for Students (John Bain)', url: 'https://www.google.com/search?q=Chess+Tactics+for+Students+John+Bain', note: 'Có bản tiếng Anh dễ đọc, chia theo từng chủ đề chiến thuật.' },
    ],
  },

  {
    id: 'mating-patterns',
    stage: 1,
    title: 'Các mẫu chiếu hết kinh điển',
    summary: 'Nhận ra mẫu thì không cần tính.',
    minutes: 35,
    blocks: [
      {
        kind: 'text',
        md: `Mỗi mẫu dưới đây là một "hình ảnh" cần in vào đầu. Khi thấy đủ điều kiện (vua ở góc, tốt g/h, quân nào ở đâu) bạn sẽ tìm ra đòn ngay cả ở cờ chớp.`,
      },
      {
        kind: 'diagram',
        fen: '6rk/5Npp/8/8/8/8/8/6K1 b - - 0 1',
        caption: 'Chiếu hết ngạt (smothered mate): vua bị chính quân mình bao vây, mã chiếu hết. Thường đến từ Qg8+! Rxg8 Nf7#.',
        mate: true,
      },
      {
        kind: 'diagram',
        fen: '8/4N1pk/8/8/8/8/8/K6R b - - 0 1',
        caption: 'Mẫu Anastasia: mã e7 khóa g8 và g6, xe chiếu dọc cột h. Thường cần thí hậu ở h7 để mở cột.',
        mate: true,
      },
      {
        kind: 'diagram',
        fen: '7k/7R/5N2/8/8/8/8/K7 b - - 0 1',
        caption: 'Mẫu Ả Rập (Arabian mate): mã f6 bảo vệ xe h7 và khóa g8.',
        mate: true,
      },
      {
        kind: 'diagram',
        fen: '2kr4/3p4/B7/8/5B2/8/8/K7 b - - 0 1',
        caption: 'Mẫu Boden: hai tượng chéo nhau, vua nhập thành dài bị kẹt. Thường đến từ thí hậu Qxc6+! bxc6 Ba6#.',
        mate: true,
      },
      {
        kind: 'diagram',
        fen: '5rk1/5p1p/8/8/8/8/8/6QK b - - 0 1',
        caption: 'Hậu chiếu dọc cột g nhưng vua Đen còn chạy được sang h8 nên đây CHƯA phải mate. Trắng còn thiếu một quân khống chế h8. Kiểm tra kỹ các ô thoát trước khi thí quân.',
      },
      { kind: 'puzzles', themes: ['smotheredMate', 'arabianMate', 'anastasiaMate'], rating: [1000, 1500], count: 6, intro: 'Mẫu ngạt, Ả Rập, Anastasia: 6 bài.' },
      { kind: 'puzzles', themes: ['bodenMate', 'hookMate', 'dovetailMate', 'doubleBishopMate'], rating: [1000, 1500], count: 6, intro: 'Boden, móc, đuôi én, hai tượng: 6 bài.' },
      { kind: 'puzzles', themes: ['mateIn2'], rating: [1100, 1400], count: 8, intro: 'Tổng hợp chiếu hết 2 nước: 8 bài.' },
    ],
  },

  {
    id: 'rook-endings-1',
    stage: 1,
    title: 'Cờ tàn xe: Lucena và Philidor',
    summary: 'Hai thế cờ mọi kỳ thủ câu lạc bộ phải biết.',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `Cờ tàn xe là loại cờ tàn hay gặp nhất. Hai thế cờ dưới đây là nền móng: một thế để **thắng** khi hơn tốt, một thế để **hòa** khi kém tốt.

### Lucena (bên hơn tốt thắng)
Điều kiện:
- Tốt đã tới hàng 7, vua mình đứng ngay trước tốt ở hàng 8.
- Vua đối phương bị xe cắt, **giữa vua và tốt có ít nhất hai cột** (ở bài tập: tốt cột c, vua đen ở cột f, xe trắng giữ cột e).
- Không áp dụng cho tốt biên (cột a, h): vua bị kẹt ở góc.

Vấn đề của Trắng: vua bước ra khỏi ô phong cấp thì bị xe đen chiếu liên tục từ xa. Lời giải là **"xây cầu"**: đưa xe lên hàng 4 trước, rồi đưa vua ra; khi vua lùi tới hàng 5, xe bước vào giữa che chiếu và tốt phong hậu.

Nếu vua đối phương đứng quá gần (giữa vua và tốt chỉ có một cột), trước hết phải **chiếu đuổi nó ra xa** rồi mới xây cầu, nếu không đối phương đổi xe và vua họ bắt kịp tốt.

### Philidor (bên kém tốt hòa)
Điều kiện: vua phòng thủ đứng trên ô phong cấp, và **vua tấn công chưa lên được hàng 6**.
- Giai đoạn 1: xe phòng thủ giữ **hàng 6** (hàng thứ ba tính từ phía mình), không cho vua đối phương tiến lên.
- Giai đoạn 2: muốn tiến, đối phương buộc phải đẩy tốt lên hàng 6. Lúc đó tốt chiếm mất ô che của chính vua họ, nên xe lập tức **xuống tận cuối bàn và chiếu từ phía sau**. Vua không còn chỗ trốn: hòa.`,
      },
      {
        kind: 'task',
        fen: '2K5/2P2k2/8/8/8/8/r7/4R3 w - - 0 1',
        moves: ['e1e4', 'a2a1', 'c8d7', 'a1d1', 'd7c6', 'd1c1', 'c6d6', 'c1d1', 'd6c5', 'd1c1', 'e4c4'],
        prompt: 'Lucena: đi trọn cây cầu. Bước 1 đưa xe lên hàng 4; bước 2 vua ra bằng cột d; mỗi lần bị chiếu vua lùi dần xuống, đi chữ chi giữa cột c và cột d, không để xe đen ăn tốt c7; cuối cùng xe che chiếu.',
        explain: '1.Re4! Ra1 2.Kd7 Rd1+ 3.Kc6 Rc1+ 4.Kd6 Rd1+ 5.Kc5 Rc1+ 6.Rc4! Xe che chiếu, tốt c7 phong hậu ở nước sau. Chú ý 4.Kd5? Rxc7 chỉ hòa: vua phải giữ tốt. Xe phải lên hàng 4 trước khi vua ra: nếu vua ra ngay, các nước chiếu không bao giờ dứt. Trong thế này Trắng còn những cách thắng khác, nhưng cây cầu là kỹ thuật dùng được cho mọi tốt từ cột b đến cột g.',
        verify: 'line',
      },
      {
        kind: 'diagram',
        fen: '4k3/7R/r7/3KP3/8/8/8/8 w - - 0 1',
        caption: 'Philidor, giai đoạn 1. Xe đen ở a6 canh cả hàng 6 nên vua trắng không thể lên d6 hay e6. Trắng chỉ còn cách đẩy e6 để tiến.',
      },
      {
        kind: 'task',
        fen: '4k3/7R/r3P3/3K4/8/8/8/8 b - - 0 1',
        moves: ['a6a1', 'd5d6', 'a1d1', 'd6e5', 'd1e1', 'e5f6', 'e1f1'],
        prompt: 'Philidor, giai đoạn 2. Trắng vừa đẩy e6. Đưa xe xuống cuối bàn rồi chiếu vua trắng từ phía sau, mỗi lần nó tìm chỗ nấp.',
        explain: '1...Ra1! 2.Kd6 (dọa Rh8#) Rd1+ 3.Ke5 Re1+ 4.Kf6 Rf1+ và vua trắng không có chỗ nấp, vì tốt e6 đứng đúng ô lẽ ra che cho vua. Hòa. Ở thế này còn vài nước khác cũng giữ được hòa, nhưng "tốt lên hàng 6 thì xe xuống cuối bàn" là quy tắc dễ nhớ và luôn đúng.',
        verify: 'line',
      },
      { kind: 'puzzles', themes: ['rookEndgame'], rating: [1100, 1500], count: 6, intro: 'Chiến thuật trong cờ tàn xe: 6 bài.' },
      { kind: 'practice', ids: ['lucena', 'philidor'], intro: 'Hai thế cờ quan trọng nhất của cờ tàn Xe. Thắng Lucena khi cầm Trắng, rồi thủ hòa Philidor khi cầm Đen, trước một đối thủ không đi sai.' },
    ],
    resources: [
      { label: "Sách: Silman's Complete Endgame Course", url: 'https://www.google.com/search?q=Silman%27s+Complete+Endgame+Course', note: 'Chia theo Elo. Đọc đúng phần của bạn thôi.' },
    ],
  },

  {
    id: 'pawn-endings-2',
    stage: 1,
    title: 'Cờ tàn tốt nâng cao: tốt xa, đột phá, ô then chốt',
    summary: 'Biến hơn một tốt thành thắng.',
    minutes: 25,
    blocks: [
      {
        kind: 'text',
        md: `### Tốt thông xa (outside passed pawn)
Tốt thông ở cánh xa vua đối phương là "mồi nhử": vua họ phải chạy sang bắt, vua bạn ăn hết tốt cánh kia.

### Đột phá (breakthrough)
Khi tốt của hai bên đối diện nhau, thí hai tốt để tạo một tốt thông không ai cản được. Điều kiện: vua đối phương ở xa.

### Ô then chốt (key squares)
Với tốt ở hàng 2 đến hàng 4 (trừ tốt biên), ba ô cách tốt hai hàng phía trước là then chốt: vua tấn công đặt chân lên là thắng. Với tốt ở hàng 5 và hàng 6, cả ba ô ngay trước tốt cũng là then chốt.

### Tam giác (triangulation)
Khi cần "mất một nhịp" để giành đối vua, vua đi tam giác (3 nước về chỗ cũ) trong khi vua đối phương chỉ có 2 ô để đi.`,
      },
      {
        kind: 'task',
        fen: '7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1',
        moves: ['b5b6', 'a7b6', 'c5c6', 'b7c6', 'a5a6'],
        prompt: 'Đột phá kinh điển. Trắng đi và tạo tốt thông.',
        explain: '1.b6! Nếu axb6 2.c6! bxc6 3.a6 và tốt a phong hậu. Nếu cxb6 2.a6! bxa6 3.c6. Đen không cản được.',
        verify: 'best',
      },
      {
        kind: 'diagram',
        fen: '8/8/8/8/2k5/8/3P4/3K4 w - - 0 1',
        caption: 'Tốt d2 chưa đi: các ô then chốt là c4, d4, e4 (cách tốt hai hàng). Vua Đen đang chiếm c4 nên Trắng không thắng được dù đi trước.',
      },
      { kind: 'puzzles', themes: ['pawnEndgame'], rating: [1100, 1500], count: 6, intro: 'Cờ tàn tốt từ ván thật: 6 bài.' },
      { kind: 'practice', ids: ['kp-draw-rook-pawn', 'kp-win-opposition'] },
    ],
  },

  {
    id: 'strategy-basics',
    stage: 1,
    title: 'Chiến lược cơ bản: cột mở, tốt yếu, ô tiền đồn',
    summary: 'Khi không có đòn chiến thuật, làm gì?',
    minutes: 30,
    blocks: [
      {
        kind: 'text',
        md: `### Cột mở
Cột không còn tốt. Xe thuộc về cột mở, và từ đó xâm nhập hàng 7 ("xe hàng 7" tấn công tốt và vua). Ai chiếm cột mở trước có lợi thế.

### Tốt yếu
- **Tốt cô lập**: không có tốt bạn ở cột cạnh. Phải được bảo vệ bằng quân, ô trước nó là ô tiền đồn cho đối phương.
- **Tốt chồng**: hai tốt cùng cột, không bảo vệ được nhau.
- **Tốt lạc hậu**: tụt lại sau các tốt cột cạnh nên không tốt nào bảo vệ được, và ô trước nó bị tốt đối phương kiểm soát nên khó tiến.
Kế hoạch: tấn công tốt yếu bằng nhiều quân hơn số quân bảo vệ.

### Tốt thông
Tốt không có tốt đối phương nào cản ở phía trước (cả cột cạnh). "Tốt thông phải được đẩy" nhưng chỉ khi được hỗ trợ.

### Ô tiền đồn (outpost)
Ô trong trận địa đối phương, được tốt bạn bảo vệ, không bị tốt họ đuổi. Mã ở tiền đồn hàng 5-6 có thể mạnh ngang xe.

### Cặp tượng
Hai tượng ở thế cờ mở thường mạnh hơn tượng + mã hay hai mã. Khi có cặp tượng, hãy mở thế cờ; khi đối phương có, hãy đóng.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/pp2bppp/2n1pn2/8/3P4/2NB1N2/PP3PPP/R1BQR1K1 w - - 0 1',
        caption: 'Trắng có tốt cô lập d4: điểm yếu để tấn công, nhưng cho Trắng không gian, ô e5 cho mã và cột e nửa mở. Đen muốn đổi quân nhẹ và phong tỏa d5; Trắng muốn tấn công vua khi còn nhiều quân.',
      },
      {
        kind: 'diagram',
        fen: 'r2q1rk1/pp3pbp/3p2p1/3Np3/4P3/8/PPP2PPP/R2Q1RK1 w - - 0 1',
        caption: 'Mã d5 ở tiền đồn: tốt e4 bảo vệ, Đen không còn tốt c và tốt e đã qua e5 nên không tốt nào đuổi được. Tượng g7 đi ô đen, không đổi được mã, lại bị tốt e5 của chính mình chặn.',
      },
      { kind: 'puzzles', themes: ['quietMove'], rating: [1100, 1500], count: 6, intro: 'Nước lặng mang tính chiến lược: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: Chess Fundamentals (Capablanca), miễn phí', url: 'https://www.gutenberg.org/ebooks/33870', note: 'Public domain. Ngắn, rõ, vẫn là sách chiến lược nhập môn tốt nhất.' },
    ],
  },

  {
    id: 'analyze-your-games',
    stage: 1,
    title: 'Phân tích ván của chính mình',
    summary: 'Cách học nhanh nhất mà hầu hết người chơi bỏ qua.',
    minutes: 15,
    blocks: [
      {
        kind: 'text',
        md: `### Quy trình sau mỗi ván chậm
1. **Chưa bật engine.** Xem lại ván, ghi ra 3 chỗ bạn cảm thấy không chắc hoặc thế cờ xoay chuyển.
2. Tự tìm nước tốt hơn ở 3 chỗ đó.
3. Vào tab **Phân tích** của app: nhập ván từ Lichess/Chess.com hoặc chơi với máy rồi bấm "Phân tích toàn ván".
4. So sánh: chỗ nào engine đánh dấu sai nghiêm trọng (??) mà bạn không nhận ra? Đó chính là **lỗ hổng kiến thức** của bạn.
5. Mỗi lỗi lớn được app đưa vào mục **"Lỗi của chính bạn"** ở tab Tập. Ôn lại khi tới hạn.

### Phân loại lỗi
- Lỗi chiến thuật (bỏ quân, không thấy đòn): tăng bài tập.
- Lỗi khai cuộc (thế cờ đã kém sau 10 nước đầu): xem lại bài khai cuộc, tra Opening Explorer.
- Lỗi cờ tàn (không thắng được thế thắng): học cờ tàn.
- Lỗi thời gian: tập quản lý thời gian.

Ghi lại lỗi lặp lại. Sau 20 ván, bạn sẽ thấy rõ 2-3 kiểu lỗi chiếm phần lớn thất bại.`,
      },
    ],
  },

  {
    id: 'time-and-mind',
    stage: 1,
    title: 'Thời gian và tâm lý thi đấu',
    summary: 'Chơi tốt không chỉ là biết nhiều.',
    minutes: 10,
    blocks: [
      {
        kind: 'text',
        md: `### Quản lý thời gian
- Khai cuộc quen thuộc: đi nhanh, dành thời gian cho trung cuộc.
- Nước quan trọng (đổi quân, cấu trúc tốt thay đổi, quyết định tấn công): dành 10-20% tổng thời gian.
- Dưới 1 phút với cờ chậm: chỉ đi nước an toàn, đừng tính biến phức tạp.
- Quy tắc: nếu đã nghĩ 5 phút mà không chọn được giữa hai nước, chọn nước đơn giản hơn.

### Tâm lý
- **Sau khi bỏ quân**: dừng 30 giây, thở, đánh giá lại thế cờ như mới. Rất nhiều ván thua là do sai lầm thứ hai ngay sau sai lầm thứ nhất.
- **Khi đang thắng**: nguy hiểm nhất. Đổi quân, đơn giản hóa, tránh biến phức tạp.
- **Khi đang thua**: làm thế cờ phức tạp, tạo vấn đề thực tế cho đối phương.
- Không chơi khi mệt hay tức giận: "tilt" phá hỏng rating nhanh hơn mọi thứ. Thua 2 ván liên tiếp: nghỉ.`,
      },
    ],
  },
];
