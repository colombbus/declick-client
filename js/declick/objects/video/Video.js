define(['jquery', 'TObject', 'TUtils', 'TRuntime', 'TEnvironment', 'ui/TCanvas'], function($, TObject, TUtils, TRuntime, TEnvironment, TCanvas) {
    var Video = function(name) {
        TObject.call(this, name);



        //$("video").attr("type", "video/mp4");

        $("video").draggable();
        $("video").append('<source src="http://localhost/declick-client/images/minions.mp4" type="video/mp4" style="width: 500px; height: 500px;"></source>');
        //$("video").attr("src", TUtils.getString("minions.mp4"));
        //"assets/minions.mp4"
        this.domVideo = document.getElementById("tvideo");
        this.domVideo.addEventListener("canplay", function(e) {
            console.log("peut être lue !!");
        });


        this.video = new Array();
        this.videoSets = new Array();
        this.loop = false;
        if (typeof name === 'string') {
            this._addVideo(name);
        }
    };
    Video.prototype = Object.create(TObject.prototype);
    Video.prototype.constructor = Video;
    Video.prototype.className = "Video";

    //var tInstance = new Tracking();
    var graphics = TRuntime.getGraphics();

    var tInstance = new Object();
    Video.prototype.qInstance = tInstance;

    Video.prototype.addVideo = function(name, set, project) {
        name = TUtils.getString(name);
        var asset;
        // add video only if not already added
        if (typeof this.video[name] === 'undefined') {
            try {
                if (project) {
                    // asset from project
                    asset = TEnvironment.getProjectResource(name);
                } else {
                    // asset from object itself
                    asset = this.getResource(name);
                }
                this.video[name] = asset;
                if (typeof set === 'undefined') {
                    set = "";
                } else {
                    set = TUtils.getString(set);
                }
                if (typeof this.videoSets[set] === 'undefined') {
                    this.videoSets[set] = new Array();
                }
                this.videoSets[set].push(name);
                var loadedAsset = asset;
                graphics.load(asset, function() {
                });
            }
            catch (e) {
                throw new Error(this.getMessage("file not found", name));
            }
        } else {
            asset = this.video[name];
        }
        return asset;
    };
    Video.prototype._addVideo = function(name, set) {
        this.addVideo(name, set, true);
    };

    Video.prototype._loop = function(state) {
        this.domVideo.loop = state;
    };
    Video.prototype._play = function(name) {
        var asset = this.video[name];

        this.domVideo.play();
    };
    Video.prototype._pause = function() {
        this.domVideo.pause();
    };
    Video.prototype._displayControls = function(state) {
        if (state)
            $(this.domVideo).attr('controls', true);
        else
            $(this.domVideo).removeAttr('controls');
    };

    Video.prototype._mute = function(state) {
        this.domVideo.muted = state;
    };
    Video.prototype._stop = function(name) {
        var asset = this.video[name];
        this.qAudio.stop(asset);
    };

    return Video;
});
