/* @ngInject */
export default function numberAdapter($log) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) {
                return `${val}`;
            });
            ngModel.$formatters.push(function (val) {
                return isNaN(val) ? `${val}` : parseInt(val, 10);
            });
        }
    };
}