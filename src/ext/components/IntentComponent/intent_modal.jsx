import React, { useState, useEffect, useRef } from 'react';
import useOnclickOutside from 'react-cool-onclickoutside';
import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

function Modal(props) {
	const [ entities, setEntities ] = useState(props.entities);
	const [ allEntities, setAllEntities ] = useState(props.entities);
	const [ entitiesNames, setEntitiesNames ] = useState([]);
	const input = useRef();

	const modalRef = useOnclickOutside(() => {
		props.setModal(false);
		props.setSelection(null);
	});

	const filterEntities = (term) => {
		let arr = [ ...allEntities ];
		let filteredArr = arr.filter(
			(item) => item.name && item.name.toLowerCase().includes(term.trim().toLowerCase())
		);

		setEntities(filteredArr);
	};

	useEffect(
		() => {
			let arr = entities
				.map((item) => {
					return item.name;
				})
				.filter((item) => item);
			//console.log(arr)
			setEntitiesNames(arr);
		},
		[ entities ]
	);

	const makeEntities = (items) => {
		const handleDefaultParam = (param) => {
			if (param.includes('.')) {
				return param.split('.').pop();
			} else {
				return param.split('@').pop();
			}
		};
		if (items) {
			return items.map((item, i) => {
				return (
					<button
						key={i}
						onClick={(e) => {
							e.preventDefault();

							let type = '@' + item.name;
							let slotValue = item.name;

							const getParamValues = () => {
								let found = props.paramValues.find(obj => obj.type === type);
								if (found) {
									return found.slot_value
								} else {
									return handleDefaultParam(slotValue)
								}
							}

							props.setModal(false);
							props.selection.item.setAttribute('data-type', type);
							props.selection.item.setAttribute('data-slot-value', getParamValues());
							props.mapNodesToModel(
								document.querySelector('.item--active [contenteditable="true"]').childNodes,
								props.active
							);
							props.setSelection(null);
							props.setStateChange(!props.stateChange);
						}}
					>
						<span role="img">@{item.name}</span>
					</button>
				);
			});
		}
	};

	if (entities) {
		return (
			<div id="dropdown-modal" className={`dropdown ${props.modal && 'dropdown--active'}`} ref={modalRef}>
				<div className="dropdown__search-wrap">
					<TextInput
						Component="input"
						trigger=""
						options={entitiesNames}
						spaceRemovers={[]}
						matchAny={true}
						onChange={(e) => {
							filterEntities(e);
						}}
						ref={input}
						className="dropdown__search editor-input"
						placeholder="Filter entities"
					/>
				</div>
				<div className="dropdown__inner">{entities && makeEntities(entities)}</div>
			</div>
		);
	} else {
		return null;
	}
}

export { Modal };
