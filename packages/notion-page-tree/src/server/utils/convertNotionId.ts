export const convertNotionId = (id: string, convertTo: 'plain' | 'dashed') => {
	if (convertTo === 'dashed' && id.length === 32) {
		return [8, 4, 4, 4, 16].reduce(
			(acc, val, idx) => ({
				i: acc.i + val,
				v:
					(acc.v !== '' && idx !== 5 ? acc.v + '-' : acc.v) +
					id.slice(acc.i, acc.i + val)
			}),
			{ i: 0, v: '' }
		).v;
	}

	if (convertTo === 'plain' && id.length === 36) {
		return id.split('-').join();
	}

	return false;
};
