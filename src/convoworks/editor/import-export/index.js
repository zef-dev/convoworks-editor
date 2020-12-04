import angular from 'angular';

import miscPanel from "./misc-panel.directive";

import './import-export.scss';

/* @ngInject */
export default angular
    .module('convo.editor.impexp', [])
    .directive('miscPanel', miscPanel)
    .name
