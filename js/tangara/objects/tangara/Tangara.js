define(['jquery', 'TUI', 'TEnvironment', 'TRuntime', 'TUtils', 'TObject', 'TLink'], function($, TUI, TEnvironment, TRuntime, TUtils, TObject, TLink) {
    /**
     * Defines Tangara, inherited from TObject.
     * Tangara is an object created automatically with the launch of Declick.
     * It allows several interactions.
     * @exports Tangara
     */
    var Tangara = function() {
        TRuntime.addInstance(this);
    };

    Tangara.prototype = Object.create(TObject.prototype);
    Tangara.prototype.constructor = Tangara;
    Tangara.prototype.className = "Tangara";

    /**
     * Write "value" in logs.
     * @param {String} value
     */
    Tangara.prototype._write = function(value) {
        if (TUtils.checkInteger(value)) {
            value = value.toString();
            //tangara.écrire(5);
        } else {
            value = TUtils.getString(value);
        }

        TUI.addLogMessage(value);
    };

    /**
     * Write "value" in a pop-up window.
     * @param {String} value
     */
    Tangara.prototype._alert = function(value) {
        if (TUtils.checkInteger(value)) {
            value = value.toString();
            //tangara.écrire(5);
        } else {
            value = TUtils.getString(value);
        }
        window.alert(value);
    };

    /**
     * Load a script given in parameter.
     * @param {String} name
     */
    Tangara.prototype._loadScript = function(name) {
        name = TUtils.getString(name);
        TLink.getProgramStatements(name, function(statements) {
            TRuntime.executeStatements(statements, name);        
        });
    };

    /**
     * Clear screen, commands history and console.
     */
    Tangara.prototype._init = function() {
        TRuntime.clear();
    };

    /**
     * Clear screen.
     */
    Tangara.prototype._clearScreen = function() {
        TRuntime.clearGraphics();
    };

    /**
     * Pause Declick. Freeze every object.
     */
    Tangara.prototype._pause = function() {
        TRuntime.stop();
    };

    /**
     * Resume Declick.
     */
    Tangara.prototype._unpause = function() {
        TRuntime.start();
    };

    /**
     * Ask a question and get the answer.
     * @param {String} text
     * @returns {String}    Returns the user's answer.
     */
    Tangara.prototype._ask = function(text) {
        var answer = window.prompt(text);
        if (answer === null || answer.length === 0)
            return false;
        else
            return answer;
    };
    
    
    /**
     * Interrupt execution
     */
    Tangara.prototype._interrupt = function() {
        TRuntime.interrupt();
    };
    
    Tangara.prototype.freeze = function(value) {
    };

    Tangara.prototype.clear = function() {
    };


    var tangaraInstance = new Tangara();

    return tangaraInstance;
});
