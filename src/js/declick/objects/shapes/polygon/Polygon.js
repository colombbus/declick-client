define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/shape/Shape'], function ($, TEnvironment, TGraphicalObject, TUtils, Shape) {
    /**
     * Defines Polygon, inherited from Shape.
     * @exports Polygon
     */
    var Polygon = function () {
        Shape.call(this);
        if (arguments[0]) {
            this.gObject.setVertices(arguments);
        }
    };

    Polygon.prototype = Object.create(Shape.prototype);
    Polygon.prototype.constructor = Polygon;
    Polygon.prototype.className = "Polygon";

    var graphics = Polygon.prototype.graphics;

    Polygon.prototype.gClass = graphics.addClass("TShape", "TPolygon", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
                vertices: [],
                initVertices: false,
                fill: false,
                tangle: 0,
                tx: 0,
                ty: 0
            }, props), defaultProps);
        },
        setVertices: function (value) {
            this.p.vertices = [];
            for (var i = 0; i < value.length; i++) {
                this.p.vertices.push(value[i]);
            }
            this.p.initVertices = true;
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
            if (p.initVertices) {
                ctx.beginPath();
                ctx.translate(p.tx + p.vertices[0].gObject.p.x, p.ty + p.vertices[0].gObject.p.y);
                ctx.rotate(this.p.tangle / 180 * Math.PI);
                ctx.moveTo(0, 0);
                for (var i = 1; i < p.vertices.length; i++) {
                    ctx.lineTo(p.vertices[i].gObject.p.x - p.vertices[0].gObject.p.x, p.vertices[i].gObject.p.y - p.vertices[0].gObject.p.y);
                }
                ctx.closePath();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.width;
                ctx.stroke();
                if (this.p.fill) {
                    ctx.fillStyle = p.fillColor;
                    ctx.fill();
                }
            }
        }
    });

    /**
     * Set vertices's coordinates. 
     */
    Polygon.prototype._setVertices = function () {
        this.gObject.setVertices(arguments);
    };

    return Polygon;
});