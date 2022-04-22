import React from 'react';
import Counter from '../../components/Sample/Counter';
import Images from '../../components/Sample/Images';
import Sagas from './CatGallery';

const Samples = () => {
	return (
		<div>
			<Sagas></Sagas>
			<Counter></Counter>
			<Images></Images>
		</div>
	);
};

export default Samples;
