define(['ui/TComponent', 'jquery', 'TUI', 'ui/TDesignLog', 'TEnvironment'], function(TComponent, $, TUI, TDesignLog, TEnvironment) {
    function TLog(callback) {
        var designLog;
        var $amin, $log, $designLog, $switch, $innerLog, $switchLog, $switchDesign;
        var rowCount = 0;
        var currentRow = 0;
        var scrollTop = 0;
        var currentHeight = -1;
        var errors = new Array();

        TComponent.call(this, "TLog.html", function(component) {
            $main = component;
            $log = component.find("#tlog");
            $switch = component.find("#tlog-switch");
            $innerLog = component.find("#tlog-inner");
            $switchDesign = $switch.find("#tlog-switch-design");
            $switchDesign.click(function(e) {
                TUI.showDesignLog();
            });
            $switchDesign.prop("title", TEnvironment.getMessage("switch-design"));
            $switchLog = $switch.find("#tlog-switch-log");
            $switchLog.click(function(e) {
                TUI.hideDesignLog();
            });
            $switchLog.prop("title", TEnvironment.getMessage("switch-log"));
            // add designLog
            var self = this;
            designLog = new TDesignLog(function(c) {
                component.find("#TDesignLog").replaceWith(c);
                $designLog = c;
                if (typeof callback != 'undefined') {
                    callback.call(self, component);
                }
            });
        });

        this.displayed = function() {
            this.update();
            $designLog.hide();
            $switch.hide();
        };

        this.update = function() {
            // compute the margin from the height of "tframe-bottom-top" div
            var height = $("#tframe-bottom-top").height();
            $main.css("margin-top", "-" + height + "px");
            $main.css("padding-top", height + "px");
        };

        this.addCommand = function(text) {
            if (typeof text === 'string') {
                var lines = text.split("\n");
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var row = document.createElement("div");
                    row.className = "tlog-row tlog-success";
                    row.id = "tlog-row-" + rowCount;
                    rowCount++;
                    currentRow = rowCount;
                    row.appendChild(document.createTextNode(line));
                    $log.append(row);
                    $log.scrollTop($log.prop('scrollHeight'));
                }
            }
        };

        this.addError = function(error) {
            var code, message;
            if (typeof error.getCode !== 'undefined') {
                code = error.getCode();
            }
            if (typeof error.getMessage !== 'undefined') {
                message = error.getMessage();
            } else if (typeof error.message !== 'undefined') {
                message = error.message;
            } else {
                message = 'undefined error';
                window.console.debug(error);
            }
            var index = errors.push(error) - 1;
            var wrapper = document.createElement("div");
            wrapper.onclick = function() {
                TUI.handleError(index);
            };
            var row;
            wrapper.className = "tlog-row tlog-failure";
            if (typeof code === 'string') {
                var lines = code.split("\n");
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    row = document.createElement("div");
                    row.id = "tlog-row-" + rowCount;
                    rowCount++;
                    currentRow = rowCount;
                    row.appendChild(document.createTextNode(line));
                    wrapper.appendChild(row);
                }
            }
            if (typeof message === 'string') {
                row = document.createElement("div");
                row.appendChild(document.createTextNode(message));
                wrapper.appendChild(row);
            }
            $log.append(wrapper);
            $log.scrollTop($log.prop("scrollHeight"));
        };

        this.addMessage = function(text) {
            if (typeof text === 'string') {
                var row = document.createElement("div");
                row.className = "tlog-row tlog-message";
                row.appendChild(document.createTextNode(text));
                $log.append(row);
                $log.scrollTop($log.prop("scrollHeight"));
            }
        };

        this.clear = function() {
            $log.empty();
            rowCount = 0;
            currentRow = 0;
            errors.length = 0;
            designLog.clear();
            this.hideDesignLog();
            this.hideSwitch();
        };

        this.getPreviousRow = function() {
            if (currentRow > 0) {
                currentRow--;
                var element = $("#tlog-row-" + currentRow);
                if (typeof element !== 'undefined') {
                    return element.text();
                }
            } else {
                // First row reached
                return null;
            }
        };

        this.getNextRow = function() {
            if (currentRow < rowCount) {
                currentRow++;
                if (currentRow < rowCount) {
                    var element = $("#tlog-row-" + currentRow);
                    if (typeof element !== 'undefined') {
                        return element.text();
                    }
                } else {
                    // Last row reached
                    return null;
                }
            } else {
                // Last row reached
                return null;
            }
        };

        this.setLastRow = function() {
            currentRow = rowCount;
        };

        this.saveScroll = function() {
            scrollTop = $log.scrollTop();
        };

        this.restoreScroll = function() {
            $log.scrollTop(scrollTop);
        };

        this.getError = function(index) {
            if (index < errors.length) {
                return errors[index];
            }
            return null;
        };

        this.showDesignLog = function() {
            $log.hide();
            $designLog.show();
            $switchLog.removeClass("active");
            $switchDesign.addClass("active");
            this.showSwitch();
        };

        this.hideDesignLog = function(hideSwitchIfEmpty) {
            $designLog.hide();
            $log.show();
            $switchDesign.removeClass("active");
            $switchLog.addClass("active");
            if (typeof hideSwitchIfEmpty !== 'undefined' && hideSwitchIfEmpty) {
                if (designLog.isEmpty()) {
                    this.hideSwitch();
                }
            }
        };

        this.showSwitch = function() {
            $switch.show();
            $innerLog.css("margin-right", "40px");
        };

        this.hideSwitch = function() {
            $switch.hide();
            $innerLog.css("margin-right", "0px");
        };

        this.hideDesignLogIfEmpty = function() {
            var result = designLog.isEmpty();
            if (result) {
                this.hideDesignLog();
                this.hideSwitch();
            }
            return result;
        };

        this.addObjectLocation = function(name, location) {
            designLog.addObjectLocation(name, location);
        };

        this.show = function() {
            $main.show();
        };

        this.hide = function() {
            currentHeight = $innerLog.outerHeight(false);
            $main.hide();
        };

        this.getHeight = function() {
            if (currentHeight === -1) {
                currentHeight = $innerLog.outerHeight(false);
            }
            return currentHeight;
        };

    }

    TLog.prototype = Object.create(TComponent.prototype);
    TLog.prototype.constructor = TLog;

    return TLog;
});