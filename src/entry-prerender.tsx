import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';

// Vite transforms the same CSS and TSX imports as the browser build.
// No effects run, requests are sent, or forms are submitted during this render.
export function renderGuide(path: string) {
  return renderToStaticMarkup(<App initialPath={path} />);
}
