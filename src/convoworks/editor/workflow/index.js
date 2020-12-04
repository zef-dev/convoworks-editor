import angular from 'angular';

import './workflow-editor-view.scss';
import './selectable-component.scss';
import './convoworks-components-container.scss';
import './collapse-expand-buttons.scss';

import blockComponent from './block-component.directive';
import selectableComponentButtons from './selectable-component-buttons.directive';
import convoworksComponentsContainer from './convoworks-components-container.directive';
import selectableComponent from './selectable-component.directive';
import subroutineComponent from './subroutine-component.directive';
import ConvoworksAddBlockService from './convoworks-add-block.service';

import contextElement from './context-element.directive';
import contextElementsContainer from './context-elements-container.directive';
import WorkflowEditorController from './workflow-editor.controller';

/* @ngInject */
export default angular
    .module('convo.editor.workflow', [])
    .service('ConvoworksAddBlockService', ConvoworksAddBlockService)
    .directive('blockComponent', blockComponent)
    .directive('selectableComponentButtons', selectableComponentButtons)
    .directive('convoworksComponentsContainer', convoworksComponentsContainer)
    .directive('selectableComponent', selectableComponent)
    .directive('subroutineComponent', subroutineComponent)
    .directive('contextElement', contextElement)
    .directive('contextElementsContainer', contextElementsContainer)
    .controller('WorkflowEditorController', WorkflowEditorController)
    .name;
