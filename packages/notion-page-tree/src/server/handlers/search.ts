import { type Router, type Request } from 'express';
import type lunr from 'lunr';
export const searchServerHandler = (app: Router, search_index: lunr.Index) => {
	app.get(
		'/search',
		(req: Request<unknown, unknown, unknown, { keyword: string }>, res) => {
			!search_index && res.sendStatus(503);
			!req.query.keyword || req.query.keyword === ''
				? res.sendStatus(502)
				: res.send(
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
				  );
		}
	);
};
