import { type Router } from 'express';
import { NotionPageTreeDataSet } from '../..';
export const suggestionServerHandler = (
	app: Router,
	data_set: NotionPageTreeDataSet
) => {
	// app.get(
	// 	'/suggestion',
	// 	(req: Request<unknown, unknown, unknown, { keyword: string }>, res) => {
	// 		!search_suggestion && res.sendStatus(503);
	// 		!req.query.keyword || req.query.keyword === ''
	// 			? res.sendStatus(502)
	// 			: res.send(
	// 					JSON.stringify(
	// 						search_suggestion.filter(token =>
	// 							token.match(new RegExp(`.*${req.query.keyword}.*`, 'g'))
	// 						)
	// 					)
	// 			  );
	// 	}
	// );
	app.get('/suggestion', (req, res) => {
		data_set.search_suggestion
			? res.send(JSON.stringify(data_set.search_suggestion))
			: res.sendStatus(503);
	});
};
