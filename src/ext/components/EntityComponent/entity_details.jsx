import React, { useState, useEffect } from 'react';
import EntityValues from './entity_values.jsx';
import _ from 'lodash';
import { useRef } from 'react';

function EntityDetails(props) {
	const [ entity, setEntity ] = useState(null);
	const [ name, setName ] = useState(null);
	const [ values, setValues ] = useState(null);
	const [ newValue, setNewValue ] = useState(null);
	const valueInput = useRef(null);

	useEffect(
		() => {
			if (!entity) {
				setEntity(props.entity);
			}
		},
		[ props.entity ]
	);

	useEffect(
		() => {
			setName(props.entity.name);
			setValues(props.entity.values);
		},
		[ entity ]
	);

	useEffect(
		() => {
			if (name && values) {
				props.onUpdate({
					name: name,
					values: values
				});
			}
		},
		[ name, values ]
	);

	// add new value to value array
	const addNewValue = () => {
		let val = {
			value: newValue,
			synonyms: []
		};

		let arr = [...values, val];
		setValues(arr);
	};

	const removeValue = (index) => {
		let arr = [ ...values ];
		if (index !== -1) {
			arr.splice(index, 1);
			setValues(arr);
		}
	};

	if (values) {
		return (
			<div className="convo-details">
				<section className="layout--editor-content">
					<section className="entities-editor">
						{/* Entity name value */}
						<div className="margin--30--large">
							<h3 className="margin--10--large">Entity name</h3>
							<form
								onSubmit={(e) => {
									e.preventDefault();
								}}
							>
								<input
									type="text"
									defaultValue={name ? name : ''}
									placeholder="Entity name"
									className="editor-input input--item-name"
									onChange={(e) => {
										setName(e.target.value);
									}}
								/>
							</form>
						</div>
						{/* Entity words */}
						<div className="margin--50--large">
							<h3 className="font--18--large margin--10--large">Values</h3>
							<div className="margin--24--large">
								<EntityValues values={values} setValues={setValues} removeValue={removeValue} />
								<form onSubmit={(e) => {
									e.preventDefault();
									if (newValue) {
										addNewValue();
										setNewValue(null);
										valueInput.current.value = '';
									}
								}}>
									<input
										type="text"
										className="editor-input input--add-field"
										placeholder="Enter reference value"
										onChange={(e) => setNewValue(e.target.value)}
										ref={valueInput}
									/>
								</form>
							</div>
						</div>
					</section>
				</section>
			</div>
		);
	} else {
		return null;
	}
}

export default EntityDetails;
