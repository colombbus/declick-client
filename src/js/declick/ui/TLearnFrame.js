define(['ui/TComponent', 'jquery', 'ui/TLearnCanvas', 'ui/TLearnEditor', 'TRuntime', 'TEnvironment', 'TExerciseProject', 'TError', 'prism', 'platform-pr', 'split-pane'], function(TComponent, $, TLearnCanvas, TLearnEditor, TRuntime, TEnvironment, TExerciseProject, TError, Prism) {
    function TLearnFrame(callback) {
        var $text, $message, $textMessage, $textMessageContent, $messageContent, $instruction, $instructions, $solution, $solutionContent, $input, $loading, $right, $success, $successText, $slideFrame, $buttonNext;
        var canvas, editor;

        var exercise = new TExerciseProject();
        var bottomSolution = 0;
        var score = 0;
        var lastSubmission = "";
        var textMode = false;
        var initialized = false;
        var messageDisplayed = false;
        var solutionDisplayed = false;
        var slideDisplayed = false;

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
            $buttonClear.attr("title", "Réinitialiser");
            $buttonClear.click(function(e) {
                clear();
            });
            var $buttonExecute = component.find(".ttoolbar-button-execute");
            $buttonExecute.attr("title", TEnvironment.getMessage('button-execute'));
            $buttonExecute.click(function(e) {
                execute();
            });
            var $buttonErase = component.find(".ttoolbar-button-erase");
            $buttonErase.attr("title", TEnvironment.getMessage('button-erase'));
            $buttonErase.click(function(e) {
                clear();
            });
            var $buttonCheck = component.find(".ttoolbar-button-check");
            $buttonCheck.attr("title", TEnvironment.getMessage('button-check'));
            $buttonCheck.click(function(e) {
                execute();
            });

            $buttonNext = component.find(".ttoolbar-button-next");
            $buttonNext.prepend(TEnvironment.getMessage('button-next-step'));
            $buttonNext.click(function(e) {
                platform.validate("nextImmediate");
            });

            var $buttonClose = component.find(".ttoolbar-button-close");
            $buttonClose.click(function(e) {
                hideSuccess();
            });

            $instructions = component.find("#tlearnframe-instructions");
            $instruction = component.find("#tlearnframe-instruction");
            $solution = component.find("#tlearnframe-solution");
            $solution = component.find("#tlearnframe-solution");
            $solutionContent = component.find("#tlearnframe-solution-content");

            $loading = component.find("#tlearnframe-loading");
            var loadingText = $loading.find("p");
            loadingText.text(TEnvironment.getMessage('loading-message'));

            $right = component.find("#tlearnframe-right");

            $success = component.find("#tlearnframe-success");
            $successText = component.find("#tlearnframe-success-text");

            $slideFrame = component.find("#tlearnframe-slide");

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
            exercise.setFrame(this);
            $right.on("splitpane:resized", function() {
                editor.resize();
            });
            initSplitPane();
            // declare itself as log
            TRuntime.setLog(this);
            window.platform.initWithTask(window.task);
        };

        this.init = function() {
            var height = $solution.height();
            $solution.css('top', -height + "px");
            $solution.css('bottom', height + bottomSolution + "px");
            $solution.css('visibility', 'visible');
            $solution.hide();
            $slideFrame.hide();

            canvas.removeLoading();
            initialized = true;
        };

        this.update = function(id, callback) {
            hideSuccess(); 
            if (id.substring(0,1) === "s") {
                // slide
                if (!initialized) {
                    this.init();
                }
                this.loading();
                var slideId = id.substring(1);
                var self = this;
                this.displaySlide(slideId, function() {
                    self.loaded();
                    if (typeof callback !== 'undefined') {
                        callback.call(this);
                    }
                });
            } else {
                var exerciseId = parseInt(id);
                if (isNaN(exerciseId)) {
                    TEnvironment.error("Could not parse exercise id");
                    if (!initialized) {
                        this.init();
                    }
                    if (typeof callback !== 'undefined') {
                        callback.call(this);
                    }
                } else /*if (exerciseId !== exercise.getId() || slideDisplayed)*/ {
                        this.loading();
                        var self = this;
                        this.loadExercise(exerciseId, function() {
                            if (!initialized) {
                                self.init();
                            }
                            self.loaded();
                            window.console.log("sending show view");
                            window.platform.showView({task:{}}, function() {
                                window.console.log("show view sent");
                                if (typeof callback !== 'undefined') {
                                    callback.call(self);
                                }
                            }, function() {
                                window.console.error("error while sending show View to platform");
                            });
                        });
                } /*else {
                    if (typeof callback !== 'undefined') {
                        callback.call(this);
                    }
                }*/
            }
        }

        this.load = function(callback) {
            var self = this;
            TEnvironment.registerParametersHandler(function (parameters, callback) {
                var id = false;
                for (var name in parameters) {
                    var value = parameters[name];
                    if (name === 'id') {
                        id = value;
                    }
                }
                if (id) {
                    self.update(id, callback);
                } else if (callback) {
                    callback.call(self);
                }
            }, callback);
       };

        this.loading = function() {
            $slideFrame.hide();
            $loading.stop().css({opacity:1}).show();
        };

        this.loaded = function() {
            $loading.stop().fadeOut(200, function() {
                $(this).hide();
            });
        };

        var context = this;

        var step = function (){
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
                    statements = statements.body;
                }
                exercise.check(statements, function (output)
                {
                    var message;
                    if (output.result === 'success')
                    {
                       if (output.score < 100)
                        {
                            message = output.message;
                        }
                        var next = true;
                        if (typeof output.next !== 'undefined') {
                            next = output.next;
                        }
                        context.validateExercise(message, next);
                    }
                    else if (output.result === 'faillure')
                    {
                        context.invalidateExercise(output.message);
                    }
                    else if (output.action === 'reset')
                    {
                        exercise.executeInit();
                        step();
                    }
                });
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

        var execute = function() {
            hideMessage();
            if (!textMode) {
                clear(false);
            }
            step();
        };

        var clear = function(resetCode) {
            if (typeof resetCode === 'undefined') {
                resetCode = true;
            }
            hideMessage();
            if (textMode) {
                // clear editor value
                $input.val("");
                // clear code editor value as well since setTextMode will copy value
                editor.setValue("");
            } else {
                // clear runtime
                TRuntime.clear();
                if (resetCode && exercise.hasUserCode()) {
                    editor.setValue(exercise.getUserCode());
                }
            }
            exercise.init();
        };

        this.validateExercise = function(message, next) {
            try {
                platform.validate("stay");
            } catch (e) {
                TEnvironment.error("Error validating exercise");
            }
            if(typeof message === "undefined" || message === "") {
                message = TEnvironment.getMessage("success-message");
            }
            if(typeof next === "undefined") {
                next = true;
            }
            window.setTimeout(function() {
                showSuccess(message, next);
            }, 1000);
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

        var showSuccess = function(message, next) {
            $successText.text(message);
            if (next) {
                $buttonNext.show();
            } else {
                $buttonNext.hide();
            }
            $success.show();
        };

        var hideSuccess = function() {
            $success.hide();
        };

        var hideSlide = function() {
            $slideFrame.off("load");
            $slideFrame.hide();
            slideDisplayed = false;
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
            hideSlide();
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
                        Prism.highlightAll(false);
                        exercise.init();
                        if (exercise.hasUserCode()) {
                            editor.setValue(exercise.getUserCode());
                        }
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
            $instruction.addClass("text-mode");
            textMode = true;
        };

        this.setProgramMode = function() {
            $text.css("display", "none");
            $instruction.removeClass("text-mode");
            textMode = false;
        };


        // LOG MANAGEMENT

        this.addError = function(error) {
            showError(error.getMessage());
        };

        this.addCommand = function(command) {
            // do nothing
        };


        this.displaySlide = function(slideId, callback) {
            $slideFrame.one("load", function(event) {
                $slideFrame.show();
                slideDisplayed = true;
                if (typeof callback !== 'undefined') {
                    callback.call(this);
                }
            });
            $slideFrame.attr("src", TEnvironment.getConfig("slide-url")+slideId);
        };

    }

    TLearnFrame.prototype = Object.create(TComponent.prototype);
    TLearnFrame.prototype.constructor = TLearnFrame;

    return TLearnFrame;
});
