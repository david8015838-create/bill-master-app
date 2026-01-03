import React from 'react';
import ReactDOM from 'react-dom/client';
// 關鍵：在瀏覽器模式下，引用 App 必須加上 .tsx 副檔名
import App from './App.tsx';

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
