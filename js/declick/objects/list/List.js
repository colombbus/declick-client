define(['jquery', 'TEnvironment', 'TObject', 'TUtils'], function($, TEnvironment, TObject, TUtils) {
    /**
     * Defines List, inherited from TObject.
     * @exports List
     */
    var List = function() {
        TObject.call(this);
        this.list = [];
        this.index = 0;
    };

    List.prototype = Object.create(TObject.prototype);
    List.prototype.constructor = List;
    List.prototype.className = "List";
    
    /**
     * Add an object in List.
     * @param {TObject} object
     */
    List.prototype._add = function(object) {
        this.list.push(object);
    };
    
    /**
     * Remove an object in List.
     * @param {TObject} object
     */
    List.prototype._remove = function(object) {
        if (TUtils.checkInteger(object)) {
            this.list.splice(TUtils.getInteger(object - 1), 1);
        } else {
            //kappa
        }
    };

    /**
     * Set index to 0.
     */
    List.prototype._returnStart = function() {
        this.index = 0;
    };
    
    /**
     * Returns the index object in List, and remove it from the list.
     * @returns {TObject}
     */
    List.prototype._getNextObject = function() {
        var tmp = this.list.splice(index, 1);
        if (this.index === this.list.length) {
            this.index -= 0;
        }
        return (tmp);
    };
    
    /**
     * Returns true if List has objects, else false.
     * @returns {Boolean}
     */
    List.prototype._hasObjects = function() {
        return (this.list.length !== 0);
    };
    
    /**
     * Returns the "index" object in List, and remove it from the list.
     * @param {Number} index
     * @returns {TObject}
     */
    List.prototype._getObject = function(index) {
        this.index = TUtils.getInteger(index) - 1;
        return (this._getNextObject());
    };
    
    /**
     * Changes "index" object to "object".
     * @param {Number} index
     * @param {TObject} object
     */
    List.prototype._modify = function(index, object) {
        this.index = TUtils.getInteger(index) - 1;
        this.list[this.index] = object;
    };
    
    /**
     * Checks if List has "object".
     * @param {TObject} object
     * @returns {Boolean}
     */
    List.prototype._has = function(object) {
        //To do
    };
    
    /**
     * Checks if List and "list" have at least one object in common.
     * @param {TList} list
     * @returns {Boolean}
     */
    List.prototype._hasIn = function(list) {
        list = list.list;
        for (var i = 0 ; i < list.length ; i++) {
            if (this._has(list[i])) {
                return (true);
            }
        }
        return (false);
    };
    
    /**
     * Returns the number of objects in List.
     * @returns {Number}
     */
    List.prototype._getSize = function() {
        return (this.list.length);
    };
    
    /**
     * Void List.
     */
    List.prototype._void = function() {
        this.list.splice(0, this.list.length);
        this.index = 0;
    };
    
    /**
     * Delete List.
     */
    List.prototype._delete = function() {
        this.gObject.destroy();
    };
    
    return List;
});


