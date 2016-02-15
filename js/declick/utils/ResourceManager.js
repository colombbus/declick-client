define(['TRuntimeProxy'], function(TRuntime) {
    /**
     * ResourceManager defines several functions to manage resources :
     * it allows to create one, get its datas, make transparency, delete it...
     * @exports ResourceManager
     */
    var ResourceManager = function() {
        this.resources = {};
        this.transparent = false;
        this.transparentColors = [];
        this.loadingCallbacks = {};
    };

    var graphics = TRuntime.getGraphics();
    ResourceManager.STATE_LOADING = 0;
    ResourceManager.STATE_COMPUTING = 1;
    ResourceManager.STATE_READY = 2;

    ResourceManager.waitingForImage = {};

    /**
     * Create a new resource.
     * @param {Number} state
     * @param {Asset} resource
     * @param {Boolean} update
     * @returns {Object.<Number, Asset, Boolean, Boolean>}  Returns the
     * created resource.
     */
    getNewResource = function(state, resource, update) {
        if (typeof state === "undefined") {
            state = ResourceManager.STATE_LOADING;
        }
        if (typeof resource === 'undefined') {
            resource = {};
        }
        if (typeof update === 'undefined') {
            update = false;
        }
        return {'state': state, 'resource': resource, 'update': update, 'delete': false};
    };

    /**
     * Check if two colors are akin.
     * @param {Number[]} color
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     * @returns {Boolean} Returns true if colors are akin, else false.
     */
    colorMatch = function(color, red, green, blue) {
        return Math.abs(color[0] - red) + Math.abs(color[1] - green) + Math.abs(color[2] - blue) < 30;
    };

    /**
     * Add a new resource.
     * @param {String} name
     * @param {String} asset
     * @param {String} callback
     * @returns {Boolean}   Returns true.
     */
    ResourceManager.prototype.add = function(name, asset, callback) {
        if (typeof this.resources[name] !== 'undefined') {
            // resource already added: call callback right now
            if (typeof callback !== 'undefined') {
                callback.call(this);
            }
        }
        this.resources[name] = getNewResource();

        var manager = this;

        var loadingCallback = function() {
            if (!manager.gc(name)) {
                manager.resources[name]['resource'] = graphics.getAsset(asset);
                if (manager.transparent) {
                    manager.addTransparency(name, callback);
                } else {
                    manager.resources[name]['state'] = ResourceManager.STATE_READY;
                    if (typeof callback !== 'undefined') {
                        callback.call(manager);
                    }
                }
            }
        };

        if (graphics.getAsset(asset)) {
            // already loaded
            loadingCallback.call(this);
        } else {
            // we need to load asset
            if (typeof ResourceManager.waitingForImage[name] === 'undefined') {
                // we are the first to load this image
                ResourceManager.waitingForImage[name] = [];
                ResourceManager.waitingForImage[name].push(loadingCallback);
                graphics.load(asset, function() {
                    var callbacks = ResourceManager.waitingForImage[name];
                    for (var i = 0; i < callbacks.length; i++) {
                        callbacks[i].call(manager);
                    }
                    delete ResourceManager.waitingForImage[name];
                });
            } else {
                // image is already loading
                ResourceManager.waitingForImage[name].push(loadingCallback);
            }
        }
        return true;
    };

    /**
     * Make a color transparent.
     * Closes shades will also be transparent (cf. colorMatch).
     * @param {Number[]} color
     * @param {Function} callback
     */
    ResourceManager.prototype.addTransparentColor = function(color, callback) {
        this.transparentColors.push(color);
        this.transparent = true;
        for (var name in this.resources) {
            if (this.resources.hasOwnProperty(name)) {
                if (this.resources[name]['state'] === ResourceManager.STATE_READY) {
                    this.addTransparency(name, callback);
                } else {
                    // update will be required when loading complete
                    this.resources[name]['update'] = true;
                }

            }
        }
    };

    /**
     * Make transparency on image "name".
     * @param {String} name
     * @param {Function} callback
     */
    ResourceManager.prototype.addTransparency = function(name, callback) {
        this.resources[name]['state'] = ResourceManager.STATE_COMPUTING;
        this.resources[name]['update'] = false;
        var oldImage = this.resources[name]['resource'];
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var width = oldImage.width;
        var height = oldImage.height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(oldImage, 0, 0);
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        var color;
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            for (var j = 0; j < this.transparentColors.length; j++) {
                color = this.transparentColors[j];
                if (colorMatch(color, r, g, b)) {
                    data[i + 3] = 0;
                    break;
                }
            }
        }
        imageData.data = data;
        ctx.putImageData(imageData, 0, 0);
        var newImage = new Image();
        var manager = this;
        newImage.onload = function() {
            if (!manager.gc(name)) {
                if (manager.resources[name]['update']) {
                    // update required: add transparency again
                    manager.resources[name]['update'] = false;
                    manager.addTransparency(name, callback);
                } else {
                    manager.resources[name]['resource'] = newImage;
                    manager.resources[name]['state'] = ResourceManager.STATE_READY;
                    if (typeof callback !== 'undefined') {
                        callback.call(manager, name);
                    }
                }
            }
        };
        // start loading
        newImage.src = canvas.toDataURL();
    };

    /**
     * Get the state of "name".
     * @param {String} name
     * @returns {Number|Boolean}    Returns the state, or false if undefined.
     */
    ResourceManager.prototype.getState = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        return this.resources[name]['state'];
    };

    /**
     * Check if "name" is ready.
     * @param {String} name
     * @returns {Boolean}
     */
    ResourceManager.prototype.ready = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        return (this.resources[name]['state'] === ResourceManager.STATE_READY);
    };

    /**
     * Get the resource of "name".
     * @param {String} name
     * @returns {Resource|Boolean}  Returns the resource, or false if name is
     * undefined or not ready.
     */
    ResourceManager.prototype.get = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        if (this.resources[name]['state'] !== ResourceManager.STATE_READY) {
            return false;
        }
        return this.resources[name]['resource'];
    };

    /**
     * Same than get.
     * @param {type} name
     * @returns {Resource|Boolean}
     */
    ResourceManager.prototype.getUnchecked = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        if (this.resources[name]['state'] !== ResourceManager.STATE_READY) {
            return false;
        }
        return this.resources[name]['resource'];
    };

    /**
     * Set the 'delete' field of "name" to true.
     * @param {String} name
     * @returns {Boolean}   Return false in name is undefined.
     */
    ResourceManager.prototype.remove = function(name) {
        if (typeof this.resources[name] === 'undefined') {
            return false;
        }
        if (this.resources[name]['state'] === ResourceManager.STATE_READY) {
            delete this.resources[name];
        } else {
            this.resources[name]['delete'] = true;
        }
    };

    /**
     * Delete "name" if its 'delete' field is at true.
     * @param {String} name
     * @returns {Boolean}   Return true if the resource is deleted, else false.
     */
    ResourceManager.prototype.gc = function(name) {
        if (this.resources[name]['delete']) {
            delete this.resources[name];
            return true;
        }
        return false;
    };

    /**
     * Check if "name" exists.
     * @param {String} name
     * @returns {Boolean}
     */
    ResourceManager.prototype.has = function(name) {
        return (typeof this.resources[name] !== 'undefined');
    };


    return ResourceManager;
});
