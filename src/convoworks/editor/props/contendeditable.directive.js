/* @ngInject */
export default function contenteditable() {
  // credit to https://codepen.io/meiriko/pen/zGoKoO
  return {
    restrict: "A",
    require: "ngModel",
    link: function (scope, element, attrs, ngModel) {
      function read() {
        const newLine = String.fromCharCode(10);
        const formattedValue = element
          .html()
          .replace(/<br>/ig, newLine)
          .replace(/\r/ig, '')
          .replace(/\u00A0|&nbsp;/g, ' ');
        
        ngModel.$setViewValue(formattedValue);
        
        element.text(formattedValue);
      }

      ngModel.$render = function () {
        element.html(ngModel.$viewValue || "");
      };

      element.bind("blur", function () {
        scope.$apply(read);
      });
      element.bind("paste", function (e) {
        e.preventDefault();
        const cbdata = e.clipboardData || window.clipboardData || e.originalEvent.clipboardData;
        document.execCommand('inserttext', false, cbdata.getData('text/plain'));
      });
    }
  };
}