define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'SynchronousManager', 'TObject', 'TRuntime'], function($, TEnvironment, TUtils, CommandManager, SynchronousManager, TObject, TRuntime) {
    /**
     * Defines KeyStroke, inherited from TObject.
     * Allows the association of commands with keyboard.
     * @exports KeyStroke
     */
    var KeyStroke = function() {
        TObject.call(this);
        this.commands = new CommandManager();
        this.active = true;
        this.keyDown = false;
        this.keyboardEnabled = false;
        this.checkAllKeysUp = false;
        this.keys = new Array();
        var that = this;
        this.listenerKeyDown = function(e) {
            that.processKeyDown(e);
            e.preventDefault();
        };
        this.listenerKeyUp = function(e) {
            that.processKeyUp(e);
            e.preventDefault();
        };
        this.enableKeyboard();
        this.synchronousManager = new SynchronousManager();        
    };

    KeyStroke.prototype = Object.create(TObject.prototype);
    KeyStroke.prototype.constructor = KeyStroke;
    KeyStroke.prototype.className = "KeyStroke";

    /**
     * Returns the Keycode of a key.
     * @param {String} key
     * @returns {Number}    Keycode corresponding to key.
     */
    KeyStroke.prototype.getKeyCode = function(key) {
        key = TUtils.removeAccents(key);
        key = this.getMessage(key);
        var code = TUtils.getkeyCode(key);
        if (code === false) {
            throw new Error(TUtils.format(this.getMessage("unknown key"), key));
        }
        return code;
    };

    /**
     * Enable the possibility to use keyboard.
     * @returns {Boolean}   Returns false if already enabled.
     */
    KeyStroke.prototype.enableKeyboard = function() {
        if (this.keyboardEnabled) {
            return false;
        }

        var element = TRuntime.getGraphics().getElement();
        
        if (typeof element !== 'undefined') {

            // Copied from Quintus_input
            element.tabIndex = 0;
            element.style.outline = 0;

            element.addEventListener("keydown", this.listenerKeyDown, false);
            element.addEventListener("keyup", this.listenerKeyUp, false);

            this.keyboardEnabled = true;
        }
    };

    /**
     * Disable the possibility to use keyboard.
     * @returns {Boolean}   Returns false if already disabled.
     */
    KeyStroke.prototype.disableKeyboard = function() {
        if (!this.keyboardEnabled) {
            return false;
        }
        var element = TRuntime.getGraphics().getElement();

        element.removeEventListener("keydown", this.listenerKeyDown, false);
        element.removeEventListener("keyup", this.listenerKeyUp, false);

        this.keyboardEnabled = false;
    };

    /**
     * Associate a command to key.
     * @param {String} key
     * @param {String} command  Command triggered if key is pressed
     */
    KeyStroke.prototype._addCommand = function(key, command) {
        key = TUtils.getString(key);
        command = TUtils.getCommand(command);
        var keycode = this.getKeyCode(key);
        if (keycode !== false) {
            this.keys[keycode] = false;
            this.commands.addCommand(command, keycode + "_down");
        }
        //TODO: find a better way
        if (!this.keyboardEnabled) {
            this.enableKeyboard();
        }
    };

    /**
     * Remove all commands associated to key.
     * @param {String} key
     */
    KeyStroke.prototype._removeCommands = function(key) {
        key = TUtils.getString(key);
        var keycode = this.getKeyCode(key);
        if (keycode !== false) {
            this.commands.removeCommands(keycode + "_down");
            if (!this.commands.hasCommands(keycode + "up")) {
                this.keys[keycode] = undefined;
            }
        }
    };

    /**
     * Add a command when one, or all keys are released.
     * Have two purposes, depending on the number of parameters :
     * - 1 : "param1" will be executed if all keys are released.
     * - 2 : "param2" will be executed if the key "param1" is released.
     * @param {String} param1
     * @param {String} param2
     */
    KeyStroke.prototype._addCommandRelease = function(param1, param2) {
        var key, command;
        if (typeof param2 !== 'undefined') {
            key = param1;
            command = param2;
        } else {
            command = param1;
        }
        command = TUtils.getCommand(command);
        if (TUtils.checkString(key)) {
            // command to be launched when a given key is released
            var keycode = this.getKeyCode(key);
            if (keycode !== false) {
                this.keys[keycode] = false;
                this.commands.addCommand(command, keycode + "_up");
            }
        } else {
            // command to be launched when all keys are released
            this.commands.addCommand(command, "key_up_all");
            this.checkAllKeysUp = true;
        }
        //TODO: find a better way
        if (!this.keyboardEnabled) {
            this.enableKeyboard();
        }        
    };

    /**
     * Have two purposes, depending on the number of parameters :
     * - 0 : Remove all commands associated with the release of all keys.
     * - 1 : Remove all commands associated with the release of key.
     * @param {String} key
     */
    KeyStroke.prototype._removeCommandRelease = function(key) {
        if (TUtils.checkString(key)) {
            // remove commands to be launched when a given key is released
            var keycode = this.getKeyCode(key);
            if (keycode !== false) {
                this.commands.removeCommands(keycode + "_up");
                if (!this.commands.hasCommands(keycode + "down")) {
                    this.keys[keycode] = undefined;
                }
            }
        } else {
            // remove commands to be launched when all keys are released
            this.commands.removeCommands("key_up_all");
            this.checkAllKeysUp = false;
        }
    };

    /**
     * Enable the management of keys.
     */
    KeyStroke.prototype._activate = function() {
        this.active = true;
    };

    /**
     * Disable the management of keys.
     */
    KeyStroke.prototype._deactivate = function() {
        if (this.active) {
            this.active = false;
            for (var keycode in this.keys) {
                this.keys[keycode] = false;
            }
        }
    };

    /**
     * Delete all commands associated to KeyStroke, and delete it.
     */
    KeyStroke.prototype.deleteObject = function() {
        // remove listeners
        this.disableKeyboard();

        // delete commands
        for (var keycode in this.keys) {
            this.commands.removeCommands(keycode + "_down");
            this.commands.removeCommands(keycode + "_up");
        }
        this.commands.removeCommands("key_up_all");
        this.commands = undefined;

        // delete keys
        this.keys.length = 0;
        this.keys = undefined;

        TObject.prototype.deleteObject.call(this);
    };

    /**
     * Checks which keys are down and execute associated commands.
     * @param {type} e
     */
    KeyStroke.prototype.processKeyDown = function(e) {
        if (this.active) {
            if (this.waiting) {
                this.waiting = false;
                this.synchronousManager.end();
            }            
            var keycode = e.keyCode;
            this.commands.executeCommands({'field': keycode + "_down"});
            this.keys[keycode] = true;

        }
    };
    
    /**
     * Checks which keys are up and execute associated commands.
     * @param {type} e
     */
    KeyStroke.prototype.processKeyUp = function(e) {
        if (this.active) {
            var keycode = e.keyCode;
            this.commands.executeCommands({'field': keycode + "_up"});
            this.keys[keycode] = false;
            if (this.checkAllKeysUp) {
                for (var value in this.keys) {
                    if (this.keys[value]) {
                        // there is still a key down: we skip the test
                        return;
                    }
                }
                this.commands.executeCommands({'field': "key_up_all"});
            }
        }
    };

    /**
     * Enable or disable keyboard depending on value, and freeze it.
     * @param {Boolean} value
     */
    KeyStroke.prototype.freeze = function(value) {
        if (value) {
            this.disableKeyboard();
        } else {
            this.enableKeyboard();
        }
        TObject.prototype.freeze.call(this, value);
    };

    /**
     * Enable or disable the display of commands.
     * @param {Boolean} value
     */
    KeyStroke.prototype._displayCommands = function(value) {
        value = TUtils.getBoolean(value);
        this.commands.logCommands(value);
    };

    return KeyStroke;
});



