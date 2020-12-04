
const entitiesReducer = (state = [], {type, payload}) => {
	switch(type) {
		case 'SET_ENTITIES': 
			return payload;
		default: 
			return state;
	}
}

export default entitiesReducer;