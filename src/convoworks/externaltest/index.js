import angular from 'angular';

import './convo-test-links.scss';

import convoExternaltest from './externaltest.directive';

/* @ngInject */
export default angular
  .module('convo.externaltest', [])
  .directive('convoExternaltest',convoExternaltest)
  .name;
