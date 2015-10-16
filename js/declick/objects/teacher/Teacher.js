define(['jquery', 'TEnvironment', 'TRuntime', 'TUtils', 'SynchronousManager', 'TObject', 'TLink'], function($, TEnvironment, TRuntime, TUtils, SynchronousManager, TObject, TLink) {
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
    var values = {};
    var message = "";
    var scoreLimit = 0.5;
    var score = 0;
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
    }
    
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
     * Set message to "value".
     * @param {string} value
     */
    Teacher.prototype.setMessage = function(value) {
        message = value;
    };
    
    function getMessage() {
        if(typeof message === "undefined") {
            message = "Message indéfini.";
        }
        return message;
    };
    
     /**
     * Get the value of message.
     * @returns {string}
     */
    Teacher.prototype.getMessage = function() {
        return getMessage();
    };
    
    /**
     * Changes the score.
     * @param {Number} value
     */
    Teacher.prototype.setScore = function(value) {
        if(-1e-10 < value && value < 1 + 1e-10) {
            score = value;
        }
        else {
            log("Score must be between 0 and 1.");
        }
    };
    
    /**
     * Returns the score.
     * @returns {Number}
     */
    Teacher.prototype.getScore = function() {
        return score;
    };
    
    function validateStep(message) {
        if (frame) {
            frame.validateStep(message);
        }
    };
    
    /**
     * Validate the current step if "frame" is true
     * @param {String} message
     */
    Teacher.prototype.validateStep = function(message) {
        validateStep(message);
    };

    function invalidateStep(message) {
        if (frame) {
            frame.invalidateStep(message);
        }
    };
    
    /**
     * Invalidate the current step if "frame" is true. Send a message.
     * @param {String} message
     */
    Teacher.prototype.invalidateStep = function(message) {
        invalidateStep(message);
    };
    
    /**
     * Set the score needed to validate
     * @param {number} value
     */
    Teacher.prototype.scoreToValidate = function(value) {
        if (value < 0.5) {
           log("Fixed score to validate is too low.");
        }
        scoreLimit = value;
    };
    
    function taskValidated() {
        return score > scoreLimit - 1e-10;
    };
    
    /**
     * Check if the current score is sufficiently high to validate the task
     * @returns {Boolean}
     */
    Teacher.prototype.taskValidated = function() {
        return taskValidated();
    };
    
    /**
     * Validate or invalidate the task, need to be appeal by 
     * @param {String} value1 is an optionnal message
     * @param {String} value2 is an optionnal score
     */
    Teacher.prototype.done = function(value1, value2) {
        if(typeof value1 !== "undefined") {
           message = value1;
        }
        if(typeof value2 !== "undefined") {
           score = value2;
        }
        if (taskValidated()) {
            validateStep(getMessage());
        }
        else {
            invalidateStep(getMessage());
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
     * Checks if two numbers have the same value.
     * @param {Number} x
     * @param {Number} y
     * @returns {Boolean}
     */
    Teacher.prototype.equalNumbers = function(x, y) {
        if (Math.abs(x - y) < 0.0000000001) {
            return true;
        }
        return false;
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
     * Set Comletions.
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