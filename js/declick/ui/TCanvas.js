define(['jquery', 'TRuntime', 'ui/TComponent', 'TEnvironment'], function($, TRuntime, TComponent, TEnvironment) {

    function TCanvas(callback) {
        var $main, $canvas, $canvasDesign, $canvasDesignMouse, $canvasLoading, $canvasLoadingValue, $popup, $popupContent;
        var popupCallback = null;

        TComponent.call(this, "TCanvas.html", function(component) {
            $main = component;
            $canvas = component.find("#tcanvas");
            $canvasDesign = component.find("#tcanvas-design");
            $canvasDesignMouse = component.find("#tcanvas-design-mouse");
            $canvasLoading = component.find("#tcanvas-loading");
            $canvasLoadingValue = component.find("#tcanvas-loading-value");

            $canvasDesign.hide();
            $canvasLoading.hide();

            $canvasLoadingValue = component.find("#tcanvas-loading-value");

            $popup = component.find("#tcanvas-popup");
            $popupContent = component.find("#tcanvas-popup-content");
            var $buttonPopup = component.find("#tcanvas-popup-button");
            $buttonPopup.text(TEnvironment.getMessage('popup-ok'));
            $buttonPopup.click(function() {
                $popup.hide();
                if (popupCallback !== null) {
                    popupCallback.call(this);
                }
            });

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        var designMouseHandler = function(event) {
            var x = event.clientX + $main.scrollLeft();
            var y = event.clientY + $main.scrollTop();
            $canvasDesignMouse.text(x + "," + y);
        };

        /**
         *
         * @param event
         */
        var designMouseSideHandler = function(event) {
            if ($canvasDesignMouse.hasClass("left-design")) {
                $canvasDesignMouse.removeClass("left-design");
                $canvasDesignMouse.addClass("right-design");
                return;
            }
            else {
                $canvasDesignMouse.removeClass("right-design");
                $canvasDesignMouse.addClass("left-design");
            }
        };

        this.displayed = function() {
            $popup.hide();
            var graphics = TRuntime.getGraphics();
            graphics.setCanvas("tcanvas");
            // resize canvas and its container when window is resized
            var self = this;
            $(window).resize(function(e) {
                self.resize();
            });
        };

        this.show = function() {
            $main.show();
        };

        this.hide = function() {
            $main.hide();
        };

        this.setDesignMode = function(value) {
            if (value) {
                $canvasDesign.show();
                $canvas.on("mousemove", designMouseHandler);
                $canvasDesignMouse.on("mouseover", designMouseSideHandler);

                //                $domCanvas3d.on("click", function(e) {
                //                    console.log("c3D clicked");
                //                    if (e.clientY > $(this).outerHeight() - 14) {
                //                        alert('clicked on the bottom border!');
                //                    }
                //                });
            } else {
                $canvasDesign.hide();
                $canvasDesignMouse.empty();
                $canvas.off("mousemove", designMouseHandler);
                $canvasDesignMouse.off("mouseover", designMouseSideHandler);
            }
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
        
        this.resize = function() {
            var width = $main.width();
            var height = $main.height();
            TRuntime.getGraphics().resize(width, height);
        };
        
        this.popup = function(text, callback) {
            $popupContent.text(text);
            if (typeof callback !== "undefined") {
                popupCallback = callback;
            } else {
                popupCallback = null;
            }
            $popup.show();
        };
        
        this.clear = function() {
            $popup.hide();
        };
    }
    ;

    TCanvas.prototype = Object.create(TComponent.prototype);
    TCanvas.prototype.constructor = TCanvas;

    return TCanvas;
});