import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './index.css'; // Importe o novo arquivo de saída gerado pelo Tailwind
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
