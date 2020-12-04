const initialState = {
	name: "",
	utterances: [],
	type: "custom"
};

const currentIntentReducer = (state = initialState,  {type, payload}) => {
	switch (type) {
		case "SET_CURRENT_INTENT_NAME":
			return state = {
				...state,
				name: payload
			};
		case "SET_CURRENT_INTENT_UTTERANCES":
			return state = {
				...state,
				utterances: payload,
			};
		default:
			return state;
	}
};

export default currentIntentReducer