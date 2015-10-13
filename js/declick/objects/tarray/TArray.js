define(['TObject', 'TUtils', 'TEnvironment'], function(TObject, TUtils, TEnvironment) {
    var TArray = function(name) {
        TObject.call(this, name);
        if (name instanceof TArray) {
        };
        this.element = new Array();
    };
    TArray.prototype = Object.create(TObject.prototype);
    TArray.prototype.constructor = TArray;
    TArray.prototype.className = "TArray";
    
    TArray.prototype._addValue = function(value) {
        this.element.push(value);
    };
    TArray.prototype._setValueAt = function(position, value) {
        var checkPosition = TUtils.checkInteger(position);
        var checkValue = TUtils.checkInteger(value);
        
        if (checkPosition && checkValue)
            this.element[position -1] = value;
    };
    TArray.prototype._getValue = function(position) {
        return this.element[position -1];
    };
    TArray.prototype._getLength = function() {
        return this.element.length;
    };
    

    return TArray;
});
