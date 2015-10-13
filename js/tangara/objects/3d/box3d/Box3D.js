define(['jquery', 'TEnvironment', 'TObject3D'], function($, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Box3D
     */
    var Box3D = function() {

    };

    Box3D.prototype = Object.create(TObject3D.prototype);
    Box3D.prototype.constructor = Box3D;
    Box3D.prototype.className = "Box3D";

    Box3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        //scene = scene3d;
        this.object3d = BABYLON.Mesh.CreateBox("box1", 2, this.scene);
        //object3d.position.y = 1;
/*        
Point3d p1 = new Point3d(-sizeX/2, -sizeY/2, sizeZ/2);
Point3d p2 = new Point3d(sizeX/2, -sizeY/2, sizeZ/2);
Point3d p3 = new Point3d(sizeX/2, sizeY/2, sizeZ/2);
Point3d p4 = new Point3d(-sizeX/2, sizeY/2, sizeZ/2);
Point3d p5 = new Point3d(-sizeX/2, -sizeY/2, -sizeZ/2);
Point3d p6 = new Point3d(sizeX/2, -sizeY/2, -sizeZ/2);
Point3d p7 = new Point3d(sizeX/2, sizeY/2, -sizeZ/2);
Point3d p8 = new Point3d(-sizeX/2, sizeY/2, -sizeZ/2);
front = new Quadrilateral3D(p1, p2, p3, p4);
back = new Quadrilateral3D(p5, p8, p7, p6);
bottom = new Quadrilateral3D(p1, p5, p6, p2);
left = new Quadrilateral3D(p1, p4, p8, p5);
right = new Quadrilateral3D(p2, p6, p7, p3);
top = new Quadrilateral3D(p3, p7, p8, p4);
addObject(bottom);
addObject(left);
addObject(front);
addObject(right);
addObject(back);
addObject(top);
*/
        
        
    };

    Box3D.prototype._setBackColor = function(color, transparency) {
    };
    Box3D.prototype._setBackTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setBottomColor = function(color) {
    };
    Box3D.prototype._setBottomColor2 = function(color) {
    };
    Box3D.prototype._setBottomTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setColors = function(c1, c2, c3, c4, c5, c6, transparency) {
    };
    Box3D.prototype._setDimensions = function(x, y, z) {
    };
    Box3D.prototype._setFrontColor = function(color, transparency) {
    };
    Box3D.prototype._setFrontTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setLeftColor = function(color, transparency) {
    };
    Box3D.prototype._setLeftTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setRightColor = function(color, transparency) {
    };
    Box3D.prototype._setRightTexture = function(texture, repeatX, repeatY) {
    };
    Box3D.prototype._setTextures = function(t1, t2, t3, t4, t5, t6, repeatX, repeatY) {
    };
    Box3D.prototype._setTopColor = function(color, transparency) {
    };
    Box3D.prototype._setTopTexture = function(texture, repeatX, repeatY) {
    };

    return Box3D;
});

