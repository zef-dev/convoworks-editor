/* @ngInject */
export default function UserPreferencesService($q, localStorageService) {
    this.registerData = registerData;
    this.getData = getData;
    this.get = get;
    this.isSet = isSet;
    this.removeData = removeData;

    function registerData(key, data) {
        localStorageService.set(key, data)
    }

    function getData(key) {
        var deferred = $q.defer();
        deferred.resolve(localStorageService.get(key));
        return deferred.promise;
    }

    function removeData(key) {
        localStorageService.remove(key);
    }

    function get(key, def) {
        var val = localStorageService.get(key);

        if (typeof val === 'undefined' || val === null) {
            return def;
        }

        return val;
    }

    function isSet(key) {
        return localStorageService.keys().includes(key);
    }
};
