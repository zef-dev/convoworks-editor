import React, { useState, useEffect } from 'react';
import { List as Utterances } from './intent_utterances.jsx';
import _ from 'lodash';
import '../../App.scss';
import { useRef } from 'react';

function IntentDetails(props) {
	const [ intent, setIntent ] = useState(props.intent);
	const entities = props.entities;
	const systemEntities = props.systemEntities;

	const [ name, setName ] = useState('');
	const [ utterances, setUtterances ] = useState([]);
	const [ active, setActive ] = useState(null);
	const [ newExpression, setNewExpression ] = useState(null);

	const newExpressionInput = useRef(null);

	const focusOnExpressionInput = () => {
		newExpressionInput.current.focus();
		newExpressionInput.current.value = '';
		setActive(null);
	};

	// add new value to value array
	function addNewValue() {
		let arr = [ ...utterances ];
		let newUtterance = {
			raw: newExpression ? newExpression : '',
			model: [ { text: newExpression ? newExpression : '' } ]
		};
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

	// check if data is passed in props
	useEffect(
		() => {
			if (intent) {
				setName(intent.name);
				setUtterances(intent.utterances);
			}
		},
		[ intent ]
	);

	useEffect(
		() => {
			if (name && utterances) {
				props.onUpdate({
					...intent,
					name: name,
					utterances: utterances
				});
			}
		},
		[ name, utterances ]
	);

	if (intent) {
		return (
			<div className="convo-details">
				<section className="layout--editor-content">
					<div>
						{/* Entity name value */}
						<div className="margin--30--large">
							<h3 className="margin--10--large">Intent name</h3>
							<form
								onSubmit={(e) => {
									e.preventDefault();
								}}
							>
								<input
									type="text"
									defaultValue={name ? name : ''}
									placeholder="Intent name"
									className="edtiro-input input--item-name"
									onChange={(e) => {
										setName(e.target.value);
									}}
								/>
							</form>
						</div>
						{/* Entity words */}
						<div className="margin--50--large">
							<h3 className="margin--10--large">Utterances</h3>
							<div className="margin--24--large">
								<form
									onSubmit={(e) => {
										e.preventDefault();
										if (newExpression) {
											addNewValue();
											setNewExpression(null);
											newExpressionInput.current.value = '';
										}
									}}
								>
									<input
										type="text"
										className="editor-input input--add-field"
										placeholder="Enter reference value"
										onChange={(e) => setNewExpression(e.target.value)}
										ref={newExpressionInput}
										onFocus={() => {
											setActive(null);
										}}
									/>
								</form>
								<Utterances
									addNewValue={addNewValue}
									active={active}
									setActive={setActive}
									utterances={utterances}
									setUtterances={setUtterances}
									removeFromModel={removeFromModel}
									entities={[ entities, ...systemEntities ]}
									focusOnExpressionInput={focusOnExpressionInput}
								/>
							</div>
						</div>
					</div>
				</section>
			</div>
		);
	} else {
		return null;
	}
}

export default IntentDetails;
