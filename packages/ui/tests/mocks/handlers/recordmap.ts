import { rest } from 'msw';

export const recordMapHandler = rest.get<undefined, { id: string }>(
	'http://localhost:8000/recordmap/:id',
	async (req, res, ctx) => {
		console.log(
			await fetch(`http://localhost:9001/recordmap/${req.params.id}`)
		);

		return req.params.id
			? res(
					ctx.json(
						await fetch(`http://localhost:9001/recordmap/${req.params.id}`)
					)
			  )
			: res(ctx.status(502));
	}
);
