define(['objects/teacher/Teacher','ui/TComponent', 'TParser', 'ui/TLog', 'TEnvironment', 'TUtils', 'TRuntime', 'jquery', 'ace/ace', 'ace/autocomplete', 'ace/range', 'platform-pr'], function(Teacher, TComponent, TParser, TLog, TEnvironment, TUtils, TRuntime, $, ace, ace_autocomplete, ace_range) {
    /**
     * TLearnEditor is like TEditor, but adapted to "Learn" part of Declick.
     * @exports TLearnEditor
     */
    function TLearnEditor(callback) {
        var $editor, $editorText;

        TComponent.call(this, "TLearnEditor.html", function(component) {
            $editor = component;
            $editorText = component.find("#tlearneditor-text");
            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        var AceRange = ace_range.Range;
        var AceAutocomplete = ace_autocomplete.Autocomplete;

        var aceEditor;
        var computedHeight = -1;

        var popupTriggered = false;
        var popupTimeout;
        var triggerPopup = false;

        /**
         * Initialize LearnEditor.
         */
        this.displayed = function() {
            aceEditor = ace.edit($editorText.attr("id"));
            aceEditor.getSession().setMode("ace/mode/javascript");
            // Disable JSHint
            aceEditor.getSession().setUseWorker(false);
            aceEditor.setShowPrintMargin(false);
            aceEditor.renderer.setShowGutter(true);
            aceEditor.setFontSize("20px");
            aceEditor.setHighlightActiveLine(false);
            aceEditor.setTheme("ace/theme/twilight");
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
                name: "save",
                bindKey: {win: "Ctrl-S", mac: "Command-S"},
                exec: function(arg) {
                    platform.validate("stay");
                }
            });
            
            aceEditor.completers = [consoleCompleter];

            this.enableMethodHelper();

        };

        /**
         * Get code in LearnEditor.
         * @returns {String}
         */
        this.getValue = function() {
            var simpleText = aceEditor.getSession().getValue();
            var protectedText = TUtils.addQuoteDelimiters(simpleText);
            var command = TUtils.parseQuotes(protectedText);
            return command;
        };

        /**
         * Set code in LearnEditor to value.
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
         * Update Program & get statements of Program's code.
         * @returns {Statement[]}
         */
        this.getStatements = function() {
            return TParser.parse(this.getValue());
        };

        /**
         * Clear LearnEditor.
         */
        this.clear = function() {
            aceEditor.setValue("");
        };

        /**
         * Show LearnEditor.
         */
        this.show = function() {
            $editor.show();
            aceEditor.focus();
        };

        /**
         * Hide LearnEditor.
         */
        this.hide = function() {
            $editor.hide();
        };

        /**
         * Get LearnEditor's height.
         * @returns {Number}
         */
        this.getHeight = function() {
            if (computedHeight === -1) {
                computedHeight = $editor.outerHeight(false);
            }
            return computedHeight;
        };
        
        /**
         * Enable helping methods.
         */
        this.enableMethodHelper = function() {
            aceEditor.commands.addCommand(dotCommand);
            aceEditor.commands.addCommand(backspaceCommand);
            aceEditor.commands.addCommand(classCommand);
            aceEditor.commands.addCommand(AceAutocomplete.startCommand);
        };
        
        /**
         * Disable helping methods.
         */
        this.disableMethodHelper = function() {
            aceEditor.commands.removeCommand(dotCommand);
            aceEditor.commands.removeCommand(backspaceCommand);
            aceEditor.commands.removeCommand(classCommand);
            aceEditor.commands.removeCommand(AceAutocomplete.startCommand);
        };


        /**
         * Resize the ACE editor according to its container's height
         */
        this.resize = function() {
            aceEditor.resize();
        };
		
        var consoleCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                pos.column--;
                var token = session.getTokenAt(pos.row, pos.column);
				var endToken = "(";
                if (token === null) {
                    return false;
                }

                var tokens = session.getTokens(pos.row);
                var index = token.index;
				
				var methodNames=[];

                if (token.type !== "identifier" && token.type !== "text" && token.type !== "keyword" && token.type !== "string") {
                    return false;
                }

                var name = token.value.trim();
				// Class completion
                if (name === "new") {
                    var classNames = Teacher.getDisplayedClasses();
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
				
				var range = new AceRange(0, 0, pos.row, pos.column);
                var valueBefore = session.getDocument().getTextRange(range);
                // Since regex do not support unicode...
                var unicodeName = TUtils.toUnicode(name);
                //console.log("unicode " + name);
                var regex = new RegExp("(?:^|\\s)" + unicodeName + "\\s*=\\s*new\\s*([\\S^\\" + endToken + "]*)\\s*\\" + endToken);
                var result = regex.exec(valueBefore);

				// Searching if the token was an instancied object
				if ((token.type === "identifier")|| (result === null)) {
					var word = token.value;
					
				    var uninstancied = ["tangara", "declick" ,"clavier", "teacher"];
					
					if (uninstancied.indexOf(word) > -1) {
						result = [word, word];
					}
				}
				
                var completions = [];
                
				console.log("Completed name " + result);
                if (result !== null && result.length > 0) {
                    var className = result[1];
					completions = Teacher.getDisplayedMethods(className);
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
        var classCommand = {
            name: "classHelper",
            bindKey: {win: 'Space', mac: 'Space'},
            exec: function (editor) {
                var cursor = editor.selection.getCursor();
                var token = editor.getSession().getTokenAt(cursor.row, cursor.column - 1);

                if (token !== null && token.type === "keyword" && token.value === "new") {
                    triggerPopup = true;
                }
                return false;
            },
            readOnly: true // false if this command should not apply in readOnly mode
        };
    }

    TLearnEditor.prototype = Object.create(TComponent.prototype);
    TLearnEditor.prototype.constructor = TLearnEditor;


    return TLearnEditor;
});
