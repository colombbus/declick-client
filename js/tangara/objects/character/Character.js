define(['jquery', 'TEnvironment', 'TUtils', 'TGraphicalObject', 'CommandManager'], function($, TEnvironment, TUtils, TGraphicalObject, CommandManager) {
    /**
     * Defines Character, inherited from TGraphicalObject.
     * A Character have several appearances, can move, raise its arms,
     * and catch Sprite objects.
     * @param {String} characterName Character's name
     * @exports Character
     */
    var Character = function(characterName) {
        TGraphicalObject.call(this);
        if (typeof (characterName) === 'undefined') {
            characterName = "boy";
        } else {
            var simplifiedName = TUtils.removeAccents(characterName);
            characterName = this.getMessage(simplifiedName);
        }
        this._setLocation(0, 0);
        this._loadSkeleton(characterName);
    };

    Character.prototype = Object.create(TGraphicalObject.prototype);
    Character.prototype.constructor = Character;
    Character.prototype.className = "Character";

    var graphics = Character.prototype.graphics;

    Character.prototype.gClass = graphics.addClass("TGraphicalObject", "Character", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                destinationX: 0,
                destinationY: 0,
                velocity: 200,
                w: 0,
                h: 0,
                type: TGraphicalObject.TYPE_CHARACTER
            }, props), defaultProps);
            this.catchableObjects = new Array();
            this.commands = new CommandManager();
        },
        step: function(dt) {
            var p = this.p;
            if (!p.dragging && p.initialized) {
                var step = p.velocity * dt;
                if (p.x < p.destinationX) {
                    p.x = Math.min(p.x + step, p.destinationX);
                } else if (p.x > p.destinationX) {
                    p.x = Math.max(p.x - step, p.destinationX);
                }
                if (p.y < p.destinationY) {
                    p.y = Math.min(p.y + step, p.destinationY);
                } else if (p.y > p.destinationY) {
                    p.y = Math.max(p.y - step, p.destinationY);
                }
            }
        },
        designDrag: function(touch) {
            if (!this.p.dragging) {
                touch.origX = this.p.x;
                touch.origY = this.p.y;
            }
            this._super(touch);
        },
        designTouchEnd: function(touch) {
            this.p.destinationX = this.p.x;
            this.p.destinationY = this.p.y;
            this._super(touch);
        },
        getSideCoordinates: function(side) {
            var element;
            if (side === 'left') {
                element = this.leftElement;
            } else {
                element = this.rightElement;
            }
            return [(element.c.points[0][0] + element.c.points[2][0]) / 2, (element.c.points[0][1] + element.c.points[2][1]) / 2];
        },
        setLocation: function(x, y) {
            this._super(x, y);
            this.perform(function() {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
            }, {});
        },
        setCenterLocation: function(x, y) {
            this._super(x, y);
            this.perform(function() {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
            }, {});
        },
        moveForward: function(value) {
            this.perform(function(value) {
                this.p.destinationX += value;
            }, [value]);
        },
        moveBackward: function(value) {
            this.perform(function(value) {
                this.p.destinationX -= value;
            }, [value]);
        },
        moveUpward: function(value) {
            this.perform(function(value) {
                this.p.destinationY -= value;
            }, [value]);
        },
        moveDownward: function(value) {
            this.perform(function(value) {
                this.p.destinationY += value;
            }, [value]);
        },
        stop: function() {
            this.perform(function() {
                this.p.destinationX = this.p.x;
                this.p.destinationY = this.p.y;
            }, {});
        },
        mayCatch: function(object, command) {
            this.perform(function(obj, cmd) {
                if (this.catchableObjects.indexOf(obj) === -1) {
                    this.catchableObjects.push(obj);
                }
                if (typeof cmd !== 'undefined') {
                    this.commands.addCommand(cmd, obj);
                }
                object.p.type = object.p.type | TGraphicalObject.TYPE_CATCHABLE;
                // Force update of stage grid
                this.stage.delGrid(object);
                this.stage.addGrid(object);
            }, [object, command]);
        },
        freeze: function(value) {
            if (value) {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].stopAnimation();
                }
            } else {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].startAnimation();
                }
            }
        },
        raiseLeftArm: function(value) {
            this.perform(function(value) {
                this.leftElement.lower(value);
            }, [value]);
        },
        raiseRightArm: function(value) {
            this.perform(function(value) {
                this.rightElement.raise(value);
            }, [value]);
        },
        lowerLeftArm: function(value) {
            this.perform(function(value) {
                this.leftElement.raise(value);
            }, [value]);
        },
        lowerRightArm: function(value) {
            this.perform(function(value) {
                this.rightElement.lower(value);
            }, [value]);
        }
    });

    var linear = graphics.getEasing("Linear");

    var PartClass = graphics.addClass("CharacterPart", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                name: "",
                moveUp: true,
                initialized: false,
                rotationSpeed: 0.025,
                moving: false,
                initX: 0,
                initY: 0,
                initAngle: 0,
                type: TGraphicalObject.TYPE_CHARACTER,
                mayCatch: false
            }, props), defaultProps);
            this.add("tween");
        },
        startAnimation: function() {
            this.p.initX = this.p.x;
            this.p.initY = this.p.y;
            this.p.initAngle = this.p.angle;
            this.p.moveUp = true;
            if (this.p.name === "chest" || this.p.name === "tail") {
                this.breathe();
            }
        },
        breathe: function() {
            var p = this.p;
            switch (p.name) {
                case 'chest' :
                    // movement with chest and arms
                    if (p.moveUp) {
                        this.animate({y: p.y - 3}, 1, linear, {callback: this.breathe});
                    } else {
                        this.animate({y: p.y + 3}, 1, linear, {callback: this.breathe});
                    }
                    if (typeof this.leftArm !== 'undefined') {
                        this.leftArm.p.moveUp = p.moveUp;
                        this.leftArm.breathe();
                    }
                    if (typeof this.rightArm !== 'undefined') {
                        this.rightArm.p.moveUp = p.moveUp;
                        this.rightArm.breathe();
                    }
                    p.moveUp = !p.moveUp;
                    break;
                case 'tail' :
                    // movement with only tail
                    if (p.moveUp) {
                        this.animate({angle: p.angle + 4}, 1, linear, {callback: this.breathe});
                    } else {
                        this.animate({angle: p.angle - 4}, 1, linear, {callback: this.breathe});
                    }
                    p.moveUp = !p.moveUp;
                    break;
                case 'rightArm' :
                    if (!p.moving) {
                        if (p.moveUp) {
                            this.animate({angle: p.angle + 4}, 1, linear);
                        } else {
                            this.animate({angle: p.angle - 4}, 1, linear);
                        }
                    }
                    break;
                case 'leftArm' :
                    if (!p.moving) {
                        if (p.moveUp) {
                            this.animate({angle: p.angle - 4}, 1, linear);
                        } else {
                            this.animate({angle: p.angle + 4}, 1, linear);
                        }
                    }
                    break;
            }
        },
        stopAnimation: function() {
            this.stop();
            this.p.x = this.p.initX;
            this.p.y = this.p.initY;
            this.p.angle = this.p.initAngle;
        },
        raise: function(value) {
            p = this.p;
            p.moving = true;
            this.stopAnimation();
            var duration = Math.abs(value * p.rotationSpeed);
            this.animate({angle: p.angle + value}, duration, linear, {callback: this.stopMoving});
        },
        lower: function(value) {
            p = this.p;
            p.moving = true;
            this.stopAnimation();
            var duration = Math.abs(value * this.p.rotationSpeed);
            this.animate({angle: this.p.angle - value}, duration, linear, {callback: this.stopMoving});
        },
        stopMoving: function() {
            this.p.initAngle = this.p.angle;
            this.p.moving = false;
        },
        step: function(dt) {
            if (this.p.mayCatch)
                this.stage.collide(this, TGraphicalObject.TYPE_CATCHABLE);
        },
        objectEncountered: function(col) {
            var collided = col.obj;
            var index = this.container.catchableObjects.indexOf(collided);
            if (typeof index !== -1 && ((collided.p.type & TGraphicalObject.TYPE_CATCHABLE) !== 0)) {
                // we have caught: we cannot catch anymore
                this.p.mayCatch = false;

                // collided object change type
                collided.p.type = collided.p.type & ~TGraphicalObject.TYPE_CATCHABLE;
                // Force update of stage grid
                this.stage.delGrid(collided);
                this.stage.addGrid(collided);

                collided.owner = this.container;
                collided.ownerSide = this.side;
                // Redefine collided object movement
                collided.step = function() {
                    var coordinates = this.owner.getSideCoordinates(this.ownerSide);
                    this.p.x = coordinates[0];
                    this.p.y = coordinates[1];
                    // Why not checking for collisions sill?
                    this.checkCollisions();
                };

                // execute commands if any
                var commands = this.container.commands;
                if (commands.hasCommands(collided)) {
                    commands.executeCommands({'field': collided});
                }
                for (var i = 0; i < commands.length; i++) {
                    TEnvironment.execute(commands[i]);
                }

                // remove collided object from the list
                this.container.catchableObjects.splice(index, 1);
            }
        }
    });

    /**
     * Move Character of "value" pixels forward (to the right)?
     * @param {Number} value
     */
    Character.prototype._moveForward = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.moveForward(value);
    };
    
    /**
     * Move Character of "value" pixels backward (to the left)?
     * @param {Number} value
     */
    Character.prototype._moveBackward = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.moveBackward(value);
    };
    
    /**
     * Move Character of "value" pixels upward.
     * @param {Number} value
     */
    Character.prototype._moveUpward = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.moveUpward(value);
    };
    
    /**
     * Move Character of "value" pixels downward.
     * @param {Number} value
     */
    Character.prototype._moveDownward = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.moveDownward(value);
    };

    /**
     * Stops Character.
     */
    Character.prototype._stop = function() {
        this.gObject.stop();
    };

    /**
     * Build the new appearance of Character with
     * the datas loaded by _loadSkeleton.
     * @param {String} baseUrl
     * @param {String} elements     
     * @param {String} assets
     */
    Character.prototype.build = function(baseUrl, elements, assets) {
        var gObject = this.gObject;
        // destroy previous elements
        for (var i = 0; i < gObject.children.length; i++) {
            gObject.children[i].destroy();
        }
        var chest = null;
        var leftArm = null;
        var rightArm = null;
        var leftElement = null;
        var rightElement = null;
        var character = this;
        graphics.load(assets, function() {
            // Add elements to character
            for (var i = 0; i < elements.length; i++) {
                var val = elements[i];
                var element = new PartClass({asset: baseUrl + val['image'], name: val['name']});
                // Set center if defined
                if (typeof val['cx'] !== 'undefined') {
                    element.p.cx = val['cx'];
                }
                if (typeof val['cy'] !== 'undefined') {
                    element.p.cy = val['cy'];
                }
                // Set elements coordinates (relative to character)
                element.p.x = val['coordinateX'] + element.p.cx;
                element.p.y = val['coordinateY'] + element.p.cy;
                // Set collision if hand defined
                if (typeof val['hand'] !== 'undefined') {
                    var hand = val['hand'];
                    element.p.points = [[hand[0][0], hand[0][1]], [hand[0][0], hand[1][1]], [hand[1][0], hand[1][1]], [hand[1][0], hand[0][1]]];
                    // register collision handler
                    element.p.mayCatch = true;
                    element.on("hit", element, "objectEncountered");
                }
                graphics.insertObject(element, gObject);
                switch (val['name']) {
                    case 'leftArm' :
                        leftElement = element;
                        leftArm = element;
                        element.side = "left";
                        break;
                    case 'rightArm' :
                        rightElement = element;
                        rightArm = element;
                        element.side = "right";
                        break;
                    case 'leftLeg' :
                        leftElement = element;
                        element.side = "left";
                        break;
                    case 'rightLeg' :
                        rightElement = element;
                        element.side = "right";
                        break;
                    case 'chest' :
                        chest = element;
                        break;
                }
                element.startAnimation();
            }
            gObject.leftElement = leftElement;
            gObject.rightElement = rightElement;
            if (chest !== null) {
                chest.leftArm = leftArm;
                chest.rightArm = rightArm;
            }
            if (!gObject.p.initialized) {
                gObject.initialized();
            }
        });
    };

    /**
     * Called by _change. Loads the skeleton of the new appearance
     * of Character, then call build to create it.
     * @param {String} name
     */
    Character.prototype._loadSkeleton = function(name) {
        name = TUtils.getString(name);
        TEnvironment.log("loading skeleton");
        var baseImageUrl = this.getResource(name) + "/";
        var skeletonUrl = baseImageUrl + "skeleton.json";
        TEnvironment.log("Skeleton URL : " + skeletonUrl);
        var parent = this;
        var elements = new Array();
        var assets = new Array();
        TEnvironment.log("url : " + skeletonUrl);
        $.ajax({
            dataType: "json",
            url: skeletonUrl,
            async: false,
            success: function(data) {
                $.each(data['skeleton']['element'], function(key, val) {
                    elements.push(val);
                    assets.push(baseImageUrl + val['image']);
                });
                parent.build(baseImageUrl, elements, assets);
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(TUtils.format(parent.getMessage("unknwon skeleton"), name));
        });
    };

    /**
     * Change the appearance of Character.
     * @param {String} name
     */
    Character.prototype._change = function(name) {
        name = TUtils.getString(name);
        var simplifiedName = TUtils.removeAccents(name);
        this._loadSkeleton(this.getMessage(simplifiedName));
    };

    /**
     * Raise the Left Arm of "value" degrees.
     * @param {Number} value
     */
    Character.prototype._raiseLeftArm = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.raiseLeftArm(value);
    };
    
    /**
     * Raise the Right Arm of "value" degrees.
     * @param {Number} value
     */
    Character.prototype._raiseRightArm = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.raiseRightArm(value);
    };

    /**
     * Lower the Left Arm of "value" degrees.
     * @param {Number} value
     */
    Character.prototype._lowerLeftArm = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.lowerLeftArm(value);
    };

    /**
     * Lower the Right Arm of "value" degrees.
     * @param {Number} value
     */
    Character.prototype._lowerRightArm = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.lowerRightArm(value);
    };

    /**
     * Let Character catch an object, and trigger an associated command.
     * @param {String} object   Object that Character will be able to catch
     * @param {String} command  Command triggered if Character catch object
     */
    Character.prototype._mayCatch = function(object, command) {
        object = TUtils.getObject(object);
        command = TUtils.getCommand(command);
        var gObject = this.gObject;
        if (typeof object.getGObject === 'undefined') {
            throw new Error("wrong object type");
        }
        var catchableGObject = object.getGObject();
        gObject.mayCatch(catchableGObject, command);
    };

    //TEnvironment.internationalize(Character, true);

    return Character;
});
