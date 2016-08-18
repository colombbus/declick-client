define(['jquery', 'TUtils', 'TRuntime', 'TObject'], function($, TUtils, TRuntime, TObject) {
    /**
     * Defines Camera, inherited from TObject.
     * Its position will define what will be drawn on screen.
     * It can be fixed, or can follow an Object.
     * @exports Camera
     */
    var Camera = function() {
    	this.activated = false;
    	this.followedObject = null;
    	this.followX = true;
    	this.followY = true;
        TRuntime.addInstance(this);
    };
    
    Camera.prototype = Object.create(TObject.prototype);
    Camera.prototype.constructor = Camera;
    Camera.prototype.className = "Camera";

    var getStage = function() {
    	return TRuntime.getGraphics().getInstance().stage();
    };
    
    /**
     * Activate Camera.
     */
    Camera.prototype.activate = function() {
    	if (!this.activated) {
            var s = getStage();
            s.add("viewport");
            this.activated = true;
    	}
    };

    /**
     * Deactivate Camera.
     */
    Camera.prototype.deactivate = function() {
    	if (this.activated) {
            var s = getStage();
            s.del("viewport");
            this.activated = false;
    	}
    };
    
    /**
     * Follow Object in this.followedObject.
     */
    Camera.prototype.follow = function() {
    	if (this.activated) {
            var s = getStage();
            s.follow(this.followedObject.getGObject(), {x:this.followX, y:this.followY});
    	}
    };
    
    /**
     * Unfollow any Object.
     */
    Camera.prototype.stopFollow = function() {
    	if (this.activated) {
            var s = getStage();
            s.unfollow();
    	}
    };

    /**
     * Activate Camera and follow an object given in parameter.
     * @param {String} object
     */
    Camera.prototype._follow = function(object) {
    	object = TUtils.getObject(object);
    	this.followedObject = object;
    	this.activate();
    	this.follow();
    };

    /**
     * Unfollow any Object.
     */
    Camera.prototype._unfollow = function() {
    	this.stopFollow();
    };
    
    /**
     * Enable or disable Object tracking on X Coordinate.
     * @param {Boolean} value
     */
    Camera.prototype._followX = function(value) {
    	value = TUtils.getBoolean(value);
    	this.followX = value;
    	this.follow();
    };
    
    /**
     * Enable or disable Object tracking on Y Coordinate.
     * @param {Boolean} value
     */
    Camera.prototype._followY = function(value) {
    	value = TUtils.getBoolean(value);
    	this.followY = value;
    	this.follow();
    };
    
    /**
     * Move the Camera's top-left pixel to coordinates {x,y}.
     * If it follow an Object, unfollow it.
     * @param {Number} x
     * @param {Number} y
     */
    Camera.prototype._moveTo = function(x,y) {
    	x = TUtils.getInteger(x);
    	y = TUtils.getInteger(y);
    	this.activate();
    	var s = getStage();
    	this.stopFollow();
    	s.moveTo(x,y);
    };

    /**
     * Move the Camera's center pixel to coordinates {x,y}.
     * If it follow an Object, unfollow it.
     * @param {Number} x
     * @param {Number} y
     */
    Camera.prototype._centerOn = function(x,y) {
    	x = TUtils.getInteger(x);
    	y = TUtils.getInteger(y);
    	this.activate();
    	var s = getStage();
    	this.stopFollow();
    	s.centerOn(x,y);
    };

    Camera.prototype.clear = function() {
        this.stopFollow();
        this.deactivate();
    };
    
    Camera.prototype.init = function() {
        
    };
    
    var instance = new Camera();
    
    return instance;
});



