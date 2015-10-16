define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'objects/block/Block', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Block, TUtils) {
    /**
     * Defines Scene, inherited from Block.
     * It has a background image and a Block image.
     * Scene can be linked to Hero.
     * @param {String} name Scene's name
     * @exports Scene
     */
    var Scene = function(name) {
        Block.call(this);
        if (typeof (name) === 'undefined') {
            name = "nature";
        }
        this.backgroundName = "";
        this.blockName = "";
        this._setScene(name);
    };

    Scene.prototype = Object.create(Block.prototype);
    Scene.prototype.constructor = Scene;
    Scene.prototype.className = "Scene";

    var graphics = Scene.prototype.graphics;

    Scene.prototype.gClass = graphics.addClass("TBlock", "TScene", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                assetBlock: null,
                showBlock: false
            }, props), defaultProps);
        },
        draw: function(ctx) {
            this._super(ctx);
            var p = this.p;
            if (p.showBlock && p.assetBlock) {
                ctx.drawImage(this.resources.getUnchecked(p.assetBlock), -p.cx, -p.cy);
            }
        },
        setBackground: function(asset) {
            var oldW = this.p.w;
            var oldH = this.p.h;
            this.p.asset = asset;
            // resize only for background
            graphics.objectResized(this);
            this.p.x += (this.p.w - oldW) / 2;
            this.p.y += (this.p.h - oldH) / 2;
            this.p.destinationX = this.p.x;
            this.p.destinationY = this.p.y;
            if (!this.p.initialized && this.p.assetBlock) {
                this.initialized();
            }
        },
        setBlock: function(asset) {
            this.p.assetBlock = asset;
            if (!this.p.initialized && this.p.asset) {
                this.initialized();
            }
        },
        setBlockDisplayed: function(value) {
            this.p.showBlock = value;
        },
        reinit: function() {
            this.p.initialized = false;
            this.p.asset = null;
            this.p.assetBlock = null;
        },
        removeBlock: function() {
            this.p.initialized = false;
            this.p.assetBlock = null;
        },
        removeBackground: function() {
            this.p.initialized = false;
            this.p.asset = null;
        }
    });

    /**
     * Creates Scene.
     * Loads background and set it.
     * Loads Block image, execute a transparency mask on it and set the result.
     * @param {String} name Scene's name
     */
    Scene.prototype._setScene = function(name) {
        name = TUtils.getString(name);
        name = this.getMessage(name);
        var baseSceneUrl = this.getResource(name) + "/";
        var configUrl = baseSceneUrl + "config.json";
        var parent = this;
        $.ajax({
            dataType: "json",
            url: configUrl,
            async: false,
            success: function(data) {
                var backImage = data['images']['background'];
                var blockImage = data['images']['block'];
                try {
                    parent._removeImageSet("elements");
                } catch (e) {
                }
                parent.gObject.reinit();
                var backgroundName = name + "/" + backImage;
                parent.backgroundName = backgroundName;
                var blockName = name + "/" + blockImage;
                parent.blockName = blockName;
                parent.addImage(backgroundName, "elements", false, function() {
                    // background may have changed during loading
                    if (parent.backgroundName === backgroundName) {
                        parent.gObject.setBackground(backgroundName);
                    }
                });
                parent.addImage(blockName, "elements", false, function() {
                    // block may have changed during loading
                    if (parent.blockName === blockName) {
                        parent.computeTransparencyMask(blockName);
                        parent.gObject.setBlock(blockName);
                    }
                });
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(TUtils.format(parent.getMessage("unknown character"), name));
        });
    };

    /**
     * Display the Block image.
     */
    Scene.prototype._showBlock = function() {
        this.gObject.setBlockDisplayed(true);
    };

    /**
     * Hide the block image.
     */
    Scene.prototype._hideBlock = function() {
        this.gObject.setBlockDisplayed(false);
    };

    /**
     * Remove the current background if existing and set a new one.
     * @param {String} name
     */
    Scene.prototype._setBackground = function(name) {
        name = TUtils.getString(name);
        try {
            this.removeImage(this.backgroundName);
        } catch (e) {
        }
        this.backgroundName = name;
        var sceneObject = this;
        var gObject = this.gObject;
        gObject.removeBackground();
        this.addImage(name, "elements", true, function() {
            if (name === sceneObject.backgroundName) {
                gObject.setBackground(name);
            }
        });
    };

    /**
     * Remove the current Block image if existing and set a new one.
     * @param {String} name
     */
    Scene.prototype._setBlock = function(name) {
        name = TUtils.getString(name);
        try {
            this.removeImage(this.blockName);
        } catch (e) {
        }
        this.blockName = name;
        var sceneObject = this;
        var gObject = this.gObject;
        gObject.removeBlock();
        this.addImage(name, "elements", true, function() {
            if (name === sceneObject.blockName) {
                sceneObject.computeTransparencyMask(name);
                gObject.setBlock(name);
            }
        });
    };

    /**
     * Execute a Transparency Mask on Block image and Background,
     * and set the created images as news Block image and Background.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Scene.prototype._setTransparent = function(red, green, blue) {
        if (this.resources.has(this.blockName)) {
            this.gObject.removeBlock();
        }
        if (this.resources.has(this.backgroundName)) {
            this.gObject.removeBackground();
        }
        var parent = this;
        Sprite.prototype.setTransparent.call(this, red, green, blue, function(name) {
            if (name === parent.blockName) {
                parent.computeTransparencyMask(name);
                parent.gObject.setBlock(name);
            }
            if (name === parent.backgroundName) {
                parent.gObject.setBackground(name);
            }
        });
    };

    return Scene;
});


