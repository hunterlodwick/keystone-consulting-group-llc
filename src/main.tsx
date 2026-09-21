import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BookingAttributionProvider } from './components/BookingAttribution';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BookingAttributionProvider><App /></BookingAttributionProvider>
  </StrictMode>,
);
