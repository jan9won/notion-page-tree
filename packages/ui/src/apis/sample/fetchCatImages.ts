import { catType } from '../../redux/sample/catSlice';

const fetchCatImages = async (catCount: number): Promise<catType[] | Error> => {
	const response = await fetch(
		`https://api.thecatapi.com/v1/images/search?limit=${catCount}&page=1&format=json`
	);
	const json = (await response.json()) as catType[];
	const cats = json.map(cat => ({
		breeds: cat.breeds,
		categories: cat.categories,
		id: cat.id,
		url: cat.url
	}));
	console.log(json, response.status);
	return response.status === 200 ? cats : new Error(response.status.toString());
};

export { fetchCatImages };
