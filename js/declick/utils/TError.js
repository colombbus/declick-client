define(['jquery', 'TEnvironment', 'TUtils', 'TResource'], function($, TEnvironment, TUtils, TResource) {
    /**
     * TError is used to format and draw error messages.
     * @exports TError
     * @param {type} e
     */
    function TError(e) {
        this.message = "";
        this.lines = [];
        this.programName = null;
        this.code = null;

        // Initialization from error object
        if (typeof e !== 'undefined') {
            if (typeof e === 'string') {
                this.message = this.translate(e);
            } else {
                if (typeof e.message !== 'undefined') {
                    this.message = this.translate(e.message);
                }
                if (typeof e.loc !== 'undefined') {
                    // e.loc set by acorn parser
                    this.lines[0] = e.loc.line;
                    this.lines[1] = e.loc.line;
                }
            }
        }
    }
    
    TError.prototype.detectRegex_undefined = /(\S*)\sis\snot\sdefined/i;
    TError.prototype.detectRegex_not_a_function = /(\S*)\sis\snot\sa\sfunction/i;
    TError.prototype.detectRegex_syntax_error = /Unexpected\stoken\s/i;
    TError.prototype.detectRegex_not_a_variable = /Can\'t\sfind\svariable\:\s(\S*)/i;
    TError.prototype.detectRegex_unterminated_string = /Unterminated\sstring\sconstant/i;
    TError.prototype.detectRegex_unknown_function = /unknown\sfunction/i;
    
    /**
     * Translate an error.
     * @param {String} text
     * @returns {String}    Returns the translated error, or the original
     * string if failed.
     */
    TError.prototype.translate = function(text) {
        if (typeof this.constructor.errors !== 'undefined' && typeof this.constructor.errors[text] !== 'undefined') {
            var translatedText = this.constructor.errors[text];
            if (arguments.length > 1) {
                // message has to be parsed
                var elements = arguments;
                translatedText = translatedText.replace(/{(\d+)}/g, function(match, number) {
                    number = parseInt(number) + 1;
                    return typeof elements[number] !== 'undefined' ? elements[number] : match;
                });
            }
            return translatedText;
        } else {
            return text;
        }
    };

    /**
     * Set lines to value.
     * @param {Number[]} value
     */
    TError.prototype.setLines = function(value) {
        this.lines = value;
    };

    /**
     * Get the value of lines.
     * @returns {Number[]}
     */
    TError.prototype.getLines = function() {
        return this.lines;
    };

    /**
     * Get the error message.
     * @returns {String}
     */
    TError.prototype.getMessage = function() {
        if (this.programName !== null && typeof this.lines !== 'undefined' && this.lines.length > 0) {
            var lines = this.lines;
            if (lines.length === 2 && lines[0] !== lines[1]) {
                return this.message + " (lignes " + lines[0] + " à " + lines[1] + ")";
            } else {
                return this.message + " (ligne " + lines[0] + ")";
            }
        }
        return this.message;
    };

    /**
     * Get the Program Name.
     * @returns {String} 
     */
    TError.prototype.getProgramName = function() {
        return this.programName;
    };

    /**
     * Set the Program Name to name.
     * @param {String} name
     * @returns {undefined}
     */
    TError.prototype.setProgramName = function(name) {
        this.programName = name;
    };

    /**
     * Set code to value.
     * @param {String} value
     */
    TError.prototype.setCode = function(value) {
        this.code = value;
    };

    /**
     * Get code.
     * @return {String}
     */
    TError.prototype.getCode = function() {
        return this.code;
    };

    /**
     * Detect the error, translate it into an user-friendly message and
     * draw it.
     */
    TError.prototype.detectError = function() {
        var message = this.message;
        // Undefined
        var result = this.detectRegex_undefined.exec(message);
        if (result !== null && result.length > 0) {
            var name = result[1];
            name = TUtils.convertUnicode(name);
            this.message = this.translate("runtime-error-undefined", name);
            return;
        }
        // Not a function 
        var result = this.detectRegex_not_a_function.exec(message);
        if (result !== null && result.length > 0) {
            var name = result[1];
            name = TUtils.convertUnicode(name);
            if (name === 'undefined') {
                this.message = this.translate("runtime-error-undefined-not-a-function");
            } else {
                this.message = this.translate("runtime-error-not-a-function", name);
            }
            return;
        }
        var result = this.detectRegex_syntax_error.exec(message);
        if (result !== null) {
            this.message = this.translate("runtime-error-syntax-error");
            return;
        }
        var result = this.detectRegex_not_a_variable.exec(message);
        if (result !== null && result.length > 0) {
            var name = result[1];
            name = TUtils.convertUnicode(name);
            this.message = this.translate("runtime-error-not-variable-error", name);
            return;
        }
        var result = this.detectRegex_unterminated_string.exec(message);
        if (result !== null) {
            this.message = this.translate("runtime-error-unterminated-string-error");
            return;
        }
        var result = this.detectRegex_unknown_function.exec(message);
        if (result !== null) {
            this.message = this.translate("runtime-error-unknown-function");
            return;
        }
    };

    TError.loadMessages = function(callback) {
        // Load translated errors
        var errorsFile = TEnvironment.getResource("errors.json");
        var language = TEnvironment.getLanguage();
        TResource.get(errorsFile, [language], function(data) {
            if (typeof data[language] !== 'undefined') {
                TError.errors = data[language];
                TEnvironment.log("found errors translated in language: " + language);
            } else {
                TEnvironment.log("found no translated errors for language: " + language);
            }
            callback.call(this);
        });
    };


    return TError;

});
