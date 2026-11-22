import re, json, html
raw = open('html/33870-h/33870-h.htm', 'rb').read()
try:
    s = raw.decode('utf-8')
except UnicodeDecodeError:
    s = raw.decode('cp1252', errors='replace')
s = s.replace('\r', '')
# drop page markers
s = re.sub(r'<!-- Page \d+ -->', '', s)
s = re.sub(r'<span\s+class="pagenum">.*?</span>', '', s, flags=re.S)
body = s[s.find('<h2>CHESS FUNDAMENTALS</h2>'):]
body = body[:body.find('*** END OF') if '*** END OF' in body else len(body)]

def clean(t):
    t = re.sub(r'<a [^>]*>(.*?)</a>', r'\1', t, flags=re.S)
    t = re.sub(r'<br\s*/?>', '\n', t)
    t = re.sub(r'<i>(.*?)</i>', r'*\1*', t, flags=re.S)
    t = re.sub(r'<b>(.*?)</b>', r'**\1**', t, flags=re.S)
    t = re.sub(r'<span class="sc">(.*?)</span>', r'\1', t, flags=re.S)
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t).replace('\xa0', ' ')
    t = t.replace('�', 'x').replace('×', 'x')
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r' *\n *', ' ', t).strip()
    return t

# tokenise top-level elements in order
tok = re.compile(r'(<h3>.*?</h3>|<p class="cenhead">.*?</p>|<div class="figcenter".*?</div>|<table class="nobctr".*?</table>|<p>.*?</p>)', re.S)
elems = tok.findall(body)
out = {'parts': []}
part = None; chapter = None; section = None
def ensure_section():
    global section, chapter, part
    if section is None:
        section = {'heading': '', 'blocks': []}
        chapter['sections'].append(section)
for e in elems:
    if e.startswith('<h3>'):
        t = clean(e)
        if t.startswith('PART'):
            part = {'title': t, 'chapters': []}; out['parts'].append(part); chapter = None; section = None
        elif t.startswith('CHAPTER'):
            chapter = {'title': t, 'heading': '', 'sections': []}; part['chapters'].append(chapter); section = None
        continue
    if e.startswith('<p class="cenhead">'):
        t = clean(e)
        if chapter is not None and chapter['heading'] == '' and not re.match(r'^\d+\.', t) and not t.startswith('GAME'):
            chapter['heading'] = t; continue
        if re.match(r'^\d+\. ', t) or t.startswith('GAME'):
            if part and part['title'].startswith('PART II') and chapter is None:
                chapter = {'title': 'GAMES', 'heading': '', 'sections': []}; part['chapters'].append(chapter)
            section = {'heading': t, 'blocks': []}; chapter['sections'].append(section); continue
        ensure_section(); section['blocks'].append({'t': 'h', 'text': t}); continue
    if e.startswith('<div class="figcenter"'):
        m = re.search(r'Fig(\d+)\.jpg', e)
        ensure_section(); section['blocks'].append({'t': 'fig', 'n': int(m.group(1))}); continue
    if e.startswith('<table'):
        rows = []
        for tr in re.findall(r'<tr>(.*?)</tr>', e, flags=re.S):
            cells = [clean(c) for c in re.findall(r'<td[^>]*>(.*?)</td>', tr, flags=re.S)]
            if len(cells) >= 3:
                rows.append({'n': cells[1], 'b': cells[2]})
            elif len(cells) == 2:
                rows.append({'n': cells[0], 'b': cells[1]})
        ensure_section(); section['blocks'].append({'t': 'moves', 'rows': rows}); continue
    if e.startswith('<p>'):
        t = clean(e)
        if not t: continue
        ensure_section(); section['blocks'].append({'t': 'p', 'text': t}); continue
json.dump(out, open('book.json', 'w'), ensure_ascii=False, indent=1)
# stats
np = nf = nm = 0; words = 0
for p in out['parts']:
    print(p['title'])
    for c in p['chapters']:
        print('  ', c['title'], '|', c['heading'], '| sections:', len(c['sections']))
        for sec in c['sections']:
            for b in sec['blocks']:
                if b['t'] == 'p': np += 1; words += len(b['text'].split())
                elif b['t'] == 'fig': nf += 1
                elif b['t'] == 'moves': nm += 1
print('paragraphs', np, 'figs', nf, 'move tables', nm, 'words', words)
