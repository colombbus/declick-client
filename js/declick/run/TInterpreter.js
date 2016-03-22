define(['TError', 'TUtils'], function(TError, TUtils) {
    function TInterpreter() {
        var MAX_LOOP = 50;
        
        var runtimeFrame;
        var errorHandler;
        var definedFunctions = {};
        var running = false;
        var suspended = false;
        var loopSuspended = false;
        var localVariables = [];
        var currentVariables = [];
        var blockLevel = 0;
        var cached = [[]];
        var log;
        var stackPointer = [0];
        var executionLevel = 0;
        var callers = [];

        // main statements stack
        var stack = [[]];

        /* Initialization */

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
            definedFunctions = {};
            localVariables = [];
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
            stack = [[]];
            cached = [[]];
            blockLevel = 0;
            running = false;
            suspended = false;
            stackPointer = [0];
            executionLevel = 0;
            currentVariables = [];
            callers = [];
            loopSuspended = false;
        };
        
        this.interrupt = function() {
            var loop = false;
            var pointer = 0;
            var stackLength = stack[executionLevel].length;
            while (!loop && pointer < stackLength) {
                var statement = stack[executionLevel][pointer];
                if (statement.type === "ControlOperation") {
                    switch (statement.operation) {
                        case "leaveBlock" : 
                            leaveBlock();
                            break;
                        case "leaveFunction":
                            lowerExecutionLevel(null);
                            pointer = 0;
                            stackLength = stack[executionLevel].length;
                            break;
                    }
                } else {
                    loop = (typeof statement.controls !== 'undefined'&& typeof statement.controls.loop !== 'undefined');
                }
                pointer++;
            }
            if (loop) {
                // set loop as interrupted
                statement.controls.interrupt = true;
                // remove statements before loop
                if (pointer>0) {
                    stack[executionLevel].splice(0,pointer-1);
                }
                // either interrupt is called from the stack,
                // in which case interrupt statement is now replaced
                // by the loop, which will be removed,
                // either it is called from declick,
                // in which case loop statement 
                // will complete
            } else {
                //  no loop encountered: we just stop
                stop();
            }
        };

        this.start = function() {
            if (!running) {
                localVariables = [];
                currentVariables = [];
                blockLevel = 0;
                stackPointer = [0];
                executionLevel = 0;
                callers = [];
                run();
            }
        };


        this.addStatement = function(statement, programName) {
            if (typeof programName === 'undefined') {
                programName = null;
            }
            statement.programName = programName;
            stack[0].push(statement);
            if (!running) {
                this.start();
            }
        };

        this.addStatements = function(statements, programName) {
            if (typeof programName === 'undefined') {
                programName = null;
            }
            for (var i = 0; i < statements.length; i++) {
                statements[i].programName = programName;
                stack[0].push(statements[i]);
            }
            if (!running) {
                this.start();
            }
        };

        this.addPriorityStatements = function(statements, parameter, log) {
            // Find index at which insertion has to be made
            var index=0;
            while (index<stack[executionLevel].length && typeof stack[executionLevel][index].priority !== 'undefined') {
                index++;
            }
            var statement;
            for (var i = statements.length - 1; i >= 0; i--) {
                statement = statements[i];
                // Set statement as priority one
                statement.priority = true;
                // Set log information
                statement.log = log;
                if (statement.type === "ExpressionStatement") {
                    // Add parameter
                    statement.expression.parameter = parameter;
                }
                // Insert statement
                stack[executionLevel].splice(index, 0, statement);
            }
            // Update stackPointer if required
            if (stackPointer[executionLevel]>=index) {
                stackPointer[executionLevel]+=statements.length;
            }
            if (!running) {
                this.start();
            }
        };

        var insertStatement = function(statement, log) {
            statement.inserted = true;
            statement.log = log;
            stack[executionLevel].unshift(statement);
            stackPointer[executionLevel]++;
        };

        var insertStatements = function(statements, log) {
            for (var i = statements.length - 1; i >= 0; i--) {
                insertStatement(statements[i], log);
            }
        };

        var logCommand = function(command) {
            if (typeof log !== 'undefined') {
                log.addCommand(command);
            }
        };

        var suspendedException = function() {
        };

        var levelRaisedException = function() {
        };

        var run = function() {
            var statement;
            try {
                running = true;
                while (!suspended && ! loopSuspended && stack[executionLevel].length > 0) {
                    var currentLevel = executionLevel;
                    stackPointer[executionLevel] = 0;
                    statement = stack[executionLevel][0];
                    var consume = evalStatement(statement);
                    if (currentLevel === executionLevel) {
                        // We haven't changed execution level
                        if (consume === true) {
                            // stack may have changed (e.g. interrupt)
                            statement = stack[executionLevel][0];
                            stack[executionLevel].splice(stackPointer[executionLevel], 1);
                            if ((typeof statement.inserted === 'undefined' && typeof statement.priority === 'undefined') || statement.log) {
                                logCommand(statement.raw);
                            }
                            if (typeof statement.controls !== 'undefined') {
                                delete statement.controls;
                            }
                        } else if (consume !== false) {
                            // consume is indeed a new statement that replaces previous one
                            stack[executionLevel][stackPointer[executionLevel]] = consume;
                        }
                    }
                }
                running = false;
            } catch (err) {
                clear();
                if (err instanceof TError) {
                    err.setCode(statement.raw);
                    if (typeof statement.programName === 'undefined' || statement.programName === null) {
                        // no program associated: remove lines if any
                        err.setLines([]);
                    } else {
                        // set program name
                        err.setProgramName(statement.programName);
                    }
                }
                if (typeof errorHandler !== 'undefined') {
                    errorHandler(err);
                } else {
                    throw err;
                }
            }
        };

        /* Variable management */

        var getVariable = function(identifier) {
            if (typeof (runtimeFrame[identifier]) !== 'undefined') {
                return runtimeFrame[identifier];
            }
        };

        var saveVariable = function(identifier) {
            if (typeof (runtimeFrame[identifier]) !== 'undefined') {
                if (typeof localVariables[blockLevel] === 'undefined') {
                    localVariables[blockLevel] = {};
                }
                localVariables[blockLevel][identifier] = runtimeFrame[identifier];
            }
        };

        var restoreVariable = function(identifier) {
            if (typeof localVariables[blockLevel + 1] !== 'undefined') {
                if (typeof localVariables[blockLevel + 1][identifier] !== 'undefined') {
                    runtimeFrame[identifier] = localVariables[blockLevel + 1][identifier];
                    delete localVariables[blockLevel + 1][identifier];
                } else {
                    delete runtimeFrame[identifier];
                }
            } else {
                delete runtimeFrame[identifier];
            }
        };

        /* Block management */

        var enterBlock = function() {
            blockLevel++;
            currentVariables = [];
        };

        var leaveBlock = function() {
            // local variable management: erase any locally created variables
            blockLevel--;
            for (var j = 0; j < currentVariables.length; j++) {
                restoreVariable(currentVariables[j]);
            }
            currentVariables = [];
        };

        /* Execution level management */

        var raiseExecutionLevel = function(caller) {
            if (typeof caller !== 'undefined') {
                callers.push(caller);
            }
            executionLevel++;
            stack[executionLevel] = [];
            cached[executionLevel] = [];
        };

        var lowerExecutionLevel = function(value) {
            if (executionLevel > 0) {
                stack[executionLevel] = [];
                cached[executionLevel] = [];
                executionLevel--;
                if (callers.length > executionLevel) {
                    var expression = callers.pop();
                    expression.result = value;
                    cached[executionLevel].push(expression);
                }
            }
        };

        /* Main Eval function */

        var defaultEval = function(literal) {
            return runtimeFrame.eval(literal);
        };

        /* Statements management */

        var defaultEvalStatement = function(statement) {
            defaultEval(statement.raw);
            return true;
        };

        var evalBlockStatement = function(statement) {
            enterBlock();
            insertStatement({type: "ControlOperation", operation: "leaveBlock"});
            insertStatements(statement.body);
            return true;
        };

        var evalExpressionStatement = function(statement) {
            evalExpression(statement.expression, true);
            return true;
        };

        var evalIfStatement = function(statement) {
            var result = evalExpression(statement.test, true);
            if (result) {
                insertStatement(statement.consequent);
            } else if (statement.alternate !== null) {
                insertStatement(statement.alternate);
            }
            return true;
        };

        var evalLabeledStatement = function(statement) {
            throw "LabeledStatement Not Implemented yet";
        };

        var evalBreakStatement = function(statement) {
            throw "BreakStatement Not Implemented yet";
        };

        var evalContinueStatement = function(statement) {
            throw "ContinueStatement Not Implemented yet";
        };

        var evalWithStatement = function(statement) {
            throw "With statement is not supported";
        };

        var evalSwitchStatement = function(statement) {
            if (typeof statement.controls === 'undefined') {
                statement.controls = {index: 0, discriminant: evalExpression(statement.discriminant, true)};
            }
            var result = false;
            var switchCase;
            while (statement.controls.index < statement.cases.length && !result) {
                switchCase = statement.cases[statement.controls.index];
                if (switchCase.test === null) {
                    result = true;
                } else {
                    result = (statement.controls.discriminant === evalExpression(switchCase.test, true));
                }
                statement.controls.index++;
            }
            if (result) {
                insertStatements(switchCase.consequent);
                return false;
            } else {
                return true;
            }
        };

        var evalReturnStatement = function(statement) {
            if (executionLevel > 0) {
                var value = evalExpression(statement.argument);
                lowerExecutionLevel(value);
                return true;
            } else {
                // on function call: we just stop evaluation
                stop();
                return true;
            }
        };

        var evalThrowStatement = function(statement) {
            throw "ThrowStatement Not Implemented yet";
        };

        var evalTryStatement = function(statement) {
            throw "TryStatement Not Implemented yet";
        };

        var evalWhileStatement = function(statement) {
            var result = evalExpression(statement.test, true);
            if (result) {
                insertStatement(statement.body);
                // statement not consumed
                return false;
            } else {
                // statement consumed
                return true;
            }
        };

        var evalDoWhileStatement = function(statement) {
            if (typeof statement.controls === 'undefined') {
                statement.controls = {init: false};
            }
            if (!statement.controls.init) {
                // first body execution has not occured yet
                insertStatement(statement.body);
                statement.controls.init = true;
                return false;
            } else {
                var result = evalExpression(statement.test, true);
                if (result) {
                    insertStatement(statement.body);
                    // statement not consumed
                    return false;
                } else {
                    // statement consumed
                    return true;
                }
            }
        };

        var evalForStatement = function(statement) {
            if (typeof statement.controls === 'undefined') {
                statement.controls = {init: false};
            }
            if (!statement.controls.init) {
                // init has not been performed yet
                if (statement.init.type === "VariableDeclaration") {
                    insertStatement(statement.init);
                } else {
                    insertStatement({type: "ExpressionStatement", expression: statement.init});
                }
                statement.controls.init = true;
                return false;
            } else {
                var result = evalExpression(statement.test, true);
                if (result) {
                    insertStatement(statement.update);
                    insertStatement(statement.body);
                    // statement not consumed
                    return false;
                } else {
                    // statement consumed
                    return true;
                }
            }
        };

        var evalForInStatement = function(statement) {
            throw "For In Not Implemented yet";
        };

        var evalDebuggerStatement = function(statement) {
            defaultEvalStatement(statement);
        };

        var evalRepeatStatement = function(statement) {
            if (typeof statement.controls === 'undefined') {
                statement.controls = {};
                if (statement.count !== null) {
                    var count = evalExpression(statement.count, true);
                    if (isNaN(count)) {
                        //TODO: throw real TError
                        throw "count is not an integer";
                    }
                    statement.controls.count = count;
                } else {
                    statement.controls.count = null;
                }
                statement.controls.loop = 0;
            } else if (typeof statement.controls.interrupt !== "undefined") {
                // Loop interrupted
                return true;
            }
            statement.controls.loop++;
            // loop management
            if (statement.controls.loop > MAX_LOOP) {
                // suspend execution in order to allow interruption
                statement.controls.loop = 0;
                loopSuspended = true;
                setTimeout(function() {
                    if (loopSuspended) {
                        loopSuspended = false;
                        run();
                    }
                }, 0);
            }
            if (statement.controls.count !== null) {
                if (statement.controls.count > 0) {
                    statement.controls.count--;
                    insertStatement(statement.body);
                    return false;
                } else { 
                    return true;
                }
            } else {
                insertStatement(statement.body);
                return false;
            }
        };

        var evalVariableDeclaration = function(declaration) {
            for (var i = 0; i < declaration.declarations.length; i++) {
                var declarator = declaration.declarations[i];
                var identifier = evalExpression(declarator.id);
                // local variables management: save preceeding value if any
                saveVariable(identifier);
                currentVariables.push(identifier);
                if (declarator.init !== null) {
                    var value;
                    if (typeof declarator.computed !=='undefined' && declarator.computed) {
                        value = declarator.init;
                    } else {
                        value = evalExpression(declarator.init);
                    }
                    defaultEval("var " + identifier + "=" + value);
                } else {
                    defaultEval("var " + identifier);
                }
            }
            return true;
        };

        var evalFunctionDeclaration = function(declaration) {
            var identifier = evalExpression(declaration.id);
            definedFunctions[identifier] = {'body': declaration.body, 'params': declaration.params};
            // still declare function, so that it can be recognized later on
            // e.g. if used in an identifier expression
            var params = declaration.params;
            var paramsString;
            if (params.length > 0) {
                paramsString = "(" + params[0].name;
                for (var i = 1; i < params.length; i++) {
                    paramsString += "," + params[i].name;
                }
                paramsString += ")";
            } else {
                paramsString = '()';
            }
            defaultEval("function " + identifier + paramsString + declaration.body.raw);
            return true;
        };

        var evalStatement = function(statement) {
            try {
                var result;
                var currentLevel = executionLevel;
                switch (statement.type) {
                    case "BlockStatement":
                        result = evalBlockStatement(statement);
                        break;
                    case "ExpressionStatement":
                        result = evalExpressionStatement(statement);
                        break;
                    case "IfStatement":
                        result = evalIfStatement(statement);
                        break;
                    case "LabeledStatement":
                        result = evalLabeledStatement(statement);
                        break;
                    case "BreakStatement":
                        result = evalBreakStatement(statement);
                        break;
                    case "ContinueStatement":
                        result = evalContinueStatement(statement);
                        break;
                    case "WithStatement":
                        result = evalWithStatement(statement);
                        break;
                    case "SwitchStatement":
                        result = evalSwitchStatement(statement);
                        break;
                    case "ReturnStatement":
                        result = evalReturnStatement(statement);
                        break;
                    case "ThrowStatement":
                        result = evalThrowStatement(statement);
                        break;
                    case "TryStatement":
                        result = evalTryStatement(statement);
                        break;
                    case "WhileStatement":
                        result = evalWhileStatement(statement);
                        break;
                    case "DoWhileStatement":
                        result = evalDoWhileStatement(statement);
                        break;
                    case "ForStatement":
                        result = evalForStatement(statement);
                        break;
                    case "ForInStatement":
                        result = evalForInStatement(statement);
                        break;
                    case "DebuggerStatement":
                        result = evalDebuggerStatement(statement);
                        break;
                    case "RepeatStatement":
                        result = evalRepeatStatement(statement);
                        break;
                    case "ParametersDeclaration":
                    case "VariableDeclaration":
                        result = evalVariableDeclaration(statement);
                        break;
                    case "FunctionDeclaration":
                        result = evalFunctionDeclaration(statement);
                        break;
                    case "ControlOperation":
                        switch (statement.operation) {
                            case "leaveBlock":
                                leaveBlock();
                                break;
                            case "leaveFunction":
                                lowerExecutionLevel(null);
                                break;
                        }
                        result = true;
                        break;
                    default:
                        result = defaultEvalStatement(statement);
                        break;
                }
                if (executionLevel === currentLevel) {
                    // we haven't changed execution level
                    // statement is over: remove cached values
                    while (cached[executionLevel].length > 0) {
                        var expression = cached[executionLevel].pop();
                        delete expression.result;
                    }
                }
                return result;
            } catch (err) {
                if (err instanceof levelRaisedException) {
                    // level was raised: we keep statement in stack
                    return false;
                } else if (err instanceof suspendedException) {
                    // running was stopped during statement execution: we keep statement in stack
                    return false;
                } else {
                    if (!(err instanceof TError)) {
                        var error = new TError(err);
                        error.setLines([statement.loc.start.line, statement.loc.end.line]);
                        error.detectError();
                        throw error;
                    } else {
                        throw err;
                    }
                }
            }
        };

        /* Expressions management */

        var defaultEvalExpression = function(expression) {
            return expression.raw;
        };

        var callFunction = function(block, params, args, expression) {
            var values = [];
            var i = 0;
            for (i = 0; i < args.length; i++) {
                if (i < params.length) {
                    values.push({'type': 'VariableDeclarator', 'id': params[i], 'init': args[i]});
                }
            }
            if (typeof expression.parameter !== 'undefined') {
                values.push({'type': 'VariableDeclarator', 'id': params[i], 'init': expression.parameter, 'computed':true});
            }
            if (block.body.length > 0 && block.body[0].type === 'ParametersDeclaration') {
                // reuse existing parameters declaration
                block.body[0]['declarations'] = values;
            } else {
                var parameters = {'type': 'ParametersDeclaration', 'declarations': values, 'kind': 'var'};
                block.body.unshift(parameters);
            }
            // start a new executionLevel
            raiseExecutionLevel(expression);
            insertStatement({type: "ControlOperation", operation: "leaveFunction"});
            insertStatement(block);

            // interrupt current execution so that upper execution level is handled
            throw new levelRaisedException();
        };

        var evalFunctionExpression = function(expression, callback) {
            throw "Function Expression Not Implemented yet";
        };

        var evalSequenceExpression = function(expression) {
            var sequence = "";
            for (var i = 0; i < expression.expressions.length; i++) {
                sequence += evalExpression(expression.expressions[i]);
            }
            return sequence;
        };

        var evalUnaryExpression = function(expression) {
            if (expression.prefix) {
                return expression.operator + evalExpression(expression.argument);
            } else {
                return evalExpression(expression.argument) + expression.operator;
            }
        };

        var evalBinaryExpression = function(expression) {
            return evalExpression(expression.left) + expression.operator + evalExpression(expression.right);
        };

        var evalAssignementExpression = function(expression) {
            return evalExpression(expression.left) + expression.operator + evalExpression(expression.right);
        };

        var evalUpdateExpression = function(expression) {
            if (expression.prefix) {
                return expression.operator + evalExpression(expression.argument);
            } else {
                return evalExpression(expression.argument) + expression.operator;
            }
        };

        var evalLogicalExpression = function(expression) {
            return evalExpression(expression.left) + expression.operator + evalExpression(expression.right);
        };

        var evalConditionalExpression = function(expression) {
            var value = evalExpression(expression.test, true);
            if (value) {
                return evalExpression(expression.consequent);
            } else {
                return evalExpression(expression.alternate);
            }
        };

        var evalCallExpression = function(expression) {
            var callLiteral = evalExpression(expression.callee);
            if (expression.callee.type === 'Identifier' && typeof definedFunctions[callLiteral] !== 'undefined') {
                // we need to call the function with given parameters
                return callFunction(definedFunctions[callLiteral]['body'], definedFunctions[callLiteral]['params'], expression.arguments, expression);
                // TODO: handle case of functionexpression called
            } else {
                var argsString = "(";
                for (var i = 0; i < expression.arguments.length; i++) {
                    if (i > 0) {
                        argsString += ",";
                    }
                    argsString += evalExpression(expression.arguments[i]);
                }
                argsString += ")";
                return callLiteral + argsString;
            }
        };

        var evalNewExpression = function(expression) {
            var className = evalExpression(expression.callee);
            var argsString = "(";
            for (var i = 0; i < expression.arguments.length; i++) {
                if (i > 0) {
                    argsString += ",";
                }
                argsString += evalExpression(expression.arguments[i]);
            }
            argsString += ")";
            return "new " + className + argsString;
        };

        var evalMemberExpression = function(expression) {
            var objectName = evalExpression(expression.object);
            var propertyName = evalExpression(expression.property);
            if (expression.computed) {
                return objectName + "[" + propertyName + "]";
            } else {
                return objectName + "." + propertyName;
            }
        };

        var evalIdentifier = function(expression) {
            return expression.name;
        };

        var evalLiteral = function(expression) {
            var value;
            if (typeof expression.value === "string") {
                value = "\"" + TUtils.addslashes(expression.value) + "\"";
            } else {
                value = expression.value;
            }
            return value;
        };

        var evalExpression = function(expression, eval) {
            if (suspended) {
                // execution has been suspended during statement : we stop
                throw new suspendedException();
            }
            if (typeof expression.result !== 'undefined') {
                // expression was already evaluated: return result
                return expression.result;
            }

            if (typeof eval === "undefined") {
                eval = false;
            }
            try {
                var result;
                switch (expression.type) {
                    case "FunctionExpression":
                        result = evalFunctionExpression(expression);
                        break;
                    case "SequenceExpression":
                        result = evalSequenceExpression(expression);
                        break;
                    case "UnaryExpression":
                        result = evalUnaryExpression(expression);
                        break;
                    case "BinaryExpression":
                        result = evalBinaryExpression(expression);
                        break;
                    case "AssignmentExpression":
                        result = evalAssignementExpression(expression);
                        break;
                    case "UpdateExpression":
                        result = evalUpdateExpression(expression);
                        break;
                    case "LogicalExpression":
                        result = evalLogicalExpression(expression);
                        break;
                    case "ConditionalExpression":
                        result = evalConditionalExpression(expression);
                        break;
                    case "CallExpression":
                        result = evalCallExpression(expression);
                        break;
                    case "NewExpression":
                        result = evalNewExpression(expression);
                        break;
                    case "MemberExpression":
                        result = evalMemberExpression(expression);
                        break;
                    case "Identifier":
                        result = evalIdentifier(expression);
                        break;
                    case "Literal":
                        result = evalLiteral(expression);
                        break;
                    default:
                        result = defaultEvalExpression(expression);
                        break;
                }
                // store result in case execution of current statement is interrupted
                if (eval) {
                    result = defaultEval(result);
                }
                expression.result = result;
                cached[executionLevel].push(expression);
                return result;
            } catch (err) {
                if (!(err instanceof TError || err instanceof levelRaisedException)) {
                    var error = new TError(err);
                    error.setLines([expression.loc.start.line, expression.loc.end.line]);
                    error.detectError();
                    throw error;
                } else {
                    throw err;
                }
            }
        };

    }


    return TInterpreter;
});


