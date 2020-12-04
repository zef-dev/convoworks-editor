/* @ngInject */
export default function jsonText( $log) {

    $log.log('jsonText init');

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel)
        {
            var last_ok =   {};
            function into(input) {
                try {
                    scope.$emit('JsonError', false);
                    last_ok  =   JSON.parse(input);
                    scope.$emit('JsonOK', last_ok);
                    return last_ok;
                } catch (e) {
                    $log.warn('Error parsing JSON:', e.message);
                    scope.$emit('JsonError', e.message);
                    return last_ok;
                }
            }

            function out(data) {
                last_ok = data;
                return JSON.stringify(data, null, 2);
            }

            ngModel.$parsers.push(into);
            ngModel.$formatters.push(out);
        }
    };
}
