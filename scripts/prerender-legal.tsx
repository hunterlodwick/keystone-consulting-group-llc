import { readFile, writeFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import LegalPage from '../src/pages/LegalPage';

// Keep hard-load HTML and the interactive app on the same source of legal copy.
const shell = await readFile('dist/index.html', 'utf8');
for (const kind of ['privacy', 'terms'] as const) {
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const content = renderToStaticMarkup(<LegalPage kind={kind} onNavigate={() => {}} />);
  const html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${title} | Keystone Consulting Group</title>`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
  if (!html.includes(content) || html === shell) throw new Error(`Failed to prerender ${kind}`);
  await writeFile(`dist/${kind}.html`, html);
}
