define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'objects/walker/Walker', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, Walker, TUtils) {
    /**
     * Defines Hero, inherited from Walker.
     * It has predefined appearances, is animated when it moves,
     * can walk in a Scene and catch objects.
     * @param {String} name Hero's name
     * @exports Hero
     */
    var Hero = function(name) {
        Walker.call(this);
        if (typeof (name) === 'undefined') {
            name = "tangy";
        }
        this.translatedForward = this.getMessage("forward");
        this.translatedBackward = this.getMessage("backward");
        this.translatedFront = this.getMessage("front");
        this.custom = false;
        this._setCharacter(name);

    };
    // TODO: use Quintus animations

    Hero.prototype = Object.create(Walker.prototype);
    Hero.prototype.constructor = Hero;
    Hero.prototype.className = "Hero";

    var graphics = Hero.prototype.graphics;

    Hero.prototype.gClass = graphics.addClass("TWalker", "THero", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                dtMovement: 1,
                dtPause: 1,
                imgIndex: 0,
                lastX: 0,
                lastMove: Hero.DIRECTION_NONE,
                frontAssetsCount: 0,
                forwardAssetsCount: 0,
                backwardAssetsCount: 0,
                defaultAssetsCount: 0,
                durationMove: 1,
                durationPause: 1,
                ellapsed: 0.0,
                autoAsset: true
            }, props), defaultProps);
            this.frontAssets = [];
            this.forwardAssets = [];
            this.backwardAssets = [];
            this.defaultAssets = [];
            this.assetOperations = [];
            this.catchableObjects = {};
        },
        step: function(dt) {
            this._super(dt);
            var p = this.p;
            dt += p.ellapsed;
            this.performAssetOperations();
            var deltaX = Math.round(p.x - p.lastX);
            if (p.autoAsset && !p.dragging && !p.frozen) {
                if (p.moving && deltaX !== 0) {
                    // we are moving
                    if (dt > p.dtMovement) {
                        p.ellapsed = 0;
                        // display next image
                        if (deltaX > 0) {
                            // moving right
                            if (p.forwardAssetsCount > 0) {
                                if (p.lastMove === Sprite.DIRECTION_RIGHT) {
                                    p.imgIndex = (p.imgIndex + Math.round(dt / p.dtMovement)) % p.forwardAssetsCount;
                                } else {
                                    // direction changed
                                    p.imgIndex = 0;
                                }
                                p.asset = this.forwardAssets[p.imgIndex];
                                p.lastMove = Sprite.DIRECTION_RIGHT;
                            } else if (p.defaultAssetsCount > 0) {
                                p.imgIndex = (p.imgIndex + Math.round(dt / p.dtMovement)) % p.defaultAssetsCount;
                                p.asset = this.defaultAssets[p.imgIndex];
                            }
                        } else {
                            // moving left
                            if (p.backwardAssetsCount > 0) {
                                if (p.lastMove === Sprite.DIRECTION_LEFT) {
                                    p.imgIndex = (p.imgIndex + Math.round(dt / p.dtMovement)) % p.backwardAssetsCount;
                                } else {
                                    // direction changed
                                    p.imgIndex = 0;
                                }
                                p.asset = this.backwardAssets[p.imgIndex];
                                p.lastMove = Sprite.DIRECTION_LEFT;
                            } else if (p.defaultAssetsCount > 0) {
                                p.imgIndex = (p.imgIndex + Math.round(dt / p.dtMovement)) % p.defaultAssetsCount;
                                p.asset = this.defaultAssets[p.imgIndex];
                            }
                        }
                    } else {
                        p.ellapsed = dt;
                    }
                } else if (p.initialized) {
                    // not moving forward nor backward
                    if (dt > p.dtPause) {
                        p.ellapsed = 0;
                        if (p.frontAssetsCount > 0) {
                            if (p.lastMove === Sprite.DIRECTION_NONE) {
                                p.imgIndex = (p.imgIndex + Math.round(dt / p.dtPause)) % p.frontAssetsCount;
                            } else {
                                // direction changed
                                p.imgIndex = 0;
                            }
                            p.asset = this.frontAssets[p.imgIndex];
                            p.lastMove = Sprite.DIRECTION_NONE;
                        } else if (p.defaultAssetsCount > 0) {
                            p.imgIndex = (p.imgIndex + Math.round(dt / p.dtPause)) % p.defaultAssetsCount;
                            p.asset = this.defaultAssets[p.imgIndex];
                        }
                    } else {
                        p.ellapsed = dt;
                    }
                }
                p.lastX = p.x;
            }
        },
        setForwardAssets: function(assets) {
            this.addAssetOperation(function(assets) {
                this.forwardAssets = assets;
                this.p.forwardAssetsCount = assets.length;
            }, [assets], assets);
        },
        addForwardAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                this.forwardAssets.push(asset);
                this.p.forwardAssetsCount++;
            }, [asset], asset);
        },
        removeForwardAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                var index = this.forwardAssets.indexOf(asset);
                if (index > -1) {
                    this.forwardAssets.splice(index, 1);
                    this.p.forwardAssetsCount--;
                }
            }, [asset]);
        },
        removeForwardAssets: function() {
            this.addAssetOperation(function() {
                this.forwardAssets = [];
                this.p.forwardAssetsCount = 0;
            }, []);
        },
        setBackwardAssets: function(assets) {
            this.addAssetOperation(function(assets) {
                this.backwardAssets = assets;
                this.p.backwardAssetsCount = assets.length;
            }, [assets], assets);
        },
        addBackwardAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                this.backwardAssets.push(asset);
                this.p.backwardAssetsCount++;
            }, [asset], asset);
        },
        removeBackwardAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                var index = this.backwardAssets.indexOf(asset);
                if (index > -1) {
                    this.backwardAssets.splice(index, 1);
                    this.p.backwardAssetsCount--;
                }
            }, [asset]);
        },
        removeBackwardAssets: function() {
            this.addAssetOperation(function() {
                this.backwardAssets = [];
                this.p.backwardAssetsCount = 0;
            }, []);
        },
        setFrontAssets: function(assets) {
            this.addAssetOperation(function(value) {
                this.frontAssets = value;
                this.p.frontAssetsCount = value.length;
            }, [assets], assets);
        },
        addFrontAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                this.frontAssets.push(asset);
                this.p.frontAssetsCount++;
            }, [asset], asset);
        },
        removeFrontAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                var index = this.frontAssets.indexOf(asset);
                if (index > -1) {
                    this.frontAssets.splice(index, 1);
                    this.p.frontAssetsCount--;
                }
            }, [asset]);
        },
        removeFrontAssets: function() {
            this.addAssetOperation(function() {
                this.frontAssets = [];
                this.p.frontAssetsCount = 0;
            }, []);
        },
        setDefaultAssets: function(assets) {
            this.addAssetOperation(function(value) {
                this.defaultAssets = value;
                this.p.defaultAssetsCount = value.length;
            }, [assets], assets);
        },
        addDefaultAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                this.defaultAssets.push(asset);
                this.p.defaultAssetsCount++;
            }, [asset], asset);
        },
        removeDefaultAsset: function(asset) {
            this.addAssetOperation(function(asset) {
                var index = this.defaultAssets.indexOf(asset);
                if (index > -1) {
                    this.defaultAssets.splice(index, 1);
                    this.p.defaultAssetsCount--;
                }
            }, [asset]);
        },
        removeDefaultAssets: function() {
            this.addAssetOperation(function() {
                this.defaultAssets = [];
                this.p.defaultAssetsCount = 0;
            }, []);
        },
        setVelocity: function(value) {
            this._super(value);
            // compute base dt
            this.computeDts();
        },
        setDurations: function(valueMove, valuePause) {
            this.p.durationMove = valueMove;
            this.p.durationPause = valuePause;
            this.computeDts();
        },
        setMovementDuration: function(value) {
            this.p.durationMove = value;
            this.computeDts();
        },
        setPauseDuration: function(value) {
            this.p.durationPause = value;
            this.computeDts();
        },
        computeDts: function() {
            this.addAssetOperation(function() {
                var p = this.p;
                if (p.forwardAssetsCount > 0) {
                    // we assume that forwardAssetsCount is equal to backwardAssetsCount
                    p.dtMovement = (p.durationMove / p.forwardAssetsCount) * 200 / p.speed;
                } else if (p.defaultAssetsCount > 0) {
                    // we assume that forwardAssetsCount is equal to backwardAssetsCount
                    p.dtMovement = (p.durationMove / p.defaultAssetsCount) * 200 / p.speed;
                }
                if (p.frontAssetsCount > 0) {
                    p.dtPause = (p.durationPause / p.frontAssetsCount) * 200 / p.speed;
                } else if (p.defaultAssetsCount > 0) {
                    // we assume that forwardAssetsCount is equal to backwardAssetsCount
                    p.dtPause = (p.durationPause / p.defaultAssetsCount) * 200 / p.speed;
                }
            }, []);
        },
        addAssetOperation: function(action, parameters, asset) {
            if (typeof asset === 'undefined') {
                this.assetOperations.push([action, parameters]);
            } else {
                this.assetOperations.push([action, parameters, asset]);
            }

        },
        performAssetOperations: function() {
            while (this.assetOperations.length > 0) {
                var operation = this.assetOperations[0];
                var test = true;
                if (operation.length > 2) {
                    // This operation require a test on assets first
                    var asset = operation[2];
                    if (asset instanceof Array) {
                        // several assets have to be checked
                        for (var i = 0; i < asset.length; i++) {
                            if (!this.resources.ready(asset[i])) {
                                // one of the assets is not loaded yet
                                test = false;
                                break;
                            }
                        }
                    } else if (!this.resources.ready(asset)) {
                        // only one asset has to be checked: not loaded
                        test = false;
                    }
                }
                if (!test) {
                    // Assets are missing: we break here
                    break;
                }
                this.assetOperations.shift();
                operation[0].apply(this, operation[1]);
            }
        },
        stopAutoAsset: function() {
            this.p.autoAsset = false;
        },
        startAutoAsset: function() {
            this.p.autoAsset = true;
        },
        mayCatch: function(object) {
            var id = object.getgObject().getId();
            if (typeof (this.catchableObjects[id]) === 'undefined') {
                this.catchableObjects[id] = object;
            }
        },
        objectEncountered: function(col) {
            this._super(col);
            var object = col.obj;
            if (typeof object.getId !== 'undefined') {
                var id = object.getId();
                if (typeof (this.catchableObjects[id]) !== 'undefined') {
                    this.catchableObjects[id]._delete();
                }
            }
        }


    });

    /**
     * Creates a new hero, and add it in resource.
     * @param {String} name Hero's name
     */
    Hero.prototype._setCharacter = function(name) {
        name = TUtils.getString(name);
        name = this.getMessage(name);
        var baseCharacterUrl = this.getResource(name) + "/";
        var configUrl = baseCharacterUrl + "config.json";
        var parent = this;
        $.ajax({
            dataType: "json",
            url: configUrl,
            async: false,
            success: function(data) {
                parent.gObject.p.initialized = false;
                var currentLocation = parent.gObject.getLocation();
                var frontImages = data['images']['front'];
                var frontAssets = [];
                try {
                    parent._removeImageSet(parent.translatedFront);
                } catch (e) {
                }
                for (var i = 0; i < frontImages.length; i++) {
                    var imageName = name + "/" + frontImages[i];
                    parent.addImage(imageName, parent.translatedFront, false);
                    frontAssets.push(imageName);
                }
                parent.gObject.setFrontAssets(frontAssets);
                var forwardImages = data['images']['forward'];
                var forwardAssets = [];
                try {
                    parent._removeImageSet(parent.translatedForward);
                } catch (e) {
                }
                for (var i = 0; i < forwardImages.length; i++) {
                    var imageName = name + "/" + forwardImages[i];
                    parent.addImage(imageName, parent.translatedForward, false);
                    forwardAssets.push(imageName);
                }
                parent.gObject.setForwardAssets(forwardAssets);
                var backwardImages = data['images']['backward'];
                var backwardAssets = [];
                try {
                    parent._removeImageSet(parent.translatedBackward);
                } catch (e) {
                }
                for (var i = 0; i < backwardImages.length; i++) {
                    var imageName = name + "/" + backwardImages[i];
                    parent.addImage(imageName, parent.translatedBackward, false);
                    backwardAssets.push(imageName);
                }
                parent.gObject.setBackwardAssets(backwardAssets);
                // remove default imageSet
                try {
                    parent._removeImageSet("");
                } catch (e) {
                }
                parent.gObject.removeDefaultAssets();
                parent._displayNextImage(parent.translatedFront);
                parent.gObject.setLocation(currentLocation.x, currentLocation.y);
                parent.gObject.setDurations(data['durationMove'], data['durationPause']);
                parent.custom = false;
            }
        }).fail(function(jqxhr, textStatus, error) {
            throw new Error(TUtils.format(parent.getMessage("unknown character"), name));
        });

    };

    /**
     * Checks if 'set' is in predefined strings. 
     * Is used to find correct image to add / remove.
     * @param {String} set  String which can be predefined
     * @returns {String}    Returns a corresponding string if found,
     * else returns "default".
     */
    Hero.prototype.checkSet = function(set) {
        var specialSet = false;
        if (typeof set !== 'undefined') {
            set = TUtils.getString(set);
            if (set === this.translatedFront) {
                specialSet = "front";
            } else if (set === this.translatedBackward) {
                specialSet = "backward";
            } else if (set === this.translatedForward) {
                specialSet = "forward";
            } else if (set === "") {
                specialSet = "default";
            }
        } else {
            specialSet = "default";
        }
        return specialSet;
    };

    /**
     * Add a customized image for the Hero. Removes default asset if existing.
     * @param {String} name
     * @param {String} set
     */
    Hero.prototype._addImage = function(name, set) {
        var specialSet = this.checkSet(set);
        var currentLocation = false;
        if (!this.custom && specialSet !== false) {
            // We begin to customize: we remove default sets
            try {
                this._removeImageSet(this.translatedFront);
            } catch (e) {
            }
            try {
                this._removeImageSet(this.translatedForward);
            } catch (e) {
            }
            try {
                this._removeImageSet(this.translatedBackward);
            } catch (e) {
            }
            try {
                this._removeImageSet("");
            } catch (e) {
            }
            currentLocation = this.gObject.getLocation();
        }
        this.addImage(name, set, true);
        if (specialSet !== false) {
            switch (specialSet) {
                case "front":
                    this.gObject.addFrontAsset(name);
                    break;
                case "backward":
                    this.gObject.addBackwardAsset(name);
                    break;
                case "forward":
                    this.gObject.addForwardAsset(name);
                    break;
                case "default":
                    this.gObject.addDefaultAsset(name);
                    break;
            }
            this.gObject.computeDts();
            if (!this.custom) {
                this.custom = true;
                this.gObject.p.initialized = false;
                this._displayNextImage(set);
                if (currentLocation !== false) {
                    this.gObject.setLocation(currentLocation.x, currentLocation.y);
                }
            }
        }
    };

    /**
     * Set AutoAsset to false.
     */
    Hero.prototype._stopAutoAsset = function() {
        this.gObject.stopAutoAsset();
    };

    /**
     * Set AutoAsset to true.
     */
    Hero.prototype._startAutoAsset = function() {
        this.gObject.startAutoAsset();
    };

    /**
     * Removes a customized image.
     * @param {String} name
     * @param {String} set
     */
    Hero.prototype._removeImage = function(name, set) {
        var specialSet = this.checkSet(set);
        var asset = this.removeImage(name, set);
        if (specialSet !== false) {
            switch (specialSet) {
                case "front":
                    this.gObject.removeFrontAsset(asset);
                    break;
                case "backward":
                    this.gObject.removeBackwardAsset(asset);
                    break;
                case "forward":
                    this.gObject.removeForwardAsset(asset);
                    break;
                case "default":
                    this.gObject.removeDefaultAsset(asset);
                    break;
            }
            this.gObject.computeDts();
        }
    };

    /**
     * Removes a complete set of images.
     * @param {String} name
     */
    Hero.prototype._removeImageSet = function(name) {
        var specialSet = this.checkSet(name);
        Sprite.prototype._removeImageSet.call(this, name);
        if (specialSet !== false) {
            switch (specialSet) {
                case "front":
                    this.gObject.removeFrontAssets();
                    break;
                case "backward":
                    this.gObject.removeBackwardAssets();
                    break;
                case "forward":
                    this.gObject.removeForwardAssets();
                    break;
                case "default":
                    this.gObject.removeDefaultAssets();
                    break;
            }
            this.gObject.computeDts();
        }
    };
    
    /**
     * Set the Movement Duration to "value".
     * @param {Number} value
     */
    Hero.prototype._setMovementDuration = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.setMovementDuration(value / 1000);
    };

    /**
     * Set the Pause Duration to the "value".
     * @param {Number} value
     */
    Hero.prototype._setPauseDuration = function(value) {
        value = TUtils.getInteger(value);
        this.gObject.setPauseDuration(value / 1000);
    };

    /**
     * Associate a Scene to Hero.
     * @param {Scene} object
     */
    Hero.prototype._addScene = function(object) {
        this._addBlock(object);
    };

    /**
     * Let Hero catch the object entered in parameter.
     * @param {Object} object
     */
    Hero.prototype._mayCatch = function(object) {
        object = TUtils.getObject(object);
        this.gObject.mayCatch(object);
    };

    /**
     * Execute command if Hero catch the object.
     * @param {Object} object
     * @param {String} command  Command triggered if Hero catch object
     */
    Hero.prototype._ifCatch = function(object, command) {
        object = TUtils.getObject(object);
        command = TUtils.getString(command);
        this.gObject.mayCatch(object);
        this.gObject.addCollisionCommand(command, object);
    };

    return Hero;
});
