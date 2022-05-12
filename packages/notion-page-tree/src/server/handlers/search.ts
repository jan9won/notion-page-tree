import { type Router, type Request } from 'express';
import type lunr from 'lunr';
export const searchServerHandler = (
	app: Router,
	search_index: lunr.Index | undefined
) => {
	app.get(
		'/search',
		(req: Request<unknown, unknown, unknown, { keyword: string }>, res) => {
			search_index
				? req.query.keyword && req.query.keyword !== ''
					? res.send(
							JSON.stringify(
								search_index.search(
									`${req.query.keyword
										.split(' ')
										.map(
											word => `*${word}* ${word}~${Math.floor(word.length / 4)}`
										)
										.join(' ')}`
								)
							)
					  )
					: res.sendStatus(502)
				: res.sendStatus(503);
		}
	);
};
