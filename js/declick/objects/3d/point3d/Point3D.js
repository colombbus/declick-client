define(['jquery', 'TEnvironment', 'TObject3D'], function ($, TEnvironment, TObject3D) {
    /**
     * Defines Point3D, inherited from TObject3D.
     *  A Point3D is a simple 3D element but a complex object which can:
     *  - have a name
     *  - be displayed in Space3D as 3 Segment3D crossed  
     *  Another Point3D can define a Point3D
     * @class
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @returns {Point3D}
     */
    var Point3D = function (x, y, z) {
        this._setCoordinates(x, y, z);
        this.createName();
        var vectorPoint;
        var xlines;
        var ylines;
        var zlines;
        var pointX;
        var pointY;
        var pointZ;
        var name;
        var displayed;
    };

    Point3D.prototype = Object.create(TObject3D.prototype);
    Point3D.prototype.constructor = Point3D;
    Point3D.prototype.className = "Point3D";
    Point3D.id = 0;

    /**
     * Get the Point3D's name
     * @returns {String} Name of the Point3D
     */
    Point3D.prototype._getName = function () {
        return this.name;
    };

    /**
     * Set the Point3D's name
     * @param {String} Point3D's name
     */
    Point3D.prototype._setName = function (n) {
        this.name = n;
        this.redraw();
    };

    /**
     * Get X coordinate of a Point3D
     * @returns {Number} X coordinate
     */
    Point3D.prototype._getX = function () {
        return this.pointX;
    };

    /**
     * Get Y coordinate of a Point3D
     * @returns {Number} Y coordinate
     */
    Point3D.prototype._getY = function () {
        return this.pointY;
    };

    /**
     * Get Z coordinate of a Point3D
     * @returns {Number} Z coordinate
     */
    Point3D.prototype._getZ = function () {
        return this.pointZ;
    };

    /**
     * Set X coordinate of a Point3D
     * @param {Number} x
     */
    Point3D.prototype._setX = function (x) {
        if (typeof x === 'undefined')
            this.pointX = 0;
        else
            this.pointX = parseInt(x);
        this.redraw();
    };

    /**
     * Set Y coordinate of a Point3D
     * @param {Number} y
     */
    Point3D.prototype._setY = function (y) {
        if (typeof y === 'undefined')
            this.pointY = 0;
        else
            this.pointY = parseInt(y);
        this.redraw();
    };

    /**
     * Set Z coordinate of a Point3D
     * @param {Number} z
     */
    Point3D.prototype._setZ = function (z) {
        if (typeof z === 'undefined')
            this.pointZ = 0;
        else
            this.pointZ = parseInt(z);
        this.redraw();
    };

    /**
     * Set X, Y, Z coordinates of a Point3D
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     * @param {Number} z coordinate
     */
    Point3D.prototype._setCoordinates = function (x, y, z) {
        if (typeof x === 'object' || x instanceof Point3D) {
            var point = x;
            this._setX(point._getX());
            this._setY(point._getY());
            this._setZ(point._getZ());
        } else {
            this._setX(x);
            this._setY(y);
            this._setZ(z);
        }
        this.redraw();
    };
    Point3D.prototype._translate = function (x, y, z) {
        //mesh.translate(BABYLON.Axis.X, 1.0, BABYLON.Space.WORLD);
    };

    /**
     * Show a Point3D
     */
    Point3D.prototype._show = function () {
        if ((typeof this.xlines !== 'undefined') ||
                (typeof this.ylines !== 'undefined') ||
                (typeof this.zlines !== 'undefined')) {
            this.xlines.visibility = true;
            this.ylines.visibility = true;
            this.zlines.visibility = true;
        }
    };
    
    /**
     * Hide a Point3D
     */
    Point3D.prototype._hide = function () {
        if ((typeof this.xlines !== 'undefined') ||
                (typeof this.ylines !== 'undefined') ||
                (typeof this.zlines !== 'undefined')) {
            this.xlines.visibility = false;
            this.ylines.visibility = false;
            this.zlines.visibility = false;
        }
    };

    /**
     * Set a Space3D to display a Point3D
     * @param {Space3D} scene3d
     */
    Point3D.prototype._setSpace = function (scene3d) {
        if (typeof scene3d !== 'undefined') {
            TObject3D.prototype._setSpace.call(this, scene3d);
            this.redraw();
        }
    };

    /**
     * Draw or redraw a 3 segments to show a Point3D in a Space3D
     */
    Point3D.prototype.redraw = function () {
        if ((typeof this._getX() === 'undefined') ||
                (typeof this._getY() === 'undefined') ||
                (typeof this._getZ() === 'undefined') ||
                (typeof this.scene === 'undefined')) {
            return;
        }
        this.vectorPoint = new BABYLON.Vector3(this._getX(), this._getY(), this._getZ());
        var xDelta = new BABYLON.Vector3(.5, 0, 0);
        var yDelta = new BABYLON.Vector3(0, .5, 0);
        var zDelta = new BABYLON.Vector3(0, 0, .5);
        if ((typeof this.xlines !== 'undefined') ||
                (typeof this.ylines !== 'undefined') ||
                (typeof this.zlines !== 'undefined')) {
            this.xlines.dispose();
            this.ylines.dispose();
            this.zlines.dispose();
        }
        this.xlines = BABYLON.Mesh.CreateLines("xline", [
            this.vectorPoint.add(xDelta),
            this.vectorPoint.subtract(xDelta)
        ], this.scene);
        this.xlines.color = new BABYLON.Color3(1, 0, 0); //red

        this.ylines = BABYLON.Mesh.CreateLines("yline", [
            this.vectorPoint.add(yDelta),
            this.vectorPoint.subtract(yDelta)
        ], this.scene);
        this.ylines.color = new BABYLON.Color3(0, 0, 1); //blue

        this.zlines = BABYLON.Mesh.CreateLines("zline", [
            this.vectorPoint.add(zDelta),
            this.vectorPoint.subtract(zDelta)
        ], this.scene);
        this.zlines.color = new BABYLON.Color3(0, 1, 0); //green
    };

    Point3D.prototype.toString = function () {
        return "Point3D";
    };

    return Point3D;
});

/*
 * TESTS
 o=new Point3D()
 tangara.écrire("x : " + o._getX())

 p=new Point3D(1,2,3)
 tangara.écrire("x : " + p._getX())
 p._setX(5)
 tangara.écrire("x : " + p._getX())
 p._setCoordinates(o)
 tangara.écrire("x : " + p._getX())

 o._setX(8)
 q=new Point3D(o)
 tangara.écrire("x : " + q._getX())
 *
 */