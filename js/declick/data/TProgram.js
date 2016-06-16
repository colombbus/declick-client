define(['TParser', 'TLink', 'TEnvironment', 'TUtils', 'TError'], function(TParser, TLink, TEnvironment, TUtils, TError) {
    /**
     * TProgram is used to manage programs inside a project.
     * @param {String} value    Program's name
     * @exports TProgram
     */
    function TProgram(value) {
        var statements = new Array();
        var code = "";
        var name = null;
        var loaded = false;
        var newProgram = false;
        var modified = false;
        var codeChanged = false;

        if (TUtils.checkString(value)) {
            name = value;
        } else {
            var used = [];
            if (TUtils.checkArray(value)) {
                used = value;
            }
            var index = 0;
            do {
                index++;
                name = TEnvironment.getMessage('program-new', index);
            } while (used.indexOf(name) > -1);
            newProgram = true;
        }

        /**
         * Save the current program.
         * If it's a new program, create it.
         * @param {Function} callback
         */
        this.save = function(callback) {
            if (newProgram) {
                // First create program
                TLink.createProgram(name, function(error) {
                    if (typeof error !== 'undefined') {
                        // error: just forward it
                        callback.call(this, error);
                    } else {
                        newProgram = false;
                        TLink.saveProgram(name, code, function(error) {
                            if (typeof error !== 'undefined') {
                                // error: forward it
                                callback.call(this, error);
                            } else {
                                modified = false;
                                callback.call(this);
                            }
                        });
                    }
                });
            } else {
                TLink.saveProgram(name, code, function(error) {
                    if (typeof error !== 'undefined') {
                        // error: forward it
                        callback.call(this, error);
                    } else {
                        modified = false;
                        callback.call(this);
                    }
                });
            }
        };

        /**
         * Loads Program 'name'.
         * @param {Function} callback
         */
        this.load = function(callback) {
            TLink.getProgramCode(name, function(codeData) {
                if (codeData instanceof TError) {
                    callback.call(this, codeData);
                } else {
                    code = codeData;
                    codeChanged = true;
                    loaded = true;
                    callback.call(this);
                }
            });
        };

        /**
         * Parse the code to get its statements.
         */
        function parse() {
            statements = TParser.parse(code, name);
            codeChanged = false;
        }

        /**
         * Change the code.
         * @param {String} value    New code
         */
        this.setCode = function(value) {
            code = value;
            codeChanged = true;
        };

        /**
         * Loads the code if needed, and returns it.
         * @returns {String}
         */
        this.getCode = function() {
            if (!loaded && !newProgram) {
                this.load();
            }
            return code;
        };

        /**
         * Parse the code if it has changed, and returns statements.
         * @return {Statements[]}
         */
        this.getStatements = function() {
            if (codeChanged) {
                parse();
            }
            return statements;
        };

        /**
         * Get Program's name.
         * @returns {String}
         */
        this.getName = function() {
            return name;
        };

        /**
         * Returns the displayed Program's name.
         * (The name, with or without an asterisk
         * depending of its modification state.)
         * @returns {String}
         */
        this.getDisplayedName = function() {
            if (modified) {
                return TEnvironment.getMessage("program-modified", name);
            } else {
                return name;
            }
        };

        /**
         * Set Program's name.
         * @param {String} value
         */
        this.setName = function(value) {
            name = value;
        };

        /**
         * Rename the current program.
         * @param {String} value    New name
         * @param {Function} callback
         */
        this.rename = function(value, callback) {
            if (!newProgram) {
                TLink.renameProgram(name, value, function(error) {
                    if (typeof error !== 'undefined') {
                        TEnvironment.log("error detected");
                        if (TEnvironment.isLogEnabled()) {
                            window.console.debug(error);
                        }
                        callback.call(this, error);
                    } else {
                        name = value;
                        callback.call(this);
                    }
                });
            } else {
                // New Program: we try to create the program
                TLink.createProgram(value, function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        name = value;
                        newProgram = false;
                        callback.call(this);
                    }
                });
            }
        };

        /**
         * Get Program's ID.
         * @returns {String}
         */
        this.getId = function() {
            return TProgram.findId(name);
        };

        /**
         * Set 'modified' value.
         * @param {Boolean} value
         */
        this.setModified = function(value) {
            modified = value;
        };

        /**
         * Returns true if the code has been modified.
         * @returns {Boolean}
         */
        this.isModified = function() {
            return modified;
        };

        /**
         * Returns true if the current program is a new one.
         * @returns {Boolean}
         */
        this.isNew = function() {
            return newProgram;
        };

        /**
         * Delete current program.
         * @param {Function} callback
         */
        this.delete = function(callback) {
            if (!newProgram) {
                TLink.deleteProgram(name, function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        callback.call(this);
                    }
                });
            } else {
                callback.call(this);
            }
        };
    }

    /**
     * Hash Program to get an ID. Returns it.
     * @param {String} value
     * @returns {String|Number}
     */
    function hashCode(value) {
        var hash = 0, i, chr, len;
        if (value.length === 0)
            return hash;
        for (i = 0, len = value.length; i < len; i++) {
            chr = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
    
    /**
     * Get Program's ID.
     * @param {String} name
     * @returns {String}
     */
    TProgram.findId = function(name) {
        var id = hashCode(name);
        return id;
    };

    return TProgram;
});
