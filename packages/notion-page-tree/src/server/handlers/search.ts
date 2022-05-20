import { type Router, type Request } from 'express';
import { NotionPageTreeDataSet } from '../..';
export const searchServerHandler = (
	app: Router,
	data_set: NotionPageTreeDataSet
) => {
	app.get(
		'/search',
		(req: Request<unknown, unknown, unknown, { keyword: string }>, res) => {
			data_set.search_index
				? req.query.keyword && req.query.keyword !== ''
					? res.send(
							JSON.stringify(
								data_set.search_index.search(
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
