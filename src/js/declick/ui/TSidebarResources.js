define(['TLink', 'ui/TComponent', 'TUI', 'TEnvironment', 'TError', 'ui/TViewer', 'ui/TTextEditor', 'jquery', 'jquery-ui/widget', 'iframe-transport', 'fileupload'],
function(TLink, TComponent, TUI, TEnvironment, TError, TViewer, TTextEditor, $) {

    function TSidebarResources(callback) {

        var $resources, $upload, $files, $emptyMedia, $buttonDelete;
        var viewer;
        var textEditor;
        var empty = true;
        var uploadingDivs = {};


        TComponent.call(this, "TSidebarResources.html", function(component) {
            $resources = component;
            $resources.addClass("loading");
            $upload = component.find("#tsidebar-upload");
            var $uploadButton = component.find("#tsidebar-upload-button");
            $uploadButton.append(TEnvironment.getMessage("resource_upload_files"));
            $uploadButton.click(function(e) {
                $("#tsidebar-upload-input").click();
            });

            var $buttonNewResource = component.find("#tsidebar-new-resource");
            $buttonNewResource.attr("title", TEnvironment.getMessage('option-new-resource'));
            $buttonNewResource.click(function(e) {
                TUI.newResource();
            });

            $buttonDelete = component.find("#tsidebar-delete-resource");
            $buttonDelete.attr("title", TEnvironment.getMessage('option-delete'));
            $buttonDelete.click(function(e) {
                if (!$(this).is(':disabled')) {
                    TUI.delete();
                }
            });

            var emptyMediaP = component.find("#tsidebar-resources-empty p");
            emptyMediaP.append(TEnvironment.getMessage("empty-media-library"));

            $files = component.find("#tsidebar-files");
            $emptyMedia = component.find("#tsidebar-resources-empty");



            $resources.on("keydown", function(event) {
                switch (event.which) {
                    case 8: // backspace
                    case 46: // suppr
                        if ($resources.find(".tsidebar-renaming").length === 0 && $resources.find(".tsidebar-current").length > 0) {
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
        this.init = function() {
            viewer.setNextHandler(function() {
                var current = $files.find('.tsidebar-current');
                var nextImage = current.next('.tsidebar-type-image');
                if (nextImage.length === 0)
                    nextImage = $files.find('.tsidebar-type-image:first');
                current.removeClass('tsidebar-current');
                nextImage.addClass('tsidebar-current');
                $resources.stop().animate({scrollTop: $resources.scrollTop() + nextImage.position().top}, 1000);
                var name = nextImage.find('.tsidebar-file-name').text();
                return name;
            });

            viewer.setPrevHandler(function() {
                var current = $files.find('.tsidebar-current');
                var prevImage = current.prev('.tsidebar-type-image');
                if (prevImage.length === 0)
                    prevImage = $files.find('.tsidebar-type-image:last');
                current.removeClass('tsidebar-current');
                prevImage.addClass('tsidebar-current');
                $resources.stop().animate({scrollTop: $resources.scrollTop() + prevImage.position().top}, 1000);
                var name = prevImage.find('.tsidebar-file-name').text();
                return name;
            });

            // Set up blueimp fileupload plugin
            // TODO: make use of acceptFileTypes and maxFileSize
            $upload.fileupload({
                dataType: 'json',
                type: 'POST',
                url: null,
                singleFileUploads: true,
                paramName: 'data',
                dropZone: $resources,
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
                            var where = $files.find('.tsidebar-file:eq(' + index + ')');
                            if (where.length > 0)
                                where.before(div);
                            else
                                $files.append(div);
                            newDivs.push(div);
                            uploadingDivs[file.name] = $(div);
                        }
                        if (empty) {
                            $emptyMedia.hide();
                            empty = false;
                        }
                        $resources.stop().animate({scrollTop: $resources.scrollTop() + $(div).position().top}, 1000);

                        var file = files[0]
                        TLink.createResource(file.name, function () {
                            data.url = TLink.getResourceUploadLocation(file.name)
                            data.name = file.name
                            data.submit()
                        })
                    } catch (error) {
                        // error
                        // 1st remove loading resources
                        for (var i = 0; i < newNames.length; i++) {
                            project.removeUploadingResource(newNames[i]);
                            delete uploadingDivs[newNames[i]];
                        }
                        // 2nd remove loading resources div
                        for (var i = 0; i < newDivs.length; i++) {
                            $files.get(0).removeChild(newDivs[i]);
                        }
                        // 3rd check if there is some file left, otherwise add "empty" message
                        if ($files.children().length === 0 && !empty) {
                            $emptyMedia.show();
                            empty = true;
                        }

                        // 4th display error
                        TUI.addLogError(error);
                    }
                },
                beforeSend: function(xhr, data) {
                    xhr.setRequestHeader(
                        'Authorization',
                        'Token ' + TLink.getAuthorizationToken()
                    )
                },
                done: function(e, data) {
                    var project = TEnvironment.getProject();
                    TLink.getResource(data.name, function (resource) {
                        var name = data.name
                        var $div = uploadingDivs[name];
                        if (typeof $div !== 'undefined') {
                            $div.find(".progress-bar-wrapper").fadeOut(2000, function() {
                                $(this).remove();
                            });
                        }
                        $div.removeClass('tsidebar-type-uploading');
                        var type = '';
                        if (typeof resource.type !== 'undefined') {
                            $div.addClass('tsidebar-type-' + resource.type);
                        }
                        delete uploadingDivs[name];
                        project.resourceUploaded(name, resource);
                    })
                    /*
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
                    */
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
            this.update();
            viewer.init();
            textEditor.init();
        };

        /**
         * Loads Resources.
         */
        this.load = function() {
            $files.empty();
            $resources.addClass("loading");
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

        this.update = function() {
            $resources.removeClass("loading");

            var project = TEnvironment.getProject();
            var resourcesNames = project.getResourcesNames();
            var resources = project.getResources();

            function addElement(name, type) {
                var div = getResourceDiv(name, type, false);
                $files.append(div);
            }

            $files.empty();
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

        this.showRenaming = function(name) {
            var nameDiv = $(".tsidebar-renaming");
            var loadElement = document.createElement("div");
            loadElement.className = "tsidebar-loading";
            nameDiv.parent().append(loadElement);
        };

        this.show = function() {
            $resources.show();
        };

        this.hide = function() {
            $resources.hide();
        };

        this.hasCurrent = function() {
            return ($resources.find(".tsidebar-current").length > 0);
        };

        this.select = function(name) {
            var element = $(".tsidebar-file-name:contains(" + name + ")");
            if (element.length > 0) {
                $('.tsidebar-file').removeClass('tsidebar-current');
                var parent = element.first().parent();
                parent.addClass('tsidebar-current');
                $resources.stop().animate({scrollTop: $resources.scrollTop() + parent.position().top}, 1000);
                TUI.setEditionEnabled(true);
            }
        };

        this.view = function(name) {
            viewer.show(name);
        };

        this.getCurrentName = function() {
            var currentDiv = $resources.find('.tsidebar-current .tsidebar-file-name div');
            if (currentDiv.length < 0)
                return false;
            return currentDiv.text();
        };

        this.create = function() {
            viewer.create();
        };

        this.setEditionEnabled = function(value) {
            if (value) {
                $buttonDelete.prop("disabled", false);
            } else {
                $buttonDelete.prop("disabled", true);
            }
        };

    }

    TSidebarResources.prototype = Object.create(TComponent.prototype);
    TSidebarResources.prototype.constructor = TSidebarResources;

    return TSidebarResources;
});
