/* @ngInject */
export default function ConvoworksAddNewServiceController($log, $scope, $state, ConvoworksApi)
{
    $scope.new_service = {
        "name" : "",
        "default_language" : "en",
        "default_locale" : "en-US",
        "supported_locales": ['en-US'],
        "is_private" : false,
        "template_id" : "convo-core.blank"
    };

    $scope.templates = [];
    $scope.languages = [];
    $scope.locales = [];

    ConvoworksApi.getTemplates().then(function (all) {
        $scope.templates = all;
    });

    ConvoworksApi.getConfigOptions().then(function (options) {
        $scope.languages = options['CONVO_SERVICE_LANGUAGES'];
        $scope.locales = options['CONVO_SERVICE_LOCALES'].filter(function (locale) {
            return locale.code.includes($scope.new_service.default_language);
        });
    });

    $scope.isTemplateSelected = function(template_id)
    {
        return $scope.new_service.template_id === template_id;
    }

    $scope.getTemplateNamespace = function (templateId)
    {
        return templateId.split('.')[0];
    }

    $scope.create = function()
    {
        $log.log("new service state", $scope.new_service);

        ConvoworksApi.createService(
            $scope.new_service.name,
            $scope.new_service.default_language,
            $scope.new_service.default_locale,
            $scope.new_service.supported_locales,
            $scope.new_service.is_private,
            $scope.new_service.template_id
        ).then(function(data) {
            $state.go('convoworks-editor-service.editor', { service_id : data['service_id']});
        })
    };

    $scope.onLanguageChange = function () {
        ConvoworksApi.getConfigOptions().then(function (options) {
            if ($scope.new_service.default_language === 'en') {
                $scope.new_service.default_locale = 'en-US';
                $scope.supported_locales = ['en-US'];
                $scope.new_service.supported_locales = $scope.supported_locales;
            }

            $scope.locales = options['CONVO_SERVICE_LOCALES'].filter(function (locale) {
                return locale.code.includes($scope.new_service.default_language);
            });

            $log.log("new service state", $scope.new_service);
        });
    }

    $scope.onDefaultLocaleChange = function () {
        $scope.new_service.supported_locales = [];
        $scope.new_service.supported_locales.push($scope.new_service.default_locale);

        for (var i = 0; i < $scope.locales.length; i++) {
            if ($scope.new_service.supported_locales.includes($scope.locales[i].code)) {
                $scope.locales[i].checked = true;
            } else {
                $scope.locales[i].checked = false;
            }
        }

        $log.log("new service state", $scope.new_service);
    }

    $scope.registerChange = function(data) {
        var localeCode = data.locale.code;
        var isLocaleEnabled = !data.locale.checked;

        if (isLocaleEnabled) {
            $scope.new_service.supported_locales.push(localeCode);
        } else {
           $scope.new_service.supported_locales = _arrayRemove($scope.new_service.supported_locales, localeCode);
        }

        $log.log("new service state", $scope.new_service);
    }

    function _arrayRemove(array, value) {
        return array.filter(function(elementOfArray) {
            return elementOfArray !== value;
        });
    }

    $scope.submitDisabled = function()
    {
        if (!$scope.new_service.name) {
            return true;
        }

        return $scope.new_service.name.length === 0 || $scope.new_service.name.length > 50;
    }
}
