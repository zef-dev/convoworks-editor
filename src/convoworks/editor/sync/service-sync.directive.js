/* @ngInject */
export default function ServiceSync($log, $window, $rootScope, localStorageService, AlertService) {
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
                try {
                    return propertiesContext.getSelectedService();
                } catch (e) {
                    return null;
                }
            },
            (val) =>
            {
                if (!val)
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
                        const old_meta = localStorageService.get(_getServiceMetaStorageKey());
                        const new_meta = { ...old_meta, should_sync: true };

                        localStorageService.set(_getServiceMetaStorageKey(), new_meta);
                        localStorageService.set(_getServiceDataStorageKey(), service);

                        $log.log('serviceSync window blur stored service with new meta', new_meta);
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
                if (!event.key.startsWith("convoAdmin.currentWorkingService")) {
                    $log.log('serviceSync discarding unrelated storage event');
                    return;
                }

                const target = event.key.slice("convoAdmin.".length);
                const meta_key = _getServiceMetaStorageKey();
                
                if (target !== meta_key)
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
                
                // AlertService.addSuccess('Synchronized service state.');
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