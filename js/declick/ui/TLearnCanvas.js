define(['ui/TComponent', 'jquery', 'TRuntime'], function(TComponent, $, TRuntime) {

    function generateGrid(size) {
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var painter = canvas.getContext('2d');

        painter.beginPath();
        painter.lineWidth = 1;
        painter.strokeStyle = '#C8DEE5';
        painter.moveTo(0, 39.5);
        painter.lineTo(size, 39.5);
        painter.moveTo(39.5, 0);
        painter.lineTo(39.5, size);
        painter.stroke();

        return canvas.toDataURL();
    }

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
            var grid = generateGrid(40);
            $canvas.css('background-image', 'url(' + grid + ')');
            $canvas.css('background-repeat', 'repeat');
        };
        this.giveFocus = function() {
            $canvas.get(0).focus();
        };
    }

    TLearnCanvas.prototype = Object.create(TComponent.prototype);
    TLearnCanvas.prototype.constructor = TLearnCanvas;

    return TLearnCanvas;
});
