import template from './intent-details.tmpl.html';

/* @ngInject */
export default function intentDetails( $log, $window, $state, $stateParams, ConvoworksApi)
{
    return {
        restrict: 'E',
        scope: {
        },
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'intentDetails link');

            let submitting = false;
            let is_valid = true;
            var selected = $stateParams.name;
            var original = null; 
            var service_meta = {};
            
            $scope.current_intent = propertiesContext.getSelectedService().intents.find(i => i.name === selected);

            if ($scope.current_intent === undefined || $scope.current_intent === null) {
                $log.warn(`intentDetails selected intent [${selected}] does not exist.`);
                $state.go('^.intents-entities');
            }

            if ( !original) {
                original     =   angular.copy( $scope.current_intent);
            }
            
            var service_id = propertiesContext.getSelectedService().service_id;
            ConvoworksApi.getServiceMeta( service_id).then(function (meta) {
                service_meta = meta;
            });

            $scope.entities         =   propertiesContext.getSelectedService().entities;
            $scope.intents          =   propertiesContext.getConvoIntents();
            $scope.system_entities  =   propertiesContext.getSystemEntities();

            $scope.submitting = () => submitting;
            $scope.valid = () => is_valid;

            $scope.hasChildren = () => propertiesContext.getSelectedService().intents.some(intent => intent.parent_intent && intent.parent_intent === $scope.current_intent.name)
            
            $scope.getChildIntentNames = () => propertiesContext.getSelectedService().intents
                .filter(intent => intent.parent_intent && intent.parent_intent === $scope.current_intent.name)
                .map(intent => intent.name);

            $scope.onUpdate = function(intent, valid) {
                $log.debug( 'intentDetails onUpdate intent', intent, valid);
                $scope.$applyAsync( function () {
                    $scope.current_intent     =   angular.copy( intent);
                    is_valid = valid;
                });
            }
            
            function isAlexaEnabled()
            {
                if ( ('release_mapping' in service_meta) && ('amazon' in service_meta['release_mapping'])) {
                    return true;
                }
                return false;
            }
            
            function isAlexaOnly()
            {
                if ( !isAlexaEnabled()) {
                    return false;
                }
                
                if ( 'release_mapping' in service_meta) {
                    for ( var platform_id in service_meta['release_mapping']) {
                        if ( platform_id !== 'amazon') {
                            return false;
                        }
                    }
                }
                return true;
            }

            $scope.validator = function( str) {
                $log.debug( 'intentDetails validator str', str);
                
                if ( isAlexaEnabled()) {
                    let reg = /^[a-zA-Z][a-zA-Z/\s/./_/'/-]*$/;
                    let valid = reg.test( str.trim());
                    if ( valid) {
                        return {
                            valid : true,
                            message : ''
                        };  
                    }
                    return {
                        valid : !isAlexaOnly(),
                        message : "Utterance can't contain special characters when working with Amazon Alexa"
                    };  
                }
                
                return {
                    valid : true,
                    message : ''
                };  
            }

            $scope.submitIntent = function() {
                submitting = true;
                propertiesContext.updateConvoIntent(original, $scope.current_intent);
                submitting = false;
                $window.history.back();
            }

            $scope.cancel = function()
            {
                submitting = false;
                $window.history.back();
            }

            $scope.isIntentChanged = function() {
                return !angular.equals( $scope.current_intent, original);
            }

        }
    }
};
