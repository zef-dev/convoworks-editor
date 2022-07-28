import angular from 'angular';

import './properties-editor.scss';
import './component-help.scss';

import propertiesEditor from './properties-editor.directive';

import convoIntentEditor from './convo-intent-editor.directive';
import paramsEditor from './params-editor.directive';
import contenteditable from './contendeditable.directive';
import numberAdapter from '../../common/number-adapter.directive';
import requiredSlotsEditor from './required-slots-editor.directive';
import intentDelegateEditor from './intent-delegate-editor.directive';
import delegateSlotEditor from './delegate-slot-editor.directive';

/* @ngInject */
export default angular
  .module('convo.editor.props', [])
  .directive('propertiesEditor', propertiesEditor)
  .directive('convoIntentEditor', convoIntentEditor)
  .directive('paramsEditor', paramsEditor)
  .directive('requiredSlotsEditor', requiredSlotsEditor)
  .directive('intentDelegateEditor', intentDelegateEditor)
  .directive('delegateSlotEditor', delegateSlotEditor)
  .directive('contenteditable', contenteditable)
  .directive('numberAdapter', numberAdapter)
  .name;
