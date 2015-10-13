define(['jquery', 'TEnvironment', 'TUtils', 'TGraphicalObject', 'objects/text/Text'], function($, TEnvironment, TUtils, TGraphicalObject, Text) {
    /**
     * Defines Stopwatch, inherited from Text.
     * @exports Stopwatch
     */
    var Stopwatch = function() {
        Text.call(this);
        if (TUtils.checkString()) {
            this._setText();
        }
        this.gObject.initialized();
    };

    Stopwatch.prototype = Object.create(Text.prototype);
    Stopwatch.prototype.constructor = Stopwatch;
    Stopwatch.prototype.className = "Stopwatch";

    var graphics = Stopwatch.prototype.graphics;

    Stopwatch.prototype.gClass = graphics.addClass("TText", "TStopwatch", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                oldTime: Date.now(),
                pause: true,
                time: 0
            }, props), defaultProps);
        },
        updateSize: function() {
            var oldH = this.p.h;
            var oldW = this.p.w;
            var context = graphics.getContext();
            context.font = "normal " + this.p.textSize + "px Verdana,Sans-serif";
            this.p.h = this.p.textSize;
            this.p.w = context.measureText(this.p.label).width;
            this.p.x += this.p.w / 2 - oldW / 2;
            this.p.y += this.p.h / 2 - oldH / 2;
            graphics.objectResized(this);
        },
        draw: function(context) {
            context.fillStyle = this.p.textColor;
            context.textBaseline = "middle";
            context.font = "normal " + this.p.textSize + "px Verdana,Sans-serif";
            context.fillText(this.p.label, -this.p.w / 2, 0);
        },
        step: function() {
            if (!this.p.pause){
                this.p.time += Date.now() - this.p.oldTime;
            }
            this.p.oldTime = Date.now();
            this.p.label = Math.trunc(this.p.time / 60000) + ":" +
                           Math.trunc(this.p.time % 60000 / 1000) + ":" +
                           Math.trunc(this.p.time % 1000 / 10);
            this.updateSize();
        }
    });

    /**
     * (Re)Start Stopwatch.
     */
    Stopwatch.prototype._start = function() {
        this.gObject.p.time = 0;
        this.gObject.p.pause = false;
    };
    
    /**
     * (Un)Pause Stopwatch.
     * @param {Boolean} value
     */
    Stopwatch.prototype._pause = function(value) {
        this.gObject.p.pause = value;
    };
    
    return Stopwatch;
});



