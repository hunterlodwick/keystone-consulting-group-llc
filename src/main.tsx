import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BookingAttributionProvider } from './components/BookingAttribution';
import { ChatWidget } from './components/chat/ChatWidget';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BookingAttributionProvider>
      <App />
      <ChatWidget />
    </BookingAttributionProvider>
  </StrictMode>,
);
