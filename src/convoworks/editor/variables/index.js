import angular from 'angular';

import './variables.scss';

import previewVariablesEditor from './preview-variables-editor.directive';
import variablesEditor from './variables-editor.directive';

/* @ngInject */
export default angular
  .module('convo.editor.variables', [])
  .directive('previewVariablesEditor', previewVariablesEditor)
  .directive('variablesEditor', variablesEditor)
  .name;
