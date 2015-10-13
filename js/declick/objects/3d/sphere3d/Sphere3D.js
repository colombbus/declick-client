define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Sphere3D
     */
    var Sphere3D = function() {

    };

    Sphere3D.prototype = Object.create(TObject3D.prototype);
    Sphere3D.prototype.constructor = TObject3D;
    Sphere3D.prototype.className = "Sphere3D";

    Sphere3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        this.scene = scene3d;
        this.object3d = this.getMesh().CreateSphere(this.createName(), 16, 2, this.scene);
        this.object3d.position.y = 1;
    };

    Sphere3D.prototype._setRadius = function(radius) {
    };

    return Sphere3D;
});

