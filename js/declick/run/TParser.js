define(['acorn'], function(acorn) {
    /**
     * TParser parses the code into statements, using the parser acorn.
     * @exports TParser
     */
    function TParser() {
        var options = {locations: true, forbidReserved: "everywhere"};
        
        this.setRepeatKeyword = function(name) {
            acorn.setRepeatKeyword(name);
        };        

        /**
         * Parse code to statements.
         * @param {String} code
         * @returns {String[]}
         */
        this.parse = function(input, programName) {
            if (programName) {
                options["sourceFile"] = programName;
            } else {
                options["sourceFile"] = null;
            }
            
            var result = acorn.parse(input, options);
            // return statements
            return result;
        };
    }

    var parserInstance = new TParser();

    return parserInstance;
});


