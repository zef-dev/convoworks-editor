import React, { useEffect } from 'react';
import { useState } from 'react';

const NavContext = React.createContext();

const NavProvider = props => {
	const [currentPage, setCurrentPage] = useState(null);

	useEffect(() => {
		setCurrentPage(null)
	}, [])

	return (
		<NavContext.Provider value={{ currentPage, setCurrentPage }}>
			{props.children}
		</NavContext.Provider>
	);
};

export {NavContext, NavProvider}
