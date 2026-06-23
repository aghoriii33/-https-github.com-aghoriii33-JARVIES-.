import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence benign Vite HMR WebSocket connection errors in sandbox environments
if (typeof window !== 'undefined') {
  const ignorePatterns = [
    "websocket",
    "WebSocket",
    "failed to connect to websocket",
    "WebSocket closed without opened"
  ];

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    if (ignorePatterns.some(pat => errorMsg.includes(pat))) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorMsg = (reason && (reason.stack || reason.message || String(reason))) || '';
    if (ignorePatterns.some(pat => errorMsg.includes(pat))) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
