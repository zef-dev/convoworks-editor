/* @ngInject */
export default function convertToNumber($log) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) {
                $log.log('hahahaeahehhaehahe', val);
                return isNaN(val) ? val : parseInt(val, 10);
            });
            ngModel.$formatters.push(function (val) {
                return `${val}`;
            });
        }
    };
}