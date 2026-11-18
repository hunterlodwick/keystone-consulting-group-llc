import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { AI_AGENTS, AI_HUB_PATH } from '../../src/content/ai-agents';
import { guides, guidePath } from '../../src/content/guides';

// Independent of the generated corpus and scripts/seo-routes: read the router's
// actual industry array, service definitions, and the two public data registries.
function arrayInitializer(path: string, name: string): ts.ArrayLiteralExpression {
  const source = ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let found: ts.ArrayLiteralExpression | undefined;
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name && node.initializer && ts.isArrayLiteralExpression(node.initializer)) found=node.initializer;
    ts.forEachChild(node,visit);
  }
  visit(source);
  if (!found) throw Error(`Inventory declaration missing: ${name}`);
  return found;
}
export function independentRoutes(): string[] {
  const industry = arrayInitializer('src/App.tsx','industryRoutes').elements.map(n=> {
    if (!ts.isStringLiteral(n)) throw Error('Nonliteral industry route');
    return n.text;
  });
  const service = arrayInitializer('src/pages/ServicesPage.tsx','SERVICES_DETAIL').elements.map(n=> {
    if (!ts.isObjectLiteralExpression(n)) throw Error('Nonliteral service');
    const field = n.properties.find(p=>ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name)?p.name.text:ts.isStringLiteral(p.name)?p.name.text:'')==='id') as ts.PropertyAssignment;
    if (!field || !ts.isStringLiteral(field.initializer)) throw Error('Nonliteral service id');
    return `/services/${field.initializer.text}`;
  });
  const routes = ['/', '/services','/work','/privacy','/terms',...industry,...service,AI_HUB_PATH,...AI_AGENTS.map(a=>a.path),'/guides',...guides.map(g=>guidePath(g.slug))];
  if (new Set(routes).size!==routes.length) throw Error('Duplicate public route');
  return routes.sort();
}
