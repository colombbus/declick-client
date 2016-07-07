define(['jquery', 'TObject'], function ($, TObject) {
    function Midi() {
        // window.console.log(JZZ.info);    
        var domBody = document.getElementsByTagName("body")[0];

        this.domMidi = null;
        $head = $("head");
        $body = $(domBody);
        $head.append('<script src="node_modules/jzz/javascript/JZZ.js"></script>');
        $head.append('<script src="node_modules/jzz-modules-dev/minified/JZZ.synth.OSC.js"></script>');

        this.domPlugin = document.getElementsByTagName("object")[0];
        var Jazz = null;
        
//        if (ie8)
        //<meta http-equiv="X-UA-Compatible" content="requiresActiveX=true"/>

        this.addPlugin = function (where) {
            this.domPlugin = document.getElementsByTagName("object")[0];
            console.dir(this.domPlugin);
            var obj;
            if (typeof this.domPlugin === 'undefined') {
                obj = document.createElement('object');
            } else {
                obj = this.domPlugin;
            }
            $(obj).attr("id", "Jazz1");
            $(obj).attr("classid", "CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90");
            if (!obj.isJazz) {
                obj.type = "audio/x-jazz";
                $(obj).attr("type", "audio/x-jazz");
            }
            obj.style.visibility = 'hidden';
            obj.style.width = '0px';
            obj.style.height = '0px';
            where.appendChild(obj);
            if (obj.isJazz) {
                return obj;
            } else {
                where.removeChild(obj);
                throw "Cannot create Jazz-Plugin";
            }
        };

        Jazz = this.addPlugin(domBody);
        console.log(Jazz.isJazz());


        //this.domMidi = this.createPlugin(domBody);
        //console.dir(this.domMidi);
//        var Jazz = document.getElementById("Jazz1");
//        if (!Jazz || !Jazz.isJazz) {
//            Jazz = document.getElementById("Jazz2");
//        }
//        //console.log(new JZZ().info());
//
//        JZZ.synth.OSC.register('Synth');
//        window.port = JZZ().openMidiOut().or(function () {
//            alert('Cannot open MIDI port!');
//        });
    }

    Midi.prototype = Object.create(TObject.prototype);
    Midi.prototype.constructor = Midi;
    Midi.prototype.className = "Midi";

    Midi.prototype.bonjour = function () {
        //window.console.log(JZZ.info);        
    };

    return Midi;
});

