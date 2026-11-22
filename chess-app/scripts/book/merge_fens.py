import json, glob
out = {}
notes = {}
for f in sorted(glob.glob('fens_*.jsonl')):
    for line in open(f):
        line = line.strip()
        if not line: continue
        d = json.loads(line)
        board = [['' for _ in range(8)] for _ in range(8)]
        fixes = {50: {'d8': 'q'}}
        for color, arr in (('w', d['white']), ('b', d['black'])):
            for p in arr:
                t, sq = p[0], p[1:]
                f_, r = ord(sq[0]) - 97, int(sq[1]) - 1
                board[r][f_] = t.upper() if color == 'w' else t.lower()
        for sq, pc in fixes.get(d['fig'], {}).items():
            board[int(sq[1]) - 1][ord(sq[0]) - 97] = pc or ''
        rows = []
        for r in range(7, -1, -1):
            s = ''; e = 0
            for f_ in range(8):
                c = board[r][f_]
                if c: 
                    if e: s += str(e); e = 0
                    s += c
                else: e += 1
            if e: s += str(e)
            rows.append(s)
        out[str(d['fig'])] = '/'.join(rows)
        if d.get('confidence') == 'low' or d.get('note'): notes[str(d['fig'])] = (d.get('confidence'), d.get('note'))
json.dump(out, open('fens.json', 'w'), indent=0)
print(len(out), 'figs;', 'low:', [k for k, v in notes.items() if v[0] == 'low'])
