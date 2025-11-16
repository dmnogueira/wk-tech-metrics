import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('🔴 Global Error:', event.error);
  console.error('Message:', event.message);
  console.error('File:', event.filename);
  console.error('Line:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 Unhandled Promise Rejection:', event.reason);
});

console.log('✅ main.tsx loaded');
console.log('✅ Attempting to mount React app...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('❌ FATAL: Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 20px; color: white; background: #dc2626;">
      <h1>ERRO FATAL</h1>
      <p>Elemento #root não encontrado no DOM!</p>
    </div>
  `;
} else {
  console.log('✅ Root element found:', rootElement);
  
  try {
    const root = createRoot(rootElement);
    console.log('✅ React root created');
    
    root.render(<App />);
    console.log('✅ React app rendered');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; background: #dc2626;">
        <h1>ERRO AO RENDERIZAR</h1>
        <p>Erro: ${error instanceof Error ? error.message : String(error)}</p>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
  }
}
