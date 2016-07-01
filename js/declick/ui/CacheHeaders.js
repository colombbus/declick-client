define(['ui/TComponent', 'TUI', 'jquery'], function(TComponent, TUI, $) {
    function CacheHeaders(callback) {
        var $main;

        TComponent.call(this, "CacheHeaders.html", function(component) {
            $main = component;
            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });
    }

    CacheHeaders.prototype = Object.create(TComponent.prototype);
    CacheHeaders.prototype.constructor = CacheHeaders;

    return CacheHeaders;
});
