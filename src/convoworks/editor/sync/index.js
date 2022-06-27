import angular from 'angular';
import ServiceSync from './service-sync.directive';

export default angular
    .module('convo.editor.sync', [])
    .directive('serviceSync', ServiceSync)
    .name;