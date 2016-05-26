define(['jquery', 'TError', 'TGraphics', 'TParser', 'TEnvironment', 'TInterpreter', 'TUtils', 'TI18n', 'TResource'], function($, TError, TGraphics, TParser, TEnvironment, TInterpreter, TUtils, TI18n, TResource) {
    function TRuntime() {
        var runtimeFrame;
        var interpreter = new TInterpreter();
        var runtimeCallback;
        var graphics;
        var log;
        var tObjects = new Array();
        var tInstances = new Array();
        var tGraphicalObjects = new Array();
        var designMode = false;
        var frozen = false;
        var wasFrozen = false;
        var self;
        var baseClasses = ["TObject", "TGraphicalObject"];
        var baseClasses3D = ["TObject3D"];

        this.load = function(callback) {
            // create runtime frame
            initRuntimeFrame();
            // link interpreter to runtimeFrame
            interpreter.setRuntimeFrame(runtimeFrame);
            // link interpreter to errorHandler
            interpreter.setErrorHandler(handleError);
            
            // create graphics;
            graphics = new TGraphics();

            self = this;
            TEnvironment.log("loading base classes");
            // set repeat keyword
            TParser.setRepeatKeyword(TEnvironment.getMessage("repeat-keyword"));
            loadBaseClasses(TEnvironment.getLanguage(), function(baseNames) {
                TEnvironment.log("* Retrieving list of translated objects");
                // find objects and translate them
                var classesUrl = TEnvironment.getObjectListUrl();
                TResource.get(classesUrl,[], function(data) {
                    loadClasses(data, TEnvironment.getLanguage(), function(translatedNames) {
                        // Ask parser to protect translated names
                        //TParser.protectIdentifiers(translatedNames.concat(baseNames));
                        // Load translated error messages
                        TEnvironment.log("* Loading translated error messages");
                        TError.loadMessages(function() {
                            interpreter.initialize();
                            TEnvironment.log("**** TRUNTIME INITIALIZED ****");
                            if (typeof callback !== "undefined") {
                                callback.call(self);
                            }
                        });
                    });
                });
            });
        };
        
        var initRuntimeFrame = function() {
            if (typeof runtimeFrame === 'undefined') {
                var iframe = document.createElement("iframe");
                iframe.className = "runtime-frame";
                document.body.appendChild(iframe);
                runtimeFrame = iframe.contentWindow || iframe;
            }
        };

        var loadBaseClasses = function(language, callback) {
            var protectedNames = [];
            var classes;
            if (TEnvironment.is3DSupported()) {
                classes = baseClasses.concat(baseClasses3D);
            } else {
                classes = baseClasses;
            }
            var classesToLoad = classes.length;
            for (var i=0;i<classes.length; i++) {
                var objectName = classes[i];
                protectedNames.push(objectName);
                TEnvironment.log("adding base object " + objectName);
                require([objectName], function(aClass) {
                    TI18n.internationalize(aClass, false, language, function() {
                        classesToLoad--;
                        if (classesToLoad === 0 && typeof callback !== 'undefined') {
                            callback.call(self, protectedNames);
                        }
                    });
                });
            }
        };

        var loadClasses = function(classes, language, callback) {
            var is3DSupported = TEnvironment.is3DSupported();
            var classesToLoad = Object.keys(classes).length;
            var translatedNames = [];
            $.each(classes, function(key, val) {
                var addObject = true;
                if (typeof val['conditions'] !== 'undefined') {
                    // object rely on conditions 
                    for (var i = 0; i < val['conditions'].length; i++) {
                        var condition = val['conditions'][i];
                        switch (condition) {
                            case '3d':
                                if (!is3DSupported) {
                                    console.log("skipping addition of object " + key + ": 3D not supported");
                                    addObject = false;
                                }
                                break;
                        }
                    }
                }
                if (addObject) {
                    var lib = "objects/" + val['path'] + "/" + key;
                    if (typeof val['translations'][language] !== 'undefined') {
                        TEnvironment.log("adding " + lib);
                        var translatedName = val['translations'][language];
                        var parents, instance;
                        if (typeof val['parents'] === 'undefined') {
                            parents = false;
                        } else {
                            parents = val['parents'];
                        }
                        if (typeof val['instance'] === 'undefined') {
                            instance = false;
                        } else {
                            instance = val['instance'];
                        }

                        require([lib], function(aClass) {
                            // set Object path
                            var aConstructor = aClass;
                            if (instance) {
                                // in case class is in fact an instance (e.g. special object declick),
                                // get its constructor
                                aConstructor = aClass.constructor;
                            }
                            aConstructor.prototype.objectPath = val['path'];
                            TI18n.internationalize(aConstructor, parents, language, function() {
                                TEnvironment.log("Declaring translated object '" + translatedName + "'");
                                if (instance) {
                                    interpreter.addInstance(aClass, translatedName);
                                } else {
                                    interpreter.addClass(aClass, translatedName);
                                }
                                translatedNames.push(translatedName);
                                classesToLoad--;
                                if (classesToLoad === 0 && typeof callback !== 'undefined') {
                                    callback.call(self, translatedNames);
                                }
                            });
                        });
                    }
                } else {
                    window.console.log("SKIPPING "+key);
                    classesToLoad--;
                    if (classesToLoad === 0 && typeof callback !== 'undefined') {
                        callback.call(self, translatedNames);
                    }                    
                }
            });
        };
        
        this.getRuntimeFrame = function() {
            return runtimeFrame;
        };

        this.setCallback = function(callback) {
            runtimeCallback = callback;
        };

        this.getCallback = function() {
            return runtimeCallback;
        };

        this.getTObjectName = function(reference) {
            if (typeof reference.objectName !== 'undefined') {
                return reference.objectName;
            }
            var name;
            $.each(runtimeFrame, function(key, value) {
                if (value === reference) {
                    name = key;
                    return false;
                }
            });
            reference.objectName = name;
            return name;
        };

        this.getTObjectClassName = function(objectName) {
            if (typeof runtimeFrame[objectName] === 'undefined') {
                return false;
            }
            if (typeof runtimeFrame[objectName].className === 'undefined') {
                return false;
            }
            return runtimeFrame[objectName].className;
        };
        
        this.getClassTranslatedMethods = function(className) {
            if (typeof runtimeFrame[className] === 'undefined') {
                return false;
            }
            if (typeof runtimeFrame[className].prototype.translatedMethods === 'undefined') {
                return false;
            }
            return runtimeFrame[className].prototype.translatedMethods;
        };

        this.getTObjectTranslatedMethods = function(objectName) {
            if (typeof runtimeFrame[objectName] === 'undefined') {
                return false;
            }
            if (typeof runtimeFrame[objectName].translatedMethods === 'undefined') {
                return false;
            }
            return runtimeFrame[objectName].translatedMethods;
        };

        // COMMANDS EXECUTION

        var handleError = function(err, programName) {
            var error;
            if (!(err instanceof TError)) {
                error = new TError(err);
                error.detectError();
            } else {
                error = err;
            }
            if (typeof programName !== 'undefined') {
                error.setProgramName(programName);
            }
            if (typeof log !== 'undefined') {
                log.addError(error);
            } else {
                TEnvironment.error(error);
            }
        };

        this.executeStatements = function(statements) {
            interpreter.addStatements(statements);
        };

        this.executeStatementsNow = function(statements, parameter, log) {
            if (typeof parameter !== 'undefined') {
                // TODO: find a better way than using a string representation
                parameter = JSON.stringify(parameter);
            }
            interpreter.addPriorityStatements(statements, parameter, log);
        };

        this.executeNow = function(commands, parameter, logCommands) {
            this.executeStatementsNow(commands, parameter, logCommands);
        };

        this.executeFrom = function(object, programName) {
            if (typeof programName === 'undefined') {
                programName = null;
            }
            try {
                var statements = object.getStatements();
                this.executeStatements(statements);
            } catch (e) {
                handleError(e, programName);
            }
        };
        
        // LOG MANAGEMENT

        this.setLog = function(element) {
            log = element;
            interpreter.setLog(element);
        };

        this.logCommand = function(command) {
            if (typeof log !== 'undefined') {
                log.addCommand(command);
            }
        };

        this.stop = function() {
            graphics.pause();
            wasFrozen = frozen;
            this.freeze(true);
        };

        this.start = function() {
            graphics.unpause();
            if (!wasFrozen) {
                this.freeze(false);
            }
        };

        // SYNCHRONOUS EXECUTION

        this.suspend = function() {
            interpreter.suspend();
        };

        this.resume = function() {
            interpreter.resume();
        };
        
        this.interrupt = function() {
            interpreter.interrupt();
        };
        
        // OBJECTS MANAGEMENT

        this.addObject = function(object) {
            tObjects.push(object);
            // initialize object with current state
            object.freeze(frozen);
        };
        
        this.addInstance = function(instance) {
            tInstances.push(instance);
            // initialize object with current state
            instance.freeze(frozen);
        };        

        this.removeObject = function(object) {
            var index = tObjects.indexOf(object);
            if (index > -1) {
                tObjects.splice(index, 1);
                $.each(runtimeFrame, function(key, value) {
                    if (value === object) {
                        delete runtimeFrame[key];
                        return false;
                    }
                });
            }
        };

        this.addGraphicalObject = function(object, actually) {
        	if (typeof actually ==='undefined' || actually) {
        		graphics.insertObject(object.getGObject());
        	}
            tGraphicalObjects.push(object);
            // initialize object with current state
            object.freeze(frozen);
            object.setDesignMode(designMode);
        };

        this.removeGraphicalObject = function(object) {
            var index = tGraphicalObjects.indexOf(object);
            if (index > -1) {
                graphics.removeObject(object.getGObject());
                tGraphicalObjects.splice(index, 1);
                $.each(runtimeFrame, function(key, value) {
                    if (value === object) {
                        delete runtimeFrame[key];
                        return false;
                    }
                });
            }
        };

        // GRAPHICS MANAGEMENT
        
        this.getGraphics = function() {
            return graphics;
        };

        this.clearGraphics = function() {
            while (tGraphicalObjects.length > 0) {
                var object = tGraphicalObjects[0];
                // deleteObject will remove object from tGraphicalObjects
                object.deleteObject();
            }
        };
        
        this.clearObjects = function() {
            while (tObjects.length > 0) {
                var object = tObjects[0];
                // deleteObject will remove object from tGraphicalObjects
                object.deleteObject();
            }
            // clear instances
            for (var i=0;i<tInstances.length;i++) {
                tInstances[i].clear();
            }
        };

        this.clear = function() {
            interpreter.clear();
            // TODO: clear RuntimeFrame as well (e.g. to erase declared functions)
            this.clearGraphics();
            this.clearObjects();
        };
        
        this.init = function() {
            // init instances
            for (var i=0;i<tInstances.length;i++) {
                tInstances[i].init();
            }            
        };

        this.setDesignMode = function(value) {
            // TODO: handle duplicate objects
            for (var i = 0; i < tGraphicalObjects.length; i++) {
                tGraphicalObjects[i].setDesignMode(value);
            }
            designMode = value;
        };

        this.freeze = function(value) {
            if (value) {
                this.suspend();
            } else {
                this.resume();
            }

            for (var i = 0; i < tGraphicalObjects.length; i++) {
                tGraphicalObjects[i].freeze(value);
            }
            for (var i = 0; i < tObjects.length; i++) {
                tObjects[i].freeze(value);
            }
            frozen = value;
        };

        this.getGraphics = function() {
            return graphics;
        };

    }

    var runtimeInstance = new TRuntime();

    return runtimeInstance;
});


