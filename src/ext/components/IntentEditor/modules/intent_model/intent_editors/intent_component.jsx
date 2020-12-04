import React, { useState, useEffect, useContext, useCallback } from 'react';
//import { NavContext } from "../../wrappers/nav_wrapper.jsx";
import { useDispatch, useSelector } from 'react-redux';
import {
	setIntents,
	setCurrentIntentName,
	setCurrentIntentUtterances,
	setActiveItem
} from '../../../actions/index.jsx';
import { List as Utterances } from './list.jsx';
import { set } from 'lodash';

function IntentComponent(props) {
	const dispatch = useDispatch();
	const intents = useSelector((state) => state.intentsReducer);
	const currentIntent = useSelector((state) => state.currentIntentReducer);

	let id = props.id;

	const [ data, setData ] = useState(null)
	const [ valid, setValid ] = useState(false);
	const [ name, setName ] = useState('');
	const [ utterances, setUtterances ] = useState([]);
	const [ stateChange, setStateChange ] = useState(false);
	const [ active, setActive ] = useState(null);
	const [ notification, setNotification ] = useState({});

	// handle validation
	const handleValidate = useCallback(
		() => {
			if (currentIntent.name.length) {
				setValid(true);
			} else {
				setValid(false);
			}
		},
		[ currentIntent ]
	);
	//
	// handle dispatch
	function handleIntentDispatch() {
		if (data) {
			let arr = [ ...intents ];
			// dispatch(setIntents(arr));
			props.backToList(arr, null);
		}
	}

	// add new value to value array
	function addNewValue() {
		let arr = [ ...utterances ];
		let newUtterance = { raw: 'New Value', model: [ { text: ' ' } ] };
		arr = [ newUtterance, ...arr ];
		setUtterances(arr);
		setActive(0);
	}

	const removeFromModel = (utteranceIndex, index) => {
		let arr = [ ...utterances ];
		let model = arr[utteranceIndex].model;
		model[index] = {
			text: model[index].text
		};

		setUtterances(arr);
	};

	// validate on currentIntent change and entity dispatch
	useEffect(
		() => {
			handleValidate();
		},
		[ currentIntent, currentIntent.utterances, intents, handleValidate, props.handleIntentDispatch ]
	);

	// check if data is passed in props
	useEffect(
		() => {
			if (data) {
				setName(data.name);
				setUtterances(data.utterances);
			}
		},
		[ data ]
	);

	useEffect(() => {
		if (props.action === 'new' && !name.length && !utterances.length) {
			console.log('action!');
			let arr = [ ...intents ];
			let newIntent = {
				name: name,
				utterances: utterances,
				type: "custom"
			};

			setData(newIntent);

			arr = [ ...arr, newIntent ];
			dispatch(setIntents(arr));
		} else {
			setData(props.data)
		}
	}, []);

	useEffect(
		() => {
			if (name.length) {
				let arr = [ ...intents ];
				console.log(arr[id], id);
				let i = id;
				if (arr[i]) {
					arr[i].name = name;
					dispatch(setIntents(arr));
				}
			}
		},
		[ name, utterances ]
	);

	if (data) {
		return (
			<section className="layout--editor-content">
				<div>
					{/* Entity name value */}
					<div className="margin--30--large">
						<h3 className="font--18--large margin--10--large">Intent name</h3>
						<div className="item">
							<input
								type="text"
								defaultValue={name ? name : ''}
								placeholder="Intent name"
								className="font--14--large input--item-name"
								onChange={(e) => {
									setName(e.target.value);
								}}
							/>
						</div>
					</div>
					{/* Entity words */}
					<div className="margin--50--large">
						<h3 className="font--18--large margin--10--large">Utterances</h3>
						<div className="margin--24--large">
							<button
								className="item item--padded"
								onClick={(e) => {
									addNewValue(e);
								}}
							>
								<div className="item__inner">New Value</div>
							</button>
							<Utterances
								addNewValue={addNewValue}
								active={active}
								setActive={setActive}
								utterances={utterances}
								setUtterances={setUtterances}
								intentIndex={id}
								removeFromModel={removeFromModel}
							/>
						</div>
					</div>
					<button
						className="btn btn--rounded btn--ghost btn--margin"
						onClick={() => {
							handleIntentDispatch();
						}}
					>
						Back
					</button>
				</div>
				<div
					className={` notification ${notification.show ? 'notification--show' : 'notification--hide'}`}
					onClick={() => setNotification({})}
				>
					{notification.value}
				</div>
			</section>
		);
	} else {
		return null;
	}
}

export { IntentComponent };
