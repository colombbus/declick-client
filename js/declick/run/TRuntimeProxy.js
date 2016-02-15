define(['TRuntime', 'TGraphics'], function(TRuntime, TGraphics) {
    function TRuntimeProxy() {
        
        var runtime;
        
        this.load = function(callback) {
            var iframe = window.top.document.getElementById("declick-runtime-frame");
            if (iframe !== null) {
                var runtimeFrame = iframe.contentWindow || iframe;
                if (typeof runtimeFrame !== 'undefined' && typeof runtimeFrame.runtime !== 'undefined') {
                    console.log("Using created TRuntime");
                    runtime = runtimeFrame.runtime;
                    callback();
                    return;
                }
            }
            // no parent runtime frame: create a local TRuntime
            console.log("Creating TRuntime");
            runtime = TRuntime;
            runtime.load(function() {
                callback();
            });
        };
        
        this.getRuntime = function() {
            return runtime;
        };
        
        this.start = function() {
            runtime.start();
        };
        
        this.stop = function() {
            runtime.stop();
        };
        
        this.clear = function() {
            runtime.clear();
        };
        
        this.freeze = function(value) {
            runtime.freeze(value);
        };
        
        this.suspend = function() {
            runtime.suspend();
        };

        this.resume = function() {
            runtime.resume();
        };
        
        this.plugGraphics = function(id) {
            var graphics = runtime.getGraphics();
            graphics.setCanvas(document.getElementById(id));
        };
        
        this.getGraphics = function() {
            return runtime.getGraphics();
        };
        
        this.getTObjectName = function(tObject) {
            return runtime.getTObjectName(tObject);
        };
        
        this.getTObjectTranslatedMethods = function(name) {
            return runtime.getTObjectTranslatedMethods(name);
        };
        
        this.getClassTranslatedMethods = function(className) {
            return runtime.getClassTranslatedMethods(className);
        };
        
        this.setLog = function(element) {
            runtime.setLog(element);
        };
        
        this.executeStatements = function(statements, programName) {
            runtime.executeStatements(statements, programName);
        };
        
        this.executeNow = function(commands, parameter, logCommands) {
            runtime.executeNow(commands, parameter, logCommands);
        };

        this.executeFrom = function(object) {
            runtime.executeFrom(object);
        };
        
        this.setDesignMode = function(value) {
            runtime.setDesignMode(value);
        };
        
        this.init = function() {
            runtime.init();
        };
        
    }
    var proxyInstance = new TRuntimeProxy();

    return proxyInstance;
});

