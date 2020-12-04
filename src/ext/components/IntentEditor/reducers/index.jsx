import entitiesReducer from './entities.jsx'
import systemEntitiesReducer from './system_entities.jsx'
import intentsReducer from './intents.jsx'
import activeItemReducer from './active_item.jsx'
import currentItemReducer from './current_item.jsx'
import currentIntentReducer from './current_intent.jsx'
import currentUtteranceReducer from './current_utterance.jsx'
import {combineReducers} from 'redux'

const allReducers = combineReducers({
	entitiesReducer: entitiesReducer,
  systemEntitiesReducer: systemEntitiesReducer,
	intentsReducer: intentsReducer,
	activeItemReducer: activeItemReducer,
	currentItemReducer: currentItemReducer,
	currentIntentReducer: currentIntentReducer,
	currentUtteranceReducer: currentUtteranceReducer

})

export default allReducers
