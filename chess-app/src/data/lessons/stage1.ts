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
- Kế hoạch rõ ràng, ít phải học thuộc.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        lastMove: 'f1c4',
        marks: ['c4f7:red', 'f7:yellow'],
        caption: 'Thế cờ sau 3.Bc4. Mũi tên đỏ: tượng c4 nhắm thẳng vào f7, ô lúc này chỉ có vua Đen bảo vệ.',
      },
      {
        kind: 'text',
        md: `### Kế hoạch "Ý chậm" (Giuoco Pianissimo)
Sau 3...Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O: Trắng chơi **Re1, Nbd2, Bb3, Nf1-g3, h3** rồi tùy tình hình đẩy d4. Ý tưởng: xây dựng chắc, đưa mã sang g3 hướng về vua Đen.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 2 7',
        lastMove: 'e8g8',
        marks: ['f1e1:blue', 'b1d2:blue', 'c4b3:blue', 'h2h3:blue'],
        caption: 'Thế cờ sau 6...O-O. Mũi tên xanh là các nước xây dựng của Trắng: Re1, Nbd2 (rồi mã đi tiếp f1-g3), Bb3 và h3.',
      },
      {
        kind: 'text',
        md: `### Nếu Đen chơi 3...Nf6 (Hai Mã)
Người mới hay thích 4.Ng5 nhưng biến đó rất sắc và Đen có nhiều cách tốt. Ở trình độ này hãy chơi đơn giản **4.d3** rồi kế hoạch như trên.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'g8f6',
        marks: ['d2d3', 'f3g5:red', 'e4:yellow'],
        caption: 'Sau 3...Nf6 mã đen đánh tốt e4 (vòng vàng). Mũi tên xanh: 4.d3 giữ tốt, đơn giản và chắc. Mũi tên đỏ: 4.Ng5 nhắm vào f7 nhưng dẫn tới các biến rất sắc.',
      },
      {
        kind: 'text',
        md: `### Bẫy cần biết
- Sau 3...Nd4 (Gambit Blackburne Shilling) đừng tham 4.Nxe5? vì 4...Qg5! đánh cùng lúc mã e5 và tốt g2. Trắng phải trả lại mã, chỉ được một hai tốt bù. Đáp đúng là 4.Nxd4 exd4 5.O-O (rồi c3 hoặc d3); 4.O-O, 4.c3 hay 4.Nc3 cũng tốt.
- Nếu Đen đi ...Bg4 ghim mã f3 và Trắng đã có Nc3, hãy nhớ mẫu chiếu hết Légal ở bài tập dưới.`,
      },
      {
        kind: 'diagram',
        fen: 'r1b1kbnr/pppp1ppp/8/4N1q1/2BnP3/8/PPPP1PPP/RNBQK2R w KQkq - 1 5',
        lastMove: 'd8g5',
        marks: ['g5e5:red', 'g5g2:red'],
        caption: 'Sau 4.Nxe5? Qg5! hậu đen đánh cùng lúc mã e5 và tốt g2. Nếu Trắng còn tham 5.Nxf7? thì 5...Qxg2 6.Rf1 Qxe4+ 7.Be2 Nf3# chiếu hết.',
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
        explain: 'Nxd4 exd4 rồi O-O (sau đó c3 hoặc d3): Trắng phát triển bình thường và hơn chút. O-O, c3, Nc3 ngay cũng được. Đừng tham 4.Nxe5? vì 4...Qg5! và Trắng mất mã lấy tốt.',
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
        md: `### Vì sao 1.e4 e5
Đen cũng chiếm trung tâm và phát triển tự nhiên. Sau 2.Nf3 Nc6 Trắng thường chọn một trong ba hệ thống dưới đây. Các phòng thủ bất đối xứng (Sicilian, French) rất tốt nhưng đòi hỏi hiểu biết cấu trúc tốt; để sau 1500.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        lastMove: 'b8c6',
        marks: ['f1c4:blue', 'f1b5:blue', 'd2d4:blue'],
        orientation: 'black',
        caption: 'Thế cờ sau 2...Nc6. Ba mũi tên xanh là ba hệ thống hay gặp của Trắng: 3.Bc4 (Ván cờ Ý), 3.Bb5 (Ruy López) và 3.d4 (Scotch).',
      },
      {
        kind: 'text',
        md: `### Chống Ý (3.Bc4): 3...Bc5
Đi gương Trắng: ...Nf6, ...d6, ...O-O, ...a6, ...Ba7. Nếu Trắng đi c3 và d4 sớm: 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Bd2 Bxd2+ 8.Nbxd2 d5! Đen giải tỏa trung tâm và cân bằng. Nếu 6.e5 thì 6...d5!; nếu 6.cxd4 Bb4+ 7.Nc3 thì 7...Nxe4 (biến sắc, nên xem kỹ).`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqk2r/ppp2ppp/2n2n2/3p4/2BPP3/5N2/PP1N1PPP/R2QK2R w KQkq - 0 9',
        lastMove: 'd7d5',
        marks: ['d5e4:blue', 'd5c4:blue'],
        orientation: 'black',
        caption: 'Sau 8...d5! tốt d5 đánh cùng lúc tốt e4 và tượng c4 (mũi tên xanh). Trung tâm Trắng bị phá và thế cờ cân bằng.',
      },
      {
        kind: 'text',
        md: `### Nếu bạn đi 3...Nf6 (Hai Mã) và Trắng chơi 4.Ng5
4...d5 5.exd5 **Na5!** (không 5...Nxd5? 6.Nxf7! Fried Liver). Sau 5...Na5 6.Bb5+ c6 7.dxc6 bxc6 Đen kém một tốt nhưng phát triển nhanh hơn, đủ bù đắp.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkb1r/ppp2ppp/5n2/n2Pp1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 1 6',
        lastMove: 'c6a5',
        marks: ['a5c4:red'],
        orientation: 'black',
        caption: 'Sau 5...Na5! mã đánh tượng c4 (mũi tên đỏ), Trắng phải mất nhịp lo cho tượng. Đen tạm kém một tốt nhưng phát triển nhanh, thế cờ gần cân bằng.',
      },
      {
        kind: 'diagram',
        fen: 'r1bqkb1r/ppp2Npp/2n5/3np3/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 6',
        lastMove: 'g5f7',
        marks: ['f7d8:red', 'f7h8:red'],
        orientation: 'black',
        caption: 'Vì sao không 5...Nxd5?: 6.Nxf7! mã đánh đôi hậu d8 và xe h8 (mũi tên đỏ). Nếu 6...Kxf7 thì 7.Qf3+ kéo vua Đen ra giữa bàn, Trắng có thế công nguy hiểm.',
      },
      {
        kind: 'text',
        md: `### Chống Ruy López (3.Bb5): 3...a6 4.Ba4 Nf6 5.O-O Be7
Rồi ...b5, ...d6, ...O-O. Đây là hệ thống đóng kinh điển, chơi theo nguyên tắc là đủ.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 4 6',
        lastMove: 'f8e7',
        marks: ['b7b5:blue', 'd7d6:blue', 'e8g8:blue'],
        orientation: 'black',
        caption: 'Thế cờ sau 5...Be7. Mũi tên xanh là kế hoạch tiếp theo của Đen: ...b5 đuổi tượng a4, ...d6 giữ e5 và nhập thành ngắn.',
      },
      {
        kind: 'text',
        md: `### Chống Scotch (3.d4): 3...exd4 4.Nxd4 Bc5
Tượng tấn công mã d4; sau 5.Be3 Qf6 6.c3 Nge7 Đen thoải mái. Nếu 5.Nb3 thì 5...Bb6; nếu 5.Nxc6 thì 5...Qf6.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5',
        lastMove: 'f8c5',
        marks: ['c5d4:red'],
        orientation: 'black',
        caption: 'Sau 4...Bc5 tượng đánh ngay mã d4 (mũi tên đỏ). Trắng phải giữ mã bằng 5.Be3, lui 5.Nb3 hoặc đổi 5.Nxc6.',
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        moves: ['e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d4', 'e5d4', 'c3d4', 'c5b4', 'c1d2', 'b4d2', 'b1d2', 'd7d5'],
        prompt: 'Đi lại cho Đen: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Bd2 Bxd2+ 8.Nbxd2 d5.',
        explain: 'Đen đã đổi tượng và đánh d5 đúng lúc: trung tâm Trắng bị tấn công, Đen phát triển hết quân nhẹ.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: 'r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5',
        moves: ['c6a5'],
        alternatives: ['b7b5', 'c6d4'],
        prompt: 'Sau 4.Ng5 d5 5.exd5. Ăn lại bằng 5...Nxd5? là sai vì 6.Nxf7!. Tìm nước khác cho Đen: phản công, đừng thụ động.',
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
Đen giữ tốt d5, phát triển ...Nf6, ...Be7, ...O-O, ...Nbd7, ...c6 hoặc ...c5. Tượng c8 là vấn đề duy nhất; giải quyết bằng ...b6 và ...Bb7, hoặc ...dxc4 rồi ...c5 hay ...e5 (giải phóng).`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
        lastMove: 'e7e6',
        marks: ['c8:red', 'e6:yellow'],
        orientation: 'black',
        caption: 'Thế cờ sau 2...e6. Tốt e6 (vòng vàng) giữ chắc d5 nhưng chặn đường chéo của tượng c8 (vòng đỏ): đây là quân khó phát triển nhất của Đen.',
      },
      {
        kind: 'text',
        md: `### Kế hoạch chính
- Nếu Trắng đổi cxd5 exd5 (Cấu trúc Carlsbad): tượng c8 đã thoát, tìm cách đưa ra f5 hoặc g4; mã f6-e4 hoặc đi ...Re8, ...Nf8, ...Ne6/...Ng6. Trắng thường tấn công thiểu số b4-b5.
- Nếu Trắng chơi Bg5: ...Be7, ...O-O, ...h6 rồi ...Nbd7, ...c6. Đừng sợ Bxf6: Đen có cặp tượng.
- Chống London (2.Bf4): ...c5, ...Nc6, ...Qb6 tấn công b2 sớm.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqrnk1/pp2bppp/2p2n2/3p2B1/3P4/2NBPN2/PPQ2PPP/R4RK1 w - - 2 11',
        lastMove: 'd7f8',
        marks: ['c8g4:blue', 'f6e4:blue', 'b2b4:red'],
        orientation: 'black',
        caption: 'Cấu trúc Carlsbad sau 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 Be7 6.e3 O-O 7.Bd3 Nbd7 8.Qc2 Re8 9.Nf3 c6 10.O-O Nf8. Mũi tên xanh: đường c8-g4 đã mở cho tượng, mã f6 có thể nhảy vào e4. Mũi tên đỏ: Trắng chuẩn bị tấn công thiểu số b4-b5.',
      },
      {
        kind: 'diagram',
        fen: 'r1b1kbnr/pp2pppp/1qn5/2pp4/3P1B2/2P1P3/PP3PPP/RN1QKBNR w KQkq - 1 5',
        lastMove: 'd8b6',
        marks: ['b6b2:red'],
        orientation: 'black',
        caption: 'Chống London: 1.d4 d5 2.Bf4 c5 3.e3 Nc6 4.c3 Qb6. Tượng c1 đã ra f4 nên tốt b2 không còn quân nào bảo vệ; hậu b6 đánh vào nó (mũi tên đỏ).',
      },
      {
        kind: 'text',
        md: `### Lỗi cần tránh
Đừng đi ...dxc4 sớm rồi cố giữ tốt bằng ...b5: Trắng mở cột a và lấy lại tốt với lợi thế.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/p1p1pppp/8/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR b KQkq - 0 4',
        lastMove: 'a2a4',
        marks: ['a4b5:red', 'b2b3:blue'],
        orientation: 'black',
        caption: 'Ví dụ 1.d4 d5 2.c4 dxc4 3.e3 b5? 4.a4!: tốt a4 đánh vào chân tốt b5 (mũi tên đỏ). Nếu 4...c6 5.axb5 cxb5? thì 6.Qf3! đánh xe a8 và Trắng thắng quân; b3 (mũi tên xanh) cũng phá tốt c4.',
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
        moves: ['d7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'c1g5', 'f8e7', 'e2e3', 'e8g8', 'g1f3', 'b8d7', 'a1c1', 'c7c6'],
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
Khi đòn của bạn bị **một quân duy nhất** cản trở, hãy hỏi: làm sao đẩy nó đi (đánh lạc hướng), kéo vua/hậu vào ô xấu (dụ), hay đơn giản đổi nó đi (diệt quân bảo vệ)?`,
      },
      {
        kind: 'text',
        md: `### Đánh lạc hướng (deflection)
Ép quân phòng thủ rời khỏi vị trí, thường bằng cách thí quân: quân phòng thủ ăn quân thí thì bỏ mặc thứ nó đang giữ. Hay gặp: hậu đối phương canh hàng cuối, bạn thí xe kéo hậu đi rồi chiếu hết.`,
      },
      {
        kind: 'example',
        id: 'cZjMw',
        caption: 'Xe f4 của Trắng chỉ có Vua e3 bảo vệ. Đen thí Xe để kéo Vua đi chỗ khác.',
        notes: ['Thí Xe ở d3, chiếu Vua.', 'Vua ăn Xe, và rời khỏi e3, nơi nó đang bảo vệ Xe f4.', 'Xe f4 không còn ai bảo vệ: Vua đen ăn nó.'],
      },
      { kind: 'puzzles', themes: ['deflection'], rating: [1000, 1400], count: 6, intro: 'Đánh lạc hướng: 6 bài.' },
      {
        kind: 'text',
        md: `### Dụ (attraction / decoy)
Kéo vua hoặc hậu đến một ô cụ thể để đòn đôi hoặc chiếu hết xuất hiện. Thí một quân kéo vua (hoặc hậu) vào ô mà mã đòn đôi được vua và hậu là mẫu rất hay gặp.`,
      },
      {
        kind: 'example',
        id: 'fS5i6',
        caption: 'Hàng cuối của Đen chỉ có Xe f8 canh. Trắng thí Hậu để kéo Vua về f8.',
        notes: ['Thí Hậu, ăn Xe f8 kèm chiếu.', 'Vua buộc phải ăn lại, và bị kéo về f8.', 'Xe chiếu hết: Tốt h6 giữ ô g7, còn Tốt e7, f7 của chính Đen chắn đường.'],
      },
      { kind: 'puzzles', themes: ['attraction'], rating: [1000, 1400], count: 6, intro: 'Dụ vua/hậu: 6 bài.' },
      {
        kind: 'text',
        md: `### Diệt quân bảo vệ (removing the defender)
Bắt hoặc đổi quân đang bảo vệ mục tiêu. Hãy nhìn xem mỗi quân đối phương đang "làm việc" gì; quân nào làm hai việc là quân quá tải (overloaded).`,
      },
      {
        kind: 'example',
        id: 'DbnYx',
        caption: 'Tượng c4 của Trắng chỉ có Hậu d4 bảo vệ. Đen đổi đúng quân bảo vệ đó.',
        notes: ['Đen đổi Hậu.', 'Trắng ăn lại bằng Tốt c3.', 'Tượng c4 mất người bảo vệ: Mã ăn không.'],
      },
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
        marks: ['f7h8:red', 'g8:yellow', 'g7:yellow', 'h7:yellow'],
        caption: 'Chiếu hết ngạt (smothered mate): vua bị chính quân mình bao vây (vòng vàng), mã chiếu hết (mũi tên đỏ). Thường đến từ Qg8+! Rxg8 Nf7#.',
        mate: true,
      },
      {
        kind: 'diagram',
        fen: '8/4N1pk/8/8/8/8/8/K6R b - - 0 1',
        marks: ['h1h7:red', 'g8:yellow', 'g6:yellow'],
        caption: 'Mẫu Anastasia: mã e7 khóa g8 và g6 (vòng vàng), xe chiếu dọc cột h (mũi tên đỏ). Thường cần thí hậu ở h7 để mở cột.',
        mate: true,
      },
      {
        kind: 'diagram',
        fen: '7k/7R/5N2/8/8/8/8/K7 b - - 0 1',
        marks: ['h7h8:red', 'f6h7', 'f6g8'],
        caption: 'Mẫu Ả Rập (Arabian mate): xe h7 chiếu (mũi tên đỏ), mã f6 vừa bảo vệ xe vừa khóa g8 (mũi tên xanh lá).',
        mate: true,
      },
      {
        kind: 'diagram',
        fen: '2kr4/3p4/B7/8/5B2/8/8/K7 b - - 0 1',
        marks: ['a6c8:red', 'f4b8:blue'],
        caption: 'Mẫu Boden: tượng a6 chiếu (mũi tên đỏ), tượng f4 khóa c7 và b8 (mũi tên xanh); xe d8 và tốt d7 của Đen chặn nốt đường thoát. Thường đến từ thí hậu Qxc6+! bxc6 Ba6#.',
        mate: true,
      },
      {
        kind: 'diagram',
        fen: '5rk1/5p1p/8/8/8/8/8/6QK b - - 0 1',
        marks: ['g1g8:red', 'h8:yellow'],
        caption: 'Hậu chiếu dọc cột g (mũi tên đỏ) nhưng vua Đen còn chạy được sang h8 (vòng vàng) nên đây CHƯA phải mate. Trắng còn thiếu một quân khống chế h8. Kiểm tra kỹ các ô thoát trước khi thí quân.',
      },
      { kind: 'puzzles', themes: ['smotheredMate', 'arabianMate', 'anastasiaMate'], rating: [1000, 1500], count: 6, intro: 'Mẫu ngạt, Ả Rập, Anastasia: 6 bài.' },
      { kind: 'puzzles', themes: ['bodenMate', 'doubleBishopMate'], rating: [1000, 1500], count: 6, intro: 'Chiếu hết bằng hai tượng, như mẫu Boden ở trên: 6 bài.' },
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

