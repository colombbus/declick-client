define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Segment3D
     */
    var Segment3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Segment3D.prototype = Object.create(TObject3D.prototype);
    Segment3D.prototype.constructor = Segment3D;
    Segment3D.prototype.className = "Segment3D";

    /**
     * 
     * @param  scene3d
     */
    Segment3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        //this.object3d = this.getMesh().CreateCylinder(this.getName(), 3, 1, 1, 16, this.scene);
    };

    Segment3D.prototype._setCoordinates = function(x1, y1, x2, y2) {
    };
    Segment3D.prototype._setVertices = function(p1, p2) {
    };

    return Segment3D;
});