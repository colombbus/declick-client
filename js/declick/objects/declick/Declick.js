define(['jquery', 'TUI', 'TEnvironment', 'TRuntime', 'TUtils', 'TObject', 'TLink','SynchronousManager', 'TError'], function($, TUI, TEnvironment, TRuntime, TUtils, TObject, TLink, SynchronousManager, TError) {
    /**
     * Defines Declick, inherited from TObject.
     * Declick is an object created automatically with the launch of Declick.
     * It allows several interactions.
     * @exports Declick
     */
    var Declick = function() {
        this.synchronousManager = new SynchronousManager();
        TRuntime.addInstance(this);
    };

    Declick.prototype = Object.create(TObject.prototype);
    Declick.prototype.constructor = Declick;
    Declick.prototype.className = "Declick";

    /**
     * Write "value" in logs.
     * @param {String} value
     */
    Declick.prototype._write = function(value) {
        if (TUtils.checkInteger(value)) {
            value = value.toString();
        } else {
            value = TUtils.getString(value);
        }

        TUI.addLogMessage(value);
    };

    /**
     * Write "value" in a pop-up window.
     * @param {String} value
     */
    Declick.prototype._alert = function(value) {
        if (TUtils.checkInteger(value)) {
            value = value.toString();
        } else {
            value = TUtils.getString(value);
        }
        var canvas = TUI.getCanvas();
        if (typeof canvas !== 'undefined') {
            this.synchronousManager.begin();
            var self = this;
            canvas.popup(value, function() {
                self.synchronousManager.end();
            });
        }
        //window.alert(value);
    };

    /**
     * Load a script given in parameter.
     * @param {String} name
     */
    Declick.prototype._loadScript = function(name) {
        name = TUtils.getString(name);
        this.synchronousManager.begin();
        TRuntime.refusePriorityStatements();
        var sm = this.synchronousManager;
        TLink.getProgramStatements(name, function(statements) {
            if (statements instanceof TError) {
                sm.end();
                TRuntime.allowPriorityStatements();
                TRuntime.handleError(statements)
            }
            TRuntime.insertStatements(statements.body, name);        
            sm.end();
            TRuntime.allowPriorityStatements();
        });
    };

    /**
     * Clear screen, commands history and console.
     */
    Declick.prototype._init = function() {
        TRuntime.clearGraphics();
        TRuntime.clearObjects();
    };

    /**
     * Clear screen.
     */
    Declick.prototype._clearScreen = function() {
        TRuntime.clearGraphics();
    };

    /**
     * Pause Declick. Freeze every object.
     */
    Declick.prototype._pause = function() {
        TRuntime.stop();
    };

    /**
     * Resume Declick.
     */
    Declick.prototype._unpause = function() {
        TRuntime.start();
    };
    
    /**
     * Wait for a given duration
     * @param {Integer} duration
     */
    Declick.prototype._wait = function(duration) {
        duration = TUtils.getInteger(duration);
        var self = this;
        window.setTimeout(function() {
            self.synchronousManager.end();
        }, duration);
        this.synchronousManager.begin();
    };

    /**
     * Ask a question and get the answer.
     * @param {String} text
     * @returns {String}    Returns the user's answer.
     */
    Declick.prototype._ask = function(text) {
        var answer = window.prompt(text);
        if (answer === null || answer.length === 0)
            return false;
        else
            return answer;
    };
    
    
    /**
     * Interrupt execution
     */
    Declick.prototype._interrupt = function() {
        TRuntime.interrupt();
    };
    
    Declick.prototype.freeze = function(value) {
    };

    Declick.prototype.clear = function() {
        this.synchronousManager.end();
    };

    Declick.prototype.init = function() {
    };

    var declickInstance = new Declick();

    return declickInstance;
});
