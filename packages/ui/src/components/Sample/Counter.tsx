import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/sample/store';
import { increase, decrease, reset } from '../../redux/sample/counterSlice';
import { increaseRandomNumber } from '../../redux/sample/counterThunk';

const Counter = () => {
	const counter = useAppSelector(state => state.counter);
	const dispatch = useAppDispatch();

	return (
		<div>
			<button
				disabled={counter.waiting ? true : false}
				onClick={() => dispatch(decrease(1))}
				style={{ backgroundColor: counter.waiting ? '#777' : 'initial' }}
			>
				-1
			</button>

			<span>{counter.waiting ? 'please wait...' : counter.count}</span>

			<button
				disabled={counter.waiting ? true : false}
				onClick={() => dispatch(increase(2))}
				style={{ backgroundColor: counter.waiting ? '#777' : 'initial' }}
			>
				+1
			</button>

			<span>
				you clicked {counter.operations} time
				{counter.operations > 1 ? 's' : ''}
			</span>

			<button
				disabled={counter.waiting ? true : false}
				onClick={() => dispatch(reset())}
				style={{ backgroundColor: counter.waiting ? '#777' : 'initial' }}
			>
				reset (wait 2 sec with middleware)
			</button>

			<button
				disabled={counter.waiting ? true : false}
				style={{ backgroundColor: counter.waiting ? '#777' : 'initial' }}
				// onClick={() =>
				// 	dispatch(increaseRandomNumber_helper({ min: 0, max: 10 }))
				// }
				onClick={() => dispatch(increaseRandomNumber({ min: 0, max: 10 }))}
			>
				increase randomly with thunk
			</button>
		</div>
	);
};

export default Counter;
