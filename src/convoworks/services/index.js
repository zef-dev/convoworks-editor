import angular from 'angular';

import './services.scss';

import ConvoworksAddNewServiceController from './convoworks-add-service.controller';
import ConvoworksDeleteServiceController from "./convoworks-delete-service.controller";
import ConvoworksMainController from './convoworks-main.controller';

/* @ngInject */
export default angular
    .module('convo.services', ['convo.common'])
    .controller( 'ConvoworksMainController', ConvoworksMainController)
    .controller( 'ConvoworksAddNewServiceController', ConvoworksAddNewServiceController)
    .controller( 'ConvoworksDeleteServiceController', ConvoworksDeleteServiceController)
//  .service('ConvoChatApi', ConvoChatApi)
    .name;
