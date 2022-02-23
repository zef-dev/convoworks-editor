/* @ngInject */
export default function UserPreferencesService( $q, localStorageService)
{
    this.registerData       =   registerData;
    this.getData            =   getData;
    this.get                =   get;
    this.isSet              =   isSet;
    this.removeData         =   removeData;

    function getData( key)
    {
        var deferred    =   $q.defer();
        deferred.resolve( localStorageService.get( key));
        return deferred.promise;
    }

    function get(key, def, allowNull = false)
    {
        var val = localStorageService.get( key);

        if (allowNull && val === null) {
            return null;
        }

        if (typeof val === 'undefined' || val === null) {
            return def;
        }

        return val;
    }

    function isSet( key, allowNull = false)
    {
        var val = localStorageService.get( key);
        if ( typeof val === 'undefined' || val === null) {
            return false;
        }
        return true;
    }

    function registerData( key, data)
    {
        localStorageService.set( key, data)
    }

    function removeData (key)
    {
        localStorageService.remove(key);
    }
};
