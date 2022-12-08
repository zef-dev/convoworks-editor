import template from './preview-panel.tmpl.html';

/* @ngInject */
export default function previewPanel($log, $sce, $state, $window, ConvoworksApi, AlertService) {
    return {
        restrict: 'E',
        scope: {
            service: '=',
            blockId: '=?'
        },
        require: '^propertiesContext',
        template: template,
        link: function ($scope, $element, $attributes) {
            $log.log('previewPanel link');

            let previewBlocks = [];

            $scope.ready = false;
            $scope.filtered = [];

            $scope.search = { query: '' };

            $scope.generateText = function (text) {
                const content = text.join(' ');
                const markup = "<speak><p>" + content + "</p></speak>";

                _copyToClipboard(markup);
                AlertService.addInfo("Copied [" + markup + "]" + " to clipboard.");
            };

            _init();

            $scope.gotoBlock = function(block)
            {
                $window.scrollTo(0,0);
                $state.go('convoworks-editor-service.editor', { sv: (block.is_fragment ? 'fragments' : 'steps'), sb: block.data.block_id });
            }

            $scope.parseText = function(text)
            {
                if ( !text) {
                    return '';
                }
                return text.map(t => {
                    let text = t.text || t;

                    // parse XML like syntax
                    text = text.replace(/<.[^(><.)]+>/gm, (t) => '<span class="monospace">' + $sce.trustAsHtml(t.replace(/[\u00A0-\u9999<>\&]/gim, (i) => '&#' + i.charCodeAt(0) + ';')) + '</span>');
                    // parse ${} syntax
                    text = text.replace(/\${.*?}/gm, '<span class="monospace">$&</span>');

                    return text;
                }).join('<br>');
            }

            $scope.isCustomIntent = function(intent) {
                return $scope.service.intents.findIndex(i => i.name === intent) > -1;
            }

            $scope.navigateToIntent = function(intent) {
                $state.go('convoworks-editor-service.intent-details', { name: intent.name });
            }

            // PRIVATE

            function _init() {
                var promise;

                if ($scope.blockId !== null && $scope.blockId !== undefined && $scope.blockId !== '') {
                    promise = ConvoworksApi.getBlockPreview($scope.service.service_id, $scope.blockId);
                } else {
                    promise = ConvoworksApi.getServicePreview($scope.service.service_id);
                }

                promise.then(function (preview) {
                    previewBlocks = preview.blocks.filter(b => b.data.sections.length > 0);

                    $scope.filtered = angular.copy(previewBlocks);

                    $scope.$watch('search.query', function(value) {
                        if (!value || value === '') {
                            $scope.filtered = angular.copy(previewBlocks);
                        } else {
                            let name_matched = false;

                            $scope.$applyAsync(() => {
                                $scope.filtered = angular.copy(previewBlocks).filter(b => {
                                    const lowercase_query = value.toLowerCase();

                                    if (b.data.block_name.toLowerCase().includes(lowercase_query)) {
                                        name_matched = true;
                                        return true;
                                    }

                                    return _getFlatText(b).toLowerCase().includes(lowercase_query);
                                }).map(block => {
                                    if (name_matched) {
                                        return block;
                                    }

                                    let b = block;

                                    b.data.sections = block.data.sections.map(section => {
                                        let s = section;

                                        s.utterances = section.utterances.filter(utterance => utterance.text.join(' ').toLowerCase().includes(value.toLowerCase()));

                                        return s;
                                    }).filter(section => section.utterances.length > 0);

                                    return b;
                                });
                            });
                        }
                    });

                    $scope.ready = true;
                }, function (reason) {
                    $log.error('previewPanel could not get service preview, reason', reason);
                });
            }

            function _getFlatText(block) {
                return block.data.sections
                    .flatMap(section => section.utterances)
                    .flatMap(utterance => utterance.text)
                    .reduce((prev, curr) => { return prev + ' ' + curr }, '');
            }

            function _copyToClipboard(text) {
                // Create new element
                var el = document.createElement('textarea');
                // Set value (string to be copied)
                el.value = text;
                // Set non-editable to avoid focus and move outside of view
                el.setAttribute('readonly', '');
                el.style = {position: 'absolute', left: '-9999px'};
                document.body.appendChild(el);
                // Select text inside element
                el.select();
                // Copy text to clipboard
                document.execCommand('copy');
                // Remove temporary element
                document.body.removeChild(el);
            }
        }
    }
};
