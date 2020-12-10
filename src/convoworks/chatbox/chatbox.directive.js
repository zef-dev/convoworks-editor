import template from './chatbox.tmpl.html';

/* @ngInject */
export default function convoChatbox( $log, $q, $timeout, ConvoworksApi, ConvoChatApi, UserPreferencesService) {

    $log.log('convoChatbox init');

    return {
        restrict: 'E',
        template : template,
        scope: {
            deviceId : '=',
            serviceId : '=',
            collapsed : '=',
            mode : '=',
            name : '=?',
            variant : '=?',
            delegateNlp : '=?',
            toggleDebug : '=?',
            exception : '=?',
            variables : '=?'
        },
        link: function( $scope, $elem, $attrs)
        {
            $log.log( 'convoChatbox link $scope.deviceId', $scope.deviceId, '$scope.serviceId', $scope.serviceId);

            // $scope.collapsed    =   true;

            $scope.toggleDebug  =   false;
            $scope.message      =   '';
            $scope.messages     =   [];

            var sending         =   false;

            var REPROMPT_TIMEOUT    =   20 * 1000;
            var SEQUENCE_TIMEOUT    =   2 * 1000;
            var reprompt_timeout    =   null;
            var sequence_timeout    =   null;

            $scope.$watch('delegateNlp', function(newVal, oldVal) {
                $log.log('convoChatbox $watch delegateNlp old value', oldVal, 'new value', newVal);

                if (!newVal) {
                    return;
                }

                $scope.resetChat();
            });

            $scope.$watch('toggleDebug', function(newVal) {

                UserPreferencesService.registerData( 'toggleDebug', newVal);
                $log.log('convoChatbox $watch toggleDebug new value', newVal);
                $scope.toggleDebug = newVal;
            });

            _init();

            var input           =   $elem.find( 'input[type=text]')[0];
            $log.log( 'convoChatbox link input', input);


            $scope.formSubmited =   function()
            {
                $log.log( 'convoChatbox formSubmited()', $scope.message);
                var msg             =   $scope.message;

                sending             =   true;
                if ( msg) {
                    _appendBreak();
                    _appendUserMessage( msg);
                }

                _cancelMsgs();

                _getApi().sendMessage( $scope.serviceId, $scope.deviceId, msg, false, $scope.variant, $scope.delegateNlp).then( function( response) {
                    $log.log( 'convoChatbox formSubmited() sendMessage() response', response);
                    $scope.message      =   '';
                    _readResponse( response);
                }, function( reason) {
                    $log.log( 'convoChatbox formSubmited() sendMessage() reason', reason);
                }).finally( function() {
                    $log.log( 'convoChatbox formSubmited() sendMessage() finally');
                    sending             =   false;
                });

            };

            $scope.resetChat    =   function()
            {
                $log.log( 'convoChatbox resetChat()');

                $scope.messages     =   [];
                $scope.message      =   '';

                _cancelMsgs();
                sending             =   true;

                _getApi().sendMessage( $scope.serviceId, $scope.deviceId, '', true, $scope.variant, $scope.delegateNlp).then( function( response) {
                    $log.log( 'convoChatbox resetChat() sendMessage() response', response);
                    _readResponse( response);
                }, function( reason) {
                    $log.log( 'convoChatbox resetChat() sendMessage() reason', reason);
                }).finally( function() {
                    $log.log( 'convoChatbox resetChat() sendMessage() finally');
                    sending     =   false;
                });
            };

            $scope.formDisabled =   function()
            {
                return sending || $scope.message.trim() == '';
            };

            $scope.isSending    =   function()
            {
                return sending;
            };

            function _init()
            {
                $log.log( 'convoChatbox _init()');
                sending             =   true;

                _getApi().sendMessage( $scope.serviceId, $scope.deviceId, '', true, $scope.variant, $scope.delegateNlp).then( function( response) {
                    $log.log( 'convoChatbox _init() response', response);
                    _readResponse( response);
                }, function( reason) {
                    $log.log( 'convoChatbox _init() reason', reason);
                }).finally( function() {
                    $log.log( 'convoChatbox _init() finally');
                    sending             =   false;
                });

                UserPreferencesService.getData( 'toggleDebug').then( function( toggleDebug) {
                    $log.log( 'convoChatbox getData() toggleDebug', toggleDebug);
                    if (toggleDebug) {
                        $scope.toggleDebug = toggleDebug;
                    }
                });
            }

            function _readResponse( data)
            {
                _appendBreak();
                _appendSequence( data.text_responses, true);
                $scope.exception = data.exception;
                $scope.variables = data.variables;
                if ( data.text_reprompts.length) {
                    reprompt_timeout    =   $timeout( function() {
                        _appendBreak();
                        _appendSequence( data.text_reprompts, true);
                    }, REPROMPT_TIMEOUT);
                }
            }

            function _appendSequence( msgs, immediate)
            {
                if ( immediate) {
                    var msg =   msgs.shift();
                    _appendConvoResponse( [msg]);
                }

                if ( msgs.length) {
                    sequence_timeout    =   $timeout( function() {
                        var msg =   msgs.shift();
                        _appendConvoResponse( [msg]);
                        if ( msgs.length) {
                            _appendSequence( msgs, false);
                        }
                    }, SEQUENCE_TIMEOUT);
                }

            }

            function _cancelMsgs()
            {
                $timeout.cancel( reprompt_timeout );
                reprompt_timeout    =   null;
                $timeout.cancel( sequence_timeout );
                sequence_timeout    =   null;
            }

            function _appendBreak()
            {
                $scope.messages.push( {
                    type : 'break',
                });
            }

            function _appendConvoResponse( msgs) {
                $log.log( 'convoChatbox _appendConvoResponse()', msgs);

                for (var i=0;i<msgs.length; i++) {
                    $scope.messages.push( {
                        text : msgs[i],
                        source : 'convo',
                        avatar: 'img/pbtour-avatar-pb.png'
                    });
                }
            }

            function _appendUserMessage( msg) {
                $log.log( 'convoChatbox _appendUserMessage()', msg);
                $scope.messages.push( {
                    text : msg,
                    source : 'user',
                    avatar: 'img/pbtour-avatar-me.png'
                });
            }

            function _getApi()
            {
                if ( $scope.mode == 'public') {
                    return ConvoChatApi;
                } else if ( $scope.mode == 'admin') {
                    return ConvoworksApi;
                } else {
                    throw new Error( 'Unknown mode ['+$scope.mode+']');
                }
            }

            // ANIMATE SCROLL
            $scope.$watchCollection( 'messages', function() {
                $log.log( 'convoChatbox $watchCollection()');
                setTimeout( function() {
                    $log.log( 'convoChatbox queue()');
                    var $list           =   $elem.find( '#chat-panel-body');
                    var scrollHeight    =   $list.prop( 'scrollHeight');
                    $list.animate( { scrollTop : scrollHeight}, 500);
                },10);
            });

            // FOCUS
            $scope.$watch( function() {
                return $scope.isSending();
            }, function( sending) {
                $log.log( 'convoChatbox $watch() sending', sending);
                setTimeout( function() {
                    $log.log( 'convoChatbox input.focus()');
                    input.focus();
                },10);
            });
        }
    };
}
