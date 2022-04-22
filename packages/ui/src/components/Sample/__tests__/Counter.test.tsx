/**
 * @jest-environment jsdom
 */

import React from 'react';
import Counter from '../Counter';
import { render } from '../../../../tests/utils';

it('Counter.tsx', () => {
	expect(render(<Counter />)).toMatchSnapshot();
});
