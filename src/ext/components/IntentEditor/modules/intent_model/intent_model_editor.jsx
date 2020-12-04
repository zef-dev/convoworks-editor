import React, { useEffect, useContext } from 'react';
//import { Link } from "react-router-dom";
//import { NavContext } from "../wrappers/nav_wrapper.jsx";
import { useSelector, useDispatch } from 'react-redux';
import { IconTrash } from '../../assets/icon_trash.jsx';
import { setIntents, setEntities } from '../../actions/index.jsx';
import { useState } from 'react';
import { IntentComponent as Intent } from './intent_editors/intent_component.jsx';
import { EntityComponent as Entity } from './entity_editors/entity_component.jsx';

/* Entity editor index page */
function IntentModelEditor(props) {
	//
	const dispatch = useDispatch();
	const entities = useSelector((state) => state.entitiesReducer);
	const intents = useSelector((state) => state.intentsReducer);
	const fn_updated = props.ng_callbacks['fn_updated'];
	const fn_alert = props.ng_callbacks['fn_alert'];
	const system_entities = props.system_entities;
	const prop_entities = props.entities;
	const prop_intents = props.intents;

	const [ editorState, setEditorState ] = useState([ 'list' ]);
	const [ editorFirstLoad, setEditorFirstLoad ] = useState(true);

  console.log("INTENT MODEL EDITOR FIRED!!!!!!!!!!!!!!!!!!!!!!!!!", entities, intents);

	const handleItemRemove = (item, index) => {
		console.log('ITEM_REMOVE: ', item, index);
		let arr = item.type ? intents : entities;
		arr.splice(index, 1);

		item.type ? dispatch(setIntents(arr)) : dispatch(setEntities(arr));
		setEditorState([ 'list' ]);
	};

	const handleItemClick = (item, index) => {
		console.log('Item clicked');
		let item_type = item.type ? 'intent' : 'entity';

		setEditorState([ `show`, item_type, index ]);
	};

	const handleNewItemClick = (type) => {
		console.log(`New Item clicked: ${type}`);

		setEditorState([ 'new', type ]);
	};

	const backToList = (updated_intents = null, updated_entities = null) => {
		console.log('IntEntEditor react Back to list click', updated_entities, updated_intents);
		setEditorState([ 'list' ]);
		if (updated_entities == null) updated_entities = entities;
		if (updated_intents == null) updated_intents = intents;
		dispatch(setIntents(updated_intents));
		dispatch(setEntities(updated_entities));
		//fn_updated(updated_entities, updated_intents);
	};

	function areObjectsDifferent(el1, el2) {
		var el1s = JSON.stringify(el1);
		var el2s = JSON.stringify(el2);
		if (el1s === el2s) {
			return false;
		} else {
			return true;
		}
	}

	// Update passed-in prop arrays
	useEffect(
		() => {
      console.log('entities', entities, 'intents', intents);
      if (editorFirstLoad === false) {
        //if (entities.length != prop_entities.length) {
          //prop_entities.splice(0, prop_entities.length, ...entities);
          //console.log('=====================>>', 'Added to entities');
        //} else if (intents.length != prop_intents.length) {
          //prop_intents.splice(0, prop_intents.length, ...intents);
          //console.log('=====================>>', 'Added to intents');
        //} else {
          ////  Manually check both arrays and updated elements that are different
          //intents.forEach(function(intent, index) {
            //var prop_intent = prop_intents[index];
            //if (areObjectsDifferent(intent, prop_intent)) {
              //prop_intents.splice(index, 1, intent);
              //console.log('=====================>>', 'Changed intent');
            //}
          //});
          //entities.forEach(function(entity, index) {
            //var prop_entity = prop_entities[index];
            //if (areObjectsDifferent(entity, prop_entity)) {
              //prop_entities.splice(index, 1, entity);
              //console.log('=====================>>', 'Changed entity');
            //}
          //});
        //}
        //fn_updated(entities, intents);
      }
      setEditorFirstLoad(false);
			console.log('Update entities fired');

			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[ editorState ]
	);

	function makeItems(items) {
		return items.map((item, i) => {
			if (item) {
				return (
					<li className="item" key={i}>
						<a className="link item__inner item--padded" onClick={() => handleItemClick(item, i)}>
							<div className="item__value--primary font--14--large">
								{item.type ? '' : '@'} {item.name}
							</div>
						</a>
						<div className="item__buttons">
							<button className="item__remove" onClick={() => handleItemRemove(item, i)}>
								<IconTrash />
							</button>
						</div>
					</li>
				);
			} else {
				return null;
			}
		});
	}

	function makeIntentsEntitiesList() {
		return (
			<div className="editor">
				{/* <nav className="nav">
				 <div className="nav__current">
              Intents/Entities List
          </div> 
				</nav> */}
				<section className="layout--editor-content">
					{/* <h3 className="font--18--large margin--46--large semibold">
            Intent model
          </h3> */}
					{/* Intents list */}
					<div className="margin--40--large">
						<header className="editor__header margin--24--large">
							<h3 className="no-margin font--18--large color-gray">Intents</h3>
							<button className="btn btn--primary" onClick={() => handleNewItemClick('intent')}>
								Create intent
							</button>
						</header>
						<ul>{intents ? makeItems(intents) : <div className="color-gray--light">Empty</div>}</ul>
					</div>
					<div>
						<header className="editor__header margin--24--large">
							<h3 className="no-margin font--18--large color-gray">Entities</h3>
							<button
								className="btn btn--primary"
								onClick={() => handleNewItemClick('entity')}

								//to={{
								//pathname: `entities/new`,
								//state: { data: [], id: entities.length },
								//}}
							>
								Create entity
							</button>
						</header>
						<ul>{entities ? makeItems(entities) : <div className="color-gray--light">Empty</div>}</ul>
					</div>
				</section>
			</div>
		);
	}

	if (editorState[0] === 'list') {
		return makeIntentsEntitiesList();
	} else if (editorState[0] === 'new') {
		let type = editorState[1];

		return (
			<div className="editor">
				{type === 'intent' ? (
					<Intent
						id={intents.length - 1}
						entities={entities}
						system_entities={system_entities}
						backToList={backToList}
						intents={intents}
						action="new"
					/>
				) : (
					<Entity
						entities={entities}
						backToList={backToList}
						intents={intents}
						action="new"
						id={entities.length}
					/>
				)}
			</div>
		);
	} else if (editorState[0] === 'show') {
		let type = editorState[1];
		let id = editorState[2];
		let data = intents[id];

		return (
			<div className="editor">
				{/* <nav className="nav">
					<div className="nav__current">Show intent</div>
				</nav> */}
				{type === 'intent' ? (
					<Intent
						data={data}
						entities={entities}
						system_entities={system_entities}
						intents={intents}
						action="show"
						id={editorState[2]}
						backToList={backToList}
					/>
				) : (
					<Entity
						entities={entities}
						intents={intents}
						action="show"
						id={editorState[2]}
						backToList={backToList}
					/>
				)}
			</div>
		);
	} else {
		return null;
	}
}

export { IntentModelEditor };
