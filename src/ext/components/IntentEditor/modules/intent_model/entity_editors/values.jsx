import React, { useState, useEffect } from "react";
import {Item} from "./item.jsx";
import { setCurrentItemValues } from "../../../actions/index.jsx";
import { useDispatch, useSelector } from "react-redux";

function Values(props) {
	const dispatch = useDispatch();
	const [values, setValues] = useState(null);
	const activeItem = useSelector((state) => state.activeItemReducer);


	function handleUpdate(arr, index, item) {
		arr[index] = {
			value: item.value,
			synonyms: item.synonyms
		};

		dispatch(setCurrentItemValues(arr))
	}

	const removeItem = (index) => {
		let arr = [...values];

		if (index !== -1) {
			arr.splice(index, 1);
			setValues(arr);
			setTimeout(() => {
				dispatch(setCurrentItemValues([...arr]))
			}, 100)
		}
	};

	useEffect(() => {
		setValues([...props.values])
	}, [props.values]);

	const makeItems = (items) => {
		if (items) {
			return items.map((item, i) => {
				return (
					<Item
						data={item}
						index={i}
						edit={i === activeItem ? true : false}
						key={i}
						values={values}
						removeItem={removeItem}
						handleUpdate={handleUpdate}
						addNewValue={addNewValue}
					/>
				);
			});
		}
	};

	const addNewValue = (newValue) => {
		//dispatch(setCurrentItemValues(name));
	};

	return <div>{makeItems(values)}</div>;
}

export default Values;
