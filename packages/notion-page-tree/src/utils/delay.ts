export default async (milliseconds: number) =>
	setTimeout(() => {
		new Promise(resolve => {
			resolve(true);
		});
	}, milliseconds);
