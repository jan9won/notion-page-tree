import React from 'react';
import logoRound120 from './assets/logo/round-120.png';
import logoSquareBig from './assets/logo/square-big.png';

const App = () => {
	return (
		<div>
			React App
			<img src={logoRound120} alt='logo' />
			<img src={logoSquareBig} alt='logo' />
		</div>
	);
};

export default App;
