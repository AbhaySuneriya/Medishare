
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply theme class immediately on page load to prevent flash
const storedTheme = localStorage.getItem('color-theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
