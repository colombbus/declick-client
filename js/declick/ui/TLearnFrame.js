define(['ui/TComponent', 'jquery', 'ui/TLearnCanvas', 'ui/TLearnEditor', 'TRuntimeProxy', 'TEnvironment', 'TExercise', 'TError', 'objects/teacher/Teacher', 'platform-pr', 'split-pane'], function(TComponent, $, TLearnCanvas, TLearnEditor, TRuntime, TEnvironment, TExercise, TError, Teacher) {
    function TLearnFrame(callback) {
        var $text, $message, $textMessage, $textMessageContent, $messageContent, $instructions, $solution, $solutionContent, $input, $loading, $right;
        var canvas, editor;

        var exercise = new TExercise();
        var bottomSolution = 0;
        var score = 0;
        var lastSubmission = "";
        var textMode = false;
        var initialized = false;
        var messageDisplayed = false;
        var solutionDisplayed = false;
        
        TComponent.call(this, "TLearnFrame.html", function(component) {
            $text = component.find("#tlearnframe-text");
            $input = $text.find("#tlearnframe-text-input");
            $message = component.find("#tlearnframe-message");
            $messageContent = component.find("#tlearnframe-message-content");
            $textMessage = component.find("#tlearnframe-text-message");
            $textMessageContent = component.find("#tlearnframe-text-message-content");
            var $messageClose = component.find("#tlearnframe-message-close");
            $messageClose.click(function(e) {
                $message.fadeOut(500);
            });
            var $textMessageClose = component.find("#tlearnframe-text-message-close");
            $textMessageClose.click(function(e) {
                $textMessage.fadeOut(500);
            });
            var $buttonClear = component.find(".ttoolbar-button-clear");
            $buttonClear.append("Réinitialiser");
            $buttonClear.click(function(e) {
                clear();
            });
            var $buttonExecute = component.find(".ttoolbar-button-execute");
            $buttonExecute.append(TEnvironment.getMessage('button-execute'));
            $buttonExecute.click(function(e) {
                execute();
            });
            var $buttonErase = component.find(".ttoolbar-button-erase");
            $buttonErase.append(TEnvironment.getMessage('button-erase'));
            $buttonErase.click(function(e) {
                clear();
            });
            var $buttonCheck = component.find(".ttoolbar-button-check");
            $buttonCheck.append(TEnvironment.getMessage('button-check'));
            $buttonCheck.click(function(e) {
                execute();
            });
            $instructions = component.find("#tlearnframe-instructions");
            $solution = component.find("#tlearnframe-solution");
            $solution = component.find("#tlearnframe-solution");
            $solutionContent = component.find("#tlearnframe-solution-content");
            
            $loading = component.find("#tlearnframe-loading");
            
            $right = component.find("#tlearnframe-right");
            
            var self = this;
            canvas = new TLearnCanvas(function(c) {
                component.find("#TLearnCanvas").replaceWith(c);
                editor = new TLearnEditor(function(d) {
                    component.find("#TLearnEditor").replaceWith(d);
                    if (typeof callback !== 'undefined') {
                        callback.call(self, component);
                    }
                });
            });

        });

        // wait until $right's height is not null
        var initSplitPane = function() {
            if ($right.height()>0) {
                $('.split-pane').splitPane();
            } else {
                $(window).one('resize', initSplitPane);
            }
        };

        this.displayed = function() {
            canvas.displayed();
            editor.displayed();
            Teacher.setFrame(this);
            $right.on("splitpane:resized", function() {
                editor.resize();
            });
            initSplitPane();
            // declare itself as log 
            TRuntime.setLog(this);
            
            var self = this;
            window.addEventListener("hashchange", function() {
                self.load();
            }, false);
        };
        
        this.init = function() {
            var height = $solution.height();
            $solution.css('top', -height + "px");
            $solution.css('bottom', height + bottomSolution + "px");
            $solution.css('visibility', 'visible');
            $solution.hide();
            canvas.removeLoading();
            window.platform.initWithTask(window.task);
            initialized = true;
        };
        
        this.load = function(callback) {
            var hash = document.location.hash;
            var exerciseId = parseInt(hash.substring(1));
            if (isNaN(exerciseId)) {
                TEnvironment.error("Could not find exercise id");
                if (!initialized) {
                    self.init();
                }
                if (typeof callback !== 'undefined') {
                    callback.call(this);
                }
            } else if (exerciseId !== exercise.getId()) {
                this.loading();
                var self = this;
                this.loadExercise(exerciseId, function() {
                    if (!initialized) {
                        self.init();
                    }
                    self.loaded();
                    if (typeof callback !== 'undefined') {
                        callback.call(this);
                    }                    
                });
            } else {
                if (typeof callback !== 'undefined') {
                    callback.call(this);
                }                    
            }
        };
        
        this.loading = function() {
            $loading.stop().css({opacity:1}).show();
        };

        this.loaded = function() {
            $loading.stop().fadeOut(200, function() {
                $(this).hide();
            });
        };

        var execute = function() {
            hideMessage();
            if (!textMode) {
                clear();
            }
            try {
                var statements;
                if(textMode) {
                    statements = $input.val();
                    lastSubmission = statements;
                } else {
                    statements = editor.getStatements();
                    lastSubmission = editor.getValue();
                    exercise.start();
                    TRuntime.executeStatements(statements);
                    canvas.giveFocus();
                    exercise.end();
                }
                //TODO: only if no error
                Teacher.setStatements(statements);
                exercise.check();
            } catch (err) {
                var error;
                if (!(err instanceof TError)) {
                    error = new TError(err);
                    error.detectError();
                } else {
                    error = err;
                }
                showError(error.getMessage());
            }
        };

        var clear = function() {
            hideMessage();
            if (textMode) {
                // clear editor value
                $input.val("");
                // clear code editor value as well since setTextMode will copy value
                editor.setValue("");
            } else {
                // clear runtime
                TRuntime.clear();
            }
            exercise.init();
        };

        this.validateExercise = function(message) {
            try {
                platform.validate("stay");
            } catch (e) {
                TEnvironment.error("Error validating exercise");
            }
            if(typeof message === "undefined" || message === "") {
                message = TEnvironment.getMessage("success-message");
            }
            showMessage(message);
        };

        this.invalidateExercise = function(message) {
            showMessage(message);
        };

        var showError = function(message) {
            if (textMode) {
                $textMessageContent.text(message);
                $textMessage.addClass("tlearnframe-error");
                $textMessage.show();
            } else {
                $messageContent.text(message);
                $message.addClass("tlearnframe-error");
                $message.show();
            }
            messageDisplayed = true;
        };

        var showMessage = function(message) {
            if (textMode) {
                $textMessageContent.text(message);
                $textMessage.addClass("tlearnframe-message");
                $textMessage.show();
            } else {
                $messageContent.text(message);
                $message.addClass("tlearnframe-message");
                $message.show();
            }
            messageDisplayed = true;
        };

        var hideMessage = function() {
            $message.hide();
            $message.removeClass("tlearnframe-error");
            $message.removeClass("tlearnframe-message");
            $textMessage.hide();
            $textMessage.removeClass("tlearnframe-error");
            $textMessage.removeClass("tlearnframe-message");
            messageDisplayed = false;
        };

        this.loadExercise = function(id, callback) {
            if (solutionDisplayed) {
                closeSolution();
            }
            if (messageDisplayed) {
                hideMessage();
            }
            // by default: program mode
            this.setProgramMode();
            TRuntime.clear();
            editor.clear();
            $input.val();
            score = 0;
            lastSubmission = "";
            exercise.load(function() {
                // set instruction
                if (exercise.hasInstructions()) {
                    exercise.getInstructions(function(data) {
                        $instructions.html(data);
                        exercise.init();
                        // TODO: send callback to exercise.init() when interpreter supports callbacks
                        if (typeof callback !== 'undefined') {
                            callback.call(this);
                        }
                    });                    
                } else {
                    exercise.init();
                    // TODO: send callback to exercise.init() when interpreter supports callbacks
                    if (typeof callback !== 'undefined') {
                        callback.call(this);
                    }
                }
            }, id);
        };


        var openSolution = function(solutionHTML) {
            $solutionContent.html(solutionHTML);
            $solution.show().stop().animate({top: "0px", bottom: bottomSolution + "px"}, 600);
            solutionDisplayed = true;
        };

        var closeSolution = function() {
            var height = $solution.height();
            $solution.stop().animate({top: -height + "px", bottom: height + bottomSolution + "px"}, 600, function() {
                $(this).hide();
            });
            solutionDisplayed = false;
        };
        
        
        
        /**
         * Get the code unparsed
         * @returns {string}
         */
        this.getCode = function() {
            return editor.getValue();
        };

        /**
         * Get the value of text input
         * @returns {string}
         */
        this.getText = function() {
            return $input.val();
        };
        
        
        /**
         * Get the answer entered by user
         * @returns {string}
         */
        this.getAnswer = function() {
            if (textMode) {
                return this.getText();
            } else {
                return this.getCode();
            }
        };
        
        /**
         * Get the last submission entered by user
         * @returns {string}
         */
        this.getLastSubmission = function() {
            return lastSubmission;
        };        
        
        /**
         * Set the code in the editor
         * @param {string} value
         */
        this.setCode = function(value) {
            editor.setValue(value);
        };
        
        /**
         * Set the value of text editor
         * @param {string} value
         */
        this.setText = function(value) {
            $input.val(value);
        };
        
        /**
         * Set the value of user's answer
         * @param {string} value
         */        
        this.setAnswer = function(value) {
            if (textMode) {
                this.setText(value);
            } else {
                this.setCode(value);
            }
        };
        
        /**
         * Get the score
         * @returns {number}
         */
        this.getScore = function() {
            return score;
        };
        
        /**
         * Set the score
         * @param {number} value
         */
        this.setScore = function(value) {
            score = value;
        };
        
        /**
         * Get the message
         * @returns {string}
         */
        this.getMessage = function() {
            return exercise.getMessage();
        };
        
        /**
         * Set the message
         * @param {string} value
         * @returns {unresolved}
         */
        this.setMessage = function(value) {
            return exercise.setMessage(value);
        };
        
        /**
         * Get the message
         * @returns {string}
         */
        this.getSolution = function() {
            return exercise.getSolution();
        };
        
        /**
         * Display or hide the solution
         * @param {boolean} display or hide the solution
         */
        this.displaySolution = function(display) {
            if (exercise.hasSolution() && display) {
                var solutionCode = exercise.getSolution();
                var solutionHTML = solutionCode.replace(/\n/g,"<br>");
                openSolution(solutionHTML);
            } else {
                closeSolution();
            }
        };
        
        this.setTextMode = function() {
            // copy current value if any
            // TODO: fix this

            this.setText(this.getCode());
            $text.css("display", "block");
            textMode = true;
        };

        this.setProgramMode = function() {
            $text.css("display", "none");
            textMode = false;
        };

        
        // LOG MANAGEMENT
        
        this.addError = function(error) {
            showError(error.getMessage());
        };

        this.addCommand = function(command) {
            // do nothing
        };


    }

    TLearnFrame.prototype = Object.create(TComponent.prototype);
    TLearnFrame.prototype.constructor = TLearnFrame;

    return TLearnFrame;
});
