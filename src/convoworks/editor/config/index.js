import angular from 'angular';

import configurationView from "./configuration-view.directive";
import configAmazonEditor from './config-amazon-editor.directive';
import configConvoChatEditor from './config-convo-chat-editor.directive';
import configDialogflowEditor from './config-dialogflow-editor.directive';
import configMessengerEditor from './config-messenger-editor.directive';
import configViberEditor from './config-viber-editor.directive';
import configServiceMetaEditor from './config-service-meta-editor.directive';

import './config.scss';

/* @ngInject */
export default angular
    .module('convo.editor.config', [])
    .directive('configurationView', configurationView)
    .directive('configAmazonEditor', configAmazonEditor)
    .directive('configConvoChatEditor', configConvoChatEditor)
    .directive('configDialogflowEditor', configDialogflowEditor)
    .directive('configMessengerEditor', configMessengerEditor)
    .directive('configViberEditor', configViberEditor)
    .directive('configServiceMetaEditor', configServiceMetaEditor)
    .name;
