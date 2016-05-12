define(['ui/TComponent', 'jquery', 'TEnvironment', 'TUI'], function(TComponent, $, TEnvironment, TUI) {
    function TToolbar(callback) {
        var $main, $buttonExecute;
        var $buttonDesignMode, $buttonConsole, $buttonSaveProgram;
        var editorMode = false;
        var programOptions = true;
        var currentHeight = -1;

        TComponent.call(this, "TToolbar.html", function(component) {
            $main = component;
            $buttonExecute = component.find("#ttoolbar-play");
            $buttonDesignMode = component.find("#ttoolbar-design-mode");
            $buttonConsole = component.find("#ttoolbar-console");
            $buttonSaveProgram = component.find("#ttoolbar-save");
            /*$optionNewProgram = component.find(".ttoolbar-option-new-program");
            $optionNewResource = component.find(".ttoolbar-option-new-resource");
            $optionDelete = component.find(".ttoolbar-option-delete");*/

            var $buttonHelp = component.find("#ttoolbar-help");
            $buttonHelp.prop("title", TEnvironment.getMessage('button-help'));
            $buttonHelp.click(function(e) {
                $buttonHelp.toggleClass("active");
                parent.toggleHelp();
            });
            
            window.setHelpOpened = function() {
                $buttonHelp.addClass("active");
            };

            window.setHelpClosed = function() {
                $buttonHelp.removeClass("active");
            };

            $buttonExecute.attr("title",TEnvironment.getMessage('button-execute'));
            $buttonExecute.click(function(e) {
                TUI.execute();
            });

            $buttonDesignMode.attr("title", TEnvironment.getMessage('option-design-mode'));
            $buttonDesignMode.click(function(e) {
                TUI.toggleDesignMode();
            });

            $buttonConsole.attr("title", TEnvironment.getMessage('option-console'));
            $buttonConsole.click(function(e) {
                TUI.toggleConsole();
            });

            
            $buttonSaveProgram.attr("title", TEnvironment.getMessage('option-save-program'));
            $buttonSaveProgram.click(function(e) {
                TUI.saveProgram();
            });
            
            /*$optionNewProgram.append(TEnvironment.getMessage('option-new-program'));
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
            });*/

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        this.displayed = function() {
        };

        this.enableConsole = function() {
            $buttonConsole.addClass("active");
        };

        this.disableConsole = function() {
            $buttonConsole.removeClass("active");
        };

        this.enableDesignMode = function() {
            $buttonDesignMode.addClass("active");
        };

        this.disableDesignMode = function() {
            $buttonDesignMode.removeClass("active");
        };

        this.enableEditor = function() {
            if (!editorMode) {
                $buttonDesignMode.hide();
                $buttonConsole.hide();
                $buttonExecute.show();
                $buttonSaveProgram.show();
                editorMode = true;
            }
        };

        this.disableEditor = function() {
            if (editorMode) {
                $buttonDesignMode.show();
                $buttonConsole.show();
                $buttonExecute.hide();
                $buttonSaveProgram.hide();
                editorMode = false;
            }
        };

        this.setEditionEnabled = function(value) {
            if (value) {
                $buttonSaveProgram.addClass("active");
            } else {
                $buttonSaveProgram.removeClass("active");
            }
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
