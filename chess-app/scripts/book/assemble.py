"""Merge book_alg.json with translations tr/out_*.json -> chess-app/src/data/book.json (compact)."""
import json, glob, sys, re
a = json.load(open('book_alg.json'))
vi = {}
for f in sorted(glob.glob('tr/out_*.json')):
    try:
        for u in json.load(open(f)):
            vi[u['id']] = u['vi']
    except Exception as e:
        print('skip', f, e)
missing = 0
def tr(id_, text):
    global missing
    if id_ in vi and vi[id_].strip():
        return vi[id_]
    missing += 1
    return text
out = {'meta': {'title': 'Những nguyên lý cơ bản của cờ vua', 'author': 'José Raúl Capablanca',
                'note': 'Bản dịch tiếng Việt từ nguyên tác tiếng Anh năm 1921 (public domain). Ký hiệu nước đi đã được chuyển từ kiểu mô tả cũ sang ký hiệu đại số và kiểm chứng bằng máy; 150 hình được chép lại từ bản in.'},
       'parts': []}
for pi, p in enumerate(a['parts']):
    P = {'title': tr(f'{pi}.h', p['title']) if False else ('PHẦN I' if pi == 0 else 'PHẦN II: 14 VÁN ĐẤU MINH HỌA'), 'chapters': []}
    for ci, c in enumerate(p['chapters']):
        C = {'title': c['title'].replace('CHAPTER', 'CHƯƠNG').replace('GAMES', 'CÁC VÁN ĐẤU'), 'heading': tr(f'{pi}.{ci}.h', c['heading']) if c['heading'] else '', 'sections': []}
        for si, s in enumerate(c['sections']):
            S = {'heading': tr(f'{pi}.{ci}.{si}.h', s['heading']), 'blocks': [], 'moves': [[m['id'], m['san'], m['uci'], m['fen']] for m in s['moves']]}
            for bi, b in enumerate(s['blocks']):
                if b['t'] in ('p', 'h'):
                    if not b.get('text', '').strip(): continue
                    S['blocks'].append({'t': b['t'], 'text': tr(f'{pi}.{ci}.{si}.{bi}', b['text'])})
                elif b['t'] == 'fig':
                    S['blocks'].append({'t': 'fig', 'n': b['n'], 'fen': b.get('fen'), 'displayOnly': b.get('displayOnly', False)})
                elif b['t'] == 'moves':
                    S['blocks'].append({'t': 'moves', 'rows': [{'n': r['n'], 'w': r.get('w', ''), 'b': r.get('b', '')} for r in b['rows']]})
            C['sections'].append(S)
        P['chapters'].append(C)
    out['parts'].append(P)
dst = sys.argv[1] if len(sys.argv) > 1 else '/home/user/ulid-collision-detector/chess-app/src/data/book.json'
json.dump(out, open(dst, 'w'), ensure_ascii=False, separators=(',', ':'))
print('wrote', dst, 'untranslated units:', missing)
