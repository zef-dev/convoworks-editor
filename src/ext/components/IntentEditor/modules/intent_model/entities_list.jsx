import React from "react";
import { useSelector } from "react-redux";


function EntitiesList(props) {
	const entities = useSelector((state) => state.entitiesReducer);

	const makeEntities = (items) => {
		if (items && items.length > 0) {
			return items.map((item, i) => {
				return <li key={i} onClick={() => props.handleSelectedEntity(item)}>@{item.name}</li>;
			});
		}
	};

	if (props.visible) {
		return <ul className="select__list">{makeEntities(entities)}</ul>;
	} else {
		return null
	}

}

export default EntitiesList;
