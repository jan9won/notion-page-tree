import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';
import { worker } from './tests/mocks/browser';

// import { store } from './src/redux/sample/store'; // sample store
import { Provider } from 'react-redux';

const container = document.getElementById('app');
const root = createRoot(container as Element);

if (process.env.NODE_ENV === 'development') {
	worker.start({ onUnhandledRequest: 'bypass' });
}

root.render(
	// <Provider store={store}>
	<React.StrictMode>
		<App />
	</React.StrictMode>
	// </Provider>
);
