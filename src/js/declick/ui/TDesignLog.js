define(['jquery', 'TEnvironment', 'ui/TComponent'], function($, TEnvironment, TComponent) {

    function TDesignLog(callback) {
        var $designLog;

        TComponent.call(this, {id: "tdesign-log"}, function(component) {
            $designLog = component;

            $designLog.click(function(e) {
                $designLog.find(".tdesign-log-row").removeClass("selected");
            });

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        var dragHandler = function(event) {
            var element = $(event.currentTarget);
            var selectedElements = $designLog.find(".selected");
            var data = "";
            if (element.hasClass('selected')) {
                // there are selected elements: drag them
                var first = true;
                selectedElements.each(function() {
                    var currentElement = $(this);
                    var name = currentElement.find(".tdesign-log-name").text();
                    var coordinates = currentElement.find(".tdesign-log-location").text();
                    if (!first) {
                        data += ";\n" + name + coordinates;
                    } else {
                        data += name + coordinates;
                        first = false;
                    }
                });
            } else {
                // current element is not selected: deselect other (if any), select it and drag it
                selectedElements.removeClass("selected").removeClass("selectee");
                element.addClass("selected");
                element.addClass("selectee");
                var name = element.find(".tdesign-log-name").text();
                var coordinates = element.find(".tdesign-log-location").text();
                data = name + coordinates;
            }
            event.dataTransfer.setData("text/plain", data);
        };

        var clickHandler = function(event) {
            var $element = $(event.currentTarget);
            if (event.shiftKey) {
                // select range
                var startElement = $designLog.find(".selectee");
                if (startElement.length > 0) {
                    var start = startElement.index();
                    var stop = $element.index();
                    var selected = $designLog.find(".tdesign-log-row");
                    if (stop > start) {
                        selected.slice(start, stop + 1).addClass("selected");
                    } else if (start > stop) {
                        selected.slice(stop, start + 1).addClass("selected");
                    } else {
                        // start = stop : only select $element
                        $element.addClass("selected");
                    }
                } else {
                    // no start element
                    $element.addClass("selected");
                }
            } else if (event.ctrlKey || event.metaKey) {
                // add target to selection/remove target from selection
                $element.toggleClass("selected");
            } else {
                $designLog.find(".tdesign-log-row").removeClass("selected");
                $element.addClass("selected");
            }
            $designLog.find(".tdesign-log-row").removeClass("selectee");
            if ($element.hasClass("selected")) {
                $element.addClass("selectee");
            }
            event.stopPropagation();
        };

        this.isEmpty = function() {
            return $designLog.is(':empty');
        };

        this.addObjectLocation = function(name, location) {
            var elementId = "tdesign-log-" + name;
            var $element = $designLog.find("#" + elementId);
            var nameText = TEnvironment.getMessage("design-name-text", name);
            var locationText = TEnvironment.getMessage("design-location-text", location.x, location.y);
            if ($element.length > 0) {
                // element already exists
                $element.find(".tdesign-log-name").text(nameText);
                $element.find(".tdesign-log-location").addClass("active").text(locationText).delay(500).queue(function() {
                    $(this).removeClass("active");
                    $(this).dequeue();
                });
            } else {
                // we create element
                var domElement = document.createElement("div");
                domElement.id = elementId;
                domElement.className = "tdesign-log-row";
                var domName = document.createElement("span");
                domName.className = "tdesign-log-name";
                domName.innerHTML = nameText;
                var domLocation = document.createElement("span");
                domLocation.className = "tdesign-log-location";
                domLocation.innerHTML = locationText;
                domElement.appendChild(domName);
                domElement.appendChild(domLocation);
                $designLog.append(domElement);
                // Drag disabled because it's making copy paste harder and the interface prevents
                // the user from dragging instructions into his code anyway.
                /*
                domElement.setAttribute("draggable", "true");
                domElement.ondragstart = dragHandler;
                $(domElement).click(clickHandler);
                */
                $designLog.scrollTop($designLog.prop("scrollHeight"));
                //$designLog.selectable();
            }
        };

        this.clear = function() {
            $designLog.empty();
        };

    }

    TDesignLog.prototype = Object.create(TComponent.prototype);
    TDesignLog.prototype.constructor = TDesignLog;

    return TDesignLog;
});