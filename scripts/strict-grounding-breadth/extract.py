"""Positive rendered DOM extraction. Never scans source strings or metadata."""
import json, re, sys
from html.parser import HTMLParser

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def text(self):
        return re.sub(r'\s+', ' ', ''.join(c if isinstance(c, str) else c.text()+' ' for c in self.children)).strip()
    def walk(self):
        yield self
        for c in self.children:
            if isinstance(c, Node): yield from c.walk()
    def ancestors(self):
        n = self
        while n:
            yield n
            n = n.parent

class Parser(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = self.current = Node('root')
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.current)
        self.current.children.append(n)
        if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:
            self.current = n
    def handle_endtag(self, tag):
        for n in self.current.ancestors():
            if n.tag == tag:
                self.current = n.parent or self.root
                break
    def handle_data(self, data): self.current.children.append(data)

BLOCKED = {'script','style','template','noscript','form','nav','footer','button','input','textarea','select','svg','table'}
BLOCK_CLASSES = {'hidden','sr-only','invisible','opacity-0','partners-accessible','partners-static','guide-meta','guide-citations','guide-sidebar','guide-top-cta','guide-inline-cta','guide-question-list'}
def visible(n):
    for a in n.ancestors():
        if a.tag in BLOCKED or any(k in a.attrs for k in ['hidden','inert']): return False
        if a.attrs.get('aria-hidden') == 'true': return False
        if BLOCK_CLASSES.intersection(a.attrs.get('class','').split()): return False
        if re.search(r'display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:;|$)', a.attrs.get('style','')): return False
        if a.tag == 'details' and 'open' not in a.attrs and n.tag != 'summary': return False
    return True

def public_text(n):
    if not visible(n): return ""
    return re.sub(r"\s+", " ", "".join(c if isinstance(c,str) else public_text(c)+" " for c in n.children)).strip()

def extract(html):
    root = Parser(html).root
    main = next((n for n in root.walk() if n.tag == 'main'), None)
    if main is None: return {'title':'','sections':[], 'anchors':[], 'exclusions':['No public main element']}
    nodes = list(main.walk())
    anchors = sorted({n.attrs['id'] for n in nodes if 'id' in n.attrs and visible(n)})
    title = next((n.text() for n in nodes if n.tag == 'h1' and visible(n)), '')
    groups, group = [], None
    heading2 = ''
    for ordinal,n in enumerate(nodes):
        if not visible(n): continue
        if n.tag in ['h1','h2','h3','h4','summary'] or (n.tag == 'dt' and any(a.attrs.get('id') == 'build-includes' for a in n.ancestors())):
            if group and group['blocks']: groups.append(group)
            if n.tag == 'h2': heading2 = n.text()
            anchor = next((a.attrs['id'] for a in n.ancestors() if a.attrs.get('id') in anchors), '')
            group = {'heading':n.text(), 'parentHeading':heading2 if n.tag in ['h3','h4'] else '', 'anchor':anchor, 'blocks':[], 'ordinal':ordinal}
        elif group and n.tag in ['p','li','dt','dd','aside']:
            if any(a.tag in ['p','li','dd','aside'] for a in list(n.ancestors())[1:]): continue
            # A container with nested headings is not an atomic public prose block.
            if any(c.tag in ['h1','h2','h3','h4','p','li','dd'] for c in list(n.walk())[1:]) and n.tag == 'aside': continue
            text = public_text(n)
            if text and not text.startswith(('Official sources:', 'Sources:')): group['blocks'].append(text)
    if group and group['blocks']: groups.append(group)
    # The logo marquee is visually public but aria-hidden to avoid duplicate SR copy.
    # Read exactly the first visible logo track; never the clipped accessible paragraph.
    partner = next((n for n in nodes if n.attrs.get('id') == 'partners'), None)
    if partner:
        track = next((n for n in partner.walk() if 'marquee-content' in n.attrs.get('class','').split()), None)
        if track:
            names = [n.text() for n in track.walk() if 'partner-logo' in n.attrs.get('class','').split()]
            groups.append({'heading':'Published partners', 'parentHeading':'', 'anchor':'partners', 'blocks':[', '.join(names)], 'ordinal':len(nodes), 'visualException':'First visually displayed logo marquee, excludes duplicate and clipped accessible text'})
    return {'title':title, 'anchors':anchors, 'sections':groups,
      'exclusions':['Outside main; forms/controls; metadata/scripts; hidden or inert content; navigation/related links; citations and image alt; closed details; tables requiring separate contextual review; booking components and nonpublic dashboard are stubbed before loading']}

if __name__ == '__main__':
    data = json.load(sys.stdin)
    json.dump({path:extract(html) for path,html in data.items()},sys.stdout,ensure_ascii=False)
