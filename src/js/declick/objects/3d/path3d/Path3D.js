define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Path3D
     */
    var Path3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Path3D.prototype = Object.create(TObject3D.prototype);
    Path3D.prototype.constructor = Path3D;
    Path3D.prototype.className = "Path3D";

    /**
     * 
     * @param  scene3d
     */
    Path3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        //this.object3d = this.getMesh().CreateCylinder(this.createName(), 3, 1, 1, 16, this.scene);
    };

    Path3D.prototype._loadPathPicture = function(file) {
    };
    Path3D.prototype._showPath = function(state) {
    };
    Path3D.prototype._transparentColor = function(color) {
    };

    return Path3D;
});

