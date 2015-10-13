var requireTest = require.config({
    context: "new",
    "baseUrl": '../declick', // declick directory
    paths: {
        "jasmine": '../libs/jasmine-2.1.3/jasmine',
        "jasmine-html": '../libs/jasmine-2.1.3/jasmine-html',
        "jasmine-boot": '../libs/jasmine-2.1.3/boot_without_onload'
    },
    map: {
        '*': {
            "TEnvironment": "objects/tests/TEnvironment_mock",
            "TRuntime": "objects/tests/tests/TRuntime_mock",
            "TObject": "objects/tests/tests/TObject_mock"
        }
    }
});
requireTest(['jasmine', 'jasmine-html', 'jasmine-boot', 'TUtils'], function (jasmine, jasminehtml, jasmineboot, TUtils) {
    var tested;
    var result;
    describe("isDelimiterEnded", function () {
        it("Not ended string", function () {
            tested = TUtils.isDelimiterEnded("direction.ajouterCommande");
            expect(false).toBe(tested);
        });
        it("Sharp ended string", function () {
            tested = TUtils.isDelimiterEnded("direction.ajouterCommande(#");
            expect(true).toBe(tested);
        });
        it("Sharp ended spaced string", function () {
            tested = TUtils.isDelimiterEnded("direction.ajouterCommande(  #");
            expect(true).toBe(tested);
        });
        it("Double backslashed ended string", function () {
            tested = TUtils.isDelimiterEnded("direction.ajouterCommande(\\");
            expect(true).toBe(tested);
        });
    });
    describe("isACommand", function () {
        it("Quoted ended string", function () {
            tested = TUtils.isACommand('direction.ajouterCommandes(');
            expect(true).toBe(tested);
        });
        it("Quoted ended string with capital", function () {
            tested = TUtils.isACommand('Direction.ajouterCommandes(');
            expect(true).toBe(tested);
        });
        it("Quoted simple command ended string", function () {
            tested = TUtils.isACommand('direction.ajouter(');
            expect(true).toBe(tested);
        });
        it("Not quoted simple command ended string", function () {
            tested = TUtils.isACommand('direction.ajouter("');
            expect(false).toBe(tested);
        });
    });
    describe("isNewInstanceStringed", function () {
        it("Instancied new object", function () {
            tested = TUtils.isNewInstanceStringed('direction = new Categorie("');
            expect(true).toBe(tested);
        });
        it("Instancied new object with capital", function () {
            tested = TUtils.isNewInstanceStringed('Direction = new Categorie("');
            expect(true).toBe(tested);
        });
        it("Simple instancied object", function () {
            tested = TUtils.isNewInstanceStringed('Direction = new Categorie(');
            expect(false).toBe(tested);
        });
    });
    describe("isComparison", function () {
        it("Simple instancied object", function () {
            tested = TUtils.isComparison('regis =');
            expect(true).toBe(tested);
        });
        it("Simple instancied object with spaces", function () {
            tested = TUtils.isComparison('regis = ');
            expect(true).toBe(tested);
        });
        it("Double equal", function () {
            tested = TUtils.isComparison('regis ==');
            expect(true).toBe(tested);
        });
        it("Double equal with spaces", function () {
            tested = TUtils.isComparison('regis == ');
            expect(true).toBe(tested);
        });
        it("Triple equal", function () {
            tested = TUtils.isComparison('regis ===');
            expect(true).toBe(tested);
        });
        it("Triple equal with spaces", function () {
            tested = TUtils.isComparison('regis ===');
            expect(true).toBe(tested);
        });
        it("Different", function () {
            tested = TUtils.isComparison('regis !=');
            expect(true).toBe(tested);
        });
        it("Different with spaces", function () {
            tested = TUtils.isComparison('regis !=');
            expect(true).toBe(tested);
        });
        it("Different with type verified", function () {
            tested = TUtils.isComparison('regis !==');
            expect(true).toBe(tested);
        });
        it("Different with type verified and spaces", function () {
            tested = TUtils.isComparison('regis !==');
            expect(true).toBe(tested);
        });
    });
    describe("isStringElement", function () {
        it("variable plus", function () {
            tested = TUtils.isStringElement('stringCharacter +');
            expect(true).toBe(tested);
        });
        it("string plus", function () {
            tested = TUtils.isStringElement('stringCharacter" +');
            expect(true).toBe(tested);
        });
        it("string ended argument style", function () {
            tested = TUtils.isStringElement('stringCharacter",');
            expect(true).toBe(tested);
        });
        it("string ended argument style with space", function () {
            tested = TUtils.isStringElement('stringCharacter", ');
            expect(true).toBe(tested);
        });
        it("string ended", function () {
            tested = TUtils.isStringElement('stringCharacter"');
            expect(false).toBe(tested);
        });
    });
    describe("isElsePresent", function () {
        it("Not else command", function () {
            tested = TUtils.isElsePresent('regis =');
            expect(false).toBe(tested);
        });
        /*
         it("else command", function () {
         tested = TUtils.isElsePresent('a lot of string caract else some strings');
         expect(true).toBe(tested);
         });
         it("Block with else command", function () {
         tested = TUtils.isElsePresent('a lot of string caract else{caract;} strings');
         expect(true).toBe(tested);
         });
         it("else command with block", function () {
         tested = TUtils.isElsePresent('a lot of string caract {caract;}else strings');
         expect(true).toBe(tested);
         });
         */
        it("ended \"else\" word", function () {
            tested = TUtils.isElsePresent('a lot of string caract Paracelse some strings');
            expect(false).toBe(tested);
        });
        it("Begining \"else\" word", function () {
            tested = TUtils.isElsePresent('a lot of string caract elsesome strings');
            expect(false).toBe(tested);
        });
        it("\"else\" alone", function () {
            tested = TUtils.isElsePresent('else');
            expect(true).toBe(tested);
        });
    });
    describe("someDelimiters", function () {

        // it("Level 0", function () {
        // var tested = TUtils.someDelimiters(1);
        // expect( '##').toBe(tested);
        // });
        it("Level 1", function () {
            tested = TUtils.someDelimiters(1);
            expect('##').toBe(tested);
        });
        it("Level 2", function () {
            tested = TUtils.someDelimiters(2);
            expect('###').toBe(tested);
        });
    });
    describe("addQuoteDelimiters - simples cases", function () {

        it("Already sharp parsed string", function () {
            result = 'direction.ajouterCommande(#"s#", #"c#")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('direction.ajouterCommande(#"s#", #"c#")').toBe(tested);
        });
        it("Incomplete already parsed string", function () {
            result = 'Direction.ajouterCommande(#"touche#", "c")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('Direction.ajouterCommande(#"touche#", #"c#")').toBe(tested);
        });
        it("Already escaped parsed string", function () {
            result = 'direction.ajouter(\"touche\", \"commande\")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('direction.ajouter(#"touche#", #"commande#")').toBe(tested);
        });
        it("Uncomplete already escaped parsed string", function () {
            result = 'direction.addCommandWithOpt(\"t\", \"c\")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('direction.addCommandWithOpt(#"t#", #"c#")').toBe(tested);
        });
        it("Uncomplete already escaped parsed string without spaces", function () {
            result = 'direction.ajouterCommande(\"t\",\"commande\",\"another option\")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('direction.ajouterCommande(#"t#",#"commande#",#"another option#")').toBe(tested);
        });
        it("String to parse", function () {
            result = 'direction.ajouterCommande("t", "command")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('direction.ajouterCommande(#"t#", #"command#")').toBe(tested);
        });
    });
    describe("addQuoteDelimiters - nested strings", function () {

        it("Already sharp parsed nested strings", function () {
            result = 'direction.ajouterCommande(#"touche#", #"perso.getNestedOption(##"level2##")#")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('direction.ajouterCommande(#"touche#", #"perso.getNestedOption(##"level2##")#")').toBe(tested);
        });
        // it("Incomplete already nested string", function () {
        // var sharpedQuote = 'direction.ajouterCommande(#"touche#", #"perso.getNestedOption("level2")#")';
        // tested = TUtils.addQuoteDelimiters(sharpedQuote);
        // expect('direction.ajouterCommande(#"touche#", #"perso.getNestedOption(##"level2##")#")').toBe(tested);
        // });
        // it("Already escaped nested string", function () {
        // var sharpedQuote = 'direction.ajouterCommande(\"touche\", \"perso.getNestedOption(\\"level2\\")\"';
        // tested = TUtils.addQuoteDelimiters(sharpedQuote);
        // expect('direction.ajouterCommande(#"touche#", #"perso.getNestedOption(##"level2##")#').toBe(tested);
        // });
        it("Uncomplete already escaped parsed string", function () {
            result = 'direction.ajouterCommande("touche", "perso.getNestedOption("level2")")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('direction.ajouterCommande(#"touche#", #"perso.getNestedOption(##"level2##")#")').toBe(tested);
        });
        it("String to parse", function () {
            result = 'direction.addCommand("t", "command")';
            tested = TUtils.addQuoteDelimiters(result);
            expect('direction.addCommand(#"t#", #"command#")').toBe(tested);
        });

    });
    describe("parseQuotes", function () {
        it("Already sharp parsed nested strings", function () {
            result = 'obj.method(#"obj2.methode2(##"command##")#")';
            tested = TUtils.parseQuotes(result);
            expect('obj.method(\\\\"obj2.methode2(\\\\\\"command\\\\\\")\\\\")').toBe(tested);
        });
    });
    window.executeTests();
});
