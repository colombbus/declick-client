define(['TRuntime', 'SynchronousManager', 'TObject'], function(TRuntime, SynchronousManager, TObject) {
    /**
     * Defines Teacher, inherited from TObject.
     * Teacher is an object used to validate routes.
     * It compares values with statements, and can (un)validate steps.
     * @exports Teacher
     */
    var Teacher = function() {
        // Do not call parent constructor, as we don't want this object to be erased when clearing the
        // Runtime
        this.synchronousManager = new SynchronousManager();
        TRuntime.addInstance(this);
    };

    Teacher.prototype = Object.create(TObject.prototype);
    Teacher.prototype.constructor = Teacher;
    Teacher.prototype.className = "Teacher";

    //Learn.countObject

    var statements = [];
    var frame = false;
    var score = 0;
    var message = "";
    var values = {};
    var requiredScore = 1;
    var displayedClasses = [];
    var displayedMethods = [];
    var completions = {};
    var timer = -1;
    
    
    /**
     * Set the array of statements.
     * @param {String[]} value
     */
    Teacher.prototype.setStatements = function(value) {
        statements = value;
    };

    /**
     * Print Statements in debug.
     * @param {String} value
     */
    Teacher.prototype.dumpStatements = function(value) {
        console.debug(statements);
    };

    /**
     * Set frame to "value".
     * @param {Boolean} value
     */
    Teacher.prototype.setFrame = function(value) {
        frame = value;
    };

    /**
     * Checks if all contents of "value" are in "statement".
     * @param {String[]} statement
     * @param {String[]} value
     * @returns {Boolean}
     */
    function check(statement, value) {
        for (var key in value) {
            // special case of length
            if (key === "length") {
                if (typeof statement.length === "undefined") {
                    return false;
                }
                if (value.length !== statement.length) {
                    return false;
                }
                return true;
            }
            if (typeof statement[key] === "undefined") {
                return false;
            }
            if (typeof value[key] === 'object') {
                if (typeof statement[key] === 'object') {
                    if (!check(statement[key], value[key])) {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                if (value[key] !== statement[key]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Check if "value" is in the array "statement".
     * @param {String} value
     * @returns {Boolean} Returns true if value is in statement, else false.
     */
    Teacher.prototype.hasStatement = function(value) {
        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];
            if (check(statement, value)) {
                return true;
            }
        }
        return false;
    };
    
    /**
     * Returns the number of statements.
     * @returns {Number}
     */
    Teacher.prototype.statementsLength = function()
    {
        return (statements.length);
    };
    
    /**
     * Check if the code matches with the regexp
     * /!\ to verify "o = new O()", don't forget the \ before parenthesis
     * /!\ abort the syntax verification of the code 
     * @param {String} value
     * @returns {Boolean} Returns true if the code matches with the regexp, else false.
     */
    Teacher.prototype.verifyRegexp = function(value) {
        var re = new RegExp(value);
        return re.test(statements);
    };
    
    /**
     * Set the score
     * @param {Number} value
     */
    Teacher.prototype.setScore = function(value) {
        score = value;
    };

    /**
     * Set the message.
     * @param {Number} value
     */
    Teacher.prototype.setMessage = function(value) {
        message  = value;
    };
    
    
    /**
     * Validate the current exercise if "frame" is true
     * @param {String} message
     */
    Teacher.prototype.validate = function(message) {
        if (frame) {
            frame.validateExercise(message);
        }
    };

    /**
     * Invalidate the current exercise if "frame" is true. Send a message.
     * @param {String} message
     */
    Teacher.prototype.invalidate = function(message) {
        if (frame) {
            frame.invalidateExercise(message);
        }
    };
    
    /**
     * Set the score needed to validate
     * @param {number} value
     */
    Teacher.prototype.setRequiredScore = function(value) {
        requiredScore = value;
    };
    

    /**
     * Validate or invalidate the task, need to be appeal by 
     * @param {String} optMessage is an optionnal message
     * @param {Number} optScore is an optionnal score
     */
    Teacher.prototype.done = function(optMessage, optScore) {
        if(typeof optScore !== "undefined") {
           this.setScore(optScore);
        }
        if(typeof optMessage !== "undefined") {
           this.setMessage(optMessage);
        }
        if (frame) {
            frame.setScore(score);
        }
        if (score >= requiredScore) {
            this.validate(message);
        }
        else {
            this.invalidate(message);
        }
    };
    
    /**
     * Waits for "delay" ms.
     * @param {Number} delay
     */
    Teacher.prototype.wait = function(delay) {
        this.synchronousManager.begin();
        var parent = this;
        timer = window.setTimeout(function() {
            parent.synchronousManager.end();
        }, delay);
    };

    /**
     * Set value at values[name].
     * @param {String} name
     * @param {String} value
     */
    Teacher.prototype.set = function(name, value) {
        values[name] = value;
    };

    /**
     * Get the value of values[name].
     * @param {String} name
     * @returns {String|Boolean}    Returns values[name], or false if undefined.
     */
    Teacher.prototype.get = function(name) {
        if (typeof values[name] !== 'undefined') {
            return values[name];
        } else {
            return false;
        }
    };

    /**
     * Print value in log.
     * @param {String} value
     */
    Teacher.prototype.log = function(value) {
        console.log(value);
    };

    /**
     * Print value in debug.
     * @param {String} value
     */
    Teacher.prototype.debug = function(value) {
        console.debug(value);
    };
    
    /**
     * Set Text Mode.
     */
    Teacher.prototype.setTextMode = function() {
        frame.setTextMode();
    };

    /**
     * Set Program Mode.
     */
    Teacher.prototype.setProgramMode = function() {
        frame.setProgramMode();
    };
    
    /**
     * Set Completions.
     */
    Teacher.prototype.setCompletions = function(json) {
        completions = json;
    };
    
    /**
     * Get classes completions.
     */
    Teacher.prototype.getDisplayedClasses = function() {
        for (var classes in completions) {
            if (typeof completions[classes] === "undefined") {
               return [];
            }
            if (typeof completions[classes] === 'object') {
                displayedClasses.push(classes);
            }
        }
        return displayedClasses;
    };
	
	/**
     * Get displayed methods.
     */
    Teacher.prototype.getDisplayedMethods = function(aClass){
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
	
    Teacher.prototype.freeze = function(value) {
    };

    Teacher.prototype.clear = function() {
        if (timer !== -1) {
            window.clearTimeout(timer);
        }
        this.synchronousManager.end();
    };
    
    Teacher.prototype.init = function() {
    };
    
    var teacherInstance = new Teacher();

    return teacherInstance;
});