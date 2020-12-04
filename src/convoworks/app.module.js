import angular from 'angular';

import 'angular-animate';
import 'angular-bootstrap-contextmenu';
import 'angular-cookies';
import 'angular-sanitize';
import 'angularjs-ui-bootstrap';
import '@uirouter/angularjs';
import 'angular-local-storage';
import 'ng-file-upload';
import 'angular-ui-sortable';

import convoCommon from './common';
import convoChat from './chatbox';
import convoExternalTest from './externaltest';
import convoEditor from './editor';
import convoServices from './services';

/* @ngInject */
export default angular
    .module('convo', [
        convoCommon,
        convoChat,
        convoExternalTest,
        convoEditor,
        convoServices,
        'LocalStorageModule',
        'ui.bootstrap', 'ui.bootstrap.contextMenu',
        'ngSanitize', 'ui.router', 'ngAnimate', 'ngCookies',
        'ngFileUpload', 'ui.sortable'
    ]);
