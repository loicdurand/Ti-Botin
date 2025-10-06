import React from 'react';
import ReactDOM from 'react-dom/client';
import logic from './ts/logic.js';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

async function onReady(selector: string): Promise<any> {
  while (document.querySelector(selector) === null)
    await new Promise(resolve => requestAnimationFrame(resolve));
  return document.querySelector(selector);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

onReady('#map').then(logic);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
