define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Quadrilateral3D
     */
    var Quadrilateral3D = function() {

    };

    Quadrilateral3D.prototype = Object.create(TObject3D.prototype);
    Quadrilateral3D.prototype.constructor = Quadrilateral3D;
    Quadrilateral3D.prototype.className = "Quadrilateral3D";

    Quadrilateral3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        scene = scene3d;
        //object3d = BABYLON.Mesh.CreateCylinder(this.createName(), 3, 1, 1, 16, this.scene);
        object3d.position.y = 1;
    };

    Quadrilateral3D.prototype._setCoordinates = function(p1, p2, p3, p4) {
    };
    Quadrilateral3D.prototype._setTexture = function(texture) {
    };
    Quadrilateral3D.prototype._setVertices = function(p1, p2, p3, p4) {
    };

    return Quadrilateral3D;
});

