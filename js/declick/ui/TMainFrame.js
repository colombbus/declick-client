define(['ui/TComponent', 'ui/TLearnFrame', 'ui/TCreateFrame','TUI', 'jquery'], function(TComponent, TLearnFrame, TCreateFrame, TUI, $) {
    function TMainFrame(callback) {
        var createFrame, learnFrame, $createFrame, $learnFrame;
        var self = this;
        TComponent.call(this, "TMainFrame.html", function(component) {
            createFrame = new TCreateFrame(function(c) {
                component.find("#TCreateFrame").replaceWith(c);
                learnFrame = new TLearnFrame(function(d) {
                    component.find("#TLearnFrame").replaceWith(d);
                    if (typeof callback !== 'undefined') {
                        callback.call(self, component);
                    }
                });
            });
        });
        
        this.displayed = function() {
            
        };

    }

    TMainFrame.prototype = Object.create(TComponent.prototype);
    TMainFrame.prototype.constructor = TMainFrame;

    return TMainFrame;
});
