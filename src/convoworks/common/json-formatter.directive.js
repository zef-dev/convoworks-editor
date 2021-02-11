import JSONFormatter from 'json-formatter-js';

/* @ngInject */
export default function jsonFormatter($log) {
    return {
        restrict: 'E',
        scope: { 'data': '=' },
        link: function($scope, $element, $attributes) {
            $scope.$watch('data', (value) => {
                if (!value) {
                    value = {};
                }
                
                const formatter = new JSONFormatter(value);
                
                $element.empty();
                $element.append(formatter.render());
            }, true);
        }
    }
}