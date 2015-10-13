define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Light3D
     */
    var Light3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Light3D.prototype = Object.create(TObject3D.prototype);
    Light3D.prototype.constructor = Light3D;
    Light3D.prototype.className = "Light3D";

    Light3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        this.object3d = new BABYLON.HemisphericLight(this.createName(), new BABYLON.Vector3(0, 1, 0), this.scene);
        this.object3d.intensity = 0.7;
    };
    Light3D.prototype._setAmbient = function() {
    };
    Light3D.prototype._setColor = function(r, g, b) {
    };
    Light3D.prototype._setDirection = function(direction) {
    };
//    Light3D.prototype._setInfluencingBounds = function(center, 10) {
//    }
//    ;
    Light3D.prototype._setLocation = function(x, y, z) {
    };
    /*Light3D.prototype._setLocation2 = function(0,0,0,50) {};
     Light3D.prototype._setLocation3 = function(point) {};
     Light3D.prototype._setLocation4 = function(point,50) {};*/
    Light3D.prototype._switchOff = function() {
    };
    Light3D.prototype._switchOn = function() {
    };

    return Light3D;
});

