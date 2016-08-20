define(['jquery', 'introjs', 'TEnvironment'], function($, introjs, TEnvironment) {
    function THints() {
        var introJS = introjs();
        var hintsDisplayed = false;
        var currentPage = false;
        var hintsAdded = false;
        var hintsCount = 0;
        var pages = {};

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
                    // check for pages
                    var index = 0;
                    for (var i = 0; i<data.hints.length; i++) {
                        var item = data.hints[i];
                        if (typeof item.pages !== 'undefined') {
                            for (var j = 0; j< item.pages.length; j++) {
                                if (typeof pages[item.pages[j]] === 'undefined') {
                                    pages[item.pages[j]] = [];
                                }
                                pages[item.pages[j]].push(index);
                            }
                        }
                        index++;
                    }
                    hintsCount = index;
                    if (typeof callback  !== 'undefined') {
                        callback.call(this);
                    }
                }
            });
        };

        this.showHints = function(page) {
            if (!hintsAdded) {
                introJS.addHints();
                hintsAdded = true;
            } else {
                introJS.refresh();
            }
            if (typeof page !== 'undefined') {
                // display only items for a given page
                // 1st hide every items
                introJS.hideHints();
                // 2nd display only required items
                if (typeof pages[page] !== 'undefined' && pages[page].length >0) {
                    for (var i=0; i<pages[page].length; i++) {
                        $(".introjs-hint[data-step="+ pages[page][i] + "]").removeClass("introjs-hidehint");
                    }
                }
            } else {
                $(".introjs-hidehint").removeClass("introjs-hidehint");
            }
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
                if (currentPage !== false) {
                    this.showHints(currentPage);
                } else {
                    this.showHints();
                }
            }
        };

        this.setPage = function(page) {
            currentPage = page;
        };

        this.visible = function() {
            return hintsDisplayed;
        };
     }

    var instance = new THints();

    return instance;
});
