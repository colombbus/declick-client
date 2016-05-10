define(['ui/TComponent', 'jquery', 'TEnvironment', 'TUI'], function(TComponent, $, TEnvironment, TUI) {
    function TToolbar(callback) {
        var $main, $buttonExecute, $buttonEditor;
        var $optionDesignMode, $optionConsole, $optionNewProgram, $optionSaveProgram, $optionNewResource, $optionDelete;
        var editorMode = false;
        var programOptions = true;
        var currentHeight = -1;

        TComponent.call(this, "TToolbar.html", function(component) {
            $main = component;
            $buttonExecute = component.find(".ttoolbar-button-execute");
            $buttonEditor = component.find(".ttoolbar-mode-editor");
            $optionDesignMode = component.find("#ttoolbar-design-mode");
            $optionConsole = component.find("#ttoolbar-console");
            $optionNewProgram = component.find(".ttoolbar-option-new-program");
            $optionSaveProgram = component.find(".ttoolbar-option-save");
            $optionNewResource = component.find(".ttoolbar-option-new-resource");
            $optionDelete = component.find(".ttoolbar-option-delete");

            var $buttonHelp = component.find("#ttoolbar-help");
            $buttonHelp.prop("title", TEnvironment.getMessage('button-help'));
            $buttonHelp.click(function(e) {
                $buttonHelp.toggleClass("active");
                parent.toggleHelp();
            })
            window.setHelpOpened = function() {
                $buttonHelp.addClass("active");
            };

            window.setHelpClosed = function() {
                $buttonHelp.removeClass("active");
            };

            $buttonEditor.append(TEnvironment.getMessage('mode-editor'));
            $buttonEditor.click(function(e) {
                TUI.toggleEditor();
            });
            
            
            $buttonExecute.append(TEnvironment.getMessage('button-execute'));
            $buttonExecute.click(function(e) {
                TUI.execute();
            });

            $optionDesignMode.attr("title", TEnvironment.getMessage('option-design-mode'));
            $optionDesignMode.click(function(e) {
                TUI.toggleDesignMode();
            });

            $optionConsole.attr("title", TEnvironment.getMessage('option-console'));
            $optionConsole.click(function(e) {
                TUI.toggleConsole();
            });

            
            $optionSaveProgram.append(TEnvironment.getMessage('option-save-program'));
            $optionSaveProgram.click(function(e) {
                TUI.saveProgram();
            });
            
            $optionNewProgram.append(TEnvironment.getMessage('option-new-program'));
            $optionNewProgram.click(function(e) {
                TUI.newProgram();
            });
            
            $optionNewResource.append(TEnvironment.getMessage('option-new-resource'));
            $optionNewResource.click(function(e) {
                TUI.newResource();
            });

            $optionDelete.append(TEnvironment.getMessage('option-delete'));
            $optionDelete.click(function(e) {
                TUI.delete();
            });

            // Prevent text selection
            component.mousedown(function() {
                return false;
            });

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        this.displayed = function() {
            // Start with editor mode disabled
            this.disableProgramOptions();
            this.disableResourceOptions();
        };

        this.enableConsole = function() {
            $optionConsole.addClass("active");
            //$buttonExecute.show();
        };

        this.disableConsole = function() {
            $optionConsole.removeClass("active");
            //$buttonExecute.hide();
        };

        this.enableDesignMode = function() {
            $optionDesignMode.addClass("active");
        };

        this.disableDesignMode = function() {
            $optionDesignMode.removeClass("active");
        };

        this.enableEditor = function() {
            if (!editorMode) {
                $buttonEditor.addClass("active");
                $optionDesignMode.hide();
                $buttonExecute.show();
                editorMode = true;
                if (programOptions) {
                    this.enableProgramOptions();
                } else {
                    this.enableResourceOptions();
                }
            }
        };

        this.disableEditor = function() {
            if (editorMode) {
                $buttonEditor.removeClass("active");
                if (programOptions) {
                    this.disableProgramOptions();
                } else {
                    this.disableResourceOptions();
                }
                $optionDesignMode.show();
                $buttonExecute.hide();
                editorMode = false;
            }
        };

        this.enableProgramOptions = function() {
            this.disableResourceOptions();
            $optionNewProgram.show();
            $optionSaveProgram.show();
            $optionDelete.show();
            programOptions = true;
        };

        this.disableProgramOptions = function() {
            $optionNewProgram.hide();
            $optionSaveProgram.hide();
            $optionDelete.hide();
        };

        this.enableResourceOptions = function() {
            this.disableProgramOptions();
            $optionNewResource.show();
            $optionDelete.show();
            programOptions = false;
        };

        this.disableResourceOptions = function() {
            $optionNewResource.hide();
            $optionDelete.hide();
        };

        this.setEditionEnabled = function(value) {
            $optionSaveProgram.disabled = !value;
            $optionDelete.disabled = !value;
        };
        
        this.getHeight = function() {
            if (currentHeight === -1) {
                currentHeight = $main.outerHeight(false);
            }
            return currentHeight;
        };        
    }
    ;

    TToolbar.prototype = Object.create(TComponent.prototype);
    TToolbar.prototype.constructor = TToolbar;

    return TToolbar;
});
