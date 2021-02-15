import JSONFormatter from 'json-formatter-js';
import template from './json-formatter.tmpl.html';

/* @ngInject */
export default function jsonFormatter($log, $timeout) {
    return {
        restrict: 'E',
        scope: { 'data': '=' },
        template,
        link: function ($scope, $element, $attributes) {
            let original = angular.copy($scope.data);
            let toRender = angular.copy($scope.data);

            $scope.search = { query: '' };

            $scope.$watch('data', (value) => {
                if (!value) {
                    value = {};
                }

                original = angular.copy(value);
                _render(original);
            }, true);

            $scope.$watch('search.query', function (value) {
                if (!value || value === '') {
                    _render(original);
                } else {
                    applyFilter();
                }
            });

            // FILTER BY SEARCH
            let filter_timeout = null;
            function applyFilter() {
                if (filter_timeout) {
                    $timeout.cancel(filter_timeout);
                }

                filter_timeout = $timeout(function () {
                    let data = angular.copy(original);

                    if ($scope.search.query) {
                        data = _filter(data);
                        _render(data);
                    }
                }, 300);
            }

            function _filter(el) {
                if (angular.isArray(el)) {
                    return _filterArray(el);
                }

                if (angular.isObject(el)) {
                    return _filterObject(el);
                }

                return _filterString(el);
            }

            function _filterArray(el) {
                let filtered = [];
                angular.forEach(el, function (value) {
                    let filtered_child = _filter(value);
                    if (!_isEmpty(filtered_child)) {
                        filtered.push(filtered_child);
                    }
                });
                return filtered;
            }

            function _filterObject(obj) {
                let filtered = {};
                for (let i in obj) {
                    let key = _filterString(i);

                    if (key) {
                        // key match - give all
                        filtered[i] = obj[i];
                    }
                    else {
                        let filtered_child = _filter(obj[i]);

                        if (!_isEmpty(filtered_child)) {
                            filtered[i] = filtered_child;
                        }
                    }
                }
                return filtered;
            }

            function _filterString(original) {
                let text = original.toString().toLowerCase();
                let search = $scope.search.query.toLowerCase();

                if (!text.includes(search)) {
                    return null;
                }
                return original;
            }

            function _isEmpty(el) {
                if (!el) {
                    return true;
                }
                if (angular.isArray(el)) {
                    return el.length == 0;
                }

                if (angular.isObject(el)) {
                    for (let i in el) {
                        return false;
                    }
                    return true;
                }
                return false;
            }

            function _render(value)
            {
                if (!value) {
                    value = {};
                }

                toRender = angular.copy(value);

                const formatter = new JSONFormatter(toRender, Infinity);
                const container = $element.find("#container");

                container.empty();
                container.append(formatter.render());
            }
        }
    }
}