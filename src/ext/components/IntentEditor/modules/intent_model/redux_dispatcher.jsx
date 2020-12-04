import React, { useEffect } from "react";

// editors
import {setEntities, setIntents, setSystemEntities} from "../../actions/index.jsx"
import { useDispatch } from "react-redux";

function ReduxDispatcher(props) {	

  const entities = props.entities;
  const intents = props.intents;
  const system_entities = props.system_entities;

	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(setEntities(entities))
		dispatch(setIntents(intents))
		dispatch(setSystemEntities(system_entities))
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
    <div>
      {props.children}
    </div>
	);
}

export {ReduxDispatcher};
