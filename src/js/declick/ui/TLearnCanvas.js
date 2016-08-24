define(['ui/TComponent', 'jquery', 'TRuntime'], function(TComponent, $, TRuntime) {

    function TLearnCanvas(callback) {
        var $main, $canvas, $canvasLoading, $canvasLoadingValue;

        TComponent.call(this, "TLearnCanvas.html", function(component) {
            $main = component;
            $canvas = component.find("#tcanvas");
            $canvasLoading = component.find("#tcanvas-loading");
            $canvasLoadingValue = component.find("#tcanvas-loading-value");

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        this.displayed = function() {
            var graphics = TRuntime.getGraphics();
            graphics.setCanvas("tcanvas");
            // resize canvas and its container when window is resized
            $(window).resize(function(e) {
                var width = $main.width();
                var height = $main.height();
                graphics.resize(width, height);
            });
        };

        this.show = function() {
            $main.show();
        };

        this.hide = function() {
            $main.hide();
        };
        this.showLoading = function() {
            $canvasLoading.show();
        };
        this.setLoadingValue = function(count, total) {
            var value = Math.round(count * 100 / total);
            $canvasLoadingValue.text(value + "%");
        };
        this.removeLoading = function() {
            $canvasLoading.hide();
        };
        this.giveFocus = function() {
            $canvas.get(0).focus();
        };
    }

    TLearnCanvas.prototype = Object.create(TComponent.prototype);
    TLearnCanvas.prototype.constructor = TLearnCanvas;

    return TLearnCanvas;
});
