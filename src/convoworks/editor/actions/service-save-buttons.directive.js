import template from './service-save-buttons.tmpl.html';

/* @ngInject */
export default function serviceSaveButtons($log) {
    return {
        restrict: 'E',
        template,
        scope: false,
        require: '^propertiesContext',
        link: function ($scope, $element, $attributes, propertiesContext) {
            $log.log('serviceSaveButtons linked');

            $scope.loading = false;

            $scope.saveChanges = () => {
                $log.log('serviceSaveButtons saving changes');
                $scope.loading = true;

                propertiesContext.saveChanges().then(() => {
                    $log.log('serviceSaveButtons changes saved');
                    $scope.loading = false;
                })
            }

            $scope.isServiceChanged = propertiesContext.isServiceChanged;
        }
    }
}