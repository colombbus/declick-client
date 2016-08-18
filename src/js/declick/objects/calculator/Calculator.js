define(['jquery', 'TEnvironment', 'TObject', 'TUtils'], function($, TEnvironment, TObject, TUtils) {
    /**
     * Defines Calculator, inherited from TObject.
     * A simple calculator.
     * @exports Calculator
     */
    var Calculator = function() {
        TObject.call(this);
    };

    Calculator.prototype = Object.create(TObject.prototype);
    Calculator.prototype.constructor = Calculator;
    Calculator.prototype.className = "Calculator";
    
    /**
     * Round Number.
     * @param {Number} number
     * @returns {Number}
     */
    Calculator.prototype._round = function(number) {
        number = TUtils.getInteger(number);
        return (Math.round(number));
    };

    /**
     * Return Number's cosinus.
     * @param {Number} number
     * @returns {Number}
     */
    Calculator.prototype._cos = function(number) {
        number = TUtils.getInteger(number);
        return (Math.cos(number));
    };

    /**
     * Return Number's sinus.
     * @param {Number} number
     * @returns {Number}
     */
    Calculator.prototype._sin = function(number) {
        number = TUtils.getInteger(number);
        return (Math.sin(number));
    };

    /**
     * Return Number's tangent.
     * @param {Number} number
     * @returns {Number}
     */
    Calculator.prototype._tan = function(number) {
        number = TUtils.getInteger(number);
        return (Math.tan(number));
    };

    /**
     * Return the value of Number to be the power of Pow.
     * @param {Number} number
     * @param {Number} power
     * @returns {Number}
     */
    Calculator.prototype._pow = function(number, pow) {
        number = TUtils.getInteger(number);
        pow = TUtils.getInteger(pow);
        return (Math.pow(number, pow));
    };

    /**
     * Return the square of Number.
     * @param {Number} number
     * @returns {Number}
     */
    Calculator.prototype._square = function(number) {
        number = TUtils.getInteger(number);
        return (Math.pow(number, 2));
    };

    /**
     * Return the cube of Number.
     * @param {Number} number
     * @returns {Number}
     */
    Calculator.prototype._cube = function(number) {
        number = TUtils.getInteger(number);
        return (Math.pow(number, 3));
    };
    
    /**
     * Return the square root of Number.
     * @param {Number} number
     * @returns {Number}
     */
    Calculator.prototype._sqrt = function(number) {
        number = TUtils.getInteger(number);
        return (Math.sqrt(number));
    };

    /**
     * Return Pi.
     * @returns {Number}
     */
    Calculator.prototype._pi = function() {
        return (Math.PI);
    };

    return Calculator;
});


