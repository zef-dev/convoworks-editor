# Convoworks Editor #

Convoworks Editor is an AngularJs web app for the [Conwoworks](https://github.com/zef-dev/convoworks-core) PHP framework.

## Installation

Using NPM

```
    npm i @zef-dev/convoworks-editor
```

or using Yarn

```
    yarn add @zef-dev/convoworks-editor
```


## Peer dependencies

In order to run it, your host application has to include thise libraries (through CDN or build process)

    "angular": "^1.8.0",
    "angular-animate": "1.8.*",
    "angular-cookies": "1.8.*",
    "angular-sanitize": "1.8.*",
    "bootstrap": "^3.4.1",
    "jquery": "^1.12.1",
    "jquery-ui-dist": "^1.12.1",
    "react": "^16.13.1",
    "react-dom": "^16.13.1"

## Required implementations

You have to implement your own `LoginService` which givess access to signed user.

* `LoginService.getUser()` - returns promise which will resolve to user where user is represented as 

```
{
    "user_id":"123orABC",
    "name":"Display Name",
    "username":"someusername",
    "email":"user@email.com",
    "amazon_account_linked":false
}
```

* `LoginService.isSignedIn()` - returns boolean


## Required constants

You have to provide API base urls as angular constants

```javascript
    var appModule   =   angular.module('my.app.module.name');
    appModule.constant( 'CONVO_PUBLIC_API_BASE_URL', 'http://localhost/myapp/rest_public/convo/v1');
    appModule.constant( 'CONVO_ADMIN_API_BASE_URL', 'http://localhost/myapp/rest_admin/convo/v1');
```

## Bootstraping

Your app bootrap might look like

```javascript
    import angular from 'angular';
    import '@uirouter/angularjs';
    
    import LoginService from './login-service';
    import convo from '@zef-dev/convoworks-editor';
    
    const appModule =    angular.module( 'my.convo.implementation', [
      'ui.router',
      convo
    ]).service('LoginService', LoginService);
    
    export default appModule;
```
