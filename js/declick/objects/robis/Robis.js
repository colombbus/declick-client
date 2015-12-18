define(['jquery', 'TEnvironment', 'TObject', 'TUtils'], function($, TEnvironment, TObject, TUtils) {
    /**
     * Defines Robis, inherited from TObject.
     * Is Robis really real ? :o
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
            console.debug("Try again"); //Un message mon petit bonhomme ?
    };
    
    Robis.prototype._defineURL = function(url) {
        this.url = this.prefix + url + this.suffix;
    };
    
    /**
     * ROBIS WILL WALK. BECAUSE ROBIS IS DA BEST.
     * (Even if I don't know how yet)
     */
    Robis.prototype._moveForward = function() {
        this.command("fwd");
    };

    Robis.prototype._moveBackward = function() {
        this.command("bwd");
    };
    
    Robis.prototype._turnLeft = function() {
        this.command("left");
    };
    
    Robis.prototype._turnRight = function() {
        this.command("right");
    };

    Robis.prototype._stop = function() {
        this.command("stop");
    };
    
    return Robis;
});
