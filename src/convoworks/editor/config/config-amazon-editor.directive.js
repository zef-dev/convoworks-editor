import template from './config-amazon-editor.tmpl.html';

/* @ngInject */
export default function configAmazonEditor($log, $q, $rootScope, $window, ConvoworksApi, LoginService, AlertService, NotificationsService, CONVO_PUBLIC_API_BASE_URL) {
    return {
        restrict: 'E',
        scope: { service: '=', meta: '=' },
        template: template,
        controller: function ($scope) {
            'ngInject';
        },
        link: function ($scope, $element, $attributes) {
            var config_options = {};
            var ready = false;
            var promises = [];
            var user    =   null;
            $scope.service_language    =   'en';
            $scope.supported_locales    =   ['en-US'];
            $scope.default_locale    =   'en-US';
            $scope.owner    =   '';
            let service_language = 'en';
            let default_invocation = null;
            let service_urls = null;
            let system_urls = null;
            $scope.service_language = 'en';

            $scope.loading = false;

            promises.push(
                LoginService.getUser().then( function ( u) {
                    user = u;
                })
            );

            promises.push(
                ConvoworksApi.getServiceUrls($scope.service.service_id).then(function (response) {
                    service_urls = response.amazon;
                    $scope.account_linking_modes = service_urls.accountLinkingModes;
                    $scope.allowed_return_urls_for_login_with_amazon = service_urls.allowedReturnUrlsForLoginWithAmazon;
                }),
                ConvoworksApi.getSystemUrls().then(function (response) {
                    system_urls = response;
                })
            );

            promises.push(ConvoworksApi.getServiceMeta($scope.service.service_id).then( function (serviceMeta) {
                service_language = serviceMeta['default_language'];
                $scope.service_language = service_language;

                default_invocation = serviceMeta['name'];

                const serviceLanguage = serviceMeta['default_locale'];
                $scope.supported_locales = serviceMeta['supported_locales'];
                $scope.default_locale = serviceMeta['default_locale'];
                $scope.owner = serviceMeta['owner'];
                $scope.service_language = serviceLanguage.replace("-", "_");
            }));

            $scope.config = {
                mode: 'auto',
                upload_own_skill_icons: false,
                invocation: default_invocation || $scope.meta.name,
                app_id: null,
                interaction_model_sensitivity: 'LOW',
                endpoint_ssl_certificate_type: 'Wildcard',
                self_signed_certificate: null,
                auto_display: false,
                enable_account_linking: false,
                account_linking_mode: 'installation',
                permissions: [],
                account_linking_consent_page_uri: "",
                account_linking_config: {
                    skip_on_enablement: true,
                    authorization_url: "",
                    access_token_url: "",
                    client_id: "",
                    alternative_authorization_uri_path: "",
                    client_secret: "",
                    scopes: "",
                    domains: "",
                },
                skill_preview_in_store: {
                    public_name: _invocationToName($scope.meta.name),
                    one_sentence_description: _invocationToName($scope.meta.name),
                    detailed_description: _invocationToName($scope.meta.name),
                    whats_new: '',
                    example_phrases: "Alexa, open " + $scope.meta.name,
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
                },
                availability: {
                    automatic_distribution: $scope.supported_locales.length > 1,
                },
                time_created: 0,
                time_updated: 0
            };

            $scope.gettingSkillManifest = false;
            $scope.gettingSkillAccountLinkingInformation = false;
            $scope.keywordsLength = 0;
            $scope.secretFieldType = 'password'
            $scope.showCertificate = false
            $scope.account_linking_modes = [];
            $scope.allowed_return_urls_for_login_with_amazon = [];
            $scope.amazonSkillAccountLinkingScopes = [];
            $scope.invalidInvocation = false;

            var configBak   =   angular.copy( $scope.config);
            var is_new      =   true;
            var is_error    =   false;
            var preparedUpload = new Map();
            var previousMediaItemId = new Map();
            var fileBytesSmallIcon = '';
            var fileBytesLargeIcon = '';
            var logline     =   '';

            _load();

            $q.all(promises).then(function(data) {
                $log.log('configAmazonEditor all done', data);
                ready = true;
            }, function (reason) {
                $log.log('configAmazonEditor all rejected, reason', reason);
                ready = false;
            })

            $scope.gotoConfigUrl = function() {
                $window.open('https://developer.amazon.com/alexa/console/ask/publish/alexapublishing/' + $scope.config.app_id + '/development/'+$scope.service_language+'/skill-info', '_blank');
            }

            $scope.gotoLwaConsoleUrl = function() {
                $window.open('https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html', '_blank');
            }

            $scope.gotoLearnHowToCreateSelfSignedCertificate = function() {
                $window.open('https://developer.amazon.com/en-US/docs/alexa/custom-skills/configure-web-service-self-signed-certificate.html', '_blank');
            }

            $scope.isModeValid  = function () {
                return !( $scope.config.mode === 'auto' && ready && !user.amazon_account_linked);
            }

            $scope.isScopesValid  = function () {
                return $scope.config.account_linking_config.scopes.length > 0;
            }

            $scope.isNew    = function () {
                return is_new;
            }

            $scope.hasChangedToAutoMode    = function () {
                return !is_new && configBak.mode === 'auto';
            }

            $scope.isAllowedReturnUrlsValid = function () {
                let isValid = false;
                for (const allowedReturnUrl of $scope.allowed_return_urls_for_login_with_amazon) {
                    const url = new URL(allowedReturnUrl);
                    const urlPathName = url.pathname;
                    const urlPathNameArray = urlPathName.split('/');
                    const vendorId = urlPathNameArray[urlPathNameArray.length - 1];
                    if (vendorId !== '') {
                        isValid = true;
                    }
                }

                return isValid;
            }

            $scope.onFileUpload = function (file, type) {
                $log.log('ConfigurationsEditor onFileUpload file', file);

                if (file) {
                    var image = new Image();
                    const allowedImageTypes = ['image/png'];
                    if (type === 'certificate') {
                        if (!file.name.endsWith('.pem')) {
                            AlertService.addDanger(`Invalid file extension in ${file.name}. It must be .pem!`);
                            return;
                        }
                        const reader = new FileReader();
                        reader.readAsText(file, "UTF-8");
                        reader.onload = function (evt) {
                            $scope.showCertificate = false;
                            $scope.config.self_signed_certificate = evt.target.result;
                            $scope.$apply();
                        }
                        reader.onerror = function (evt) {
                            $scope.showCertificate = false;
                            $scope.config.self_signed_certificate = null;
                            $scope.$apply();
                        }
                    } else if (type === 'small_skill_icon') {
                        if (!allowedImageTypes.includes(file.type)) {
                            AlertService.addDanger(`Invalid file type ${file.type} of ${file.name}. It must be image/png!`);
                            $scope.config.skill_preview_in_store.small_skill_icon = previousMediaItemId.get('small_skill_icon') ?? '';
                            return;
                        }
                        preparedUpload.set('amazon.small_skill_icon', file);
                        $scope.config.skill_preview_in_store.small_skill_icon = 'tmp_small_skill_icon_upload_ready';

                        fileBytesSmallIcon = URL.createObjectURL(file);
                        image.src = fileBytesSmallIcon;
                    } else if (type === 'large_skill_icon') {
                        if (!allowedImageTypes.includes(file.type)) {
                            AlertService.addDanger(`Invalid file type ${file.type} of ${file.name}. It must be image/png!`);
                            $scope.config.skill_preview_in_store.large_skill_icon = previousMediaItemId.get('large_skill_icon') ?? '';
                            return;
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
                                    $scope.config.skill_preview_in_store.small_skill_icon = previousMediaItemId.get('small_skill_icon') ?? '';
                                    $scope.$apply();
                                }
                            } else if (type === 'large_skill_icon') {
                                if (image.height !== 512 && image.width !== 512) {
                                    preparedUpload.delete('amazon.large_skill_icon');
                                    errorReport = `Invalid image size of ${file.name}. Actual image size is ${image.width} X ${image.width}. It should be 512 X 512.`;
                                    $scope.config.skill_preview_in_store.large_skill_icon = previousMediaItemId.get('large_skill_icon') ?? '';
                                    $scope.$apply();
                                }
                            }
                            if (errorReport !== '') {
                                AlertService.addDanger(errorReport);
                                NotificationsService.addDanger('File upload error', errorReport);
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
                    mediaItemId = previousMediaItemId.get('small_skill_icon') ?? '';
                } else if (mediaItemId === previousMediaItemId.get('large_skill_icon') && type === 'large_skill_icon') {
                    mediaItemId = previousMediaItemId.get('large_skill_icon') ?? '';
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
                $scope.loading = true;

                $scope.secretFieldType = 'password';
                $scope.showCertificate = false;
                if (!isValid) {
                    AlertService.addDanger(`Invalid form data.`)
                }
                $log.debug('configAmazonEditor update() $scope.config', $scope.config);

                var maybeUpload = preparedUpload.size > 0 ?
                    ConvoworksApi.uploadMedia(
                        $scope.service.service_id,
                        preparedUpload.entries()) :
                    null;
                _updateSelectedAmazonSkillAccountLinkingScopes()

                $q.when(maybeUpload).then(function (res) {
                    if (res && res.length > 0) {

                        for(var i = 0; i < res.length; i++) {
                            const width = res[i].imageWidth;
                            const height = res[i].imageHeight;

                            if (width === 108 && height === 108) {
                                $scope.config.skill_preview_in_store.small_skill_icon = res[i].mediaItemId;
                                previousMediaItemId.set('small_skill_icon', res[i].mediaItemId);
                            } else if (width === 512 && height === 512) {
                                $scope.config.skill_preview_in_store.large_skill_icon = res[i].mediaItemId;
                                previousMediaItemId.set('large_skill_icon', res[i].mediaItemId);
                            }
                        }

                        preparedUpload.clear();
                    }
                    _setIsChildDirected();
                    $scope.validateKeywords(false);
                    $scope.validateInvocation(false);
                    if ( is_new) {
                        $scope.prepareDefaultSkillIcons();
                        return ConvoworksApi.createServicePlatformConfig( $scope.service.service_id, 'amazon', $scope.config).then(function (data) {
                            configBak = angular.copy( $scope.config);
                            is_new      =   false;
                            is_error    =   false;
                            $scope.config.app_id = data.app_id;
                            $scope.config.enable_account_linking = data.enable_account_linking || false;
                            $scope.config.upload_own_skill_icons = data.upload_own_skill_icons || false;
                            $scope.config.invocation = data.invocation;
                            $scope.config.time_created = data.time_created;
                            $scope.config.time_updated = data.time_created;
                            if ($scope.config.enable_account_linking) {
                                $scope.config.account_linking_config.skip_on_enablement = data.account_linking_config.skip_on_enablement ?? false;
                                $scope.config.account_linking_config.authorization_url = data.account_linking_config.authorization_url ?? '';
                                $scope.config.account_linking_config.access_token_url = data.account_linking_config.access_token_url ?? '';
                                $scope.config.account_linking_config.client_id = data.account_linking_config.client_id ?? '';
                                $scope.config.account_linking_config.scopes = data.account_linking_config.scopes ?? '';
                                $scope.config.account_linking_config.domains = data.account_linking_config.domains ?? '';
                            }

                            $scope.config.endpoint_ssl_certificate_type = data.endpoint_ssl_certificate_type;
                            if (data.endpoint_ssl_certificate_type === 'SelfSigned') {
                                $scope.config.self_signed_certificate = data.self_signed_certificate
                            }

                            AlertService.addSuccess(`Service ${$scope.service.service_id} was linked successfully with Amazon.`);
                            NotificationsService.addSuccess('Amazon link successful', `Service has been successfully linked with Amazon.`)
                            if (data.warnings !== undefined) {
                                for (let warning of data.warnings) {
                                    AlertService.addWarning(warning.message);
                                }
                            }
                        }, function ( response) {
                            $log.debug('configAmazonEditor create() response', response);
                            is_error    =   true;
                            AlertService.addDanger(`Can't create config for Amazon. ${response.data.message || ''}. ${response.data.details || '' }`)
                            NotificationsService.addDanger('Amazon config creation failed', `${response.data.message || ''}. ${response.data.details || '' }`);
                        });
                    } else {
                        if (!$scope.hasChangedToAutoMode() && $scope.config.mode === 'auto') {
                            return ConvoworksApi.getExistingAlexaSkill($scope.owner, $scope.service.service_id).then(function (res) {
                                if (res.manifest) {
                                    return ConvoworksApi.updateServicePlatformConfig( $scope.service.service_id, 'amazon', $scope.config).then(function (data) {
                                        $scope.config.time_created = data.time_created;
                                        $scope.config.time_updated = data.time_updated;
                                        configBak = angular.copy( $scope.config);
                                        is_error    =   false;
                                        AlertService.addSuccess('Amazon config updated.');
                                    }, function ( response) {
                                        $log.debug('configAmazonEditor update() response', response);
                                        is_error    =   true;
                                        AlertService.addDanger(`Can't update config for Amazon. ${response.data.message || ''}. ${response.data.details || '' }`);
                                        NotificationsService.addDanger('Amazon config update failed', `${response.data.message || ''}. ${response.data.details || '' }`);
                                    });
                                } else {
                                    is_error = true;
                                    AlertService.addDanger(`Provided Service ID could not find a valid Alexa Skill Manifest. Please change your Service ID in manual mode then try again later.`);
                                    NotificationsService.addWarning('No skill manifest found', `No Alexa skill manifest could be found for the given service ID ${$scope.app_id}. Please change the service ID in manual mode and try again.`);
                                }
                            }).catch(function () {
                                is_error = true;
                                AlertService.addDanger(`Your Service ID ${$scope.app_id} is not valid, please change it in manual mode then try later again.`);
                                NotificationsService.addWarning('Invalid Service ID', `Your Service ID ${$scope.app_id} is not valid. Please change it in manual mode then try again.`)
                            });
                        } else {
                            return ConvoworksApi.updateServicePlatformConfig( $scope.service.service_id, 'amazon', $scope.config).then(function (data) {
                                $scope.config.time_created = data.time_created;
                                $scope.config.time_updated = data.time_updated;
                                configBak = angular.copy( $scope.config);
                                is_error    =   false;
                                AlertService.addSuccess('Amazon config updated.');
                            }, function ( response) {
                                $log.debug('configAmazonEditor update() response', response);
                                is_error    =   true;
                                AlertService.addDanger(`Can't update config for Amazon. ${response.data.message || ''}. ${response.data.details || '' }`);
                                NotificationsService.addDanger('Can\'t update Amazon config', `${response.data.message || ''}. ${response.data.details || '' }`);
                            });
                        }

                    }
                }).then(function (response) {
                    if (!is_error) {
                        configBak = angular.copy($scope.config);
                        is_error = false;
                        $log.log('configAmazonEditor updateConfig() then()' + response);
                        $rootScope.$broadcast('ServiceConfigUpdated', {platform_id: 'amazon', platform_config: $scope.config});
                    }
                }, function (response) {
                    $log.debug(logline, response);
                    is_error = true;
                }).finally(() => {
                    $log.log('configAmazonEditor updateConfig() finally()');
                    $scope.loading = false;
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

            $scope.validateInvocation = function(validateForm = true) {
                let invalid = false;

                $log.debug('configAmazonEditor validateInvocation() $scope.config.invocation', $scope.config.invocation);

                if ($scope.config.invocation === undefined) {
                    return invalid;
                }

                const wordCount = $scope.config.invocation.match(/(\w+)/g).length;

                if (wordCount === 2) {
                    invalid = _validateInvocation($scope.forbidden_english_two_words_in_invocation);
                } else {
                    invalid = _validateInvocation($scope.forbidden_english_words_in_invocation);
                }

                if (validateForm) {
                    $scope.amazonPlatformConfigForm.invocation.$invalid = invalid;
                    $scope.amazonPlatformConfigForm.$invalid = invalid;
                    $scope.invalidInvocation = invalid;
                }
            }

            function _validateInvocation(validationContext) {
                let invalid = false;

                const invocationWords = $scope.config.invocation.toLowerCase().split(' ');

                for (const invocationWord of invocationWords) {
                    const trimmedInvocationWord = invocationWord.trim();
                    if (trimmedInvocationWord === '') {
                        continue;
                    }
                    if (validationContext.includes(trimmedInvocationWord)) {
                        invalid = true;
                    }
                }

                return invalid;
            }

            $scope.getSkillManifest = function () {
                $scope.gettingSkillManifest = true;
                ConvoworksApi.getExistingAlexaSkill($scope.owner, $scope.service.service_id).then(function (res) {
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
                                $scope.config.skill_preview_in_store.category = res.manifest.publishingInformation.category;
                                $scope.config.skill_preview_in_store.keywords = res.manifest.publishingInformation.locales[$scope.default_locale].keywords.join(',');
                                if (res.manifest.publishingInformation.automaticDistribution) {
                                    $scope.config.availability.automatic_distribution = res.manifest.publishingInformation.automaticDistribution.isActive;
                                }
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
                                AlertService.addSuccess("Fields were filled successfully.");
                            } else {
                                $scope.gettingSkillManifest = false;
                                AlertService.addDanger(`The selected default locale "${$scope.default_locale}" does not exist in skill manifest.`);
                                //@todo: Add details from `reason` to notification.
                                NotificationsService.addWarning('Missing default locale', `The selected default locale "${$scope.default_locale}" does not exist in skill manifest. Please change your default locale to one of the available locales: ${Object.keys(res.manifest.publishingInformation.locales)}, and try later again.`);
                            }
                        }
                    }
                    $scope.gettingSkillManifest = false;
                }).catch(function (reason) {
                    $log.error('configAmazonEditor getSkillManifest() failed, reason', reason);
                    $scope.gettingSkillManifest = false;
                    AlertService.addDanger(`Can't get skill manifest for provided Alexa Skill ID "${$scope.config.app_id}"`);
                    NotificationsService.addDanger('Can\'t get skill manifest', `Could not get manifest for provided Alexa skill id "${$scope.config.app_id}.`)
                });
            }

            $scope.getSkillAccountLinkingInformation = function () {
                $scope.gettingSkillAccountLinkingInformation = true;
                ConvoworksApi.getExistingAlexaSkillAccountLinkingInformation($scope.owner, $scope.service.service_id).then(function (res) {
                    if (res) {
                        $scope.config.enable_account_linking = true;
                        $scope.config.account_linking_config.skip_on_enablement = res.skipOnEnablement ?? true;
                        $scope.config.account_linking_config.authorization_url = res.authorizationUrl ?? '';
                        $scope.config.account_linking_config.access_token_url = res.accessTokenUrl ?? '';
                        $scope.config.account_linking_config.client_id = res.clientId  ?? '';
                        $scope.config.account_linking_config.scopes = res.scopes ? res.scopes.join(";") : '';
                        $scope.config.account_linking_config.domains = res.domains ? res.domains.join(";") : '';

                        const url = new URL(CONVO_PUBLIC_API_BASE_URL);
                        const installationDomain = url.host;

                        if ($scope.config.account_linking_config.authorization_url.includes(installationDomain)) {
                            $scope.config.account_linking_mode = 'installation';
                        } else if ($scope.config.account_linking_config.authorization_url.includes('amazon.com')) {
                            $scope.config.account_linking_mode = 'amazon';
                        } else {
                            $scope.config.account_linking_mode = 'something_else';
                        }

                        AlertService.addSuccess("Fields were filled successfully.");
                    } else {
                        $scope.config.enable_account_linking = false;
                        AlertService.addDanger(`Can't get skill account linking information for provided Alexa Skill ID "${$scope.config.app_id}" the provided Skill ID is either invalid or account linking has not been set up yet.`);
                        NotificationsService.addDanger('Cannot get account linking information', `Can't get skill account linking information for provided Alexa Skill ID "${$scope.config.app_id}". The provided Skill ID is either invalid or account linking has not been set up yet.`);
                    }
                    $scope.gettingSkillAccountLinkingInformation = false;
                }).catch(function () {
                    $scope.gettingSkillAccountLinkingInformation = false;
                    $scope.config.enable_account_linking = false;
                    AlertService.addDanger(`Can't get skill account linking information for provided Alexa Skill ID "${$scope.config.app_id}" the provided Skill ID is either invalid or account linking has not been set up yet.`);
                    NotificationsService.addDanger('Cannot get account linking information', `Can't get skill account linking information for provided Alexa Skill ID "${$scope.config.app_id}". The provided Skill ID is either invalid or account linking has not been set up yet.`);
                });
            }

            $scope.getTermsOfUseUrl = function () {
                $scope.config.skill_preview_in_store.terms_of_use_url = service_urls.termsOfUseUrl;
            }

            $scope.getPrivacyPolicyUrl = function () {
                $scope.config.skill_preview_in_store.privacy_policy_url = service_urls.privacyPolicyUrl;
            }

            $scope.onCategoryChange = function () {
                _setIsChildDirected(true);
            };

            $scope.onAccountLinkingOfferChange = function (selectedItem) {
                _changeAccountLinkingMode(selectedItem);
            };

            $scope.toggleShowSecret = function () {
                if ($scope.secretFieldType === 'password') {
                    $scope.secretFieldType = 'text';
                } else if ($scope.secretFieldType === 'text') {
                    $scope.secretFieldType = 'password';
                }
            }
            $scope.toggleShowCertificate = function () {
                if ($scope.showCertificate === false) {
                    $scope.showCertificate = true;
                } else if ($scope.showCertificate === true) {
                    $scope.showCertificate = false;
                }
            }

            $scope.prepareDefaultSkillIcons = function () {
                if ($scope.config.upload_own_skill_icons === false) {
                    $scope.config.skill_preview_in_store.small_skill_icon = service_urls.smallSkillIconUrl;
                    $scope.config.skill_preview_in_store.large_skill_icon = service_urls.largeSkillIconUrl;
                }
            };

            $scope.toggleShouldUploadOwnSkillIcons = function () {
                if ($scope.config.upload_own_skill_icons === false) {
                    $scope.config.upload_own_skill_icons = true;
                    $scope.config.skill_preview_in_store.small_skill_icon = previousMediaItemId.get('small_skill_icon') ?? '';
                    $scope.config.skill_preview_in_store.large_skill_icon = previousMediaItemId.get('large_skill_icon') ?? '';
                } else if ($scope.config.upload_own_skill_icons === true) {
                    $scope.config.upload_own_skill_icons = false;
                    $scope.config.skill_preview_in_store.small_skill_icon = service_urls.smallSkillIconUrl;
                    $scope.config.skill_preview_in_store.large_skill_icon = service_urls.largeSkillIconUrl;
                }
            }

            $scope.getAmazonSkillAccountLinkingScopes = function () {
                // update array with values from config
                if ($scope.config.account_linking_config.scopes && $scope.config.account_linking_config.scopes.length > 0) {
                    const scopesArray = $scope.config.account_linking_config.scopes.split(';');

                    for (var i = 0; i < $scope.amazonSkillAccountLinkingScopes.length; i++) {
                        $scope.amazonSkillAccountLinkingScopes[i].checked = scopesArray.includes($scope.amazonSkillAccountLinkingScopes[i].name);
                    }
                }
                return $scope.amazonSkillAccountLinkingScopes;
            };

            $scope.copyAllowedReturnUrl = function (allowedReturnUrl) {
                _copyToClipboard(allowedReturnUrl);
                AlertService.addInfo('Copied Allowed Return URL to clipboard.');
            }

            $scope.registerPermissionsChange = function(permission) {
                var permissionValue = permission.amazonSkillPermission.value;
                var isPermissionEnabled = !permission.amazonSkillPermission.checked;
                var newArr = [];

                if (isPermissionEnabled) {
                    if ($scope.config.permissions === undefined) {
                        newArr.push(permissionValue);
                        $scope.config.permissions = newArr;
                    } else {
                        $scope.config.permissions.push(permissionValue);
                    }
                } else {
                    if ($scope.config.permissions === undefined) {
                        $scope.config.permissions = _arrayRemove(newArr, permissionValue);
                    } else {
                        $scope.config.permissions = _arrayRemove($scope.config.permissions, permissionValue);
                    }
                }

                if (permissionValue === 'alexa::profile:given_name:read' && $scope.config.permissions.includes('alexa::profile:name:read')) {
                    const targetIndex = $scope.permissions.findIndex((element) => element.value === 'alexa::profile:name:read');
                    $scope.permissions[targetIndex].checked = false;
                    $scope.config.permissions = _arrayRemove($scope.config.permissions, 'alexa::profile:name:read');
                } else if (permissionValue === 'alexa::profile:name:read' && $scope.config.permissions.includes('alexa::profile:given_name:read')) {
                    const targetIndex = $scope.permissions.findIndex((element) => element.value === 'alexa::profile:given_name:read');
                    $scope.permissions[targetIndex].checked = false;
                    $scope.config.permissions = _arrayRemove($scope.config.permissions, 'alexa::profile:given_name:read');
                }

                if (permissionValue === 'alexa:devices:all:address:country_and_postal_code:read' && $scope.config.permissions.includes('alexa::devices:all:address:full:read')) {
                    const targetIndex = $scope.permissions.findIndex((element) => element.value === 'alexa::devices:all:address:full:read');
                    $scope.permissions[targetIndex].checked = false;
                    $scope.config.permissions = _arrayRemove($scope.config.permissions, 'alexa::devices:all:address:full:read');
                } else if (permissionValue === 'alexa::devices:all:address:full:read' && $scope.config.permissions.includes('alexa:devices:all:address:country_and_postal_code:read')) {
                    const targetIndex = $scope.permissions.findIndex((element) => element.value === 'alexa:devices:all:address:country_and_postal_code:read');
                    $scope.permissions[targetIndex].checked = false;
                    $scope.config.permissions = _arrayRemove($scope.config.permissions, 'alexa:devices:all:address:country_and_postal_code:read');
                }

                if (permissionValue === 'alexa::authenticate:2:mandatory' && $scope.config.permissions.includes('alexa::authenticate:2:optional')) {
                    const targetIndex = $scope.permissions.findIndex((element) => element.value === 'alexa::authenticate:2:optional');
                    $scope.permissions[targetIndex].checked = false;
                    $scope.config.permissions = _arrayRemove($scope.config.permissions, 'alexa::authenticate:2:optional');
                } else if (permissionValue === 'alexa::authenticate:2:optional' && $scope.config.permissions.includes('alexa::authenticate:2:mandatory')) {
                    const targetIndex = $scope.permissions.findIndex((element) => element.value === 'alexa::authenticate:2:mandatory');
                    $scope.permissions[targetIndex].checked = false;
                    $scope.config.permissions = _arrayRemove($scope.config.permissions, 'alexa::authenticate:2:mandatory');
                }

                $scope.getPermissions();
            }

            $scope.getPermissions = function () {
                // update array with values from config
                if ($scope.config.permissions && $scope.config.permissions.length > 0) {
                    for (var i = 0; i < $scope.permissions.length; i++) {
                        if ($scope.config.permissions.includes($scope.permissions[i].value)) {
                            $scope.permissions[i].checked = true;
                        }
                    }
                }
                return $scope.permissions;
            };

            $scope.registerScopesChange = function(accountLinkingScope) {
                var scopeName = accountLinkingScope.amazonSkillAccountLinkingScope.name;
                var siScopeEnabled = !accountLinkingScope.amazonSkillAccountLinkingScope.checked;
                var newArr = [];

                if (siScopeEnabled) {
                    if ($scope.config.account_linking_config.scopes === undefined) {
                        newArr.push(scopeName);
                        $scope.config.account_linking_config.scopes = newArr.join(';');
                    } else {
                        let arrayOfScopes = $scope.config.account_linking_config.scopes.split(';');
                        arrayOfScopes.push(scopeName);
                        $scope.config.account_linking_config.scopes = arrayOfScopes.join(';');
                    }
                } else {
                    if ($scope.config.account_linking_config.scopes === undefined) {
                        $scope.config.account_linking_config.scopes = _arrayRemove(newArr, scopeName).join(';');
                    } else {
                        $scope.config.account_linking_config.scopes = _arrayRemove($scope.config.account_linking_config.scopes.split(';'), scopeName).join(';');
                    }
                }
                $scope.getAmazonSkillAccountLinkingScopes();
            }

            $scope.registerAlternativeAuthorizationUrlChange = function () {
                $scope.config.account_linking_config.authorization_url = _getAuthorizationUriForInstallation();
            }

            function _getAuthorizationUriForInstallation() {
                let alternativeAuthorizationUrlPath = $scope.config.account_linking_config.alternative_authorization_uri_path;
                let url;
                let validUrl = true;


                if (alternativeAuthorizationUrlPath) {
                    let alternativeAuthorizationUrl = system_urls.baseUrl.replace(/\/$/, '');
                    alternativeAuthorizationUrl += '/';
                    alternativeAuthorizationUrl += alternativeAuthorizationUrlPath.replace(/\/$/, '');
                    alternativeAuthorizationUrl += '?type=amazon&service_id='+$scope.service.service_id;
                    return alternativeAuthorizationUrl;
                } else {
                    const index = service_urls.accountLinkingModes.findIndex(x => x.id === 'installation');
                    return service_urls.accountLinkingModes[index].webAuthorizationURI;
                }
            }

            function _updateSelectedAmazonSkillAccountLinkingScopes() {
                $scope.config.account_linking_config.scopes = '';
                for (let i = 0; i < $scope.amazonSkillAccountLinkingScopes.length; i++) {
                    if ($scope.amazonSkillAccountLinkingScopes[i].checked) {
                        let scopeName = $scope.amazonSkillAccountLinkingScopes[i].name;
                        let arrayOfScopes =  $scope.config.account_linking_config.scopes.split(';');
                        arrayOfScopes.push(scopeName);
                        $scope.config.account_linking_config.scopes = arrayOfScopes.join(';');
                    }
                }
            }

            function _arrayRemove(arr, value) {
                return arr.filter(function(ele) {
                    return ele !== value;
                });
            }

            function _load()
            {
                promises.push(ConvoworksApi.getConfigOptions().then(function (options) {
                    config_options = options;

                    $scope.permissions = config_options['CONVO_AMAZON_SKILL_PERMISSIONS'];
                    $scope.forbidden_english_words_in_invocation = config_options['CONVO_AMAZON_FORBIDDEN_ENGLISH_WORDS_IN_INVOCATION'];
                    $scope.forbidden_english_two_words_in_invocation = config_options['CONVO_AMAZON_FORBIDDEN_ENGLISH_WORDS_IN_TWO_WORD_INVOCATION'];
                    $scope.languages = config_options['CONVO_AMAZON_LANGUAGES'];
                    $scope.sensitivities = config_options['CONVO_AMAZON_INTERACTION_MODEL_SENSITIVITIES'];
                    $scope.endpointCertificateTypes = config_options['CONVO_AMAZON_SKILL_ENDPOINT_SSL_CERTIFICATE'];
                    $scope.categories = config_options['CONVO_AMAZON_SKILL_CATEGORIES'];
                    $scope.amazonSkillAccountLinkingScopes = config_options['CONVO_AMAZON_SKILL_ACCOUNT_LINKING_SCOPES'];

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

                        if ($scope.config.upload_own_skill_icons === false) {
                            previousMediaItemId.set('small_skill_icon', service_urls.smallSkillIconUrl);
                            previousMediaItemId.set('large_skill_icon', service_urls.largeSkillIconUrl);
                        } else {
                            previousMediaItemId.set('small_skill_icon', $scope.config.skill_preview_in_store.small_skill_icon);
                            previousMediaItemId.set('large_skill_icon', $scope.config.skill_preview_in_store.large_skill_icon);
                        }

                        _setIsChildDirected();
                        $scope.validateKeywords(false);
                        $scope.validateInvocation(false);
                        configBak = angular.copy( $scope.config);
                        is_new  =   false;
                        is_error    =   false;
                    }, function ( response) {
                        $log.debug('configAmazonEditor loadPlatformConfig() response', response);

                        if ( response.status === 404) {
                            is_new      =   true
                            is_error    =   false;
                           _changeAccountLinkingMode($scope.config.account_linking_mode);

                            return;
                        }
                        is_error    =   true;
                    });
                }));
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

            function _changeAccountLinkingMode(accountLinkingMode) {
                const index = service_urls.accountLinkingModes.findIndex(x => x.id === accountLinkingMode);
                $scope.secretFieldType = 'password';
                $scope.config.account_linking_config.authorization_url = service_urls.accountLinkingModes[index].webAuthorizationURI;
                $scope.config.account_linking_config.access_token_url = service_urls.accountLinkingModes[index].accessTokenURI;
                $scope.config.account_linking_config.domains = service_urls.accountLinkingModes[index].domains.join(';');

                if ($scope.config.account_linking_mode !== 'something_else') {
                    if ($scope.config.account_linking_mode === 'installation') {
                        $scope.config.account_linking_config.authorization_url = _getAuthorizationUriForInstallation();
                        $scope.config.account_linking_config.client_id = '';
                        $scope.config.account_linking_config.client_secret = '';
                        $scope.config.account_linking_config.scopes =  '';
                    } else if ($scope.config.account_linking_mode === 'amazon') {
                        $scope.config.account_linking_config.client_id =  $scope.service.service_id;
                        $scope.config.account_linking_config.client_secret =  '';
                        $scope.config.account_linking_config.scopes =  'profile';
                    }
                } else {
                    $scope.config.account_linking_config.client_id =  '';
                    $scope.config.account_linking_config.client_secret = '';
                    $scope.config.account_linking_config.scopes =  '';
                }
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
}
