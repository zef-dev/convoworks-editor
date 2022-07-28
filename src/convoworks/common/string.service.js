/* @ngInject */
export default function StringService() {
    this.generateUUIDV4 = generateUUIDV4;

    this.capitalizeFirst = capitalizeFirst;

    function generateUUIDV4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    function capitalizeFirst(string) {
        if (!string || string.length === 0) {
            return '';
        }
        
        if (string.length === 1) {
            return string.toUpperCase();
        }

        return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
    }
}