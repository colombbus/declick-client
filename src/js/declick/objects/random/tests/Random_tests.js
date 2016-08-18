var requireTest = require.config({
    context:"new",
    "baseUrl":'../../',
    paths: {
        "jasmine":'../../libs/jasmine-2.1.3/jasmine',
        "jasmine-html":'../../libs/jasmine-2.1.3/jasmine-html',
        "jasmine-boot":'../../libs/jasmine-2.1.3/boot_without_onload'
    },
    map: {
        '*': {
            "TEnvironment":"tests/TEnvironment_mock",
            "TRuntime":"tests/TRuntime_mock",
            "TObject":"tests/TObject_mock",
            "TUtils":"tests/TUtils_mock"
        }
    }
});

requireTest(["jasmine", "jasmine-html", "jasmine-boot", "random/Random"], function() {
    describe("A suite", function() {
        it("contains spec with an expectation", function() {
            expect(true).toBe(true);
        });
    });
    
    window.executeTests();
});
