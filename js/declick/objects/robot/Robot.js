define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'SynchronousManager', 'TGraphicalObject', 'objects/sprite/Sprite', 'objects/hero/Hero', 'objects/platform/Platform'], function($, TEnvironment, TUtils, CommandManager, SynchronousManager, TGraphicalObject, Sprite, Hero, Platform) {
    /**
     * Defines Robot, inherited from Hero.
     * The main difference with Hero is that it executes commands one by one.
     * @param {Boolean} auto
     * @exports Robot
     */
    var Robot = function(auto) {
        Hero.call(this, "robot");

        if (typeof auto === 'undefined') {
            auto = true;
        }
        this.synchronousManager = new SynchronousManager();
        this.gObject.synchronousManager = this.synchronousManager;
        this.exitLocation = false;
        if (auto) {
            Platform.register(this);
        }
    };

    Robot.prototype = Object.create(Hero.prototype);
    Robot.prototype.constructor = Robot;
    Robot.prototype.className = "Robot";

    var graphics = Robot.prototype.graphics;

    Robot.prototype.gClass = graphics.addClass("THero", "TRobot", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                length: 40,
                inMovement: false,
                encountered: [],
                carriedItems: [],
                gridX: 0,
                gridY: 0,
                baseX: 0,
                baseY: 0,
                x: 0,
                y: 0,
                blocked: [false, false, false, false],
                inJump: false
            }, props), defaultProps);
            this.on("bump.top", "bumpTop");
            this.on("bump.bottom", "bumpBottom");
            this.on("bump.left", "bumpLeft");
            this.on("bump.right", "bumpRight");
        },
        step: function(dt) {
            var p = this.p;
            var oldX = p.x;
            var oldY = p.y;
            if (this.p.inJump && this.p.vy>0) {
                // jump is over
                this.p.inJump = false;
                this.synchronousManager.end();
            }
            if (this.p.mayFall && this.p.jumping) {
                if (this.p.jumpAvailable > 0) {
                    // perform a jump
                    this.p.vy = this.p.jumpSpeed;
                    this.p.inJump = true;
                } else {
                    this.p.jumping = false;
                    this.synchronousManager.end();
                }
            }
            this._super(dt);
            if (!p.dragging && !p.frozen) {
                if (p.moving && p.carriedItems.length>0) {
                    var x = p.x - p.w / 2;
                    var y = p.y - p.h / 2;
                    for (var i = 0; i < p.carriedItems.length; i++) {
                        var item = p.carriedItems[i];
                        item.setLocation(x + i * 10, y);
                    }
                }   
                if (p.inMovement && p.moving && oldX === p.x && oldY === p.y) {
                    p.moving = false;
                    p.destinationX = p.x;
                    p.destinationY = p.y;
                }
                if (p.inMovement && !p.moving) {
                    p.inMovement = false;
                    this.updateGridLocation();
                    this.synchronousManager.end();
                }
            }
        },
        bumpTop: function() {
            this.p.blocked[0] = true;
        },
        bumpBottom: function() {
            this.p.blocked[1] = true;
        },
        bumpLeft: function() {
            this.p.blocked[2] = true;
        },
        bumpRight: function() {
            this.p.blocked[3] = true;
        },
        initBumps: function() {
            this.p.blocked = [false, false, false, false];
        },
        wasBlockedTop: function() {
            return (this.p.blocked[0]);
        },
        wasBlockedBottom: function() {
            return (this.p.blocked[1]);
        },
        wasBlockedLeft: function() {
            return (this.p.blocked[2]);
        },
        wasBlockedRight: function() {
            return (this.p.blocked[3]);
        },
        
        jump: function() {
            if (this.p.mayFall) {
                this.synchronousManager.begin();
                this.perform(function() {
                    this.p.jumping = true;
                });
            }
        },
        moveBackward: function(n) {
            this.synchronousManager.begin();
            this.perform(function() {
                this.initBumps();
                this.p.direction = Sprite.DIRECTION_NONE;
                this.p.inMovement = true;
                this.p.destinationX -= this.p.length*n;
                this.p.vx = -this.p.speed;
            }, []);
        },
        moveForward: function(n) {
            this.synchronousManager.begin();
            this.perform(function() {
                this.initBumps();
                this.p.direction = Sprite.DIRECTION_NONE;
                this.p.inMovement = true;
                this.p.destinationX += this.p.length*n;
                this.p.vx = this.p.speed;
            }, []);
        },        
        moveUpward: function(n) {
            this.synchronousManager.begin();
            this.perform(function() {
                this.initBumps();
                this.p.direction = Sprite.DIRECTION_NONE;
                this.p.inMovement = true;
                this.p.destinationY -= this.p.length*n;
                this.p.vy = -this.p.speed;
            }, []);
        },
        moveDownward: function(n) {
            this.synchronousManager.begin();
            this.perform(function() {
                this.initBumps();
                this.p.direction = Sprite.DIRECTION_NONE;
                this.p.inMovement = true;
                this.p.destinationY += this.p.length*n;
                this.p.vy = this.p.speed;
            }, []);
        },
        countItems: function() {
            var skip = 0;
            var collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_ITEM, skip);
            var object;
            this.p.encountered = [];
            while (collided) {
                object = collided.obj;
                if (this.p.carriedItems.indexOf(object) === -1) {
                    this.p.encountered.push(collided.obj);
                }
                skip++;
                collided = this.stage.TsearchSkip(this, TGraphicalObject.TYPE_ITEM, skip);
            }
            return this.p.encountered.length;
        },
        pickupItem: function() {
            var count = this.countItems();
            if (count === 0) {
                throw "no item";
            }
            var newItem = this.p.encountered[0];
            this.p.carriedItems.push(newItem);
            newItem.setLocation(this.p.x - this.p.w / 2 + (this.p.carriedItems.length - 1) * 10, this.p.y - this.p.h / 2);
        },
        dropItem: function() {
            if (this.p.carriedItems.length === 0) {
                throw "no carried item";
            }
            this.p.carriedItems = this.p.carriedItems.slice(0, -1);
        },
        countCarriedItems: function() {
            return this.p.carriedItems.length;
        },
        setLocation: function(x, y) {
            this._super(x, y);            
            this.perform(function() {
                this.updateGridLocation();
            }, []);
        },
        setGridLocation: function(x, y) {
            this.setLocation(x*this.p.length, y*this.p.length);
        },        
        updateGridLocation: function() {
            this.p.gridX = Math.floor(this.p.x/this.p.length);
            this.p.gridY = Math.floor(this.p.y/this.p.length);
        },
        setStartLocation: function(x, y) {
            this.setGridLocation(x,y);
        },
        getItemName: function() {
            var count = this.countItems();
            if (count === 0) {
                throw "no item";
            }
            var item = this.p.encountered[0];
            return item.getName();
        },
        getGridX:function() {
            return this.p.gridX;
        },
        getGridY:function() {
            return this.p.gridY;
        }
    });

    // MOVEMENT MANAGEMENT
    
    /**
     * Move Robot of "number" tiles forward (to the right).
     * If no parameter is given, move it one case forward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveForward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
        } else {
            number = 1;
        }
        this.gObject.moveForward(number);
    };
    
    /**
     * Move Robot of "number" tiles backward (to the left).
     * If no parameter is given, move it one case backward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveBackward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
        } else {
            number = 1;
        }
        this.gObject.moveBackward(number);
    };
   
    /**
     * Move Robot of "number" tiles upward.
     * If no parameter is given, move it one case upward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveUpward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
        } else {
            number = 1;
        }
        this.gObject.moveUpward(number);
    };

    /**
     * Move Robot of "number" tiles downward.
     * If no parameter is given, move it one case downward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveDownward = function(number) {
        if (typeof number !== 'undefined') {
            number = TUtils.getInteger(number);
        } else {
            number = 1;
        }
        this.gObject.moveDownward(number);
    };

    /**
     * Count the number of items in Stage.
     * @returns {Number}
     */
    Robot.prototype._countItems = function() {
        //TODO: handle case where gObject not initialized yet
        return this.gObject.countItems();
    };

    /**
     * Pick up an Item.
     */
    Robot.prototype._pickupItem = function() {
        this.gObject.pickupItem();
    };

    /**
     * Drop an Item.
     */
    Robot.prototype._dropItem = function() {
        this.gObject.dropItem();
    };

    /**
     * Count the number of items carried by Robot.
     * @returns {Number}    Number of items carried.
     */
    Robot.prototype._countCarriedItems = function() {
        return this.gObject.countCarriedItems();
    };
    
    /**
     * Get the Platform for Robot.
     * @param {Number[][]} platform
     */
    Robot.prototype._getPlatform = function(platform) {
        this.gObject.p.platform = platform;
    };
    
    /**
     * Set the coordinates of Robot.
     * @param {Number} x
     * @param {Number} y
     */
    Robot.prototype._setLocation = function(x, y) {
        x = TUtils.getInteger(x) * this.gObject.p.length + this.gObject.p.baseX;
        y = TUtils.getInteger(y) * this.gObject.p.length + this.gObject.p.baseY;
        this.gObject.setLocation(x, y);
    };
    
    /**
     * Test if Robot was blocked during the last move
     * @param {String} way
     * @returns {Boolean}
     */
    Robot.prototype._wasBlocked = function(way) {
        way = this.getMessage(TUtils.getString(way));
        switch (way) {
            case "top":
                return this.gObject.wasBlockedTop();
            case "bottom": 
                return this.gObject.wasBlockedBottom();
            case "left":
                return this.gObject.wasBlockedLeft();
            case "right": 
                return this.gObject.wasBlockedRight();
        }
        return false;
    };
    
    /**
     * Link a platform to the Walker. Walker will not pass through.
     * @param {String} platform
     */
    Robot.prototype._addPlatform = function(platform) {
    	Hero.prototype._addPlatform.call(this, platform);
        var entrance = platform.getEntranceLocation();
        this.setEntranceLocation(entrance[0],entrance[1]);
        var exit = platform.getExitLocation();
        if (exit) {
            this.setExitLocation(exit[0],exit[1]);
        }
    };
    
    Robot.prototype.setEntranceLocation = function(x, y) {
        this.gObject.setStartLocation(x,y);
    };

    Robot.prototype.setExitLocation = function(x, y) {
        this.exitLocation = [x, y];
    };
    
    Robot.prototype._getItemName = function() {
        try {
            return this.gObject.getItemName();
        } catch (e) {
            throw new Error(this.getMessage("no items"));
        }
    };
    
    Robot.prototype._isOverExit = function() {
        if (this.exitLocation) {
            return (this.gObject.getGridX()=== this.exitLocation[0] && this.gObject.getGridY()=== this.exitLocation[1]);
        }
        return false;
    };
    
    Robot.prototype._isOver = function(name) {
        try {
            var current = this.gObject.getItemName();
            if (name === current) {
                return true;
            }
        } catch (e) {
        }
        return false;
    };    
    
    Robot.prototype.deleteObject = function() {
        this.synchronousManager.end();
        // remove object from instances list
        Platform.unregister(this);
        Hero.prototype.deleteObject.call(this);
    };
    
    return Robot;
});
