import angular from 'angular';

import serviceSaveButtons from './service-save-buttons.directive';

/* @ngInject */
export default angular
    .module('convo.editor.actions', [])
    .directive('serviceSaveButtons', serviceSaveButtons)
    .name;