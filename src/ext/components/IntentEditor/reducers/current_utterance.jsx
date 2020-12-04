const currentUtteranceReducer = (state = [],  {type, payload}) => {
	switch (type) {
		case "SET_CURRENT_UTTERANCE":
			return state = {
				...state,
				payload
			};
		default:
			return state;
	}
};

export default currentUtteranceReducer