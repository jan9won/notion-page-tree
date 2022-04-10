import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';

const container = document.getElementById('app');
const root = createRoot(container as Element);

root.render(<App />);
