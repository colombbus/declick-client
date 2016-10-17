define(['TRuntime', 'SynchronousManager', 'TObject'], function(TRuntime, SynchronousManager, TObject) {
    /**
     * Defines Exercise, inherited from TObject.
     * Exercise is an object used to validate routes.
     * It compares values with statements, and can (un)validate steps.
     * @exports Exercise
     */
    var Exercise = function() {
        // Do not call parent constructor, as we don't want this object to be erased when clearing the
        // Runtime
        this.synchronousManager = new SynchronousManager();
        TRuntime.addInstance(this);

        this.statements = [];
        this.frame = false;
        this.score = 0;
        this.message = "";
        this.values = {};
        this.requiredScore = 1;
        this.displayedClasses = [];
        this.displayedMethods = [];
        this.completions = {};
        this.timer = -1;
    };

    Exercise.prototype = Object.create(TObject.prototype);
    Exercise.prototype.constructor = Exercise;
    Exercise.prototype.className = "Exercise";

    //Learn.countObject



    /**
     * Set the array of statements.
     * @param {String[]} value
     */
    Exercise.prototype.setStatements = function(value) {
        this.statements = value;
    };

    /**
     * Print Statements in debug.
     * @param {String} value
     */
    Exercise.prototype.dumpStatements = function(value) {
        console.debug(this.statements);
    };

    /**
     * Set frame to "value".
     * @param {Boolean} value
     */
    Exercise.prototype.setFrame = function(value) {
        this.frame = value;
    };

    /**
     * Checks if 'base' and 'match' are the same type, in case they are objects also compares their
     * properties, in case they are primitive also compares their values.
     * @param {*} base - The base object for comparison.
     * @param {*} match - The match object for comparison.
     * @returns {Boolean} The comparison result.
     */
    function matchObjects(base, match) {
        for (var key in match) {
            if (typeof base[key] === 'undefined') {
                return false;
            }
            if (typeof base[key] === 'object') {
                if (typeof match[key] !== 'object') {
                    return false;
                }
                if (!matchObjects(base[key], match[key])) {
                    return false;
                }
            } else if (base[key] !== match[key]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Checks if the exercise statements contain a specific statement.
     * @param {Object} needle - The statement to find.
     * @param {Boolean} [deepSearch=true] - A boolean that defines if the search includes
     * statements contained in block statements.
     * @returns {Boolean} The search result.
     */
    Exercise.prototype.containsStatement = function (needle, deepSearch) {
        if (typeof deepSearch === 'undefined') {
            deepSearch = true;
        }
        var statements = this.statements.slice();
        for (var index = 0; index < statements.length; index++) {
            var statement = statements[index];
            if (matchObjects(statement, needle)) {
                return true;
            }
            if (deepSearch && typeof statement.body !== 'undefined') {
                if (Object.prototype.toString.call(statement.body) === '[object Array]') {
                    Array.prototype.push.apply(statements, statement.body);
                } else if (typeof statement.body === 'object') {
                    statements.push(statement.body);
                }
            }
        }
        return false;
    };

    Exercise.prototype.hasStatement = function (needle, deepSearch) {
        return this.containsStatement(needle, deepSearch);
    };

    /**
     * Returns the number of statements.
     * @returns {Number}
     */
    Exercise.prototype.statementsLength = function()
    {
        return (this.statements.length);
    };

    /**
     * Check if the code matches with the regexp
     * /!\ to verify "o = new O()", don't forget the \ before parenthesis
     * /!\ abort the syntax verification of the code
     * @param {String} value
     * @returns {Boolean} Returns true if the code matches with the regexp, else false.
     */
    Exercise.prototype.verifyRegexp = function(value) {
        var re = new RegExp(value);
        return re.test(this.statements);
    };

    /**
     * Set the score
     * @param {Number} value
     */
    Exercise.prototype.setScore = function(value) {
        this.score = value;
    };

    /**
     * Set the message.
     * @param {Number} value
     */
    Exercise.prototype.setMessage = function(value) {
        this.message  = value;
    };


    /**
     * Validate the current exercise if "frame" is true
     * @param {String} message
     */
    Exercise.prototype.validate = function(message) {
        if (this.frame) {
            this.frame.validateExercise(message);
        }
    };

    /**
     * Invalidate the current exercise if "frame" is true. Send a message.
     * @param {String} message
     */
    Exercise.prototype.invalidate = function(message) {
        if (this.frame) {
            this.frame.invalidateExercise(message);
        }
    };

    /**
     * Set the score needed to validate
     * @param {number} value
     */
    Exercise.prototype.setRequiredScore = function(value) {
        this.requiredScore = value;
    };


    /**
     * Validate or invalidate the task, need to be appeal by
     * @param {String} optMessage is an optionnal message
     * @param {Number} optScore is an optionnal score
     */
    Exercise.prototype.done = function(optMessage, optScore) {
        if(typeof optScore !== "undefined") {
           this.setScore(optScore);
        }
        if(typeof optMessage !== "undefined") {
           this.setMessage(optMessage);
        }
        if (this.frame) {
            this.frame.setScore(this.score);
        }
        if (this.score >= this.requiredScore) {
            this.validate(this.message);
        }
        else {
            this.invalidate(this.message);
        }
    };

    /**
     * Waits for "delay" ms.
     * @param {Number} delay
     */
    Exercise.prototype.wait = function(delay) {
        this.synchronousManager.begin();
        var parent = this;
        this.timer = window.setTimeout(function() {
            parent.synchronousManager.end();
        }, delay);
    };

    /**
     * Set value at values[name].
     * @param {String} name
     * @param {String} value
     */
    Exercise.prototype.set = function(name, value) {
        this.values[name] = value;
    };

    /**
     * Get the value of values[name].
     * @param {String} name
     * @returns {String|Boolean}    Returns values[name], or false if undefined.
     */
    Exercise.prototype.get = function(name) {
        if (typeof this.values[name] !== 'undefined') {
            return this.values[name];
        } else {
            return false;
        }
    };

    /**
     * Print value in log.
     * @param {String} value
     */
    Exercise.prototype.log = function(value) {
        console.log(value);
    };

    /**
     * Print value in debug.
     * @param {String} value
     */
    Exercise.prototype.debug = function(value) {
        console.debug(value);
    };

    /**
     * Set Text Mode.
     */
    Exercise.prototype.setTextMode = function() {
        this.frame.setTextMode();
    };

    /**
     * Set Program Mode.
     */
    Exercise.prototype.setProgramMode = function() {
        this.frame.setProgramMode();
    };

    /**
     * Set Completions.
     */
    Exercise.prototype.setCompletions = function(json) {
        this.completions = json;
    };

    /**
     * Get classes completions.
     */
    Exercise.prototype.getDisplayedClasses = function() {
        for (var classes in completions) {
            if (typeof completions[classes] === "undefined") {
               return [];
            }
            if (typeof completions[classes] === 'object') {
                this.displayedClasses.push(classes);
            }
        }
        return this.displayedClasses;
    };

    /**
     * Get displayed methods.
     */
    Exercise.prototype.getDisplayedMethods = function(aClass){
        var displayedClass=completions[aClass];
        var displayedMethods = [];
        if (typeof displayedClass === "undefined"){
            return [];
        }
        var methods = displayedClass['methods'];
        //TODO really sort methods = TUtils.sortArray(methods);
        if (typeof methods === "Array"){
            return [];
        }

        for (var i in methods) {
            displayedMethods.push({
                caption: methods[i]["translated"],
                value: methods[i]["displayed"]
            });
        }

        return displayedMethods;
    };

    Exercise.prototype.freeze = function(value) {
    };

    Exercise.prototype.clear = function() {
        if (this.timer !== -1) {
            window.clearTimeout(this.timer);
        }
        this.synchronousManager.end();
    };

    Exercise.prototype.init = function() {
    };

    Exercise.prototype.start = function() {
    };

    Exercise.prototype.end = function() {
    };

    Exercise.prototype.check = function() {
    };

    return Exercise;
});