
import createServiceTemplate from './convoworks-add-service.tmpl.html';
import deleteServiceTemplate from './convoworks-delete-service.tmpl.html';
import ModalInstanceCtrl from './convoworks-add-service.controller';
import ServiceDeleteModalCtrl from './convoworks-delete-service.controller';

ConvoworksMainController.$inject = ['$log', '$document', '$scope', '$uibModal', 'ConvoworksApi', 'LoginService'];

export default function ConvoworksMainController($log, $document, $scope, $uibModal, ConvoworksApi, LoginService)
{
    $log.debug( 'ConvoworksMainController init');

    // API
    $scope.ready                =   false;
    $scope.availableServices    =   [];
    $scope.filtered             =   [];

    $scope.filter               =   '';

    $scope.user                 =   null;

    // LOGIN STATE
    $scope.$watch( function () {
        return LoginService.isSignedIn();
    }, function( value) {
        if ( value) {
            LoginService.getUser().then( function ( user) {
                $scope.user         =   user;
            }, function ( reason) {
                $log.log('ConvoworksMainController getUser() failed reason', reason);
            });
        } else {
            $scope.user         =   null;
        }
    });

    $scope.getAuthUserEmail          =   function () {
        if ( $scope.user) {
            return $scope.user.email;
        }
        return null;
    };

    $scope.getAuthUser          =   function () {
        if ( $scope.user) {
            return $scope.user.name;
        }
        return null;
    };

    $scope.createService        =   function()
    {
        $uibModal.open({
            template: createServiceTemplate,
            controller: ModalInstanceCtrl,
            appendTo: $document.find('.convoworks').eq(0),
            size : 'md',
            resolve: { ConvoworksApi: function() { return ConvoworksApi; }}
        })
    };

    $scope.deleteService        =   function($event, serviceId)
    {
        // $event.preventDefault();
        // $event.stopPropagation();

        var instance = $uibModal.open({
            template: deleteServiceTemplate,
            controller: ServiceDeleteModalCtrl,
            size: 'md',
            appendTo: $document.find('.convoworks').eq(0),
            resolve: {
                ConvoworksApi: function() { return ConvoworksApi; },
                serviceId: function() { return serviceId; }
            }
        });

        instance.result.then(function (res) {
            $log.log('ConvoworksMainController deleteService modal then res', res);

            if (res.errors && Object.keys(res.errors).length > 0)
            {
                throw new Error('Delete encountered errors ['+JSON.stringify(res.errors, null, 2)+']')
            }

            $scope.ready = false;
            _init();
        }, (reason) => {
            $log.log('ConvoworksMainController deleteService modal dismissed, reason', reason);
            
            $scope.ready = false;
            _init();
        })
    }

    $scope.publishedOn = function(service) {
        var published = [];

        angular.forEach(service.versions, function (value, key) {
            if (!published.includes(key)) {
                published.push(_cleanKey(key));
            }
        });

        return published;
    }

    _init();

    // INIT
    function _init()
    {
        ConvoworksApi.getAllServices().then( function( services) {
            $scope.availableServices    =   services;

            $scope.$watch('filter', function(value) {
                if (!value || value === '') {
                    $scope.filtered = angular.copy($scope.availableServices);
                }

                $scope.$applyAsync(function() {
                    $scope.filtered = $scope.availableServices.filter(function (service) {
                        const lcase_query = value.toLowerCase();
                        return service.name.toLowerCase().includes(lcase_query) ||
                        service.service_id.toLowerCase().includes(lcase_query) ||
                        JSON.stringify(service.owner).toLowerCase().includes(lcase_query);
                    })
                })
            })
        }, function( reason) {
            $log.warn( 'ConvoworksMainController fetching all services failed because of', reason);

            throw new Error( reason.data.message);
        }).finally( function() {
            $scope.ready    =   true;
        })
    }

    function _cleanKey(key) {
        return key.split('_').map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }).join(' ');
    }
}
