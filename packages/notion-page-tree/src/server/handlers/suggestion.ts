import { type Router, type Request } from 'express';
export const suggestionServerHandler = (
	app: Router,
	search_suggestion: string[]
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
		!search_suggestion && res.sendStatus(503);
		res.send(JSON.stringify(search_suggestion));
	});
};
