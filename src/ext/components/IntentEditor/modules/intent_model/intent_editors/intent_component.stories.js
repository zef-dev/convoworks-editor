import React, { useEffect } from "react";
//
import * as data from "../../../json/data.json";

import {IntentComponent as Intent} from './intent_component.jsx'
import {MainProvider} from '../../store/index.jsx'

import {Navigation as NavigationSide} from "../../navigations/nav_side.jsx";
import {NavMain as NavigationTop} from "../../navigations/nav_top.jsx";
import { NavProvider } from "../../wrappers/nav_wrapper.jsx";

import { withKnobs, text } from '@storybook/addon-knobs'
import { useDispatch } from "react-redux";



export default { title: 'IntentComponent', decorators: [withKnobs]}

export const intent_component = () => {

  /**
   * Cannot dispatch entities and intents because the component which
   * does that (this story) has to be wrapped inside the Provider. But
   * this story is the one that supplies the provider to the mounted
   * Intent component. 
   *
   * This same code is used within the App.js to add entities and intents
   * to the store. */
	//const dispatch = useDispatch()
	//useEffect(() => {
		//dispatch(addEntities(data.default.JSON.entities))
		//dispatch(addIntents(data.default.JSON.intents))
	//// eslint-disable-next-line react-hooks/exhaustive-deps
	//}, [])

  const intent = data.default.JSON.intents[0];
  console.log("Passed in intent", intent);

  return(
    <MainProvider>
      <NavProvider>
      <Intent 
        intent_object={intent}
      />
      </NavProvider>
    </MainProvider>
  );
      
}

