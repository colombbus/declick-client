define(['TRuntime', 'TUtils', 'TParser', 'TLink', 'TEnvironment'], function(TRuntime, TUtils, TParser, TLink, TEnvironment) {
    /**
     *
     * @exports CommandManager
     */
    var CommandManager = function() {
        this.commands = [];
        this.enabled = {};
        this.enabled._default = true;
        this.logging = true;
    };

    /**
     * Add a new command.
     * @param {String} command  Command to be added
     * @param {String} field  Field associated to the command ; can be empty
     */
    CommandManager.prototype.addCommand = function(command, field) {
        var i;
        if (TUtils.checkString(command)) {
            // command is a string: we check if it is the name of a program
            var project = TEnvironment.getProject();
            var statements;
            if (project.hasProgram(command)){
                TLink.getProgramStatements(command, function(value) {
                    statements = value;
                }, false);
                command = TRuntime.createCallStatement(TRuntime.createFunctionStatement(statements.body));
            } else {
                // Not the name of a program: we parse it
                command = TParser.parse(command).body;
            }
        } else if (TUtils.checkFunction(command)) {
            command = TRuntime.createCallStatement(command);
        }
        if (typeof field === 'undefined') {
            // simple command provided
            for (i = 0; i < command.length; i++) {
                this.commands.push(command[i]);
            }
        } else {
            // command with associated field
            if (typeof this.commands[field] === 'undefined') {
                this.commands[field] = [];
                this.enabled[field] = true;
            }
            for (i = 0; i < command.length; i++) {
                this.commands[field].push(command[i]);
            }
        }
    };

    /**
     * Removes all commands of field,
     * or all simples commands if field is undefined.
     * @param {String} field
     */
    CommandManager.prototype.removeCommands = function(field) {
        if (typeof field === 'undefined') {
            this.commands.length = 0;
        } else if (typeof this.commands[field] !== 'undefined') {
            this.commands[field] = undefined;
        }
    };

    /**
     * Execute commands, depending of parameters.
     * @param {String[]} parameters
     */
    CommandManager.prototype.executeCommands = function(parameters) {
        // TODO: handle parameters
        var i, cmdParameters, field;
        var self = this;
        if (typeof parameters !== 'undefined') {
            if (typeof parameters.field !== 'undefined') {
                field = parameters.field;
            }
            if (typeof parameters.parameters !== 'undefined') {
                cmdParameters = parameters.parameters;
            }
        }
        if (typeof field === 'undefined' ) {
            if (this.enabled._default) {
                this.enabled._default = false;
                TRuntime.executeNow(this.commands, cmdParameters, this.logging, function() {
                    self.enabled._default = true;
                });
            }
        } else if (typeof this.commands[field] !== 'undefined' && this.enabled[field]) {
            this.enabled[field] = false;
            TRuntime.executeNow(this.commands[field], cmdParameters, this.logging, function() {
                self.enabled[field] = true;
            });
        }
    };

    /**
     * Check if field has associated commands.
     * If field is empty, check if there is simple commands.
     * @param {type} field
     * @returns {Boolean}   Returns true if at least one command is found,
     * else false.
     */
    CommandManager.prototype.hasCommands = function(field) {
        if (typeof field === 'undefined') {
            return this.commands.length > 0;
        } else {
            return ((typeof this.commands[field] !== 'undefined') && (this.commands[field].length > 0));
        }
    };

    /**
     * Enable or disable the log of commands.
     * Default value : true.
     * @param {Boolean} value
     */
    CommandManager.prototype.logCommands = function(value) {
        this.logging = value;
    };

    return CommandManager;
});
