define([], function() {
   var TEnvironmentMock = function() {
       this.internationalize = function(initialClass, parents) {
       };
    };
    var environmentInstance = new TEnvironmentMock();
    return environmentInstance;  
});
