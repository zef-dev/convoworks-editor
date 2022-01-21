# Convoworks Editor #

## [Current development]

## [Releases]

## 0.22.11 - 2022-01-21

* Fix getContainer method to try setting default value if property isn't present on component

## 0.22.10 - 2022-01-20

* Add new block role - `error_handler`

## 0.22.9 - 2021-12-23

* Fix not being able to paste into raw input fields
* Add support to toggle `number` and `params` into raw
* Component types in a package are now collapsable
* Add new block role - `default_fallback`
* Fixed broken rendering for toggle indicators
* Fix error with checking if propagation is allowed to any platform
* Toggling back to preset editor no longer has confirm prompt
* View now scrolls up after service creation

## 0.22.8 - 2021-12-03

* Fix create new service from existing. Again.
* Improvements to file upload, now shows filename and size
* Import-Export view now requires a button click to confirm import
* Fix block descriptions
* Forbid GoTo element from going to session start
* Alexa Skills permissions are now configurable

### 0.22.7 - 2021-11-17 ###

* Fix create new service from existing

### 0.22.6 - 2021-11-17 ###

* Add option for a default icon for Amazon Alexa
* Improved labels on settings
* Bug fixes and improvements

### 0.22.5 - 2021-10-20 ###

* Validate intent name and utterance uniqueness
* Fix styling
* Add new editor type for selecting contexts
* Add context dropdown is disabled if none are available

### 0.22.4 - 2021-09-23 ###

* Reduce spacing on services list
* Display fixes for service delete report
* The "delete local files only" checkbox will appear only if the service has remote releases
* Components in the editor now show which package they belong to
* The component's package is also shown in its help header (if present)

### 0.22.3 - 2021-07-28 ###

* Add ability to toggle preset inputs to raw input
* Reworked loading of user data in Amazon config editor
* Amazon config tabs closed by default
* Split create new service view into new and import
* Fix service delete report closing

### 0.22.2 - 2021-07-19 ###

* Add automatic Alexa Skill Enablement
* Add Auto Propagate after Save
* Add ability to create service from existing file
* Fix help file fetching

### 0.22.1 - 2021-06-07 ###

* Migrated to bootstrap 4

### 0.22.0 - 2021-05-14 ###

* Extended all services view with platforms and sort options
* Enable/disable packages improved
* New intent editor included
* Small fixes

### 0.21.2 - 2021-03-31 ###

* handle rejected promise
* no avatar for dialogflow

### 0.21.1 - 2021-03-30 ###

* Fixed upload validation for Small and Large Icons on Amazon Service Configuration under Edit Skill Store Preview tab

### 0.21.0 - 2021-03-27 ###

* Added css classes for list and card elements preview
* Allow propagation on Alexa Distribution Information from Convoworks
* Add the ability to make Account Linking Configurable 
* Add the ability to display contents of uploaded Self Signed Certificate on Amazon Config
* Minor fixes

### v0.20.0 ###

* A separator will be rendered after a container if it has the `_separate` property set to true

* Each preview block is now separated into sections
    * Clicking on a block name/fragment name in preview will now navigate to it in the editor

* Changed simple debug view to a JSON viewer

### v0.19.1 ###

**2021-02-10**

* addSuccess js call on propagation fixed (was typo)

### v0.19.0 ###

**2021-02-09**

* navigate to custom intent from editor
* new preview rendering to accommodate overhauled process
* notifications have been redesigned
* add an indicator for ongoing propagation
* add the ability to edit the Skill Preview and Privacy Compliance of Alexa Skill Developer Console Distribution Tab  

### v0.18.9 ###

**2021-01-12**

* new intent editor version - 1.1.8
* fix Config Messenger Editor
* fix Config Viber Editor
* fixed styling in intent and entities lists
* use links for intent and entities list items

### v0.18.8 ###

**2021-01-08**

* new intent editor version - 1.1.7

### v0.18.7 ###

**2021-01-05**

* new intent editor version - 1.1.5

### v0.18.6 ###

**2020-12-16**

* new intent editor version


### v0.18.5 ###

**2020-12-15**

* append draggable to .convoworks


### v0.18.4 ###

**2020-12-15**

* catch up with latest changes (from main project)


### v0.18.3 ###

**2020-12-15**

* corrcted usage and import for `@zef-dev/convoworks-intent-model-editor`

### v0.18.2 ###

**2020-12-15**

* use `@zef-dev/convoworks-intent-model-editor`

### v0.18 ###

**2020-12-04**

* 
