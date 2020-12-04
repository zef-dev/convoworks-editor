import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { NavContext } from "../wrappers/nav_wrapper.jsx";

const NavMain = (props) => {
	const navContext = useContext(NavContext);
	
	return (
		<React.Fragment>
			{/* <nav className="nav">
				<div className="logo">Convoworks</div>
				<div className="nav__current">
					{navContext.currentPage && 
						<div><span>&larr;</span>{navContext.currentPage.name}</div>			
					}
				</div>
			</nav> */}
		</React.Fragment>
	);
};

export {NavMain};
