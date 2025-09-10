import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('Starting React application...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
