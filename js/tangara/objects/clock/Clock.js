define(['jquery', 'TEnvironment', 'TObject', 'TUtils', 'CommandManager'], function($, TEnvironment, TObject, TUtils, CommandManager) {
    /**
     * Defines Clock, inherited from TObject.
     * A clock can execute commands after waiting a delay.
     * It can execute this commands endlessly or only one time.
     * @exports Clock
     */
    var Clock = function() {
        TObject.call(this);
        this.commands = new CommandManager();
        this.delay = 1000;
        this.initialDelay = false;
        this.running = false;
        this.wasRunning = false;
        this.timeout = null;
        this.loop = true;
        this.frozen = false;
    };

    Clock.prototype = Object.create(TObject.prototype);
    Clock.prototype.constructor = Clock;
    Clock.prototype.className = "Clock";

    /**
     * Add a command to Clock.
     * @param {String} command
     */
    Clock.prototype._addCommand = function(command) {
        command = TUtils.getCommand(command);
        this.commands.addCommand(command);
    };

    /**
     * Remove all commands to Clock.
     */
    Clock.prototype._removeCommands = function() {
        this.commands.removeCommands();
    };

    /**
     * Set a Delay between the execution of two commands.
     * If no initial delay is defined, set it to the same value.
     * Default value : 1000 ms.
     * @param {Number} delay    (ms)
     */
    Clock.prototype._setDelay = function(delay) {
        delay = TUtils.getInteger(delay);
        this.delay = delay;
        if (this.initialDelay === false) {
            this._setInitialDelay(delay);
        }
    };

    /**
     * Set the initial Delay before the execution of the commands,
     * and after each loop.
     * @param {Number} delay    (ms)
     */
    Clock.prototype._setInitialDelay = function(delay) {
        delay = TUtils.getInteger(delay);
        this.initialDelay = delay;
    };

    /**
     * Start the execution of Clock.
     */
    Clock.prototype._start = function() {
        if (!this.running) {
            this.running = true;
            var self = this;
            this.timeout = window.setTimeout(function() {
                self.executeActions();
            }, this.initialDelay);
        }
    };

    /**
     * Stop the execution of Clock.
     */
    Clock.prototype._stop = function() {
        this.running = false;
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    };

    /**
     * Execute actions linked to Clock.
     */
    Clock.prototype.executeActions = function() {
        this.timeout = null;
        if (this.running) {
            this.commands.executeCommands();
            if (this.loop) {
                var self = this;
                this.timeout = window.setTimeout(function() {
                    self.executeActions();
                }, this.delay);
            } else {
                this._stop();
            }
        }
    };

    /**
     * Delete Clock.
     */
    Clock.prototype.deleteObject = function() {
        this._stop();
        TObject.prototype.deleteObject.call(this);
    };

    /**
     * Enable or disable loops for the execution of Clock.
     * Default value : true.
     * @param {Boolean} value
     */
    Clock.prototype._loop = function(value) {
        value = TUtils.getBoolean(value);
        this.loop = value;
    };

    /**
     * Freeze of unfreeze Clock.
     * @param {Boolean} value
     */
    Clock.prototype.freeze = function(value) {
        TObject.prototype.freeze.call(value);
        if (value !== this.frozen) {
            if (value) {
                this.wasRunning = this.running;
                this._stop();
                this.frozen = true;
            } else {
                if (this.wasRunning) {
                    this._start();
                }
                this.frozen = false;
            }
        }
    };

    /**
     * Enable or disable the display of commands.
     * Default value : true.
     * @param {type} value
     */
    Clock.prototype._displayCommands = function(value) {
        value = TUtils.getBoolean(value);
        this.commands.logCommands(value);
    };

    return Clock;
});


