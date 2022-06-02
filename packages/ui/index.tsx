import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';
import { worker } from './tests/mocks/browser';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material';

// import { store } from './src/redux/sample/store'; // sample store
import { Provider } from 'react-redux';
import { StrictMode } from 'react';

import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('app');
const root = createRoot(container as Element);

const darkTheme = createTheme({
	palette: {
		mode: 'dark'
	}
});

(async function main() {
	if (process.env.NODE_ENV === 'development') {
		await worker.start({ onUnhandledRequest: 'bypass' });
	}

	root.render(
		// <Provider store={store}>
		<ThemeProvider theme={darkTheme}>
			<BrowserRouter>
				<StrictMode>
					<App />
				</StrictMode>
			</BrowserRouter>
		</ThemeProvider>
		// </Provider>
	);
})();
