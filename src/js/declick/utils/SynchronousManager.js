define(['TRuntime'], function(TRuntime) {
    /**
     * SynchronousManager runs the synchronicity between objects in TRuntime.
     * @exports SynchronousManager  
     */
    var SynchronousManager = function() {
        this.running = false;
    };

    /**
     * Suspend the execution of the interpreter and set running to true.
     */
    SynchronousManager.prototype.begin = function() {
        TRuntime.suspend();
        this.running = true;
    };

    /**
     * Resume the execution of the interpreter and set running to false.
     */
    SynchronousManager.prototype.end = function() {
        TRuntime.resume();
        this.running = false;
    };

    /**
     * Check the value of running.
     * @returns {Boolean}
     */
    SynchronousManager.prototype.isRunning = function() {
        return this.running;
    };

    return SynchronousManager;
});
