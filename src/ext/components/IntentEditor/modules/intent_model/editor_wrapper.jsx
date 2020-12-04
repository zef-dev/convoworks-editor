
import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import allReducers from "../../reducers/index.jsx";
import { Provider } from "react-redux";

// editors
import {IntentModelEditor} from "./intent_model_editor.jsx";
import {ReduxDispatcher} from "./redux_dispatcher.jsx";


function EditorWrapper(props) {
  const store = createStore(
    allReducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  console.log("Provider with store created!");
  console.log(store);

  console.log("Passed in props", props);


  const entities = props.entities;
  const intents = props.intents;
  const system_entities = props.system_entities;
  const ng_callbacks = {fn_updated: props.fn_updated, fn_alert: props.fn_alert}

  const debugIntents = (i) => {
    console.log(i);
  };

  console.log("======================================");
  console.log("INTENTS:");
  console.log(intents);

  return(
    <div className="convogui">
      <Provider store={store}>
        <ReduxDispatcher
          entities={entities}
          intents={intents}
          system_entities={system_entities}
      
          //onPropsChange={this.onChange}
        >
          <IntentModelEditor 
            entities={entities}
            intents={intents}
            ng_callbacks={ng_callbacks}
          />
        </ReduxDispatcher>
      </Provider>
    <button
      onClick={() => { intents.pop(); 
        console.log("MANUAL ENTITIES POP AND FN_UPDATE", entities, intents);
        props.fn_updated(entities, intents);
                     }
      }
    >
    fire fn_updated
    </button>
    </div>
  );
}

export {EditorWrapper}
