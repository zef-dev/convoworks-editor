import angular from 'angular';

import './properties-editor.scss';
import './component-help.scss';

import propertiesEditor from './properties-editor.directive';

import convoIntentEditor from './convo-intent-editor.directive';
import paramsEditor from './params-editor.directive';
import contenteditable from './contendeditable.directive';

/* @ngInject */
export default angular
  .module('convo.editor.props', [])
  .directive('contenteditable', contenteditable)
  .directive('propertiesEditor', propertiesEditor)
  .directive('convoIntentEditor', convoIntentEditor)
  .directive('paramsEditor', paramsEditor)
  .name;
