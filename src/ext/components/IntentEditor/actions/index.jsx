
/*
 * action creators
 */
export const setEntities = (payload) => {
  return { type: 'SET_ENTITIES', payload }
}

export const setSystemEntities = (payload) => {
  return { type: 'SET_SYSTEM_ENTITIES', payload }
}

export const setIntents = (payload) => {
  return { type: 'SET_INTENTS', payload }
}

export const setActiveItem = (payload) => {
  return { type: 'SET_ACTIVE_ITEM', payload }
}

export const setCurrentItemName = (payload) => {
  return { type: 'SET_CURRENT_ITEM_NAME', payload }
}

export const setCurrentItemValues = (payload) => {
  return { type: 'SET_CURRENT_ITEM_VALUES', payload }
}

export const setCurrentIntentName = (payload) => {
  return { type: 'SET_CURRENT_INTENT_NAME', payload }
}

export const setCurrentIntentUtterances = (payload) => {
  return { type: 'SET_CURRENT_INTENT_UTTERANCES', payload }
}

export const setCurrentUtterance = (payload) => {
  return { type: 'SET_CURRENT_UTTERANCE', payload }
}
