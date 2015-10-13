define(['ui/TComponent', 'jquery', 'ace/ace', 'ace/edit_session', 'ace/range', 'ace/undomanager', 'ace/autocomplete', 'TEnvironment', 'TUI', 'TUtils', 'TRuntime'], function(TComponent, $, ace, ace_edit_session, ace_range, ace_undo_manager, ace_autocomplete, TEnvironment, TUI, TUtils, TRuntime) {
    /**
     * TEditor manages the editor console. It runs with lib ace.
     * @param {Function} callback
     * @exports {TEditor}
     */
    function TEditor(callback) {
        var $editor;

        TComponent.call(this, {id: "teditor"}, function(component) {
            $editor = component;
            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        var aceEditor;
        var codeChanged = false;
        var program;
        var AceEditSession = ace_edit_session.EditSession;
        var AceUndoManager = ace_undo_manager.UndoManager;
        var AceRange = ace_range.Range;
        var AceAutocomplete = ace_autocomplete.Autocomplete;
        var errorMarker = null;
        var disabled = false;
        var disabledSession = new AceEditSession('');
        var disabledMessage = document.createElement("div");
        disabledMessage.id = "disabled-message";
        var disabledP = document.createElement("p");
        var disabledText = TEnvironment.getMessage("editor-disabled");
        disabledP.appendChild(document.createTextNode(disabledText));
        disabledMessage.appendChild(disabledP);
        var $disabledMessage = $(disabledMessage);

        var popupTriggered = false;
        var popupTimeout;
        var triggerPopup = false;
        var editionEnabled = false;

        /**
         * Initialize Editor.
         */
        this.displayed = function() {
            aceEditor = ace.edit($editor.attr("id"));
            aceEditor.setShowPrintMargin(false);
            //aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);
            aceEditor.setBehavioursEnabled(false);

            var self = this;
            aceEditor.on('input', function() {
                if (!program.isModified() && editionEnabled) {
                    program.setModified(true);
                    TUI.updateSidebarPrograms();
                }
                codeChanged = true;
                self.removeError();
                if (triggerPopup) {
                    triggerPopup = false;
                    popupTimeout = setTimeout(function() {
                        popupTriggered = false;
                        AceAutocomplete.startCommand.exec(aceEditor);
                    }, 800);
                    popupTriggered = true;
                } else if (popupTriggered) {
                    clearTimeout(popupTimeout);
                    popupTriggered = false;
                }
            });
            aceEditor.commands.addCommand({
                name: "save",
                bindKey: {win: "Ctrl-S", mac: "Command-S"},
                exec: function(arg) {
                    if (editionEnabled) {
                        TUI.saveProgram();
                    }
                }
            });

            aceEditor.commands.addCommand({
                name: "execute",
                bindKey: {win: "Ctrl-Return", mac: "Command-Return"},
                exec: function(arg) {
                    TUI.execute();
                }
            });

            aceEditor.completers = [editorCompleter];

            this.enableMethodHelper();

            // disable editor, waiting for a program to edit
            this.disable();
        };

        /**
         * Show Editor.
         */
        this.show = function() {
            $editor.show();
            aceEditor.focus();
        };

        /**
         * Hide Editor.
         */
        this.hide = function() {
            $editor.hide();
        };

        /**
         * Get code in Editor.
         * @returns {String}
         */
        this.getValue = function() {
            var simpleText = aceEditor.getSession().getValue();
            var protectedText = TUtils.addQuoteDelimiters(simpleText);
            var command = TUtils.parseQuotes(protectedText);
            return command;
        };

        /**
         * Update Program & get statements of Program's code.
         * @returns {Statement[]}
         */
        this.getStatements = function() {
            this.updateProgram();
            return program.getStatements();
        };

        /**
         * Update Program's code.
         */
        this.updateProgram = function() {
            if (codeChanged) {
                program.setCode(this.getValue());
                codeChanged = false;
            }
        };

        /**
         * Returns current Program.
         * @returns {TProgram}
         */
        this.getProgram = function() {
            return program;
        };

        /**
         * Set a Program.
         * @param {TProgram} value
         */
        this.setProgram = function(value) {
            program = value;
            codeChanged = true;
        };

        /**
         * Returns Program's name.
         * @returns {String}
         */
        this.getProgramName = function() {
            return program.getName();
        };

        /**
         * Set Session.
         * @param {Session} session
         */
        this.setSession = function(session) {
            if (disabled) {
                aceEditor.setReadOnly(false);
                aceEditor.renderer.setShowGutter(true);
                $editor.removeClass('editor-disabled');
                $disabledMessage.remove();
                disabled = false;
                TUI.setEditionEnabled(true);
            }
            aceEditor.setSession(session);
        };

        /**
         * Returns current Session.
         * @returns {Session}
         */
        this.getSession = function() {
            return aceEditor.getSession();
        };

        /**
         * Reset current Session.
         */
        this.reset = function() {
            var undo = aceEditor.getSession().getUndoManager();
            undo.reset();
            codeChanged = false;
        };

        /**
         * Brings the current `textInput` into focus.
         */
        this.giveFocus = function() {
            aceEditor.focus();
        };

        /**
         * Disable Editor.
         */
        this.disable = function() {
            aceEditor.setSession(disabledSession);
            aceEditor.setReadOnly(true);
            aceEditor.renderer.setShowGutter(false);
            $editor.addClass('editor-disabled');
            $editor.append($disabledMessage);
            TUI.setEditionEnabled(false);
            disabled = true;
        };

        /**
         * Remove error marker.
         */
        this.removeError = function() {
            if (errorMarker !== null) {
                aceEditor.getSession().removeMarker(errorMarker);
                errorMarker = null;
            }
        };

        /**
         * Set an error on a line or a range of lines :
         * - One number : Set an error on lines[0]
         * - Two numbers : Set an error on lines[0] to lines[1]
         * @param {Number[]} lines
         */
        this.setError = function(lines) {
            this.removeError();
            var range;
            if (lines.length > 1) {
                range = new AceRange(lines[0] - 1, 0, lines[1] - 1, 100);
                errorMarker = aceEditor.getSession().addMarker(range, 'declick_error', 'line', true);
            } else if (lines.length > 0) {
                range = new AceRange(lines[0] - 1, 0, lines[0] - 1, 100);
                errorMarker = aceEditor.getSession().addMarker(range, 'declick_error', 'line', true);
            }
            aceEditor.navigateTo(lines[0] - 1, 0);
            // In a timer, because otherwise does not seem to work when editor mode has just been activated
            setTimeout(function() {
                aceEditor.scrollToLine(lines[0] - 1, true, true, null);
            }, 100);
        };

        /**
         * Create a new session.
         * @param {TProgram} program
         * @returns {Session}
         */
        this.createSession = function(program) {
            var session = new AceEditSession(program.getCode());
            session.setMode("ace/mode/javascript");
            session.setUndoManager(new AceUndoManager());
            // Disable JSHint
            session.setUseWorker(false);
            return session;
        };

        /**
         * Enable helping methods.
         */
        this.enableMethodHelper = function() {
            aceEditor.commands.addCommand(dotCommand);
            aceEditor.commands.addCommand(backspaceCommand);
            aceEditor.commands.addCommand(AceAutocomplete.startCommand);
        };

        /**
         * Disable helping methods.
         */
        this.disableMethodHelper = function() {
            aceEditor.commands.removeCommand(dotCommand);
            aceEditor.commands.removeCommand(backspaceCommand);
            aceEditor.commands.removeCommand(AceAutocomplete.startCommand);
        };

        /**
         * Enable or disable the edition.
         * @param {Boolean} value
         */
        this.setEditionEnabled = function(value) {
            editionEnabled = value;
        };

        /**
         * Resize the ACE editor according to its container's height
         */
        this.resize = function() {
            aceEditor.resize();
        };

        var editorCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                pos.column--;
                var token = session.getTokenAt(pos.row, pos.column);
                var endToken = "(";

                if (token === null) {
                    return false;
                }

                var tokens = session.getTokens(pos.row);
                var index = token.index;

                // TODO: see if we can handle this situation in js
                /*if (token.type === "rparen") {
                 // Right parenthesis: try to find actual identifier
                 while (index >0 & token.type !== "identifier") {
                 index--;
                 token = tokens[index];
                 }
                 endToken = "[";
                 }*/
                if (token.type !== "identifier" && token.type !== "text" && token.type !== "string" && token.type !== "keyword") {
                    return false;
                }

                var name = token.value.trim();

// Class completion
                if (name === "new") {
                    //TODO: get real classes
                    var classNames = ["Animation", "Héros",
                        "CommandesClavier", "Bloc", "Item"];
                    methodNames = TUtils.sortArray(classNames);

                    var completions = [];
                    for (var j = 0; j < methodNames.length; j++) {
                        completions.push({
                            caption: methodNames[j],
                            value: methodNames[j] + "()"
                        });
                    }
                    callback(null, completions);
                    return;
                }
                for (var i = index - 1; i >= 0; i--) {
                    token = tokens[i];
                    if (token.type !== "identifier" && token.type !== "text" && token.type !== "string") {
                        break;
                    }
                    var part = token.value.trim();
                    if (part.length === 0) {
                        break;
                    }
                    name = part + name;
                }
                if (name.length === 0) {
                    return false;
                }

                var lastcar = name.slice(name.length - 1, name.length);
                var lastlastcar = name.slice(name.length - 2, name.length - 1);
                var firstcar = name.slice(0, 1);

                if (token.type === "text") {
                    // Remove first simple/double quote
                    if (firstcar === '"' || firstcar === "'") {
                        name = name.slice(1, name.length); // "r. -> r.
                    }
                    // remove dot caracter
                    if (lastcar === '.') {
                        name = name.slice(0, name.length - 1); // "r. -> r
                    }
                    // remove dot caracter and simple/double quote
                    if (lastlastcar === '.' && (lastcar === '"' || firstcar === "'")) {
                        name = name.slice(0, name.length - 2); // "r" -> r
                    }
                    // remove simple/double quote when string extracted hasn't "
                    if (lastlastcar !== '.' && (lastcar === '"' || firstcar === "'")) {
                        name = name.slice(0, name.length - 1); // "r.") -> r
                    }
                }

                var range = new AceRange(0, 0, pos.row, pos.column);
                var valueBefore = session.getDocument().getTextRange(range);
                // Since regex do not support unicode...
                var unicodeName = TUtils.toUnicode(name);
                console.log("unicode " + name);
                var regex = new RegExp("(?:^|\\s)" + unicodeName + "\\s*=\\s*new\\s*([\\S^\\" + endToken + "]*)\\s*\\" + endToken);

                var result = regex.exec(valueBefore);

                var completions = [];

                if (name == "declick") {
                    // result[1] is the important part
                    result = [name, name];
                }
                if (result !== null && result.length > 0) {
                    var className = result[1];
                    var methods = TRuntime.getClassTranslatedMethods(className);
                    var methodNames = Object.keys(methods);
                    methodNames = TUtils.sortArray(methodNames);
                    for (var j = 0; j < methodNames.length; j++) {
                        completions.push({
                            caption: methodNames[j],
                            value: methods[methodNames[j]]
                        });
                    }
                }

                callback(null, completions);
            }
        };

        var dotCommand = {
            name: "methodHelper",
            bindKey: {win: '.', mac: '.'},
            exec: function(editor) {
                triggerPopup = true;
                return false; // let default event perform
            },
            readOnly: true // false if this command should not apply in readOnly mode
        };

        var backspaceCommand = {
            name: "methodHelper2",
            bindKey: {win: 'Backspace', mac: 'Backspace'},
            exec: function(editor) {
                var cursor = editor.selection.getCursor();
                var token = editor.getSession().getTokenAt(cursor.row, cursor.column - 1);
                if (token !== null && token.type === "punctuation.operator" && token.value === ".") {
                    triggerPopup = true;
                }
                return false;
            },
            readOnly: true // false if this command should not apply in readOnly mode
        };
    }

    TEditor.prototype = Object.create(TComponent.prototype);
    TEditor.prototype.constructor = TEditor;

    return TEditor;
});
