define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    var Torus3D = function() {
    };
    Torus3D.prototype = Object.create(TObject3D.prototype);
    Torus3D.prototype.constructor = Torus3D;
    Torus3D.prototype.className = "Torus3D";
    
    Torus3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        this.object3d = this.getMesh().CreateTorus("torus1", 6, 1, 36, this.scene, true);
        this.object3d.position.y = 1;
    };

    return Torus3D;
});

