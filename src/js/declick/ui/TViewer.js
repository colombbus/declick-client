define(['ui/TComponent', 'TUI', 'TEnvironment', 'TError', 'jquery', 'wColorPicker', 'wPaint', 'wPaint/plugins/main', 'wPaint/plugins/text', 'wPaint/plugins/shapes', 'wPaint/plugins/flip', 'wPaint/plugins/file'], function(TComponent, TUI, TEnvironment, TError, $) {
    function TViewer(callback) {
        var currentName = '';
        var currentWidth = 0;
        var currentHeight = 0;
        var nextHandler = null;
        var prevHandler = null;
        var $main, $title, $imageContainer, $image, $editor, $editorImage, $creation, $message, $creationMessage, $buttonCreate;
        var $name, $width, $height;
        var image;
        var editorInitialized = false;
        var imageDisplayed = false;
        var imageEdited = false;
        var imageCreation = false;

        TComponent.call(this, "TViewer.html", function(component) {
            $main = component;
            $title = component.find(".tviewer-title");
            $imageContainer = component.find(".tviewer-image");
            $image = $imageContainer.find("img");
            image = $image.get(0);
            $editor = component.find(".tviewer-editor");
            $editorImage = component.find(".tviewer-editor-image");
            $creation = component.find(".tviewer-creation");
            $message = component.find(".tviewer-editor-message");
            $creationMessage = component.find(".tviewer-creation-message");

            $image.load(function(e) {
                $imageContainer.show();
                imageDisplayed = true;
                $main.removeClass("loading");
                updateImageSize();
                currentWidth = image.naturalWidth;
                currentHeight = image.naturalHeight;
                $title.text(currentName + " (" + currentWidth + "x" + currentHeight + ")");
            });

            var $edit = component.find(".tviewer-button-edit");
            $edit.prop("title", TEnvironment.getMessage("viewer-edit"));
            $edit.click(function(e) {
                edit();
            });
            var $duplicate = component.find(".tviewer-button-duplicate");
            $duplicate.prop("title", TEnvironment.getMessage("viewer-duplicate"));
            $duplicate.click(function(e) {
                TUI.duplicateResource(currentName, function(newName) {
                    if (typeof newName === TError){
                        message(newName.getMessage());
                    }
                });
            });
            var $closes = component.find(".tviewer-button-close");
            $closes.prop("title", TEnvironment.getMessage("viewer-close"));
            $closes.click(function(e) {
                hide();
            });

            var $left = component.find(".tviewer-button-left");
            $left.click(function(e) {
                if (prevHandler !== null) {
                    displayImage(prevHandler());
                }
            });

            var $right = component.find(".tviewer-button-right");
            $right.click(function(e) {
                if (nextHandler !== null) {
                    displayImage(nextHandler());
                }
            });

            var $creationTitle = component.find(".tviewer-creation-title");
            $creationTitle.append(TEnvironment.getMessage("viewer-creation-title"));
            var $nameLabel = component.find(".tviewer-creation-label-name");
            $nameLabel.append(TEnvironment.getMessage("viewer-creation-name"));
            var $widthLabel = component.find(".tviewer-creation-label-width");
            $widthLabel.append(TEnvironment.getMessage("viewer-creation-width"));
            var $heightLabel = component.find(".tviewer-creation-label-height");
            $heightLabel.append(TEnvironment.getMessage("viewer-creation-height"));
            $name = component.find("input[name='name']");
            $width = component.find("input[name='width']");
            $height = component.find("input[name='height']");

            var $buttonCancel = component.find(".tviewer-creation-cancel");
            $buttonCancel.click(function(e) {
                hide();
            });
            $buttonCancel.append(TEnvironment.getMessage("viewer-creation-cancel"));
            $buttonCreate = component.find(".tviewer-creation-create");
            $buttonCreate.click(function(e) {
                if (checkCreation()) {
                    TUI.createResource($name.val(), $width.val(), $height.val(), function(newName) {
                        if (typeof newName === TError) {
                            message(newName.getMessage());
                        }
                    });
                }
            });
            $buttonCreate.append(TEnvironment.getMessage("viewer-creation-create"));

            $main.addClass("loading");
            $main.hide();
            $imageContainer.hide();
            $editor.hide();
            $creation.hide();
            $message.hide();
            $creationMessage.hide();

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        // Configuration of wPaint

        // remove load buttons from wPaint menu
        delete $.fn.wPaint.menus.main.items.loadBg;
        delete $.fn.wPaint.menus.main.items.loadFg;

        // Set save handler
        $.extend($.fn.wPaint.defaults, {
            saveImg: function() {
                var imageData = $editorImage.wPaint("image");
                TUI.setResourceContent(currentName, imageData, function(currentName) {
                    if (typeof currentName === TError) {
                        message(currentName.getMessage());
                    } else {
                        message(TEnvironment.getMessage('image-editor-saved', currentName));
                    }
                });
            }
        });

        // Set texts
        $.extend($.fn.wPaint.menus.main.items.undo, {
            title: TEnvironment.getMessage("wpaint-undo")
        });
        $.extend($.fn.wPaint.menus.main.items.redo, {
            title: TEnvironment.getMessage("wpaint-redo")
        });
        $.extend($.fn.wPaint.menus.main.items.clear, {
            title: TEnvironment.getMessage("wpaint-clear")
        });
        $.extend($.fn.wPaint.menus.main.items.rectangle, {
            title: TEnvironment.getMessage("wpaint-rectangle")
        });
        $.extend($.fn.wPaint.menus.main.items.ellipse, {
            title: TEnvironment.getMessage("wpaint-ellipse")
        });
        $.extend($.fn.wPaint.menus.main.items.line, {
            title: TEnvironment.getMessage("wpaint-line")
        });
        $.extend($.fn.wPaint.menus.main.items.pencil, {
            title: TEnvironment.getMessage("wpaint-pencil")
        });
        $.extend($.fn.wPaint.menus.main.items.eraser, {
            title: TEnvironment.getMessage("wpaint-eraser")
        });
        $.extend($.fn.wPaint.menus.main.items.bucket, {
            title: TEnvironment.getMessage("wpaint-bucket")
        });
        $.extend($.fn.wPaint.menus.main.items.fillStyle, {
            title: TEnvironment.getMessage("wpaint-fill-style")
        });
        $.extend($.fn.wPaint.menus.main.items.lineWidth, {
            title: TEnvironment.getMessage("wpaint-line-width")
        });
        $.extend($.fn.wPaint.menus.main.items.strokeStyle, {
            title: TEnvironment.getMessage("wpaint-stroke-style")
        });
        $.extend($.fn.wPaint.menus.main.items.text, {
            title: TEnvironment.getMessage("wpaint-text")
        });
        $.extend($.fn.wPaint.menus.text.items.bold, {
            title: TEnvironment.getMessage("wpaint-bold")
        });
        $.extend($.fn.wPaint.menus.text.items.italic, {
            title: TEnvironment.getMessage("wpaint-italic")
        });
        $.extend($.fn.wPaint.menus.text.items.fontSize, {
            title: TEnvironment.getMessage("wpaint-font-size")
        });
        $.extend($.fn.wPaint.menus.text.items.fontFamily, {
            title: TEnvironment.getMessage("wpaint-font-family")
        });
        $.extend($.fn.wPaint.menus.main.items.save, {
            title: TEnvironment.getMessage("wpaint-save")
        });
        $.extend($.fn.wPaint.menus.main.items.roundedRect, {
            title: TEnvironment.getMessage("wpaint-rounded-rectangle")
        });
        $.extend($.fn.wPaint.menus.main.items.square, {
            title: TEnvironment.getMessage("wpaint-square")
        });
        $.extend($.fn.wPaint.menus.main.items.roundedSquare, {
            title: TEnvironment.getMessage("wpaint-rounded-square")
        });
        $.extend($.fn.wPaint.menus.main.items.diamond, {
            title: TEnvironment.getMessage("wpaint-diamond")
        });
        $.extend($.fn.wPaint.menus.main.items.circle, {
            title: TEnvironment.getMessage("wpaint-circle")
        });
        $.extend($.fn.wPaint.menus.main.items.pentagon, {
            title: TEnvironment.getMessage("wpaint-pentagon")
        });
        $.extend($.fn.wPaint.menus.main.items.hexagon, {
            title: TEnvironment.getMessage("wpaint-hexagon")
        });
        $.extend($.fn.wPaint.menus.main.items.horizontal, {
            title: TEnvironment.getMessage("wpaint-horizontal")
        });
        $.extend($.fn.wPaint.menus.main.items.vertical, {
            title: TEnvironment.getMessage("wpaint-vertical")
        });

        $.extend($.fn.wPaint.defaults, {
            lineWidth: '1',
            fillStyle: '#FFFFFF',
            strokeStyle: '#000000'
        });


        $.extend($.fn.wColorPicker.defaults, {
            color: '#000000'
        });


        var keyHandler = function(event) {
            switch (event.which) {
                case 27: // ESC
                    hide();
                    break;
                case 39: // right arrow
                case 40: // down arrow
                    if (!imageEdited && !imageCreation && nextHandler !== null) {
                        displayImage(nextHandler());
                    }
                    break;
                case 37: // left arrow
                case 38: // up arrow
                    if (!imageEdited && !imageCreation && prevHandler !== null) {
                        displayImage(prevHandler());
                    }
                    break;
                case 13: // return
                    if (imageCreation) {
                        $buttonCreate.click();
                    }
                    break;
            }
        };

        var hide = function() {
            if (imageEdited) {
                // was in editing mode: get back to display mode
                $editor.hide();
                $imageContainer.show();
                imageEdited = false;
                imageDisplayed = true;
                // refreshImage
                displayImage(currentName);
            } else {
                $main.fadeOut(function() {
                    appended = false;                       
                    if (imageDisplayed) {
                        $imageContainer.hide();
                        imageDisplayed = false;
                    }
                    if (imageCreation) {
                        $creation.hide();
                        imageCreation = false;
                    }
                    $(window).off('keydown', keyHandler);
                });
            }
        };

        var displayImage = function(name) {
            if (imageDisplayed) {
                $imageContainer.hide();
                //domMain.removeChild(domImage);
                imageDisplayed = false;
            }
            $main.addClass("loading");
            currentName = name;
            // init max dimensions: they will be set in onload
            $image.css("max-width", "");
            $image.css("max-height", "");
            var src = TEnvironment.getProjectResource(name);
            if (image.src === src) {
                // image was the previous one: just call image.onload
                $image.load();
            } else {
                $title.text("");
                image.src = src;
            }
        };

        var updateImageSize = function() {
            $image.css("max-width", $imageContainer.width());
            $image.css("max-height", $imageContainer.height());
        };

        var edit = function() {
            $imageContainer.hide();
            $editor.show();
            $editorImage.width(currentWidth);
            $editorImage.height(currentHeight);
            $editorImage.css("margin-left", "-" + Math.round(currentWidth / 2) + "px");
            var marginTop = Math.round(currentHeight / 2);
            $editorImage.css("margin-top", "-" + marginTop + "px");
            if (!editorInitialized) {
                $editorImage.wPaint({
                    path: TEnvironment.getBaseUrl() + TEnvironment.getConfig('wpaint-path'),
                    image: TEnvironment.getProjectResource(currentName)
                });
                editorInitialized = true;
            } else {
                $editorImage.wPaint('clear');
                $editorImage.wPaint('resize');
                $editorImage.wPaint('image', TEnvironment.getProjectResource(currentName));
            }
            var pos = $editorImage.position();
            var menu = $(".wPaint-menu");
            menu.css("top", marginTop - pos.top + 10 + "px");
            menu.css("left", Math.round(currentWidth / 2 - menu.width() / 2) + "px");
            imageDisplayed = false;
            imageEdited = true;
        };

        var message = function(text) {
            if (imageEdited) {
                $message.stop().text(text).show().delay(2000).fadeOut();
            } else if (imageCreation) {
                $creationMessage.stop().text(text).show().delay(2000).fadeOut();
            }
        };

        this.setName = function(value) {
            currentName = value;
        };

        this.setNextHandler = function(value) {
            nextHandler = value;
        };

        this.setPrevHandler = function(value) {
            prevHandler = value;
        };

        this.init = function() {
            $("body").append($main);
        };

        this.show = function(name) {
            $(window).on('keydown', keyHandler);
            $main.fadeIn();
            if (imageCreation) {
                $creation.hide();
                imageCreation = false;
            }
            displayImage(name);
        };

        this.hide = function() {
            hide();
        };

        this.create = function() {
            $(window).on('keydown', keyHandler);
            $main.fadeIn();
            $name.val("");
            $width.val("");
            $height.val("");
            $creation.show();
            imageCreation = true;
        };

        var checkCreation = function() {
            var name = $name.val();
            var width = $width.val();
            var height = $height.val();
            // check name
            if (name.trim().length === 0) {
                message(TEnvironment.getMessage("viewer-creation-name-empty"));
                return false;
            }
            // check width
            if (width.trim().length === 0) {
                message(TEnvironment.getMessage("viewer-creation-width-empty"));
                return false;
            }
            var actualWidth = parseInt(width);
            if (isNaN(actualWidth)) {
                message(TEnvironment.getMessage("viewer-creation-width-nan"));
                return false;
            }
            $width.val(actualWidth);

            // check height
            if (height.trim().length === 0) {
                message(TEnvironment.getMessage("viewer-creation-height-empty"));
                return false;
            }
            var actualHeight = parseInt(height);
            if (isNaN(actualHeight)) {
                message(TEnvironment.getMessage("viewer-creation-height-nan"));
                return false;
            }
            $height.val(actualHeight);

            return true;
        };

    }

    TViewer.prototype = Object.create(TComponent.prototype);
    TViewer.prototype.constructor = TViewer;

    return TViewer;
});

