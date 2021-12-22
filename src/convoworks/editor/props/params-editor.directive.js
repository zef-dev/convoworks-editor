import template from './params-editor.tmpl.html';

/* @ngInject */
export default function paramsEditor( $log, ConvoworksApi) {
    return  {
        restrict: 'E',
        require: '^propertiesContext',
        template: template,
        scope: {
            component: '=',
            propertyDefinition: '=',
            key: '=',
            service: '='
        },
        link: function ( $scope, $element, $attributes, propertiesContext) {
           $log.log( 'paramsEditor link');

            $scope.pairs =   [];

            $scope.addParamPair  =   function() {
                $scope.pairs.push( {
                    key: 'my_new_param',
                    val: ''
                });
                $scope.backToComponent();
            }

            $scope.removeParamPair  =   function( index) {
                $scope.pairs.splice( index, 1);
                $scope.backToComponent();
            }

            $scope.$watch(`component.properties.${$scope.key}`, function () {
                $log.log( 'paramsEditor watch', $scope.key, $scope.component.properties[$scope.key]);

                if ($scope.usingRaw()) {
                    $log.log('paramsEditor using raw for key', $scope.key);
                    return;
                }

                $scope.pairs = [];
                for (let key in $scope.component.properties[$scope.key])
                {
                    let val = $scope.component.properties[$scope.key][key];
                    $scope.pairs.push({
                        key: key,
                        val: val
                    });
                }
            }, true)

            $scope.backToComponent = function()
            {
                if ($scope.usingRaw()) {
                    $log.log('paramsEditor using raw for key', $scope.key);
                    return;
                }

                let prop_data = {};

                for (const pair of $scope.pairs) {
                    prop_data[pair.key] = pair.val;
                }

                $log.log('paramsEditor backToComponent prop_data', $scope.key, prop_data);
                $scope.component.properties[$scope.key] = $scope.pairs.length ? prop_data : [];
            }

            $scope.usingRaw = function()
            {
                return $scope.component.properties[`_use_var_${$scope.key}`];
            }
        }
    }
};
