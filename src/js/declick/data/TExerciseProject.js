define(['TEnvironment', 'TRuntime', 'TProject', 'TError', 'TParser', 'objects'], function(TEnvironment, TRuntime, TProject, TError, TParser) {
    /**
    * TExercise manage exercises in "Learn" part of Declick.
    * @exports TExercise
    */
    function TExerciseProject() {
        // associated project
        var project = new TProject();
        TEnvironment.setProject(project);
        var checkStatements = false;
        var initStatements = false;
        var startStatements = false;
        var endStatements = false;
        var exerciseStatements = false;
        var exercise = false;
        var userCode = false;
        var solutionCode = false;
        var instructions = false;
        var hints = false;
        //TODO: generate this name dynamically and find a way to protect it
        var name = "exercise_123456";
        var frame = false;

        /**
        * Set Project's ID.
        * @param {String} value
        */
        this.setId = function(value) {
            project.setId(value);
        };

        /**
        * Returns Project's ID.
        * @returns {String}
        */
        this.getId = function() {
            return project.getId();
        };

        /**
        * Checks if Exercise has insructions.
        * @returns {Boolean}
        */
        this.hasInstructions = function() {
            return (instructions !== false);
        };

        /**
        * Checks if Exercise has a solution.
        * @returns {Boolean}
        */
        this.hasSolution = function() {
            return (solutionCode !== false);
        };

        /**
        * Checks if Exercise has hints.
        * @returns {Boolean}
        */
        this.hasHints = function() {
            return (hints !== false);
        };

        /**
        * Checks if Exercise has start statementse.
        * @returns {Boolean}
        */
        this.hasStart = function() {
            return (startStatements !== false);
        };

        /**
        * Checks if Exercise has iit statementse.
        * @returns {Boolean}
        */
        this.hasInit = function() {
            return (initStatements !== false);
        };


        /**
        * Checks if Exercise has end statementse.
        * @returns {Boolean}
        */
        this.hasEnd = function() {
            return (endStatements !== false);
        };

        /**
        * Checks if Exercise has check statements.
        * @returns {Boolean}
        */
        this.hasCheck = function() {
            return (checkStatements !== false);
        };

        /**
        * Checks if Exercise has user code.
        * @returns {Boolean}
        */
        this.hasUserCode = function() {
            return (userCode !== false);
        };

        /**
        * Get Project's instructions if defined.
        * @param {Function} callback
        */
        this.getInstructions = function(callback) {
            if (instructions !== false) {
                project.getResourceContent("instructions.html", callback);
            }
        };

        /**
        * Returns solution code.
        * @returns {String}
        */
        this.getSolution = function() {
            if (solutionCode !== false) {
                return solutionCode;
            }
        };

        /**
        * Get Project's hints.
        * @param {function} callback
        */
        this.getHints = function(callback) {
            if (hints !== false) {
                project.getResourceContent("hints.html", callback);
            }
        };

        /**
        * Get User code.
        * @param {function} callback
        */
        this.getUserCode = function(callback) {
            if (userCode !== false) {
                return userCode;
            }
        };

        this.executeInit = function ()
        {
            if (initStatements !== false) {
                TRuntime.executeStatements(initStatements);
            }
        };

        /**
        * Exectute init statements if any.
        */
        this.init = function() {
            if (exerciseStatements !== false) {
                TRuntime.executeStatements(exerciseStatements);
                exercise = TRuntime.getTObject(name);
                exercise.setFrame(frame);
            }
            this.executeInit();
        };

        /**
        * Exectute start statements if any.
        */
        this.start = function() {
            if (startStatements !== false) {
                TRuntime.executeStatements(startStatements);
            }
        };

        /**
        * Exectute end statements if any.
        */
        this.end = function() {
            if (endStatements !== false) {
                TRuntime.executeStatements(endStatements);
            }
        };

        /**
        * Execute check statements if any.
        */
        this.check = function(statements, callback) {
            exercise.setStatements(statements);
            if (checkStatements !== false) {
                TRuntime.evaluate(checkStatements, callback);
            }
        };

        /**
        * Loads solution code.
        * @param {Function} callback
        */
        var loadSolution = function(callback) {
            project.getProgramCode("solution", function(result) {
                if (!(result instanceof TError)) {
                    solutionCode = result;
                }
                callback.call(this);
            });
        };

        /**
        * Loads user code.
        * @param {Function} callback
        */
        var loadUserCode = function(callback) {
            project.getProgramCode("user", function(result) {
                if (!(result instanceof TError)) {
                    userCode = result;
                }
                callback.call(this);
            });
        };        

        /** Loads exercise
        * @param {Function} callback
        */
        var loadExercise = function(callback) {
            project.getProgramCode("exercise", function(result) {
                if (!(result instanceof TError)) {
                    var code = name+"= new Exercise();\n";
                    code += "(function(){\n";
                    code += result;
                    code +="\nreturn this;\n}).call("+name+")";
                    exerciseStatements = TParser.parse(code);
                    initStatements = TParser.parse(name+".init()");
                    startStatements = TParser.parse(name+".start()");
                    endStatements = TParser.parse(name+".end()");
                    checkStatements = TParser.parse(name+".check()");
                }
                callback.call(this);
            });
        };

        /**
        * Initialize Exercise.
        * @param {Function} callback
        * @param {Integer} id
        */
        this.load = function(callback, id) {
            checkStatements = false;
            initStatements = false;
            startStatements = false;
            endStatements = false;
            solutionCode = false;
            instructions = false;
            hints = false;

            project.init(function() {
                // 1st check existing programs
                var programs = project.getProgramsNames();
                var solutionPresent = false;
                var exercisePresent = false;
                var userCodePresent = false;
                var toLoad = 0;

                if (programs.indexOf("solution") > -1) {
                    toLoad++;
                    solutionPresent = true;
                }

                if (programs.indexOf("exercise") > -1) {
                    toLoad++;
                    exercisePresent = true;
                }

                if (programs.indexOf("user") > -1) {
                    toLoad++;
                    userCodePresent = true;
                }

                // 2nd check existing resources
                var resources = project.getResourcesNames();
                if (resources.indexOf("instructions.html") > -1) {
                    instructions = true;
                }

                if (programs.indexOf("hints.html") > -1) {
                    hints = true;
                }

                // 3rd load statements
                if (toLoad===0) {
                    // In case there is nothing to load: call callback now
                    callback.call(this);
                }
                var checkLoad = function() {
                    toLoad--;
                    if (toLoad===0) {
                        callback.call(this);
                    }
                };
                if (solutionPresent) {
                    loadSolution(checkLoad);
                }
                if (exercisePresent) {
                    loadExercise(checkLoad);
                }
                if (userCodePresent) {
                    loadUserCode(checkLoad);
                }
            }, id);

        };

        this.setFrame = function(aFrame) {
            frame = aFrame;
            if (exercise) {
                exercise.setFrame(aFrame);
            }
        };
    }

    return TExerciseProject;
});
