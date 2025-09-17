import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Add error boundary for debugging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff6b6b; color: white; padding: 20px; border-radius: 8px; z-index: 9999; max-width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
  errorDiv.innerHTML = `
    <h3 style="margin: 0 0 10px 0;">React Error</h3>
    <p style="margin: 0;">${event.error?.message || 'Unknown error'}</p>
    <pre style="margin: 10px 0 0 0; font-size: 12px; white-space: pre-wrap;">${event.error?.stack || ''}</pre>
  `;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 10000);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('🚀 Starting React application...');
  console.log('📍 Current URL:', window.location.href);
  console.log('🔧 Environment:', {
    nodeEnv: import.meta.env.MODE,
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3010/api',
  });
  
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('✅ React application mounted successfully');
  } catch (error) {
    console.error('❌ Failed to mount React application:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="color: #ef4444; margin-bottom: 20px;">Failed to Load Application</h1>
        <p style="color: #6b7280; margin-bottom: 20px;">Please check the browser console for more details.</p>
        <pre style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: left; max-width: 800px; margin: 0 auto; overflow: auto;">
${error instanceof Error ? error.stack : String(error)}
        </pre>
        <div style="margin-top: 30px;">
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
} else {
  console.error('❌ Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; color: #ef4444; font-family: system-ui, -apple-system, sans-serif;">
      <h1>Root element not found!</h1>
      <p>The application cannot start because the #root element is missing.</p>
    </div>
  `;
}
