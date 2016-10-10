define(['jquery','platform-pr', 'json'], function($) {
    
    var Task = function(aFrame) {
        
        var frame = aFrame;
        var views = {task:{}};
        
        this.addViews = function(value) {
            $.extend(views, value);
        };
        
        this.showViews = function(views, callback) {
            if (typeof views.task !== 'undefined' && views.task) {
                // show task view
                frame.displaySolution(false);
            } else if (typeof views.solution !== 'undefined' && views.solution) {
                // show solution
                frame.displaySolution(true);
            }
            callback();
        };
        
        this.getViews = function(callback) {
            var views = {
                task: {},
                solution: {}
/*                , hint: {requires: "task"},
                forum: {requires: "task"},
                editor: {requires: "task"}*/
            };
            callback(views);
        };
        
        this.updateToken = function (token, callback) {
            // do nothing
            callback();
        };


        this.getHeight = function (callback) {
            callback($("html").outerHeight(true));
        };

        this.getState = function (callback) {
            callback(frame.getAnswer());
        };
        
        this.reloadState = function (state, callback) {
            frame.setAnswer(state);
            callback();
        };
        
        this.getAnswer = function (callback) {
            var res = JSON.stringify(
                {score : frame.getScore(),
                value : frame.getLastSubmission()});
            callback(res);
        };
        
        this.reloadAnswer = function (strAnswer, callback) {
            if(strAnswer !== "") {
                try {
                    var answer = JSON.parse(strAnswer);
                    frame.setScore(answer.score);
                    frame.setAnswer(answer.value);
                } catch(e) {
                    window.console.log(e);
                }
            }
            else {
                frame.setScore(0);
                frame.setAnswer("");
            }
            callback();
        };
    
        this.load = function (views, callback) {
            frame.load(callback);
        };

        this.unload = function (callback) {
            callback();
        };
        
        this.getMetaData = function (callback) {
            var link = document.location.href;
            var metaData = {
                id : link.substring(0, link.lastIndexOf("#")),
                language : "fr",
                version : 1.0,
                title : "title",
                authors : ["Colombbus - France-IOI"],
                license : "license",
                minWidth : "auto",
                fullFeedback : true,
                autoHeight : true
            };
            callback(metaData);
        };
    };
    
    return Task; 
});

