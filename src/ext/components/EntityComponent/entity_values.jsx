import React, { useState, useEffect } from 'react';
import EntityValue from './entity_value.jsx';

function EntityValues(props) {
	const [ activeValue, setActiveValue ] = useState(null);

	function handleUpdate(arr, index, item) {
		arr[index] = {
			value: item.value,
			synonyms: item.synonyms
		};

		props.setValues(arr);
	}

	const makeItems = (items) => {
		if (items) {
			return items.map((item, index) => {
				return (
					<React.Fragment key={index}>
						<EntityValue
							index={index}
							item={item}
							values={props.values}
							removeValue={props.removeValue}
							handleUpdate={handleUpdate}
							activeValue={activeValue}
							setActiveValue={setActiveValue}
						/>
					</React.Fragment>
				);
			});
		}
	};

	if (props.values) {
		return <div>{makeItems(props.values)}</div>;
	} else {
		return null
	}
}

export default EntityValues;
