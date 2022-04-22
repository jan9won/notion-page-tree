import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../src/redux/sample/store';
import { render, RenderOptions } from '@testing-library/react';

interface providerWrapperArgument {
	children: React.ReactElement;
}

const AllTheProviders = ({ children }: providerWrapperArgument) => {
	return <Provider store={store}>{children}</Provider>;
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
	render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
