define(['TError', 'TUtils', 'acorn', 'js-interpreter'], function(TError, TUtils, acorn, Interpreter) {
    function TInterpreter() {
        var MAX_STEP = 100;

        var log, errorHandler;
        var classes = {};
        var translatedClasses = {};
        var instances  = {};
        var stored  = {};
        var stepCount =0;

        var interpreter;
        var running = false;

        var priorityStatementsAllowed = true;

        Object.defineProperty(this, 'output',
        {
            get: function ()
            {
                return interpreter.value;
            }
        });

        this.convertToNative = function (data)
        {
            return getNativeData(data);
        };

        var getNativeData = function(data) {
            var result;
            if (data.type) {
                if (data.type=== "function") {
                    return data;
                } else if (typeof data.data !== "undefined") {
                    // primitive data or declick objects
                    return data.data;
                } else if (data.type === "object") {
                    if (typeof data.length !== "undefined") {
                        // we are in an array
                        result = [];
                        for (var i =0; i < data.length; i++) {
                            result.push(getNativeData(data.properties[i]));
                        }
                        return result;
                    } else {
                        result = {};
                        for (var member in data.properties) {
                            result[member] = getNativeData(data.properties[member]);
                        }
                        return result;
                    }
                }
            }
            return data;
        };

        var getInterpreterData = function(data) {
            var result;
            if (data instanceof Array) {
                // Array
                result = interpreter.createObject(interpreter.ARRAY);
                for (var i = 0; i<data.length;i++) {
                    interpreter.setProperty(result, i, getInterpreterData(data[i]));
                }
                return result;
            } else if (typeof data === 'object') {
                // Object
                if (data.className) {
                    // declick object: wrap it
                    if (translatedClasses[data.className]) {
                        result = interpreter.createObject(getClass(translatedClasses[data.className]));
                        result.data = data;
                        return result;
                    }
                }
            } else {
                // Primitive types
                return interpreter.createPrimitive(data);
            }
            return data;
        };

        var getClassMethodWrapper = function(className, methodName) {
            return function() {
                // transform data from interpreter into actual data
                var args = [];
                for (var i=0; i<arguments.length;i++) {
                    args.push(getNativeData(arguments[i]));
                }
                return getInterpreterData(classes[className].prototype[methodName].apply(this.data, args));
            };
        };

        //TODO: store classes
        var getClass = function(name) {
            var parent = interpreter.createObject(interpreter.FUNCTION);
            if (typeof classes[name].prototype !== 'undefined' && typeof classes[name].prototype.translatedMethods !== 'undefined') {
                var translated = classes[name].prototype.translatedMethods;
                for (var methodName in translated) {
                    interpreter.setProperty(parent.properties.prototype, translated[methodName], interpreter.createNativeFunction(getClassMethodWrapper(name, methodName)));
                }
            }
            return parent;
        };

        this.initialize = function() {

            var initFunc = function(interpreter, scope) {
                var name, object;

                // #1 Declare translated Instances
                var getInstanceMethodWrapper = function(className, methodName) {
                    return function() {
                        // transform data from interpreter into actual data
                        var args = [];
                        for (var i=0; i<arguments.length;i++) {
                            args.push(getNativeData(arguments[i]));
                        }
                        return getInterpreterData(instances[className][methodName].apply(this.data, args));
                    };
                };

                var getInstance = function(name) {
                    var object = interpreter.createObject(interpreter.FUNCTION);
                    object.data = instances[name];
                    if (typeof instances[name].translatedMethods !== 'undefined') {
                        var translated = instances[name].translatedMethods;
                        for (var methodName in translated) {
                            interpreter.setProperty(object, translated[methodName], interpreter.createNativeFunction(getInstanceMethodWrapper(name, methodName)));
                        }
                    }
                    return object;
                };
                for (name in instances) {
                    if (stored[name]) {
                        // instance already created and stored
                        object = stored[name];
                    } else {
                        object = getInstance(name);
                        stored[name] = object;
                    }
                    interpreter.setProperty(scope, name, object, true);
                }

                // #2 Declare translated Classes
                // generate wrapper for translated methods

                var getObject = function(name) {
                    var wrapper = function() {
                        var obj = interpreter.createObject(getClass(name));
                        var declickObj = Object.create(classes[name].prototype);
                        // transform data from interpreter into actual data
                        var args = [];
                        for (var i=0; i<arguments.length;i++) {
                            args.push(getNativeData(arguments[i]));
                        }
                        classes[name].apply(declickObj, args);
                        obj.data = declickObj;
                        return obj;
                    };
                    var obj = interpreter.createNativeFunction(wrapper);
                    return obj;
                };
                for (name in classes) {
                    if (stored[name]) {
                        // instance already created and stored
                        object = stored[name];
                    } else {
                        object = getObject(name);
                        stored[name] = object;
                    }
                    interpreter.setProperty(scope, name, object, true);
                }
            };
            interpreter =  new Interpreter("", initFunc);
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

        var logCommand = function(command) {
            if (typeof log !== 'undefined') {
                log.addCommand(command);
            }
        };

        var stop = function(scope) {
            running = false;
            var emptyAST = acorn.parse("");
            if (!scope) {
                scope = interpreter.createScope(emptyAST, null);
            }
            interpreter.stateStack = [{
                node: emptyAST,
                scope: scope,
                thisExpression: scope,
                done: false
            }];
            interpreter.paused_ = false;
            priorityStatementsAllowed = true;
        };


        var nextStep = function() {
            try {
                if (interpreter.step()) {
                    stepCount++;
                    if (!interpreter.paused_) {
                        if (stepCount>=MAX_STEP) {
                            stepCount = 0;
                            window.setTimeout(nextStep, 0);
                        } else {
                            nextStep();
                        }
                    }
                } else {
                    running = false;
                }
                //logCommand(interpreter.stateStack);
            } catch (err) {
                var state, error;
                if (!(err instanceof TError)) {
                    error = new TError(err);
                    if (interpreter.stateStack.length>0) {
                        state = interpreter.stateStack[0];
                        if (state.node.loc) {
                            error.setLines([state.node.loc.start.line, state.node.loc.end.line]);
                        }
                    }
                    error.detectError();
                } else {
                    error = err;
                }
                if (interpreter.stateStack.length>0) {
                    state = interpreter.stateStack[0];
                    if (!state.node.loc || !state.node.loc.source) {
                        // no program associated: remove lines if any
                        error.setLines([]);
                    } else {
                        error.setProgramName(state.node.loc.source);
                    }
                }
                var baseState = interpreter.stateStack.pop();
                stop(baseState.scope);

                if (typeof errorHandler !== 'undefined') {
                    errorHandler(error);
                } else {
                    throw error;
                }
            }
        };

        var run = function() {
            running = true;
            nextStep();
        };

        this.start = function() {
            if (!running) {
                stepCount = 0;
                run();
            }
        };

        this.addStatement = function(statement) {
            interpreter.appendCode(statement);
            if (!running) {
                this.start();
            }
        };

        this.addStatements = function(statements) {
            interpreter.appendCode(statements);
            if (!running) {
                this.start();
            }
        };

        this.insertStatement = function(statement, parameters) {
            interpreter.insertCode(statement, true, parameters);
            if (!running) {
                this.start();
            }
        };

        this.insertStatements = function(statements) {
            interpreter.insertBlock(statements,false);
            if (!running) {
                this.start();
            }
        };


        this.addPriorityStatements = function(statements, parameters, log, callback) {
            if (priorityStatementsAllowed) {
                if (typeof parameters !== 'undefined') {
                    for (var i =0; i<parameters.length; i++) {
                        parameters[i] = getInterpreterData(parameters[i]);
                    }
                }
                if (typeof callback !== 'undefined') {
                    interpreter.insertCode(statements, true, parameters, this.createCallbackStatement(callback));
                } else {
                    interpreter.insertCode(statements, true, parameters);
                }
                if (!running) {
                    this.start();
                }
            }
        };

        this.addClass = function(func, name) {
            classes[name] = func;
            if (func.prototype.className) {
                translatedClasses[func.prototype.className] = name;
            }
        };

        this.addInstance = function(func, name) {
            instances[name] = func;
        };

        this.getClass = function(name) {
            if (classes[name]) {
                return classes[name];
            } else {
                return null;
            }
        };

        this.getObject = function(name) {
            try {
                var obj = interpreter.getValueFromScope(name);
                if (obj && obj.data) {
                    return obj.data;
                }
                return null;
            } catch (err) {
                return null;
            }
        };

        this.getObjectName = function(reference) {
            var scope = interpreter.getScope();
            while (scope) {
                for (var name in scope.properties) {
                    var obj = scope.properties[name];
                    if (obj.data && obj.data === reference) {
                        return name;
                    }
                }
                scope = scope.parentScope;
            }
            return null;
        };

        this.deleteObject = function(reference) {
            var scope = interpreter.getScope();
            while (scope) {
                for (var name in scope.properties) {
                    var obj = scope.properties[name];
                    if (!scope.fixed[name] && obj.data) {
                        if (obj.data === reference) {
                            interpreter.deleteProperty(scope, name);
                            return true;
                        }
                    }
                }
                scope = scope.parentScope;
            }
            return false;
        };

        this.exposeProperty = function(reference, property, propertyName) {
            var scope = interpreter.getScope();
            var wrapper = function() {
                return getInterpreterData(this.data[property]);
            };
            while (scope) {
                for (var name in scope.properties) {
                    var obj = scope.properties[name];
                    if (obj.data === reference) {
                        var prop = interpreter.createObject(null);
                        prop.dynamic = wrapper;
                        //window.console.log(typeof property);
                        interpreter.setProperty(obj, propertyName, prop);
                        return true;
                    }
                }
                scope = scope.parentScope;
            }
            return false;
        };

        this.createCallStatement = function(functionStatement) {
            var state = [{type: "InnerCallExpression",arguments: [], func_: functionStatement, loc: functionStatement.node.loc}];
            return state;
        };

        this.createCallbackStatement = function(callback) {
            var statement = {type: "CallbackStatement", callback: callback};
            return statement;
        };

        this.createFunctionStatement = function(body, parameters) {
            if (typeof parameters === 'undefined') {
                parameters = [];
            }
            var node = {type:'FunctionExpression', body:{type:'BlockStatement', body:body}, params:parameters};
            var statement = interpreter.createFunction(node);
            return statement;
        };

        this.interrupt = function() {
            interpreter.stateStack.shift();
            interpreter.stateStack.unshift({node:{type: "InterruptStatement"}, priority:true, done:false});
        };

        this.allowPriorityStatements = function() {
            priorityStatementsAllowed = true;
        };

        this.refusePriorityStatements = function() {
            priorityStatementsAllowed = false;
        };
    }


    // Modify Interpreter to handle function declaration
    Interpreter.prototype.stepFunctionDeclaration = function() {
        var state = this.stateStack.shift();
        this.setValue(this.createPrimitive(state.node.id.name), this.createFunction(state.node));
    };

    // Modify Interpreter to throw exception when trying to redefining fixed property
    Interpreter.prototype.setValueToScope = function(name, value) {
        var scope = this.getScope();
        var strict = scope.strict;
        var nameStr = name.toString();
        while (scope) {
            if ((nameStr in scope.properties) || (!strict && !scope.parentScope)) {
                if (!scope.fixed[nameStr]) {
                    scope.properties[nameStr] = value;
                } else {
                    this.throwException(this.REFERENCE_ERROR, nameStr + ' is alderady defined');
                }
                return;
            }
            scope = scope.parentScope;
        }
        this.throwException(this.REFERENCE_ERROR, nameStr + ' is not defined');
    };

    // Modify Interpreter to not delete statements when looking for a try
    Interpreter.prototype.throwException = function(errorClass, opt_message) {
        var error;
        if (this.stateStack[0].interpreter) {
            // This is the wrong interpreter, we are spinning on an eval.
            try {
                this.stateStack[0].interpreter.throwException(errorClass, opt_message);
                return;
            } catch (e) {
                // The eval threw an error and did not catch it.
                // Continue to see if this level can catch it.
            }
        }
        if (opt_message === undefined) {
            error = errorClass;
        } else {
            error = this.createObject(errorClass);
            this.setProperty(error, 'message',
            this.createPrimitive(opt_message), false, true);
        }
        // Search for a try statement.
        var i = 0;
        var state;
        var length = this.stateStack.length;
        do {
            state = this.stateStack[i];
            i++;
        } while (i<length && state.node.type !== 'TryStatement');
        if (state.node.type === 'TryStatement') {
            for (var j=0; j<i; j++) {
                this.stateStack.shift();
            }
            // Error is being trapped.
            this.stateStack.unshift({
                node: state.node.handler,
                throwValue: error
            });
        } else {
            // Throw a real error.
            var realError;
            if (this.isa(error, this.ERROR)) {
                var errorTable = {
                    'EvalError': EvalError,
                    'RangeError': RangeError,
                    'ReferenceError': ReferenceError,
                    'SyntaxError': SyntaxError,
                    'TypeError': TypeError,
                    'URIError': URIError
                };
                var type = errorTable[this.getProperty(error, 'name')] || Error;
                realError = type(this.getProperty(error, 'message'));
            } else {
                realError = error.toString();
            }
            throw realError;
        }
    };

    // add support for Repeat statement
    Interpreter.prototype.stepRepeatStatement = function() {
        var state = this.stateStack[0];
        state.isLoop = true;
        var node = state.node;
        if (state.countHandled) {
            if (node.body) {
                if (state.infinite) {
                    this.stateStack.unshift({node: node.body});
                } else {
                    state.count--;
                    if (state.count>=0) {
                        this.stateStack.unshift({node: node.body});
                    } else {
                        this.stateStack.shift();
                    }
                }
            }
        } else {
            if (node.count) {
                // count specified
                if (state.countReady) {
                    state.infinite = false;
                    state.count = state.value;
                    state.countHandled = true;
                } else {
                    state.countReady = true;
                    this.stateStack.unshift({node: node.count});
                }
            } else {
                state.infinite = true;
                state.countHandled = true;
            }
        }
    };

    // add support for inner call
    Interpreter.prototype.stepInnerCallExpression = function() {
        var state = this.stateStack.shift();
        var args = [];
        var n =0;
        if (state.parameters) {
            args = state.parameters;
            n = args.length;
        }
        this.stateStack.unshift({node: {type:"CallExpression", arguments:args}, arguments:args, n_:n, doneCallee_: true, func_: state.node.func_, funcThis_: this.stateStack[this.stateStack.length - 1].thisExpression});
    };


    Interpreter.prototype.insertBlock = function(block, priority) {
        // Find index at which insertion has to be made
        var index=this.stateStack.length-1;
        while (index>=0 && !this.stateStack[index].priority) {
            index--;
        }
        index++;

        // Append the new statements
        block.type = "BlockStatement";
        this.stateStack.splice(index, 0, {node: block, priority:priority, done:false});
    };


    // add ability to insert code
    Interpreter.prototype.insertCode = function(code, priority, parameters, callbackStatement) {
        // Find index at which insertion has to be made
        var index=this.stateStack.length-1;
        while (index>=0 && !this.stateStack[index].priority) {
            index--;
        }
        index++;

        // Append the new statements
        if (typeof callbackStatement !== 'undefined') {
            this.stateStack.splice(index, 0, {node: callbackStatement, priority:priority, done:false});
        }
        for (var i = code.length-1; i>=0; i--) {
            var node = code[i];
            if (priority && node.type === "InnerCallExpression" && typeof parameters!== "undefined") {
                // Add parameter
                this.stateStack.splice(index, 0, {node: node, priority:priority, done:false, parameters:parameters});
            } else  {
                this.stateStack.splice(index, 0, {node: node, priority:priority, done:false});
            }
        }
    };

    // add ability to handle dynamic properties
    Interpreter.prototype.getProperty = function(obj, name) {
        if (typeof (name))
        name = name.toString();
        if (obj == this.UNDEFINED || obj == this.NULL) {
            this.throwException(this.TYPE_ERROR, "Cannot read property '" + name + "' of " + obj);
        }
        // Special cases for magic length property.
        if (this.isa(obj, this.STRING)) {
            if (name == 'length') {
                return this.createPrimitive(obj.data.length);
            }
            var n = this.arrayIndex(name);
            if (!isNaN(n) && n < obj.data.length) {
                return this.createPrimitive(obj.data[n]);
            }
        } else if (this.isa(obj, this.ARRAY) && name == 'length') {
            return this.createPrimitive(obj.length);
        }
        while (true) {
            if (obj.properties && name in obj.properties) {
                var prop = obj.properties[name];
                if (prop.dynamic ) {
                    return prop.dynamic.apply(obj);
                }
                return prop;
            }
            if (obj.parent && obj.parent.properties && obj.parent.properties.prototype) {
                obj = obj.parent.properties.prototype;
            } else {
                // No parent, reached the top.
                break;
            }
        }
        return this.UNDEFINED;
    };

    // change break management not to remove root program node
    Interpreter.prototype.stepBreakStatement = function() {
        var state = this.stateStack.shift();
        var node = state.node;
        var label = null;
        if (node.label) {
            label = node.label.name;
        }
        state = this.stateStack.shift();
        while (state && state.node.type != 'CallExpression' && state.node.type != 'NewExpression' && state.node.type != 'Program') {
            if (label ? label == state.label : (state.isLoop || state.isSwitch)) {
                return;
            }
            state = this.stateStack.shift();
        }
        if (state.node.type == 'Program'){
            // re-insert root node
            this.stateStack.push(state);
        } else {
            // Syntax error, do not allow this error to be trapped.
            throw SyntaxError('Illegal break statement');
        }
    };

    // handle interrupt statements
    Interpreter.prototype.stepInterruptStatement = function() {
        var state = this.stateStack.shift();
        var node = state.node;
        var label = null;
        if (node.label) {
            label = node.label.name;
        }
        // Find index at which search has to start
        var index=this.stateStack.length-1;
        while (index>=0 && !this.stateStack[index].priority) {
            index--;
        }
        index++;

        state = this.stateStack.splice(index, 1)[0];
        while (state && state.node.type != 'Program') {
            if (label ? label == state.label : (state.isLoop || state.isSwitch)) {
                return;
            }
            state = this.stateStack.splice(index, 1)[0];
        }
        if (state.node.type == 'Program'){
            // re-insert root node
            this.stateStack.push(state);
        } else {
            // Syntax error, do not allow this error to be trapped.
            throw SyntaxError('Illegal break statement');
        }
    };

    // handle interrupt statements
    Interpreter.prototype.stepCallbackStatement = function() {
        var state = this.stateStack.shift();
        var node = state.node;
        if (node.callback) {
            node.callback.apply(this);
        }
	if (typeof state.value !== 'undefined' && state.value !== this.UNDEFINED && !this.stateStack[0].priority && this.stateStack[0].node.type === 'CallExpression') {
	    this.stateStack[0].value = state.value;
	}
    };

    return TInterpreter;
});
