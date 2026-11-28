import type { Lesson } from './types';

export const STAGE1: Lesson[] = [
  {
    id: 'opening-white-italian',
    stage: 1,
    title: 'Khai cuộc cho Trắng: Ván cờ Ý',
    summary: 'Một hệ thống duy nhất, dễ hiểu, dùng được tới 2000.',
    minutes: 40,
    blocks: [
      {
        kind: 'text',
        md: `### Vì sao chọn Ván cờ Ý (Italian Game)
Ván cờ Ý bắt đầu bằng 1.e4 e5 2.Nf3 Nc6 3.Bc4. Lý do nên chọn:
- Đúng mọi nguyên tắc khai cuộc: tốt ở trung tâm, mã và tượng ra nhanh, tới nước 4 đã nhập thành được.
- Tượng c4 nhắm vào f7, ô yếu nhất của Đen lúc đầu ván vì chỉ có vua bảo vệ.
- Có một kế hoạch chung (c3, d3, nhập thành rồi xây dựng) dùng được cho hầu hết các cách đáp của Đen, nên ít phải học thuộc.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        marks: ['f7:yellow'],
        caption: 'Bấm “▶ Chạy” để xem năm nước đầu của Ván cờ Ý và lý do của từng nước. Ô vàng f7 là mục tiêu của Trắng.',
        line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
        lineNotes: [
          'Tốt chiếm trung tâm và mở đường cho tượng f1 và hậu.',
          'Đen cũng chiếm trung tâm bằng tốt e5.',
          'Mã ra và đánh ngay tốt e5: Đen phải dùng nước tiếp theo để giữ nó.',
          'Mã đen ra bảo vệ e5. Cả hai bên vừa phát triển vừa giữ trung tâm.',
          'Tượng ra đường chéo c4-f7, nhắm vào f7. Ô f1 đã trống, Trắng sẵn sàng nhập thành.',
        ],
      },
      {
        kind: 'text',
        md: `### Sau 3.Bc4: Đen có ba cách đáp chính
- **3...Bc5** (Giuoco Piano, tiếng Ý nghĩa là "ván cờ êm"): tượng đen ra c5, nhắm vào f2 y như tượng Trắng nhắm f7. Phổ biến nhất, học ở các trang tiếp.
- **3...Nf6** (Phòng thủ Hai Mã, Two Knights Defense): mã đen đánh ngay tốt e4.
- **3...Nd4?!** (Gambit Blackburne Shilling): một cái bẫy, có trang riêng ở cuối bài.

Gặp nước khác (3...Be7, 3...d6) cứ chơi theo kế hoạch chung: c3, d3, nhập thành.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        lastMove: 'f1c4',
        marks: ['c4f7:red', 'f7:yellow'],
        caption: 'Thế cờ sau 3.Bc4. Mũi tên đỏ: tượng c4 nhắm thẳng vào f7, ô lúc này chỉ có vua Đen bảo vệ.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
      },
      {
        kind: 'text',
        md: `### Ý chậm (Giuoco Pianissimo): sáu nước đầu
Sau 3...Bc5, cách dễ nhất cho người mới là **Ý chậm**: không vội đánh nhau, đưa quân ra đúng chỗ rồi mới mở thế cờ. Hai nước chìa khóa của Trắng là **c3** và **d3**:
- **c3** chuẩn bị đẩy d4 về sau: khi tốt d lên d4 sẽ có tốt c3 đỡ, nếu Đen ăn exd4 thì Trắng ăn lại bằng tốt cxd4 và có hai tốt ở trung tâm.
- **d3** giữ tốt e4 thật chắc, Trắng không phải lo các đòn đánh vào e4.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'f8c5',
        marks: ['c4f7:red', 'c5f2:red'],
        caption: 'Sau 3...Bc5 hai tượng cùng nhắm vào ô f của đối phương (mũi tên đỏ). Bấm “▶ Chạy” để xem sáu nước tiếp theo của Ý chậm và lý do từng nước.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
        line: ['c3', 'Nf6', 'd3', 'd6', 'O-O', 'O-O'],
        lineNotes: [
          'Tốt c3 chuẩn bị d4: tốt d sẽ có tốt c đỡ. Ô c3 không còn cho mã nữa, mã b1 sẽ ra d2.',
          'Mã đen ra, đánh tốt e4.',
          'Giữ tốt e4 và mở đường cho tượng c1. Chậm nhưng không để lại điểm yếu nào.',
          'Đen cũng giữ tốt e5 và mở đường cho tượng c8.',
          'Vua Trắng vào chỗ an toàn, xe ra f1.',
          'Đen cũng nhập thành. Đây là thế cờ gốc của Ý chậm, hai bên cân bằng.',
        ],
      },
      {
        kind: 'text',
        md: `### Kế hoạch của Trắng: xây dựng rồi mới mở
Sau sáu nước đó chưa có gì để ăn ngay. Trắng xây dựng theo thứ tự quen thuộc, mỗi nước một mục đích:
1. **Re1**: xe ra cột e, đỡ tốt e4 thêm một lần.
2. **Nbd2 rồi Nf1-g3**: mã hậu không có ô c3 (tốt c3 đứng đó) nên đi đường vòng d2-f1-g3, tới gần vua Đen.
3. **Bb3**: tượng lui trước một ô. Ở c4 nó có thể bị tốt Đen đuổi (...b5 hay ...d5), ở b3 nó vẫn nhắm f7 mà an toàn hơn.
4. **h3**: không cho mã, tượng Đen vào ô g4.

Xây xong, Trắng mới đẩy **d4** để chiếm trung tâm và mở thế cờ, khi mọi quân đã sẵn sàng.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 2 7',
        lastMove: 'e8g8',
        marks: ['f1e1:blue', 'b1d2:blue', 'c4b3:blue', 'h2h3:blue'],
        caption: 'Thế cờ sau 6...O-O. Mũi tên xanh là các nước xây dựng của Trắng: Re1, Nbd2 (rồi mã đi tiếp f1-g3), Bb3 và h3. Bấm “▶ Chạy” để xem cả kế hoạch đi lần lượt, kèm các nước đáp của Đen.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'O-O'],
        line: ['Re1', 'a6', 'Nbd2', 'Ba7', 'Bb3', 'h6', 'Nf1', 'Re8', 'Ng3', 'Be6', 'h3'],
        lineNotes: [
          'Xe ra cột e, đỡ tốt e4 thêm một lần. Khi cột e mở ra sau d4, xe đã đứng sẵn.',
          'Đen dọn ô a7 cho tượng: khi Trắng đẩy b4 hay d4, tượng lui a7 mà vẫn nhắm f2.',
          'Mã hậu ra d2 vì ô c3 đã có tốt. Từ d2 nó sẽ đi tiếp f1 rồi g3.',
          'Tượng lui trước về a7, an toàn trên cùng đường chéo a7-f2.',
          'Tượng lui trước về b3: vẫn nhắm f7 nhưng không còn sợ bị tốt Đen đuổi.',
          'Đen ngăn Bg5 (tốt h6 sẽ ăn), nước mà Trắng muốn dùng để ghim mã f6 vào hậu d8: mã không dám đi vì lộ hậu.',
          'Mã bắt đầu vòng d2-f1-g3. Ô d2 trống, tượng c1 có đường ra.',
          'Xe đen ra cột e, đỡ tốt e5 giống như xe Trắng đỡ e4.',
          'Mã tới g3, nhìn vào f5 và h5, gần vua Đen.',
          'Tượng đen ra, mời đổi lấy tượng b3: quân tấn công nguy hiểm nhất của Trắng.',
          'h3: không cho quân Đen vào g4. Thế xây dựng xong, máy chấm cân bằng (Trắng nhỉnh chút). Giờ Trắng chọn lúc đẩy d4.',
        ],
      },
      {
        kind: 'text',
        md: `### Đen muốn gì, và cấu trúc tốt
Đen cũng xây dựng y như vậy: ...a6 và ...Ba7 để giữ tượng, ...h6 để không bị **ghim** (quân bị đánh không dám chạy vì sau lưng là quân quý hơn), ...Re8, và ...Be6 để đổi bớt tượng c4 đang nhắm f7. Khi sẵn sàng, Đen tìm cách đẩy **...d5** để giành trung tâm.

**Cấu trúc tốt**: Trắng có chuỗi c3-d3-e4, Đen có d6-e5. Không bên nào có điểm yếu, nên ai lập kế hoạch tốt hơn sẽ hơn. Đừng tự phá cấu trúc bằng các nước tốt vô cớ.

Bài tập dưới: tự đi lại chín nước đầu của kế hoạch.`,
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d3', 'd7d6', 'e1g1', 'e8g8', 'f1e1', 'a7a6', 'b1d2', 'c5a7', 'c4b3', 'c8e6'],
        prompt: 'Đi lại kế hoạch Ý chậm cho Trắng: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O 7.Re1 a6 8.Nbd2 Ba7 9.Bb3 Be6.',
        explain: 'Trắng đã sẵn sàng: Nf1 rồi Ng3, h3, và d4 khi thích hợp. Tượng lui b3 trước để không bị tốt Đen đuổi với nhịp (...b5 hay ...d5); nếu Đen đổi ...Bxb3 thì Qxb3 vẫn tốt.',
        verify: 'line',
      },
      {
        kind: 'text',
        md: `### Sai lầm hay gặp của Trắng: 4.Ng5?
Người mới rất thích nhảy mã g5 ngay: mã cùng tượng c4 đánh f7 hai lần, dọa Nxf7 hoặc Bxf7+. Nhưng mã g5 không có quân nào bảo vệ, và ô g5 nằm trên đường chéo của hậu d8 (tốt e7 đã đi, đường chéo d8-g5 thông). Đen chỉ cần **4...Qxg5** là ăn không một mã.

Bài học: đừng tấn công bằng một hai quân khi các quân khác còn ở nhà, và trước khi đi luôn hỏi "ô mình tới có bị ăn không?".`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'f8c5',
        marks: ['f3g5:red', 'd8g5:red'],
        caption: 'Sau 3...Bc5: mũi tên đỏ là nước 4.Ng5? và đường hậu d8 nhìn tới g5. Bấm “▶ Chạy” để xem Trắng mất quân thế nào.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
        line: ['Ng5?', 'Qxg5', 'Bxf7+?', 'Kxf7'],
        lineNotes: [
          'Mã nhảy g5, cùng tượng c4 đánh f7. Nhưng g5 không được bảo vệ.',
          'Hậu ăn mã, lại đánh luôn tốt g2. Trắng mất mã mà không được gì.',
          'Tham tiếp Bxf7+ để "lấy lại chút gì đó" chỉ làm mất thêm tượng.',
          'Vua ăn tượng. Trắng mất hai quân nhẹ, chỉ được một tốt: gần như thua.',
        ],
      },
      {
        kind: 'text',
        md: `### Sai lầm hay gặp của Đen: 5...Ng4?!
Sau 4.c3 Nf6 5.d3, nhiều người cầm Đen đi **5...Ng4?!**: mã đi lần hai để cùng tượng c5 đánh f2, dọa Nxf2 đánh hậu và xe. Lúc này f2 chỉ có vua bảo vệ, nên lời dọa là thật.

Cách trừng phạt rất đơn giản: **nhập thành**. Xe f1 thêm vào bảo vệ f2, rồi **h3** đuổi mã về. Đen phí hai nhịp đi mã mà không được gì. Nếu Đen vẫn thí ...Nxf2 thì Rxf2 Bxf2+ Kxf2: Trắng được hai quân nhẹ đổi lấy xe và một tốt, máy chấm Trắng hơn khoảng một tốt rưỡi.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P1n1/2PP1N2/PP3PPP/RNBQK2R w KQkq - 1 6',
        lastMove: 'g8g4',
        marks: ['g4f2:red', 'c5f2:red', 'f2:yellow'],
        caption: 'Sau 5...Ng4?!: mã và tượng đen cùng đánh f2 (mũi tên đỏ). Bấm “▶ Chạy” để xem cách Trắng đáp.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'Ng4'],
        line: ['O-O', 'd6', 'h3', 'Nf6'],
        lineNotes: [
          'Nhập thành: giờ f2 có cả vua và xe bảo vệ, hai quân đánh và hai quân giữ.',
          'Đen thấy Nxf2 không còn lợi nên quay về phát triển.',
          'h3 đuổi mã g4.',
          'Mã về lại f6: Đen đi mã ba lần để về đúng chỗ cũ. Máy chấm Trắng hơn khoảng 0,7 tốt, thay vì khoảng 0,3 như thế cờ thường.',
        ],
      },
      {
        kind: 'text',
        md: `### Nếu Đen chơi 3...Nf6 (Phòng thủ Hai Mã)
Mã f6 đánh ngay tốt e4. Nhiều người mới thích đáp **4.Ng5** (mã cùng tượng đánh f7). Lần này mã f6 chắn đường chéo d8-g5 nên hậu không ăn được mã, và Đen có đáp tốt 4...d5 5.exd5 rồi thường thí tốt bằng 5...Na5 để đuổi tượng và ra quân nhanh. Đó là một **gambit**: thí tốt để đổi lấy nhịp phát triển. Biến này rất sắc, phải học thuộc nhiều, máy chấm cân bằng.

Ở trình độ này hãy chơi **4.d3**: giữ chắc tốt e4 rồi đi tiếp như Ý chậm (c3, nhập thành, Re1...).`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'g8f6',
        marks: ['d2d3', 'f3g5:red', 'e4:yellow'],
        caption: 'Sau 3...Nf6 mã đen đánh tốt e4 (vòng vàng). Mũi tên xanh: 4.d3 giữ tốt, đơn giản và chắc. Mũi tên đỏ: 4.Ng5 nhắm vào f7 nhưng dẫn tới các biến rất sắc. Bấm “▶ Chạy” để xem 4.d3 dẫn về Ý chậm.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'],
        line: ['d3', 'Bc5', 'c3', 'd6', 'O-O', 'O-O'],
        lineNotes: [
          'Giữ tốt e4 và mở đường cho tượng c1.',
          'Tượng đen ra c5, nhắm vào f2.',
          'c3 chuẩn bị d4 sau này, như kế hoạch Ý chậm.',
          'Đen giữ tốt e5 và mở đường cho tượng c8.',
          'Vua Trắng vào chỗ an toàn.',
          'Ra đúng thế cờ gốc của Ý chậm, chỉ khác thứ tự nước. Tiếp theo là Re1, Nbd2, Bb3...',
        ],
      },
      {
        kind: 'text',
        md: `### Khi Đen ghim mã bằng ...Bg4: mẫu Légal
Có khi Đen giữ e5 bằng 2...d6 thay cho 2...Nc6. Sau 1.e4 e5 2.Nf3 d6 3.Bc4 Bg4, tượng g4 **ghim** mã f3 vào hậu d1: nếu mã chạy thì hậu bị ăn.

Nhưng ghim vào hậu không phải ghim vào vua: mã vẫn được phép đi. Nếu sau 4.Nc3 Đen còn đi một nước chậm như 4...g6?, Trắng có đòn **5.Nxe5!**: bỏ hậu để ăn tốt e5. Đen ăn hậu thì bị chiếu hết trong hai nước (bạn tự tìm ở bài tập dưới); Đen không ăn hậu thì Trắng lấy lại quân và hơn một tốt.`,
      },
      {
        kind: 'diagram',
        fen: 'rn1qkbnr/ppp2p1p/3p2p1/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5',
        lastMove: 'g7g6',
        marks: ['g4d1:red', 'f3e5'],
        caption: 'Sau 1.e4 e5 2.Nf3 d6 3.Bc4 Bg4 4.Nc3 g6?: mũi tên đỏ là đường ghim từ tượng g4 tới hậu d1. Mũi tên xanh: 5.Nxe5! mặc kệ ghim. Bấm “▶ Chạy” để xem cách Đen đáp tốt nhất.',
        intro: ['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6'],
        line: ['Nxe5', 'dxe5', 'Qxg4'],
        lineNotes: [
          'Mã bỏ f3, ăn tốt e5. Hậu d1 bị tượng g4 đánh, nhưng nếu Đen ăn hậu thì có chiếu hết hai nước.',
          'Đen không tham hậu mà ăn lại mã.',
          'Hậu ăn tượng g4: Trắng lấy lại quân, hơn một tốt và ra quân nhanh hơn.',
        ],
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
        kind: 'text',
        md: `### Bẫy 3...Nd4 (Gambit Blackburne Shilling)
Sau 1.e4 e5 2.Nf3 Nc6 3.Bc4, Đen đi **3...Nd4?!**: mã đi lần thứ hai và bỏ mặc tốt e5. Theo nguyên tắc thì đây là nước kém (máy chấm Trắng hơn khoảng một tốt), nhưng nó giấu một cái bẫy.

Tốt e5 là **mồi**. Nếu Trắng ăn **4.Nxe5?**, Đen đáp **4...Qg5!**: hậu đánh cùng lúc hai thứ, mã e5 và tốt g2 (sau tốt g2 là xe h1). Trắng không giữ được cả hai. Tệ nhất là khi Trắng tham tiếp: bấm “▶ Chạy” dưới hình để xem cả cái bẫy, tới chiếu hết.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pppp1ppp/8/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'c6d4',
        marks: ['f3e5:red', 'e5:yellow'],
        caption: 'Sau 3...Nd4?!: tốt e5 (vòng vàng) không còn mã c6 bảo vệ, trông như ăn không (mũi tên đỏ). Đó là mồi.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nd4'],
        line: ['Nxe5?', 'Qg5', 'Nxf7?', 'Qxg2', 'Rf1?', 'Qxe4+', 'Be2?', 'Nf3#'],
        lineNotes: [
          'Trắng ăn tốt mồi. Mã e5 giờ không có quân nào bảo vệ.',
          'Hậu đánh hai thứ một lúc: mã e5 và tốt g2 (sau nó là xe h1).',
          'Trắng tham thêm: mã ăn f7, đánh hậu g5 và xe h8, nhưng bỏ mặc tốt g2.',
          'Hậu ăn g2 và đánh xe h1.',
          'Xe chạy, nhưng để mất tốt e4 kèm chiếu (6.d3 đỡ hơn, dù Trắng vẫn kém nhiều).',
          'Hậu ăn tốt e4, chiếu vua.',
          'Che chiếu bằng tượng là thua ngay (Qe2 thì mất hậu, cũng thua).',
          'Mã chiếu hết: tượng e2 bị hậu e4 ghim nên không ăn được mã, còn vua bị chính quân mình vây kín.',
        ],
      },
      {
        kind: 'text',
        md: `### Nếu lỡ ăn 4.Nxe5?, và cách đáp đúng
Đã lỡ 4.Nxe5? Qg5 thì cách đỡ tốt nhất là **5.O-O**: vua sang g1 giữ tốt g2, chịu mất mã. Trắng mất mã (3 điểm) chỉ đổi được tốt e5 (1 điểm), còn chút thế công nhờ ra quân nhanh, nhưng máy chấm Đen hơn.

Đáp đúng 3...Nd4 là **4.Nxd4 exd4 5.O-O**: đổi mất con mã đã đi hai lần của Đen, tốt e5 bị kéo lệch sang d4, Trắng vẫn có tốt e4 ở trung tâm và nhập thành ngay. Sau đó c3 đánh tốt d4. 4.O-O, 4.c3 hay 4.Nc3 ngay cũng tốt. Thử ở bài tập dưới.`,
      },
      {
        kind: 'diagram',
        fen: 'r1b1kbnr/pppp1ppp/8/4N1q1/2BnP3/8/PPPP1PPP/RNBQK2R w KQkq - 1 5',
        lastMove: 'd8g5',
        marks: ['g5e5:red', 'g5g2:red'],
        caption: 'Sau 4.Nxe5? Qg5! hậu đen đánh cùng lúc mã e5 và tốt g2 (mũi tên đỏ). Bấm “▶ Chạy” để xem cách đỡ ít thiệt nhất của Trắng.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nd4', 'Nxe5?', 'Qg5'],
        line: ['O-O', 'Qxe5', 'c3', 'Ne6', 'd4'],
        lineNotes: [
          'Nhập thành: vua g1 bảo vệ tốt g2. Mã e5 đành bỏ.',
          'Đen ăn mã. Trắng đổi mã lấy một tốt.',
          'Trắng đuổi mã d4, cố ra quân thật nhanh để bù lại.',
          'Mã lui e6, chắn đường chéo của tượng c4 tới f7.',
          'Tốt d4 đánh hậu. Trắng có thế công, nhưng vẫn thiếu một quân: máy chấm Đen hơn khoảng nửa tốt, trong khi nếu đáp đúng ở nước 4 thì Trắng hơn khoảng một tốt.',
        ],
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
    minutes: 40,
    blocks: [
      {
        kind: 'text',
        md: `### Vì sao trả lời 1.e4 bằng 1...e5
Khai cuộc có ba việc chính:
- **Trung tâm**: bốn ô d4, e4, d5, e5. Quân đứng ở đây đi được nhiều hướng nhất, tốt ở đây giành chỗ cho quân mình.
- **Phát triển**: đưa mã, tượng ra khỏi hàng cuối để chúng tham chiến.
- **Nhập thành**: nước đặc biệt đưa vua vào góc an toàn và đưa xe ra giữa.

1...e5 làm được cả ba: chiếm ngay một ô trung tâm, mở đường cho tượng f8 để Đen sớm nhập thành ngắn. Sau 2.Nf3 (mã đánh tốt e5), 2...Nc6 giữ tốt bằng một quân vừa phát triển: không mất nước nào. Các phòng thủ bất đối xứng như Sicilia (1...c5) hay Pháp (1...e6) rất tốt nhưng cần hiểu cấu trúc tốt; để sau 1500.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        lastMove: 'e2e4',
        marks: ['e7e5:blue', 'b8c6'],
        orientation: 'black',
        caption: 'Thế cờ sau 1.e4. Mũi tên xanh dương: 1...e5 chiếm trung tâm; mũi tên xanh lá: mã b8 sẽ ra c6 giữ tốt đó. Bấm “▶ Chạy” để xem lý do từng nước.',
        intro: ['e4'],
        line: ['e5', 'Nf3', 'Nc6'],
        lineNotes: [
          'Tốt e5 chiếm một ô trung tâm, chặn tốt e4 tiến tiếp và mở đường cho hậu d8 và tượng f8.',
          'Mã trắng phát triển và đánh ngay tốt e5, lúc này chưa có quân nào giữ.',
          'Mã c6 vừa ra quân vừa giữ e5, lại nhìn vào ô d4. Giờ Trắng chọn hệ thống ở nước 3.',
        ],
      },
      {
        kind: 'text',
        md: `### Trắng chọn gì ở nước 3
- **3.Bc4 (Ván cờ Ý, Italian Game)**: tượng nhắm vào f7, ô yếu nhất của Đen vì lúc đầu chỉ có vua giữ.
- **3.Bb5 (Ruy López, còn gọi là Ván cờ Tây Ban Nha)**: tượng đánh mã c6, quân đang giữ e5.
- **3.d4 (Ván cờ Scotland, Scotch)**: mở trung tâm ngay.

Mỗi hệ thống dưới đây có một cách đáp cho Đen kèm ý đồ của nó. Nếu Trắng đi khác (2.Nc3, 2.Bc4, 3.Nc3...), cứ theo nguyên tắc: ra mã (...Nf6, ...Nc6), ra tượng, nhập thành.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        lastMove: 'b8c6',
        marks: ['f1c4:blue', 'f1b5:blue', 'd2d4:blue'],
        orientation: 'black',
        intro: ['e4', 'e5', 'Nf3', 'Nc6'],
        caption: 'Thế cờ sau 2...Nc6. Ba mũi tên xanh là ba hệ thống hay gặp của Trắng: 3.Bc4 (Ván cờ Ý), 3.Bb5 (Ruy López) và 3.d4 (Scotch).',
      },
      {
        kind: 'text',
        md: `### Chống Ván cờ Ý (3.Bc4): 3...Bc5
3...Bc5 (Giuoco Piano, "ván cờ êm"): tượng đen ra đường chéo a7-g1, nhắm vào f2 y như tượng trắng nhắm f7.

Khi Trắng chơi chậm (c3, d3), kế hoạch của Đen là **...Nf6, ...d6, ...O-O, ...a6, ...Ba7, ...h6** rồi **...Be6** để đổi tượng c4, quân tấn công tốt nhất của Trắng. Trắng thì đi Re1, Nbd2-f1-g3, h3 rồi chờ lúc đẩy d4 (xem bài Ván cờ Ý).

Thuật ngữ: **nhịp** là một nước đi. "Đuổi quân với nhịp" là vừa đuổi quân đối phương vừa làm được việc có ích, khiến đối phương mất một nước. Các nước ...a6, ...Ba7 dưới đây là để tượng đen không bị đuổi với nhịp.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        lastMove: 'f1c4',
        marks: ['f8c5:blue', 'c4f7:red'],
        orientation: 'black',
        caption: 'Thế cờ sau 3.Bc4. Mũi tên đỏ: tượng trắng nhắm f7. Mũi tên xanh: 3...Bc5 đáp lại bằng cách nhắm f2. Bấm “▶ Chạy” để xem cách Đen dàn quân khi Trắng chơi chậm.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
        line: ['Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'O-O', 'Re1', 'a6', 'Bb3', 'Ba7', 'h3', 'h6', 'Nbd2', 'Be6'],
        lineNotes: [
          'Tượng ra đường chéo a7-g1, nhắm vào f2: Đen chơi gương Trắng.',
          'Trắng chuẩn bị d4 để có hai tốt ở trung tâm.',
          'Mã ra và đánh ngay tốt e4, buộc Trắng lo giữ nó.',
          'Trắng chọn cách chậm: giữ e4 bằng tốt d.',
          'd6 giữ chắc e5 và mở đường cho tượng c8.',
          '',
          'Đen nhập thành: vua vào góc an toàn, xe f8 sẵn sàng ra trận.',
          '',
          'a6 dọn ô a7 cho tượng: khi Trắng đẩy b4 hay d4 đuổi tượng, nó có chỗ lui mà vẫn nhắm f2.',
          '',
          'Tượng lui sẵn về a7: sau này b4 hay d4 không còn đuổi nó với nhịp.',
          'h3 ngăn ...Bg4 ghim mã f3.',
          'Đen cũng ngăn Bg5 ghim mã f6 vào hậu d8.',
          '',
          'Be6 mời đổi tượng: nếu Bxe6 fxe6, cột f mở cho xe f8 và tốt e6 canh ô d5. Thế cờ gần cân bằng.',
        ],
      },
      {
        kind: 'text',
        md: `### Khi Trắng đẩy sớm 4.c3 và 5.d4
Sau 3...Bc5 4.c3 Nf6 5.d4 Trắng muốn hai tốt e4-d4 ở trung tâm để đẩy lùi quân Đen. Đen ăn 5...exd4, và sau 6.cxd4 thì 6...Bb4+: tượng tránh tốt d4 bằng nước chiếu. Sau 7.Bd2 Bxd2+ 8.Nbxd2 Đen đánh ngay **8...d5**, phá trung tâm trước khi Trắng kịp đẩy e5 hay d5.

Hai nhánh phụ cần nhớ (máy đều xác nhận là nước tốt nhất):
- 6.e5 (đuổi mã f6) thì 6...d5: tốt đánh tượng c4, mã f6 sẽ nhảy vào e4.
- 6.cxd4 Bb4+ 7.Nc3 thì 7...Nxe4: Đen ăn được tốt e4. Biến này sắc, nên xem kỹ trước khi dùng.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq - 0 5',
        lastMove: 'd2d4',
        marks: ['d4c5:red', 'e5d4:blue'],
        orientation: 'black',
        caption: 'Sau 5.d4 tốt d4 đánh cả tượng c5 lẫn tốt e5 (mũi tên đỏ). Đen ăn ngay 5...exd4 (mũi tên xanh). Bấm “▶ Chạy” để xem Đen phá trung tâm Trắng thế nào.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4'],
        line: ['exd4', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'd5', 'exd5', 'Nxd5', 'Qb3', 'Nce7', 'O-O', 'O-O'],
        lineNotes: [
          'Đen ăn tốt d4: không để Trắng ăn tượng hay đẩy tiếp.',
          'Trắng có hai tốt trung tâm e4, d4, và tốt d4 đang đánh tượng c5.',
          'Tượng tránh tốt d4 bằng nước chiếu: Trắng phải dùng một nước để che.',
          '',
          'Đổi tượng để giảm sức ép của Trắng.',
          '',
          'Đòn phá trung tâm: tốt d5 đánh cùng lúc tốt e4 và tượng c4.',
          '',
          'Mã đen chiếm ô d5 ngay giữa bàn.',
          'Hậu b3 cùng tượng c4 đánh mã d5, hậu còn nhìn tốt b7.',
          'Mã c6 lui e7 để giữ thêm mã d5.',
          '',
          'Hai bên đã nhập thành. Tốt d4 của Trắng là tốt cô lập (cột c và cột e bên cạnh không còn tốt trắng nào): Đen đặt quân ở ô d5 ngay trước nó. Thế cờ gần cân bằng.',
        ],
      },
      {
        kind: 'text',
        md: `### Nếu bạn chọn 3...Nf6 (Phòng thủ Hai Mã, Two Knights)
3...Nf6 phản công ngay tốt e4, chủ động hơn 3...Bc5 nhưng cho Trắng 4.Ng5: mã và tượng c4 cùng đánh f7, mà f7 chỉ có vua giữ.

Đáp tốt duy nhất là **4...d5**: tốt chặn đường chéo của tượng c4. Máy cho các nước khác (4...Bc5, 4...Nxe4) kém khoảng một tốt. Sau 5.exd5 Đen không ăn lại mà chơi **5...Na5**: mã đánh tượng c4. Đen chịu kém một tốt để phát triển nhanh hơn: đây là một **gambit** (thí tốt để đổi lấy phát triển nhanh hoặc thế tấn công). 5...Nxd5? là sai lầm điển hình, xem phần cuối bài.

Nếu Trắng đi chậm 4.d3 thì không có gì phải lo: 4...Bc5 hoặc 4...Be7 rồi dàn quân như ở trên.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4',
        lastMove: 'f3g5',
        marks: ['g5f7:red', 'c4f7:red', 'd7d5:blue'],
        orientation: 'black',
        caption: 'Thế cờ sau 4.Ng5. Mũi tên đỏ: mã g5 và tượng c4 cùng đánh f7. Mũi tên xanh: 4...d5 chặn đường của tượng. Bấm “▶ Chạy” để xem Đen thí tốt lấy nhịp phát triển.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5'],
        line: ['d5', 'exd5', 'Na5', 'Bb5+', 'c6', 'dxc6', 'bxc6', 'Be2', 'h6', 'Nf3', 'e4', 'Ne5', 'Bd6'],
        lineNotes: [
          'd5 chặn đường chéo của tượng c4 tới f7: giờ f7 chỉ còn bị mã g5 đánh, vua đủ giữ.',
          '',
          'Mã không ăn lại d5 mà đánh tượng c4: Trắng phải mất nhịp lo cho tượng.',
          'Tượng tránh mã bằng nước chiếu.',
          'Đen chặn chiếu bằng tốt, sẵn sàng thí tốt c.',
          '',
          'Đen kém một tốt, đổi lại tượng b5 lại bị đuổi và cột b nửa mở (không còn tốt đen) cho xe.',
          '',
          'h6 đuổi mã g5.',
          '',
          'e4 đuổi tiếp mã f3 và chiếm không gian.',
          '',
          'Tượng ra và đánh mã e5. Mã trắng đã đi bốn lần, còn hậu, tượng c1, mã b1 vẫn ở nhà: Đen phát triển nhanh hơn, đủ bù cho tốt.',
        ],
      },
      {
        kind: 'text',
        md: `### Chống Ruy López (3.Bb5): 3...a6
Tượng b5 đánh mã c6, quân đang giữ e5. Nhưng lúc này Trắng **chưa** dọa ăn e5 thật (xem mục sau), nên Đen hỏi tượng ngay bằng 3...a6, rồi 4.Ba4 Nf6 (mã ra, đánh e4) 5.O-O Be7 (chuẩn bị nhập thành).

Sau 6.Re1 xe giữ tốt e4, và **bây giờ** Bxc6 rồi Nxe5 thành đòn dọa thật. Vì thế Đen đi 6...b5 đuổi tượng khỏi đường chéo a4-e8 (6...d6 cũng được). Nếu Đen vô tư nhập thành 6...O-O thì 7.Bxc6 rồi 8.Nxe5: Trắng ăn được tốt e5, máy cho Trắng hơn khoảng một tốt (6...b5 chỉ để Trắng hơn khoảng một phần ba tốt).

Kế hoạch sau đó: Đen ...d6, ...O-O, ...Na5 đuổi tượng b3 rồi ...c5 chiếm chỗ ở cánh hậu. Trắng c3, h3 rồi d4 lập trung tâm.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        lastMove: 'f1b5',
        marks: ['b5c6:red', 'e5:yellow', 'a7a6:blue'],
        orientation: 'black',
        caption: 'Thế cờ sau 3.Bb5. Tượng đánh mã c6 (mũi tên đỏ), quân giữ tốt e5 (vòng vàng). Mũi tên xanh: 3...a6 hỏi tượng ngay. Bấm “▶ Chạy” để xem cách dàn quân kinh điển của Đen.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
        line: ['a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Na5', 'Bc2', 'c5'],
        lineNotes: [
          'a6 hỏi tượng: lui hay đổi lấy mã.',
          'Tượng lui, vẫn đứng trên đường chéo nhìn mã c6.',
          'Mã ra và đánh tốt e4.',
          'Trắng nhập thành, chưa cần giữ e4: nếu ...Nxe4 thì Re1 hoặc d4 lấy lại tốt.',
          'Tượng ra e7, chuẩn bị nhập thành.',
          'Xe giữ e4. Giờ Bxc6 rồi Nxe5 là đòn dọa thật.',
          'b5 đuổi tượng khỏi đường chéo a4-e8, gỡ đòn dọa đó.',
          'Tượng lui b3, vẫn nhắm f7.',
          'd6 giữ chắc e5 và mở đường cho tượng c8.',
          'c3 chuẩn bị d4, và cho tượng b3 ô c2 để lui về.',
          'Đen nhập thành.',
          'h3 ngăn ...Bg4 ghim mã f3.',
          'Mã đuổi tượng b3 khỏi đường chéo nhắm f7.',
          '',
          'c5 chiếm chỗ ở cánh hậu và nhắm vào ô d4. Đây là thế Ruy López đóng kinh điển: Trắng sẽ d4, Đen giữ e5. Trắng nhỉnh hơn chút ít, như ở hầu hết khai cuộc chính.',
        ],
      },
      {
        kind: 'text',
        md: `### Đừng sợ 4.Bxc6: Trắng chưa ăn được e5
Nhiều người cầm Trắng đổi 4.Bxc6 rồi tưởng mã c6 mất thì tốt e5 hết người giữ. Đen ăn lại 4...dxc6 (bằng tốt d, để mở đường cho hậu d8 và tượng c8; máy cũng chọn nước này). Nếu Trắng tham 5.Nxe5? thì **5...Qd4!** hậu đánh đôi mã e5 và tốt e4: Đen lấy lại tốt, máy cho Đen hơn khoảng nửa tốt.

Khi chưa có xe ở e1, tốt e4 của Trắng không được giữ, đó là lý do Đen chưa cần lo ở nước 3 và 4.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
        lastMove: 'a7a6',
        marks: ['b5c6:red'],
        orientation: 'black',
        caption: 'Thế cờ sau 3...a6. Nếu Trắng đổi Bxc6 (mũi tên đỏ) rồi ăn e5, hậu đen lấy lại tốt ngay. Bấm “▶ Chạy” để xem.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'],
        line: ['Bxc6', 'dxc6', 'Nxe5?', 'Qd4', 'Nf3', 'Qxe4+', 'Qe2', 'Qxe2+', 'Kxe2'],
        lineNotes: [
          'Trắng đổi tượng lấy mã: tốt e5 không còn mã giữ.',
          'Ăn lại bằng tốt d, mở đường cho hậu d8 và tượng c8.',
          'Trắng tham ăn tốt.',
          'Hậu đánh đôi: mã e5 và tốt e4 (tốt e4 không có quân nào giữ).',
          'Mã phải lui.',
          'Đen lấy lại tốt kèm nước chiếu.',
          '',
          '',
          'Vật chất bằng nhau, Đen có cặp tượng và vua trắng đã mất quyền nhập thành: Đen dễ chơi hơn.',
        ],
      },
      {
        kind: 'text',
        md: `### Chống Scotch (3.d4): 3...exd4 4.Nxd4 Bc5
3.d4 đánh e5 hai lần (tốt d4 và mã f3) mà chỉ có mã c6 giữ, nên Đen ăn 3...exd4. Sau 4.Nxd4 Trắng có tốt e4 ở trung tâm, Đen thì không; đổi lại Đen phát triển nhanh bằng **4...Bc5**: tượng ra quân và đánh ngay mã d4.

- 5.Be3 Qf6: hậu đánh thêm vào d4, Trắng phải giữ bằng 6.c3, rồi 6...Nge7 và nhập thành.
- 5.Nxc6 thì **5...Qf6**: dọa Qxf2# (f2 bị tượng c5 và hậu f6 đánh, chỉ có vua giữ). Trắng đỡ xong Đen mới ăn lại mã.
- 5.Nb3 thì 5...Bb6: tượng lui mà vẫn nhắm f2.

Nếu Trắng không ăn lại tốt mà thí: 4.Bc4 thì 4...Bc5 về thế cờ giống Ván cờ Ý; 4.c3 thì 4...Nf6 phát triển và đánh e4.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3',
        lastMove: 'd2d4',
        marks: ['d4e5:red', 'f3e5:red'],
        orientation: 'black',
        caption: 'Thế cờ sau 3.d4. Tốt e5 bị đánh hai lần (mũi tên đỏ), chỉ có mã c6 giữ: Đen ăn 3...exd4. Bấm “▶ Chạy” để xem Đen phát triển với nhịp.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'],
        line: ['exd4', 'Nxd4', 'Bc5', 'Be3', 'Qf6', 'c3', 'Nge7', 'Bc4', 'O-O', 'O-O'],
        lineNotes: [
          'Đen ăn tốt, không để mất e5.',
          'Trắng ăn lại, mã đứng giữa bàn.',
          'Tượng vừa ra quân vừa đánh mã d4: Đen phát triển với nhịp.',
          'Tượng e3 giữ mã d4.',
          'Hậu đánh thêm vào d4: giờ mã bị ba quân đen đánh (tượng c5, hậu f6, mã c6) mà chỉ có tượng e3 và hậu d1 giữ.',
          'Tốt c3 giữ mã d4 thêm một lần.',
          'Mã g8 ra e7 vì ô f6 đã có hậu.',
          '',
          'Đen nhập thành.',
          'Hai bên đã phát triển xong. Đen có thể ...Ne5 đuổi tượng c4 hoặc ...Bb6; thế cờ gần cân bằng.',
        ],
      },
      {
        kind: 'text',
        md: `### Sai lầm 1: giữ e5 bằng 2...f6?
Người mới hay giữ tốt e5 bằng 2...f6?. Nước này lấy mất ô f6 của mã và mở đường chéo h5-e8 tới vua. Trắng trừng phạt bằng **3.Nxe5!**: nếu 3...fxe5? thì 4.Qh5+ và vua Đen bị săn (máy cho Trắng hơn khoảng 2,5 tốt). Ngay cả nước tốt nhất 3...Qe7 cũng để Trắng hơn khoảng một tốt rưỡi.

Bài học: giữ tốt bằng quân vừa phát triển (2...Nc6), không bằng tốt làm yếu vua.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppp2pp/5p2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
        lastMove: 'f7f6',
        marks: ['f3e5:red', 'd1h5:red'],
        orientation: 'black',
        caption: 'Sau 2...f6? đường chéo d1-h5-e8 sắp mở tới vua đen. Bấm “▶ Chạy” để xem Trắng trừng phạt nếu Đen ăn mã.',
        intro: ['e4', 'e5', 'Nf3', 'f6?'],
        line: ['Nxe5', 'fxe5?', 'Qh5+', 'Ke7', 'Qxe5+', 'Kf7', 'Bc4+'],
        lineNotes: [
          'Mã ăn e5 dù tốt f6 đang giữ: ăn lại sẽ mở đường cho hậu trắng.',
          'Ăn mã là sai lầm (3...Qe7 đỡ hơn, dù Đen vẫn kém).',
          'Hậu chiếu trên đường chéo h5-e8: tốt f đã đi nên không còn gì che.',
          'Che bằng 4...g6 thì 5.Qxe5+ chiếu và đánh luôn xe h8.',
          'Hậu lấy lại mã kèm nước chiếu.',
          '',
          'Tượng chiếu tiếp: vua đen bị kéo ra giữa trong khi quân đen còn ở nhà. Máy cho Trắng hơn khoảng 2,5 tốt.',
        ],
      },
      {
        kind: 'text',
        md: `### Sai lầm 2: 5...Nxd5? trong Hai Mã (Gan rán, Fried Liver)
Sau 4.Ng5 d5 5.exd5, ăn lại 5...Nxd5? trông tự nhiên nhưng để mã d5 đứng trên đường chéo của tượng c4. Trắng thí mã 6.Nxf7!: nếu 6...Kxf7 thì 7.Qf3+ kéo vua ra e6 để giữ mã d5, và Trắng dồn quân tấn công. Máy cho Trắng hơn khoảng một tốt dù đã bỏ mã.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkb1r/ppp2Npp/2n5/3np3/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 6',
        lastMove: 'g5f7',
        marks: ['f7d8:red', 'f7h8:red'],
        orientation: 'black',
        caption: 'Sau 5...Nxd5? 6.Nxf7! mã đánh đôi hậu d8 và xe h8 (mũi tên đỏ). Nếu 6...Kxf7 thì 7.Qf3+ kéo vua đen ra giữa bàn. Bấm “▶ Chạy” để xem.',
        intro: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5?', 'Nxf7'],
        line: ['Kxf7', 'Qf3+', 'Ke6', 'Nc3'],
        lineNotes: [
          'Đen ăn mã, nhưng vua bị kéo ra f7.',
          'Hậu chiếu và đánh cả mã d5.',
          'Vua phải ra e6 để giữ mã d5, đứng ngay giữa bàn.',
          'Mã d5 bị tượng c4 ghim vào vua; Trắng dồn thêm quân đánh nó. Vua đen rất khó an toàn.',
        ],
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
    minutes: 35,
    blocks: [
      {
        kind: 'text',
        md: `### Gambit Hậu từ chối (Queen's Gambit Declined): 1.d4 d5 2.c4 e6
1...d5 chiếm một ô trung tâm và không cho Trắng dễ dàng đẩy e4 (ô e4 bị tốt d5 canh).

2.c4 gọi là **Gambit Hậu**. Gambit là nước thí tốt để đổi lấy trung tâm hoặc phát triển nhanh. Ở đây tốt c4 đánh d5, mời Đen ăn để Trắng chiếm trung tâm bằng e4. Thật ra "thí" chỉ là tạm thời: nếu Đen ăn 2...dxc4 thì rất khó giữ tốt đó (xem phần sai lầm).

2...e6 **từ chối** gambit: giữ d5 bằng tốt và mở đường cho tượng f8 để nhập thành sớm. Cái giá phải trả: tốt e6 chặn đường chéo của tượng c8, quân khó phát triển nhất của Đen trong khai cuộc này.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
        lastMove: 'd2d4',
        marks: ['d7d5:blue', 'e4:yellow'],
        orientation: 'black',
        caption: 'Thế cờ sau 1.d4. Mũi tên xanh: 1...d5 chiếm trung tâm và canh ô e4 (vòng vàng). Bấm “▶ Chạy” để xem lý do từng nước.',
        intro: ['d4'],
        line: ['d5', 'c4', 'e6'],
        lineNotes: [
          'Tốt d5 chiếm trung tâm, canh ô e4 và c4.',
          'Gambit Hậu: tốt c4 đánh d5, mời Đen ăn để Trắng chiếm trung tâm bằng e4.',
          'e6 giữ d5 bằng tốt và mở đường cho tượng f8. Nhược điểm: tốt e6 chặn đường chéo của tượng c8.',
        ],
      },
      {
        kind: 'text',
        md: `### Dàn quân chuẩn và cách giải phóng tượng c8
Đen phát triển **...Nf6, ...Be7, ...O-O, ...Nbd7, ...c6** rồi chờ. Hai ý quan trọng:
- **Đúng lúc thì ăn ...dxc4**: đợi Trắng đi tượng f1 (Bd3) rồi mới ăn. Tượng vừa đi một nước nay phải đi thêm một nước để ăn lại (Bxc4): Đen được một nhịp.
- **Thế chật thì đổi quân**: ...Nd5 đổi bớt quân nhẹ, rồi **...e5** mở đường cho tượng c8. Đây là cách giải phóng kinh điển.

Cách khác cho tượng c8: ...b6 rồi ...Bb7. Nếu Trắng ghim mã bằng Bg5 thì ...h6 hỏi tượng cũng hay: sau Bxf6 Bxf6 Đen có cặp tượng, thế cờ vẫn cân bằng.

Thuật ngữ: **ghim** là khi một quân bị đánh không đi được, vì sau lưng nó là quân quý hơn (vua, hậu).`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
        lastMove: 'e7e6',
        marks: ['c8:red', 'e6:yellow'],
        orientation: 'black',
        caption: 'Thế cờ sau 2...e6. Tốt e6 (vòng vàng) giữ chắc d5 nhưng chặn đường chéo của tượng c8 (vòng đỏ). Bấm “▶ Chạy” để xem Đen dàn quân rồi giải phóng tượng c8 bằng ...e5.',
        intro: ['d4', 'd5', 'c4', 'e6'],
        line: ['Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7', 'Rc1', 'c6', 'Bd3', 'dxc4', 'Bxc4', 'Nd5', 'Bxe7', 'Qxe7', 'O-O', 'Nxc3', 'Rxc3', 'e5'],
        lineNotes: [
          'Mã đánh thêm vào d5.',
          'Mã ra, giữ d5 và chuẩn bị nhập thành.',
          'Tượng ghim mã f6 vào hậu d8.',
          'Tượng chen vào e7 gỡ ghim, chuẩn bị nhập thành.',
          'Trắng mở đường cho tượng f1.',
          'Đen nhập thành: vua an toàn.',
          '',
          'Mã ra d7 chứ không ra c6, để không chắn tốt c: sau này nó hỗ trợ ...e5 hoặc ...c5.',
          'Xe lên cột c, đón trước lúc cột c mở.',
          'c6 giữ chắc d5 và chờ: Đen đợi tượng f1 đi rồi mới ăn c4.',
          '',
          'Đúng lúc: tượng vừa đi d3 nay phải đi thêm một nước để ăn lại, Đen được một nhịp.',
          '',
          'Mã vào d5 để đổi bớt quân: thế Đen hơi chật, đổi quân cho thoáng.',
          '',
          '',
          '',
          'Đổi tiếp một cặp mã.',
          '',
          'Đòn giải phóng: e5 mở đường chéo c8-h3 cho tượng. Đen đã giải quyết vấn đề khó nhất; Trắng chỉ còn nhỉnh hơn chút ít.',
        ],
      },
      {
        kind: 'text',
        md: `### Khi Trắng đổi cxd5: cấu trúc Carlsbad
Sau 3.Nc3 Nf6 4.cxd5 exd5 tốt e6 đã sang d5, nên **đường của tượng c8 mở ra**. Cấu trúc tốt này gọi là Carlsbad.

Kế hoạch của Đen: ...c6 giữ d5, ...Re8, mã b8 đi vòng d7-f8-g6 sang cánh vua, ...Ne4 khi có dịp để đổi quân, và tượng c8 ra f5 hoặc g4.

Kế hoạch của Trắng là **tấn công thiểu số** (minority attack): hai tốt a, b của Trắng tiến lên đánh ba tốt a, b, c của Đen, để sau khi đổi, Đen bị một tốt yếu ở c6 trên cột c nửa mở. Đen chuẩn bị bằng ...a6 để ăn lại b5 bằng tốt a, và phản công ở cánh vua.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqrnk1/pp2bppp/2p2n2/3p2B1/3P4/2NBPN2/PPQ2PPP/R4RK1 w - - 2 11',
        lastMove: 'd7f8',
        marks: ['c8g4:blue', 'f6e4:blue', 'b2b4:red'],
        orientation: 'black',
        caption: 'Cấu trúc Carlsbad sau 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 Be7 6.e3 O-O 7.Bd3 Nbd7 8.Qc2 Re8 9.Nf3 c6 10.O-O Nf8. Mũi tên xanh: đường c8-g4 đã mở cho tượng, mã f6 có thể nhảy vào e4. Mũi tên đỏ: Trắng chuẩn bị tấn công thiểu số b4-b5. Bấm “▶ Chạy” để xem hai kế hoạch chạy song song.',
        intro: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5', 'Be7', 'e3', 'O-O', 'Bd3', 'Nbd7', 'Qc2', 'Re8', 'Nf3', 'c6', 'O-O', 'Nf8'],
        line: ['Rab1', 'Ng6', 'b4', 'a6', 'a4', 'Ne4', 'Bxe7', 'Qxe7'],
        lineNotes: [
          'Xe sang b1, sau lưng tốt b: chuẩn bị b4-b5.',
          'Mã f8 tới g6, hướng về cánh vua và canh các ô e5, f4.',
          'Tấn công thiểu số bắt đầu.',
          'a6: khi tốt trắng tới b5, Đen ăn lại được bằng tốt a.',
          'Tốt a đi theo hỗ trợ b5.',
          'Mã nhảy vào e4, có tốt d5 giữ: mã cùng tượng e7 đánh tượng g5.',
          'Trắng đổi tượng.',
          'Đen đã đổi một cặp tượng; tiếp theo tượng c8 ra f5 hoặc g4. Trắng sẽ đẩy b5 ở cánh hậu, Đen dồn quân sang cánh vua: thế cờ gần cân bằng.',
        ],
      },
      {
        kind: 'text',
        md: `### Chống Hệ thống London (London System): ...c5, ...Nc6, ...Qb6
Rất nhiều người cầm Trắng ở trình độ này chơi London: tượng c1 ra f4 trước khi đẩy e3, rồi c3, Nf3, Bd3, Nbd2. Thế Trắng rất chắc, nên Đen phải chủ động:
- **...c5**: đánh tốt d4 từ bên cạnh, phá trung tâm thay vì ngồi chờ.
- **...Nc6**: thêm một quân đánh d4.
- **...Qb6**: tượng c1 đã rời hàng 1 nên tốt b2 không còn quân nào giữ. Nếu Trắng mải phát triển (5.Nf3?) thì 5...Qxb2 ăn được tốt, máy cho Đen hơn khoảng nửa tốt.

Thứ tự 2.Nf3 rồi 3.Bf4 cũng dẫn tới London; ý tưởng của Đen vẫn như vậy.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2',
        lastMove: 'c1f4',
        marks: ['c7c5:blue', 'b2:yellow'],
        orientation: 'black',
        caption: 'Thế cờ sau 1.d4 d5 2.Bf4. Tượng c1 đã ra, nên tốt b2 (vòng vàng) không còn quân nào giữ. Mũi tên xanh: 2...c5 phá trung tâm ngay. Bấm “▶ Chạy” để xem Đen tạo sức ép.',
        intro: ['d4', 'd5', 'Bf4'],
        line: ['c5', 'e3', 'Nc6', 'c3', 'Qb6', 'Qb3', 'c4', 'Qc2', 'Nf6'],
        lineNotes: [
          'c5 đánh tốt d4 từ bên cạnh.',
          'Trắng giữ d4 bằng tốt e.',
          'Mã ra và đánh thêm vào d4.',
          'Tốt c3 giữ d4 lần nữa: chuỗi tốt c3-d4-e3 rất chắc.',
          'Hậu đánh b2, tốt không còn quân nào giữ.',
          'Trắng giữ b2 và mời đổi hậu.',
          'Đen không đổi hậu (đổi thì Trắng ăn lại bằng tốt a, mở cột a cho xe) mà đẩy c4 đuổi hậu, chiếm thêm chỗ ở cánh hậu.',
          'Hậu lui c2.',
          'Đen phát triển tiếp: ...g6, ...Bg7 hoặc phá bằng ...e5. Cẩn thận: ...Bf5 lúc này mất tượng, vì hậu c2 nhìn thẳng tới ô f5.',
        ],
      },
      {
        kind: 'text',
        md: `### Sai lầm 1: ăn 2...dxc4 rồi cố giữ tốt
Ăn 2...dxc4 (Gambit Hậu chấp nhận) không sai, nếu sau đó Đen để Trắng lấy lại tốt và dùng thời gian đó phát triển (...Nf6, ...e6, ...c5). Sai lầm là cố giữ tốt bằng ...b5: Trắng phá bằng a4 và b3, mở cột a và lấy lại tốt với thế tốt hơn hẳn.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/p1p1pppp/8/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR b KQkq - 0 4',
        lastMove: 'a2a4',
        marks: ['a4b5:red', 'b2b3:blue'],
        orientation: 'black',
        caption: 'Ví dụ 1.d4 d5 2.c4 dxc4 3.e3 b5? 4.a4!: tốt a4 đánh vào chân tốt b5 (mũi tên đỏ); b3 (mũi tên xanh) là đòn phá thứ hai nhắm vào tốt c4. Nếu 4...c6 5.axb5 cxb5? thì 6.Qf3! đánh xe a8 và Trắng thắng quân. Bấm “▶ Chạy” để xem.',
        intro: ['d4', 'd5', 'c4', 'dxc4', 'e3', 'b5?', 'a4'],
        line: ['c6', 'axb5', 'cxb5?', 'Qf3'],
        lineNotes: [
          'Đen giữ tốt b5 bằng c6.',
          'Trắng ăn b5, mở cột a.',
          'Ăn lại bằng tốt c là sai: đường chéo dài từ f3 tới a8 mở toang.',
          'Hậu đánh xe a8. Chặn bằng ...Nc6 thì Qxc6+ ăn luôn mã: Trắng thắng quân.',
        ],
      },
      {
        kind: 'text',
        md: `### Bẫy nên biết: Bẫy Con Voi (Elephant Trap)
Sau 3.Nc3 Nf6 4.Bg5 Nbd7 5.cxd5 exd5, nhiều người cầm Trắng nghĩ mã f6 đang bị ghim nên ăn không tốt d5: **6.Nxd5??**. Nhưng mã f6 chỉ bị ghim vào hậu, không phải vào vua, nên vẫn đi được: **6...Nxd5! 7.Bxd8 Bb4+** và Trắng chỉ còn cách che bằng hậu 8.Qd2 Bxd2+ 9.Kxd2 Kxd8. Kết quả: Đen được một mã lấy một tốt.

Bài học: ghim vào vua thì quân bị ghim không được đi; ghim vào hậu thì đi được, chỉ cần có đòn bù lại.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bqkb1r/pppn1ppp/5n2/3p2B1/3P4/2N5/PP2PPPP/R2QKBNR w KQkq - 0 6',
        lastMove: 'e6d5',
        marks: ['g5d8:red', 'c3d5:red'],
        orientation: 'black',
        caption: 'Thế cờ sau 5...exd5. Tượng g5 ghim mã f6 vào hậu d8, và Trắng tưởng ăn được tốt d5 (mũi tên đỏ). Bấm “▶ Chạy” để xem Đen bỏ hậu để bắt lại nhiều hơn.',
        intro: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Nbd7', 'cxd5', 'exd5'],
        line: ['Nxd5?', 'Nxd5', 'Bxd8', 'Bb4+', 'Qd2', 'Bxd2+', 'Kxd2', 'Kxd8'],
        lineNotes: [
          'Trắng tưởng mã f6 bị ghim nên ăn tốt d5.',
          'Đen bỏ hậu: mã f6 chỉ bị ghim vào hậu, không phải vào vua, nên vẫn được đi.',
          'Trắng ăn hậu.',
          'Tượng chiếu: vua trắng không có ô chạy, chỉ còn cách che bằng hậu.',
          '',
          'Đen lấy lại hậu kèm nước chiếu.',
          '',
          'Vua ăn tượng d8. Đen được mã, Trắng chỉ được một tốt: Đen hơn hẳn một quân.',
        ],
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
        introFen: '5r1k/6pp/7N/8/2Q5/8/8/6K1 w - - 0 1',
        intro: ['Qg8+', 'Rxg8', 'Nf7#'],
      },
      {
        kind: 'diagram',
        fen: '8/4N1pk/8/8/8/8/8/K6R b - - 0 1',
        marks: ['h1h7:red', 'g8:yellow', 'g6:yellow'],
        caption: 'Mẫu Anastasia: mã e7 khóa g8 và g6 (vòng vàng), xe chiếu dọc cột h (mũi tên đỏ). Thường cần thí hậu ở h7 để mở cột.',
        mate: true,
        introFen: '7k/4N1pp/8/7Q/8/8/8/K3R3 w - - 0 1',
        intro: ['Qxh7+', 'Kxh7', 'Rh1#'],
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
        fen: '2kr4/3p4/B1p5/8/5B2/8/8/K7 b - - 0 1',
        marks: ['a6c8:red', 'f4b8:blue'],
        caption: 'Mẫu Boden: tượng a6 chiếu (mũi tên đỏ), tượng f4 khóa c7 và b8 (mũi tên xanh); xe d8 và tốt d7 của Đen chặn nốt đường thoát. Tốt c6 cho thấy thế này thường đến từ đâu: Trắng thí hậu Qxc6+!, Đen bắt lại bxc6 và mở đường chéo, rồi Ba6#.',
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
        caption: 'Cây cầu, cùng kỹ thuật với tốt cột f: xe trắng đã lên hàng 4 trước, giờ bước sang f4 (vòng vàng) che chiếu cho vua f5. Xe đen hết nước chiếu, tốt f7 sẽ phong hậu. Bấm “▶ Chạy” để xem cả cây cầu từ thế Lucena: xe lên hàng 4 trước, vua mới bước ra.',
        introFen: '5K2/2k2P2/8/8/8/8/6r1/3R4 w - - 0 1',
        intro: ['Rd4', 'Rg1', 'Ke7', 'Re1+', 'Kf6', 'Rf1+', 'Kg6', 'Rg1+', 'Kf5', 'Rf1+', 'Rf4'],
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
        line: ['Rg7', 'Rb6', 'Rh7', 'Ra6', 'e6'],
        lineNotes: [
          'Trắng đi chờ, tìm đường cho vua.',
          'Xe đen chỉ đi qua lại trên hàng 6, tránh các ô sát vua trắng (như c6): vua trắng vẫn không lên được.',
          '',
          '',
          'Muốn tiến, Trắng buộc phải đẩy e6. Đây chính là thế cờ của bài tập ngay dưới: giờ xe đen phải làm gì?',
        ],
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
        line: ['h4', 'Kd5', 'Kf4', 'Kc5', 'Kg5', 'Kb4', 'Kxg6'],
        lineNotes: [
          'Trắng cố định tốt h5 trước, để sau này ăn nó dễ dàng.',
          'Vua đen phải đi đón tốt a4, nếu không tốt a chạy thẳng lên phong hậu.',
          'Vua trắng sang cánh vua, nơi Đen không còn ai giữ tốt.',
          '',
          '',
          'Vua đen sắp ăn được tốt a4, nhưng đã ở tận cánh hậu.',
          'Vua trắng ăn g6, tiếp theo ăn h5 rồi đẩy tốt h phong hậu: vua đen ở quá xa, không về kịp.',
        ],
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
        line: ['Ke2', 'Kd4', 'd3', 'Kd5', 'Ke3', 'Ke5', 'd4+', 'Kd5', 'Kd3', 'Kd6', 'Ke4', 'Ke6'],
        lineNotes: [
          '',
          'Vua đen đứng ngay trước tốt.',
          'Tốt tiến lên d3: ô then chốt giờ là c5, d5, e5.',
          'Vua đen lùi về d5, lại đứng trên ô then chốt.',
          '',
          'Đối vua (giữa hai vua là ô e4): vua trắng không bước lên hàng 4 được.',
          'Tốt chiếu, vua đen lùi nhưng vẫn ở ngay trước tốt.',
          '',
          '',
          '',
          '',
          'Lại đối vua. Cứ thế Đen luôn chặn trước tốt và giữ đối vua: vua trắng không bao giờ tới được ô then chốt, hòa.',
        ],
      },
      {
        kind: 'diagram',
        fen: '4k3/8/5K2/4P3/8/8/8/8 b - - 0 1',
        marks: ['d6:yellow', 'e6:yellow', 'f6:yellow', 'd7:yellow', 'e7:yellow', 'f7:yellow'],
        caption: 'Tốt e5 ở hàng 5: ô then chốt là d6, e6, f6 và d7, e7, f7 (vòng vàng). Vua Trắng đã đứng trên f6 nên Trắng thắng, dù Đen đi trước.',
        line: ['Kd8', 'Kf7'],
        lineNotes: [
          'Vua đen cố đứng cạnh ô phong cấp e8.',
          'Vua trắng sang f7, giữ e8, e7 và e6: tốt cứ thế tiến e6, e7, e8 mà vua đen không quay về cản được.',
        ],
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
        line: ['Rd7', 'Rb8', 'Kf1', 'Kf8', 'Ke2'],
        lineNotes: [
          'Xe xâm nhập hàng 7, đánh tốt b7 (tốt f7 còn vua và xe f8 giữ).',
          'Xe đen phải lui về b8 để giữ b7: hoàn toàn bị động.',
          'Trắng không vội, đưa vua vào trận.',
          'Đen đưa vua lại gần, muốn ...Ke8 để đuổi xe.',
          'Vua trắng tiến lên. Xe trắng hoạt động, xe đen vẫn bị trói vào tốt b7.',
        ],
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
        line: ['a3', 'b6', 'Bc2', 'Bb7', 'Qd3', 'g6', 'Bh6', 'Re8'],
        lineNotes: [
          'a3: không cho mã đen vào b4 đuổi tượng d3 hoặc nhảy tiếp sang d5.',
          'Đen chuẩn bị đưa tượng c8 ra b7, nhìn thẳng vào ô d5.',
          'Tượng lui c2 để hậu đứng trước nó trên đường chéo b1-h7.',
          '',
          'Hậu và tượng xếp thành hàng nhắm vào h7. Lúc này mã f6 giữ h7, nhưng hễ mã f6 bị đổi đi (ví dụ Bg5 rồi Bxf6) là Qxh7# xuất hiện.',
          'Đen đi g6 chặn trước đường chéo, nhưng làm yếu các ô đen quanh vua.',
          'Tượng h6 đánh xe f8 và chiếm ô yếu cạnh vua đen.',
          'Xe tránh đi. Trắng có thế công, còn Đen chờ đổi quân và phong tỏa d5.',
        ],
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
