define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'ResourceManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, ResourceManager, TGraphicalObject) {
    /**
     * Defines Sprite, inherited from TGraphicalObject.
     * It's a very complete graphical objects : it can have several appearances,
     * move, or have collisions.
     * @param {String} name Sprite's name
     * @exports Sprite
     */
    var Sprite = function(name) {
        TGraphicalObject.call(this);
        this.images = new Array();
        this.imageSets = new Array();
        this.transparentColors = new Array();
        this.displayedImage = null;
        this.displayedSet = "";
        this.displayedIndex = 0;
        this.resources = new ResourceManager();
        this.gObject.setResources(this.resources);
        this.waitingForImage = "";
        if (typeof name === 'string') {
            this._setImage(name);
        }
    };

    Sprite.prototype = Object.create(TGraphicalObject.prototype);
    Sprite.prototype.constructor = Sprite;
    Sprite.prototype.className = "Sprite";

    Sprite.DIRECTION_NONE = 0x00;
    Sprite.DIRECTION_LEFT = 0x01;
    Sprite.DIRECTION_RIGHT = 0x02;
    Sprite.DIRECTION_UP = 0x04;
    Sprite.DIRECTION_DOWN = 0x08;

    var graphics = Sprite.prototype.graphics;

    Sprite.prototype.gClass = graphics.addClass("TGraphicalObject", "TSprite", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                destinationX: 0,
                destinationY: 0,
                vx: 0,
                vy: 0,
                speed: 200,
                type: TGraphicalObject.TYPE_SPRITE,
                direction: 'none',
                category: '',
                moving: false,
                hasCollisionCommands: false,
                collisionWatched: false,
                frozen: false,
                asset: null,
                collisionMask: TGraphicalObject.TYPE_SPRITE,
                collisions: []
            }, props), defaultProps);
            this.watchCollisions(true);
            this.encounteredSprites = new Array();
            this.lastEncounteredSprites = new Array();
            this.resources = {};
        },
        setResources: function(r) {
            this.resources = r;
        },
        asset: function(name, resize) {
            if (!name) {
                if (this.p.asset) {
                    return this.resources.getUnchecked(this.p.asset);
                } else {
                    return null;
                }
            }
            this.p.asset = name;
            if (resize) {
                graphics.objectResized(this);
            }
        },
        removeAsset: function() {
            this.p.asset = null;
            this.initialized(false);
        },
        draw: function(ctx) {
            var p = this.p;
            if (p.sheet) {
                this.sheet().draw(ctx, -p.cx, -p.cy, p.frame);
            } else if (p.asset) {
                try {
                    ctx.drawImage(this.resources.getUnchecked(p.asset), 0,0 , p.w, p.h, -p.cx, -p.cy, p.w, p.h);
                } catch(e) {
                    TEnvironment.log("error displaying sprite");
                }
            } else if (p.color) {
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.cx, -p.cy, p.w, p.h);
            }
        },
        checkCollisions: function() {
            if (this.p.moving) {
                // Look for other sprites
                this.encounteredSprites = [];
                var skip = 0;
                var object;
                var collided = this.stage.TsearchSkip(this, this.p.collisionMask, skip, true);
                // detect up to 3 objects
                var nbCollisions = 3;

                while (collided && nbCollisions>0) {
                    object = collided.obj;
                    if (typeof object.getId !== 'undefined') {
                        var id = object.getId();
                        if (object.p.type === TGraphicalObject.TYPE_SPRITE) {
                            this.encounteredSprites.push(id);
                        }
                        if (object.p.type !== TGraphicalObject.TYPE_SPRITE || this.lastEncounteredSprites.indexOf(id) === -1) {
                            var collision = {};
                            collision.obj = collided.obj;
                            collision.separate = [];
                            collision.separate[0] = collided.separate[0];
                            collision.separate[1] = collided.separate[1];
                            collision.normalX = collided.normalX;
                            collision.normalY = collided.normalY;
                            collision.magnitude = collided.magnitude;
                            collision.distance = collided.distance;
                            this.p.collisions.push(collision);
                            nbCollisions --;
                        }
                    }
                    skip++;
                    collided = this.stage.TsearchSkip(this, this.p.collisionMask, skip, false);
                }
                this.lastEncounteredSprites = this.encounteredSprites.slice(0);
            }
        },
        handleCollisions: function() {
            while (this.p.collisions.length>0) {
                var collision = this.p.collisions.pop();
                var object = collision.obj;
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
        },
        objectEncountered: function(col) {
            if (this.p.collisionWatched && this.p.hasCollisionCommands ) {
                var object = col.obj;
                if (typeof object.getId !== 'undefined') {
                    var id = object.getId();
                    var category = object.getCategory();
                    // 1st check collision commands with this object
                    if (typeof this.spriteCollisionCommands !== 'undefined' && this.spriteCollisionCommands.hasCommands(id)) {
                        this.spriteCollisionCommands.executeCommands({'field': id, 'parameters':[this.getTObject(), object.getTObject()]});
                    }
                    // 2nd check collision commands with object's category
                    if (typeof this.categoryCollisionCommands !== 'undefined' && this.categoryCollisionCommands.hasCommands(category)) {
                        this.categoryCollisionCommands.executeCommands({'field': category, 'parameters':[this.getTObject(), object.getTObject()]});
                    }
                    // 3rd check general collision commands
                    if (typeof this.collisionCommands !== 'undefined' && this.collisionCommands.hasCommands()) {
                        this.collisionCommands.executeCommands({'parameters':[this.getTObject(), object.getTObject()]});
                    }
                }
            }
        },
        step: function(dt) {
            var p = this.p;
            var wasMoving = p.moving;
            if (!p.dragging && !p.frozen) {
                if (p.direction === Sprite.DIRECTION_NONE) {
                    var movingX = false, movingY = false;
                    if (p.x < p.destinationX) {
                        p.x = Math.min(p.x + p.vx*dt, p.destinationX);
                        movingX = true;
                    } else if (p.x > p.destinationX) {
                        p.x = Math.max(p.x + p.vx*dt, p.destinationX);
                        movingX = true;
                    } else {
                        p.vx = 0;
                    }
                    if (p.y < p.destinationY) {
                        p.y = Math.min(p.y + p.vy*dt, p.destinationY);
                        movingY = true;
                    } else if (p.y > p.destinationY) {
                        p.y = Math.max(p.y + p.vy*dt, p.destinationY);
                        movingY = true;
                    } else {
                        p.vy = 0;
                    }
                    p.moving = movingX | movingY;
                } else {
                    p.x += p.vx*dt;
                    p.y += p.vy*dt;
                    p.moving = true;
                }
                this.p.collisions = [];
                this.checkCollisions();
                this.handleCollisions();
                if (wasMoving && !p.moving) {
                    this.trigger("stop");
                }
                if (!wasMoving && p.moving) {
                    this.trigger("start");
                }
            }
        },
        designTouchEnd: function(touch) {
            this.p.destinationX = this.p.x;
            this.p.destinationY = this.p.y;
            this._super(touch);
        },
        setLocation: function(x, y) {
            this._super(x, y);
            this.perform(function() {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        setCenterLocation: function(x, y) {
            this._super(x, y);
            this.perform(function() {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        moveForward: function(value) {
            this.perform(function(value) {
                this.p.direction = Sprite.DIRECTION_NONE;
                this.p.destinationX = this.p.x + value;
                this.p.vx = this.p.speed;
            }, [value]);
        },
        alwaysMoveForward: function() {
            this.perform(function() {
                this.p.direction = Sprite.DIRECTION_RIGHT;
                this.p.vx = this.p.speed;
            }, {});
        },
        moveBackward: function(value) {
            this.perform(function(value) {
                this.p.direction = Sprite.DIRECTION_NONE;
                //this.p.destinationX -= value;
                this.p.destinationX = this.p.x - value;
                this.p.vx = -this.p.speed;
            }, [value]);
        },
        alwaysMoveBackward: function() {
            this.perform(function() {
                this.p.direction = Sprite.DIRECTION_LEFT;
                this.p.vx = -this.p.speed;
            }, {});
        },
        moveUpward: function(value) {
            this.perform(function(value) {
                this.p.direction = Sprite.DIRECTION_NONE;
                this.p.destinationY = this.p.y - value;
                this.p.vy = -this.p.speed;
            }, [value]);
        },
        alwaysMoveUpward: function() {
            this.perform(function() {
                this.p.direction = Sprite.DIRECTION_UP;
                this.p.vy = -this.p.speed;
            }, {});
        },
        moveDownward: function(value) {
            this.perform(function(value) {
                this.p.direction = Sprite.DIRECTION_NONE;
                this.p.destinationY = this.p.y + value;
                this.p.vy = this.p.speed;
            }, [value]);
        },
        alwaysMoveDownward: function() {
            this.perform(function() {
                this.p.direction = Sprite.DIRECTION_DOWN;
                this.p.vy = this.p.speed;
            }, {});
        },
        goTo: function(x, y) {
            this.perform(function(x, y) {
                this.p.destinationX = x + this.p.w / 2;
                this.p.destinationY = y + this.p.h / 2;
                if (this.p.destinationX > this.p.x) {
                    this.p.vx = this.p.speed;
                } else {
                    this.p.vx = -this.p.speed;
                }
                if (this.p.destinationY > this.p.y) {
                    this.p.vy = this.p.speed;
                } else {
                    this.p.vy = -this.p.speed;
                }
                this.p.direction = Sprite.DIRECTION_NONE;
            }, [x, y]);
        },
        centerGoTo: function(x, y) {
            this.perform(function(x, y) {
                this.p.destinationX = x;
                this.p.destinationY = y;
                if (this.p.destinationX > this.p.x) {
                    this.p.vx = this.p.speed;
                } else {
                    this.p.vx = -this.p.speed;
                }
                if (this.p.destinationY > this.p.y) {
                    this.p.vy = this.p.speed;
                } else {
                    this.p.vy = -this.p.speed;
                }
                this.p.direction = Sprite.DIRECTION_NONE;
            }, [x, y]);
        },
        stop: function() {
            this.perform(function() {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
                // remove this for now as it will stop any jump
                // TODO: find a more elegant way
                /*this.p.vx = 0;
                this.p.vy = 0;*/
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        stopVertically: function() {
            this.perform(function() {
                this.p.destinationY = this.p.y;
                this.p.vy = 0;
                if (this.p.direction === Sprite.DIRECTION_UP
                    || this.p.direction === Sprite.DIRECTION_DOWN)
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        stopHorizontally: function() {
            this.perform(function() {
                this.p.destinationX = this.p.x;
                this.p.vx = 0;
                if (this.p.direction === Sprite.DIRECTION_LEFT
                    || this.p.direction === Sprite.DIRECTION_RIGHT)
                this.p.direction = Sprite.DIRECTION_NONE;
            }, {});
        },
        setVelocity: function(value) {
            this.perform(function(value) {
                this.p.speed = value * 2;
            }, [value]);
        },
        setCategory: function(name) {
            this.p.category = name;
        },
        getCategory: function() {
            return this.p.category;
        },
        addCollisionCommand: function(command, param) {
            if (typeof param === 'undefined') {
                // collisions with all sprites
                if (typeof this.collisionCommands === 'undefined') {
                    this.collisionCommands = new CommandManager();
                }
                this.collisionCommands.addCommand(command);
            } else if (TUtils.checkString(param)) {
                // collision with a given category
                if (typeof this.categoryCollisionCommands === 'undefined') {
                    this.categoryCollisionCommands = new CommandManager();
                }
                this.categoryCollisionCommands.addCommand(command, param);
            } else if (TUtils.checkObject(param)) {
                // collision with a given sprite
                if (typeof this.spriteCollisionCommands === 'undefined') {
                    this.spriteCollisionCommands = new CommandManager();
                }
                this.spriteCollisionCommands.addCommand(command, param.getGObject().getId());
            }
            if (!this.p.hasCollisionCommands) {
                this.p.hasCollisionCommands = true;
            }
        },
        watchCollisions: function(value) {
            this.perform(function(value) {
                if (value === this.p.collisionWatched)
                    return;
                if (value) {
                    this.on("hit", this, "objectEncountered");
                } else {
                    this.off("hit", this, "objectEncountered");
                }
                this.p.collisionWatched = value;
            }, [value]);
        },
        getId: function() {
            return this.p.id;
        },
        toString: function() {
            return "Sprite_" + this.getId();
        },
        freeze: function(value) {
            this.p.frozen = value;
            this._super(value);
        }
    });

    // MOVEMENT MANAGEMENT

    /**
     * Move Sprite of "value" pixels forward (to the right).
     * if "value" is undefined, always move forward.
     * @param {Number} value
     */
    Sprite.prototype._moveForward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveForward();
        } else {
            value = TUtils.getInteger(value);
            this.gObject.moveForward(value);
        }
    };

    /**
     * Move Sprite forward while nothing stops it.
     */
    Sprite.prototype._alwaysMoveForward = function() {
        this.gObject.alwaysMoveForward();
    };

    /**
     * Move Sprite of "value" pixels backward (to the left).
     * if "value" is undefined, always move backward.
     * @param {Number} value
     */
    Sprite.prototype._moveBackward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveBackward();
        } else {
            value = TUtils.getInteger(value);
            this.gObject.moveBackward(value);
        }
    };

    /**
     * Move Sprite backward while nothing stops it.
     */
    Sprite.prototype._alwaysMoveBackward = function() {
        this.gObject.alwaysMoveBackward();
    };

    /**
     * Move Sprite of "value" pixels upward.
     * if "value" is undefined, always move upward.
     * @param {Number} value
     */
    Sprite.prototype._moveUpward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveUpward();
        } else {
            value = TUtils.getInteger(value);
            this.gObject.moveUpward(value);
        }
    };

    /**
     * Move Sprite upward while nothing stops it.
     */
    Sprite.prototype._alwaysMoveUpward = function() {
        this.gObject.alwaysMoveUpward();
    };

    /**
     * Move Sprite of "value" pixels downward.
     * if "value" is undefined, always move downward.
     * @param {Number} value
     */
    Sprite.prototype._moveDownward = function(value) {
        if (typeof value === 'undefined') {
            this._alwaysMoveDownward();
        } else {
            value = TUtils.getInteger(value);
            this.gObject.moveDownward(value);
        }
    };

    /**
     * Move Sprite downward while nothing stops it.
     */
    Sprite.prototype._alwaysMoveDownward = function() {
        this.gObject.alwaysMoveDownward();
    };

    Sprite.prototype._stopVertically = function() {
        this.gObject.stopVertically();
    };

    Sprite.prototype._stopHorizontally = function() {
        this.gObject.stopHorizontally();
    };

    /*
     * Stops any movement of Sprite.
     */
    Sprite.prototype._stop = function() {
        this.gObject.stop();
    };

    /**
     * Set Sprite velocity.
     * The higher "value" will be, the faster Sprite will move.
     * @param {Number} value
     */
    Sprite.prototype._setVelocity = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.setVelocity(value);
    };

    // IMAGES MANAGEMENT

    Sprite.waitingForImage = new Array();

    /**
     * Call addImage with project as true and without callback.
     * @param {String} name
     * @param {String} set
     */
    Sprite.prototype._addImage = function(name, set) {
        this.addImage(name, set, true);
    };

    /**
     * Add a new Image to Sprite.
     * If project is set as true, load the asset from project,
     * else load from object itself.
     * At the end of the function, call callback if defined.
     * @param {String} name
     * @param {String} set
     * @param {Boolean} project
     * @param {Function} callback
     */
    Sprite.prototype.addImage = function(name, set, project, callback) {
        name = TUtils.getString(name);
        var asset;
        try {
            if (project) {
                // asset from project
                asset = TEnvironment.getProjectResource(name);
            } else {
                // asset from object itself
                asset = this.getResource(name);
            }
            if (typeof set === 'undefined') {
                set = "";
            } else {
                set = TUtils.getString(set);
            }
            if (typeof this.imageSets[set] === 'undefined') {
                this.imageSets[set] = new Array();
            }
            this.imageSets[set].push(name);
            var spriteObject = this;
            this.resources.add(name, asset, function() {
                if (name === spriteObject.waitingForImage) {
                    spriteObject.setDisplayedImage(name);
                }
                if (typeof callback !== 'undefined') {
                    callback.call(spriteObject);
                }
            });
        }
        catch (e) {
            throw new Error(this.getMessage("file not found", name));
        }
    };

    /**
     * Call removeImage. (Useless ?)
     * @param {String} name
     * @param {String} set
     */
    Sprite.prototype._removeImage = function(name, set) {
        this.removeImage(name, set);
    };

    /**
     * Remove an image for Sprite.
     * @param {String} name
     * @param {String} set
     */
    Sprite.prototype.removeImage = function(name, set) {
        if (typeof set === 'undefined') {
            set = "";
        } else {
            set = TUtils.getString(set);
        }
        name = TUtils.getString(name);
        if (typeof this.imageSets[set] === 'undefined') {
            throw new Error(this.getMessage("wrong set"));
        }

        var index = this.imageSets[set].indexOf(name);

        if (index < 0) {
            throw new Error(this.getMessage("resource not found", name));
        }

        this.imageSets[set].splice(index, 1);

        // if sprite was waiting for this image, remove it
        if (this.waitingForImage === name) {
            this.waitingForImage = '';
        }
        // if removed image was current image, remove asset
        if (this.displayedImage === name) {
            // remove asset
            this.gObject.removeAsset();
            this.displayedImage = null;
            this.displayedIndex = 0;
        }

        // TODO: remove from images ONLY IF image not used in other set
        this.resources.remove(name);
    };

    /**
     * Remove a whole set of images.
     * @param {Sprite} name
     */
    Sprite.prototype._removeImageSet = function(name) {
        if (typeof name === 'undefined') {
            name = "";
        }
        name = TUtils.getString(name);

        if (typeof this.imageSets[name] === 'undefined') {
            throw new Error(this.getMessage("wrong set"));
        }

        this.emptyImageSet(name);

        delete this.imageSets[name];
        if (this.displayedSet === name) {
            // set was the currently used: remove image from sprite
            this.gObject.removeAsset();
            this.displayedImage = null;
            this.displayedSet = "";
            this.displayedIndex = 0;
        }
    };

    /**
     * Called by _removeImageSet. Removes the images from the Set.
     * @param {type} name
     */
    Sprite.prototype.emptyImageSet = function(name) {
        for (var i = 0; i < this.imageSets[name].length; i++) {
            var imageName = this.imageSets[name][i];
            // if sprite was waiting for this image, remove it
            if (this.waitingForImage === imageName) {
                this.waitingForImage = '';
            }
            // if removed image was current image, remove image
            if (this.displayedImage === imageName) {
                // remove asset
                this.gObject.removeAsset();
                this.displayedImage = null;
                this.displayedIndex = 0;
            }

            this.resources.remove(name);
        }
    };

    /**
     * Set the image to be display.
     * If the image is ready, set it
     * @param {String} name
     * @returns {Boolean}   Returns true if image is ready, else false.
     */
    Sprite.prototype.setDisplayedImage = function(name) {
        this.displayedImage = name;
        if (this.resources.ready(name)) {
            // image ready
            var gObject = this.gObject;
            gObject.asset(name, true);
            if (!gObject.p.initialized) {
                gObject.initialized();
            }
            return true;
        } else {
            // image not ready
            this.waitingForImage = name;
            return false;
        }
    };

    /**
     * Display the current image.
     * @param {String} name
     */
    Sprite.prototype._displayImage = function(name) {
        name = TUtils.getString(name);
        if (!this.resources.has(name)) {
            throw new Error(this.getMessage("resource not found", name));
        }
        if (this.displayedImage !== name) {
            this.setDisplayedImage(name);
        }
    };

    /**
     * Display the next image of the set given in parameter.
     * @param {String} set
     */
    Sprite.prototype._displayNextImage = function(set) {
        if (typeof set === 'undefined') {
            set = "";
        } else {
            set = TUtils.getString(set);
        }
        if (typeof this.imageSets[set] === 'undefined') {
            throw new Error(this.getMessage("wrong set"));
        }
        if (this.displayedSet === set) {
            // We are in the same set: get next image
            this.displayedIndex = (this.displayedIndex + 1) % this.imageSets[set].length;
            this._displayImage(this.imageSets[set][this.displayedIndex]);
        } else {
            // We are changing set: start at 0
            this.displayedIndex = 0;
            this.displayedSet = set;
            this._displayImage(this.imageSets[set][0]);
        }
    };

    /**
     * Display the previous image of the set given in parameter.
     * @param {String} set
     */
    Sprite.prototype._displayPreviousImage = function(set) {
        if (typeof set === 'undefined') {
            set = "";
        } else {
            set = TUtils.getString(set);
        }
        if (typeof this.imageSets[set] === 'undefined') {
            throw new Error(this.getMessage("wrong set"));
        }
        if (this.displayedSet === set) {
            // We are in the same set: get next image
            this.displayedIndex = (this.displayedIndex - 1 + this.imageSets[set].length) % this.imageSets[set].length;
            this._displayImage(this.imageSets[set][this.displayedIndex]);
        } else {
            // We are changing set: start at 0
            this.displayedIndex = 0;
            this.displayedSet = set;
            this._displayImage(this.imageSets[set][0]);
        }
    };

    /**
     * Add a new image to Sprite and display it.
     * @param {String} name
     */
    Sprite.prototype._setImage = function(name) {
        this._addImage(name);
        this._displayImage(name);
    };

    // COLLISION MANAGEMENT

    /**
     * Set a category for Sprite.
     * @param {String} name
     */
    Sprite.prototype._setCategory = function(name) {
        name = TUtils.getString(name);
        this.gObject.setCategory(name);
    };

    /**
     * Add a new collision for Sprite.
     * @param {String} param1   Command to execute if collision
     * @param {String} param2   Object or Category linked to collision
     */
    Sprite.prototype._ifCollision = function(param1, param2) {
        param1 = TUtils.getCommand(param1);
        this.gObject.addCollisionCommand(param1, param2);
    };

    /**
     * Call _ifCollision with inverted paramters.
     * @param {String} who      Object or Category linked to collision
     * @param {String} command  Command to execute if collision
     */
    Sprite.prototype._ifCollisionWith = function(who, command) {
        this._ifCollision(command, who);
    };

    /**
     * Get the string corresponding to Sprite.
     * @returns {String}
     */
    Sprite.prototype.toString = function() {
        return this.gObject.toString();
    };

    /**
     * Set a tranparent color for Sprite.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     * @param {Function} callbacks
     */
    Sprite.prototype.setTransparent = function(red, green, blue, callbacks) {
        var color = TUtils.getColor(red, green, blue);
        this.resources.addTransparentColor(color, callbacks);
    };

    /**
     * Set a transparent color for Sprite and define new displayed image.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Sprite.prototype._setTransparent = function(red, green, blue) {
        if (this.displayedImage) {
            this.gObject.removeAsset();
        }
        var parent = this;
        this.setTransparent(red, green, blue, function(name) {
            if (parent.displayedImage === name) {
                parent.setDisplayedImage(name);
            }
        });
    };

    /**
     * Move Sprite's top-left pixel to coordinates {x,y}.
     * @param {Number} x
     * @param {Number} y
     */
    Sprite.prototype._goTo = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.goTo(x, y);
    };

    /**
     * Move Sprite's center pixel to coordinates {x,y}.
     * @param {Number} x
     * @param {Number} y
     */
    Sprite.prototype._centerGoTo = function(x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.centerGoTo(x, y);
    };

    /**
     * Checks if Sprite have collisions triggered.
     * @param {Boolean} value
     */
    Sprite.prototype._watchCollisions = function(value) {
        value = TUtils.getBoolean(value);
        this.gObject.watchCollisions(value);
    };

    /**
     * Checks if Sprite is ready.
     * If not, call callback.
     * @param {Function} callback
     * @param {type} arguments
     * @returns {Boolean} Returns true if Sprite is ready, else false.
     */
    Sprite.prototype.isReady = function(callback, arguments) {
        if (this.gObject.p.initialized) {
            return true;
        } else {
            if (typeof callback !== 'undefined') {
                this.gObject.perform(callback, arguments);
            }
            return false;
        }
    };

    return Sprite;
});
