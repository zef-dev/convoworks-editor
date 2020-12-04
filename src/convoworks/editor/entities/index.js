import angular from 'angular';

import entityList from './entity-list.directive';
import entityNew from './entity-new.directive';
import entityDetails from './entity-details.directive';
import entityEditor from './entity-editor.directive';

/* @ngInject */
export default angular
  .module('convo.editor.entities', [])
  .directive('entityList', entityList)
  .directive('entityNew', entityNew)
  .directive('entityDetails', entityDetails)
  .directive('entityEditor', entityEditor)
  .name;
