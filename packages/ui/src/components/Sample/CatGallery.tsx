import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/sample/store';
import { fetchRequested } from '../../redux/sample/catSlice';

const Sagas = () => {
	const dispatch = useAppDispatch();
	const cat = useAppSelector(store => store.cat);
	return (
		<>
			<button
				onClick={() =>
					dispatch({
						type: fetchRequested.type,
						payload: 10
					})
				}
			>
				fetchCat
			</button>
			{cat.fetchStatus === 'fetching' && <span>fetching new cats</span>}
			<div id='catImages'>
				{cat.fetchStatus === 'succeed' && (
					<>
						{cat.cats.map((cat, idx) => (
							<img width={'100px'} key={idx} src={cat.url} />
						))}
					</>
				)}
			</div>
		</>
	);
};
export default Sagas;
