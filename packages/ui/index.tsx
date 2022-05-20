import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';

// import { store } from './src/redux/sample/store'; // sample store
import { Provider } from 'react-redux';

const container = document.getElementById('app');
const root = createRoot(container as Element);
root.render(
	// <Provider store={store}>
	<App />
	// </Provider>
);
