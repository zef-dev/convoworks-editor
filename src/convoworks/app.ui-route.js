
/* @ngInject */
export default function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/convoworks-editor');

    $stateProvider
        .state('convoworks-editor', {
            url:'/convoworks-editor',
            template: require( './services/convoworks-menu.tmpl.html'),
            controller: 'ConvoworksMainController',
            controllerAs: 'mainCworksVm'
        })

        .state('convoworks-add-new-service', {
            url:'/add-new-service',
            template: require('./services/convoworks-add-service.tmpl.html'),
            controller: 'ConvoworksAddNewServiceController',
            controllerAs: 'newServiceVm'
        })

        .state('convoworks-editor-service', {
            url:'/convoworks-editor/:service_id',
            template: require( './editor/convoworks-editor.tmpl.html'),
            controller: 'ConvoworksEditorController',
            controllerAs: 'editorVm',
            abstract: true
//            reloadOnSearch: false
        }).state('convoworks-editor-service.editor', {
            url:'/editor?sb&sv',
            reloadOnSearch: false,
            params: { sv: 'steps' },
            views: {
              'serviceTabView': {
                template: require('./editor/workflow/workflow-editor-view.tmpl.html'),
                controller: 'WorkflowEditorController'
              }
            }
        }).state('convoworks-editor-service.preview', {
            url:'/preview',
            views: {
              'serviceTabView': {
                template: require('./editor/preview/preview-view.tmpl.html'),
              }
            }
        }).state('convoworks-editor-service.variables', {
            url:'/variables',
            views: {
              'serviceTabView': {
                template: require('./editor/variables/variables-view.tmpl.html'),
              }
            }
        }).state('convoworks-editor-service.intents-entities', {
            url:'/intents-entities',
            views: {
                'serviceTabView': {
                template: require('./editor/intents/intents-entities-view.tmpl.html'),
                },
            }
        }).state('convoworks-editor-service.intent-new', {
            url:'/intents-entities/intent/new',
            views: {
                'serviceTabView': {
                template: '<intent-new></intent-new>',
              }
            }
        }).state('convoworks-editor-service.intent-details', {
            url:'/intents-entities/intent/:name/details',
            views: {
                'serviceTabView': {
                template: '<intent-details></intent-details>',
              }
            }
        }).state('convoworks-editor-service.entity-new', {
            url:'/intents-entities/entity/new',
            views: {
                'serviceTabView': {
                template: '<entity-new></entity-new>',
              }
            }
        }).state('convoworks-editor-service.entity-details', {
            url:'/intents-entities/entity/:name/details',
            views: {
                'serviceTabView': {
                    template: '<entity-details></entity-details>'
                }
            }
        }).state('convoworks-editor-service.configuration', {
            url:'/configuration',
            views: {
                'serviceTabView': {
                    template: '<configuration-view service="getSelection().service"></configuration-view>'
              }
            }
        }).state('convoworks-editor-service.configuration-amazon', {
            url: '/configuration/amazon',
            views: {
                'serviceTabView': {
                    // template: require('./editor/config/config-amazon-editor.tmpl.html'),
                    // controller: configAmazonEditor
                    template: '<config-amazon-editor service="getSelection().service" meta="getSelection().meta"></config-amazon-editor>'
                }
            }
        }).state('convoworks-editor-service.configuration-dialogflow', {
            url: '/configuration/dialogflow',
            views: {
                'serviceTabView': {
                    template: '<config-dialogflow-editor service="getSelection().service"></config-dialogflow-editor>'
                }
            }
        }).state('convoworks-editor-service.configuration-messenger', {
            url: '/configuration/messenger',
            views: {
                'serviceTabView': {
                    template: '<config-messenger-editor service="getSelection().service"></config-messenger-editor>'
                }
            }
        }).state('convoworks-editor-service.configuration-viber', {
            url: '/configuration/viber',
            views: {
                'serviceTabView': {
                    template: '<config-viber-editor service="getSelection().service"></config-viber-editor>'
                }
            }
        }).state('convoworks-editor-service.configuration-convo-chat', {
            url: '/configuration/convo-chat',
            views: {
                'serviceTabView': {
                    template: '<config-convo-chat-editor service="getSelection().service"></config-convo-chat-editor>'
                }
            }
        }).state('convoworks-editor-service.releases', {
            url:'/releases',
            views: {
                'serviceTabView': {
                template: require('./editor/releases/releases-view.tmpl.html'),
              }
            }
        }).state('convoworks-editor-service.import-export', {
            url:'/import-export',
            views: {
                'serviceTabView': {
                // template: 'import-export',
                template: require('./editor/import-export/import-export-view.tmpl.html'),
              }
            }
        }).state('convoworks-editor-service.test', {
            url:'/test',
            views: {
              'serviceTabView': {
                // template: 'test',
                template: require('./editor/test/test-view.tmpl.html'),
              }
            }
        });

};
