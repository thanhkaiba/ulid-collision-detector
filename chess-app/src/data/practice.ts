/**
 * Endgame positions to play out against the engine at full strength.
 * Every position is checked by scripts/verify_practice.cjs (the goal must be reachable with best play).
 */
export type PracticeGoal = 'mate' | 'win' | 'draw';

export interface PracticePosition {
  id: string;
  group: 'Chiếu hết cơ bản' | 'Cờ tàn Tốt' | 'Cờ tàn Xe' | 'Cờ tàn Hậu';
  title: string;
  fen: string;
  /** side the student plays */
  me: 'w' | 'b';
  /**
   * mate: checkmate the engine. win: promote safely or win decisive material (then the app stops).
   * draw: hold the position (a real draw, or `hold` moves without the engine getting a winning position).
   */
  goal: PracticeGoal;
  hold?: number;
  /** what to do, shown before the first move */
  brief: string;
  /** the method, shown on request */
  hint: string;
  level: 1 | 2 | 3;
  /** the student plays the other side of the position (see swapPractice) */
  swapped?: boolean;
}

/**
 * The same position from the other side: the attacker's technique is played by the engine and the student tries to
 * escape (a draw counts as escaping), or, for a defensive position, the student tries to beat the engine's defence.
 */
export function swapPractice(p: PracticePosition): PracticePosition {
  const me = p.me === 'w' ? 'b' : 'w';
  const side = me === 'w' ? 'Trắng' : 'Đen';
  if (p.goal === 'draw')
    return {
      ...p,
      me,
      swapped: true,
      goal: 'win',
      hold: 25,
      brief: `Đổi bên: bạn cầm ${side} và thử thắng máy. Máy phòng thủ đúng kỹ thuật bạn vừa học. Theo lý thuyết thế này hòa, hãy xem bạn có tìm ra kẽ hở không.`,
    };
  return {
    ...p,
    me,
    swapped: true,
    goal: 'draw',
    hold: undefined,
    brief: `Đổi bên: bạn cầm ${side} và bị tấn công. Máy dùng đúng kỹ thuật. Thử chạy trốn: nếu ván kết thúc hòa (ví dụ bạn ăn được quân của máy, hoặc máy làm pat) là bạn thắng thử thách.`,
  };
}

