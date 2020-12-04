import React from 'react';
import ContentEditable from 'react-contenteditable';
import reactHtmlParser from 'react-html-parser';

class Input extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			model: this.props.model
		};

		this.text = React.createRef('');
		this.handleSelection = this.handleSelection.bind(this);
		this.handleModal = this.handleModal.bind(this);
	}

	shouldComponentUpdate(nextProps) {
		if (
			nextProps.utterances.length !== this.props.utterances.length ||
			this.props.stateChange !== nextProps.stateChange ||
			nextProps.active !== this.props.active
		) {
			return true;
		} else {
			return this.props.model.length === 0;
		}
	}

	componentDidUpdate(prevProps) {
		console.log(this.props.active, prevProps.active)
		if ((this.props.active !== prevProps.active) || this.props.active && !this.text.current.length) {
			this.text.current && this.text.current.focus();
		}
	}

	handleModal(selection, e) {
		document.querySelector('#dropdown-modal').style.left = `${e.clientX + 24}px`;
		document.querySelector('#dropdown-modal').style.top = `${e.clientY + 24}px`;
		this.props.setModal(true);
		this.props.setSelection({ item: selection, index: this.props.index });
	}

	handleSelection(e) {
		function unwrap(node) {
			node.replaceWith(...node.childNodes);
		}

		let selection = window.getSelection().getRangeAt(0);
		if (selection.toString()) {
			let textNode = document.createTextNode(selection.toString());
			let selectedText = selection.extractContents();
			let span = document.createElement('span');
			let nested = span.querySelectorAll('*');

			span.appendChild(textNode);
			span.setAttribute('class', 'highlight');
			span.textContent = span.textContent.trim();
			selection.insertNode(span);

			/* nested.forEach((item) => {
				unwrap(item);
			}); */

			if (span.parentNode.tagName === 'SPAN') {
				span.parentNode.outerHTML = span.parentNode.innerHTML;
			}

			this.handleModal(span, e);
		}
	}

	render() {
		if (this.props.model) {
			let mappedModel = this.props.model.filter((item) => item.text.trim().length);

			mappedModel = this.props.model.map((item, index) => {
				if (item.type) {
					return `<span data-token="true" data-slot_value="${item.slot_value ? item.slot_value : ''}" style="background:${item.color}" data-type="${item.type}" class="highlight">${item.text.trim()}</span>`;
				} else {
					return item.text;
				}
			});

			const disableNewlines = (evt) => {
				const keyCode = evt.keyCode || evt.which;

				if (keyCode === 13) {
					evt.returnValue = false;
					if (evt.preventDefault) evt.preventDefault();
					this.props.addNewValue();
				}
			};

			if (this.props.active) {
				return (
					<React.Fragment>
						<div className="item__input">
							<ContentEditable
								innerRef={this.text}
								html={`${mappedModel.join(' ')} `}
								onClick={(e) => {
									if (e.target.getAttribute('data-token')) {
										this.handleModal(e.target, e);
									}
								}}
								onKeyPress={(e) => {
									disableNewlines(e);
								}}
								onMouseUp={(e) => {
									this.handleSelection(e);
								}}
								onChange={(e) => {
									let nodes = e.currentTarget.childNodes;
									nodes = nodes.forEach((item) => {
										if (!item.textContent.trim().length && item.tagName === 'SPAN') {
											item.remove();
										}
									});
									this.props.mapNodesToModel(e.currentTarget.childNodes, this.props.index);
								}}
							/>
						</div>
					</React.Fragment>
				);
			} else {
				return (
					<div className="item__input item__input--readonly">
						<div style={{opacity: mappedModel.join(' ').trim().length ? '1' : '0.5'}}>
							{mappedModel.join(' ').trim().length ? (
								reactHtmlParser(mappedModel.join(' '))
							) : (
								'Input text'
							)}
						</div>
					</div>
				);
			}
		} else {
			return <div />;
		}
	}
}

export default Input;