Nếu vua đối phương đứng quá gần (giữa vua và tốt chỉ có một cột), trước hết phải **chiếu đuổi nó ra xa** rồi mới xây cầu, nếu không đối phương đổi xe và vua họ bắt kịp tốt.`,
      },
      {
        kind: 'diagram',
        fen: '2K5/2P2k2/8/8/8/8/r7/4R3 w - - 0 1',
        marks: ['e1e8:blue', 'd7:yellow', 'e7:yellow'],
        caption: 'Thế Lucena của bài tập: tốt c7, vua trắng c8 đứng ngay trước tốt. Xe e1 cắt vua đen theo cột e (mũi tên xanh), giữa vua đen và tốt có hai cột d và e (vòng vàng). Trắng thắng.',
      },
      {
        kind: 'diagram',
        fen: '8/2k2P2/8/5K2/5R2/8/8/5r2 b - - 0 1',
        lastMove: 'd4f4',
        marks: ['f4:yellow', 'f7f8:blue'],
        caption: 'Cây cầu, cùng kỹ thuật với tốt cột f: xe trắng đã lên hàng 4 trước, giờ bước sang f4 (vòng vàng) che chiếu cho vua f5. Xe đen hết nước chiếu, tốt f7 sẽ phong hậu.',
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
        kind: 'text',
        md: `### Philidor (bên kém tốt hòa)
