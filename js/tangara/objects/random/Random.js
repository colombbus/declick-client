define(['TEnvironment', 'TObject', 'TUtils', 'TRuntime'], function(TEnvironment, TObject, TUtils) {
    /**
     * Defines Random, inherited from TObject.
     * Its purpose is to send random numbers in a limited interval.
     * @exports Random
     */
    var Random = function() {
        TObject.call(this);
    };

    Random.prototype = Object.create(TObject.prototype);
    Random.prototype.constructor = Random;
    Random.prototype.className = "Random";

    /**
     * Return a random number between 1 and max.
     * @param {Number} max
     * @returns {Number}
     */
    Random.prototype._throwDice = function(max) {
        return Math.floor((Math.random() * max) + 1);
    };

    return Random;
});