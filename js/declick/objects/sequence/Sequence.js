define(['TObject', 'TUtils', 'CommandManager'], function(TObject, TUtils, CommandManager) {
    /**
     * Defines Sequence, inherited from TObject.
     * A sequence can save commands, with or without a delay between,
     * then execute them one after another.
     * It can execute commands endlessly or only one time.
     * @exports Sequence
     */
    var Sequence = function() {
        TObject.call(this);
        this.actions = new Array();
        this.index = -1;
        this.running = false;
        this.frozen = false;
        this.timeout = null;
        this.loop = false;
        this.wasRunning = false;
        this.logCommands = true;
    };

    Sequence.prototype = Object.create(TObject.prototype);
    Sequence.prototype.constructor = Sequence;
    Sequence.prototype.className = "Sequence";

    Sequence.TYPE_COMMAND = 0x01;
    Sequence.TYPE_DELAY = 0x02;
    Sequence.MINIMUM_LOOP = 100;

    /**
     * Add a command to Sequence.
     * @param {String} command
     */
    Sequence.prototype._addCommand = function(command) {
        command = TUtils.getCommand(command);
        if (this.actions.length>0 && this.actions[this.actions.length-1].type === Sequence.TYPE_COMMAND) {
            var cm = this.actions[this.actions.length-1].value;
            cm.addCommand(command);
        } else {
            var cm = new CommandManager();
            cm.addCommand(command);
            this.actions.push({type: Sequence.TYPE_COMMAND, value: cm});
        }
    };

    /**
     * Add a delay between commands.
     * @param {Number} delay    (ms)
     */
    Sequence.prototype._addDelay = function(delay) {
        delay = TUtils.getInteger(delay);
        this.actions.push({type: Sequence.TYPE_DELAY, value: delay});
    };

    /**
     * Execute the next command of Sequence (after waiting if there's a delay).
     */
    Sequence.prototype.nextAction = function() {
        this.timeout = null;
        this.index++;
        if (this.actions.length > 0 && this.running) {
            if (this.index >= this.actions.length) {
                if (this.loop) {
                    this.index = 0;
                } else {
                    // last action reached: we stop here
                    this.running = false;
                    return;
                }
            }
            var action = this.actions[this.index];
            if (action.type === Sequence.TYPE_COMMAND) {
                // execute commands
                var cm = action.value;
                cm.logCommands(this.logCommands)
                cm.executeCommands();
                this.nextAction();
            } else if (action.type === Sequence.TYPE_DELAY) {
                var self = this;
                this.timeout = window.setTimeout(function() {
                    self.nextAction();
                }, action.value);
            }
        }
    };

    /**
     * Start the execution of Sequence.
     * If Sequence is already running, restart it.
     */
    Sequence.prototype._start = function() {
        if (this.running) {
            // Sequence is already running: restart it
            this._stop();
        }
        this.running = true;
        this.index = -1;
        this.nextAction();
    };

    /**
     * Stop the execution of Sequence.
     */
    Sequence.prototype._stop = function() {
        this.running = false;
        this.index = -1;
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    };

    /**
     * Pause the execution of Sequence. It can resume after.
     */
    Sequence.prototype._pause = function() {
        this.running = false;
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    };


    /**
     * Resume the execution of Sequence.
     */
    Sequence.prototype._unpause = function() {
        this.running = true;
        this.nextAction();
    };

    /**
     * Delete Sequence.
     */
    Sequence.prototype.deleteObject = function() {
        this._stop();
        TObject.prototype.deleteObject.call(this);
    };

    /**
     * Enable or disable loops for the execution of Sequence.
     * If it enable it, check the total delay of a loop.
     * If it's under the delay of MINIMUM_LOOP, throw a freeze warning.
     * Default value : false.
     * @param {Boolean} value
     */
    Sequence.prototype._loop = function(value) {
        value = TUtils.getBoolean(value);
        if (value) {
            // WARNING: in order to prevent Declick from freezing, check that there is at least a total delay of MINIMUM_LOOP in actions
            var totalDelay = 0;
            for (var i = 0; i < this.actions.length; i++) {
                var action = this.actions[i];
                if (action.type === Sequence.TYPE_DELAY) {
                    totalDelay += action.value;
                }
            }
            if (totalDelay < Sequence.MINIMUM_LOOP) {
                throw new Error(this.getMessage("freeze warning", Sequence.MINIMUM_LOOP));
            }
        }
        this.loop = value;
    };

    /**
     * Freeze or unfreeze Sequence.
     * @param {Boolean} value
     */
    Sequence.prototype.freeze = function(value) {
        TObject.prototype.freeze.call(value);
        if (value !== this.frozen) {
            if (value) {
                this.wasRunning = this.running;
                this._pause();
                this.frozen = true;
            } else {
                if (this.wasRunning) {
                    this._unpause();
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
    Sequence.prototype._displayCommands = function(value) {
        value = TUtils.getBoolean(value);
        this.logCommands = value;
    };

    return Sequence;
});


