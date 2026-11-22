"""Build chess-app/src/data/book.json from the converted book and the Vietnamese translation.

Inputs: book_alg.json (converter output), tr/synced.json (translation carried over by resync.py),
        tr/fix_*.json (proofreading pass, overrides synced).
"""
import json, glob, sys, re
a = json.load(open('book_alg.json'))
vi = json.load(open('tr/synced.json'))
fixed = 0
for f in sorted(glob.glob('tr/fix_*.json')):
    try:
        for u in json.load(open(f)):
            if u.get('vi', '').strip(): vi[u['id']] = u['vi']; fixed += 1
    except Exception as e:
        print('skip', f, e)
missing = []
def tr(id_, text):
    if id_ in vi and vi[id_].strip(): return vi[id_]
    missing.append(id_)
    return text
# prose that appears inside the move columns
CELL = [(r'^Resigns\.?$', 'Xin thua'), (r'^K moves$', 'Vua đi'), (r'^Black moves$', 'Đen đi'), (r'^White mates$', 'Trắng chiếu hết'),
        (r'^\(Best; see why\.\)$', '(Tốt nhất; hãy tìm hiểu vì sao.)'), (r'^\(Best\.\)$', '(Tốt nhất.)'), (r'^Drawn\.?$', 'Hòa'),
        (r'^6\. P - R 8 \(Q\), and wins\.$', '6.a8=Q và thắng.'), (r'^11\. P - Kt 4, and White wins\.$', '11.g4 và Trắng thắng.')]
def cell(x):
    x = (x or '').strip()
    for pat, rep in CELL:
        if re.match(pat, x): return rep
    return x
MOVE_HEADING = re.compile(r'^\d+\.\s*(?:\.{3,}|(?:[KQ]\s*)?(?:Kt|[KQRBP])\s*(?:\([^)]*\))?\s*[-x])')
out = {'meta': {'title': 'Những nguyên lý cơ bản của cờ vua', 'author': 'José Raúl Capablanca',
                'note': 'Bản dịch tiếng Việt từ nguyên tác tiếng Anh năm 1921 (public domain). Ký hiệu nước đi đã được chuyển từ kiểu mô tả cũ sang ký hiệu đại số và kiểm bằng máy; 150 hình được chép lại từ bản in. Bản dịch đang được hiệu đính: nước đi in màu xám là nước máy chưa xác minh được vị trí.'},
       'parts': []}
merged = 0
for pi, p in enumerate(a['parts']):
    P = {'title': 'PHẦN I' if pi == 0 else 'PHẦN II: 14 VÁN ĐẤU MINH HỌA', 'chapters': []}
    for ci, c in enumerate(p['chapters']):
        C = {'title': c['title'].replace('CHAPTER', 'CHƯƠNG').replace('GAMES', 'CÁC VÁN ĐẤU'), 'heading': tr(f'{pi}.{ci}.h', c['heading']) if c['heading'] else '', 'sections': []}
        for si, s in enumerate(c['sections']):
            blocks = []
            for bi, b in enumerate(s['blocks']):
                if b['t'] in ('p', 'h'):
                    if not b.get('text', '').strip(): continue
                    blocks.append({'t': b['t'], 'text': tr(f'{pi}.{ci}.{si}.{bi}', b['text'])})
                elif b['t'] == 'fig':
                    blocks.append({'t': 'fig', 'n': b['n'], 'fen': b.get('fen'), 'displayOnly': b.get('displayOnly', False)})
                elif b['t'] == 'moves':
                    blocks.append({'t': 'moves', 'rows': [{'n': r['n'] if r.get('w') is not None else '', 'w': cell(r.get('w') if r.get('w') is not None else r['n']), 'b': cell(r.get('b', ''))} for r in b['rows']]})
            moves = [[m['id'], m['san'], m['uci'], m['fen']] for m in s['moves']]
            heading_vi = tr(f'{pi}.{ci}.{si}.h', s['heading']) if s['heading'] else ''
            # a "heading" that is really a line of moves (or an untitled lead-in) belongs to the previous section
            if C['sections'] and (not s['heading'] or MOVE_HEADING.match(s['heading'])):
                prev = C['sections'][-1]
                if heading_vi: prev['blocks'].append({'t': 'h', 'text': heading_vi})
                prev['blocks'].extend(blocks); prev['moves'].extend(moves); merged += 1
                continue
            C['sections'].append({'heading': heading_vi or C['heading'] or C['title'], 'blocks': blocks, 'moves': moves})
        P['chapters'].append(C)
    out['parts'].append(P)
dst = sys.argv[1] if len(sys.argv) > 1 else '/home/user/ulid-collision-detector/chess-app/src/data/book.json'
json.dump(out, open(dst, 'w'), ensure_ascii=False, separators=(',', ':'))
nsec = sum(len(c['sections']) for p in out['parts'] for c in p['chapters'])
left = sum(len(re.findall(r'\[\?', json.dumps(b, ensure_ascii=False))) for p in out['parts'] for c in p['chapters'] for s in c['sections'] for b in s['blocks'])
print(f'wrote {dst}: {nsec} sections ({merged} move-line headings merged), {fixed} proofread units applied, {len(missing)} untranslated units, {left} placeholders left')
if missing: print('untranslated:', missing[:20])
