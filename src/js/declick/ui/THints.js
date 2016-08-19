define(['jquery', 'introjs', 'TEnvironment'], function($, introjs, TEnvironment) {
    function THints() {
        var introJS = introjs();
        var hintsDisplayed = false;
        
        $(document).ready(function() {
            //append css
            var style = $("<link rel='stylesheet' media='all' href='js/libs/introjs/introjs.min.css'>");
            var style2 = $("<link rel='stylesheet' media='all' href='css/hints.css'>");
            $("head").append(style);
            $("head").append(style2);
        });
        
        this.loadHints = function(name, callback) {
            var hintsFile = TEnvironment.getResource(name);
            $.ajax({
                dataType: "json",
                url: hintsFile,
                success: function (data) {
                    introJS.setOptions(data);
                    if (typeof callback  !== 'undefined') {
                        callback.call(this);
                    }
                }
            });
        };
        
        this.showHints = function() {
            introJS.addHints();
            $(".introjs-hidehint").removeClass("introjs-hidehint");
            hintsDisplayed = true;
        };
        
        this.hideHints = function() {
            introJS.hideHints();
            hintsDisplayed = false;
        };
        
        this.toggleHints = function() {
            if (hintsDisplayed) {
                this.hideHints();
            } else {
                this.showHints();
            }
        };
    }
    
    var instance = new THints();
    
    return instance;
});

