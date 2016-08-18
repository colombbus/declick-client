define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Text3D
     */
    var Text3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Text3D.prototype = Object.create(TObject3D.prototype);
    Text3D.prototype.constructor = Text3D;
    Text3D.prototype.className = "Text3D";

    /**
     * 
     * @param  scene3d
     */
    Text3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        //this.object3d = this.getMesh().CreateCylinder(this.getName(), 3, 1, 1, 16, this.scene);
    };

    Text3D.prototype._setTexture = function(texture) {
    };

    return Text3D;
});

