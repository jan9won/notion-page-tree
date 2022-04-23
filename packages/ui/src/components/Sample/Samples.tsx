import React from 'react';
import Counter from '../../components/Sample/Counter';
import Images from '../../components/Sample/Images';
import CatGallery from './CatGallery';

const Samples = () => {
	return (
		<div>
			<CatGallery></CatGallery>
			<Counter></Counter>
			<Images></Images>
		</div>
	);
};

export default Samples;
