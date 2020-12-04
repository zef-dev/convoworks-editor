import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconTrash } from '../../../assets/icon_trash.jsx';
import { setActiveItem } from '../../../actions/index.jsx';

const Item = (props) => {
	const dispatch = useDispatch();
	const [ stateChange, setStateChange ] = useState(false);
	const [ value, setValue ] = useState('');
	const [ synonyms, setSynonyms ] = useState([]);
	const [ newSynonym, setNewSynonym ] = useState('');
	const currentItem = useSelector((state) => state.currentItemReducer);
	const synonymInput = useRef(null);

	useEffect(() => {
		if (props.data) {
			setValue(props.data.value);
			setSynonyms(props.data.synonyms);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(
		() => {
			props.handleUpdate([ ...currentItem.values ], props.index, {
				value: value,
				synonyms: synonyms
			});
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[ value, synonyms ]
	);

	useEffect(
		() => {
			if (newSynonym) {
				if (synonyms) {
					setSynonyms([ ...synonyms, newSynonym ]);
				} else {
					setSynonyms(newSynonym);
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[ newSynonym ]
	);

	const handleNewSynonym = (target) => {
		if (target.current.value.length > 0) {
			setNewSynonym(target.current.value);
			target.current.value = '';
		} else {
			setNewSynonym('');
		}
	};

	// synonyms
	const removeSynonym = (value) => {
		let arr = [ ...synonyms ];
		let index = arr.indexOf(value);

		if (index !== -1) {
			arr.splice(index, 1);
			setSynonyms(arr);
		}
	};

	const makeSynonyms = (items) => {
		if (items) {
			return (
				items &&
				items.map((item, i) => {
					if (!props.edit && item) {
						return <div key={i}>{item}</div>;
					} else {
						return (
							<div key={i} className="item__value item__value--secondary">
								<div
									className="item__remove-val"
									onClick={() => {
										removeSynonym(item);
										setStateChange(!stateChange);
									}}
								>
									&#10005;
								</div>
								{item}
							</div>
						);
					}
				})
			);
		}
	};

	if (!props.edit) {
		return (
			<li className="item">
				<div
					className="item__padded-wrapper"
					onClick={() => {
						dispatch(setActiveItem(props.index));
					}}
				>
					<div className="item__inner">
						<div className="grid">
							<div className="cell cell--3--small">
								<div className="item__value item__value--primary">{value}</div>
							</div>
							<div className="cell cell--9--small">
								<div className="item__values">{makeSynonyms(synonyms)}</div>
							</div>
						</div>
					</div>
				</div>
				<div className="item__buttons">
					<button
						onClick={() => {
							props.removeItem(props.index);
							console.log(props.values);
						}}
					>
						<IconTrash />
					</button>
				</div>
			</li>
		);
	} else {
		return (
			<li className="item item--edit">
				<div className="item__padded-wrapper">
					<div className="item__inner">
						<div className="grid">
							<div className="cell cell--3--small">
								<div className="item__value item__value--primary">
									<input
										type="text"
										defaultValue={value}
										placeholder="Enter value"
										onChange={(e) => {
											setValue(e.target.value);
										}}
									/>
								</div>
							</div>
							<div className="cell cell--9--small">
								<div className="item__values">
									{makeSynonyms(synonyms)}
									<form
										onSubmit={(e) => {
											e.preventDefault();
											handleNewSynonym(synonymInput);
										}}
									>
										<input
											type="text"
											ref={synonymInput}
											placeholder="Enter synonym"
											onChange={(e) => {}}
										/>
										<input type="submit" hidden={true} />
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</li>
		);
	}
};

export { Item };
