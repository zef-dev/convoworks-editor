const initialState = {
	name: "",
	values: [],
};

const currentItemReducer = (state = initialState,  {type, payload}) => {
	switch (type) {
		case "SET_CURRENT_ITEM_NAME":
			return state = {
				...state,
				name: payload
			};
		case "SET_CURRENT_ITEM_VALUES":
			return state = {
				...state,
				values: payload,
			};
		default:
			return state;
	}
};

export default currentItemReducer