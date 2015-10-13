define(['acorn'], function(acorn) {
    /**
     * TParser parses the code into statements, using the parser acorn.
     * @exports TParser
     */
    function TParser() {
        var options = {locations: true, forbidReserved: "everywhere"};

        var globalReserved = ['window', 'document', 'eval'];

        acorn.addReservedWords(globalReserved);

        /**
         * Add reserved identifiers.
         * @param {String[]} names
         */
        this.protectIdentifiers = function(names) {
            acorn.addReservedIdentifiers(names);
        };
        
        this.setRepeatKeyword = function(name) {
            acorn.setRepeatKeyword(name);
        };        

        /**
         * Parse code to statements.
         * @param {String} code
         * @returns {String[]}
         */
        this.parse = function(input) {
            var result = acorn.parse(input, options);
            // return statements
            return result.body;
        };
    }

    var parserInstance = new TParser();

    return parserInstance;
});


