import angular from 'angular';

import intentsList from './intents-list.directive';
import intentDetails from './intent-details.directive';
import intentNew from './intent-new.directive';
import intentEditor from './intent-editor.directive';

import 'convoworks-intent-model-editor/dist/index.css'

/* @ngInject */
export default angular
  .module('convo.editor.intents', [])
  .directive('intentsList', intentsList)
  .directive('intentDetails', intentDetails)
  .directive('intentNew', intentNew)
  .directive('intentEditor', intentEditor)
  .name;
