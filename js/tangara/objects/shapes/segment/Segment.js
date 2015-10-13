define(['jquery', 'TEnvironment', 'TGraphicalObject', 'TUtils', 'objects/shapes/polygon/Polygon'], function ($, TEnvironment, TGraphicalObject, TUtils, Polygon) {
    /**
     * Defines Segment, inherited from Polygon.
     * @exports Segment
     */
    var Segment = function (p1, p2) {
        Polygon.call(this, p1, p2);
    };

    Segment.prototype = Object.create(Polygon.prototype);
    Segment.prototype.constructor = Segment;
    Segment.prototype.className = "Segment";

    var graphics = Segment.prototype.graphics;

    Segment.prototype.gClass = graphics.addClass("TPolygon", "TSegment", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        setVertices: function (value) {
            this.p.vertices = [];
            if (value.length === 2) {
                for (var i = 0; i < value.length; i++) {
                    this.p.vertices.push(value[i]);
                }
                this.p.initVertices = true;
            } else {
                throw new Error(this.getMessage("Bad vertices"));
            }
        }
    });

    return Segment;
});