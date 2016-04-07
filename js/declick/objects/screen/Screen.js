define(['jquery', 'TUI', 'TRuntime', 'TUtils', 'TObject', 'SynchronousManager'], function ($, TUI, TRuntime, TUtils, TObject, SynchronousManager) {
    /**
     * Defines Screen, inherited from TObject.
     * Screen is an object created automatically with the launch of Screen.
     * It allows several interactions.
     * @exports Screen
     */
    var Screen = function () {
        TRuntime.addInstance(this);
		this.w = window;
		this.d = document;
		this.e = this.d.documentElement;
		this.g = this.d.getElementsByTagName('body')[0];
    };

    Screen.prototype = Object.create(TObject.prototype);
    Screen.prototype.constructor = Screen;
    Screen.prototype.className = "Screen";

    /**
     * Get screen Height "value" in logs.
     * @param {String} value
     */
    Screen.prototype._getHeight = function () {
		return this.w.innerHeight|| this.e.clientHeight|| this.g.clientHeight;
	};

    /**
     * Get screen Width "value" in logs.
     * @param {String} value
     */
    Screen.prototype._getWidth = function () {
        return this.w.innerWidth || this.e.clientWidth || this.g.clientWidth;
    };

    var screenInstance = new Screen();

    return screenInstance;
});
