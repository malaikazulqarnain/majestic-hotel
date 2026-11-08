import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles.css';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30000 } } });
async function start() {
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
  createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={qc}><BrowserRouter><App /></BrowserRouter></QueryClientProvider>);
}
start();
