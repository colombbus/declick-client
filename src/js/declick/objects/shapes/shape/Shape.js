define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, TUtils) {
    /**
     * Defines Shape, inherited from Sprite.
     * @exports Shape
     */
    var Shape = function() {
        Sprite.call(this);
    };

    Shape.prototype = Object.create(Sprite.prototype);
    Shape.prototype.constructor = Shape;
    Shape.prototype.className = "Shape";

    var graphics = Shape.prototype.graphics;

    Shape.prototype.gClass = graphics.addClass("TSprite", "TShape", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                color: "#FF0000",
                width: 1,
                fill: false,
                fillColor: "#800000",
                type: TGraphicalObject.TYPE_SHAPE,
                initialized: false
            }, props), defaultProps);
            this.initialized();
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
     * Change the color of the shape.</br>
     * Default value : red | [255, 0, 0]
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Shape.prototype._color = function(red, green, blue) {
        this.gObject.color(red, green, blue);
    };

    /**
     * Set the width of the stroke.
     * Default value : 1.
     * @param {Number} value
     */
    Shape.prototype._width = function(value) {
        if (typeof value !== 'undefined') {
            value = TUtils.getInteger(value);
            this.gObject.width(value);
        }
    };

    /**
     * Enable or disable the fill of the shape.
     * Default value : False.
     * @param {Boolean} value
     */
    Shape.prototype._fill = function(value) {
        if (typeof value !== 'undefined') {
            this.gObject.fill(value);
        }
    };

    /**
     * Change the color of the shape's fill.
     * Default value : marron | [128, 0, 0]
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Shape.prototype._fillColor = function(red, green, blue) {
        this.gObject.fillColor(red, green, blue);
    };

    return Shape;
});