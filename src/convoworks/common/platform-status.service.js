/* @ngInject */
export default function PlatformStatusService( $rootScope, $log, $http, $q, $timeout, $interval, ConvoworksApi) {
        $log.log("PlatformStatusService init");

        const MAX_NUMBER_OF_TRIES = 20;
        const TIMEOUT_LENGTH = 10000;
        const SERVICE_PROPAGATION_STATUS_IN_PROGRESS = 'SERVICE_PROPAGATION_STATUS_IN_PROGRESS';
        const SERVICE_PROPAGATION_STATUS_FINISHED = 'SERVICE_PROPAGATION_STATUS_FINISHED';

        let pollTimeouts = [];
        let pollTries = [];

        this.SERVICE_PROPAGATION_STATUS_IN_PROGRESS = SERVICE_PROPAGATION_STATUS_IN_PROGRESS;
        this.SERVICE_PROPAGATION_STATUS_FINISHED = SERVICE_PROPAGATION_STATUS_FINISHED;

        this.checkStatus = checkStatus;
        this.cancelAllPolls = cancelAllPolls;

        function checkStatus(serviceId, platformId)
        {
            $log.log('PlatformStatusService checkStatus()', serviceId, platformId);
            ConvoworksApi.checkExternalServiceStatus(serviceId, platformId).then(function (data) {
                $log.log('checkExternalServiceStatus', serviceId, platformId, data);
                let broadcastPayload = {checkingServiceStatus: true, status: data.status, platformName: platformId};
                if (data.status === SERVICE_PROPAGATION_STATUS_IN_PROGRESS) {
                    _pollUntilStatusFinished(serviceId, platformId);
                } else if (data.status !== SERVICE_PROPAGATION_STATUS_IN_PROGRESS) {
                    broadcastPayload.checkingServiceStatus = false;
                    pollTries[platformId] = 0;
                }
                $rootScope.$broadcast('PlatformStatusUpdated', broadcastPayload);
            }).catch(function() {
                let broadcastPayload = {checkingServiceStatus: false, status: '', platformName: platformId, errorMessage: 'Failed to check status of ' + platformId};
                pollTries[platformId] = 0;
                $rootScope.$broadcast('PlatformStatusUpdated', broadcastPayload);
            });
        }

        function cancelAllPolls() {
            $log.log('going to cancel all pollTimeouts in PlatformStatusService', pollTimeouts, pollTries);

            for (const platformId in pollTimeouts) {
                if (pollTimeouts.hasOwnProperty(platformId))  {
                    _cancelPoll(platformId);
                }
            }
        }

        function _pollUntilStatusFinished(serviceId, platformId) {
            $log.log('_pollUntilStatusFinished()', pollTimeouts, pollTries, platformId);
            pollTries[platformId] === undefined ? pollTries[platformId] = 0 : pollTries[platformId] = pollTries[platformId];

            _cancelPoll(platformId);
            pollTimeouts[platformId] = $timeout(function() {
                pollTries[platformId]++;
                if (pollTries[platformId] <= MAX_NUMBER_OF_TRIES) {
                    checkStatus(serviceId, platformId);
                } else {
                    pollTries[platformId] = 0;
                }
            }, TIMEOUT_LENGTH);
        }

        function _cancelPoll(platformId) {
            if (pollTimeouts[platformId] !== undefined) {
                $timeout.cancel(pollTimeouts[platformId]);
                pollTimeouts[platformId] = undefined;
            }
        }
}
