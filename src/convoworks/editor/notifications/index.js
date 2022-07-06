import angular from 'angular';
import notificationsDropdown from './notifications-dropdown.directive';
import NotificationsService from './notifications.service';

export default angular
    .module('convo.editor.notifications', [])
    .service('NotificationsService', NotificationsService)
    .directive('notificationsDropdown', notificationsDropdown)
    .name;