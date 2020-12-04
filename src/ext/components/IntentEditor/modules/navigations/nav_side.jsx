import React from "react";
//import { ReactSVG } from 'react-svg'
import { Link } from "react-router-dom";
//import { intentModelIcon } from "../../helpers/image_paths.jsx";

function Navigation() {
	return (
		<nav className="side-nav">
			<ul>
				<li>
					<Link className={`side-nav__link ${'active'}`} to={`/intent_model`}>
						<span>GG</span>
					</Link>
				</li>
			</ul>
		</nav>
	);
}

export {Navigation};
