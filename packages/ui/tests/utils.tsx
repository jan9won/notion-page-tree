import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

interface providerWrapperArgument {
	children: React.ReactElement;
}

const AllTheProviders = ({ children }: providerWrapperArgument) => {
	return <>{children}</>;
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
	render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
