import React, {useRef} from 'react';
import { IconTrash } from '../../../../assets/icon_trash.jsx';
import Input from './input.jsx';
import { PureComponent } from 'react';
import { Component } from 'react';

class Utterance extends PureComponent {

	constructor(props) {
		super(props);
		this.ref = React.createRef('');
	}


	render() {
		let data = this.props.data;

		return (
			<li
				ref={this.ref}
				key={data.index}
				className={`item item--intent ${data.active ? 'item--active' : ''}`}
				onClick={(e) => {
					data.handleActive(data.index);
				}}
			>
				<div className="item__main">
					<Input
						model={data.model}
						index={data.index}
						utterances={data.utterances}
						setUtterances={data.setUtterances}
						modal={data.modal}
						setModal={data.setModal}
						setModalPosition={data.setModalPosition}
						setSelection={data.setSelection}
						selection={data.selection}
						mapNodesToModel={data.mapNodesToModel}
						active={data.active}
						addNewValue={data.addNewValue}
						stateChange={data.stateChange}
					/>
					<div className="item__buttons">
						<button className="item__remove" onClick={() => data.removeFromUtterances(data.index)}>
							<IconTrash />
						</button>
					</div>
				</div>
				{data.model && data.active && data.model.filter((item) => item.type).length ? (
					<ul className="model">
						<header>
							<div>Parameter Name</div>
							<div>Entity</div>
							<div>Resolved Value</div>
						</header>
						{data.model.map((item, i) => {
							if (item.type) {
								return (
									<li key={i}>
										<input
											type="text"
											defaultValue={item.slot_value && item.slot_value.length ? item.slot_value : ''}
											onChange={(e) => {
												let arr = [ ...data.utterances ];
												arr[data.index].model[i].slot_value = e.target.value;
												data.setUtterances(arr);
											}}
											placeholder="Set parameter name"
										/>
										<div>
											<span className="highlight" style={{ background: item.color }}>
												{item.type}
											</span>
										</div>
										<div>{item.text}</div>
										<div className="item__buttons">
											<button
												className="item__remove"
												onClick={() => {
													data.removeFromModel(data.index, i);
													data.setStateChange(!data.stateChange);
												}}
											>
												<IconTrash />
											</button>
										</div>
									</li>
								);
							}
						})}
					</ul>
				) : (
					<React.Fragment />
				)}
			</li>
		);
	}
}

export default Utterance;
