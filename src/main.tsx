import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
// Eagerly import and use store to ensure window.useGameStore is set before React renders
import { useGameStore } from '@/store/gameStore';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

// Force store initialization to ensure window.useGameStore is available for E2E tests
// This must happen before React renders anything
if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
