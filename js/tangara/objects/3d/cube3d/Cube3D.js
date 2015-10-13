define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Cube3D
     */
    var Cube3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Cube3D.prototype = Object.create(TObject3D.prototype);
    Cube3D.prototype.constructor = Cube3D;
    Cube3D.prototype.className = "Cube3D";

    /**
     * 
     * @param  scene3d
     */
    Cube3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        this.object3d = this.getMesh().CreateBox(this.createName(), 2, this.scene, true);
    };
    Cube3D.prototype._setDimension = function(size) {
    };

    return Cube3D;
});

