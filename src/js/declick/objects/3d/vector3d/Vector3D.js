define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    /**
     * 
     */
    var Vector3D = function() {
        TObject.call(this);
        return BABYLON.Vector3;
    };
    var object3d;
    var name;

    Vector3D.prototype = Object.create(TObject.prototype);
    Vector3D.prototype.constructor = Vector3D;
    Vector3D.prototype.className = "Vector3D";
//    Vector3D.prototype.instances;

    Vector3D.prototype._setSpace = function(scene3d) {
        this.scene = scene3d;
    };

    Vector3D.prototype._getX = function() {
        return;
    };
    Vector3D.prototype._getY = function() {
        return;
    };
    Vector3D.prototype._getZ = function() {
        return;
    };
    Vector3D.prototype._setComponents = function(x, y, z) {
    };

    return Vector3D;
});

