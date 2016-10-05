define(['jquery', 'TUI', 'TEnvironment', 'TRuntime', 'TUtils', 'TObject', 'TLink','SynchronousManager', 'TError', 'CommandManager'],
    function($, TUI, TEnvironment, TRuntime, TUtils, TObject, TLink, SynchronousManager, TError, CommandManager) {
    /**
     * Defines Declick, inherited from TObject.
     * Declick is an object created automatically with the launch of Declick.
     * It allows several interactions.
     * @exports Declick
     */
    var Declick = function()
    {
        this.synchronousManager = new SynchronousManager();
        TRuntime.addInstance(this);
        this._interruptions = [];
    };

    Declick.prototype = Object.create(TObject.prototype);
    Declick.prototype.constructor = Declick;
    Declick.prototype.className = "Declick";

    Declick.prototype.clear = function ()
    {
        this._maskGrid();
    };

    Declick.prototype._displayGrid = function ()
    {
        TRuntime.getGraphics().displayGrid();
    };

    Declick.prototype._maskGrid = function ()
    {
        TRuntime.getGraphics().maskGrid();
    };

    Declick.prototype.delay = function (callback, arguments_, duration) {
        if (typeof duration === 'undefined') {
            duration = arguments_;
        }
        var context = this;
        var identifier = window.setTimeout(function () {
            var index = context._interruptions.indexOf(identifier);
            context._interruptions.splice(index, 1);
            callback();
        }, duration);
        this._interruptions.push(identifier);
    };

        Declick.prototype.loop = function (callback) {
        var loop = new CommandManager();
        loop.addCommand(callback);
        var previousTime = Date.now(), currentTime;
        var context = this;
        var repeater = function () {
            currentTime = Date.now();
            var delay = currentTime - previousTime;
            loop.executeCommands({parameters: [delay]});
            previousTime = currentTime;
            context.delay(repeater, 0);
        };
        repeater();
    };

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
                TRuntime.handleError(statements);
            }
            var statement = TRuntime.createCallStatement(TRuntime.createFunctionStatement(statements.body));
            TRuntime.insertStatement(statement);
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
        for (var index = 0; index < this._interruptions.length; index++) {
            var interruption = this._interruptions[index];
            window.clearTimeout(interruption);
        }
        this._interruptions = [];
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
