
export function propsFilter() {
  return function( items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var hastext =   false;
              items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                if (keys.length == 0)
                    return items;
                for (var i = 0; i < keys.length; i++) {
                  var prop = keys[i];
                  var text = props[prop].toLowerCase();

                  if (text)
                      hastext   =   true;
                  if (item[prop] && (item[prop].toString().toLowerCase().indexOf(text) !== -1)) {
                    itemMatches = true;
                    break;
                  }
                }
                if (itemMatches) {
                  out.push(item);
                }
              });

            if (!hastext)
                return items;


        } else {
          // Let the output be the input untouched
          out = items;
        }

        return out;
      };
}

export function percent() {
    return function (value) {
            return value + ' %';
    };
}

export function prettyJson() {
    return function (value) {
        return JSON.stringify( value, null, 2);
    };
}

/* @ngInject */
export function admDate( $filter) {
    return function ( strDate, format) {
        if ( angular.isNumber( strDate)) {
            return $filter('date')( new Date( strDate * 1000), format);
        }
        return $filter('date')( Date.parse( strDate), format);
    };
}

/* @ngInject */
export function unsafe( $sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
}

export function keys() {
    return function (value) {
        return Object.keys(value);
    };
}
