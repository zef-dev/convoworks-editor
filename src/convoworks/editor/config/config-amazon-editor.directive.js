import template from './config-amazon-editor.tmpl.html';

/* @ngInject */
export default function configAmazonEditor($log, $q, $rootScope, $window, ConvoworksApi, LoginService, AlertService) {
    return {
        restrict: 'E',
        scope: { service: '=' },
        template: template,
        controller: function ($scope) {
            'ngInject';
        },
        link: function ($scope, $element, $attributes) {
            var config_options = {};
            var user    =   null;
            $scope.service_language    =   'en';
            $scope.supported_locales    =   ['en-US'];
            $scope.default_locale    =   'en-US';
            $scope.owner    =   '';
            let service_language = 'en';
            let default_invocation = null;
            $scope.service_language = 'en';

            LoginService.getUser().then( function ( u) {
                user = u;
            });

            ConvoworksApi.getServiceMeta($scope.service.service_id).then( function (serviceMeta) {
                service_language = serviceMeta['default_language'];
                $scope.service_language = service_language;

                default_invocation = serviceMeta['name'];

                const serviceLanguage = serviceMeta['default_locale'];
                $scope.supported_locales = serviceMeta['supported_locales'];
                $scope.default_locale = serviceMeta['default_locale'];
                $scope.owner = serviceMeta['owner'];
                $scope.service_language = serviceLanguage.replace("-", "_");
            });

            $scope.config = {
                mode: 'manual',
                invocation: default_invocation || $scope.service.name,
                app_id: null,
                interaction_model_sensitivity: 'LOW',
                endpoint_ssl_certificate_type: 'Wildcard',
                self_signed_certificate: null,
                auto_display: false,
                skill_preview_in_store: {
                    public_name: _invocationToName($scope.service.name),
                    one_sentence_description: _invocationToName($scope.service.name),
                    detailed_description: _invocationToName($scope.service.name),
                    whats_new: '',
                    example_phrases: "Alexa, open " + $scope.service.name,
                    small_skill_icon: '',
                    large_skill_icon: '',
                    category: "ALARMS_AND_CLOCKS",
                    keywords: '',
                    privacy_policy_url: '',
                    terms_of_use_url: ''
                },
                privacy_and_compliance: {
                    allows_purchases: false,
                    uses_personal_info: false,
                    is_child_directed: false,
                    contains_ads: false,
                    is_export_compliant: true,
                    testing_instructions: "N/A",
                }
            };

            $scope.gettingSkillManifest = false;
            $scope.keywordsLength = 0;

            var configBak   =   angular.copy( $scope.config);
            var is_new      =   true;
            var is_error    =   false;
            var preparedUpload = new Map();
            var previousMediaItemId = new Map();
            var fileBytesSmallIcon = '';
            var fileBytesLargeIcon = '';
            var logline     =   '';

            _load();

            $scope.gotoConfigUrl = function() {
                $window.open('https://developer.amazon.com/alexa/console/ask/publish/alexapublishing/' + $scope.config.app_id + '/development/'+$scope.service_language+'/skill-info', '_blank');
            }

            $scope.isModeValid  = function () {
                return !( $scope.config.mode === 'auto' && !user.amazon_account_linked);
            }

            $scope.isNew    = function () {
                return is_new;
            }

            $scope.onFileUpload = function (file, type) {
                $log.log('ConfigurationsEditor onFileUpload file', file);
                previousMediaItemId.set('certificate', $scope.config.self_signed_certificate);
                previousMediaItemId.set('small_skill_icon', $scope.config.skill_preview_in_store.small_skill_icon);
                previousMediaItemId.set('large_skill_icon', $scope.config.skill_preview_in_store.large_skill_icon);

                if (file) {
                    var image = new Image();
                    if (type === 'certificate') {
                        if (!file.name.includes('.pem')) {
                            AlertService.addDanger(`Invalid file extension in ${file.name}. It must be .pem!`);
                        }
                        preparedUpload.set('amazon.self_signed_certificate', file);
                        $scope.config.self_signed_certificate = 'tmp_certificate_upload_ready';
                    } else if (type === 'small_skill_icon') {
                        if (!file.name.includes('.png')) {
                            AlertService.addDanger(`Invalid file extension in ${file.name}. It must be .png!`);
                        }
                        preparedUpload.set('amazon.small_skill_icon', file);
                        $scope.config.skill_preview_in_store.small_skill_icon = 'tmp_small_skill_icon_upload_ready';

                        fileBytesSmallIcon = URL.createObjectURL(file);
                        image.src = fileBytesSmallIcon;
                    } else if (type === 'large_skill_icon') {
                        if (!file.name.includes('.png')) {
                            AlertService.addDanger(`Invalid file extension in ${file.name}. It must be .png!`);
                        }
                        preparedUpload.set('amazon.large_skill_icon', file);
                        $scope.config.skill_preview_in_store.large_skill_icon = 'tmp_large_skill_icon_upload_ready';

                        fileBytesLargeIcon = URL.createObjectURL(file);
                        image.src = fileBytesLargeIcon;
                    }

                    if (image.src !== '') {
                        image.onload = () => {
                            let errorReport = "";
                            if (type === 'small_skill_icon') {
                                if (image.height !== 108 && image.width !== 108) {
                                    preparedUpload.delete('amazon.small_skill_icon');
                                    errorReport = `Invalid image size of ${file.name}. Actual image size is ${image.width} X ${image.width}. It should be 108 X 108.`;
                                    $scope.config.skill_preview_in_store.small_skill_icon = '';
                                    $scope.$apply();
                                }
                            } else if (type === 'large_skill_icon') {
                                if (image.height !== 512 && image.width !== 512) {
                                    preparedUpload.delete('amazon.large_skill_icon');
                                    errorReport = `Invalid image size of ${file.name}. Actual image size is ${image.width} X ${image.width}. It should be 512 X 512.`;
                                    $scope.config.skill_preview_in_store.large_skill_icon = '';
                                    $scope.$apply();
                                }
                            }
                            if (errorReport !== '') {
                                AlertService.addDanger(`Invalid image size of ${file.name}. Actual image size is ${image.width} X ${image.width}. It should be 512 X 512.`);
                            }
                            URL.revokeObjectURL(file);
                        }
                    }
                }
            }

            $scope.getSelfSignedSslCertificate = function(type) {
                var mediaItemId = $scope.config[type];

                if (!mediaItemId) {
                    return '';
                }

                if (mediaItemId === 'tmp_upload_ready') {
                    mediaItemId = previousMediaItemId.get("certificate");
                }

                return mediaItemId;
            }

            $scope.getSkillIcon = function(type) {
                var mediaItemId = $scope.config.skill_preview_in_store[type];


                if (!mediaItemId) {
                    return '';
                }

                if (mediaItemId === previousMediaItemId.get('small_skill_icon') && type === 'small_skill_icon') {
                    mediaItemId = previousMediaItemId.get('small_skill_icon');
                } else if (mediaItemId === previousMediaItemId.get('large_skill_icon') && type === 'large_skill_icon') {
                    mediaItemId = previousMediaItemId.get('large_skill_icon');
                }

                if (mediaItemId === 'tmp_small_skill_icon_upload_ready' && type === 'small_skill_icon') {
                    return fileBytesSmallIcon;
                } else if (mediaItemId === 'tmp_large_skill_icon_upload_ready' && type === 'large_skill_icon') {
                    return fileBytesLargeIcon;
                } else if (new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(mediaItemId)) {
                    return mediaItemId;
                } else {
                    return ConvoworksApi.downloadMedia($scope.service.service_id, mediaItemId);
                }
            }

            $scope.updateConfig = function (isValid) {
                if (!isValid) {
                    throw new Error(`Invalid form data.`)
                }
                $log.debug('configAmazonEditor update() $scope.config', $scope.config);
                _updateSelectedInterfaces();

                var maybeUpload = preparedUpload.size > 0 ?
                    ConvoworksApi.uploadMedia(
                        $scope.service.service_id,
                        preparedUpload.entries()) :
                    null;

                $q.when(maybeUpload).then(function (res) {
                    if (res && res.length > 0) {

                        for(var i = 0; i < res.length; i++) {
                            const width = res[i].imageWidth;
                            const height = res[i].imageHeight;

                            if (width === 108 && height === 108) {
                                $scope.config.skill_preview_in_store.small_skill_icon = res[i].mediaItemId;
                            } else if (width === 512 && height === 512) {
                                $scope.config.skill_preview_in_store.large_skill_icon = res[i].mediaItemId;
                            } else if (width === null && height === null ) {
                                $scope.config.self_signed_certificate = res[i].mediaItemId;
                            }
                        }

                        preparedUpload.clear();
                    }
                    _setIsChildDirected();
                    $scope.validateKeywords(false);
                    if ( is_new) {
                        return ConvoworksApi.createServicePlatformConfig( $scope.service.service_id, 'amazon', $scope.config).then(function (data) {
                            configBak = angular.copy( $scope.config);
                            is_new      =   false;
                            is_error    =   false;
                            $scope.config.app_id = data.app_id;
                            AlertService.addSuccess(`Service ${$scope.service.service_id} was linked successfully with Amazon.`);
                            $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                        }, function ( response) {
                            $log.debug('configAmazonEditor create() response', response);
                            is_error    =   true;
                            throw new Error(`Can't create config for Amazon. ${response.data.message.message || ''} ${response.data.message.details || '' }`)
                        });
                    } else {
                        return ConvoworksApi.updateServicePlatformConfig( $scope.service.service_id, 'amazon', $scope.config).then(function (data) {
                            configBak = angular.copy( $scope.config);
                            is_error    =   false;
                            AlertService.addSuccess('Amazon config updated.');
                            $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                        }, function ( response) {
                            $log.debug('configAmazonEditor update() response', response);
                            is_error    =   true;
                            throw new Error(`Can't update config for Amazon. ${response.data.message.message || ''} ${response.data.message.details || '' }`);
                        });
                    }
                }).then(function (data) {
                    configBak = angular.copy($scope.config);
                    is_error = false;
                    $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                }, function (response) {
                    $log.debug(logline, response);
                    is_error = true;
                });
            }



            $scope.revertConfig = function () {
                $scope.config = angular.copy(configBak);
                if (preparedUpload.size > 0) {
                    preparedUpload.clear();
                }
            }


            $scope.isConfigChanged = function () {
                return !angular.equals( configBak, $scope.config);
            }

            $scope.getAlexaInterfaces = function () {
                // update array with values from config
                if ($scope.config.interfaces && $scope.config.interfaces.length > 0) {
                    for (var i = 0; i < $scope.interfaces.length; i++) {
                        if ($scope.config.interfaces.includes($scope.interfaces[i].type)) {
                            $scope.interfaces[i].checked = true;
                        }
                    }
                }

                return $scope.interfaces;
            };

            $scope.validateKeywords = function(validateForm = true) {
                const words = $scope.config.skill_preview_in_store.keywords.replace(/\s/g, ',').replace(/[0-9]/g, "");
                let length = words.split(',').length;
                if (words === '') {
                    length = 0;
                }
                const invalid = length > 30;
                $scope.keywordsLength = length;

                if (validateForm) {
                    $scope.amazonPlatformConfigForm.skill_preview_in_store_keywords.$invalid = invalid;
                    $scope.amazonPlatformConfigForm.$invalid = invalid;
                    $scope.config.skill_preview_in_store.keywords = words;
                }
            }

            $scope.getSkillManifest = function () {
                $scope.gettingSkillManifest = true;
                ConvoworksApi.getExistingAlexaSkill($scope.owner, $scope.config.app_id).then(function (res) {
                    if (res.manifest.publishingInformation) {
                        if (res.manifest.publishingInformation.locales) {
                            if (res.manifest.publishingInformation.locales[$scope.default_locale] ) {
                                $scope.config.skill_preview_in_store.public_name = res.manifest.publishingInformation.locales[$scope.default_locale].name;
                                $scope.config.skill_preview_in_store.one_sentence_description = res.manifest.publishingInformation.locales[$scope.default_locale].summary;
                                $scope.config.skill_preview_in_store.detailed_description = res.manifest.publishingInformation.locales[$scope.default_locale].description;
                                $scope.config.skill_preview_in_store.whats_new = res.manifest.publishingInformation.locales[$scope.default_locale].updatesDescription ?? '';
                                $scope.config.skill_preview_in_store.example_phrases = res.manifest.publishingInformation.locales[$scope.default_locale].examplePhrases.join(';');
                                $scope.config.skill_preview_in_store.small_skill_icon = res.manifest.publishingInformation.locales[$scope.default_locale].smallIconUri ?? '';
                                $scope.config.skill_preview_in_store.large_skill_icon = res.manifest.publishingInformation.locales[$scope.default_locale].largeIconUri ?? '';
                                $scope.config.skill_preview_in_store.keywords = res.manifest.publishingInformation.locales[$scope.default_locale].keywords.join(',');

                                if (res.manifest.privacyAndCompliance) {
                                    $scope.config.skill_preview_in_store.terms_of_use_url = res.manifest.privacyAndCompliance.locales[$scope.default_locale].termsOfUseUrl;
                                    $scope.config.skill_preview_in_store.privacy_policy_url = res.manifest.privacyAndCompliance.locales[$scope.default_locale].privacyPolicyUrl;

                                    $scope.config.privacy_and_compliance.allows_purchases = res.manifest.privacyAndCompliance.allowsPurchases ?? false;
                                    $scope.config.privacy_and_compliance.uses_personal_info = res.manifest.privacyAndCompliance.usesPersonalInfo ?? false;
                                    $scope.config.privacy_and_compliance.is_child_directed = res.manifest.privacyAndCompliance.isChildDirected ?? false;
                                    $scope.config.privacy_and_compliance.contains_ads = res.manifest.privacyAndCompliance.containsAds ?? false;
                                    $scope.config.privacy_and_compliance.is_export_compliant = res.manifest.privacyAndCompliance.isExportCompliant ?? true;

                                    $scope.config.privacy_and_compliance.testing_instructions = res.manifest.publishingInformation.testingInstructions ?? 'N/A';
                                } else {
                                    AlertService.addWarning("Privacy and Compliance is missing. Terms of Use URL, Privacy Policy URL, and the entire Privacy and Compliance Section won't be changed.");
                                }
                                AlertService.addSuccess("Fields were saved successfully.");
                            } else {
                                $scope.gettingSkillManifest = false;
                                throw new Error(`The selected default locale [${$scope.default_locale}] does no exist in skill manifest. Please change your default locale to on of the available locales [${Object.keys(res.manifest.publishingInformation.locales)}] and try later again.`);
                            }
                        }
                    }
                    $scope.gettingSkillManifest = false;
                }).catch(function () {
                    $scope.gettingSkillManifest = false;
                    throw new Error(`Can't get skill manifest for provided Alexa Skill ID "${$scope.config.app_id}"`);
                });
            }

            $scope.onCategoryChange = function () {
                _setIsChildDirected(true);
            };

            function _updateSelectedInterfaces() {
                $scope.config.interfaces = [];
                for (var i = 0; i < $scope.interfaces.length; i++) {
                    if ($scope.interfaces[i].checked && $scope.interfaces[i].supported) {
                        var interfaceType = $scope.interfaces[i].type;
                        $scope.config.interfaces.push(interfaceType);
                    }
                }
            }

            function _arrayRemove(arr, value) {
                return arr.filter(function(ele) {
                    return ele !== value;
                });
            }

            $scope.registerChange = function(itfRecord) {
                var eventName = itfRecord.itf.type;
                var isInterfaceEnabled = !itfRecord.itf.checked;
                var newArr = [];

                if (isInterfaceEnabled) {
                    if ($scope.config.interfaces === undefined) {
                        newArr.push(eventName);
                        $scope.config.interfaces = newArr;
                    } else {
                        $scope.config.interfaces.push(eventName);
                    }
                } else {
                    if ($scope.config.interfaces === undefined) {
                        $scope.config.interfaces = _arrayRemove(newArr, eventName);
                    } else {
                        $scope.config.interfaces = _arrayRemove($scope.config.interfaces, eventName);
                    }
                }
                $scope.getAlexaInterfaces();
            }

            function _load()
            {
                ConvoworksApi.getConfigOptions().then(function (options) {
                    config_options = options;

                    $scope.languages = config_options['CONVO_AMAZON_LANGUAGES'];
                    $scope.sensitivities = config_options['CONVO_AMAZON_INTERACTION_MODEL_SENSITIVITIES'];
                    $scope.endpointCertificateTypes = config_options['CONVO_AMAZON_SKILL_ENDPOINT_SSL_CERTIFICATE'];
                    $scope.categories = config_options['CONVO_AMAZON_SKILL_CATEGORIES'];
                    $scope.interfaces = config_options['CONVO_ALEXA_INTERFACES'];

                    $scope.$watch('config.auto_display', function(newVal) {
                        if (newVal !== undefined)
                        {
                            // $log.log('configAmazonEditor $watch config.auto_display new value', $scope.config);
                            $scope.config.auto_display = newVal;
                        }
                    });

                    $scope.$watch('config.interaction_model_sensitivity', function(newInteractionModelSensitivity) {
                        if (newInteractionModelSensitivity !== undefined) {
                            $scope.config.interaction_model_sensitivity = newInteractionModelSensitivity;
                        }
                    });

                    $scope.$watch('config.endpoint_ssl_certificate_type', function(newEndpointSslCertificateType) {
                        if (newEndpointSslCertificateType !== undefined) {
                            $scope.config.endpoint_ssl_certificate_type = newEndpointSslCertificateType;
                        }
                    });

                    ConvoworksApi.getServicePlatformConfig( $scope.service.service_id, 'amazon').then(function (data) {
                        $scope.config = data;
                        _setIsChildDirected();
                        $scope.validateKeywords(false);
                        configBak = angular.copy( $scope.config);
                        is_new  =   false;
                        is_error    =   false;
                    }, function ( response) {
                        $log.debug('configAmazonEditor loadPlatformConfig() response', response);

                        if ( response.status === 404) {
                            is_new      =   true
                            is_error    =   false;
                            return;
                        }
                        is_error    =   true;
                    });
                })
            }

            function _invocationToName(str) {
                return (str + '').replace(/^(.)|\s+(.)/g, function ($1) {
                    return $1.toUpperCase()
                })
            }

            function _setIsChildDirected(notifyChange = false) {
                if ($scope.config.skill_preview_in_store.category && $scope.config.skill_preview_in_store.category.toLowerCase().includes('child')) {
                    $scope.config.privacy_and_compliance.is_child_directed = true;

                    if (notifyChange) {
                        AlertService.addInfo("Question related to is child directed is answered in yes. Please review the Privacy and Compliance section.");
                    }
                }
            }

        }
    }
}
