define(['ui/TComponent', 'TUI', 'TEnvironment', 'TProgram', 'TError', 'ui/TViewer', 'ui/TTextEditor', 'jquery', 'jquery-ui/widget', 'iframe-transport', 'fileupload'], function(TComponent, TUI, TEnvironment, TProgram, TError, TViewer, TTextEditor, $) {

    function TSidebar(callback) {

        var $sidebar, $sidebarUpload, $sidebarPrograms, $sidebarFiles, $sidebarResources, $switchPrograms, $switchResources, $emptyMedia;
        var viewer;
        var textEditor;
        var programsVisible = false;
        var empty = true;
        var uploadingDivs = {};


        TComponent.call(this, "TSidebar.html", function(component) {
            $sidebar = component;
            $sidebarUpload = component.find("#tsidebar-upload");
            $switchPrograms = component.find("#tsidebar-switch-programs");
            $switchPrograms.prop("title", TEnvironment.getMessage("switch-programs"));
            $switchPrograms.click(function(e) {
                TUI.displayPrograms();
            });
            $switchResources = component.find("#tsidebar-switch-resources");
            $switchResources.prop("title", TEnvironment.getMessage("switch-resources"));
            $switchResources.click(function(e) {
                TUI.displayResources();
            });
            var $sidebarUploadButton = component.find("#tsidebar-upload-button");
            $sidebarUploadButton.append(TEnvironment.getMessage("resource_upload_files"));
            $sidebarUploadButton.click(function(e) {
                $("#tsidebar-upload-input").click();
            });
            var emptyMediaP = component.find("#tsidebar-resources-empty p");
            emptyMediaP.append(TEnvironment.getMessage("empty-media-library"));

            $sidebarPrograms = component.find("#tsidebar-programs");
            $sidebarResources = component.find("#tsidebar-resources");
            $sidebarResources.addClass("loading");
            $sidebarPrograms.addClass("loading");
            ;
            $sidebarFiles = component.find("#tsidebar-files");
            $emptyMedia = component.find("#tsidebar-resources-empty");

            $sidebarResources.on("keydown", function(event) {
                switch (event.which) {
                    case 8: // backspace
                    case 46: // suppr
                        if ($sidebarResources.find(".tsidebar-renaming").length === 0 && $sidebarResources.find(".tsidebar-current").length > 0) {
                            // we are not renaming a resource
                            TUI.delete();
                        }
                        break;
                }
            });

            var self = this;

            viewer = new TViewer(function(c) {
                textEditor = new TTextEditor(function(d) {
                    if (typeof callback !== 'undefined') {
                        callback.call(self, component);
                    }
                });
            });
        });

        /**
         * Display Sidebar.
         */
        this.displayed = function() {
            viewer.setNextHandler(function() {
                var current = $sidebarFiles.find('.tsidebar-current');
                var nextImage = current.next('.tsidebar-type-image');
                if (nextImage.length === 0)
                    nextImage = $sidebarFiles.find('.tsidebar-type-image:first');
                current.removeClass('tsidebar-current');
                nextImage.addClass('tsidebar-current');
                $sidebarResources.stop().animate({scrollTop: $sidebarResources.scrollTop() + nextImage.position().top}, 1000);
                var name = nextImage.find('.tsidebar-file-name').text();
                return name;
            });

            viewer.setPrevHandler(function() {
                var current = $sidebarFiles.find('.tsidebar-current');
                var prevImage = current.prev('.tsidebar-type-image');
                if (prevImage.length === 0)
                    prevImage = $sidebarFiles.find('.tsidebar-type-image:last');
                current.removeClass('tsidebar-current');
                prevImage.addClass('tsidebar-current');
                $sidebarResources.stop().animate({scrollTop: $sidebarResources.scrollTop() + prevImage.position().top}, 1000);
                var name = prevImage.find('.tsidebar-file-name').text();
                return name;
            });
            
            this.displayPrograms();
            this.init();
            // Set up blueimp fileupload plugin
            // TODO: make use of acceptFileTypes and maxFileSize
            $sidebarUpload.fileupload({
                dataType: 'json',
                url: TEnvironment.getBackendUrl('addresource'),
                paramName: 'resources[]',
                dropZone: $sidebarResources,
                add: function(e, data) {
                    var newDivs = [];
                    var newNames = [];
                    try {
                        // Insert div corresponding to loading files
                        var files = data.files;
                        var project = TEnvironment.getProject();
                        var div;
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            div = getResourceDiv(file.name, 'uploading', false);
                            // add progress bar
                            var domProgress = document.createElement("div");
                            domProgress.className = "progress-bar-wrapper";
                            var domBar = document.createElement("div");
                            domBar.className = "progress-bar";
                            domProgress.appendChild(domBar);
                            div.appendChild(domProgress);
                            var index = project.uploadingResource(file.name);
                            var where = $sidebarFiles.find('.tsidebar-file:eq(' + index + ')');
                            if (where.length > 0)
                                where.before(div);
                            else
                                $sidebarFiles.append(div);
                            newDivs.push(div);
                            uploadingDivs[file.name] = $(div);
                        }
                        if (empty) {
                            $emptyMedia.hide();
                            empty = false;
                        }
                        $sidebarResources.stop().animate({scrollTop: $sidebarResources.scrollTop() + $(div).position().top}, 1000);
                        data.submit();
                    } catch (error) {
                        // error
                        // 1st remove loading resources
                        for (var i = 0; i < newNames.length; i++) {
                            project.removeUploadingResource(newNames[i]);
                            delete uploadingDivs[newNames[i]];
                        }
                        // 2nd remove loading resources div
                        for (var i = 0; i < newDivs.length; i++) {
                            $sidebarFiles.get(0).removeChild(newDivs[i]);
                        }
                        // 3rd check if there is some file left, otherwise add "empty" message
                        if ($sidebarFiles.children().length() === 0 && !empty) {
                            $emptyMedia.show();
                            empty = true;
                        }

                        // 4th display error
                        TUI.addLogError(error);
                    }
                },
                done: function(e, data) {
                    var result = data.result;
                    if (typeof result !== 'undefined') {
                        if (typeof result.error !== 'undefined') {
                            // an error occured
                            // First remove corresponding divs
                            var project = TEnvironment.getProject();
                            for (var i = 0; i < data.files.length; i++) {
                                var name = data.files[i].name;
                                var $div = uploadingDivs[name];
                                $div.remove();
                                project.removeUploadingResource(name);
                                delete uploadingDivs[name];
                            }
                            // Then display error
                            var message;
                            if (typeof result.error.message !== 'undefined' && typeof result.error.name !== 'undefined') {
                                message = TEnvironment.getMessage(result.error.message, result.error.name);
                            } else {
                                message = TEnvironment.getMessage("backend-error-" + result.error);
                            }
                            var error = new TError(message);
                            TUI.addLogError(error);
                        } else if (typeof result.created !== 'undefined') {
                            // files were created
                            var project = TEnvironment.getProject();

                            for (var i = 0; i < result.created.length; i++) {
                                var name = result.created[i].name;
                                var data = result.created[i].data;
                                var $div = uploadingDivs[name];
                                if (typeof $div !== 'undefined') {
                                    $div.find(".progress-bar-wrapper").fadeOut(2000, function() {
                                        $(this).remove();
                                    });
                                }
                                $div.removeClass('tsidebar-type-uploading');
                                var type = '';
                                if (typeof data.type !== 'undefined') {
                                    $div.addClass('tsidebar-type-' + data.type);
                                }
                                delete uploadingDivs[name];
                                project.resourceUploaded(name, data);
                            }
                        }
                    }
                },
                progress: function(e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    for (var i = 0; i < data.files.length; i++) {
                        var name = data.files[i].name;
                        var $div = uploadingDivs[name];
                        if (typeof $div !== 'undefined') {
                            $div.find(".progress-bar").css('width', progress + '%');
                        }
                    }
                }
            });
            viewer.displayed();
        };

        /**
         * Init Sidebar.
         */
        this.init = function() {
            $sidebarPrograms.removeClass("loading");
            this.updatePrograms();
            $sidebarResources.removeClass("loading");
            this.updateResources();
            viewer.init();
            textEditor.init();
        };

        /**
         * Loads Programs and Resources.
         */
        this.load = function() {
            $sidebarPrograms.empty();
            $sidebarFiles.empty();
            $sidebarPrograms.addClass("loading");
            $sidebarResources.addClass("loading");
        };

        /**
         * Update Programs.
         */
        this.updatePrograms = function() {
            var project = TEnvironment.getProject();
            var programList = project.getProgramsNames();
            var editedPrograms = project.getEditedPrograms();
            var currentProgram = TUI.getCurrentProgram();
            var editedNames = [];

            $sidebarPrograms.empty();

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
                $sidebarPrograms.append(element);
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

        /**
         * TBD
         * @param {type} name
         * @param {type} type
         * @returns {TSidebar_L1.TSidebar.getResourceDiv.resourceDiv}
         */
        function getResourceDiv(name, type) {
            var resourceDiv = document.createElement("div");
            resourceDiv.className = "tsidebar-file tsidebar-type-" + type;
            var nameDiv = document.createElement("div");
            nameDiv.className = "tsidebar-file-name";
            var innerDiv = document.createElement("div");
            innerDiv.appendChild(document.createTextNode(name));
            nameDiv.appendChild(innerDiv);
            resourceDiv.appendChild(nameDiv);
            var imgDiv = document.createElement("div");
            imgDiv.className = "tsidebar-file-icon";
            resourceDiv.appendChild(imgDiv);
            resourceDiv.onclick = function(e) {
                // set as current
                if (!$(this).hasClass('tsidebar-current')) {
                    $('.tsidebar-file').removeClass('tsidebar-current');
                    $(this).addClass('tsidebar-current');
                    TUI.setEditionEnabled(true);
                }
            };
            // preview
            imgDiv.onclick = function(e) {
                var parent = $(this).parent();
                if (parent.hasClass('tsidebar-type-image')) {
                    // select and open in viewer
                    var clickedName = parent.find('.tsidebar-file-name div').text();
                    viewer.show(clickedName);
                } else if (parent.hasClass('tsidebar-type-text')) {
                    // select and open in viewer
                    var clickedName = parent.find('.tsidebar-file-name div').text();
                    textEditor.loadText(clickedName);
                }
            };
            // rename
            nameDiv.onclick = function(e) {
                var parent = $(this).parent();
                if (parent.hasClass('tsidebar-current') && !$(this).hasClass('tsidebar-renaming')) {
                    parent.attr("draggable", "false");
                    $(this).addClass('tsidebar-renaming');
                    var renameElement = document.createElement("textarea");
                    renameElement.className = "tsidebar-rename";
                    renameElement.value = TEnvironment.getProject().getResourceBaseName(name);
                    $(renameElement).keydown(function(e) {
                        if (e.which === 13) {
                            // Enter was pressed
                            TUI.renameResource(name, renameElement.value);
                            e.preventDefault();
                        }
                        if (e.which === 27) {
                            // Escape was pressed
                            $(this).parent().removeClass('tsidebar-renaming');
                            $(renameElement).remove();
                            parent.attr("draggable", "true");
                        }
                    });
                    renameElement.onblur = function() {
                        TUI.renameResource(name, renameElement.value);
                    };
                    $(this).append(renameElement);
                    renameElement.focus();
                }
            };
            resourceDiv.setAttribute("draggable", "true");
            resourceDiv.ondragstart = function(e) {
                var element = $(e.target).find(".tsidebar-file-name > div");
                e.dataTransfer.setData("text/plain", "\"" + element.text() + "\"");
            };
            return resourceDiv;
        }

        this.updateResources = function() {
            var project = TEnvironment.getProject();
            var resourcesNames = project.getResourcesNames();
            var resources = project.getResources();

            function addElement(name, type) {
                var div = getResourceDiv(name, type, false);
                $sidebarFiles.append(div);
            }

            $sidebarFiles.empty();
            if (resourcesNames.length === 0) {
                // no media: add message
                if (!empty) {
                    $emptyMedia.show();
                    empty = true;
                }
            } else {
                if (empty) {
                    $emptyMedia.hide();
                    empty = false;
                }
                for (var i = 0; i < resourcesNames.length; i++) {
                    var name = resourcesNames[i];
                    addElement(name, resources[name].type);
                }
                empty = false;
            }
        };

        this.updateProgramInfo = function(program) {
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

        this.showRenamingProgram = function(name) {
            var id = "#tsidebar-program-" + TProgram.findId(name);
            var loadElement = document.createElement("div");
            loadElement.className = "tsidebar-loading";
            $(id).parent().append(loadElement);
        };

        this.showRenamingResource = function(name) {
            var nameDiv = $(".tsidebar-renaming");
            var loadElement = document.createElement("div");
            loadElement.className = "tsidebar-loading";
            nameDiv.parent().append(loadElement);
        };

        this.show = function() {
            $sidebar.show();
        };

        this.hide = function() {
            $sidebar.hide();
        };

        this.displayPrograms = function() {
            if (!programsVisible) {
                $sidebarPrograms.show();
                $switchPrograms.addClass("active");
                $sidebarResources.hide();
                $switchResources.removeClass("active");
                $sidebar.animate({width: "250px"}, 500);
                programsVisible = true;
                var edition = ($sidebarPrograms.find(".tsidebar-current").length > 0);
                TUI.setEditionEnabled(edition);
            }
        };

        this.displayResources = function() {
            if (programsVisible) {
                if (!TEnvironment.isProjectAvailable()) {
                    // Project is not available: we cannot manage resources
                    var error = new TError(TEnvironment.getMessage('resources-unavailable-user-not-logged'));
                    TUI.addLogError(error);
                    return false;
                } else {
                    $sidebarPrograms.hide();
                    $switchPrograms.removeClass("active");
                    $sidebarResources.show();
                    $switchResources.addClass("active");
                    $sidebar.animate({width: "440px"}, 500);
                    programsVisible = false;
                    var edition = ($sidebarResources.find(".tsidebar-current").length > 0);
                    TUI.setEditionEnabled(edition);
                    return true;
                }
            } else {
                return true;
            }
        };

        this.selectResource = function(name) {
            var element = $(".tsidebar-file-name:contains(" + name + ")");
            if (element.length > 0) {
                $('.tsidebar-file').removeClass('tsidebar-current');
                var parent = element.first().parent();
                parent.addClass('tsidebar-current');
                $sidebarResources.stop().animate({scrollTop: $sidebarResources.scrollTop() + parent.position().top}, 1000);
                TUI.setEditionEnabled(true);
            }
        };

        this.viewResource = function(name) {
            viewer.show(name);
        };

        this.getCurrentResourceName = function() {
            var currentDiv = $sidebarResources.find('.tsidebar-current .tsidebar-file-name div');
            if (currentDiv.length < 0)
                return false;
            return currentDiv.text();
        };

        this.createResource = function() {
            viewer.create();
        };

    }

    TSidebar.prototype = Object.create(TComponent.prototype);
    TSidebar.prototype.constructor = TSidebar;

    return TSidebar;
});
