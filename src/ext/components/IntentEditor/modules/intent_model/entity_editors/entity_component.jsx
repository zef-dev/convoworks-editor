import React, { useState, useEffect, useContext, useCallback } from 'react';
//import { NavContext } from "../../wrappers/nav_wrapper.jsx";
import { useDispatch, useSelector } from 'react-redux';
import {
	setEntities,
	setCurrentItemName,
	//setCurrentIntentName,
	setCurrentItemValues
} from '../../../actions/index.jsx';
import Values from './values.jsx';

function EntityComponent(props) {
	const dispatch = useDispatch();
	const entities = useSelector((state) => state.entitiesReducer);

	const currentItem = useSelector((state) => state.currentItemReducer);

	//const data = entities.find((item) => item.name === props.match.params.id);
	let index = props.id;
	const data = entities[index];

	const [ valid, setValid ] = useState(false);
	const [ stateChange, setStateChange ] = useState(false);

	const [ name, setName ] = useState('');
	const [ values, setValues ] = useState([]);

	const [ notification, setNotification ] = useState({});

	// nav stuff
	//const navContext = useContext(NavContext);

	// clear current entity on initial load
	useEffect(() => {
		//dispatch(setCurrentIntentName(""));
		dispatch(setCurrentItemName(''));
		dispatch(setCurrentItemValues([]));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const dispatchName = useCallback(
		() => {
			dispatch(setCurrentItemName(name));
		},
		[ name, dispatch ]
	);

	// handle validation
	const handleValidate = useCallback(
		() => {
			if (currentItem.name.length) {
				setValid(true);
			} else {
				setValid(false);
			}
		},
		[ currentItem ]
	);

	// show notification
	const showNotification = useCallback((data) => {
		setNotification({
			value: `Entity @${data} has been saved.`,
			show: true
		});
	}, []);

	// handle dispatch
	const handleEntityDispatch = useCallback(
		() => {
			let arr = entities;
			arr[index] = currentItem;

			dispatch(setEntities(arr));

			showNotification(name);
		},
		[ currentItem, dispatch, entities, index, showNotification, name ]
	);

	// add new value to value array
	const addNewValue = () => {
		let newValue = {
			value: '',
			synonyms: []
		};

		dispatch(setActiveItem(0));
		setValues([ newValue, ...values ]);
		setStateChange(!stateChange);
	};

	// on notification show
	useEffect(
		() => {
			if (notification.show) {
				setTimeout(() => {
					setNotification({});
				}, 5000);
			}
		},
		[ notification ]
	);

	// on dispatch
	useEffect(
		() => {
			dispatchName();
		},
		[ dispatchName ]
	);

	// validate on currentItem change and entity dispatch
	useEffect(
		() => {
			handleValidate();
		},
		[ currentItem, currentItem.values, entities, handleValidate, handleEntityDispatch ]
	);

	// check if data is passed in props
	useEffect(
		() => {
			if (data) {
				setName(data.name);
				setValues(data.values);
			}
		},
		[ data ]
	);

	//// set nav context on name change
	//useEffect(() => {
	//navContext.setCurrentPage({
	//name: `${name.length > 0 ? name : "New Entity"}`,
	//to: "/intent_model",
	//});
	//// eslint-disable-next-line react-hooks/exhaustive-deps
	//}, [name]);

	return (
		<section className="layout--editor-content">
			<section className="entities-editor">
				{/* Entity name value */}
				<div className="margin--30--large">
					<h3 className="font--18--large margin--10--large">Entity name</h3>
					<div className="item">
						<input
							type="text"
							defaultValue={name ? name : ''}
							placeholder="Entity name"
							className="font--14--large input--item-name"
							onChange={(e) => {
								setName(e.target.value);
							}}
						/>
					</div>
				</div>
				{/* Entity words */}
				<div className="margin--50--large">
					<h3 className="font--18--large margin--10--large">Values</h3>
					<div className="margin--24--large">
						<button
							className="btn margin--10--large"
							onClick={() => {
								addNewValue();
							}}
						>
							<div className="">New Value</div>
						</button>
						<Values values={values} />
					</div>
				</div>
				<button
					className="btn btn--rounded btn--ghost btn--margin"
					onClick={() => {
						props.backToList();
					}}
				>
					Cancel
				</button>
				<button
					className={`btn ${valid ? 'btn--primary' : 'btn--disabled'} btn--rounded`}
					onClick={() => {
						valid && handleEntityDispatch();
					}}
				>
					Save
				</button>
			</section>
			<div
				className={` notification ${notification.show ? 'notification--show' : 'notification--hide'}`}
				onClick={() => setNotification({})}
			>
				{notification.value}
			</div>
		</section>
	);
}

export { EntityComponent };
