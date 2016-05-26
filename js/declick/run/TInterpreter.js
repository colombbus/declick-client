define(['TError', 'TUtils', 'acorn', 'js-interpreter'], function(TError, TUtils, acorn, Interpreter) {
    function TInterpreter() {
        var runtimeFrame, log, errorHandler;
        var debug;
        var classes = {};
        
        
        var interpreter;
        var running = false;
        var suspended = false;
        
        this.initialize = function() {
            var initFunc = function(interpreter, scope) {
                var getObject = function(name) {
                    var parent = interpreter.createObject(interpreter.FUNCTION);
                    // TODO: automatize this
                    if (typeof classes[name].prototype!== 'undefined' && typeof classes[name].prototype.avancer !== 'undefined') {
                        var wrapper = function() {
                            classes[name].prototype._moveForward.apply(this.declickObj,arguments);
                        };
                        interpreter.setProperty(parent.properties.prototype, 'avancer', interpreter.createNativeFunction(wrapper));
                        wrapper = function() {
                            classes[name].prototype._moveBackward.apply(this.declickObj,arguments);
                        };
                        interpreter.setProperty(parent.properties.prototype, 'reculer', interpreter.createNativeFunction(wrapper));
                    }
                    var wrapper = function() {
                        var obj = interpreter.createObject(parent);
                        // TODO: handle instances and constructor parameters
                        obj.declickObj = new classes[name];
                        return obj;
                    };
                    var obj = interpreter.createNativeFunction(wrapper);
                    return obj;
                };
                var wrapper = function(text) {
                    text = text ? text.toString() : '';
                    return interpreter.createPrimitive(alert(text));
                };
                interpreter.setProperty(scope, 'alert',interpreter.createNativeFunction(wrapper));
                for (var name in classes) {
                    var object = getObject(name);
                    interpreter.setProperty(scope, name, object, true);
                }
            };
            interpreter =  new Interpreter("", initFunc);
        };
        
        this.setRuntimeFrame = function(frame) {
            runtimeFrame = frame;
        };

        this.setLog = function(element) {
            log = element;
        };

        this.setErrorHandler = function(handler) {
            errorHandler = handler;
        };
        
                /* Lifecycle management */

        var clear = function() {
            stop();
        };

        this.clear = function() {
            clear();
        };

        this.suspend = function() {
            interpreter.paused_ = true;
        };

        this.resume = function() {
            if (interpreter.paused_) {
                interpreter.paused_ = false;
                run();
            }
        };

        this.stop = function() {
            stop();
        };

        var stop = function() {
            running = false;
            var ast = acorn.parse("");
            var scope = interpreter.createScope(ast, null);
            interpreter.stateStack = [{
              node: ast,
              scope: scope,
              thisExpression: scope,
              done: false
            }];            
            interpreter.paused_ = false;
        };
        
        var nextStep = function() {
            if (interpreter.step()) {
                if (!interpreter.paused_) {
                    window.setTimeout(nextStep, 0);
                }
            } else {
                running = false;
            }
        };
        
        var run = function() {
            running = true;
            nextStep();
        };

        this.start = function() {
            if (!running) {
                run();
            }
        };

        this.addStatement = function(statement, programName) {
            interpreter.appendCode(statement);
            if (!running) {
                this.start();
            }
        };

        this.addStatements = function(statements, programName) {
            interpreter.appendCode(statements);
            if (!running) {
                this.start();
            }
        };

        this.addPriorityStatements = function(statements, parameter, log) {
            this.addStatements(statements);
            if (!running) {
                this.start();
            }
        };

        this.addClass = function(func, name) {
            /*var wrapper = function() {
                return interpreter.createPrimitive(func);
            };*/
            classes[name] = func;
            /*window.console.log("ajout de la propriété: "+name);
            debug = interpreter.getScope();
            interpreter.setProperty(interpreter.getScope(), name, interpreter.createPrimitive(func));*/
        };
        
    }

    return TInterpreter;
});


