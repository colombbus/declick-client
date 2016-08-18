define(['TObject', 'TUtils', 'TRuntime', 'CommandManager'], function (TObject, TUtils, TRuntime, CommandManager) {
    /**
     * Defines TGraphicalObject, inhetired from TObject.
     * It's an object which can be drawn on stage.
     * @exports TGraphicalObject
     */
    function TGraphicalObject() {
        this.gObject = new this.gClass();
        this.gObject.setTObject(this);
        this._setLocation(0, 0);
        TRuntime.addGraphicalObject(this);
    }

    TGraphicalObject.prototype = Object.create(TObject.prototype);
    TGraphicalObject.prototype.constructor = TGraphicalObject;
    TGraphicalObject.prototype.className = "TGraphicalObject";
    TGraphicalObject.prototype.objectPath = "tgraphicalobject";


    TGraphicalObject.TYPE_SPRITE = 0x0001;
    TGraphicalObject.TYPE_WALKER = 0x0002;
    TGraphicalObject.TYPE_HUMAN = 0x0004;
    TGraphicalObject.TYPE_TURTLE = 0x0008;
    TGraphicalObject.TYPE_BLOCK = 0x0010;
    TGraphicalObject.TYPE_PLATFORM = 0x0020;
    TGraphicalObject.TYPE_ITEM = 0x0040;
    TGraphicalObject.TYPE_CATCHABLE = 0x0080;
    TGraphicalObject.TYPE_SHAPE = 0x0100;
    TGraphicalObject.TYPE_INPUT = 0x0200;
    TGraphicalObject.TYPE_INACTIVE = 0x0400;

    var graphics = TRuntime.getGraphics();

    TGraphicalObject.prototype.graphics = graphics;

    TGraphicalObject.prototype.gClass = graphics.addClass("TGraphicalObject", {
        init: function (props, defaultProps) {
            this._super(TUtils.extend({
                designMode: false,
                initialized: false,
                w: 0,
                h: 0,
                clickHandled: false
            }, props), defaultProps);
            this.operations = new Array();
            this.clickCommands = new CommandManager();
            this.initialized(false);
            this.tOject = null;
        },
        designDrag: function (touch) {
            if (this.p.designMode) {
                this.p.dragging = true;
                this.p.x = touch.origX + touch.dx;
                this.p.y = touch.origY + touch.dy;
            }
        },
        designTouchEnd: function (touch) {
            if (this.p.designMode) {
                this.p.dragging = false;
                this.p.designCallback(this.p.x - this.p.w / 2, this.p.y - this.p.h / 2);
            }
        },
        perform: function (action, parameters) {
            if (this.p.initialized) {
                action.apply(this, parameters);
            } else {
                this.operations.push([action, parameters]);
            }
        },
        initialized: function (value) {
            if (typeof value === 'undefined') {
                value = true;
            }
            this.p.initialized = value;
            if (value) {
                this.step = this.constructor.prototype.step;
                this.draw = this.constructor.prototype.draw;
                while (this.operations.length > 0) {
                    var operation = this.operations.shift();
                    operation[0].apply(this, operation[1]);
                }
            } else {
                this.step = function(){};
                this.draw = function(){};
            }
            return value;
        },
        scale: function (scale) {
            this.perform(function (scale) {
                this.p.scale = scale * 1;
            }, [scale]);
        },
        zoomIn: function (scale) {
            this.perform(function (scale) {
                if (typeof this.p.scale === 'undefined') {
                    this.p.scale = 1;
                }
                this.p.scale = scale + this.p.scale;
            }, [scale]);
        },
        zoomOut: function (scale) {
            this.perform(function (scale) {
                if (typeof this.p.scale === 'undefined') {
                    this.p.scale = 1;
                }
                this.p.scale = -scale + this.p.scale;
            }, [scale]);
        },
        setAngle: function (angle) {
            this.perform(function (angle) {
                this.p.angle = angle;
            }, [angle]);
        },
        rotate: function (angle) {
            this.perform(function (angle) {
                this.p.angle = this.p.angle + angle;
            }, [angle]);
        },
        setLocation: function (x, y) {
            this.perform(function (x, y) {
                this.p.x = x + this.p.w / 2;
                this.p.y = y + this.p.h / 2;
            }, [x, y]);
        },
        getLocation: function () {
            return {x: Math.round(this.p.x - this.p.w / 2), y: Math.round(this.p.y - this.p.h / 2)};
        },
        getXCenter: function () {
            return Math.round(this.p.x);
        },
        getYCenter: function () {
            return Math.round(this.p.y);
        },
        getX: function () {
            return Math.round(this.p.x - this.p.w / 2);
        },
        getY: function () {
            return Math.round(this.p.y - this.p.h / 2);
        },
        getWidth: function () {
            return this.p.w;
        },
        getHeight: function () {
            return this.p.h;
        },
        setCenterLocation: function (x, y) {
            this.perform(function (x, y) {
                this.p.x = x;
                this.p.y = y;
            }, [x, y]);
        },
        freeze: function (value) {
            // to be implemented by subclasses
        },
        touch: function(event) {
            if (!this.p.designMode && !this.p.clickHandled) {
                this.clickCommands.executeCommands({x:event.x, y:event.y});
                this.p.clickHandled = true;
            }
        },
        touchEnd: function(event) {
            if (!this.p.designMode) {
                this.p.clickHandled = false;
            }
        },
        addClickCommand: function(command) {
            if (!this.clickCommands.hasCommands()) {
                // need to set touch and touchEnd listeners
                this.on("touch", this, "touch");
                this.on("touchEnd", this, "touchEnd");
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].on("touch", this, "touch");
                    this.children[i].on("touchEnd", this, "touchEnd");
                }
            }
            this.clickCommands.addCommand(command);
        },
        removeClickCommands: function() {
            this.clickCommands.removeCommands();
            // un-register listeners
            this.off("touch", this, "touch");
            this.off("touchEnd", this, "touchEnd");
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].off("touch", this, "touch");
                this.children[i].off("touchEnd", this, "touchEnd");
            }
        },
        setTObject: function(ref) {
            this.tObject = ref;
        },
        getTObject: function() {
            return this.tObject;
        }
    });

    TGraphicalObject.prototype.messages = null;

    TGraphicalObject.prototype.getGObject = function () {
        return this.gObject;
    };

    /**
     * Remove TGraphicalObject.
     */
    TGraphicalObject.prototype.deleteObject = function () {
        this.gObject.destroy();
        TRuntime.removeGraphicalObject(this);
    };

    /**
     * Enlarge TGraphicalobject on screen.
     * The enlargement will be proportionnal to the parameter given.
     * @param {Number} factor
     */
    TGraphicalObject.prototype._zoomIn = function (factor) {
        this.gObject.zoomIn(factor);
    };

    /**
     * Narrow TGraphicalobject on screen.
     * The narrowing will be proportionnal to the parameter given.
     * @param {Number} factor
     */
    TGraphicalObject.prototype._zoomOut = function (factor) {
        this.gObject.zoomOut(factor);
    };

    /**
     * Change the size of TGraphicalObject, regardless on its previous size.
     * The higher "factor" will be, the larger TGraphicalObject will be.
     * @param {Number} factor
     */
    TGraphicalObject.prototype._scale = function (factor) {
        //TODO: parseFloat
        this.gObject.scale(factor);
    };

    /**
     * Set an angle of rotation for TGraphicalObject, regarless of its previous.
     * @param {Number} angle
     */
    TGraphicalObject.prototype._setAngle = function (angle) {
        this.gObject.setAngle(angle);
    };

    /**
     * Rotate TGraphicalObject. Add the parameter to its current angle.
     * @param {Number} angle
     */
    TGraphicalObject.prototype._rotate = function (angle) {
        //TODO: parseFloat
        this.gObject.rotate(angle);
    };

    /**
     * Set the coordinates of TGraphicalObject's center pixel.
     * @param {Number} x
     * @param {Number} y
     */
    TGraphicalObject.prototype._setCenterLocation = function (x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.setCenterLocation(x, y);
    };

    /**
     * Set the coordinates of TGraphicalObject's top-left pixel.
     * @param {Number} x
     * @param {Number} y
     */
    TGraphicalObject.prototype._setLocation = function (x, y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this.gObject.setLocation(x, y);
    };

    /**
     * Get the X coordinate of TGraphicalObject's center pixel.
     * @returns {Number}
     */
    TGraphicalObject.prototype._getXCenter = function () {
        return this.gObject.getXCenter();
    };

    /**
     * Get the Y coordinate of TGraphicalObject's center pixel.
     * @returns {Number}
     */
    TGraphicalObject.prototype._getYCenter = function () {
        return this.gObject.getYCenter();
    };

    /**
     * Get the X coordinate of TGraphicalObject's top-left pixel.
     * @returns {Number}
     */
    TGraphicalObject.prototype._getX = function () {
        return this.gObject.getX();
    };

    /**
     * Get the Y coordinate of TGraphicalObject's top-left pixel.
     * @returns {Number}
     */
    TGraphicalObject.prototype._getY = function () {
        return this.gObject.getY();
    };

    /**
     * Enable or disable Design Mode.
     * In Design Mode, user can handle objects with the mouse and move them.
     * @param {Boolean} value
     */
    TGraphicalObject.prototype.setDesignMode = function (value) {
        var gObject = this.gObject;
        if (value) {
            gObject.on("drag", gObject, "designDrag");
            gObject.on("touchEnd", gObject, "designTouchEnd");
            for (var i = 0; i < gObject.children.length; i++) {
                gObject.children[i].on("drag", gObject, "designDrag");
                gObject.children[i].on("touchEnd", gObject, "designTouchEnd");
            }
            var self = this;
            gObject.p.designCallback = function (x, y) {
                require(["TUI"], function (TUI) {
                    TUI.recordObjectLocation(self, {x: Math.round(x), y: Math.round(y)});
                });
            };
            gObject.p.designMode = true;
        } else {
            gObject.off("drag", gObject, "designDrag");
            gObject.off("touchEnd", gObject, "designTouchEnd");
            for (var i = 0; i < gObject.children.length; i++) {
                gObject.children[i].off("drag", gObject, "designDrag");
                gObject.children[i].off("touchEnd", gObject, "designTouchEnd");
            }
            gObject.p.designCallback = null;
            gObject.p.designMode = false;
        }
    };

    /**
     * Freeze or unfreeze TGraphicalObject.
     * @param {Boolean} value
     */
    TGraphicalObject.prototype.freeze = function (value) {
        this.gObject.freeze(value);
    };

    /**
     * Get a String containing "TGraphicalObject " and the class of the object.
     * @returns {String}
     */
    TGraphicalObject.prototype.toString = function () {
        return "TGraphicalObject " + this.className;
    };

    /**
     * Hide TGraphicalObject.
     */
    TGraphicalObject.prototype._hide = function () {
        this.gObject.p.hidden = true;
    };

    /**
     * Show TGraphicalObject.
     */
    TGraphicalObject.prototype._show = function () {
        this.gObject.p.hidden = false;
    };

    /**
     * Add command that will be executed when object is clicked.
     * @param {(string|function}} command to be added
     */
    TGraphicalObject.prototype._ifClick = function (command) {
        command = TUtils.getCommand(command);
        this.gObject.addClickCommand(command);
    };


    /**
     * Remove all commands associated to click.
     */
    TGraphicalObject.prototype._removeClickCommands = function() {
        this.gObject.removeClickCommands();
    };

    /**
     * GetWidth TGraphicalObject.
     */
    TGraphicalObject.prototype._getWidth = function () {
        return this.gObject.getWidth();
    };

    /**
     * GetHeight TGraphicalObject.
     */
    TGraphicalObject.prototype._getHeight = function () {
        return this.gObject.getHeight();
    };

    return TGraphicalObject;
});
