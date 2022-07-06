import angular from 'angular';

import convoEditorActions from './actions';
import convoEditorConfig from './config';
import convoEditorReleases from './releases';
import convoEditorImpExp from './import-export';
import convoEditorToolbox from './toolbox';
import convoEditorPreview from './preview';
import convoEditorIntents from './intents';
import convoEditorEntities from './entities';
import convoEditorWorkflow from './workflow';
import convoEditorVariables from './variables';
import convoEditorProps from './props';
import convoEditorTest from './test';
import convoEditorSync from './sync';
import convoEditorNotifications from './notifications';

import ConvoworksEditorController from './convoworks-editor.controller';
import propertiesContext from './properties-context.directive';
import ConvoComponentFactoryService from './convo-component-factory.service';

/* @ngInject */
export default angular
  .module('convo.editor', [
    convoEditorActions,
    convoEditorConfig,
    convoEditorReleases,
    convoEditorImpExp,
    convoEditorToolbox,
    convoEditorPreview,
    convoEditorIntents,
    convoEditorEntities,
    convoEditorWorkflow,
    convoEditorProps,
    convoEditorVariables,
    convoEditorTest,
    convoEditorSync,
    convoEditorNotifications
  ])
  .controller('ConvoworksEditorController', ConvoworksEditorController)
  .directive('propertiesContext', propertiesContext)
  .service('ConvoComponentFactoryService', ConvoComponentFactoryService)
  .name;
