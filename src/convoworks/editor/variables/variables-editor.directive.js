import template from './variables-editor.tmpl.html';

/* @ngInject */
export default function variablesEditor($log)
{
    return {
        restrict: 'E',
        scope: { service: '=' },
        template: template,
        controller: function($scope) {
            'ngInject';
            
            // QUICKFIX
            if (!$scope.service.variables) {
                $scope.service.variables = {};
            }

            _init();

            $scope.addVariablesPair = function()
            {
                const cgi = $scope.variables_buffer.length - 1 < 0 ? 0 : $scope.variables_buffer.length - 1;

                const new_pair = {
                    'key': `tmp_key_${cgi}`,
                    'value': null
                };

                $scope.variables_buffer.push(new_pair);
                $scope.updateVariables();
            }

            $scope.removeVariablesPair = function(i)
            {
                $scope.variables_buffer.splice(i, 1);
                $scope.updateVariables();
            }

            $scope.updateVariables = function()
            {
                if (!Object.keys($scope.service.variables).length) {
                    $scope.service.variables = [];
                } else {
                    $scope.service.variables = {};
                }

                for (const pair of $scope.variables_buffer)
                {
                    const safe_key = _sanitizeKey(pair.key);

                    $scope.service.variables[safe_key] = pair.value;
                }
            }

            // INIT
            function _init()
            {
                _setupVariablesBuffer();
                _setupServiceWatch();
            }

            // PRIVATE
            function _setupVariablesBuffer()
            {
                $scope.variables_buffer =   [];

                for (var key in $scope.service.variables) {
                    $scope.variables_buffer.push({
                        'key': key,
                        'value': $scope.service.variables[key]
                    });
                }

                $log.log('variablesEditor _setupVariablesBuffer() done, buffer', $scope.variables_buffer);
            }

            function _setupServiceWatch()
            {
                $scope.$watch('service.variables', function() {
                    _setupVariablesBuffer();
                }, true);
            }
        },
        link: function($scope, $element, $attributes) {}
    }
}

function _sanitizeKey(key)
{
    return key.replace(/\s{2,}\.-/, '_');
}
