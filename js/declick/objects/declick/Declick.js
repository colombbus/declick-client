define(['jquery', 'TUI', 'TEnvironment', 'TRuntime', 'TUtils', 'TObject', 'TLink'], function($, TUI, TEnvironment, TRuntime, TUtils, TObject, TLink) {
    /**
     * Defines Declick, inherited from TObject.
     * Declick is an object created automatically with the launch of Declick.
     * It allows several interactions.
     * @exports Declick
     */
    var Declick = function() {
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
        window.alert(value);
    };

    /**
     * Load a script given in parameter.
     * @param {String} name
     */
    Declick.prototype._loadScript = function(name) {
        name = TUtils.getString(name);
        TLink.getProgramStatements(name, function(statements) {
            TRuntime.executeStatements(statements, name);        
        });
    };

    /**
     * Clear screen, commands history and console.
     */
    Declick.prototype._init = function() {
        TRuntime.clear();
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
    };


    var declickInstance = new Declick();

    return declickInstance;
});
