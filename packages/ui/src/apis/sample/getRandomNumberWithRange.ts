export const getRandomNumberWithRange = (min: number, max: number) =>
	fetch(
		`https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`
	)
		.then(response => response.text())
		.then(text => parseInt(text));
