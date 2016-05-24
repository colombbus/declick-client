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
                var getNativeFunction = function(name) {
                    var wrapper = function() {
                        var obj = interpreter.createObject(null);
                        obj.declick_object_ = new classes[name]();
                        var wrapper2 = function(a) {
                            obj.declick_object_._moveForward(a);
                        };
                        interpreter.setProperty(obj, "avancer", interpreter.createNativeFunction(wrapper2));
                        return obj;
                        //return interpreter.createObject(classes[name]);
                    };
                    return interpreter.createNativeFunction(wrapper);
                };
                var wrapper = function(text) {
                    text = text ? text.toString() : '';
                    return interpreter.createPrimitive(alert(text));
                };
                interpreter.setProperty(scope, 'alert',interpreter.createNativeFunction(wrapper));
                for (var name in classes) {
                    interpreter.setProperty(scope, name, getNativeFunction(name));
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
            suspended = true;
        };

        this.resume = function() {
            if (suspended) {
                suspended = false;
                run();
            }
        };

        this.stop = function() {
            stop();
        };

        var stop = function() {
            running = false;
            suspended = false;
            var ast = acorn.parse("");
            var scope = interpreter.createScope(ast, null);
            interpreter.stateStack = [{
              node: ast,
              scope: scope,
              thisExpression: scope,
              done: false
            }];            
        };
        
        var nextStep = function() {
            if (interpreter.step()) {
                if (!suspended) {
                    window.setTimeout(nextStep, 0);
                }
            } else {
                running = false;
            }
        };
        
        var run = function() {
            running = true;
            if (!suspended) {
                nextStep();
            }
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


