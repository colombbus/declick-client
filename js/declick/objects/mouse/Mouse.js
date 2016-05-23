define(['jquery', 'TUI', 'TObject'], function ($, TUI, TObject) {
    /**
     * Defines Mouse, inherited from TObject.
     * Mouse is an object created automatically with the launch of Mouse.
     * It allows several interactions.
     * @exports Mouse
     */
    var Mouse = function () {
        this.getX = function () {
            return TUI.getCanvasCursorX();
        }
        this.getY = function () {
            return TUI.getCanvasCursorY();
        }
    };
    Mouse.prototype = Object.create(TObject.prototype);
    Mouse.prototype.constructor = Mouse;
    Mouse.prototype.className = "Mouse";
    /**
     * Get mouse X "value".
     */
    Mouse.prototype._getX = function () {
        return this.getX();
    };
    /**
     * Get mouse Width "value" in logs.
     */
    Mouse.prototype._getY = function () {
        return this.getY();
    };

    var mouseInstance = new Mouse();
    return mouseInstance;
});
