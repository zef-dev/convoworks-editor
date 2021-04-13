/* @ngInject */
export default function PlatformStatusService( $rootScope, $log, $http, $q, $timeout, $interval, ConvoworksApi) {
        $log.log("PlatformStatusService init");

        const MAX_NUMBER_OF_TRIES = 20;
        const TIMEOUT_LENGTH = 10000;

        let timeout = [];
        let pollTry = [];

        this.checkStatus = checkStatus;
        this.cancelAllPolls = cancelAllPolls;

        function checkStatus(serviceId, platformId)
        {
            $log.log('PlatformStatusService checkStatus()', serviceId, platformId);
            ConvoworksApi.checkExternalServiceStatus(serviceId, platformId).then(function (data) {
                $log.log('checkExternalServiceStatus', serviceId, platformId, data);
                let broadcastPayload = {checkingServiceStatus: true, status: data.status, platformName: platformId};
                if (data.status === 'SERVICE_PROPAGATION_STATUS_IN_PROGRESS') {
                    _pollUntilStatusFinished(serviceId, platformId);
                } else if (data.status !== 'SERVICE_PROPAGATION_STATUS_IN_PROGRESS') {
                    broadcastPayload.checkingServiceStatus = false;
                    pollTry[platformId] = 0;
                }
                $rootScope.$broadcast('PlatformStatusUpdated', broadcastPayload);
            }).catch(function() {
                let broadcastPayload = {checkingServiceStatus: false, status: '', platformName: platformId, errorMessage: 'Failed to check status of ' + platformId};
                pollTry[platformId] = 0;
                $rootScope.$broadcast('PlatformStatusUpdated', broadcastPayload);
            });
        }

        function cancelAllPolls() {
            $log.log('going to cancel all polls in PlatformStatusService', timeout, pollTry);

            for (const platformId in timeout) {
                if (timeout.hasOwnProperty(platformId))  {
                    _cancelPoll(platformId);
                }
            }
        }

        function _pollUntilStatusFinished(serviceId, platformId) {
            $log.log('_pollUntilStatusFinished()', timeout, pollTry, platformId);
            pollTry[platformId] === undefined ? pollTry[platformId] = 0 : pollTry[platformId] = pollTry[platformId];

            _cancelPoll(platformId);
            timeout[platformId] = $timeout(function() {
                pollTry[platformId]++;
                if (pollTry[platformId] <= MAX_NUMBER_OF_TRIES) {
                    checkStatus(serviceId, platformId);
                } else {
                    pollTry[platformId] = 0;
                }
            }, TIMEOUT_LENGTH);
        }

        function _cancelPoll(platformId) {
            if (timeout[platformId] !== undefined) {
                $timeout.cancel(timeout[platformId]);
                timeout[platformId] = undefined;
            }
        }
}
