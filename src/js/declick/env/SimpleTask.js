define(['jquery','platform-pr'], function($) {
    
    var SimpleTask = function() {
                
        this.showViews = function(views, callback) {
            callback();
        };
        
        this.getViews = function(callback) {
            var views = {
                task: {}
            };
            callback(views);
        };
        
        this.updateToken = function (token, callback) {
            callback();
        };

        this.getHeight = function (callback) {
            callback($("html").outerHeight(true));
        };

        this.getState = function (callback) {
    		callback("");
        };
        
        this.reloadState = function (state, callback) {
            callback();
        };
        
        this.getAnswer = function (callback) {
            callback("");
        };
        
        this.reloadAnswer = function (strAnswer, callback) {
            callback();
        };
    
        this.load = function (views, callback) {
            callback();
        };

        this.unload = function (callback) {
            callback();
        };
        
        this.getMetaData = function (callback) {
            var link = document.location.href;
            var metaData = {
                id : link,
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
    
    return SimpleTask; 
});

