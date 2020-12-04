
const activeItemReducer = (state = [], {type, payload}) => {
	switch(type) {
		case 'SET_ACTIVE_ITEM': 
		return payload;
		default: 
			return state;
	}
}

export default activeItemReducer;