import type { Lesson } from './types';

export const STAGE0: Lesson[] = [
  {
    id: 'intro-board',
    stage: 0,
    title: 'Làm quen: bàn cờ, quân cờ và mục tiêu',
    summary: 'Bắt đầu từ con số không. Chưa cần biết gì cả.',
    minutes: 10,
    blocks: [
      {
        kind: 'text',
        md: `### Hai người, hai màu quân
Cờ vua là trò chơi cho hai người. Một người cầm quân **Trắng**, người kia cầm quân **Đen**. Trắng luôn đi trước, sau đó hai bên lần lượt mỗi người đi một nước.

### Mục tiêu
Mỗi bên có một quân **Vua**. Bạn thắng khi tấn công Vua đối phương mà nó không còn cách nào thoát. Tình huống đó gọi là **chiếu hết**. Không cần ăn hết quân của đối phương.

### Sáu loại quân
- **Vua** ♔ (1 quân): quân quan trọng nhất.
- **Hậu** ♕ (1 quân): quân mạnh nhất.
- **Xe** ♖ (2 quân).
- **Tượng** ♗ (2 quân).
- **Mã** ♘ (2 quân): hình đầu ngựa.
- **Tốt** ♙ (8 quân): quân nhỏ nhất, đứng hàng đầu.

Bài sau sẽ dạy từng quân đi thế nào. Bây giờ hãy nhìn cách xếp bàn cờ lúc bắt đầu.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        caption: 'Thế xuất phát. Quân Trắng ở phía dưới. Hàng trong cùng, từ trái sang: Xe, Mã, Tượng, Hậu, Vua, Tượng, Mã, Xe. Hàng trước mặt là tám Tốt. Mẹo: Hậu trắng đứng ô sáng, Hậu đen đứng ô sẫm.',
      },
      {
        kind: 'text',
        md: `### Tên của từng ô
Bàn cờ có 64 ô. Để nói rõ một ô, người ta đặt tên cho nó:
- 8 **cột** dọc mang chữ cái **a, b, c, d, e, f, g, h** (từ trái sang phải khi bạn cầm Trắng).
- 8 **hàng** ngang mang số **1 đến 8** (từ phía Trắng đi lên).
- Tên ô = chữ của cột + số của hàng. Ô góc dưới bên trái là **a1**, ô góc trên bên phải là **h8**.

Các chữ và số nhỏ in ngay trên mép bàn cờ để bạn dò. Hãy luyện một chút: tìm đúng ô được hỏi.`,
      },
      {
        kind: 'squares',
        targets: ['a1', 'h8', 'e4', 'd5', 'f3', 'b7', 'g2', 'c6'],
        intro: 'Chạm vào ô được hỏi. Sai cũng không sao, bàn cờ sẽ cho biết bạn vừa chạm ô nào.',
      },
    ],
  },

  {
    id: 'pieces-straight',
    stage: 0,
    title: 'Cách đi: Xe, Tượng và Hậu',
    summary: 'Ba quân đi đường dài. Chạm vào quân để thấy nó đi được tới đâu.',
    minutes: 10,
    blocks: [
      {
        kind: 'text',
        md: `Trong các bài tập, hãy **chạm vào quân**: những chấm tròn hiện ra là các ô nó đi tới được. Chạm tiếp vào ô đích để đi.

**Bắt quân**: đi quân của mình vào ô có quân đối phương. Quân đó bị lấy ra khỏi bàn.

### Xe ♖
Xe đi **thẳng**: dọc theo cột hoặc ngang theo hàng, xa bao nhiêu cũng được. Xe không nhảy qua quân khác.`,
      },
      {
        kind: 'task',
        fen: '7k/8/8/8/8/8/R6p/4K3 w - - 0 1',
        moves: ['a2h2'],
        prompt: 'Bạn cầm Trắng. Dùng Xe (ô a2) bắt Tốt đen ở cuối hàng.',
        explain: 'Xe a2 đi ngang hết hàng 2 tới h2 và bắt Tốt. Nếu để yên, Tốt đen đi thêm một ô nữa sẽ biến thành Hậu.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: '7k/8/8/8/n2R1P1b/8/8/6K1 w - - 0 1',
        moves: ['d4a4'],
        prompt: 'Xe trắng ở d4. Bên trái có Mã đen, bên phải có Tượng đen. Xe bắt được quân nào?',
        explain: 'Xe bắt Mã ở a4. Bên phải, Tốt trắng f4 đứng chắn đường nên Xe không tới được Tượng h4: Xe không nhảy qua quân, kể cả quân nhà.',
        verify: 'best',
      },
      {
        kind: 'text',
        md: `### Tượng ♗
Tượng đi **chéo**, xa bao nhiêu cũng được, không nhảy qua quân. Vì chỉ đi chéo nên mỗi Tượng suốt ván chỉ đứng trên ô một màu.`,
      },
      {
        kind: 'task',
        fen: '7k/8/8/8/5p2/8/3B4/4K3 w - - 0 1',
        moves: ['d2f4'],
        prompt: 'Dùng Tượng (ô d2) bắt Tốt đen.',
        explain: 'Tượng đi chéo từ d2 qua e3 tới f4.',
        verify: 'best',
      },
      {
        kind: 'text',
        md: `### Hậu ♕
Hậu đi được như **Xe và Tượng cộng lại**: thẳng hoặc chéo, xa bao nhiêu cũng được. Vì thế Hậu là quân mạnh nhất, và mất Hậu thường là thua.`,
      },
      {
        kind: 'task',
        fen: '7k/8/8/1r6/8/8/4Q3/4K3 w - - 0 1',
        moves: ['e2b5'],
        prompt: 'Dùng Hậu (ô e2) bắt Xe đen.',
        explain: 'Hậu đi chéo từ e2 qua d3, c4 tới b5. Một quân không được quân nào bảo vệ như Xe đen ở đây gọi là quân "treo".',
        verify: 'best',
      },
    ],
  },

  {
    id: 'pieces-special',
    stage: 0,
    title: 'Cách đi: Vua, Mã và Tốt',
    summary: 'Ba quân có cách đi riêng.',
    minutes: 12,
    blocks: [
      {
        kind: 'text',
        md: `### Vua ♔
Vua đi **một ô** theo mọi hướng. Vua không bao giờ được đi vào ô đang bị quân đối phương tấn công.`,
      },
      {
        kind: 'task',
        fen: '7k/8/8/8/8/8/P2n4/4K3 w - - 0 1',
        moves: ['e1d2'],
        prompt: 'Mã đen đứng ngay cạnh Vua trắng. Dùng Vua bắt nó.',
        explain: 'Vua bước một ô chéo từ e1 sang d2 và bắt Mã. Vua cũng bắt quân được, miễn là quân đó không được bảo vệ.',
        verify: 'best',
      },
      {
        kind: 'text',
        md: `### Mã ♘
Mã đi hình **chữ L**: hai ô thẳng rồi rẽ một ô sang bên. Mã là quân duy nhất **nhảy qua** được quân khác.`,
      },
      {
        kind: 'task',
        fen: '7k/8/8/3p4/8/2N5/8/4K3 w - - 0 1',
        moves: ['c3d5'],
        prompt: 'Chạm vào Mã (ô c3) để xem tám ô nó tới được, rồi bắt Tốt đen.',
        explain: 'Từ c3, Mã lên hai ô rồi sang phải một ô là tới d5.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: '7k/8/8/8/3r4/1PPP4/1PNP4/4K3 w - - 0 1',
        moves: ['c2d4'],
        prompt: 'Mã trắng (ô c2) bị Tốt nhà vây kín. Nó vẫn bắt được Xe đen. Thử xem.',
        explain: 'Mã nhảy qua đầu các Tốt để tới d4. Xe, Tượng hay Hậu ở vị trí đó thì không đi đâu được.',
        verify: 'best',
      },
      {
        kind: 'text',
        md: `### Tốt ♙
Tốt là quân duy nhất **đi một kiểu, bắt một kiểu**:
- **Đi**: tiến thẳng một ô. Riêng nước đầu tiên của mỗi Tốt được chọn tiến hai ô.
- **Bắt**: chéo lên một ô (sang trái hoặc phải).
- Tốt không bao giờ đi lùi. Gặp quân đứng ngay trước mặt thì Tốt bị chặn.`,
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['e2e4'],
        prompt: 'Thế xuất phát. Đưa Tốt trước mặt Vua (ô e2) tiến hai ô.',
        explain: 'Tốt e2 tiến hai ô tới e4. Đây là nước mở đầu phổ biến nhất trong cờ vua.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: '7k/8/8/8/3n1b2/4P3/8/4K3 w - - 0 1',
        moves: ['e3d4'],
        alternatives: ['e3f4'],
        prompt: 'Tốt trắng (ô e3) có thể bắt chéo sang trái hoặc sang phải. Bắt một trong hai quân đen.',
        explain: 'Tốt bắt chéo: sang d4 lấy Mã hoặc sang f4 lấy Tượng. Nó không thể tiến thẳng mà bắt quân.',
        verify: 'best',
      },
      {
        kind: 'diagram',
        fen: '7k/8/8/8/4p3/4P3/8/4K3 w - - 0 1',
        caption: 'Hai Tốt đứng đối mặt nhau: cả hai đều bị chặn, không Tốt nào đi tiếp hay bắt quân kia được.',
      },
    ],
    resources: [{ label: 'Lichess Learn: luyện thêm từng quân bằng mini game', url: 'https://lichess.org/learn', note: 'Miễn phí, có tiếng Việt.' }],
  },

  {
    id: 'notation',
    stage: 0,
    title: 'Đọc và ghi nước đi',
    summary: 'Ký hiệu ngắn gọn mà mọi sách và trang web dùng.',
    minutes: 8,
    blocks: [
      {
        kind: 'text',
        md: `Bạn đã biết tên ô. Một nước đi được ghi bằng **chữ cái của quân + ô nó đi tới**.

### Chữ cái của quân (theo tiếng Anh, vì cả thế giới dùng chung)
- **K** = Vua (King)
- **Q** = Hậu (Queen)
- **R** = Xe (Rook)
- **B** = Tượng (Bishop)
- **N** = Mã (Knight)
- Tốt không có chữ: chỉ ghi ô đến.

### Ví dụ
- **Nf3**: Mã đi tới ô f3.
- **e4**: Tốt đi tới ô e4.
- **Bxe5**: Tượng bắt quân ở e5. Dấu **x** nghĩa là bắt.
- **exd5**: Tốt ở cột e bắt quân ở d5.

Các ký hiệu khác sẽ gặp ở những bài sau: **+** là chiếu, **#** là chiếu hết, **O-O** là nhập thành.

Số đứng trước cho biết đó là nước thứ mấy: **1.e4 e5** nghĩa là ở nước 1, Trắng đi e4 và Đen đáp e5.`,
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['g1f3'],
        prompt: 'Hãy đi nước Nf3.',
        explain: 'N là Mã, f3 là ô đến: Mã ở g1 nhảy tới f3.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        moves: ['f1c4'],
        prompt: 'Hãy đi nước Bc4.',
        explain: 'B là Tượng: Tượng ở f1 đi chéo tới c4.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        moves: ['e4d5'],
        prompt: 'Hãy đi nước exd5.',
        explain: 'Tốt ở cột e bắt (x) Tốt đen ở d5.',
        verify: 'line',
      },
    ],
  },

  {
    id: 'rules-special',
    stage: 0,
    title: 'Ba luật đặc biệt: nhập thành, bắt tốt qua đường, phong cấp',
    summary: 'Những luật người mới hay nhầm nhất.',
    minutes: 15,
    blocks: [
      {
        kind: 'text',
        md: `### Nhập thành (O-O, O-O-O)
Vua đi 2 ô về phía xe, xe nhảy qua vua đứng cạnh. Điều kiện:
- Vua và xe đó **chưa từng di chuyển**.
- Giữa vua và xe **không có quân nào**.
- Vua **không đang bị chiếu**, không đi qua và không đến ô bị tấn công. (Xe thì được phép bị tấn công.)

Nhập thành sớm là một trong ba nguyên tắc khai cuộc quan trọng nhất: vua an toàn, xe vào cuộc.

### Bắt tốt qua đường (en passant)
Khi tốt đối phương đi 2 ô từ vị trí ban đầu và đứng **ngay cạnh** tốt của bạn, bạn được bắt nó như thể nó chỉ đi 1 ô. Chỉ được làm **ngay nước tiếp theo**, sau đó mất quyền.

### Phong cấp
Tốt đến hàng cuối **bắt buộc** đổi thành hậu, xe, tượng hoặc mã (gần như luôn chọn hậu). Bạn có thể có nhiều hậu cùng lúc.`,
      },
      {
        kind: 'task',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5',
        moves: ['e1g1'],
        prompt: 'Nhập thành ngắn cho Trắng (kéo vua từ e1 tới g1).',
        explain: 'Vua e1 → g1, xe h1 → f1. Trên bàn cờ thật bạn đi vua trước. Trong app, kéo vua 2 ô là đủ.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3',
        moves: ['e5d6'],
        prompt: 'Đen vừa đi d7-d5 (2 ô) đứng cạnh tốt e5 của bạn. Bắt tốt qua đường.',
        explain: 'Tốt e5 bắt chéo tới d6, tốt d5 bị lấy khỏi bàn. Nếu Trắng đi nước khác, quyền này mất.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: '8/1P4k1/8/8/8/8/8/4K3 w - - 0 1',
        moves: ['b7b8q'],
        prompt: 'Đưa tốt lên hàng 8 và phong hậu.',
        explain: 'b8=Q. Sau đó Trắng có hậu + vua chống vua đơn độc, thắng dễ (bài sau dạy cách chiếu hết).',
        verify: 'line',
      },
    ],
  },

  {
    id: 'check-mate-draw',
    stage: 0,
    title: 'Chiếu, chiếu hết và các cách hòa',
    summary: 'Ván cờ kết thúc như thế nào, và cái bẫy pat.',
    minutes: 20,
    blocks: [
      {
        kind: 'text',
        md: `### Chiếu (+)
Vua bị tấn công. Bạn **phải** thoát chiếu ngay bằng một trong ba cách: **chạy** vua, **chặn** bằng quân khác, hoặc **bắt** quân đang chiếu.

### Chiếu hết (#)
Bị chiếu và không có cách nào thoát. Ván cờ kết thúc. Đây là mục tiêu duy nhất: không cần ăn hết quân.

### Hòa
- **Pat (stalemate)**: bên đi không bị chiếu nhưng **không có nước hợp lệ nào**. Lỗi kinh điển của người mới khi đang thắng đậm.
- Lặp lại thế cờ 3 lần.
- 50 nước không có bắt quân hay đi tốt.
- Không đủ quân để chiếu hết (vua vs vua, vua + mã vs vua, vua + tượng vs vua).
- Thỏa thuận hòa.`,
      },
      {
        kind: 'diagram',
        fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
        caption: 'Đen đi: KHÔNG bị chiếu nhưng không có nước nào. Pat, hòa. Trắng vừa vứt đi ván thắng.',
      },
      {
        kind: 'task',
        fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1',
        moves: ['f7g7'],
        alternatives: ['f7f8'],
        prompt: 'Cùng thế cờ trên nhưng Trắng đi. Chiếu hết trong 1 nước.',
        explain: 'Qg7# (hậu được vua g6 bảo vệ) hoặc Qf8#. Chú ý Qf6?? hay Qe7?? không chiếu hết: hãy luôn kiểm tra vua đối phương còn ô nào.',
        verify: 'mate',
      },
      {
        kind: 'task',
        fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
        moves: ['a1a8'],
        prompt: 'Chiếu hết hàng cuối trong 1 nước.',
        explain: 'Ra8#. Vua đen bị chính ba tốt của mình nhốt. Mẫu này xuất hiện ở mọi trình độ.',
        verify: 'mate',
      },
      {
        kind: 'task',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
        moves: ['h5f7'],
        prompt: 'Chiếu hết "học trò" (Scholar\'s mate). Trắng đi.',
        explain: 'Qxf7#. Điểm f7 chỉ được vua bảo vệ, nên là mục tiêu kinh điển trong khai cuộc. Bài sau dạy cách phòng thủ.',
        verify: 'mate',
      },
    ],
  },

  {
    id: 'piece-values',
    stage: 0,
    title: 'Giá trị quân và trao đổi',
    summary: 'Đếm chất và quyết định có nên đổi quân.',
    minutes: 15,
    blocks: [
      {
        kind: 'text',
        md: `### Bảng giá trị
- Tốt = **1**
- Mã = **3**
- Tượng = **3** (hơi hơn mã một chút ở thế cờ mở)
- Xe = **5**
- Hậu = **9**
- Vua = vô giá (không thể bị bắt)

### Dùng thế nào
Trước mỗi lần bắt quân hãy đếm: "tôi lấy bao nhiêu, mất bao nhiêu?". Đổi mã lấy xe (3 đổi 5) là **hơn chất**. Đổi xe lấy mã là **mất chất**.

Ở trình độ dưới 1000, ván cờ hầu như luôn được định đoạt bởi việc **ai bỏ quân miễn phí nhiều hơn**. Vì vậy thói quen quan trọng nhất là trước khi đi, hỏi: **"nước này có để quân nào của tôi bị bắt không?"**`,
      },
      {
        kind: 'task',
        fen: '4k3/8/8/3r4/8/1n6/8/3QK3 w - - 0 1',
        moves: ['d1d5'],
        prompt: 'Hậu trắng có thể bắt xe d5 hoặc mã b3. Chọn đúng.',
        explain: 'Qxd5 lấy xe (5 điểm) thay vì mã (3 điểm). Cả hai đều không được bảo vệ, nên lấy quân to hơn.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3',
        moves: ['e5d4'],
        prompt: 'Trắng vừa đi d4 tấn công tốt e5. Đen nên làm gì?',
        explain: 'exd4. Tốt e5 bị tấn công 2 lần (tốt d4, mã f3) và chỉ được bảo vệ 1 lần (mã c6). Bắt trước là an toàn nhất; Trắng lấy lại bằng Nxd4 và thế cân bằng (Khai cuộc Scotch).',
        verify: 'best',
      },
    ],
  },

  {
    id: 'opening-principles',
    stage: 0,
    title: 'Nguyên tắc khai cuộc',
    summary: 'Chưa cần học thuộc biến. Chỉ cần 5 nguyên tắc.',
    minutes: 20,
    blocks: [
      {
        kind: 'text',
        md: `### Năm nguyên tắc
1. **Chiếm trung tâm** bằng tốt: e4, d4 (hoặc e5, d5 với Đen).
2. **Phát triển quân nhẹ** (mã, tượng) ra khỏi hàng 1, mã trước tượng. Mục tiêu: sau 10 nước, không còn quân nhẹ nào ở nhà.
3. **Nhập thành sớm**, thường trước nước 10.
4. **Đừng đi một quân hai lần** khi chưa phát triển xong, trừ khi có lý do cụ thể.
5. **Đừng đưa hậu ra sớm**: hậu dễ bị quân nhẹ đuổi, đối phương vừa đuổi vừa phát triển.

### Những lỗi phổ biến
- Đi tốt biên (a3, h3) vô cớ.
- Mang hậu đi săn tốt rồi bị bẫy.
- Tấn công khi chưa phát triển đủ quân.

Ở giai đoạn này **đừng học biến khai cuộc**. Hãy chơi theo nguyên tắc rồi xem engine nói gì sau ván.`,
      },
      {
        kind: 'task',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3',
        moves: ['g7g6'],
        alternatives: ['d8e7', 'd8f6'],
        prompt: 'Trắng đưa hậu ra sớm đe dọa Qxf7#. Đen phòng thủ thế nào cho tốt?',
        explain: 'g6! vừa chặn hậu vừa đuổi nó (sau Qf3, Đen đi Nf6 tiếp tục phát triển có tempo). Qe7 hoặc Qf6 cũng chặn được nhưng kém chủ động hơn.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d3', 'd7d6', 'e1g1', 'e8g8'],
        prompt: 'Đi lại khai cuộc Ý theo nguyên tắc: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O. Bạn cầm Trắng.',
        explain: 'Sau 6 nước cả hai bên đã chiếm trung tâm, phát triển hai quân nhẹ và nhập thành. Đây là thế cờ mẫu mực.',
        verify: 'line',
      },
    ],
    resources: [
      { label: 'John Bartholomew: Chess Fundamentals (YouTube)', url: 'https://www.youtube.com/@JohnBartholomewChess', note: 'Series 5 video dạy cách tư duy, được coi là chuẩn nhất cho người mới. Tìm playlist "Chess Fundamentals".' },
    ],
  },

  {
    id: 'basic-mates',
    stage: 0,
    title: 'Chiếu hết cơ bản: hậu, xe, hai xe',
    summary: 'Biết chuyển lợi thế thành chiến thắng.',
    minutes: 25,
    blocks: [
      {
        kind: 'text',
        md: `### Nguyên tắc chung
Vua đơn độc chỉ bị chiếu hết ở **biên** hoặc **góc**. Kế hoạch luôn gồm hai bước: (1) dồn vua đối phương ra biên bằng cách thu hẹp "chiếc hộp", (2) đưa vua của mình lại gần để hỗ trợ, rồi chiếu hết.

### Hậu + vua chống vua
Hậu đứng cách vua đối phương "một nước mã" sẽ nhốt nó vào hộp nhỏ dần. Khi vua đối phương ở biên, đưa vua mình đến đối diện rồi chiếu hết. **Cảnh báo pat**: khi vua đối phương ở góc chỉ còn 1-2 ô, kiểm tra kỹ trước khi đi hậu.

### Hai xe (chiếu thang)
Hai xe luân phiên cắt từng hàng, vua đối phương bị đẩy lùi như leo thang. Nếu vua đối phương đến gần xe, chuyển xe sang cánh kia.

### Xe + vua chống vua
Khó hơn: cần dùng vua đối diện (đối vua) rồi xe chiếu. Luyện trên Lichess Practice cho đến khi làm dưới 30 giây.`,
      },
      {
        kind: 'task',
        fen: '3k4/8/3K4/8/8/8/8/6Q1 w - - 0 1',
        moves: ['g1g8'],
        prompt: 'Vua trắng đã đối diện vua đen. Chiếu hết trong 1 nước.',
        explain: 'Qg8#. Hậu kiểm soát cả hàng 8, vua d6 kiểm soát c7, d7, e7.',
        verify: 'mate',
      },
      {
        kind: 'task',
        fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
        moves: ['a1a8'],
        prompt: 'Xe + vua. Chiếu hết trong 1 nước.',
        explain: 'Ra8#. Vua g6 che hết các ô g7, h7; xe chiếu dọc hàng 8.',
        verify: 'mate',
      },
      {
        kind: 'task',
        fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1',
        moves: ['b1b7', 'g8f8', 'a2a8'],
        alternatives: ['a2a7'],
        prompt: 'Chiếu thang bằng hai xe. Chiếu hết trong 2 nước.',
        explain: '1.Rb7 (cắt hàng 7, vua không xuống được) Kf8 2.Ra8#. Hoặc 1.Ra7 rồi 2.Rb8#.',
        verify: 'mate',
      },
    ],
    resources: [
      { label: 'Lichess Practice: Checkmating patterns', url: 'https://lichess.org/practice', note: 'Mục "Checkmates" luyện hậu, xe, hai xe với máy.' },
    ],
  },

  {
    id: 'tactics-1',
    stage: 0,
    title: 'Chiến thuật 1: đòn đôi và ghim',
    summary: 'Hai mẫu chiến thuật mang lại nhiều quân nhất ở mọi trình độ.',
    minutes: 25,
    blocks: [
      {
        kind: 'text',
        md: `### Đòn đôi (fork)
Một quân tấn công **hai mục tiêu cùng lúc**; đối phương chỉ cứu được một. Mã là vua của đòn đôi vì tấn công theo cách không quân nào chặn được. Đòn đôi có chiếu là mạnh nhất vì đối phương bắt buộc phải lo cho vua.

### Ghim (pin)
Quân đứng giữa bị "dính" vì phía sau nó là quân giá trị hơn (hoặc vua). Ghim vào vua là **ghim tuyệt đối**: quân bị ghim không được phép di chuyển. Cách khai thác: **tấn công thêm quân bị ghim** bằng tốt hoặc quân khác.`,
      },
      {
        kind: 'task',
        fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
        moves: ['b5c7', 'e8d8', 'c7a8'],
        prompt: 'Mã trắng tìm đòn đôi vua + xe.',
        explain: 'Nc7+ chiếu vua và tấn công xe a8. Vua phải chạy, mã lấy xe.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: 'r5k1/8/8/8/8/8/8/3QK3 w - - 0 1',
        moves: ['d1d5', 'g8f8', 'd5a8'],
        prompt: 'Hậu trắng tìm đòn đôi có chiếu.',
        explain: 'Qd5+ vừa chiếu vua g8 (đường chéo d5-g8) vừa tấn công xe a8 (đường chéo d5-a8).',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: '7k/8/8/2n1b3/8/3P4/8/4K3 w - - 0 1',
        moves: ['d3d4'],
        prompt: 'Tốt cũng biết đòn đôi. Trắng đi.',
        explain: 'd4! tấn công cả mã c5 lẫn tượng e5. Đen chỉ cứu được một quân.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: '4k3/8/8/4n3/8/8/5P2/4RK2 w - - 0 1',
        moves: ['f2f4'],
        prompt: 'Mã e5 bị ghim vào vua bởi xe e1. Khai thác ghim.',
        explain: 'f4! Mã không được di chuyển (ghim tuyệt đối) nên tốt sẽ bắt nó nước sau.',
        verify: 'best',
      },
      {
        kind: 'puzzles',
        themes: ['fork', 'pin'],
        rating: [600, 1000],
        count: 6,
        intro: 'Luyện 6 bài đòn đôi và ghim từ ván thật (Lichess).',
      },
    ],
  },

  {
    id: 'tactics-2',
    stage: 0,
    title: 'Chiến thuật 2: xiên, tấn công mở, hàng cuối',
    summary: 'Thêm ba mẫu nữa là đủ bộ cơ bản.',
    minutes: 25,
    blocks: [
      {
        kind: 'text',
        md: `### Xiên (skewer)
Ngược với ghim: quân **giá trị cao đứng trước**, khi nó buộc phải đi thì quân phía sau bị bắt. Thường là chiếu vua rồi lấy hậu/xe đứng sau.

### Tấn công mở (discovered attack)
Di chuyển một quân để **mở đường** cho quân phía sau tấn công. Quân di chuyển nên tạo đe dọa riêng (chiếu, bắt quân) để thành **hai đe dọa cùng lúc**. Chiếu mở (discovered check) là dạng mạnh nhất.

### Chiếu hết hàng cuối (back rank)
Sau khi nhập thành, ba tốt f-g-h che vua nhưng cũng nhốt nó. Nếu hàng cuối không có xe/hậu canh, một xe xuống là hết. Phòng ngừa: đi h3 (hoặc h6) tạo "lỗ thở" khi trung cuộc đã ổn định.`,
      },
      {
        kind: 'task',
        fen: '8/8/8/8/8/8/R6K/3kq3 w - - 0 1',
        moves: ['a2a1', 'd1d2', 'a1e1'],
        prompt: 'Vua và hậu đen đứng cùng hàng. Xiên!',
        explain: 'Ra1+! Vua d1 phải chạy, rồi Rxe1 lấy hậu.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: '3q1k2/8/8/8/8/8/3B4/3RK3 w - - 0 1',
        moves: ['d2h6', 'f8e8', 'd1d8'],
        alternatives: ['d2b4'],
        prompt: 'Tượng d2 đang chắn xe d1 khỏi hậu d8. Tấn công mở có chiếu.',
        explain: 'Bh6+! (hoặc Bb4+) Tượng chiếu vua f8, đồng thời mở cột d cho xe tấn công hậu. Đen lo chiếu xong thì mất hậu.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: '3r2k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1',
        moves: ['d1d8'],
        prompt: 'Hàng cuối của Đen chỉ có một xe canh. Trắng đi.',
        explain: 'Qxd8#. Xe d8 không được bảo vệ và vua g8 bị tốt mình nhốt.',
        verify: 'mate',
      },
      {
        kind: 'puzzles',
        themes: ['skewer', 'discoveredAttack', 'backRankMate', 'hangingPiece'],
        rating: [600, 1000],
        count: 8,
        intro: 'Luyện 8 bài: xiên, tấn công mở, hàng cuối, quân treo.',
      },
    ],
  },

  {
    id: 'pawn-endings-1',
    stage: 0,
    title: 'Cờ tàn tốt cơ bản: hình vuông và đối vua',
    summary: 'Hai quy tắc nền tảng của cờ tàn vua + tốt.',
    minutes: 25,
    blocks: [
      {
        kind: 'text',
        md: `### Quy tắc hình vuông
Vẽ hình vuông có cạnh từ tốt tới ô phong cấp. Nếu vua đối phương **đang ở trong** hình vuông (hoặc bước vào được khi đến lượt), nó bắt kịp tốt. Nếu không, tốt phong cấp. Không cần đếm từng nước. Lưu ý: tốt còn ở hàng 2 được đi hai ô, nên hãy vẽ hình vuông như thể nó đã đứng ở hàng 3.

### Đối vua (opposition)
Hai vua đứng đối diện nhau, cách nhau **một ô** (thường gặp nhất là trên cùng một cột; cùng hàng hay cùng đường chéo cũng tính). Bên **không phải đi** đang "có đối vua" và thắng thế: bên kia buộc phải nhường đường.

### Vua + tốt chống vua
- Vua tấn công nên đứng **trước** tốt của mình, không phải cạnh hay sau: đó là cách thắng trong hầu hết các thế.
- Vua đứng ở hàng 6 (trước tốt) thì **luôn thắng**, bất kể ai đi.
- Vua phòng thủ chặn ngay trước tốt và giữ đối vua thì **hòa**.
- Tốt biên (a, h): hòa nếu vua phòng thủ tới được góc.`,
      },
      {
        kind: 'task',
        fen: '8/8/8/8/P4k2/8/8/7K b - - 0 1',
        moves: ['f4e4'],
        alternatives: ['f4e5'],
        prompt: 'Đen đi. Vua có bắt kịp tốt a4 không? Chọn nước đúng.',
        explain: 'Hình vuông của tốt a4 là a4-a8-e8-e4. Vua f4 bước vào e4 (hoặc e5) là lọt vào hình vuông và bắt kịp. Mọi nước khác thua.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
        moves: ['e6d6', 'e8d8', 'e5e6', 'd8e8', 'e6e7', 'e8f7', 'd6d7'],
        alternatives: ['e6f6'],
        prompt: 'Vua trắng ở hàng 6 trước tốt. Trắng đi và thắng. Tìm kế hoạch.',
        explain: 'Kd6 (hoặc Kf6)! Đi vua sang bên, tốt tiến, vua đen bị đẩy khỏi ô phong cấp. Đừng vội đẩy tốt khi vua chưa mở đường.',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: '4k3/8/8/4K3/4P3/8/8/8 b - - 0 1',
        moves: ['e8e7'],
        prompt: 'Đen đi và hòa. Chỉ có một nước đúng.',
        explain: 'Ke7! giữ đối vua (hai vua cách một ô, Trắng phải đi). Nếu Trắng Kd5 thì Kd7, nếu Kf5 thì Kf7, luôn đối diện. Kd7 hoặc Kf7?? thua vì Trắng chiếm đối vua.',
        verify: 'best',
      },
    ],
    resources: [
      { label: 'Lichess Practice: Pawn endgames', url: 'https://lichess.org/practice', note: 'Mục "Pawn Endgames" có bài tập tương tác về đối vua và hình vuông.' },
    ],
  },

  {
    id: 'thinking-process',
    stage: 0,
    title: 'Cách tư duy mỗi nước đi',
    summary: 'Thói quen đơn giản nhất để hết bỏ quân.',
    minutes: 15,
    blocks: [
      {
        kind: 'text',
        md: `### Trước khi đi, hỏi ba câu
1. **Đối phương vừa đe dọa gì?** Nước vừa rồi của họ tấn công quân nào, mở đường nào?
2. **Tôi có chiếu, bắt quân, hay đe dọa nào không?** (C-C-T: Checks, Captures, Threats). Xét theo đúng thứ tự đó.
3. **Sau nước tôi định đi, đối phương có chiếu, bắt quân, đe dọa gì?** Đây là "kiểm tra an toàn". Bỏ qua bước này là nguyên nhân của hầu hết thất bại dưới 1200.

### Khi đối phương đi một nước lạ
Đừng đoán. Hỏi "nếu tôi không làm gì, họ làm gì tiếp?". Đó là cách tìm ra ý đồ.

### Nhịp độ
Chơi cờ chậm (15+10 trở lên). Dùng ít nhất 10 giây cho mỗi nước ngay cả khi thấy nước rõ ràng, chỉ để chạy ba câu hỏi trên.`,
      },
      {
        kind: 'task',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        moves: ['d2d3'],
        alternatives: ['b1c3'],
        prompt: 'Thế cờ sau 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6. Câu hỏi 1: Đen vừa đe dọa gì? (Chọn một nước phát triển an toàn cho Trắng.)',
        explain: 'Đen đe dọa Nxe4. Trắng có thể bảo vệ bằng d3 hoặc Nc3, hoặc phản công bằng Ng5 (dẫn tới biến phức tạp). Ở trình độ này d3 hoặc Nc3 là đủ tốt.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4',
        moves: ['d7d5'],
        prompt: 'Trắng đi 4.Ng5 đe dọa Nxf7. Câu hỏi 1 và 3: tìm cách phòng thủ tốt nhất cho Đen.',
        explain: 'd5! chặn đường chéo của tượng c4, mối đe dọa Nxf7 không còn. (Bc5!? là cách đáp trả hung hãn hơn, gọi là Traxler.) Đừng đi h6?? vì Nxf7 vẫn xảy ra.',
        verify: 'best',
      },
      {
        kind: 'puzzles',
        themes: ['hangingPiece', 'mateIn1'],
        rating: [500, 900],
        count: 8,
        intro: 'Áp dụng C-C-T: 8 bài tìm quân treo và chiếu hết 1 nước.',
      },
    ],
  },
];
