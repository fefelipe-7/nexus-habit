import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

const ICONS = [
  '/newhabitwizard/body.webp', '/newhabitwizard/book.webp', '/newhabitwizard/diamond.webp',
  '/newhabitwizard/dislike.webp', '/newhabitwizard/idea.webp', '/newhabitwizard/job.webp',
  '/newhabitwizard/medicine.webp', '/newhabitwizard/pencil.webp', '/newhabitwizard/pig.webp',
  '/newhabitwizard/pray.webp', '/newhabitwizard/running.webp', '/newhabitwizard/secret.webp',
  '/newhabitwizard/skills.webp', '/newhabitwizard/sleep.webp', '/newhabitwizard/student.webp',
  '/newhabitwizard/sugar.webp', '/newhabitwizard/test.webp', '/newhabitwizard/water.webp',
];

// Preload icons aggressively into browser cache
if (typeof window !== 'undefined') {
  ICONS.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
