
const intentsReducer = (state = [], {type, payload}) => {
	switch(type) {
		case 'SET_INTENTS': 
			return payload;
		default: 
			return state;
	}
}

export default intentsReducer;