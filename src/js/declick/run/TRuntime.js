define(['jquery', 'TError', 'TGraphics', 'TParser', 'TEnvironment', 'TInterpreter', 'TUtils', 'TI18n', 'TResource', 'objects'], function($, TError, TGraphics, TParser, TEnvironment, TInterpreter, TUtils, TI18n, TResource) {
    function TRuntime() {
        var interpreter = new TInterpreter();
        var runtimeCallback;
        var graphics;
        var log;
        var tObjects = [];
        var tInstances = [];
        var tGraphicalObjects = [];
        var designMode = false;
        var frozen = false;
        var wasFrozen = false;
        var self;
        var baseClasses = ["TObject", "TGraphicalObject"];
        var baseClasses3D = ["TObject3D"];

        this.load = function(callback) {
            // link interpreter to errorHandler
            interpreter.setErrorHandler(handleError);

            // create graphics;
            graphics = new TGraphics();

            self = this;
            TEnvironment.log("loading base classes");
            // set repeat keyword
            TParser.setRepeatKeyword(TEnvironment.getMessage("repeat-keyword"));
            loadBaseClasses(TEnvironment.getLanguage(), function() {
                TEnvironment.log("* Retrieving list of translated objects");
                // find objects and translate them
                var classesUrl = TEnvironment.getObjectListUrl();
                TResource.get(classesUrl,[], function(data) {
                    loadClasses(data, TEnvironment.getLanguage(), function() {
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

        var loadBaseClasses = function(language, callback) {
            var classes;
            if (TEnvironment.is3DSupported()) {
                classes = baseClasses.concat(baseClasses3D);
            } else {
                classes = baseClasses;
            }
            var classesToLoad = classes.length;
            for (var i=0;i<classes.length; i++) {
                var objectName = classes[i];
                TEnvironment.log("adding base object " + objectName);
                require([objectName], function(aClass) {
                    TI18n.internationalize(aClass, false, language, function() {
                        classesToLoad--;
                        if (classesToLoad === 0 && typeof callback !== 'undefined') {
                            callback.call(self);
                        }
                    });
                });
            }
        };

        var loadClasses = function(classes, language, callback) {
            var is3DSupported = TEnvironment.is3DSupported();
            var classesToLoad = Object.keys(classes).length;
            $.each(classes, function(key, val) {
                var addObject = true;
                if (typeof val.conditions !== 'undefined') {
                    // object rely on conditions
                    for (var i = 0; i < val.conditions.length; i++) {
                        var condition = val.conditions[i];
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
                    var lib = "objects/" + val.path + "/" + key;
                    if (typeof val.translations[language] !== 'undefined') {
                        TEnvironment.log("adding " + lib);
                        var translatedName = val.translations[language];
                        var parents, instance;
                        if (typeof val.parents === 'undefined') {
                            parents = false;
                        } else {
                            parents = val.parents;
                        }
                        if (typeof val.instance === 'undefined') {
                            instance = false;
                        } else {
                            instance = val.instance;
                        }

                        require([lib], function(aClass) {
                            // set Object path
                            var aConstructor = aClass;
                            if (instance) {
                                // in case class is in fact an instance (e.g. special object declick),
                                // get its constructor
                                aConstructor = aClass.constructor;
                            }
                            aConstructor.prototype.objectPath = val.path;
                            TI18n.internationalize(aConstructor, parents, language, function() {
                                TEnvironment.log("Declaring translated object '" + translatedName + "'");
                                if (instance) {
                                    interpreter.addInstance(aClass, translatedName);
                                } else {
                                    interpreter.addClass(aClass, translatedName);
                                }
                                classesToLoad--;
                                if (classesToLoad === 0 && typeof callback !== 'undefined') {
                                    callback.call(self);
                                }
                            });
                        });
                    }
                } else {
                    classesToLoad--;
                    if (classesToLoad === 0 && typeof callback !== 'undefined') {
                        callback.call(self);
                    }
                }
            });
        };

        this.setCallback = function(callback) {
            runtimeCallback = callback;
        };

        this.getCallback = function() {
            return runtimeCallback;
        };

        this.getTObject = function(objectName) {
            return interpreter.getObject(objectName);
        };

        this.getTObjectName = function(reference) {
            if (reference.objectName) {
                return reference.objectName;
            }
            var name = interpreter.getObjectName(reference);
            if (name) {
                reference.objectName = name;
                return name;
            }
            return false;
        };

        this.getTObjectClassName = function(objectName) {
            var theObject = interpreter.getObject(objectName);
            if (theObject && theObject.className) {
                return theObject.className;
            }
            return false;
        };

        this.getClassTranslatedMethods = function(className) {
            var theClass = interpreter.getClass(className);
            if (theClass && typeof theClass.prototype.translatedMethodsDisplay !== 'undefined') {
                return theClass.prototype.translatedMethodsDisplay;
            }
            return false;
        };

        this.getTObjectTranslatedMethods = function(objectName) {
            var theObject = interpreter.getObject(objectName);
            if (theObject && typeof theObject.translatedMethodsDisplay !== 'undefined') {
                return theObject.translatedMethodsDisplay;
            }
            return false;
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

	this.evaluate = function (statements, callback)
	{
	    var breakpoint = interpreter.createCallbackStatement(function () {
            callback(interpreter.convertToNative(interpreter.output));
	    });
	    var body = statements.body.slice();
	    statements = $.extend({}, statements);
	    statements.body = body;
	    statements.body.push(breakpoint);
	    this.executeStatements(statements);
	};

        this.handleError = function(err) {
            handleError(err);
        };

        this.executeStatements = function(statements) {
            interpreter.addStatements(statements);
        };

        this.insertStatements = function(statements) {
            interpreter.insertStatements(statements);
        };

        this.insertStatement = function(statement, parameters) {
            interpreter.insertStatement(statement, parameters);
        };

        this.executeStatementsNow = function(statements, parameters, log, callback) {
            /*if (typeof parameter !== 'undefined') {
                // TODO: find a better way than using a string representation
                parameter = JSON.stringify(parameter);
            }*/
            interpreter.addPriorityStatements(statements, parameters, log, callback);
        };

        this.executeNow = function(commands, parameters, logCommands, callback) {
            this.executeStatementsNow(commands, parameters, logCommands, callback);
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

        this.allowPriorityStatements = function() {
            interpreter.allowPriorityStatements();
        };

        this.refusePriorityStatements = function() {
            interpreter.refusePriorityStatements();
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
                interpreter.deleteObject(object);
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
                interpreter.deleteObject(object);
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
            var i;
            if (value) {
                this.suspend();
            } else {
                this.resume();
            }

            for (i = 0; i < tGraphicalObjects.length; i++) {
                tGraphicalObjects[i].freeze(value);
            }
            for (i = 0; i < tObjects.length; i++) {
                tObjects[i].freeze(value);
            }
            frozen = value;
        };

        this.getGraphics = function() {
            return graphics;
        };

        this.exposeProperty = function(reference, property, name) {
            interpreter.exposeProperty(reference, property, name);
        };

        this.createCallStatement = function(functionStatement) {
            return interpreter.createCallStatement(functionStatement);
        };

        this.createFunctionStatement = function(functionStatement) {
            return interpreter.createFunctionStatement(functionStatement);
        };
    }

    var runtimeInstance = new TRuntime();

    return runtimeInstance;
});
