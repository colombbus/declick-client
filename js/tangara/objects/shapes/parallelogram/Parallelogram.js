define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/quadrilateral/Quadrilateral', 'objects/shapes/point/Point'], function ($, TEnvironment, TGraphicalObject, TUtils, Quadrilateral, Point) {
    /**
     * Defines Parallelogram, inherited from Quadrilateral.
     * @exports Parallelogram
     */
    var Parallelogram = function (p1, p2, p3) {
        Quadrilateral.call(this, p1, p2, p3, false);
    };

    Parallelogram.prototype = Object.create(Quadrilateral.prototype);
    Parallelogram.prototype.constructor = Parallelogram;
    Parallelogram.prototype.className = "Parallelogram";

    var graphics = Parallelogram.prototype.graphics;

    Parallelogram.prototype.gClass = graphics.addClass("TQuadrilateral", "TParallelogram", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        setVertices: function (value) {
            this.p.vertices = [];
            if (value.length === 3 || (value.length === 4 && value[3] === false)) {
                for (var i = 0; i < 3; i++) {
                    this.p.vertices.push(value[i]);
                }
                this.p.vertices.push(this.addPointParallelogram(value));
                this.p.initVertices = true;
            } else {
                throw new Error(this.getMessage("Bad vertices"));
            }
        },
        addPointParallelogram: function (value) {
            var point = new Point();
            point._hide();
            point._setLocation(value[0].gObject.p.x - value[1].gObject.p.x + value[2].gObject.p.x,
                               value[0].gObject.p.y - value[1].gObject.p.y + value[2].gObject.p.y);
            return point;
        }
    });

    return Parallelogram;
});
