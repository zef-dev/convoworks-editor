import template from './preview-variables-editor.tmpl.html';

/* @ngInject */
export default function previewVariablesEditor( $log)
{
    return {
        restrict: 'E',
        scope: { service: '=' },
        template: template,
        controller: function( $scope) {
            'ngInject';
            // QUICKFIX
            if ( !$scope.service.preview_variables) {
                $scope.service.preview_variables    =   {};
            }

            _init();

            $scope.addPreviewVariablesPair     =   function()
            {
                var current_greatest_index  =   $scope.preview_variables_buffer.length - 1 < 0? 0 : $scope.preview_variables_buffer.length - 1;

                var new_pair    =   { 'key': 'tmp_key_' + current_greatest_index, 'value': 'tmp_value' };

                $scope.preview_variables_buffer.push( new_pair);
            };

            $scope.removePreviewVariablesPair  =   function( i)
            {
                $scope.preview_variables_buffer.splice( i, 1);
            };

            // INIT
            function _init()
            {
                _setupVariablesBuffer();
                _setupServiceWatch();
                _setupBufferWatch();
            }

            // PRIVATE
            function _setupVariablesBuffer()
            {
                $scope.preview_variables_buffer =   [];

                for ( var key in $scope.service.preview_variables) {
                    $scope.preview_variables_buffer.push( { 'key': key, 'value': $scope.service.preview_variables[key] });
                }

                $log.log( 'previewVariablesEditor _setupVariablesBuffer() done, buffer', $scope.preview_variables_buffer);
            }

            function _setupServiceWatch()
            {
                $scope.$watch('service.preview_variables', function() {
                    _setupVariablesBuffer();
                }, true);
            }

            function _setupBufferWatch()
            {
                $scope.$watch( 'preview_variables_buffer', function () {
                    // QUICKFIX
                    if ( !Object.keys( $scope.service.preview_variables).length) {
                        $scope.service.preview_variables    =   [];
                    } else {
                        $scope.service.preview_variables    =   {};
                    }

                    for ( var i in $scope.preview_variables_buffer) {
                        var pair        =   $scope.preview_variables_buffer[i];
                        var safe_key    =   _sanitizeKey( pair.key);

                        $scope.service.preview_variables[safe_key]  =   pair.value;
                    }
                }, true);
            }
        },
        link: function( $scope, $element, $attributes) {}
    }
}

function _sanitizeKey( key)
{
    return key.replace( /\s{2,}\.-/, '_');
}
