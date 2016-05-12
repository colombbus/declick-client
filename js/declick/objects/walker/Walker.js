define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, TUtils) {
    /**
     * Defines Walker, inhetired from Sprite.
     * It can have a gravity, jump and be linked to a Block.
     * @param {String} name Walker's name
     * @exports Walker
     */
    var Walker = function(name) {
        Sprite.call(this, name);
    };

    Walker.prototype = Object.create(Sprite.prototype);
    Walker.prototype.constructor = Walker;
    Walker.prototype.className = "Walker";

    var graphics = Walker.prototype.graphics;

    Walker.prototype.gClass = graphics.addClass("TSprite", "TWalker", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                type: TGraphicalObject.TYPE_WALKER | TGraphicalObject.TYPE_SPRITE,
                collisionMask: TGraphicalObject.TYPE_SPRITE | TGraphicalObject.TYPE_PLATFORM | TGraphicalObject.TYPE_BLOCK,
                mayFall: false,
                jumping: false,
                vy: 0,
                gravity: 9.8 * 100,
                jumpDelay: 10,
                jumpAvailable: 0,
                jumpSpeed: -300,
                waitingForBlocks: 0
            }, props), defaultProps);
            this.blocks = new Array();
            this.on("bump.bottom", "landed");
        },
        step: function(dt) {
            var p = this.p;
            if (!this.p.dragging && !this.p.frozen && this.p.waitingForBlocks === 0) {
                if (this.p.mayFall && (this.p.direction === Sprite.DIRECTION_UP || this.p.direction === Sprite.DIRECTION_DOWN)) {
                    // cannot move upward or downward when walker may fall
                    this.p.direction = Sprite.DIRECTION_NONE;
                }
                if (this.p.mayFall) {
                    this.p.vy += this.p.gravity * dt;
                    if (this.p.jumpAvailable > 0)
                        this.p.jumpAvailable--;
                    if (this.p.jumping) {
                        if (this.p.jumpAvailable > 0) {
                            // perform a jump
                            this.p.vy = this.p.jumpSpeed;
                        }
                        this.p.jumping = false;
                    }
                    if (this.p.direction === Sprite.DIRECTION_NONE) {
                        this.p.destinationY = this.p.y + this.p.vy * dt;
                    }
                }
            }
            this._super(dt);
        },
        checkCollisions: function() {
            // search for sprites and blocks
            this._super();
            // search for any platform
            graphics.searchCollisionLayer(this, TGraphicalObject.TYPE_PLATFORM, false);
        },
        handleCollisions: function() {
            var separate = [];
            var p = this.p;
            separate[0] = 0;
            separate[1] = 0;
            var blockedX = false;
            var blockedY = false;
            while (this.p.collisions.length>0) {
                var collision = this.p.collisions.pop();
                var object = collision.obj;
                var id = object.getId();
                if (this.blocks.indexOf(id) > -1 && (((object.p.type & TGraphicalObject.TYPE_PLATFORM) !== 0 ) || (((object.p.type & TGraphicalObject.TYPE_BLOCK) !==0) && !object.checkTransparency(this, collision)))) {
                    var impactX = Math.abs(p.vx);
                    var impactY = Math.abs(p.vy);
                    collision.impact = 0;
                    p.skipCollide = false;
                    if(collision.normalY < -0.3) {
                        collision.impact = impactY;
                        this.trigger("bump.bottom",collision);
                        this.trigger("bump",collision);
                        if(!p.skipCollide && p.vy > 0) {
                            p.vy = 0;
                            blockedY = true;
                        }
                    }
                    if(collision.normalY > 0.3) {
                        collision.impact = impactY;
                        this.trigger("bump.top",collision);
                        this.trigger("bump",collision);
                        if(!p.skipCollide && p.vy < 0) {
                            p.vy = 0;
                            blockedY = true;
                        }
                    }
                    if(collision.normalX < -0.3) {
                        collision.impact = impactX;
                        this.trigger("bump.right",collision);
                        this.trigger("bump",collision);
                        if(!p.skipCollide && p.vx > 0) {
                            p.vx = 0;
                            blockedX = true;
                        }
                    }
                    if(collision.normalX > 0.3) {
                        collision.impact = impactX;
                        this.trigger("bump.left",collision);
                        this.trigger("bump",collision);
                        if(!p.skipCollide && p.vx < 0) {
                            p.vx = 0;
                            blockedX = true;
                        }
                    }
                    if (!p.skipCollide) {
                        if (Math.abs(collision.separate[0])>Math.abs(separate[0])) {
                            separate[0] = collision.separate[0];
                        }
                        if (Math.abs(collision.separate[1])>Math.abs(separate[1])) {
                            separate[1] = collision.separate[1];
                        }
                    }
                }
                if (object.p.type & (TGraphicalObject.TYPE_SPRITE | TGraphicalObject.TYPE_BLOCK) !==0) {
                    this.trigger('hit', collision);
                    this.trigger('hit.collision', collision);
                    // Do the reciprical collision
                    collision.obj = this;
                    collision.normalX *= -1;
                    collision.normalY *= -1;
                    collision.distance = 0;
                    collision.magnitude = 0;
                    collision.separate[0] = 0;
                    collision.separate[1] = 0;
                    object.trigger('hit', collision);
                    object.trigger('hit.sprite', collision);
                }
            }
            p.x -= separate[0];
            p.y -= separate[1];
            if (blockedX) {
                p.destinationX = p.x;
                if (p.direction === Sprite.DIRECTION_RIGHT || p.direction === Sprite.DIRECTION_LEFT) {
                    p.direction = Sprite.DIRECTION_NONE;
                }
            }
            if (blockedY) {
                p.destinationY = p.y;
                if (p.direction === Sprite.DIRECTION_UP || p.direction === Sprite.DIRECTION_BOTTOM) {
                    p.direction = Sprite.DIRECTION_NONE;
                }
            }
        },
        landed: function(col) {
            this.p.jumpAvailable = this.p.jumpDelay;
        },
        addBlock: function(block) {
            var objId = block.getGObject().getId();
            if (this.blocks.indexOf(objId) === -1) {
                this.blocks.push(objId);
            }
        },
        removeBlock: function(block) {
            var objId = block.getGObject().getId();
            var index = this.blocks.indexOf(objId);
            if (index !== -1) {
                this.blocks.splice(index,1);
            }
        },
        mayFall: function(value) {
            if (typeof value === 'undefined') {
                    value = true;
            }
            this.perform(function() {
                this.p.mayFall = value;
            });
        },
        setJumpSpeed: function(value) {
            this.perform(function() {
                this.p.jumpSpeed = -3 * value;
            });
        },
        setGravity: function(value) {
            this.perform(function() {
                this.p.gravity = 9.8 * value;
            });
        },
        jump: function() {
            this.perform(function() {
                this.p.jumping = true;
            });
        },
        waitForBlock: function() {
            this.p.waitingForBlocks++;
        },
        blockReady: function() {
            this.p.waitingForBlocks--;
        },
        setLocation: function(x, y) {
            this._super(x, y);
            this.perform(function() {
            	this.p.vy=0;
            }, {});
        },
        setCenterLocation: function(x, y) {
            this._super(x, y);
            this.perform(function() {
            	this.p.vy=0;
            }, {});
        }

    });

    /**
     * Link a Block given in parameter to the Walker.
     * Walker can't walk in non-transparent areas of the Block.
     * @param {String} block
     */
    Walker.prototype._addBlock = function(block) {
        block = TUtils.getObject(block);
        var self = this;
        if (!block.isReady(function() {
            self.gObject.addBlock(block);
            self.blockReady();
        })) {
            // wait for block to be loaded
            this.gObject.waitForBlock();
        } else {
        	// block is ready: add it
            self.gObject.addBlock(block);
        }
    };

    /**
     * Link a platform to the Walker. Walker will not pass through.
     * @param {String} platform
     */
    Walker.prototype._addPlatform = function(platform) {
    	this._addBlock(platform);
    };

    /**
     * Defines if the Walker can fall or not.
     * @param {Boolean} value
     */
    Walker.prototype._mayFall = function(value) {
        if (typeof value === 'boolean') {
            value = TUtils.getBoolean(value);
        } else {
            value = true;
        }
        this.gObject.mayFall(value);
    };

    /**
     * Set the Jump Speed of the Walker.
     * Walker can jump only if it has gravity and it is on a Block.
     * @param {Number} value
     */
    Walker.prototype._setJumpSpeed = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.setJumpSpeed(value);
    };

    /**
     * Walker will jump, depending of JumpSpeed.
     */
    Walker.prototype._jump = function() {
		if (arguments.length > 0) {
			throw this.getMessage('unexpected jump argument');
		}
        this.gObject.jump();
    };

    /**
     * Says that a Block is ready to be added. Remove it from the waiting list.
     */
    Walker.prototype.blockReady = function() {
        this.gObject.blockReady();
    };

    /**
     * Set the gravity. The higher the number, the faster Walker will fall.
     * @param {Number} value
     */
    Walker.prototype._setGravity = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.setGravity(value);
    };

    return Walker;
});
