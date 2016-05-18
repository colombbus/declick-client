define(['ui/TComponent', 'TUI', 'TEnvironment', 'TProgram', 'jquery'], function(TComponent, TUI, TEnvironment, TProgram, $) {

    function TSidebarPrograms(callback) {

        var $programs, $list;
        

        TComponent.call(this, "TSidebarPrograms.html", function(component) {
            $programs = component;
            $list = component.find("#tsidebar-programs-list");
            $list.addClass("loading");
            
            var $buttonNewProgram = component.find("#tsidebar-new-program");
            $buttonNewProgram.attr("title", TEnvironment.getMessage('option-new-program'));
            $buttonNewProgram.click(function(e) {
                TUI.newProgram();
            });
            var $buttonDeleteProgram = component.find("#tsidebar-delete-program");
            $buttonDeleteProgram.attr("title", TEnvironment.getMessage('option-delete'));
            $buttonDeleteProgram.click(function(e) {
                TUI.delete();
            });

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        /**
         * Init Sidebar.
         */
        this.init = function() {
            $list.removeClass("loading");
            this.update();
        };

        /**
         * Loads Programs and Resources.
         */
        this.load = function() {
            $list.empty();
            $list.addClass("loading");
        };

        /**
         * Update Programs.
         */
        this.update = function() {
            var project = TEnvironment.getProject();
            var programList = project.getProgramsNames();
            var editedPrograms = project.getEditedPrograms();
            var currentProgram = TUI.getCurrentProgram();
            var editedNames = [];

            $list.empty();

            function addElement(name, id, displayedName, edited, current) {
                var element = document.createElement("div");
                element.className = "tsidebar-program";
                if (edited) {
                    element.className += " tsidebar-edited";
                }
                if (typeof current !== 'undefined' && current) {
                    element.className += " tsidebar-current";
                }
                $(element).click(function(e) {
                    if ($(this).hasClass('tsidebar-renaming'))
                        return false;
                    if (current) {
                        // rename program
                        $(this).addClass('tsidebar-renaming');
                        var renameElement = document.createElement("input");
                        renameElement.type = "text";
                        renameElement.className = "tsidebar-rename";
                        renameElement.value = name;
                        $(renameElement).keydown(function(e) {
                            if (e.which === 13) {
                                // Enter was pressed
                                TUI.renameProgram(name, renameElement.value);
                            }
                            if (e.which === 27) {
                                // Escape was pressed
                                $(this).parent().removeClass('tsidebar-renaming');
                                $(renameElement).remove();
                            }
                        });
                        renameElement.onblur = function() {
                            TUI.renameProgram(name, renameElement.value);
                        };
                        $(this).append(renameElement);
                        renameElement.focus();
                    } else {
                        // edit program
                        TUI.editProgram(name);
                        e.stopPropagation();
                    }
                });
                var nameElement = document.createElement("div");
                nameElement.id = "tsidebar-program-" + id;
                nameElement.appendChild(document.createTextNode(displayedName));
                element.appendChild(nameElement);
                if (edited) {
                    var closeElement = document.createElement("div");
                    closeElement.className = "tsidebar-close";
                    closeElement.onclick = function(e) {
                        TUI.closeProgram(name);
                        e.stopPropagation();
                    };
                    element.appendChild(closeElement);
                }
                $list.append(element);
            }

            var currentName = "";

            if (typeof currentProgram !== 'undefined') {
                currentName = currentProgram.getName();
            }

            for (var i = 0; i < editedPrograms.length; i++) {
                var program = editedPrograms[i];
                var programName = program.getName();
                editedNames.push(programName);
                addElement(programName, program.getId(), program.getDisplayedName(), true, programName === currentName);
            }

            for (var i = 0; i < programList.length; i++) {
                var name = programList[i];
                if (editedNames.indexOf(name) === -1) {
                    addElement(name, TProgram.findId(name), name, false);
                }
            }
        };

        this.updateInfo = function(program) {
            var id = "#tsidebar-program-" + program.getId();
            $(id).text(program.getDisplayedName());
        };

        this.showLoading = function(name) {
            var id = "#tsidebar-program-" + TProgram.findId(name);
            var loadElement = document.createElement("div");
            loadElement.className = "tsidebar-loading";
            $(id).append(loadElement);
        };

        this.removeLoading = function(name) {
            var id = "#tsidebar-program-" + TProgram.findId(name);
            $(id).find(".tsidebar-loading").remove();
        };

        this.showRenaming = function(name) {
            var id = "#tsidebar-program-" + TProgram.findId(name);
            var loadElement = document.createElement("div");
            loadElement.className = "tsidebar-loading";
            $(id).parent().append(loadElement);
        };

        this.show = function() {
            $programs.show();
        };

        this.hide = function() {
            $programs.hide();
        };

        this.hasCurrent = function() {
            return ($list.find(".tsidebar-current").length > 0);
        };

    }

    TSidebarPrograms.prototype = Object.create(TComponent.prototype);
    TSidebarPrograms.prototype.constructor = TSidebarPrograms;

    return TSidebarPrograms;
});