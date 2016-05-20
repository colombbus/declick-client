define(['ui/TComponent', 'TUI', 'jquery'], function(TComponent, TUI, $) {
    function TMessage(callback) {
        var $main, $content;

        TComponent.call(this, "TMessage.html", function(component) {
            var $buttonClose = component.find("#tmessage-close");
            $main = component;
            $content = component.find("#tmessage-content");
            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
            $buttonClose.click(function(e) {
                hide(true);
            });
        });

        var hide = function(fade) {
            $main.stop(true,true).off("click");
            if (fade) {
                $main.fadeOut();
            } else {
                $main.hide();
            }
        };

        this.show = function(value) {
            $content.text(value);
            $main.removeClass("error");
            $main.addClass("message");
            $main.stop(true,true).off("click").show().delay(2000).fadeOut();
        };

        this.showError = function(value, index) {
            $content.text(value);
            $main.removeClass("message");
            $main.addClass("error");
            $main.stop(true,true).off("click").on("click", function() {
                TUI.handleError(index);
            }).show();
        };

        this.hide = function() {
            hide(false);
        };
    }

    TMessage.prototype = Object.create(TComponent.prototype);
    TMessage.prototype.constructor = TMessage;

    return TMessage;
});
