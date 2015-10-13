var requireTest = require.config({
    context:"new",
    "baseUrl":'../../',
    paths: {
        "jasmine":'../../libs/jasmine-2.1.3/jasmine',
        "jasmine-html":'../../libs/jasmine-2.1.3/jasmine-html',
        "jasmine-boot":'../../libs/jasmine-2.1.3/boot_without_onload',
        "jquery":'../../libs/jquery-1.11.1/jquery-1.11.1.min'        
    },
    map: {
        '*': {
            "TEnvironment":"tests/TEnvironment_mock",
            "TRuntime":"tests/TRuntime_mock",
            "TObject":"tests/TObject_mock",
            "TGraphicalObject":"tests/TGraphicalObject_mock",
            "TUtils":"tests/TUtils_mock",
            "CommandManager":"tests/CommandManager_mock"
        }
    }
});

requireTest(["jasmine", "jasmine-html", "jasmine-boot", "button/Button"], function() {
    describe("A suite", function() {
        it("contains spec with an expectation", function() {
            expect(true).toBe(true);
        });
    });
    
    window.executeTests();
});
