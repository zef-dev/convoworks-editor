import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIntents } from '../../../actions/index.jsx';
import { getColor } from '../../../helpers/common_constants.jsx';
import { Modal } from './modal.jsx';
import { IconTrash } from '../../../assets/icon_trash.jsx';
import Utterance from './utterance/utterance.jsx';

const List = React.memo(function List(props) {  
	const dispatch = useDispatch();
	const [ modal, setModal ] = useState(false);
	const [ modalPosition, setModalPosition ] = useState(null);
	const [ selection, setSelection ] = useState(null);
	const [ update, setUpdate ] = useState(false);
	const [ stateChange, setStateChange ] = useState(false);
	const intents = useSelector((state) => state.intentsReducer);

	useEffect(
		() => {
			//console.log('update utterances', props.utterances[props.intentIndex])
			if (props.utterances.length) {
				if (props.intentIndex) {
					let arr = [ ...intents ];

					if (arr[props.intentIndex]) {
						arr[props.intentIndex].utterances = props.utterances;
						dispatch(setIntents(arr));
					}
				}
			}
		},
		[ props.utterances ]
	);

	const handleActive = (index) => {
		props.setActive(index);
	};

	const mapNodesToModel = (items, index) => {
		let arr = Array.from(items).filter((item) => item.textContent.trim().length);

		let i = 0;
		arr = arr.map((item, index) => {
			if (item.tagName === 'SPAN' || (item.nodeName === '#text' && item.textContent.trim().length)) {
				let type = item.dataset && item.dataset.type && item.dataset.type.length ? item.dataset.type : null;
				if (type) {
					i++;
					return {
						text: item.textContent.trim(),
						type: type,
						slot_value: item.dataset.slot_value
					};
				} else {
					return { text: item.textContent.trim() };
				}
			} else {
				return null;
			}
		});

		arr = arr.filter((item) => item);

		let values = [ ...props.utterances ];
		values[index] = { raw: arr.map((item) => item.text).join(' '), model: arr };
		props.setUtterances(values);
	};

	const makeItems = (items) => {

		return items.map((item, index) => {

			let model = item.model.map((val, index) => {
				return {...val, color: getColor(val.text.length)}
			});
			
			let data = {
				index: index,
				active: index === props.active,
				model: model,
				utterances: props.utterances,
				setUtterances: props.setUtterances,
				handleActive: handleActive,
				modal: modal,
				setModal: setModal,
				setModalPosition: setModalPosition,
				selection: selection,
				setSelection: setSelection,
				addNewValue: props.addNewValue,
				stateChange: stateChange,
				setStateChange: setStateChange,
				removeFromUtterances: removeFromUtterances,
				removeFromModel: props.removeFromModel,
				mapNodesToModel: mapNodesToModel
			}

			return (
				<Utterance 
					key={index}
					data={data}
				/>
			);
		});
	};

	const removeFromUtterances = (index) => {
		let arr = [ ...props.utterances ];
		if (index !== -1) {
			arr.splice(index, 1);
			console.log('new arr after delete', arr);
			props.setUtterances(arr);
			props.setActive(null);
		}
	};

	if (props.utterances) {
		return (
			<React.Fragment>
				<ul>{makeItems(props.utterances)}</ul>
				<Modal
					setModal={setModal}
					modal={modal}
					modalPosition={modalPosition}
					selection={selection}
					setSelection={setSelection}
					active={props.active}
					utterances={props.utterances}
					setUtterances={props.setUtterances}
					setUpdate={setUpdate}
					update={update}
					mapNodesToModel={mapNodesToModel}
					stateChange={stateChange}
					setStateChange={setStateChange}
				/>
			</React.Fragment>
		);
	} else {
		return null;
	}
})

export { List };
