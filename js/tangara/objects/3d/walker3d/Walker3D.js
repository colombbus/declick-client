define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Walker3D
     */
    var Walker3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Walker3D.prototype = Object.create(TObject3D.prototype);
    Walker3D.prototype.constructor = Walker3D;
    Walker3D.prototype.className = "Walker3D";

    /**
     * 
     * @param  scene3d
     */
    Walker3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        //this.object3d = this.getMesh().CreateCylinder(this.getName(), 3, 1, 1, 16, this.scene);
    };

    Walker3D.prototype._escapeObject = function(o) {
    };
    Walker3D.prototype._followObject = function(o) {
    };
    Walker3D.prototype._jump = function() {
    };
    Walker3D.prototype._mayFall = function(fallState) {
    };
    Walker3D.prototype._setFallSpeed = function(speed) {
    };
    Walker3D.prototype._setJumpHeight = function(height) {
    };
    Walker3D.prototype._slideIfCollision = function(collisionState) {
    };
    Walker3D.prototype._stopEscaping = function() {
    };
    Walker3D.prototype._stopFollowing = function() {
    };

    return Walker3D;
});

