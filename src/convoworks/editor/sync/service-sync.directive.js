import angular from "angular";

/* @ngInject */
export default function ServiceSync($log, $document, $state, $timeout, ProcessRegistrarService) {
    return {
        restrict: 'A',
        require: '^propertiesContext',
        scope: {
            'service': '='
        },
        link: function ($scope, $element, $attributes, propertiesContext) {
            $log.log('serviceSync linked');

            const SERVICE_SYNC_PROCESS_KEY = 'service_sync';
            const SYNC_DELAY = 150;

            let broadcast_timeout = null;
            let syncing_timeout = null;
            let broadcast_watcher = null;

            const BC = new BroadcastChannel(SERVICE_SYNC_PROCESS_KEY);

            $scope.$watch(
                () => {
                    return $state.current.name.includes('convoworks-editor-service');
                },
                (newVal, oldVal) => {
                    if (newVal === oldVal) {
                        return;
                    }

                    if (newVal === false) {
                        $log.log('serviceSync no longer in service editor, tearing down listeners.');

                        BC.close();
                        
                        if (broadcast_timeout) {
                            $timeout.cancel(broadcast_timeout);
                        }
    
                        if (syncing_timeout) {
                            $timeout.cancel(syncing_timeout);
                        }
    
                        if (broadcast_watcher) {
                            broadcast_watcher();
                        }
                    }
                }
            );

            // SEND
            broadcast_watcher = $scope.$watch(
                () => {
                    try {
                        return propertiesContext.getSelectedService();
                    }
                    catch (e) {
                        return false;
                    }
                },
                (val) => {
                    if ($document[0].hasFocus() === false) {
                        // $log.warn('serviceSync will not broadcast changes while tab is blurred');
                        return;
                    }

                    if (val) {
                        if (broadcast_timeout) {
                            $timeout.cancel(broadcast_timeout);
                            broadcast_timeout = null;
                        }

                        ProcessRegistrarService.registerProcess(SERVICE_SYNC_PROCESS_KEY);

                        broadcast_timeout = $timeout(() => {
                            BC.postMessage(propertiesContext.getSelectedService());
                            ProcessRegistrarService.removeProcess(SERVICE_SYNC_PROCESS_KEY);
                        }, SYNC_DELAY)
                    }
                }, true);

            //RECEIVE
            BC.addEventListener('message', (event) => {
                if (!event || !event.data) {
                    return;
                }

                try {
                    const selected_service = propertiesContext.getSelectedService();
                    
                    if (angular.equals(selected_service, event.data)) {
                        return;
                    }

                    if (selected_service.service_id !== event.data.service_id) {
                        return;
                    }

                    if (syncing_timeout) {
                        $timeout.cancel(syncing_timeout);
                        syncing_timeout = null;
                    }

                    ProcessRegistrarService.registerProcess(SERVICE_SYNC_PROCESS_KEY);

                    const should_force_update_original = event.data.time_updated > selected_service.time_updated;

                    $timeout(() => {
                        propertiesContext.setSelectedService(event.data, should_force_update_original);
                        ProcessRegistrarService.removeProcess(SERVICE_SYNC_PROCESS_KEY);
                    }, SYNC_DELAY);
                }
                catch (e) {
                    return;
                }
            })
        }
    }
}