import React, { useEffect } from "react";
//

import { withKnobs, text } from '@storybook/addon-knobs'

// json
import * as data from "../../json/data.json";


import {EditorWrapper} from "./editor_wrapper.jsx";

export default { title: 'Intent Model Editor', decorators: [withKnobs]}

export const editor_wrapper = () => {
  return(
      <EditorWrapper 
        entities={data.default.JSON.entities}
        intents={data.default.JSON.intents}
      />
  );
      
}

