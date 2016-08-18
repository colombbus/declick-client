define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Rider3D
     */
    var Rider3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Rider3D.prototype = Object.create(TObject3D.prototype);
    Rider3D.prototype.constructor = Rider3D;
    Rider3D.prototype.className = "Rider3D";

    /**
     * 
     * @param  scene3d
     */
    Rider3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        //this.object3d = this.getMesh().CreateCylinder(this.getName(), 3, 1, 1, 16, this.scene);
    };

    Rider3D.prototype._ifOnPath = function(command) {
    };
    Rider3D.prototype._ifOutOfPath = function(command) {
    };
    Rider3D.prototype._setPath = function(p) {
    };

    return Rider3D;
});

