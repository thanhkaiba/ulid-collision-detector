"""Carry the Vietnamese translation over to a re-converted book (move ids shift when the converter improves).

Reads  book_alg.v1.json (conversion the translation was made from), book_alg.json (new conversion), tr/out_*.json
Writes tr/synced.json  {unit id: vi}        units whose English is unchanged, with move ids remapped
       tr/in_R.json    [{id, text, prev_vi}] units whose converted English changed, or that still carry leftovers
"""
import json, glob, re
TOK = re.compile(r'⟦([^|⟧]*)\|([^⟧]*)⟧')
old = json.load(open('book_alg.v1.json')); new = json.load(open('book_alg.json'))
vi = {}
for f in sorted(glob.glob('tr/out_*.json')):
    for u in json.load(open(f)): vi[u['id']] = u['vi']
def units(a):
    out = {}
    for pi, p in enumerate(a['parts']):
        for ci, c in enumerate(p['chapters']):
            if c['heading']: out[f'{pi}.{ci}.h'] = c['heading']
            for si, s in enumerate(c['sections']):
                out[f'{pi}.{ci}.{si}.h'] = s['heading']
                for bi, b in enumerate(s['blocks']):
                    if b['t'] in ('p', 'h') and b.get('text', '').strip(): out[f'{pi}.{ci}.{si}.{bi}'] = b['text']
    return out
uo, un = units(old), units(new)
norm = lambda t: TOK.sub(lambda m: f'⟦{m.group(2)}⟧', t)
LEFT = re.compile(r'\[\?|⟦-\||\b(?:Kt|[KQRBP])\s*[-x]\s*(?:[KQ]\s*)?(?:Kt|[KQRBP])\b|\b[KQ]\s?(?:R|Kt|B)\s?\d\b|\bmoves\b|\band wins\b')
synced, redo = {}, []
for uid, text in un.items():
    v = vi.get(uid)
    same = uid in uo and norm(uo[uid]) == norm(text)
    if v is not None and same:
        mp = {a: b for (a, _), (b, _) in zip(TOK.findall(uo[uid]), TOK.findall(text))}
        v2 = TOK.sub(lambda m: f"⟦{mp.get(m.group(1), m.group(1))}|{m.group(2)}⟧", v)
        if LEFT.search(v2) or LEFT.search(text): redo.append({'id': uid, 'text': text, 'prev_vi': v2, 'why': 'leftover notation'})
        synced[uid] = v2
    else:
        redo.append({'id': uid, 'text': text, 'prev_vi': v or '', 'why': 'conversion changed'})
json.dump(synced, open('tr/synced.json', 'w'), ensure_ascii=False)
json.dump(redo, open('tr/in_R.json', 'w'), ensure_ascii=False, indent=0)
from collections import Counter
print(len(un), 'units;', len(synced), 'carried over;', len(redo), 'to review:', Counter(r['why'] for r in redo))
print('by chapter:', Counter('.'.join(r['id'].split('.')[:2]) for r in redo))
# prose cells in move tables
cells = Counter()
for p in new['parts']:
    for c in p['chapters']:
        for s in c['sections']:
            for b in s['blocks']:
                if b['t'] == 'moves':
                    for r in b['rows']:
                        for k in ('w', 'b'):
                            x = r.get(k, '')
                            if x and '⟦' not in x and x != '…': cells[x] += 1
print('table prose cells:', cells.most_common(40))
