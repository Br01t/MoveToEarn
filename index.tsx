
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register Service Worker for PWA features
// Fix: Changed 'service-worker' to 'serviceWorker' to correctly detect support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Fix: Changed navigator.service_worker to navigator.serviceWorker to fix TypeScript error
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);