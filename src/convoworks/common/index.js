import angular from 'angular';
import 'angular-local-storage';

import { propsFilter, percent, prettyJson, admDate, unsafe, keys} from './filters';
import alertIndicator from './alert-indicator.directive';
import AlertService from './alert-service';
import UserPreferencesService from './user-preferences.service';
import DeferredsStackService from './deferreds-stack.service';
import ConvoworksApi from './convoworks-api';
import PlatformStatusService from './platform-status.service';

import jsonText from './json-text.directive';
import loadingIndicator from './loading.directive';
import textArray from './text-array.directive';
import jsonFormatter from './json-formatter.directive';

import './common.scss';
import StringService from './string.service';

/* @ngInject */
export default angular
  .module('convo.common', ['LocalStorageModule'])
  .filter('propsFilter', propsFilter)
  .filter('percent', percent)
  .filter('prettyJson', prettyJson)
  .filter('admDate', admDate)
  .filter('unsafe', unsafe)
  .filter('keys', keys)
  .directive('alertIndicator', alertIndicator)
  .directive('jsonText', jsonText)
  .directive('loadingIndicator', loadingIndicator)
  .directive('textArray', textArray)
  .directive('jsonFormatter', jsonFormatter)
  .factory('AlertService', AlertService)
  .service('DeferredsStackService', DeferredsStackService)
  .service('UserPreferencesService', UserPreferencesService)
  .service('ConvoworksApi', ConvoworksApi)
  .service('PlatformStatusService', PlatformStatusService)
  .service('StringService', StringService)
  .name;
