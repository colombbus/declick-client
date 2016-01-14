define(['jquery', 'TEnvironment', 'TObject', 'TUtils'], function($, TEnvironment, TObject, TUtils) {
    /**
     * Defines Robis, inherited from TObject.
     * Robis is a remote control robot.
     * @exports Robis
     */
    var Robis = function() {
        TObject.call(this);
        this.prefix = 'http://';
        this.suffix = '/';
        this.url = 'undefined';
    };

    Robis.prototype = Object.create(TObject.prototype);
    Robis.prototype.constructor = Robis;
    Robis.prototype.className = "Robis";
    
    Robis.prototype.command = function(command) {
        if (this.url !== 'undefined')
            $.get(this.url, {command: command});
        else
            console.debug("failed");
    };
    
    /**
     * Define Robis's server URL.
     * @param {String} url
     */
    Robis.prototype._defineURL = function(url) {
        this.url = this.prefix + url + this.suffix;
    };
    
    /**
     * Move Robis forward.
     */
    Robis.prototype._moveForward = function() {
        this.command("fwd");
    };

    /**
     * Move Robis backward.
     */
    Robis.prototype._moveBackward = function() {
        this.command("bwd");
    };
    
    /**
     * Spin round to left.
    */
    Robis.prototype._turnLeft = function() {
        this.command("left");
    };
    
    /**
     * Spin round to right.
    */
    Robis.prototype._turnRight = function() {
        this.command("right");
    };

    /**
     * Stop Robis.
     */
    Robis.prototype._stop = function() {
        this.command("stop");
    };
    
    return Robis;
});
