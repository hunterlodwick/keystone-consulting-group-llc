import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../../src/App';
import { publicRoutes } from '../seo-routes';
export const routes = publicRoutes;
export const render = (path: string) => renderToStaticMarkup(<App initialPath={path} />);
