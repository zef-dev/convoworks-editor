
const systemEntitiesReducer = (state = [], {type, payload}) => {
	switch(type) {
		case 'SET_SYSTEM_ENTITIES': 
			return payload;
		default: 
			return state;
	}
}

export default systemEntitiesReducer;
