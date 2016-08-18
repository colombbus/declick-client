define(['TObject', 'TUtils', 'TRuntime', 'TEnvironment'], function(TObject, TUtils, TRuntime, TEnvironment) {
    /**
     * I'm making sounds right now. /o/
     * @exports Sound
     */
    var Sound = function(name) {
        TObject.call(this, name);

        this.sounds = new Array();
        this.soundSets = new Array();
        this.loop = false;
        if (typeof name === 'string') {
            this._addSound(name);
        }
    };
    Sound.prototype = Object.create(TObject.prototype);
    Sound.prototype.constructor = Sound;
    Sound.prototype.className = "Sound";

    var graphics = TRuntime.getGraphics();

    /**
     * Add a new sound.
     * If "project" is at true, loads it from the project,
     * else loads it from the object.
     * @param {String} name
     * @param {String} set
     * @param {boolean} project
     * @returns {asset}
     */
    Sound.prototype.addSound = function(name, set, project) {
        name = TUtils.getString(name);
        var asset;
        // add sound only if not already added
        if (typeof this.sounds[name] === 'undefined') {
            try {
                if (project) {
                    // asset from project
                    asset = TEnvironment.getProjectResource(name);
                } else {
                    // asset from object itself
                    asset = this.getResource(name);
                }
                this.sounds[name] = asset;
                if (typeof set === 'undefined') {
                    set = "";
                } else {
                    set = TUtils.getString(set);
                }
                if (typeof this.soundSets[set] === 'undefined') {
                    this.soundSets[set] = new Array();
                }
                this.soundSets[set].push(name);
                var loadedAsset = asset;

                graphics.load(asset, function() {
                });
            }
            catch (e) {
                throw new Error(this.getMessage("file not found", name));
            }
        } else {
            asset = this.sounds[name];
        }
        return asset;
    };
    
    /**
     * Calls addSoung with project at true.
     * @param {String} name
     * @param {String} set
     */
    Sound.prototype._addSound = function(name, set) {
        this.addSound(name, set, true);
    };

    /**
     * Enable or disable Sound's repetition.
     * @param {Boolean} state
     */
    Sound.prototype._loop = function(state) {
        this.loop = state;
    };
    
    /**
     * Play "name" sound.
     * Repeats it if state is at true.
     * @param {String} name
     */
    Sound.prototype._play = function(name) {
        if (typeof name === 'undefined')
            name = 0;
        var asset = this.sounds[name];
        // TODO: wait for loading
        var audio = TRuntime.getGraphics().getAudio();
        audio.play(asset, {loop: this.loop});
    };
    
    /**
     * Stop "name" sound.
     * @param {String} name
     */
    Sound.prototype._stop = function(name) {
        var asset = this.sounds[name];
        var audio = TRuntime.getGraphics().getAudio();
        audio.stop(asset);
    };

    return Sound;
});