export const PRACTICE: PracticePosition[] = [
  {
    id: 'mate-two-rooks',
    group: 'Chiếu hết cơ bản',
    title: 'Hai Xe chiếu hết (cái thang)',
    fen: '8/8/8/4k3/8/8/8/R3K2R w - - 0 1',
    me: 'w',
    goal: 'mate',
    brief: 'Bạn cầm Trắng. Dùng hai Xe dồn Vua Đen ra mép bàn và chiếu hết.',
    hint: 'Một Xe cắt ngang một hàng không cho Vua quay lại, Xe kia chiếu ở hàng kế tiếp. Cứ thế thay phiên như leo thang. Khi Vua Đen áp sát Xe, đưa Xe sang cánh xa trên cùng hàng đó.',
    level: 1,
  },
  {
    id: 'mate-queen',
    group: 'Chiếu hết cơ bản',
    title: 'Vua và Hậu chiếu hết',
    fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1',
    me: 'w',
    goal: 'mate',
    brief: 'Bạn cầm Trắng. Dùng Hậu thu hẹp “cái hộp” của Vua Đen, đưa Vua mình tới hỗ trợ rồi chiếu hết.',
    hint: 'Đặt Hậu cách Vua Đen một nước Mã để thu nhỏ hộp, không cần chiếu. Khi Vua Đen chỉ còn hai ô ở góc, DỪNG Hậu lại và đưa Vua mình tới gần, nếu không sẽ hòa pat. Cuối cùng Hậu chiếu hết ngay cạnh Vua Đen, được Vua mình bảo vệ.',
    level: 1,
  },
  {
    id: 'mate-rook',
    group: 'Chiếu hết cơ bản',
    title: 'Vua và Xe chiếu hết',
    fen: '8/8/8/4k3/8/8/8/4K2R w - - 0 1',
    me: 'w',
    goal: 'mate',
    brief: 'Bạn cầm Trắng. Chiếu hết chỉ với Vua và Xe. Cần khoảng 15 đến 20 nước.',
    hint: 'Xe cắt Vua Đen trong một cái hộp. Đưa Vua mình tới đối mặt với Vua Đen (cách nhau một ô): lúc đó Xe chiếu để đẩy Vua Đen lùi một hàng. Nếu chưa đối mặt được, đi một nước chờ bằng Xe trên cùng hàng.',
    level: 1,
  },
  {
    id: 'mate-two-bishops',
    group: 'Chiếu hết cơ bản',
    title: 'Hai Tượng chiếu hết',
    fen: '8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1',
    me: 'w',
    goal: 'mate',
    brief: 'Bạn cầm Trắng. Bài khó: dùng hai Tượng và Vua dồn Vua Đen vào góc. Bạn có 50 nước.',
    hint: 'Hai Tượng đứng cạnh nhau tạo thành một bức tường chéo. Vua mình đi trước, hai Tượng theo sau thu hẹp dần. Vua Đen phải bị dồn vào GÓC, không phải chỉ ra mép.',
    level: 3,
  },
  {
    id: 'kp-win-6th',
    group: 'Cờ tàn Tốt',
    title: 'Vua ở hàng 6 trước Tốt: thắng',
    fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
    me: 'w',
    goal: 'win',
    brief: 'Bạn cầm Trắng. Vua đã đứng hàng 6 trước Tốt: thế này luôn thắng. Hãy phong Hậu an toàn.',
    hint: 'Đi Vua sang một bên (Kd6 hoặc Kf6) để chiếm ô phong cấp trước, rồi mới đẩy Tốt. Đừng đẩy Tốt chiếu ở hàng 7 khi Vua chưa kiểm soát ô phong: sẽ hòa pat.',
    level: 1,
  },
  {
    id: 'kp-win-opposition',
    group: 'Cờ tàn Tốt',
    title: 'Giành ô then chốt từ xa',
    fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
    me: 'w',
    goal: 'win',
    brief: 'Bạn cầm Trắng. Thắng được, nhưng chỉ khi Vua đi TRƯỚC Tốt. Hãy phong Hậu an toàn.',
    hint: 'Đừng đẩy Tốt vội. Đưa Vua lên trước Tốt, càng xa càng tốt (Kd2, Ke3, Ke4). Khi hai Vua đối mặt mà tới lượt bạn, dùng nước Tốt dự trữ để giành đối Vua. Ô then chốt của Tốt e là d6, e6, f6 khi Tốt đã qua hàng 4.',
    level: 2,
  },
  {
    id: 'kp-draw-opposition',
    group: 'Cờ tàn Tốt',
    title: 'Thủ hòa bằng đối Vua',
    fen: '8/8/8/4k3/4P3/4K3/8/8 b - - 0 1',
    me: 'b',
    goal: 'draw',
    hold: 14,
    brief: 'Bạn cầm Đen, kém một Tốt. Vua Trắng chưa vượt lên trước Tốt nên thế này hòa, nếu bạn lùi Vua đúng cách.',
    hint: 'Luôn lùi thẳng (Ke6, rồi Ke7, Ke8) và khi Vua Trắng tiến lên thì bước ra đối mặt với nó. Ở hàng cuối: lùi thẳng về ô phong cấp, không lùi chéo.',
    level: 2,
  },
  {
    id: 'kp-draw-rook-pawn',
    group: 'Cờ tàn Tốt',
    title: 'Tốt cột biên: chạy về góc',
    fen: '8/5k2/8/8/2K5/8/P7/8 b - - 0 1',
    me: 'b',
    goal: 'draw',
    hold: 14,
    brief: 'Bạn cầm Đen. Tốt cột a là Tốt khó thắng nhất: chỉ cần Vua bạn kịp về vùng góc a8 là hòa.',
    hint: 'Chạy thẳng về c8 (Ke7, Kd7, Kc8). Tới được c8 hoặc b8 thì Trắng không thể đuổi Vua bạn khỏi góc: hoặc pat, hoặc Vua Trắng tự bị nhốt trước Tốt.',
    level: 2,
  },
  {
    id: 'q-vs-pawn7',
    group: 'Cờ tàn Hậu',
    title: 'Hậu chống Tốt hàng 7',
    fen: '8/8/8/8/8/1Q6/3pk3/7K w - - 0 1',
    me: 'w',
    goal: 'mate',
    brief: 'Bạn cầm Trắng. Tốt Đen sắp phong Hậu, Vua bạn ở xa. Vẫn thắng được với Tốt cột d: hãy bắt Tốt rồi chiếu hết.',
    hint: 'Dùng Hậu chiếu liên tục để ép Vua Đen phải bước vào ô d1 ngay trước Tốt. Mỗi lần như vậy Tốt không phong được, bạn có một nhịp đưa Vua lại gần. Lặp lại cho tới khi Vua tới nơi.',
    level: 3,
  },
  {
    id: 'lucena',
    group: 'Cờ tàn Xe',
    title: 'Thế Lucena: bắc cầu',
    fen: '2K5/2P2k2/8/8/8/8/r7/4R3 w - - 0 1',
    me: 'w',
    goal: 'win',
    brief: 'Bạn cầm Trắng. Tốt đã ở hàng 7, Vua bạn đứng trước Tốt. Dùng kỹ thuật “bắc cầu” để phong Hậu hoặc thắng Xe.',
    hint: 'Đưa Xe lên hàng 4 (Re4). Sau đó Vua bước ra khỏi ô c8 qua cột d, chịu các nước chiếu của Xe Đen và đi dần xuống hàng 5. Khi Xe Đen chiếu lần cuối, Xe bạn che ở hàng 4: đó là cây cầu.',
    level: 2,
  },
  {
    id: 'philidor',
    group: 'Cờ tàn Xe',
    title: 'Thế Philidor: thủ hòa',
    fen: '4k3/7R/r7/3KP3/8/8/8/8 w - - 0 1',
    me: 'b',
    goal: 'draw',
    hold: 14,
    brief: 'Bạn cầm Đen, kém một Tốt. Đây là thế thủ quan trọng nhất của cờ tàn Xe: giữ được là hòa.',
    hint: 'Giữ Xe ở hàng 6 để Vua Trắng không lên được hàng đó. Ngay khi Tốt Trắng tiến lên e6, đưa Xe xuống tận hàng 1 và chiếu liên tục từ phía sau: Vua Trắng không còn chỗ nấp.',
    level: 2,
  },
];

export const practiceById = (id: string) => PRACTICE.find((p) => p.id === id);

const PRACTICE_KEY = 'practice-done';
export function loadPracticeDone(): Record<string, 1> {
  try {
    return JSON.parse(localStorage.getItem(PRACTICE_KEY) ?? '{}');
  } catch {
    return {};
  }
}
export function markPracticeDone(id: string) {
  try {
    localStorage.setItem(PRACTICE_KEY, JSON.stringify({ ...loadPracticeDone(), [id]: 1 }));
  } catch {
    /* ignore */
  }
}
