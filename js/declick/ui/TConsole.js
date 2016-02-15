define(['TUI', 'TParser', 'ui/TLog', 'TEnvironment', 'TUtils', 'TRuntimeProxy', 'jquery', 'ace/ace', 'ace/autocomplete', 'ace/range', 'ui/TComponent'], function(TUI, TParser, TLog, TEnvironment, TUtils, TRuntime, $, ace, ace_autocomplete, ace_range, TComponent) {
    /**
     * TConsole manages the console for Declick's users. It runs with lib ace.
     * @param {Function} callback
     * @exports {TConsole}
     */
    function TConsole(callback) {
        var $console, $consoleText;

        TComponent.call(this, "TConsole.html", function(component) {
            $console = component;
            $consoleText = component.find("#tconsole-text");

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        var AceRange = ace_range.Range;
        var AceAutocomplete = ace_autocomplete.Autocomplete;

        var aceEditor;
        var currentCommand;
        var currentPosition;
        var computedHeight = -1;
        var browsingHistory = false;

        var popupTriggered = false;
        var popupTimeout;
        var triggerPopup = false;

        this.displayed = function() {
            aceEditor = ace.edit($consoleText.attr("id"));
            aceEditor.getSession().setMode("ace/mode/javascript");
            // Disable JSHint
            aceEditor.getSession().setUseWorker(false);
            aceEditor.setShowPrintMargin(false);
            aceEditor.renderer.setShowGutter(false);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);

            aceEditor.on('input', function() {
                if (triggerPopup) {
                    triggerPopup = false;
                    popupTimeout = setTimeout(function() {
                        popupTriggered = false;
                        // Force Ace popup to not add gutter width when computing popup pos
                        // since gutter is not shown
                        aceEditor.renderer.$gutterLayer.gutterWidth = 0;
                        AceAutocomplete.startCommand.exec(aceEditor);
                    }, 800);
                    popupTriggered = true;
                } else if (popupTriggered) {
                    clearTimeout(popupTimeout);
                    popupTriggered = false;
                }
            });

            aceEditor.commands.addCommand({
                name: 'executeCommand',
                bindKey: {win: 'Return', mac: 'Return'},
                exec: function(editor) {
                    // postpone execution due to a bug in Firefox handling synchronous ajax when in a keyboard event
                    // (insert new line)
                    window.setTimeout(function() {
                        TUI.execute();
                    }, 0);
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });
            aceEditor.commands.addCommand({
                name: 'browseHistoryUp',
                bindKey: {win: 'Up', mac: 'Up'},
                exec: function(editor) {
                    var history = TUI.getPreviousRow();
                    if (history !== null) {
                        if (!browsingHistory) {
                            currentCommand = editor.getValue();
                            currentPosition = editor.getCursorPosition();
                            browsingHistory = true;
                        }
                        editor.setValue(history);
                        editor.navigateLineEnd();
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });
            aceEditor.commands.addCommand({
                name: 'browsehistoryDown',
                bindKey: {win: 'Down', mac: 'Down'},
                exec: function(editor) {
                    if (browsingHistory) {
                        var history = TUI.getNextRow();
                        if (history !== null) {
                            editor.setValue(history);
                            editor.navigateLineEnd();
                        } else {
                            // end of history reached
                            editor.setValue(currentCommand);
                            editor.navigateTo(currentPosition.row, currentPosition.column);
                            browsingHistory = false;
                        }
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });
            aceEditor.commands.addCommand({
                name: 'returnToCurrentCommand',
                bindKey: {win: 'Escape', mac: 'Escape'},
                exec: function(editor) {
                    if (browsingHistory) {
                        editor.setValue(currentCommand);
                        editor.navigateTo(currentPosition.row, currentPosition.column);
                        TUI.setLastRow();
                        browsingHistory = false;
                    }
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });

            aceEditor.completers = [consoleCompleter];

            this.enableMethodHelper();

        };

        /**
         * Returns code in Console.
         * @returns {String}
         */
        this.getValue = function() {
            var simpleText = aceEditor.getSession().getValue();
            var protectedText = TUtils.addQuoteDelimiters(simpleText);
            var command = TUtils.parseQuotes(protectedText);
            return command;
        };

        /**
         * Set code in Console to value.
         * @param {String} value
         */
        this.setValue = function(value) {
            aceEditor.getSession().setValue(value);
            // set cursor to the end of line
            aceEditor.gotoPageDown();
        };
        
        /**
         * Brings the current `textInput` into focus.
         */
        this.focus = function() {
            aceEditor.focus();
        };

        /**
         * Returns statements of Console's code.
         * @returns {Statement[]}
         */
        this.getStatements = function() {
            return TParser.parse(this.getValue());
        };

        /**
         * Clear Console.
         */
        this.clear = function() {
            aceEditor.setValue("");
            browsingHistory = false;
        };

        /**
         * Show Console.
         */
        this.show = function() {
            $console.show();
            aceEditor.focus();
        };

        /**
         * Hide Console.
         */
        this.hide = function() {
            $console.hide();
        };

        /**
         * Get Console's height.
         * @returns {Number}
         */
        this.getHeight = function() {
            if (computedHeight === -1) {
                computedHeight = $console.outerHeight(false);
            }
            return computedHeight;
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

        var consoleCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                pos.column--;
                var token = session.getTokenAt(pos.row, pos.column);

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

                if (token.type !== "identifier" && token.type !== "text" && token.type !== "keyword" && token.type !== "string") {
                    return false;
                }

                var name = token.value.trim();

                for (var i = index - 1; i >= 0; i--) {
                    token = tokens[i];
                    if (token.type !== "identifier" && token.type !== "text") {
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

                /* var className = TRuntime.getTObjectClassName(name);
                var methods = TEnvironment.getClassMethods(className);*/
                var methods = TRuntime.getTObjectTranslatedMethods(name);
                var methodNames = Object.keys(methods);
                methodNames = TUtils.sortArray(methodNames);

                var completions = [];
                for (var j = 0; j < methodNames.length; j++) {
                    completions.push({
                        caption: methodNames[j],
                        value: methods[methodNames[j]]
                    });
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
//        var classCommand = {
//            name: "classHelper",
//            bindKey: {win: 'Space', mac: 'Space'},
//            exec: function (editor) {
//                var cursor = editor.selection.getCursor();
//                var token = editor.getSession().getTokenAt(cursor.row, cursor.column - 1);
//
//                if (token !== null && token.type === "keyword" && token.value === "new") {
//                    triggerPopup = true;
//                }
//                return false;
//            },
//            readOnly: true // false if this command should not apply in readOnly mode
//        };
    }

    TConsole.prototype = Object.create(TComponent.prototype);
    TConsole.prototype.constructor = TConsole;

    return TConsole;
});
