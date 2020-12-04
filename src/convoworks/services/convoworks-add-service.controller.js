/* @ngInject */
export default function ConvoworksAddNewServiceController($scope, $state, ConvoworksApi)
{
    $scope.new_service = {
        "name" : "",
        "default_language" : "en",
        "is_private" : false,
        "template_id" : "convo-core.blank"
    };

    $scope.templates = [];

    ConvoworksApi.getTemplates().then(function (all) {
        $scope.templates = all;
    });

    ConvoworksApi.getConfigOptions().then(function (options) {
        $scope.languages = options['CONVO_SERVICE_LANGUAGES'];
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
        ConvoworksApi.createService(
            $scope.new_service.name,
            $scope.new_service.default_language,
            $scope.new_service.is_private,
            $scope.new_service.template_id
        ).then(function(data) {
            $state.go('convoworks-editor-service.editor', { service_id : data['service_id']});
        })
    };

    $scope.submitDisabled = function()
    {
        if (!$scope.new_service.name) {
            return true;
        }

        return $scope.new_service.name.length === 0 || $scope.new_service.name.length > 50;
    }
}
