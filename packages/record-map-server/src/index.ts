import { NotionAPI } from 'notion-client';
import { ExtendedRecordMap } from 'notion-types';

const cache: Record<string, ExtendedRecordMap> = {};
const notion = new NotionAPI();

import express from 'express';
const app = express();
app.listen(9001, () => process.stdout.write(`${9001}`));

app.get<{ id: string }>('/recordmap/:id', async (req, res) => {
	const id = req.params.id;
	try {
		!cache[id] && (cache[id] = await notion.getPage(id));
		res.send(cache[id]);
	} catch (e) {
		res.sendStatus(404);
	}
});
