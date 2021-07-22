/* @ngInject */
export default function contenteditable()
{
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, element, attrs, ngModel) {
              // read is the main handler, invoked here by the blur event
            function read() {
                  // Keep the newline value for substitutin
                  // when cleaning the <br>
                var newLine = String.fromCharCode(10);
                  // Firefox adds a <br> for each new line, we replace it back
                  // to a regular '\n'
                var formattedValue = element.html().replace(/<br>/ig,newLine).replace(/\r/ig,'');
                  // update the model
                ngModel.$setViewValue(formattedValue);
                  // Set the formated (cleaned) value back into
                  // the element's html.
                element.text(formattedValue);
            }

            ngModel.$render = function () {
                element.html(ngModel.$viewValue || "");
            };

            element.bind("blur", function () {
                  // update the model when
                  // we loose focus
                scope.$apply(read);
            });
            element.bind("paste", function(e){
                  // This is a tricky one
                  // when copying values while
                  // editing, the value might be
                  // copied with formatting, for example
                  // <span style="line-height: 20px">copied text</span>
                  // to overcome this, we replace
                  // the default behavior and
                  // insert only the plain text
                  // that's in the clipboard
                e.preventDefault();
                document.execCommand('inserttext', false, e.clipboardData.getData('text/plain'));
            });
        }
    };
}