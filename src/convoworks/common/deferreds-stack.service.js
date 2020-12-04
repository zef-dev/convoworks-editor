


function DeferredsStack()
{
    this.groups         =   {};
    this.resoulutions   =   {};
}


DeferredsStack.prototype.registered = function( key)
{
    var deferreds   =   this._getGroup( key);
    if (deferreds.length) {
        return true;
    }
    return false;
}

DeferredsStack.prototype.register = function( key, deferred)
{
    if (key in this.resoulutions)
    {
        deferred.resolve( this.resoulutions[key]);
        delete this.resoulutions[key];
        return;
    }
    
    var deferreds   =   this._getGroup( key);
    deferreds.push( deferred);
}

DeferredsStack.prototype.resolve = function( key, result)
{
    var deferreds   =   this._getGroup( key);
    
    if (deferreds.length == 0)
    {
        this.resoulutions[key]  =   result;
        return;
    }
    
    var deferred;
    while (deferred = deferreds.shift()) {
        deferred.resolve( result);
    }
}

DeferredsStack.prototype.reject = function( key, reason)
{
    var deferreds   =   this._getGroup( key);
    var deferred;
    while (deferred = deferreds.shift()) {
        deferred.reject( reason);
    }
}

DeferredsStack.prototype.rejectAll = function()
{
    for (var key in this.groups)
        this.reject( key, null);
}

DeferredsStack.prototype._getGroup = function( key)
{
    if (angular.isUndefined( this.groups[key]))
        this.groups[key] = [];
    return this.groups[key];
}


export default function DeferredsStackService( $log)
{
    this.getNew     =   getNew;
        
    function getNew()
    {
        return new DeferredsStack();
    }
};
