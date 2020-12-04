/* @ngInject */
export default function AlertService( $log, $timeout)
{
    var DURATION    =   5000;
    var     alertsService   =   {};

    alertsService.alerts    =   [];

    alertsService.getAlerts =   function()
    {
        return alertsService.alerts;
    };

    alertsService.addSucess =   function( msg)
    {
        alertsService._addAlert( { msg : msg, type : 'success'}, DURATION);
    };

    alertsService.addDanger =   function( msg)
    {
        alertsService._addAlert( { msg : msg, type : 'danger'}, DURATION);
    };

    alertsService.addInfo   =   function( msg)
    {
        alertsService._addAlert( { msg : msg, type : 'info'}, DURATION);
    };

    alertsService.addWarning    =   function( msg)
    {
        alertsService._addAlert( { msg : msg, type : 'warning'}, DURATION);
    };

    alertsService._addAlert =   function( alert, timeout)
    {
        alertsService.alerts.push( alert);
        $timeout(function () {
            alertsService.closeAlertObj( alert);
        }, timeout);
    };

    alertsService.closeAlert    =   function( index)
    {
        alertsService.alerts.splice(index, 1);
    };

    alertsService.closeAlertObj =   function( alert)
    {
        var index   =   alertsService.alerts.indexOf( alert);
        if (index > -1)
            alertsService.closeAlert( index);
    };

    return alertsService;
};

