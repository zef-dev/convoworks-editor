import appModule from './app.module';

import 'angular-local-storage';

import './style.scss';
import './forms.scss';
import './convoworks-editor.scss';

import app_route from './app.ui-route';

/* @ngInject */
appModule.config(app_route);

//import loggingMiddleware from './loggingMiddleware';

appModule.run(/* @ngInject */ ($document, $rootScope) => {
    $document.bind('keydown', function (e) {
        if (e.keyCode === 13) {
            $rootScope.$apply(() => { $rootScope.$broadcast('EnterKeyPressed'); });
        }
        
        if (e.keyCode === 27) {
            $rootScope.$apply(() => { $rootScope.$broadcast('EscKeyPressed'); });
        }
        
        if (e.keyCode === 83 && e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();

            $rootScope.$apply(() => { $rootScope.$broadcast('CtrlSPressed'); });
        }
    });
});

export default appModule.config(/* @ngInject */(localStorageServiceProvider) => {
      localStorageServiceProvider
        .setPrefix( 'convoAdmin')
//      .setStorageType( 'sessionStorage')
        .setNotify( true, true)
    })
    .name;
