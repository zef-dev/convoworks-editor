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
            }

            $scope.reomveParamPair  =   function( index) {
                $scope.pairs.splice( index, 1);
            }

            $scope.$watch( 'component.properties.' + $scope.key, function () {
                $log.log( 'paramsEditor watch', $scope.key, $scope.component.properties[$scope.key]);
                $scope.pairs =   [];
                for ( var key in $scope.component.properties[$scope.key]) {
                    var val = $scope.component.properties[$scope.key][key];
                    $scope.pairs.push( {
                        key: key,
                        val: val
                    });
                }
            }, true)

            $scope.$watch( 'pairs', function () {
                backToComponent();
            }, true)

            function backToComponent()
            {
                var prop_data   =   {};
                for (var i=0; i<$scope.pairs.length; i++) {
                    var pair = $scope.pairs[i];
                    prop_data[pair.key] = pair.val;
                }
                $log.log( 'paramsEditor backToComponent prop_data', $scope.key, prop_data);
                $scope.component.properties[$scope.key] = $scope.pairs.length ? prop_data : [];
            }
        }
    }
};
