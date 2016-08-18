define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/parallelogram/Parallelogram', 'objects/shapes/point/Point'], function ($, TEnvironment, TGraphicalObject, TUtils, Parallelogram, Point) {
    /**
     * Defines Rectangle, inherited from Parallelogram.
     * @exports Rectangle
     */
    var Rectangle = function (p1, p2) {
        Parallelogram.call(this, p1, p2, false);
    };

    Rectangle.prototype = Object.create(Parallelogram.prototype);
    Rectangle.prototype.constructor = Rectangle;
    Rectangle.prototype.className = "Rectangle";

    var graphics = Rectangle.prototype.graphics;

    Rectangle.prototype.gClass = graphics.addClass("TParallelogram", "TRectangle", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        setVertices: function (value) {
            this.p.vertices = [];
            if (value.length === 2 || (value.length === 4 && value[2] === false)) {
                this.p.vertices.push(value[0]);
                this.p.vertices.push(this.addPointRectangle(value));
                this.p.vertices.push(value[1]);
                this.p.vertices.push(this.addPointParallelogram(this.p.vertices));
                this.p.initVertices = true;
            } else {
                throw new Error(this.getMessage("Bad vertices"));
            }
        },
        addPointRectangle: function (value) {
            var point = new Point();
            point._hide();
            point._setLocation(value[0].gObject.p.x, value[1].gObject.p.y);
            return point;
        }
    });

    return Rectangle;
});
