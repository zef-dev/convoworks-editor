import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import allReducers from "../../reducers/index.jsx";
import { Provider } from "react-redux";
import { withRouter } from "react-router-dom";
import { Switch, Route, BrowserRouter } from "react-router-dom";

function MainProvider(props) {
  const store = createStore(
    allReducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  console.log("Provider with store created!");
  console.log(store);
  return(
  <div className="editor">
    <Provider store={store}>
      <BrowserRouter>
        {props.children}
      </BrowserRouter>
    </Provider>
  </div>
  );
}

export {MainProvider}
