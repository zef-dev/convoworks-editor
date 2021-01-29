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
            if (!$scope.service.preview_variables) {
                $scope.service.preview_variables = {};
            }

            _init();

            $scope.addPreviewVariablesPair = function()
            {
                const cgi = $scope.preview_variables_buffer.length - 1 < 0 ? 0 : $scope.preview_variables_buffer.length - 1;

                const new_pair = {
                    'key': `tmp_key_${cgi}`,
                    'value': null
                };

                $scope.preview_variables_buffer.push(new_pair);
                $scope.updateVariables();
            }

            $scope.removePreviewVariablesPair = function(i)
            {
                $scope.preview_variables_buffer.splice(i, 1);
                $scope.updateVariables();
            }

            $scope.updatePreviewVariables = function()
            {
                if (!Object.keys($scope.service.preview_variables).length) {
                    $scope.service.preview_variables = [];
                } else {
                    $scope.service.preview_variables = {};
                }

                for (const pair of $scope.preview_variables_buffer)
                {
                    const safe_key = _sanitizeKey(pair.key);

                    $scope.service.preview_variables[safe_key] = pair.value;
                }
            }

            // INIT
            function _init()
            {
                _setupPreviewVariablesBuffer();
                _setupServiceWatch();
            }

            // PRIVATE
            function _setupPreviewVariablesBuffer()
            {
                $scope.preview_variables_buffer =   [];

                for (var key in $scope.service.preview_variables) {
                    $scope.preview_variables_buffer.push({
                        'key': key,
                        'value': $scope.service.preview_variables[key]
                    });
                }

                $log.log('previewVariablesEditor _setupVariablesBuffer() done, buffer', $scope.preview_variables_buffer);
            }

            function _setupServiceWatch()
            {
                $scope.$watch('service.preview_variables', function() {
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
