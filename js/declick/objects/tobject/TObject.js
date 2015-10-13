define(['jquery', 'TRuntime', 'TEnvironment'], function($, TRuntime, TEnvironment) {
    /**
     * Defines TObject.
     * This is the main class, all classes inherit from it.
     * @exports TObject
     */
    function TObject() {
        TRuntime.addObject(this);
    }

    TObject.prototype.objectName;
    TObject.prototype.className = "TObject";
    TObject.prototype.objectPath = "tobject";

    TObject.prototype.deleteObject = function() {
        TRuntime.removeObject(this);
    };

    TObject.prototype.getResource = function(location) {
        return TEnvironment.getObjectsUrl() + "/" + this.objectPath + "/resources/" + location;
    };

    TObject.prototype.getMessage = function(code) {
        if (typeof this.constructor.messages[code] !== 'undefined') {
            var message = this.constructor.messages[code];
            if (arguments.length > 1) {
                // message has to be parsed
                var elements = arguments;
                message = message.replace(/{(\d+)}/g, function(match, number) {
                    number = parseInt(number) + 1;
                    return typeof elements[number] !== 'undefined' ? elements[number] : match;
                });
            }
            return message;
        } else {
            return code;
        }
    };

    /**
     * Delete TObject.
     */
    TObject.prototype._delete = function() {
        this.deleteObject();
    };

    /**
     * To be defined in sub-objects, so they can have actions to freeze.
     * @param {Boolean} value
     */
    TObject.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };

    /**
     * Get a String containing "TObject " and the class of the object.
     * @returns {String}
     */
    TObject.prototype.toString = function() {
        return "TObject " + this.className;
    };

    return TObject;
});