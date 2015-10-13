define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/arc/Arc'], function ($, TEnvironment, TGraphicalObject, TUtils, Arc) {
    /**
     * Defines Circle, inherited from Arc.
     * @exports Circle
     */
    var Circle = function () {
        Arc.call(this);
    };

    Circle.prototype = Object.create(Arc.prototype);
    Circle.prototype.constructor = Circle;
    Circle.prototype.className = "Circle";

    var graphics = Circle.prototype.graphics;

    Circle.prototype.gClass = graphics.addClass("TArc", "TCircle", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        draw: function (ctx) {
            var p = this.p;
            if (p.ray !== false) {
                ctx.beginPath();
                ctx.translate(p.tx, p.ty);
                ctx.arc(0, 0, p.ray, 0, 2 * Math.PI);
                if (this.p.fill) {
                    ctx.closePath();
                    ctx.fillStyle = p.fillColor;
                    ctx.fill();
                }
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.width;
                ctx.stroke();
                
            }
        }
    });

    return Circle;
});