Điều kiện: vua phòng thủ đứng trên ô phong cấp, và **vua tấn công chưa lên được hàng 6**.
- Giai đoạn 1: xe phòng thủ giữ **hàng 6** (hàng thứ ba tính từ phía mình), không cho vua đối phương tiến lên.
- Giai đoạn 2: muốn tiến, đối phương buộc phải đẩy tốt lên hàng 6. Lúc đó tốt chiếm mất ô che của chính vua họ, nên xe lập tức **xuống tận cuối bàn và chiếu từ phía sau**. Vua không còn chỗ trốn: hòa.`,
      },
      {
        kind: 'diagram',
        fen: '4k3/7R/r7/3KP3/8/8/8/8 w - - 0 1',
        marks: ['a6h6:blue', 'd6:yellow', 'e6:yellow'],
        caption: 'Philidor, giai đoạn 1. Xe đen ở a6 canh cả hàng 6 (mũi tên xanh) nên vua trắng không thể lên d6 hay e6 (vòng vàng). Trắng chỉ còn cách đẩy e6 để tiến, và đó là lúc xe đen xuống cuối bàn.',
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
Tốt thông ở cánh xa vua đối phương là "mồi nhử": vua họ phải chạy sang bắt, vua bạn ăn hết tốt cánh kia.`,
      },
      {
        kind: 'diagram',
        fen: '8/8/6p1/4k2p/P7/4K2P/6P1/8 w - - 0 1',
        marks: ['a4a8:blue', 'g6:red', 'h5:red'],
        caption: 'Tốt a4 là tốt thông xa (mũi tên xanh: đường phong cấp). Vua Đen phải chạy sang cột a để bắt nó, trong lúc đó vua Trắng sang ăn tốt g6, h5 (vòng đỏ). Trắng thắng.',
      },
      {
        kind: 'text',
        md: `### Đột phá (breakthrough)
Khi tốt của hai bên đối diện nhau, thí hai tốt để tạo một tốt thông không ai cản được. Điều kiện: vua đối phương ở xa.`,
      },
      {
        kind: 'task',
        fen: '7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1',
        moves: ['b5b6', 'a7b6', 'c5c6', 'b7c6', 'a5a6'],
        prompt: 'Đột phá kinh điển. Trắng đi và tạo tốt thông bằng cách thí tốt (đi vua thì chưa phải lời giải).',
        explain: '1.b6! Nếu axb6 2.c6! bxc6 3.a6 và tốt a phong hậu. Nếu cxb6 2.a6! bxa6 3.c6. Đen không cản được.',
        verify: 'line',
      },
      {
        kind: 'text',
        md: `### Ô then chốt (key squares)
Với tốt ở hàng 2 đến hàng 4 (trừ tốt biên), ba ô cách tốt hai hàng phía trước là then chốt: vua tấn công đặt chân lên là thắng. Với tốt ở hàng 5 và hàng 6, cả ba ô ngay trước tốt cũng là then chốt.`,
      },
      {
        kind: 'diagram',
        fen: '8/8/8/8/2k5/8/3P4/3K4 w - - 0 1',
        marks: ['c4:yellow', 'd4:yellow', 'e4:yellow'],
        caption: 'Tốt d2 chưa đi: các ô then chốt là c4, d4, e4 (vòng vàng, cách tốt hai hàng). Vua Đen đang chiếm c4 nên Trắng không thắng được dù đi trước.',
      },
      {
        kind: 'diagram',
        fen: '4k3/8/5K2/4P3/8/8/8/8 b - - 0 1',
        marks: ['d6:yellow', 'e6:yellow', 'f6:yellow', 'd7:yellow', 'e7:yellow', 'f7:yellow'],
        caption: 'Tốt e5 ở hàng 5: ô then chốt là d6, e6, f6 và d7, e7, f7 (vòng vàng). Vua Trắng đã đứng trên f6 nên Trắng thắng, dù Đen đi trước.',
      },
      {
        kind: 'text',
        md: `### Tam giác (triangulation)
Khi cần "mất một nhịp" để giành đối vua, vua đi tam giác (3 nước về chỗ cũ) trong khi vua đối phương chỉ có 2 ô để đi.`,
      },
      { kind: 'puzzles', themes: ['pawnEndgame'], rating: [1100, 1500], count: 6, intro: 'Cờ tàn tốt: 6 bài.' },
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
Cột không còn tốt. Xe thuộc về cột mở, và từ đó xâm nhập hàng 7 ("xe hàng 7" tấn công tốt và vua). Ai chiếm cột mở trước có lợi thế.`,
      },
      {
        kind: 'diagram',
        fen: '5rk1/pp3ppp/2p5/8/8/2P5/PP3PPP/3R2K1 w - - 0 1',
        marks: ['d1d7:blue', 'b7:red', 'f7:red'],
        caption: 'Cột d đã mở và xe trắng chiếm nó trước. Mũi tên xanh: Rd7 xâm nhập hàng 7, tấn công các tốt b7, f7 (vòng đỏ); xe f8 của Đen bị động.',
      },
      {
        kind: 'text',
        md: `### Tốt yếu
