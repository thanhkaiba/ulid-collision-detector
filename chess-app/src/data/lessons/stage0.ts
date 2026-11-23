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
Cờ vua là trò chơi cho hai người. Một người cầm quân **Trắng**, người kia cầm quân **Đen**. Trắng luôn đi trước, sau đó hai bên lần lượt mỗi người đi một nước.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        caption: 'Mỗi bên có 16 quân. Quân Trắng xếp ở phía dưới (phía bạn), quân Đen ở phía trên. Trắng đi nước đầu tiên.',
      },
      {
        kind: 'text',
        md: `### Mục tiêu
Mỗi bên có một quân **Vua**. Bạn thắng khi tấn công Vua đối phương mà nó không còn cách nào thoát. Tình huống đó gọi là **chiếu hết**. Không cần ăn hết quân của đối phương.`,
      },
      {
        kind: 'diagram',
        fen: '3k4/3Q4/3K4/8/8/8/8/8 b - - 0 1',
        marks: ['d7d8:red'],
        mate: true,
        caption: 'Mũi tên đỏ: Hậu trắng d7 tấn công Vua đen d8. Ô nào quanh Vua đen cũng bị Hậu khống chế, và Vua đen không bắt được Hậu vì Vua trắng d6 bảo vệ nó. Đó là chiếu hết: Trắng thắng, dù Đen chưa mất quân nào khác.',
      },
      {
        kind: 'text',
        md: `### Sáu loại quân
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
        marks: ['d1:yellow', 'd8:yellow'],
        caption: 'Thế xuất phát. Hàng trong cùng, từ trái sang: Xe, Mã, Tượng, Hậu, Vua, Tượng, Mã, Xe. Hàng trước mặt là tám Tốt. Mẹo (vòng vàng): Hậu trắng đứng ô sáng, Hậu đen đứng ô sẫm.',
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
        kind: 'diagram',
        fen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
        marks: ['a1:yellow', 'h8:yellow', 'c5:blue'],
        caption: 'Vòng vàng: a1 (góc dưới bên trái) và h8 (góc trên bên phải). Vòng xanh: ô c5, nằm ở cột c, hàng 5. Vua trắng đứng ô e1, Vua đen đứng ô e8.',
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
        kind: 'diagram',
        fen: 'k7/8/8/8/3R4/8/8/7K w - - 0 1',
        marks: ['d4d8', 'd4d1', 'd4a4', 'd4h4'],
        caption: 'Xe trắng ở d4. Bốn mũi tên: Xe đi lên, xuống, sang trái, sang phải tới tận mép bàn cờ, dừng ở bất kỳ ô nào trên đường.',
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
        kind: 'diagram',
        fen: 'k7/8/8/8/3B4/8/8/7K w - - 0 1',
        marks: ['d4a1', 'd4a7', 'd4h8', 'd4g1'],
        caption: 'Tượng trắng ở d4 đi theo bốn đường chéo tới mép bàn cờ. Mọi ô nó tới được đều là ô sẫm, cùng màu với ô d4.',
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
        kind: 'diagram',
        fen: 'k7/8/8/8/3Q4/8/8/7K w - - 0 1',
        marks: ['d4d8:blue', 'd4d1:blue', 'd4a4:blue', 'd4h4:blue', 'd4a1', 'd4a7', 'd4h8', 'd4g1'],
        caption: 'Hậu trắng ở d4 đi được theo tám hướng. Mũi tên xanh dương: đường thẳng giống Xe. Mũi tên xanh lá: đường chéo giống Tượng.',
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
        kind: 'diagram',
        fen: 'k7/8/8/7r/4K3/8/8/8 w - - 0 1',
        marks: ['e4d4', 'e4d3', 'e4e3', 'e4f3', 'e4f4', 'h5d5:red', 'd5:red', 'e5:red', 'f5:red'],
        caption: 'Vua trắng e4 đi một ô theo các mũi tên xanh. Ba ô phía trên (vòng đỏ) đang bị Xe đen h5 tấn công dọc hàng 5, nên Vua không được bước vào.',
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
        kind: 'diagram',
        fen: 'k7/8/8/8/3N4/8/8/7K w - - 0 1',
        marks: ['d4b3', 'd4b5', 'd4c6', 'd4e6', 'd4f5', 'd4f3', 'd4e2', 'd4c2'],
        caption: 'Mã trắng ở d4 có tám ô để nhảy tới (đầu mũi tên). Mỗi ô cách d4 hai ô theo một hướng và một ô theo hướng kia, như hình chữ L.',
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
        fen: '7k/8/8/8/3r4/1PRP4/1PNP4/4K3 w - - 0 1',
        moves: ['c2d4'],
        prompt: 'Mã trắng (ô c2) bị quân nhà chắn kín phía trước và hai bên. Nó vẫn bắt được Xe đen. Thử xem.',
        explain: 'Mã nhảy qua đầu các quân nhà để tới d4. Xe, Tượng hay Hậu đứng ở c2 thì bị chặn, không vượt lên phía trước được.',
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
        kind: 'diagram',
        fen: '6k1/8/8/8/8/7P/4P3/6K1 w - - 0 1',
        marks: ['e2e3', 'e2e4', 'h3h4'],
        caption: 'Tốt e2 chưa đi lần nào nên được chọn tiến một ô (e3) hoặc hai ô (e4). Tốt h3 đã đi rồi, chỉ tiến được một ô tới h4.',
      },
      {
        kind: 'diagram',
        fen: '6k1/8/8/2nr4/3P4/8/8/6K1 w - - 0 1',
        marks: ['d4c5', 'd5:red'],
        caption: 'Tốt d4 bắt chéo được Mã c5 (mũi tên). Xe đen d5 (vòng đỏ) đứng ngay trước mặt: Tốt không bắt được Xe, cũng không tiến lên được.',
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
- Tốt không có chữ: chỉ ghi ô đến.`,
      },
      {
        kind: 'text',
        md: `### Ví dụ
- **Nf3**: Mã đi tới ô f3.
- **e4**: Tốt đi tới ô e4.
- **Bxe5**: Tượng bắt quân ở e5. Dấu **x** nghĩa là bắt.
- **exd5**: Tốt ở cột e bắt quân ở d5.

Các ký hiệu khác sẽ gặp ở những bài sau: **+** là chiếu, **#** là chiếu hết, **O-O** là nhập thành.

Số đứng trước cho biết đó là nước thứ mấy: **1.e4 e5** nghĩa là ở nước 1, Trắng đi e4 và Đen đáp e5.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
        lastMove: 'g1f3',
        caption: 'Thế cờ sau 1.e4 e5 2.Nf3. Hai ô tô màu: Mã trắng vừa đi từ g1 tới f3, nên nước này ghi là Nf3. Hai Tốt e4 và e5 là nước thứ nhất của mỗi bên.',
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

Nhập thành sớm là một trong những nguyên tắc khai cuộc quan trọng nhất (xem bài Nguyên tắc khai cuộc): vua an toàn, xe vào cuộc.`,
      },
      {
        kind: 'diagram',
        fen: '4k3/8/8/8/8/8/PPPPPPPP/R3K2R w KQ - 0 1',
        marks: ['e1g1', 'h1f1', 'e1c1:blue', 'a1d1:blue'],
        caption: 'Mũi tên xanh lá: nhập thành ngắn (O-O), vua e1 tới g1, xe h1 nhảy qua đứng f1. Mũi tên xanh dương: nhập thành dài (O-O-O), vua tới c1, xe a1 tới d1.',
      },
      {
        kind: 'diagram',
        fen: '4k3/8/8/8/2b5/8/PPPP1PPP/R3K2R w KQ - 0 1',
        marks: ['c4f1:red', 'f1:red'],
        caption: 'Tượng đen c4 tấn công ô f1 (đỏ). Vua phải đi qua f1 nên Trắng KHÔNG được nhập thành ngắn. Nhập thành dài sang c1 vẫn được.',
      },
      {
        kind: 'text',
        md: `### Bắt tốt qua đường (en passant)
Khi tốt đối phương đi 2 ô từ vị trí ban đầu và đứng **ngay cạnh** tốt của bạn, bạn được bắt nó như thể nó chỉ đi 1 ô. Chỉ được làm **ngay nước tiếp theo**, sau đó mất quyền.`,
      },
      {
        kind: 'diagram',
        fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
        lastMove: 'd7d5',
        marks: ['e5d6', 'd5:red'],
        caption: 'Đen vừa đi tốt d7-d5 (ô tô màu), đứng ngay cạnh tốt trắng e5. Mũi tên: tốt e5 được bắt chéo tới d6, và tốt d5 (vòng đỏ) bị lấy khỏi bàn.',
      },
      {
        kind: 'diagram',
        fen: '4k3/8/3P4/8/8/8/8/4K3 b - - 0 1',
        lastMove: 'e5d6',
        caption: 'Sau khi bắt qua đường: tốt trắng đứng ở d6, tốt đen d5 đã biến mất dù tốt trắng không đi vào ô d5.',
      },
      {
        kind: 'text',
        md: `### Phong cấp
Tốt đến hàng cuối **bắt buộc** đổi thành hậu, xe, tượng hoặc mã (gần như luôn chọn hậu). Bạn có thể có nhiều hậu cùng lúc.`,
      },
      {
        kind: 'diagram',
        fen: '4Q3/8/8/8/8/6k1/8/1K1Q4 b - - 0 1',
        lastMove: 'e7e8',
        marks: ['e8:yellow'],
        caption: 'Tốt trắng vừa đi từ e7 lên e8 (hàng cuối) và được đổi thành hậu (vòng vàng). Giờ Trắng có hai hậu: e8 và d1.',
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
        fen: 'rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3',
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
Vua bị tấn công. Bạn **phải** thoát chiếu ngay bằng một trong ba cách: **chạy** vua, **chặn** bằng quân khác, hoặc **bắt** quân đang chiếu.`,
      },
      {
        kind: 'diagram',
        fen: 'k3r3/8/5N2/8/2B5/8/8/4K3 w - - 0 1',
        marks: ['e8e1:red', 'e1d2:blue', 'c4e2:blue', 'f6e8:blue'],
        caption: 'Mũi tên đỏ: xe đen e8 chiếu vua trắng dọc cột e. Ba cách thoát (xanh dương): chạy vua (Kd2), chặn bằng tượng (Be2), hoặc mã bắt xe (Nxe8).',
      },
      {
        kind: 'text',
        md: `### Chiếu hết (#)
Bị chiếu và không có cách nào thoát. Ván cờ kết thúc. Đây là mục tiêu duy nhất: không cần ăn hết quân.`,
      },
      {
        kind: 'diagram',
        fen: 'R6k/1R6/8/8/8/8/8/6K1 b - - 0 1',
        marks: ['a8h8:red', 'b7h7:red'],
        mate: true,
        caption: 'Xe a8 chiếu vua đen dọc hàng 8. Xe b7 khống chế cả hàng 7 nên vua không chạy được lên g7, h7; Đen cũng không có quân nào để chặn hay bắt xe. Chiếu hết, Trắng thắng.',
      },
      {
        kind: 'text',
        md: `### Hòa
- **Pat (stalemate)**: bên đi không bị chiếu nhưng **không có nước hợp lệ nào**. Lỗi kinh điển của người mới khi đang thắng đậm.
- Lặp lại thế cờ 3 lần.
- 50 nước không có bắt quân hay đi tốt.
- Không đủ quân để chiếu hết (vua vs vua, vua + mã vs vua, vua + tượng vs vua).
- Thỏa thuận hòa.`,
      },
      {
        kind: 'diagram',
        fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
        marks: ['g8:red', 'g7:red', 'h7:red'],
        caption: 'Đen đi: vua h8 KHÔNG bị chiếu, nhưng cả ba ô quanh nó (vòng đỏ) đều bị hậu hoặc vua trắng khống chế, và Đen không còn quân nào khác. Không có nước hợp lệ: pat, hòa. Trắng vừa vứt đi ván thắng.',
      },
      {
        kind: 'task',
        fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1',
        moves: ['f7g7'],
        alternatives: ['f7f8', 'f7e8', 'f7h7'],
        prompt: 'Cùng thế cờ trên nhưng Trắng đi. Chiếu hết trong 1 nước.',
        explain: 'Qg7# hoặc Qh7# (hậu được vua g6 bảo vệ), hoặc Qf8#, Qe8# (chiếu dọc hàng 8). Chú ý Qf6+ chưa chiếu hết (vua chạy g8), còn Qe7 không chiếu: hãy luôn kiểm tra vua đối phương còn ô nào.',
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
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
        moves: ['h5f7'],
        prompt: 'Chiếu hết "học trò" (Scholar\'s mate). Đen vừa đi Nf6?? đuổi hậu mà quên f7. Trắng đi.',
        explain: 'Qxf7#. Điểm f7 chỉ được vua bảo vệ, nên là mục tiêu kinh điển trong khai cuộc. Bài "Nguyên tắc khai cuộc" dạy cách phòng thủ.',
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
- Vua = vô giá (không thể bị bắt)`,
      },
      {
        kind: 'diagram',
        fen: '6k1/8/8/8/1PNBRQ2/8/8/6K1 w - - 0 1',
        caption: 'Hàng 4, từ trái sang: Tốt (1), Mã (3), Tượng (3), Xe (5), Hậu (9). Hai vua không có điểm vì vua không bao giờ bị bắt.',
      },
      {
        kind: 'text',
        md: `### Dùng thế nào
Trước mỗi lần bắt quân hãy đếm: "tôi lấy bao nhiêu, mất bao nhiêu?". Đổi mã lấy xe (3 đổi 5) là **hơn chất**. Đổi xe lấy mã là **mất chất**.

Ở trình độ dưới 1000, ván cờ hầu như luôn được định đoạt bởi việc **ai bỏ quân miễn phí nhiều hơn**. Vì vậy thói quen quan trọng nhất là trước khi đi, hỏi: **"nước này có để quân nào của tôi bị bắt không?"**`,
      },
      {
        kind: 'diagram',
        fen: 'rk6/2N2ppp/8/5b2/8/8/5PPP/4R1K1 w - - 0 1',
        marks: ['c7a8', 'b8a8:red'],
        caption: 'Trắng đi Nxa8 (mũi tên xanh): mất mã (3) nhưng lấy được xe (5). Đen ăn lại Kxa8 (mũi tên đỏ), Trắng còn xe đối tượng: hơn chất, lời 2 điểm.',
      },
      {
        kind: 'lichess',
        id: 'I4VEG',
        prompt: 'Đối phương vừa ăn tốt bằng mã. Mã đó không được bảo vệ: ăn nó, rồi đi tiếp cho hết bài.',
        explain: 'Quân không được bảo vệ là quân cho không. Tốt h ăn mã và sang g6, rồi chạy thẳng lên phong hậu: vua đen ở quá xa, không đuổi kịp.',
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
5. **Đừng đưa hậu ra sớm**: hậu dễ bị quân nhẹ đuổi, đối phương vừa đuổi vừa phát triển.`,
      },
      {
        kind: 'diagram',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        marks: ['d4:yellow', 'e4:yellow', 'd5:yellow', 'e5:yellow', 'e2e4:blue', 'd2d4:blue', 'g1f3', 'b1c3'],
        caption: 'Bốn ô vàng là trung tâm. Mũi tên xanh dương: tốt e, d tiến hai ô chiếm trung tâm. Mũi tên xanh lá: mã ra f3, c3, nhìn thẳng vào trung tâm.',
      },
      {
        kind: 'diagram',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'f8c5',
        marks: ['e1g1:blue', 'h1f1:blue'],
        caption: 'Sau 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5: mỗi bên có một tốt trung tâm và hai quân nhẹ đã ra. Trắng nhập thành được ngay (mũi tên: vua sang g1, xe sang f1).',
      },
      {
        kind: 'text',
        md: `### Những lỗi phổ biến
- Đi tốt biên (a3, h3) vô cớ.
- Mang hậu đi săn tốt rồi bị bẫy.
- Tấn công khi chưa phát triển đủ quân.

Ở giai đoạn này **đừng học biến khai cuộc**. Hãy chơi theo nguyên tắc rồi xem engine nói gì sau ván.`,
      },
      {
        kind: 'diagram',
        fen: 'rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 3',
        lastMove: 'b1c3',
        marks: ['c3d5:red'],
        caption: 'Sau 1.e4 d5 2.exd5 Qxd5 3.Nc3: hậu ra sớm bị mã đuổi (mũi tên đỏ). Trắng vừa phát triển thêm một quân, còn Đen phải mất thêm một nước để đi hậu lần nữa.',
      },
      {
        kind: 'task',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3',
        moves: ['g7g6'],
        alternatives: ['d8e7', 'd8f6'],
        prompt: 'Trắng đưa hậu ra sớm đe dọa Qxf7#. Đen phòng thủ thế nào cho tốt?',
        explain: 'g6! vừa chặn hậu vừa đuổi nó. Sau {g6 Qf3} Trắng lại dọa Qxf7#, Đen chặn bằng {g6 Qf3 Nf6}: vừa phòng thủ vừa phát triển. Qe7 hoặc Qf6 cũng giữ được f7 nhưng kém hơn (Qe7 chắn tượng f8, Qf6 chiếm ô của mã).',
        verify: 'best',
      },
      {
        kind: 'task',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d3', 'd7d6', 'e1g1', 'e8g8'],
        prompt: 'Đi lại khai cuộc Ý theo nguyên tắc: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O. Bạn cầm Trắng.',
        explain: 'Sau 6 nước cả hai bên đã có tốt ở trung tâm, phát triển ít nhất hai quân nhẹ và nhập thành. Đây là thế cờ mẫu mực.',
        verify: 'line',
      },
    ],
    resources: [
      { label: 'John Bartholomew: Chess Fundamentals (YouTube)', url: 'https://www.youtube.com/@JohnBartholomewChess', note: 'Loạt video dạy cách tư duy, được nhiều người coi là chuẩn cho người mới. Tìm playlist "Chess Fundamentals".' },
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
Với một hậu hoặc một xe, vua đơn độc chỉ bị chiếu hết ở **biên** hoặc **góc**. Kế hoạch gồm hai bước: (1) dồn vua đối phương ra biên bằng cách thu hẹp "chiếc hộp", (2) đưa vua của mình lại gần để hỗ trợ, rồi chiếu hết (riêng hai xe thì không cần vua giúp).

Bài này có ba kỹ thuật. Mỗi kỹ thuật: đọc cách làm, giải một thế chiếu hết ngắn, rồi **đánh trọn từ đầu tới cuối với máy** ngay bên dưới. Máy chạy Vua theo cách khó chịu nhất, nên làm được với máy là làm được trong ván thật.`,
      },
      {
        kind: 'diagram',
        fen: '8/8/5k2/8/3R4/2K5/8/8 b - - 0 1',
        marks: ['e5:yellow', 'h5:yellow', 'h8:yellow', 'e8:yellow'],
        caption: 'Chiếc hộp: Xe d4 (được Vua c3 bảo vệ) chặn cột d và hàng 4, nên Vua đen bị nhốt trong hình chữ nhật có 4 góc vàng e5, h5, h8, e8. Mỗi bước, Trắng thu hộp nhỏ lại cho tới khi vua đen chạm biên.',
      },
      {
        kind: 'text',
        md: `### 1. Hai xe (chiếu thang)
Dễ nhất, nên học trước. Hai xe luân phiên cắt từng hàng, vua đối phương bị đẩy lùi như leo thang. Nếu vua đối phương đến gần xe, chuyển xe sang cánh kia, càng xa càng tốt.`,
      },
      {
        kind: 'diagram',
        fen: '8/8/8/4k3/R7/8/8/1R4K1 w - - 0 1',
        marks: ['b1b5:blue'],
        caption: 'Xe a4 cắt hàng 4, Vua đen không xuống được. Trắng đi Rb5+ (mũi tên): vua phải lùi lên hàng 6. Sau đó Ra6+, rồi Rb7, cứ luân phiên như leo thang.',
      },
      {
        kind: 'diagram',
        fen: 'R3k3/7R/8/8/8/8/8/6K1 b - - 0 1',
        mate: true,
        marks: ['a8e8:red'],
        caption: 'Bậc thang cuối: Xe h7 canh hàng 7, Xe a8 chiếu dọc hàng 8 (mũi tên đỏ). Vua e8 không còn ô nào: chiếu hết, không cần vua trắng giúp.',
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
      { kind: 'practice', ids: ['mate-two-rooks'] },
      {
        kind: 'text',
        md: `### 2. Hậu + vua chống vua
Hậu đứng cách vua đối phương "một nước mã" sẽ nhốt nó vào hộp nhỏ dần, không cần chiếu. Khi vua đối phương đã ở biên, **dừng hậu lại** và đưa vua mình đến đối diện, rồi chiếu hết. **Cảnh báo pat**: khi vua đối phương ở góc chỉ còn 1-2 ô, kiểm tra kỹ xem nó còn nước đi không trước khi đi hậu.`,
      },
      {
        kind: 'diagram',
        fen: '8/8/8/4k3/8/3Q4/8/6K1 b - - 0 1',
        marks: ['e4:yellow', 'h4:yellow', 'h8:yellow', 'e8:yellow'],
        caption: 'Hậu d3 cách Vua e5 đúng một nước mã. Hậu chặn cột d và hàng 3, nên vua đen chỉ còn trong hộp có 4 góc vàng e4, h4, h8, e8. Vua lùi bước nào, hậu theo bước đó để giữ khoảng cách nước mã.',
      },
      {
        kind: 'diagram',
        fen: '7k/8/6Q1/8/8/8/8/6K1 b - - 0 1',
        marks: ['h8:red'],
        caption: 'Cảnh báo pat: Hậu g6 không chiếu, nhưng Vua h8 không còn ô nào để đi (g8, g7, h7 đều bị hậu kiểm soát). Đen đến lượt mà không có nước hợp lệ: hòa!',
      },
      {
        kind: 'task',
        fen: '3k4/8/3K4/8/8/8/8/6Q1 w - - 0 1',
        moves: ['g1g8'],
        prompt: 'Vua trắng đã đối diện vua đen. Chiếu hết trong 1 nước.',
        explain: 'Qg8#. Hậu kiểm soát cả hàng 8, vua d6 kiểm soát c7, d7, e7.',
        verify: 'mate',
      },
      { kind: 'practice', ids: ['mate-queen'] },
      {
        kind: 'text',
        md: `### 3. Xe + vua chống vua
Khó hơn, cần khoảng 15 đến 20 nước. Xe cắt vua đối phương trong một cái hộp. Đưa vua mình tới **đối diện** vua đối phương (cách nhau một ô, cùng cột hoặc cùng hàng): đúng lúc đó xe chiếu để đẩy nó lùi một hàng. Nếu chưa đối diện được, đi một nước chờ bằng xe trên cùng hàng. Lặp lại cho tới khi vua đối phương ở hàng cuối.

Đánh lại thế dưới đây nhiều lần cho tới khi bạn chiếu hết được trong khoảng 20 nước mà không phải nghĩ lâu.`,
      },
      {
        kind: 'diagram',
        fen: '8/8/4k3/7R/4K3/8/8/8 w - - 0 1',
        marks: ['e5:yellow', 'h5h6:blue'],
        caption: 'Xe h5 cắt hàng 5, vua đen bị nhốt ở hàng 6 trở lên. Hai vua đối diện (ô vàng e5 ở giữa): đúng lúc này Trắng đi Rh6+ (mũi tên), vua đen phải lùi lên hàng 7.',
      },
      {
        kind: 'diagram',
        fen: 'R3k3/8/4K3/8/8/8/8/8 b - - 0 1',
        mate: true,
        marks: ['a8e8:red'],
        caption: 'Hình chiếu hết cuối cùng: Vua e6 đối diện Vua e8 và canh d7, e7, f7; Xe a8 chiếu dọc hàng cuối (mũi tên đỏ). Chiếu hết.',
      },
      {
        kind: 'task',
        fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
        moves: ['a1a8'],
        prompt: 'Xe + vua. Chiếu hết trong 1 nước.',
        explain: 'Ra8#. Vua g6 che hết các ô g7, h7; xe chiếu dọc hàng 8.',
        verify: 'mate',
      },
      { kind: 'practice', ids: ['mate-rook'] },
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
Một quân tấn công **hai mục tiêu cùng lúc**; đối phương chỉ cứu được một. Mã là vua của đòn đôi vì tấn công theo cách không quân nào chặn được. Đòn đôi có chiếu là mạnh nhất vì đối phương bắt buộc phải lo cho vua.`,
      },
      {
        kind: 'diagram',
        fen: '8/5ppk/1P4rp/2n5/K3Q3/6P1/8/8 w - - 3 61',
        lastMove: 'b7c5',
        marks: ['c5a4:red', 'c5e4:red'],
        orientation: 'black',
        caption: 'Đen đi Nc5+. Mã c5 cùng lúc tấn công Vua a4 và Hậu e4 (mũi tên đỏ). Trắng chỉ cứu được một.',
      },
      {
        kind: 'lichess',
        id: 'TMHl9',
        prompt: 'Tìm đòn đôi bằng mã: một nước vừa chiếu vua vừa tấn công một quân khác.',
        explain: 'Mã chiếu vua và cùng lúc tấn công tượng. Vua phải tránh chiếu, mã ăn tượng ở nước sau.',
      },
      {
        kind: 'lichess',
        id: 'uO1oi',
        prompt: 'Tìm đòn đôi bằng hậu: chiếu vua và cùng lúc tấn công xe.',
        explain: 'Hậu chiếu từ e8: vua phải chạy, và cũng từ e8 hậu nhìn dọc đường chéo tới xe g6. Hậu ăn xe ở nước sau.',
      },
      {
        kind: 'lichess',
        id: 'IoVwY',
        prompt: 'Tốt cũng biết đòn đôi. Tìm nước tốt vừa chiếu vua vừa đánh tượng.',
        explain: 'Tốt c6 chiếu vua d7 và tấn công tượng b7. Tốt c6 có tốt d5 bảo vệ, nên tượng ăn tốt thì tốt d5 ăn lại tượng (cũng là chiếu). Đòn đôi bằng tốt chỉ ăn quân được khi tốt đó có quân bảo vệ.',
      },
      {
        kind: 'text',
        md: `### Ghim (pin)
Quân đứng giữa bị "dính" vì phía sau nó là quân giá trị hơn (hoặc vua). Ghim vào vua là **ghim tuyệt đối**: quân bị ghim không được phép rời khỏi đường ghim. Cách khai thác: **tấn công thêm quân bị ghim** bằng tốt hoặc quân khác.`,
      },
      {
        kind: 'diagram',
        fen: '3r2k1/pp3ppp/4p3/8/5PR1/2P3P1/PP4P1/3rQ1K1 w - - 1 27',
        lastMove: 'd4d1',
        marks: ['d1g1:red', 'e1:yellow'],
        orientation: 'black',
        caption: 'Đen đi Rd1. Xe d1 tấn công Hậu e1 (vòng tròn), và ngay sau nó trên cùng đường là Vua g1. Hậu bị ghim: rời khỏi đường thẳng đó là để Vua bị chiếu, luật không cho.',
      },
      {
        kind: 'lichess',
        id: 'Bgpzt',
        prompt: 'Hậu trắng và vua trắng đứng cùng hàng 3, giữa chúng chỉ có ô trống. Khai thác ghim.',
        explain: 'Xe d3 tấn công hậu, và hậu không thể tránh vì nó bị ghim vào vua g3. Hậu ăn xe thì xe d7 ăn lại hậu: Đen đổi một xe lấy cả hậu.',
      },
      {
        kind: 'puzzles',
        themes: ['fork', 'pin'],
        rating: [600, 1000],
        count: 6,
        intro: 'Đòn đôi và ghim: 6 bài.',
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
Ngược với ghim: quân **giá trị cao đứng trước**, khi nó buộc phải đi thì quân phía sau bị bắt. Thường là chiếu vua rồi lấy hậu/xe đứng sau.`,
      },
      {
        kind: 'diagram',
        fen: '8/5p2/2r2k1R/8/5P2/5K2/5P2/8 b - - 0 53',
        lastMove: 'h5h6',
        marks: ['h6c6:red', 'f6:yellow'],
        orientation: 'white',
        caption: 'Trắng đi Rxh6+. Xe h6 chiếu Vua f6 (vòng tròn). Vua phải tránh, và Xe c6 đứng ngay sau nó trên cùng đường bị ăn. Đó là xiên.',
      },
      {
        kind: 'lichess',
        id: 'RYsfN',
        prompt: 'Tìm đòn xiên: chiếu vua, để lộ quân đứng phía sau nó.',
        explain: 'Tượng chiếu vua e3 dọc đường chéo c1-h6. Vua tránh đi, tượng ăn tượng f4 đứng sau lưng vua trên cùng đường chéo.',
      },
      {
        kind: 'text',
        md: `### Tấn công mở (discovered attack)
Di chuyển một quân để **mở đường** cho quân phía sau tấn công. Quân di chuyển nên tạo đe dọa riêng (chiếu, bắt quân) để thành **hai đe dọa cùng lúc**. Chiếu mở (discovered check) là dạng mạnh nhất.`,
      },
      {
        kind: 'diagram',
        fen: '3r4/pp2kpp1/6p1/8/4nP2/1P4P1/P2R1KBP/8 w - - 5 34',
        lastMove: 'd6e4',
        marks: ['d8d2:red', 'e4f2:blue'],
        orientation: 'black',
        caption: 'Đen đi Ne4+. Mã vừa rời d6, mở đường cho Xe d8 đánh Xe d2 (mũi tên đỏ). Cùng lúc Mã e4 chiếu Vua (mũi tên xanh). Hai đe dọa một lúc, Trắng chỉ đỡ được một.',
      },
      {
        kind: 'lichess',
        id: 'Vq7Es',
        prompt: 'Mã d3 đang chắn giữa xe d2 và xe đen d8. Tìm tấn công mở.',
        explain: 'Mã ăn tốt e5 kèm chiếu. Mã vừa rời d3 thì xe d2 nhìn thẳng tới xe d8. Đen phải lo chiếu, Trắng ăn xe d8.',
      },
      {
        kind: 'text',
        md: `### Chiếu hết hàng cuối (back rank)
Sau khi nhập thành, ba tốt f-g-h che vua nhưng cũng nhốt nó. Nếu hàng cuối không có xe/hậu canh, một xe xuống là hết. Phòng ngừa: đi h3 (hoặc h6) tạo "lỗ thở" khi trung cuộc đã ổn định.`,
      },
      {
        kind: 'diagram',
        fen: '2r2rk1/5pp1/p3p2p/1p2P3/7Q/PP4R1/1P4PP/4q2K w - - 0 32',
        lastMove: 'c1e1',
        marks: ['e1h1:red', 'g2:yellow', 'h2:yellow'],
        orientation: 'black',
        caption: 'Đen đi Qxe1#. Hậu chiếu Vua h1 dọc hàng cuối. Vua không lên được vì chính các Tốt g2, h2 của mình chắn (vòng tròn), không quân nào che được: chiếu hết.',
      },
      {
        kind: 'lichess',
        id: '2cGjV',
        prompt: 'Vua đen bị ba tốt của chính mình nhốt ở hàng cuối. Chiếu hết trong một nước.',
        explain: 'Hậu xuống hàng 8 chiếu. Vua không lên được vì tốt f7, g7, h7 chắn, và không quân nào che được: chiếu hết hàng cuối.',
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
- Vua đứng ở hàng 6 (trước tốt) thì **luôn thắng**, bất kể ai đi (trừ tốt biên).
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
        explain: 'Ke7! giữ đối vua (hai vua cách một ô, Trắng phải đi). Nếu Trắng Kd5 thì Kd7, nếu Kf5 thì Kf7, luôn đối diện. Kd7 hoặc Kf7?? thua vì vua trắng lên được hàng 6 ({^Kf7 Kd6} hoặc {^Kd7 Kf6}) và mở đường cho tốt.',
        verify: 'best',
      },
      { kind: 'practice', ids: ['kp-win-6th', 'kp-win-opposition', 'kp-draw-opposition'], intro: 'Hai thế thắng và một thế thủ hòa. Đánh tiếp với máy: chỉ một nước Vua sai là kết quả đổi ngay, và máy sẽ báo cho bạn biết.' },
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
        prompt: 'Thế cờ sau 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6. Bước 1: Đen vừa đe dọa gì? Mã f6 đang đánh tốt e4. Hãy đi một nước vừa giữ tốt e4 vừa phát triển an toàn.',
        explain: 'Đen đe dọa Nxe4. Trắng có thể bảo vệ bằng d3 hoặc Nc3, hoặc phản công bằng Ng5 (dẫn tới biến phức tạp). Ở trình độ này d3 hoặc Nc3 là đủ tốt.',
        verify: 'line',
      },
      {
        kind: 'task',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4',
        moves: ['d7d5'],
        prompt: 'Trắng vừa đi 4.Ng5, dọa ăn tốt f7 bằng cả mã lẫn tượng. Tìm nước phòng thủ tốt nhất cho Đen: chặn đường tấn công vào f7.',
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
