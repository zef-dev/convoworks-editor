import React, { useEffect } from "react";

import "./App.scss";

// json
import * as data from "./json/data.json";

// editors
import {IntentModelEditor} from "./modules/intent_model/intent_model_editor.jsx";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import {EntityComponent as Entity} from "./modules/intent_model/entity_editors/entity_component.jsx";
import {IntentComponent as Intent} from "./modules/intent_model/intent_editors/intent_component.jsx";
import {Navigation as NavigationSide} from "./modules/navigations/nav_side.jsx";
import {NavMain as NavigationTop} from "./modules/navigations/nav_top.jsx";
import { NavProvider } from "./modules/wrappers/nav_wrapper.jsx";

import {setEntities, setIntents} from "./actions/index.jsx"
import { useDispatch } from "react-redux";

function TheApp() {	

  console.log("The data", data);

	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(setEntities(data.default.JSON.entities))
		dispatch(setIntents(data.default.JSON.intents))
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
			<NavProvider>
				<BrowserRouter>
					<NavigationTop />
					<NavigationSide />
					<Switch>
						<Route
							path="/"
							component={() => <IntentModelEditor data={data} />}
						/>
						<Route path="/entities/:id" component={Entity} />
						<Route path="/intents/:id" component={Intent} />
					</Switch>
				</BrowserRouter>
			</NavProvider>
	);
}

export {TheApp};
