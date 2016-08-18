define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/shape/Shape'], function ($, TEnvironment, TGraphicalObject, TUtils, Shape) {
    /**
     * Defines Arc, inherited from Shape.
     * @exports Arc
     */
    var Arc = function () {
        Shape.call(this);
    };

    Arc.prototype = Object.create(Shape.prototype);
    Arc.prototype.constructor = Arc;
    Arc.prototype.className = "Arc";

    var graphics = Arc.prototype.graphics;

    Arc.prototype.gClass = graphics.addClass("TShape", "TArc", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
                fill: false,
                tangle: 0,
                tx: 50,
                ty: 50,
                ray: false,
                startingAngle: false,
                endingAngle: false
            }, props), defaultProps);
        },
        setAngles: function (start, end) {
            this.p.startingAngle = start;
            this.p.endingAngle = end;
        },
        setRay: function (ray) {
            this.p.ray = ray;
        },
        step: function(dt) {
            var p = this.p;
            p.moving = false;
            if (!p.dragging && !p.frozen) {
                var step = p.velocity * dt;
                if (p.tx < p.destinationX) {
                    p.tx = Math.min(p.tx + step, p.destinationX);
                    p.moving = true;
                } else if (p.tx > p.destinationX) {
                    p.tx = Math.max(p.tx - step, p.destinationX);
                    p.moving = true;
                }
                if (p.ty < p.destinationY) {
                    p.ty = Math.min(p.ty + step, p.destinationY);
                    p.moving = true;
                } else if (p.ty > p.destinationY) {
                    p.ty = Math.max(p.ty - step, p.destinationY);
                    p.moving = true;
                }
            }
            this.checkCollisions();
        },
        rotate: function(angle) {
            this.perform(function(angle) {
                this.p.tangle = this.p.tangle + angle;
            }, [angle]);
        },
        draw: function (ctx) {
            var p = this.p;
            if (p.ray !== false && p.startingAngle !== false) {
                ctx.beginPath();
                ctx.translate(p.tx, p.ty);
                ctx.rotate(p.tangle / 180 * Math.PI);
                ctx.arc(0, 0, p.ray, p.startingAngle / 180 * Math.PI, p.endingAngle / 180 * Math.PI);
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

    /**
     * Set the starting and ending angle of the arc
     * @param {Number} start    degrees
     * @param {Number} end  degrees
     */
    Arc.prototype._setAngles = function (start, end) {
        if (typeof start !== 'undefined' && typeof end !== 'undefined') {
            start = TUtils.getInteger(start);
            end = TUtils.getInteger(end);
            this.gObject.setAngles(start, end);
        }
    };
    
    /**
     * Set the rayon of Arc.
     * @param {Number} ray
     */
    Arc.prototype._setRay = function (ray) {
        if (typeof ray !== 'undefined') {
            ray = TUtils.getInteger(ray);
            this.gObject.setRay(ray);
        }
    };

    return Arc;
});