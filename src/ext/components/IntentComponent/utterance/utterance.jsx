import React from 'react';
import { IconTrash } from '../../../assets/icon_trash.jsx';
import Input from './input.jsx';
import { PureComponent } from 'react';

class Utterance extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			remove: false
		};
		this.ref = React.createRef('');
		this.removeBtn = React.createRef('');
	}

	render() {
		let data = this.props.data;
		return (
			<li
				ref={this.ref}
				key={data.index}
				className={`item item--intent ${data.active ? 'item--active' : ''} ${this.state.remove
					? 'item--remove'
					: ''}`}
				onClick={() => {
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
						setSelection={data.setSelection}
						selection={data.selection}
						mapNodesToModel={data.mapNodesToModel}
						active={data.active}
						addNewValue={data.addNewValue}
						stateChange={data.stateChange}
						focusOnExpressionInput={data.focusOnExpressionInput}
					/>
					<div className="item__buttons">
						<button
							className="btn--remove btn--remove--main"
							type="button"
							ref={this.removeBtn}
							onClick={(e) => {
								e.stopPropagation();
								this.setState({ remove: true });
								setTimeout(() => {
									data.removeFromUtterances(data.index);
									this.setState({ remove: false });
								}, 220);
							}}
						>
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
								let slotValue = item.slot_value;
								let type = item.type;
								return (
									<li key={i}>
										<input
											className="editor-input"
											type="text"
											defaultValue={slotValue}
											onChange={(e) => {
												let arr = [ ...data.utterances ];
												arr[data.index].model[i].slot_value = e.target.value;
												data.setUtterances(arr);
											}}
											placeholder="Set parameter name"
										/>
										<div>
											<span className="highlight" style={{ background: item.color }}>
												{type}
											</span>
										</div>
										<div>{item.text}</div>
										<div className="item__buttons">
											<button
												className="btn--remove"
												onClick={(e) => {
													e.preventDefault(e);
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