- **Tốt cô lập**: không có tốt bạn ở cột cạnh. Phải được bảo vệ bằng quân, ô trước nó là ô tiền đồn cho đối phương.
- **Tốt chồng**: hai tốt cùng cột, không bảo vệ được nhau.
- **Tốt lạc hậu**: tụt lại sau các tốt cột cạnh nên không tốt nào bảo vệ được, và ô trước nó bị tốt đối phương kiểm soát nên khó tiến.
Kế hoạch: tấn công tốt yếu bằng nhiều quân hơn số quân bảo vệ.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/pp2bppp/2n1pn2/8/3P4/2NB1N2/PP3PPP/R1BQR1K1 w - - 0 1',
        marks: ['d4:red', 'd5:yellow', 'e5:blue'],
        caption: 'Trắng có tốt cô lập d4 (vòng đỏ): điểm yếu để tấn công, nhưng cho Trắng không gian, ô e5 cho mã (vòng xanh) và cột e nửa mở. Đen muốn đổi quân nhẹ và phong tỏa ô d5 (vòng vàng); Trắng muốn tấn công vua khi còn nhiều quân.',
      },
      {
        kind: 'diagram',
        fen: '6k1/pp3ppp/3p4/4p3/2P1P3/1P6/PP3PPP/6K1 w - - 0 1',
        marks: ['b2:red', 'b3:red', 'd6:red', 'd5:yellow'],
        caption: 'Tốt chồng b2, b3 của Trắng và tốt lạc hậu d6 của Đen (vòng đỏ). Không tốt đen nào bảo vệ được d6, còn ô d5 trước nó bị tốt c4, e4 kiểm soát (vòng vàng) nên d6 khó tiến.',
      },
      {
        kind: 'text',
        md: `### Tốt thông
Tốt không có tốt đối phương nào cản ở phía trước (cả cột cạnh). "Tốt thông phải được đẩy" nhưng chỉ khi được hỗ trợ.`,
      },
      {
        kind: 'diagram',
        fen: '6k1/pp3ppp/8/3Pp3/4P3/8/PP3PPP/6K1 w - - 0 1',
        marks: ['d5d8:blue', 'e4d5'],
        caption: 'Tốt d5 là tốt thông: trên cột c, d, e phía trước nó không có tốt đen nào (mũi tên xanh là đường phong cấp). Tốt e4 bảo vệ nó (mũi tên xanh lá), nên tốt d5 có hỗ trợ để tiến dần.',
      },
      {
        kind: 'text',
        md: `### Ô tiền đồn (outpost)
Ô trong trận địa đối phương, được tốt bạn bảo vệ, không bị tốt họ đuổi. Mã ở tiền đồn hàng 5-6 có thể mạnh ngang xe.`,
      },
      {
        kind: 'diagram',
        fen: 'r2q1rk1/pp3pbp/3p2p1/3Np3/4P3/8/PPP2PPP/R2Q1RK1 w - - 0 1',
        marks: ['d5:yellow', 'e4d5'],
        caption: 'Mã d5 ở tiền đồn (vòng vàng): tốt e4 bảo vệ, Đen không còn tốt c và tốt e đã qua e5 nên không tốt nào đuổi được. Tượng g7 đi ô đen, không đổi được mã, lại bị tốt e5 của chính mình chặn.',
      },
      {
        kind: 'text',
        md: `### Cặp tượng
Hai tượng ở thế cờ mở thường mạnh hơn tượng + mã hay hai mã. Khi có cặp tượng, hãy mở thế cờ; khi đối phương có, hãy đóng.`,
      },
      {
        kind: 'diagram',
        fen: '6k1/1p1b1ppp/p4n2/8/8/3BB3/PP3PPP/6K1 w - - 0 1',
        marks: ['d3h7:blue', 'e3a7:blue'],
        caption: 'Thế cờ mở, trung tâm không còn tốt: hai tượng trắng quét những đường chéo dài trên cả hai màu ô (mũi tên xanh). Quân bằng nhau nhưng Trắng nhỉnh hơn tượng + mã của Đen.',
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
5. Mỗi lỗi lớn được app đưa vào mục **"Lỗi của chính bạn"** ở tab Tập. Ôn lại khi tới hạn.`,
      },
      {
        kind: 'text',
        md: `### Phân loại lỗi
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
- Quy tắc: nếu đã nghĩ 5 phút mà không chọn được giữa hai nước, chọn nước đơn giản hơn.`,
      },
      {
        kind: 'text',
        md: `### Tâm lý
- **Sau khi bỏ quân**: dừng 30 giây, thở, đánh giá lại thế cờ như mới. Rất nhiều ván thua là do sai lầm thứ hai ngay sau sai lầm thứ nhất.
- **Khi đang thắng**: nguy hiểm nhất. Đổi quân, đơn giản hóa, tránh biến phức tạp.
- **Khi đang thua**: làm thế cờ phức tạp, tạo vấn đề thực tế cho đối phương.
- Không chơi khi mệt hay tức giận: "tilt" phá hỏng rating nhanh hơn mọi thứ. Thua 2 ván liên tiếp: nghỉ.`,
      },
    ],
  },
];
