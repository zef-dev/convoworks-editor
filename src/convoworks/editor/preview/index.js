import angular from 'angular';

import './preview.scss';

import previewPanel from './preview-panel.directive';

/* @ngInject */
export default angular
  .module('convo.editor.preview', [])
  .directive('previewPanel', previewPanel)
  .name;
