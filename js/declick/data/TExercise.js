define(['TEnvironment', 'TRuntime', 'TProject', 'TError'], function(TEnvironment, TRuntime, TProject, TError) {
    /**
     * TExercise manage exercises in "Learn" part of Declick.
     * @exports TExercise
     */
    function TExercise() {
        // associated project
        var project = new TProject();
        TEnvironment.setProject(project);
        var checkStatements = false;
        var initStatements = false;
        var startStatements = false;
        var endStatements = false;
        var solutionCode = false;
        var instructions = false;
        var hints = false;

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
         * Exectute init statements if any.
         */
        this.init = function() {
            if (initStatements !== false) {
                TRuntime.executeStatements(initStatements);
            }
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
        this.check = function() {
            if (checkStatements !== false) {
                TRuntime.executeStatements(checkStatements);
            }
        };
        
        /**
         * Loads init statements.
         * @param {Function} callback
         */
        var loadInit = function(callback) {
            project.getProgramStatements("init", function(result) {
                if (!(result instanceof TError)) {
                    initStatements = result;
                }
                callback.call(this);
            });
        };

        /**
         * Loads start statements.
         * @param {Function} callback
         */
        var loadStart = function(callback) {
            project.getProgramStatements("start", function(result) {
                if (!(result instanceof TError)) {
                    startStatements = result;
                }
                callback.call(this);
            });
        };

        /**
         * Loads end statements.
         * @param {Function} callback
         */
        var loadEnd = function(callback) {
            project.getProgramStatements("end", function(result) {
                if (!(result instanceof TError)) {
                    endStatements = result;
                }
                callback.call(this);
            });
        };
        
        /**
         * Loads check statements.
         * @param {Function} callback
         */
        var loadCheck = function(callback) {
            project.getProgramStatements("check", function(result) {
                if (!(result instanceof TError)) {
                    checkStatements = result;
                }
                callback.call(this);
            });
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
                var initPresent = false;
                var startPresent = false;
                var endPresent = false;
                var checkPresent = false;
                var solutionPresent = false;
                var toLoad = 0;
                
                if (programs.indexOf("init") > -1) {
                    toLoad++;
                    initPresent = true;
                }

                if (programs.indexOf("start") > -1) {
                    toLoad++;
                    startPresent = true;
                }

                if (programs.indexOf("end") > -1) {
                    toLoad++;
                    endPresent = true;
                }

                if (programs.indexOf("check") > -1) {
                    toLoad++;
                    checkPresent = true;
                }

                if (programs.indexOf("solution") > -1) {
                    toLoad++;
                    solutionPresent = true;
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
                var checkLoad = function() {
                    toLoad--;
                    if (toLoad===0) {
                        callback.call(this);
                    }
                };
                if (initPresent) {
                    loadInit(checkLoad);
                }
                if (startPresent) {
                    loadStart(checkLoad);
                }
                if (endPresent) {
                    loadEnd(checkLoad);
                }
                if (checkPresent) {
                    loadCheck(checkLoad);
                }
                if (solutionPresent) {
                    loadSolution(checkLoad);
                }
            }, id);
            
        };
    }
    
    return TExercise;
});