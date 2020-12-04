import React, { useState, useEffect, useRef } from 'react';
import useOnclickOutside from 'react-cool-onclickoutside';
import { useSelector, useStore } from 'react-redux';
import { getColor } from '../../../helpers/common_constants.jsx';

function Modal(props) {
	const entitiesReducer = useSelector((state) => state.entitiesReducer);
	const systemEntitiesReducer = useSelector((state) => state.systemEntitiesReducer);
	const [ allEntities, setAllEntities ] = useState([ ...entitiesReducer, ...systemEntitiesReducer ]);

	console.log('System entities logged', allEntities);

	const modalRef = useOnclickOutside(() => {
		props.setModal(false);
		props.setSelection(null);
	});

	const filterEntities = (term) => {
		let arr = [ ...entitiesReducer, ...systemEntitiesReducer ];
		console.log(arr);
		let filteredArr = arr.filter((item) => item.name.toLowerCase().includes(term.trim().toLowerCase()));
		setAllEntities(filteredArr);
	};

	const makeEntities = (items) => {
		return items.map((item, i) => {
			return (
				<button
					key={i}
					onClick={() => {
						let arr = props.utterances[props.selection.index].model;
						let obj = arr.find((item) => item.text === props.selection.item.textContent.trim());
						let index = arr.indexOf(obj);

						props.setModal(false);
						props.selection.item.setAttribute('data-type', `@${item.name}`);
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
	};

	return (
		<div id="dropdown-modal" className={`dropdown ${props.modal && 'dropdown--active'}`} ref={modalRef}>
			<input
				type="text"
				className="dropdown__search"
				placeholder="Filter entities"
				onChange={(e) => {
					filterEntities(e.target.value);
				}}
			/>
			<div className="dropdown__inner">{allEntities && makeEntities(allEntities)}</div>
			<div
				className="dropdown__close"
				onClick={() => {
					props.setModal(false);
					props.setSelection(null);
				}}
			>
				<span role="img" aria-label="Close icon">
					&#x274C;
				</span>
			</div>
		</div>
	);
}

export { Modal };
