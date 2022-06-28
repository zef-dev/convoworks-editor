import angular from "angular";

/* @ngInject */
export default function ServiceSync($log, $window, $rootScope, $state, localStorageService) {
    return {
        restrict: 'A',
        require: '^propertiesContext',
        scope: {
            'service': '='
        },
        link: function ($scope, $element, $attributes, propertiesContext) {
            $log.log('serviceSync linked');

            $rootScope.$watch(() =>
            {
                return $state.current.name.includes('convoworks-editor-service');
            },
            (newVal) =>
            {
                if (newVal === false)
                {
                    $log.info('serviceSync tearing down window listeners');

                    $window.removeEventListener('blur',    _onWindowBlur);
                    $window.removeEventListener('storage', _onWindowStorage);
                }
                else
                {
                    $log.info('serviceSync setting window listeners up');

                    $window.addEventListener('blur',    _onWindowBlur);
                    $window.addEventListener('storage', _onWindowStorage);
                }
            })

            // PRIVATE
            function _onWindowBlur()
            {
                $log.log('serviceSync window blur triggered');

                try
                {
                    const service = propertiesContext.getSelectedService();
                    
                    if (_shouldStoreServiceData())
                    {
                        const meta_key = _getServiceMetaStorageKey();
                        const data_key = _getServiceDataStorageKey();

                        const old_meta = localStorageService.get(meta_key);
                        let new_meta;
                        
                        if (angular.equals(old_meta, {})) {
                            new_meta = { last_synced: 0, should_sync: true };
                        } else {
                            new_meta = { ...old_meta, should_sync: true };
                        }

                        localStorageService.set(data_key, service);
                        
                        // @TODO(marko) Quickfix for first time service syncing.
                        // Opening a service cross tabs for the first time
                        // will cause other contexts to not pick up on the 
                        // storage event caused by saving the meta,
                        // since it won't trigger if the same data is saved twice.
                        // This way we make sure that other contexts pick up
                        // on the event properly.
                        localStorageService.remove(meta_key)
                        localStorageService.set(meta_key, new_meta);

                        $log.log('serviceSync window blur stored service and new meta', new_meta);
                    }
                    else
                    {
                        $log.info('serviceSync window blur not going to store meta or service data');
                    }
                }
                catch (e)
                {
                    $log.warn(e.message);
                }
            }

            function _onWindowStorage(event)
            {
                if (!event || !event.key || !event.key.includes("currentWorkingService")) {
                    $log.log('serviceSync discarding unrelated storage event');
                    return;
                }

                const meta_key = _getServiceMetaStorageKey();
                
                if (event.key !== localStorageService.deriveKey(meta_key))
                {
                    return;
                }

                const meta = localStorageService.get(meta_key) || null;
                const should_sync = (meta === null) || (meta.hasOwnProperty("should_sync") && meta.should_sync);

                if (!should_sync)
                {
                    $log.info('serviceSync not going to sync');
                    return;    
                }

                const saved_service = localStorageService.get(_getServiceDataStorageKey()) || null;

                if (!saved_service)
                {
                    $log.debug('serviceSync no stored service state');
                    return;
                }

                $log.log('serviceSync updated service state');
                propertiesContext.setSelectedService(saved_service);

                const now = Math.floor(new Date().getTime() / 1000);
                localStorageService.set(meta_key, { last_synced: now, should_sync: false });
            }

            // private

            // KEYS
            function _getServiceMetaStorageKey()
            {
                let service_id;

                try
                {
                    service_id = propertiesContext.getSelectedService().service_id;
                }
                catch (e)
                {
                    $log.warn('serviceSync could not fetch service ID');
                    return null;
                }

                return `currentWorkingService_Meta_${service_id}`;
            }

            function _getServiceDataStorageKey()
            {
                let service_id;
                try
                {
                    service_id = propertiesContext.getSelectedService().service_id;
                }
                catch (e)
                {
                    $log.warn('serviceSync could not fetch service ID');
                    return null;
                }

                return `currentWorkingService_Data_${service_id}`;
            }

            // UTIL
            function _shouldStoreServiceData()
            {
                try
                {
                    const meta = localStorageService.get(_getServiceMetaStorageKey()) || null;
                    
                    if (!meta)
                    {
                        $log.info(`serviceSync no metadata present under key ${_getServiceMetaStorageKey()}, returning true`);
                        return true;
                    }
                    
                    const service_last_updated = propertiesContext.getSelectedService().time_updated;

                    if (meta.last_synced < service_last_updated)
                    {
                        // service has been saved and not synced cross tabs
                        return true;
                    }

                    if (propertiesContext.isServiceChanged())
                    {
                        // @TODO(marko): This causes tabs to want to sync even if there are no
                        // changes in the working service. Consider the following, supposing you have the same service
                        // open in both tabs:
                        // Update service in tab 1 -> save -> switch to tab 2 -> sync triggers (-> optionally save 2) -> change back to 1
                        // This causes the onBlur event from tab 2 to store meta as if it should sync cross tabs,
                        // even though there have been no further user made changes.
                        // Possible solutions:
                        // a) compare stored service vs currently selected? Could be expensive.
                        // b) add event to adding a component/block/whatever? Loses continuity in digest loop
                        return true;
                    }

                    return false;
                }
                catch (e)
                {
                    $log.warn(e.message);
                    return false;
                }
            }
        }
    }
}