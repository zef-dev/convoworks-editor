import angular from 'angular';

import releasesEditor from './releases-editor.directive';
import versionsEditor from './versions-editor.directive';

import './releases.scss';

/* @ngInject */
export default angular
    .module('convo.editor.releases', [])
    .directive('releasesEditor', releasesEditor)
    .directive('versionsEditor', versionsEditor)
    .name;
