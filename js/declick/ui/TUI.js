define(['jquery', 'TRuntime', 'TEnvironment', 'quintus'], function($, TRuntime, TEnvironment, TError, Quintus) {
    var TUI = function() {
        var frame;
        var canvas;
        var editor;
        var sidebar;
        var toolbar;
        var console;
        var editorEnabled = false;
        var consoleDisplayed = true;
        var designModeEnabled = false;
        var programsDisplayed = true;
        var resourcesDisplayed = false;
        var log;
        var message;

        this.setFrame = function(element) {
            frame = element;
            return;
        };

        this.setCanvas = function(element) {
            canvas = element;
            return;
        };

        this.setEditor = function(element) {
            editor = element;
            return;
        };

        this.setSidebar = function(element) {
            sidebar = element;
            return;
        };

        this.setLog = function(element) {
            log = element;
            return;
        };

        this.setMessage = function(element) {
            message = element;
            return;
        };

        this.setToolbar = function(element) {
            toolbar = element;
            return;
        };

        this.setConsole = function(element) {
            console = element;
            return;
        };

        this.getCanvas = function() {
            return canvas;
        };

        this.hideConsole = function(hideLog) {
            if (typeof hideLog === 'undefined') {
                hideLog = true;
            }
            if (consoleDisplayed) {
                toolbar.disableConsole();
                log.saveScroll();
                if (hideLog) {
                    log.hide();
                }
                console.hide();
                if (hideLog) {
                    frame.lowerSeparator(console.getHeight()+log.getHeight());
                    frame.disableSeparator();
                } else {
                    frame.lowerSeparator(console.getHeight());
                }
                consoleDisplayed = false;
            }
        };

        this.showConsole = function() {
            if (!consoleDisplayed) {
                toolbar.enableConsole();
                console.show();
                if (designModeEnabled) {
                    // designMode enabled: disable it
                    this.disableDesignMode(false);
                    //frame.raiseSeparator(console.getHeight());
                    log.restoreScroll();
                    frame.raiseSeparator(console.getHeight());
                } else {
                    log.show();
                    frame.enableSeparator();
                    frame.raiseSeparator(log.getHeight()+console.getHeight());
                    log.restoreScroll();
                }
                consoleDisplayed = true;
            }
        };

        this.toggleConsole = function() {
            if (consoleDisplayed) {
                this.hideConsole();
            } else {
                this.showConsole();
            }
        };

        this.enableDesignMode = function() {
            if (!designModeEnabled) {
                TRuntime.freeze(true);
                canvas.setDesignMode(true);
                TRuntime.setDesignMode(true);
                toolbar.enableDesignMode();
                if (consoleDisplayed) {
                    // log already displayed, with console: hide console
                    this.hideConsole(false);
                } else {
                    // log not displayed: show it
                    log.show();
                    frame.enableSeparator();
                    frame.raiseSeparator(log.getHeight());
                }
                log.showDesignLog();
                designModeEnabled = true;
            }
        };

        this.disableDesignMode = function(hideLog) {
            if (typeof hideLog === 'undefined') {
                hideLog = true;
            }
            if (designModeEnabled) {
                TRuntime.freeze(false);
                canvas.setDesignMode(false);
                TRuntime.setDesignMode(false);
                toolbar.disableDesignMode();
                log.hideDesignLog();
                if (hideLog) {
                    log.hide();
                    frame.lowerSeparator(log.getHeight());
                    frame.disableSeparator();
                }
                designModeEnabled = false;
            }
        };

        this.toggleDesignMode = function() {
            if (designModeEnabled) {
                this.disableDesignMode();
            } else {
                this.enableDesignMode();
            }
        };


        this.enableEditor = function(updateServer) {
            if (!editorEnabled) {
                // hide console
                this.hideConsole();
                toolbar.enableEditor();
                TRuntime.stop();
                canvas.hide();
                editor.show();
                sidebar.show();
                editorEnabled = true;
                if (typeof updateServer === 'undefined' || updateServer) {
                    if (typeof window.parent !== 'undefined') {
                        window.parent.switchEditor();
                    }
                }
            }
        };

        this.disableEditor = function(updateServer) {
            if (editorEnabled) {
                toolbar.disableEditor();
                editor.hide();
                sidebar.hide();
                canvas.show();
                editorEnabled = false;
                if (typeof updateServer === 'undefined' || updateServer) {
                    if (typeof window.parent !== 'undefined') {
                        window.parent.switchView();
                    }
                }
                TRuntime.start();
            }
        };

        this.toggleEditor = function() {
            if (editorEnabled) {
                this.disableEditor();
            } else {
                this.enableEditor();
            }
        };


        this.clear = function(confirm) {
            var goOn = true;
            if (typeof confirm !== 'undefined' && confirm) {
                goOn = window.confirm(TEnvironment.getMessage('clear-confirm'));
            }
            if (goOn) {
                TRuntime.clear();
                console.clear();
                this.clearLog();
                this.disableDesignMode();
                message.hide();
            }
        };

        this.addLogMessage = function(text) {
            if (typeof log !== 'undefined') {
                log.addMessage(text);
            } else {
                TEnvironment.log(text);
            }
        };

        this.showMessage = function(text) {
            if (typeof message !== 'undefined') {
                message.show(text);
            }
        };

        this.addLogError = function(error) {
            if (typeof log !== 'undefined') {
                log.addError(error);
            } else {
                TEnvironment.error(error);
            }
        };

        this.showErrorMessage = function(text, index) {
            if (typeof message !== 'undefined') {
                message.showError(text, index);
            }
        };

        this.clearLog = function() {
            if (typeof log !== 'undefined') {
                log.clear();
            }
        };

        this.getPreviousRow = function() {
            if (typeof log !== 'undefined') {
                return log.getPreviousRow();
            }
        };

        this.getNextRow = function() {
            if (typeof log !== 'undefined') {
                return log.getNextRow();
            }
        };

        this.setLastRow = function() {
            if (typeof log !== 'undefined') {
                return log.setLastRow();
            }
        };

        this.execute = function() {
            if (designModeEnabled) {
                this.disableDesignMode();
            }
            if (!editorEnabled) {
                // execution from console
                TRuntime.executeFrom(console);
                console.clear();
            } else if (editorEnabled) {
                // execution from editor
                this.clear(false);
                this.disableEditor();
                console.clear();
                TRuntime.executeFrom(editor,editor.getProgramName());
                window.setTimeout(function() {
                    canvas.giveFocus();
                });
            }
        };

        this.handleError = function(index) {
            var error = log.getError(index);
            if (error.getProgramName() === null) {
                if (consoleDisplayed) {
                    // error from command
                    console.setValue(error.getCode());
                    console.focus();
                }
            } else {
                // error from program
                this.enableEditor();
                this.editProgram(error.getProgramName());
                editor.setError(error.getLines());
            }
        };

        this.saveProgram = function() {
            var project = TEnvironment.getProject();
            editor.updateProgram();
            var program = editor.getProgram();
            sidebar.showLoadingProgram(program.getName());
            var self = this;
            project.saveProgram(program, function(error) {
                if (typeof error !== 'undefined') {
                    self.addLogError(error);
                } else {
                    self.addLogMessage(TEnvironment.getMessage('program-saved', program.getName()));
                    self.updateProgramInfo(program);
                    self.setSaveAvailable(false);
                    editor.reset();
                }
                sidebar.removeLoadingProgram(program.getName());
            }, editor.getSession());
        };

        this.newProgram = function() {
            var project = TEnvironment.getProject();
            var program = project.createProgram();
            project.setSession(program, editor.createSession(program));
            editor.setProgram(program);
            editor.setSession(project.getSession(program));
            this.updateSidebarPrograms();
            sidebar.displayPrograms();
            editor.giveFocus();
        };

        this.editProgram = function(name) {
            var project = TEnvironment.getProject();
            // save previous session if any
            var previousProgram = editor.getProgram();
            if (typeof previousProgram !== 'undefined') {
                project.updateSession(previousProgram, editor.getSession());
            }
            if (!project.isProgramEdited(name)) {
                // Program has to be loaded
                sidebar.showLoadingProgram(name);
                var self = this;
                project.editProgram(name, function(error) {
                    if (typeof error !== 'undefined') {
                        self.addLogError(error);
                    } else {
                        var newProgram = project.getEditedProgram(name);
                        project.setSession(newProgram, editor.createSession(newProgram));
                        editor.setProgram(newProgram);
                        editor.setSession(project.getSession(newProgram));
                        //update sidebar
                        self.updateSidebarPrograms();
                        editor.giveFocus();
                    }
                });
            } else {
                var newProgram = project.getEditedProgram(name);
                editor.setProgram(newProgram);
                editor.setSession(project.getSession(newProgram));
                //update sidebar
                this.updateSidebarPrograms();
                editor.giveFocus();
            }
        };

        function nextProgram(name) {
            var project = TEnvironment.getProject();
            var program = project.findPreviousEditedProgram(name);
            if (program) {
                editor.setProgram(program);
                editor.setSession(project.getSession(program));
                editor.giveFocus();
                return true;
            } else {
                editor.disable();
                return false;
            }
        }

        this.closeProgram = function(name) {
            var project = TEnvironment.getProject();
            var result = project.closeProgram(name);
            if (result) {
                // close performed
                // check if program was current editing program in editor, in which case we set next editing program as current program
                if (name === editor.getProgramName()) {
                    var result = nextProgram(name);
                    if (result) {
                        this.setSaveEnabled(true);
                        sidebar.setProgramsEditionEnabled(true);
                    } else {
                        this.setSaveAvailable(false);
                        this.setSaveEnabled(false);
                        sidebar.setProgramsEditionEnabled(false);
                    }
                }
                // update sidebar
                this.updateSidebarPrograms();
            } else {
                // close cancelled
                editor.giveFocus();
            }
        };

        this.renameProgram = function(oldName, newName) {
            if (newName !== oldName) {
                var project = TEnvironment.getProject();
                sidebar.showRenamingProgram(oldName);
                var self = this;
                project.renameProgram(oldName, newName, function(error) {
                    if (typeof error !== 'undefined') {
                        self.addLogError(error);
                    }
                    self.updateSidebarPrograms();
                });
            }
        };

        this.renameResource = function(name, newBaseName) {
            var project = TEnvironment.getProject();
            var oldBaseName = project.getResourceBaseName(name);
            var newName = name;
            if (newBaseName !== oldBaseName) {
                sidebar.showRenamingResource(name);
                var self = this;
                project.renameResource(name, newBaseName, function(name) {
                    if (name instanceof TError) {
                        self.addLogError(name);
                    } else {
                        newName = name;
                    }
                    self.updateSidebarResources();
                    sidebar.selectResource(newName);
                });
            }
        };

        this.setSaveAvailable = function(value) {
            toolbar.setSaveAvailable(value);
        };

        this.setSaveEnabled = function(value) {
            if (value && TEnvironment.isProjectAvailable()) {
                toolbar.setSaveEnabled(true);
                editor.setSaveEnabled(true);
            } else {
                toolbar.setSaveEnabled(false);
                editor.setSaveEnabled(false);
            }
        };
        
        this.setEditionEnabled = function(value) {
            sidebar.setEditionEnabled(value);
        };
        
        this.updateSidebarPrograms = function() {
            sidebar.updatePrograms();
        };

        this.updateSidebarResources = function() {
            sidebar.updateResources();
        };

        this.updateProgramInfo = function(program) {
            sidebar.updateProgramInfo(program);
        };

        this.getCurrentProgram = function() {
            return editor.getProgram();
        };

        this.displayPrograms = function() {
            sidebar.displayPrograms();
            programsDisplayed = true;
            resourcesDisplayed = false;
        };
        
        this.togglePrograms = function() {
            if (programsDisplayed) {
                sidebar.close();
                programsDisplayed = false;
            } else {
                this.displayPrograms();
            }
        };

        this.displayResources = function() {
            if (sidebar.displayResources()) {
                resourcesDisplayed = true;
                programsDisplayed = false;
            }
        };

        this.toggleResources = function() {
            if (resourcesDisplayed) {
                sidebar.close();
                resourcesDisplayed = false;
            } else {
                this.displayResources();
            }
        };

        this.delete = function() {
            var project = TEnvironment.getProject();
            if (programsDisplayed) {
                // Program deletion
                var name = editor.getProgramName();
                if (name === false) {
                    // editor disabled
                    return;
                }
                var goOn = window.confirm(TEnvironment.getMessage('delete-program-confirm', name));
                if (goOn) {
                    var self = this;
                    project.deleteProgram(name, function(error) {
                        if (typeof error !== 'undefined') {
                            self.addLogError(error);
                        } else {
                            var result = nextProgram(name);
                            if (result) {
                                self.setSaveEnabled(true);
                                sidebar.setProgramsEditionEnabled(true);
                            } else {
                                self.setSaveAvailable(false);
                                self.setSaveEnabled(false);
                                sidebar.setProgramsEditionEnabled(false);
                            }
                        }
                        //update sidebar
                        self.updateSidebarPrograms();
                        editor.giveFocus();
                    });
                }
                editor.giveFocus();
            } else {
                // Resource deletion
                var name = sidebar.getCurrentResourceName();
                if (name !== "") {
                    var goOn = window.confirm(TEnvironment.getMessage('delete-resource-confirm', name));
                    if (goOn) {
                        var self = this;
                        project.deleteResource(name, function(error) {
                            if (typeof error !== 'undefined') {
                                self.addLogError(error);
                            }
                            //update sidebar
                            self.updateSidebarResources();
                            sidebar.setResourcesEditionEnabled(false);
                        });
                    }
                }
            }
        };

        this.recordObjectLocation = function(tObject, location) {
            var name = TRuntime.getTObjectName(tObject);
            log.addObjectLocation(name, location);
        };

        this.setResourceContent = function(name, data, callback) {
            var self = this;
            TEnvironment.getProject().setResourceContent(name, data, function(newName) {
                if (!(newName instanceof TError)) {
                    if (newName !== name) {
                        // name has changed: update sidebar
                        self.updateSidebarResources();
                        sidebar.selectResource(newName);
                    }
                    callback.call(this, newName);
                }
            });
        };

        this.duplicateResource = function(name, callback) {
            var self = this;
            TEnvironment.getProject().duplicateResource(name, function(newName) {
                if (!(newName instanceof TError)) {
                    self.updateSidebarResources();
                    sidebar.selectResource(newName);
                    sidebar.viewResource(newName);
                }
                callback.call(this, newName);
            });
        };

        this.newResource = function() {
            sidebar.createResource();
        };

        this.createResource = function(name, width, height, callback) {
            var self = this;
            TEnvironment.getProject().createResource(name, width, height, function(newName) {
                if (!(newName instanceof TError)) {
                    self.updateSidebarResources();
                    sidebar.selectResource(newName);
                    sidebar.viewResource(newName);
                }
                callback.call(this, newName);
            });
        };

        this.init = function() {
            this.clear();
            editor.disable();
            sidebar.load();
            TEnvironment.getProject().init(function() {
                sidebar.update();
            });
        };

    };

    var uiInstance = new TUI();

    return uiInstance;

});
