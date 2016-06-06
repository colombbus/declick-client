define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'SynchronousManager', 'TGraphicalObject', 'objects/sprite/Sprite', 'objects/character/Character', 'objects/platform/Platform', 'objects/maze/Maze'], function ($, TEnvironment, TUtils, CommandManager, SynchronousManager, TGraphicalObject, Sprite, Character, Platform, Maze) {
    /**
     * Defines Robot, inherited from Character.
     * The main difference with Character is that it executes commands one by one.
     * @param {Boolean} auto
     * @exports Robot
     */
    var Robot = function (name, auto) {
        if (typeof name !== 'undefined') {
            Character.call(this, name);
        } else {
            Character.call(this, "robot");
        }

        if (typeof auto === 'undefined') {
            auto = true;
        }
        this.synchronousManager = new SynchronousManager();
        this.gObject.synchronousManager = this.synchronousManager;
        this.exitLocations = false;
        if (auto) {
            Platform.register(this);
        }
    };

    Robot.prototype = Object.create(Character.prototype);
    Robot.prototype.constructor = Robot;
    Robot.prototype.className = "Robot";

    var graphics = Robot.prototype.graphics;

    Robot.prototype.gClass = graphics.addClass("TCharacter", "TRobot", {
        init: function (props, defaultProps) {
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
                blocked: [false, false, false, false]
            }, props), defaultProps);
			this.previous = {X: this.p.x, Y: this.p.y};
			this.move = null;
			this.falling = false;
			this.jumping = false;
			this.previousGridX = 0;
			this.previousGridY = 0;
            this.on("bump.top", "bumpTop");
            this.on("bump.bottom", "bumpBottom");
            this.on("bump.left", "bumpLeft");
            this.on("bump.right", "bumpRight");
        },
        step: function (dt) {
			var p = this.p;
			var previous = this.previous;

			var completed = p.x === p.destinationX && p.y === p.destinationY;
			var moved = p.x !== previous.X || p.y !== previous.Y;
			var landed = this.falling && completed && !moved;

			if (this.jumping && this.p.vy >= 0)
			{
				this.jumping = false;
				this.falling = true;
				// this.endMove();
			}
			else if (this.move === null && landed)
			{
				// Falling while move is empty means gravity activation.
				// End the current command when the robot stops falling.
				this.endMove();
			}

			else if (this.move !== null)
			{
				// The robot has a move to complete.
				if (completed)
				{
					// The robot has ended a submove.
					this.updateGridLocation();
					if (this.falling)
					{
						// Stop fall if the robot landed. Else, wait.
						if (!moved)
						{
							this.falling = false;
							this.consumeMove();
						}
					}
					else if (p.gridX !== this.previousGridX
					      || p.gridY !== this.previousGridY)
					{
						// The robot is not falling, so check if it finished a
						// cell move.
						this.previousGridX = p.gridX;
						this.previousGridY = p.gridY;
						if (p.mayFall)
						{
							// If the gravity is enabled, let it try to fall.
							this.fall();
						}
						else
						{
							// Else directly load next cell move.
							this.consumeMove();
						}
					}
					else
					{
						// The robot has ended a submove but is not falling
						// nor changing cell, it must be blocked. End move.
						this.endMove();
					}
				}
			}

			this.previous = {X: p.x, Y: p.y};

            this._super(dt);
            if (!p.dragging && !p.frozen)
			{
                if (moved)
				{
					this.updateItemsPosition();
                }
            }
        },
        bumpTop: function (collision) {
            // check if collided is a ground
            if (typeof collision.tile !== 'undefined' && collision.tile === Maze.GROUND) {
                this.p.skipCollide = true;
            }
            this.p.blocked[0] = true;
        },
        bumpBottom: function () {
            this.p.blocked[1] = true;
        },
        bumpLeft: function () {
            this.p.blocked[2] = true;
        },
        bumpRight: function () {
            this.p.blocked[3] = true;
        },
        initBumps: function () {
            this.p.blocked = [false, false, false, false];
        },
        wasBlockedTop: function () {
            return (this.p.blocked[0]);
        },
        wasBlockedBottom: function () {
            return (this.p.blocked[1]);
        },
        wasBlockedLeft: function () {
            return (this.p.blocked[2]);
        },
        wasBlockedRight: function () {
            return (this.p.blocked[3]);
        },
		fall: function ()
		{
			this.p.vx = 0;
			this.falling = true;
		},
        jump: function () {
            if (this.p.mayFall)
			{
                this.synchronousManager.begin();
                this.perform(function ()
				{
	                if (this.p.jumpAvailable > 1)
					{
	                    this.p.vy = this.p.jumpSpeed;
	                    this.jumping = true;
	                }
					else
					{
						this.synchronousManager.end();
					}
            	});
            }
        },
		endMove: function ()
		{
			this.move = null;
			this.falling = false;
			this.jumping = false;
			this.p.destinationX = this.p.x;
			this.p.destinationY = this.p.y;
			this.synchronousManager.end();
		},
		consumeMove: function ()
		{
			var direction = this.move[0], intensity = this.move[1];
			if (intensity === 0)
			{
				this.endMove();
				return;
			}
			var XMultiplier = 0, YMultiplier = 0;
			switch (direction)
			{
				case Sprite.DIRECTION_UP:    YMultiplier = -1; break;
				case Sprite.DIRECTION_DOWN:  YMultiplier =  1; break;
				case Sprite.DIRECTION_LEFT:  XMultiplier = -1; break;
				case Sprite.DIRECTION_RIGHT: XMultiplier =  1; break;
			}
			this.p.destinationX = this.p.x + (XMultiplier * this.p.length);
			this.p.destinationY = this.p.y + (YMultiplier * this.p.length);
			this.p.vx = XMultiplier * this.p.speed;
			this.p.vy = YMultiplier * this.p.speed;
			this.move[1] = intensity - 1;
		},
		initializeMove: function (direction, intensity)
		{
			this.synchronousManager.begin();
			this.perform(function ()
			{
				this.move = [direction, intensity];
				this.consumeMove();
			}, []);
		},
		moveUpward: function (intensity)
		{
			this.initializeMove(Sprite.DIRECTION_UP, intensity);
		},
		moveDownward: function (intensity)
		{
			this.initializeMove(Sprite.DIRECTION_DOWN, intensity);
		},
		moveBackward: function (intensity)
		{
			this.initializeMove(Sprite.DIRECTION_LEFT, intensity);
		},
		moveForward: function (intensity)
		{
			this.initializeMove(Sprite.DIRECTION_RIGHT, intensity);
		},
		updateItemsPosition: function ()
		{
			var p = this.p;
			var x = p.x - p.w / 2;
			var y = p.y - p.h / 2;
			for (var i = 0; i < p.carriedItems.length; i++)
			{
				var item = p.carriedItems[i];
				item.setLocation(x, y - 4 * i);
			}
		},
        countItems: function () {
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
        pickup: function () {
            var count = this.countItems();
            if (count === 0) {
                throw "no item";
            }
            var newItem = this.p.encountered[0];
            this.p.carriedItems.push(newItem);
            newItem.setLocation(this.p.x - this.p.w / 2, this.p.y - this.p.h / 2 - (this.p.carriedItems.length - 1) * 4);
        },
        drop: function () {
            if (this.p.carriedItems.length === 0) {
                throw "no carried item";
            }
            this.p.carriedItems = this.p.carriedItems.slice(0, -1);
        },
        countCarriedItems: function (category) {
            if (typeof category === 'undefined') {
                return this.p.carriedItems.length;
            } else {
                var count = 0;
                for (var i = 0; i < this.p.carriedItems.length; i++) {
                    var object = this.p.carriedItems[i];
                    if (object.p.category === category) {
                        count++;
                    }
                }
                return count;
            }
        },
        setLocation: function (x, y) {
            this._super(x, y);
            this.perform(function () {
                this.updateGridLocation();
            }, []);
        },
        setGridLocation: function (x, y) {
            this.setLocation(x * this.p.length, y * this.p.length);
        },
        updateGridLocation: function () {
            this.p.gridX = Math.floor(this.p.x / this.p.length);
            this.p.gridY = Math.floor(this.p.y / this.p.length);
        },
        setStartLocation: function (x, y) {
            this.setGridLocation(x, y);
        },
        getItemName: function () {
            var count = this.countItems();
            if (count === 0) {
                throw "no item";
            }
            var item = this.p.encountered[0];
            return item.getName();
        },
        getGridX: function () {
            return this.p.gridX;
        },
        getGridY: function () {
            return this.p.gridY;
        },
        mayFall: function (value) {
            if (typeof value === 'undefined') {
                value = true;
            }
            var startFalling = false;
            if (!this.p.mayFall && value) {
                // object starts to fall
                startFalling = true;
                this.synchronousManager.begin();
            }
            this.perform(function () {
                this.p.mayFall = value;
                if (startFalling) {
					this.falling = true;
                    this.p.inMovement = true;
                }
            });
        },
        isCarrying: function (what) {
            var category = false;
            if (TUtils.checkString(what)) {
                category = true;
            }
            for (var i = 0; i < this.p.carriedItems.length; i++) {
                var object = this.p.carriedItems[i];
                if (category) {
                    if (object.p.category === what) {
                        return true;
                    }
                } else {
                    if (what.getGObject().getId() === object.getId()) {
                        return true;
                    }
                }
            }
            return false;
        }
    });

    // MOVEMENT MANAGEMENT

    /**
     * Move Robot of "number" tiles forward (to the right).
     * If no parameter is given, move it one case forward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveForward = function (number) {
        if (typeof number !== 'undefined')
            number = TUtils.getInteger(number);
        else
            number = 1;
        if (number >= 0)
            this.gObject.moveForward(number);
        else
            this.gObject.moveBackward(-number);
    };

    /**
     * Move Robot of "number" tiles backward (to the left).
     * If no parameter is given, move it one case backward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveBackward = function (number) {
        if (typeof number !== 'undefined')
            number = TUtils.getInteger(number);
        else
            number = 1;
        if (number >= 0)
            this.gObject.moveBackward(number);
        else
            this.gObject.moveForward(-number);
    };

    /**
     * Move Robot of "number" tiles upward.
     * If no parameter is given, move it one case upward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveUpward = function (number) {
        if (typeof number !== 'undefined')
            number = TUtils.getInteger(number);
        else
            number = 1;
        if (number >= 0)
            this.gObject.moveUpward(number);
        else
            this.gObject.moveDownward(-number);
    };

    /**
     * Move Robot of "number" tiles downward.
     * If no parameter is given, move it one case downward.
     * A tile corresponds to 'length' pixels.
     * @param {Integer} number
     */
    Robot.prototype._moveDownward = function (number) {
        if (typeof number !== 'undefined')
            number = TUtils.getInteger(number);
        else
            number = 1;
        if (number >= 0)
            this.gObject.moveDownward(number);
        else
            this.gObject.moveUpward(-number);
    };

    /**
     * Count the number of items in Stage.
     * @returns {Number}
     */
    Robot.prototype._countItems = function () {
        //TODO: handle case where gObject not initialized yet
        return this.gObject.countItems();
    };

    /**
     * Pick up an Item.
     */
    Robot.prototype._pickup = function () {
        try {
            this.gObject.pickup();
        } catch (e) {
            throw this.getMessage(e);
        }
    };

    /**
     * Drop an Item.
     */
    Robot.prototype._drop = function () {
        try {
            this.gObject.drop();
        } catch (e) {
            throw this.getMessage(e);
        }
    };

    /**
     * Count the number of items carried by Robot.
     * @returns {Number}    Number of items carried.
     */
    Robot.prototype._countCarriedItems = function (category) {
        if (typeof category !== 'undefined') {
            category = TUtils.getString(category);
        }
        return this.gObject.countCarriedItems(category);
    };

    /**
     * Returns gridX.
     * @returns {Integer}
     */
    Robot.prototype._getGridX = function () {
        return (this.gObject.p.gridX);
    };

    /**
     * Returns gridY.
     * @returns {Integer}
     */
    Robot.prototype._getGridY = function () {
        return (this.gObject.p.gridY);
    };

    /**
     * Set the coordinates of Robot.
     * @param {Number} x
     * @param {Number} y
     */
    Robot.prototype._setLocation = function (x, y) {
        x = TUtils.getInteger(x) * this.gObject.p.length + this.gObject.p.baseX;
        y = TUtils.getInteger(y) * this.gObject.p.length + this.gObject.p.baseY;
        this.gObject.setLocation(x, y);
    };

    /**
     * Test if Robot was blocked during the last move
     * @param {String} way
     * @returns {Boolean}
     */
    Robot.prototype._wasBlocked = function (way) {
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
    Robot.prototype._addPlatform = function (platform) {
        Character.prototype._addPlatform.call(this, platform);
        var entrance = platform.getEntranceLocation();
        if (entrance !==false) {
            this.setEntranceLocation(entrance[0], entrance[1]);
        }
        var exit = platform.getExitLocations();
        if (exit !== false) {
            this.exitLocations = exit;
        }
    };

    Robot.prototype.setEntranceLocation = function (x, y) {
        this.gObject.setStartLocation(x, y);
    };

    Robot.prototype.addExitLocation = function (x, y) {
        if (this.exitLocations === false) {
            this.exitLocations = [];
        }
        this.exitLocations.push([x, y]);
    };

    Robot.prototype._getItemName = function () {
        try {
            return this.gObject.getItemName();
        } catch (e) {
            throw this.getMessage(e);
        }
    };

    Robot.prototype._isOverExit = function () {
        if (this.exitLocations !== false) {
            var x = this.gObject.getGridX();
            var y = this.gObject.getGridY();
            for (var i = 0; i < this.exitLocations.length; i++) {
                if (x === this.exitLocations[i][0] && y === this.exitLocations[i][1]) {
                    return true;
                }
            }
        }
        return false;
    };

    Robot.prototype._isOver = function (name) {
        try {
            var current = this.gObject.getItemName();
            if (name === current) {
                return true;
            }
        } catch (e) {
        }
        return false;
    };

    Robot.prototype._isOverItem = function (name) {
        try {
            if (typeof name !== 'undefined')
                return this._isOver(name);
            this.gObject.getItemName();
            return true;
        } catch (e) {
        }
        return false;
    };

    Robot.prototype._isCarrying = function (what) {
        if (!(TUtils.checkString(what) || TUtils.checkObject(what))) {
            throw this.getMessage("wrong carrying parameter");
        }
        return this.gObject.isCarrying(what);
    };

    Robot.prototype.deleteObject = function () {
        this.synchronousManager.end();
        // remove object from instances list
        Platform.unregister(this);
        Character.prototype.deleteObject.call(this);
    };

    return Robot;
});
