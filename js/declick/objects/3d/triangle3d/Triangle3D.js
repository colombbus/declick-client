define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Triangle3D
     */
    var Triangle3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Triangle3D.prototype = Object.create(TObject3D.prototype);
    Triangle3D.prototype.constructor = Triangle3D;
    Triangle3D.prototype.className = "Triangle3D";

    /**
     * 
     * @param  scene3d
     */
    Triangle3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        //this.object3d = this.getMesh().CreateCylinder(this.getName(), 3, 1, 1, 16, this.scene);
    };

//Triangle3D.prototype._setCoordinates = function(1, point) {};
//Triangle3D.prototype._setCoordinates2 = function(1, x, y, z) {};
    Triangle3D.prototype._setVertices = function(p1, p2, p3) {
    };

    return Triangle3D;
});

