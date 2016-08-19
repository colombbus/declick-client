define(['ui/TComponent', 'jquery', 'TEnvironment', 'TUI', 'ui/THints'], function(TComponent, $, TEnvironment, TUI, THints) {
    function TToolbar(callback) {
        var $main, $buttonExecute;
        var $buttonDesignMode, $buttonConsole, $buttonSaveProgram;
        var editorMode = false;
        var saveEnabled = false;
        var currentHeight = -1;

        TComponent.call(this, "TToolbar.html", function(component) {
            $main = component;
            $buttonExecute = component.find("#ttoolbar-play");
            $buttonDesignMode = component.find("#ttoolbar-design-mode");
            $buttonConsole = component.find("#ttoolbar-console");
            $buttonSaveProgram = component.find("#ttoolbar-save");

            var $buttonWiki = component.find("#ttoolbar-wiki");
            $buttonWiki.prop("title", TEnvironment.getMessage('button-wiki'));
            $buttonWiki.click(function(e) {
                $buttonWiki.toggleClass("active");
                parent.toggleWiki();
            });
            
            window.setWikiOpened = function() {
                $buttonWiki.addClass("active");
            };

            window.setWikiClosed = function() {
                $buttonWiki.removeClass("active");
            };
            
            var $buttonHints = component.find("#ttoolbar-hints");
            $buttonHints.prop("title", TEnvironment.getMessage('button-hints'));
            $buttonHints.click(function(e) {
                $buttonHints.toggleClass("active");
                THints.toggleHints();
            });

            $buttonExecute.attr("title",TEnvironment.getMessage('button-execute'));
            $buttonExecute.click(function(e) {
                if (!$(this).is(':disabled')) {
                    TUI.execute();
                }
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
                if (!$(this).is(':disabled')) {
                    TUI.saveProgram();
                }
            });

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

        this.setSaveEnabled = function(value) {
            saveEnabled = value;
            if (value) {
                $buttonSaveProgram.prop("disabled", false);
            } else {
                $buttonSaveProgram.prop("disabled", true);
            }
        };
        
        this.setSaveAvailable = function(value) {
            if (value && saveEnabled) {
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
