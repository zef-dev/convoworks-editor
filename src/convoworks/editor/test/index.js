import angular from 'angular';

import TestViewController from './test-view.controller';

import './test.scss';

/* @ngInject */
export default angular
    .module('convo.editor.test', [])
    .controller('TestViewController', TestViewController)
    .name;
