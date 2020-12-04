import React, { useEffect } from "react";
//

import {TheApp} from './App.js'
import {MainProvider} from './modules/store/index.jsx'


import { withKnobs, text } from '@storybook/addon-knobs'



export default { title: 'Intent Editor', decorators: [withKnobs]}

export const intent_editor = () => {
  return(
    <MainProvider>
        <TheApp/>
    </MainProvider>
  );
      
}

