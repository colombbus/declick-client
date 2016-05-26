define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'ResourceManager', 'objects/sprite/Sprite'], function ($, TEnvironment, TUtils, CommandManager, ResourceManager, Sprite) {
    /**
     * Defines Sensor, inherited from Sprite.
     * @exports Sensor
     */
    var Sensor = function () {
        Sprite.call(this);
    };

    Sensor.prototype = Object.create(Sprite.prototype);
    Sensor.prototype.constructor = Sensor;
    Sensor.prototype.className = "Sensor";

    var graphics = Sensor.prototype.graphics;

    Sensor.prototype.gClass = graphics.addClass("TSprite", "TSensor", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
                hidden: true,
                color: "#FF0000",
                width: 1,
                fill: true,
                fillColor: "#800000"
            }, props), defaultProps);
            this.watchCollisions(true);
            this.initialized(true);
        },
        setSize: function (w, h) {
            this.perform(function (w, h) {
                this.p.w = w;
                this.p.h = h;
                graphics.objectResized(this);
                this.p.x += w / 2;
                this.p.y += h / 2;
            }, [w, h]);
        },
        draw: function (ctx) {
            var p = this.p;
            ctx.beginPath();
            ctx.moveTo(-p.w / 2, -p.h / 2);
            ctx.lineTo(p.w / 2, -p.h / 2);
            ctx.lineTo(p.w / 2, p.h / 2);
            ctx.lineTo(-p.w / 2, p.h / 2);
            ctx.closePath();
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.width;
            ctx.stroke();
            if (this.p.fill) {
                ctx.fillStyle = p.fillColor;
                ctx.fill();
            }
        },
        color: function(red, green, blue) {
           this.p.color = TUtils.rgbToHex(TUtils.getColor(red, green, blue));
        },
        width: function(value) {
            this.p.width = value;
        },
        fill: function(value) {
            this.p.fill = value;
        },
        fillColor: function(red, green, blue) {
           this.p.fillColor = TUtils.rgbToHex(TUtils.getColor(red, green, blue));
        }
    });

    /**
     * Set Sensor's width and height.
     * @param {Number} w
     * @param {Number} h
     */
    Sensor.prototype._setSize = function (w, h) {
        w = TUtils.getInteger(w);
        h = TUtils.getInteger(h);
        this.gObject.setSize(w, h);
    };

    /**
     * Change the color of the sensor.</br>
     * Default value : red | [255, 0, 0]
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Sensor.prototype._color = function(red, green, blue) {
        this.gObject.color(red, green, blue);
    };
    
    /**
     * Set the width of the stroke.
     * Default value : 1.
     * @param {Number} value
     */
    Sensor.prototype._width = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.width(value);
        }
    };
        
    /**
     * Enable or disable the fill of the sensor.
     * Default value : False. 
     * @param {Boolean} value
     */
    Sensor.prototype._fill = function(value) {
        if (typeof value !== 'undefined') {
            this.gObject.fill(value);
        }
    };
    
    /**
     * Change the color of the sensor's fill.
     * Default value : marron | [128, 0, 0]
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Sensor.prototype._fillColor = function(red, green, blue) {
        this.gObject.fillColor(red, green, blue);
    };
    
    return Sensor;
});
