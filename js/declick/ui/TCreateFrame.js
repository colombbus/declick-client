define(['ui/TComponent', 'jquery', 'split-pane', 'ui/TCanvas', 'ui/TEditor', 'ui/TSidebar', 'TUI', 'ui/TConsole', 'ui/TToolbar', 'ui/TLog', 'ui/TMessage', 'TRuntime', 'TEnvironment'], function(TComponent, $, SplitPane, TCanvas, TEditor, TSidebar, TUI, TConsole, TToolbar, TLog, TMessage, TRuntime, TEnvironment) {
    function TCreateFrame(callback) {
        var initialized = false;
        var canvas, editor, sidebar, toolbar, console, log, message;
        var $frame, $main, $top, $separator, $bottom, $loading;

        var frame = this;
        var separatorEnabled = true;

        TComponent.call(this, "TFrame.html", function(component) {
            waiting = ['canvas', 'editor', 'sidebar', 'toolbar', 'console', 'log', 'message'];

            checkWaiting = function(name) {
                var i = waiting.indexOf(name);
                if (i > -1) {
                    waiting.splice(i, 1);
                }
                if (waiting.length === 0) {
                    if (typeof callback !== 'undefined') {
                        callback.call(this, component);
                    }
                }
            };

            $frame = component;
            $main = component.find("#tframe-main");
            $top = component.find("#tframe-top");
            $separator = component.find("#tframe-separator");
            $bottom = component.find("#tframe-bottom");
            $loading = component.find("#tframe-loading");
            var loadingText = $loading.find("p");
            loadingText.text(TEnvironment.getMessage('loading-message'));
            
            canvas = new TCanvas(function(c) {
                component.find("#TCanvas").replaceWith(c);
                checkWaiting("canvas");
            });
            editor = new TEditor(function(c) {
                component.find("#TEditor").replaceWith(c);
                checkWaiting("editor");
            });
            sidebar = new TSidebar(function(c) {
                component.find("#TSidebar").replaceWith(c);
                checkWaiting("sidebar");
            });
            toolbar = new TToolbar(function(c) {
                component.find("#TToolbar").replaceWith(c);
                checkWaiting("toolbar");
            });
            console = new TConsole(function(c) {
                component.find("#TConsole").replaceWith(c);
                checkWaiting("console");
            });
            log = new TLog(function(c) {
                component.find("#TLog").replaceWith(c);
                checkWaiting("log");
            });
            message = new TMessage(function(c) {
                component.find("#TMessage").replaceWith(c);
                checkWaiting("message");
            });
        });

        var checkSeparatorEnabled = function(event) {
            if (!separatorEnabled) {
                event.stopImmediatePropagation();
            }
        };

        this.displayed = function() {
            // Set UI
            TUI.setFrame(frame);
            TUI.setCanvas(canvas);
            TUI.setEditor(editor);
            TUI.setSidebar(sidebar);
            TUI.setToolbar(toolbar);
            TUI.setConsole(console);
            TUI.setLog(log);
            TUI.setMessage(message);

            // Plug Runtime with Log
            TRuntime.setLog(log);
            
            canvas.displayed();
            editor.displayed();
            sidebar.displayed();
            console.displayed();
            toolbar.displayed();
            log.displayed();
            $main.on("splitpane:resized", function() {
                editor.resize();
            });
            // Important to attach handler before calling splitPane
            $separator.on("mousedown", checkSeparatorEnabled);
            $('.split-pane').splitPane();
            initialized = true;
            // init separator position so that toolbar is visible
            TUI.enableEditor(false);
            $loading.fadeOut(1000, function() {
                $(this).remove();
            });
            window.platform.initWithTask(window.task);            
        };
        
        this.lowerSeparator = function(value) {
            if (initialized) {
                var totalHeight = $frame.height();
                var currentBottom = totalHeight - ($separator.position().top + $separator.height());
                var newBottom = ((currentBottom - value) * 100 / totalHeight) + '%';
                $top.css('bottom', newBottom);
                $separator.css('bottom', newBottom);
                $bottom.css('height', newBottom);
                $frame.resize();
            }
        };

        this.raiseSeparator = function(value) {
            this.lowerSeparator(-value);
        };
        
        this.disableSeparator = function() {
            separatorEnabled = false;
            $separator.addClass("disabled");
        };
        
        this.enableSeparator = function() {
            separatorEnabled = true;
            $separator.removeClass("disabled");
        };

        // Declare global functions

        if (typeof window.updateEnvironment === 'undefined') {
            window.updateEnvironment = function(showEditor) {
                TUI.init();
                if (typeof showEditor !== 'undefined' && showEditor) {
                    TUI.enableEditor();
                }
            };
        }

        if (typeof window.isUnsaved === 'undefined') {
            window.isUnsaved = function() {
                return TEnvironment.getProject().isUnsaved();
            };
        }

        if (typeof window.displayEditor === 'undefined') {
            window.displayEditor = function() {
                TUI.enableEditor(false);
            };
        }

        if (typeof window.displayView === 'undefined') {
            window.displayView = function() {
                TUI.disableEditor(false);
            };
        }


    }

    TCreateFrame.prototype = Object.create(TComponent.prototype);
    TCreateFrame.prototype.constructor = TCreateFrame;


    return TCreateFrame;
});
