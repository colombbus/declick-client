define(['jquery', 'babylon', 'TEnvironment', 'TObject'], function($, babylon, TEnvironment, TObject) {
    /**
     * Defines TObject3D, inherited from TObject.
     * This object is the 3D parent.
     * @exports TObject3D
     */
    var TObject3D = function() {
        TObject.call(this);
    };
    var object3d;
    //var scene;
    var name;
    var axis = "X";

    TObject3D.prototype = Object.create(TObject.prototype);
    TObject3D.prototype.constructor = TObject3D;
    TObject3D.prototype.className = "TObject3D";
    TObject3D.prototype.objectPath = "tobject3d";
    TObject3D.prototype.mesh = BABYLON.Mesh;
    /** Unique id for each TObject3D instancied */
    TObject3D.id = 0;

    /**
     * getMesh() is used to get in each herited object the mesh
     * defined in TObject3D.
     * @returns {Mesh} The mesh created with BABYLONJS in TObject3D.
     */
    TObject3D.prototype.getMesh = function() {
        return this.mesh;
    };

    /**
     * Freeze() aimed to stop all animated objects in the Space3D.
     * @param {Boolean} value
     */
    TObject3D.prototype.freeze = function(value) {
        // every object may add actions to take to freeze
    };

    /**
     * CreateName used with BabylonJS to create 3D object; ie:
     * BABYLON.Mesh.Cylinder("Cylinder9", 1, etc.).
     * @returns {String} Name of the TObject3D (the class and a unique id; ie:
     * Cylinder3D9.
     */
    TObject3D.prototype.createName = function() {
        this.name = this.className + ++TObject3D.id;
        return this.name;
    };

    /**
     * Get the unique name of each TObject3D or herited object created.
     * @returns {String} Name of the TObject3D created (className and unique id)
     */
    TObject3D.prototype.getName = function() {
        return this.name;
    };

    /**
     * _setSpace() is used to define the scene of the Space3D.
     * @param {Space3D} scene3d
     */
    TObject3D.prototype._setSpace = function(scene3d) {
        this.scene = scene3d;
    };

    TObject3D.prototype._addObject = function(object) {
    };

    TObject3D.prototype._alwaysMoveBackward = function() {

    };

    TObject3D.prototype._alwaysMoveDown = function() {

    };

    TObject3D.prototype._alwaysMoveForward = function() {

    };

    TObject3D.prototype._alwaysMoveLeft = function() {

    };

    TObject3D.prototype._alwaysMoveRight = function() {

    };

    TObject3D.prototype._alwaysMoveUp = function() {

    };

    TObject3D.prototype._displayCollisionArea = function(visibility) {
    };

    TObject3D.prototype._displayCommands = function(state) {

    };

    /**
     * Hide the TObject3D.
     */
    TObject3D.prototype._hide = function() {
        this.object3d.visibility = false;
    };

    TObject3D.prototype._ifCollision = function(command) {
    };

    TObject3D.prototype._ifCollisionWith = function(e, command) {
    };

    TObject3D.prototype._loadFile = function(file) {
        // file2
    };

    TObject3D.prototype._moveBackward = function() {
    };

    TObject3D.prototype._moveDown = function() {
        // 1 arg : 0
    };

    TObject3D.prototype._moveForward = function() {
        // 1 arg : 0
    };

    TObject3D.prototype._moveLeft = function() {
        // 1 arg : 0
    };

    TObject3D.prototype._moveRight = function() {
        // 1 arg : 0
    };

    TObject3D.prototype._moveUp = function() {
        // 1 arg : 0
    };

    TObject3D.prototype._removeTexture = function() {
    };

    /**
     * Rotate TObject3D of "degre" degrees.
     * @param {Number} degre
     */
    TObject3D.prototype._rotate = function(degre) {
        var rad = (2 * Math.PI * degre) / 360.0;

        if (this.axis === "X")
            this.object3d.rotation.x = rad;
        if (this.axis === "Y")
            this.object3d.rotation.y = rad;
        if (this.axis === "Z")
            this.object3d.rotation.z = rad;
        /*
         e=new Espace3D()
         c=new Cylindre3D()
         c._setRotationAxis("Y")
         e.ajouterObjet(c)
         c._rotate(45)
         
         */
    };

    TObject3D.prototype._setAngle = function() {

    };

    TObject3D.prototype._setCollisionArea = function() {
        // 3 arguments : 1,1,1
    };

    TObject3D.prototype._setColor = function(arg1, arg2) {
        // "red", true
    };

    TObject3D.prototype._setPosition = function(point) {
        // arg 1 : point
        this.object3d.x = point;
        /* test
         *
         e=new Espace3D()
         c=new Cylindre3D()
         e.ajouterObjet(c)
         c._setPosition(2)
         */
    };
    
    /**
     * _setRotationAxis() defines the rotation axis ("X", "Y" or "Z").
     * @param {type} ax
     */
    TObject3D.prototype._setRotationAxis = function(ax) {
        if (typeof ax === "string") {
            if ((ax == "X") || (ax == "x"))
                this.axis = "X";
            if ((ax == "Y") || (ax == "y"))
                this.axis = "Y";
            if ((ax == "Z") || (ax == "z"))
                this.axis = "Z";
        }
        /* test
         *
         e=new Espace3D()
         c=new Cylindre3D()
         e.ajouterObjet(c)
         c._setRotationAxis("X")
         */
    };

    TObject3D.prototype._setScale = function() {
    };

    TObject3D.prototype._setSolid = function(solidnessState) {
    };

    TObject3D.prototype._setSpeed = function() {
        // speed : 10
    };

    TObject3D.prototype._setTexture = function(texture) {
    };

    /**
     * Show the TObject3D.
     */
    TObject3D.prototype._show = function() {
        this.object3d.visibility = true;
    };

    TObject3D.prototype._stop = function() {
    };

    TObject3D.prototype._translate = function(x, y, z) {
        // arg : 0,0,0
        this.object3d = this.getMesh().translate(BABYLON.Axis.X, 1.0, BABYLON.Space.WORLD);
    };

    /**
     * Get a String containing "TObject3D " and the class of the object
     * @returns {String}
     */
    TObject3D.prototype.toString = function() {
        return "TObject3D " + this.className;
    };

    return TObject3D;
});

/* tests
 e = new Espace3D()
 c=new Cylindre3D()
 e.ajouterObjet(c)
 c.cacher()
 
 *
 *
 */