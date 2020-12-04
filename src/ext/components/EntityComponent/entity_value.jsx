import React, { useState, useRef, useEffect } from 'react';
import { IconTrash } from '../../assets/icon_trash.jsx';

const EntityValue = (props) => {
	const [ value, setValue ] = useState(props.item.value);
	const [ synonyms, setSynonyms ] = useState(props.item.synonyms);
	const [ newSynonym, setNewSynonym ] = useState('');
	const [ remove, setRemove ] = useState(false);
	const synonymInput = useRef(null);

	useEffect(
		() => {
			props.handleUpdate([ ...props.values ], props.index, {
				value: value,
				synonyms: synonyms
			});
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

	const makeSynonyms = (items, active) => {
		if (items) {
			return (
				items &&
				items.map((item, i) => {
					if (item && !active) {
						return (
							<div className="synonym" key={i}>
								{item}
							</div>
						);
					} else {
						return (
							<div key={i} className="synonym">
								{item}
								<button
									type="button"
									className="synonym__remove"
									onClick={() => {
										removeSynonym(item);
									}}
								>
									&#10005;
								</button>
							</div>
						);
					}
				})
			);
		}
	};

	const handleRemove = (e) => {
		e.stopPropagation();
		setRemove(true);
		setTimeout(() => {
			props.removeValue(props.index);
			setRemove(false);
		}, 220);
	};

	if (props.activeValue !== props.index) {
		return (
			<li
				className={`item item--entity ${remove ? 'item--remove' : ''}`}
				onClick={() => {
					props.setActiveValue(props.index);
				}}
			>
				<div className="item__inner">
					<div className="grid">
						<div className="cell cell--3--small">
							<div className="item__value item__value--primary">{value}</div>
						</div>
						<div className="cell cell--9--small">
							<div className="item__values">{makeSynonyms(synonyms, false)}</div>
						</div>
					</div>
				</div>
				<div className="item__buttons">
					<button
						className="btn--remove btn--remove--main"
						type="button"
						onClick={(e) => {
							handleRemove(e);
						}}
					>
						<IconTrash />
					</button>
				</div>
			</li>
		);
	} else {
		return (
			<li className={`item item--entity item--active ${remove ? 'item--remove' : ''}`}>
				<div className="item__inner">
					<div className="grid">
						<div className="cell cell--3--small">
							<div className="item__value item__value--primary">
								<input
									data-input="true"
									className="editor-input"
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
								{makeSynonyms(synonyms, true)}
								<form
									onSubmit={(e) => {
										e.preventDefault();
										handleNewSynonym(synonymInput);
									}}
								>
									<input
										className="editor-input"
										type="text"
										style={{ marginLeft: '0.625rem' }}
										ref={synonymInput}
										placeholder="Enter synonym"
										onChange={(e) => {}}
									/>
									<input className="editor-input" type="submit" hidden={true} />
								</form>
							</div>
						</div>
					</div>
				</div>
				<div className="item__buttons">
					<button
						className="btn--remove btn--remove--main"
						type="button"
						onClick={(e) => {
							handleRemove(e);
						}}
					>
						<IconTrash />
					</button>
				</div>
			</li>
		);
	}
};

export default EntityValue;
