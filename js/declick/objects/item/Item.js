define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, TUtils) {
    /**
     * Defines Item, inherited from Sprite.
     * Item is a Sprite which can be picked up.
     * @param {String} name Item's name
     * @exports Item
     */
     var Item = function(name) {
        Sprite.call(this, name);
        if (typeof name === 'undefined') {
            this.addImage("ball.gif", "", false);
            this.setDisplayedImage("ball.gif");
        }
    };

    Item.prototype = Object.create(Sprite.prototype);
    Item.prototype.constructor = Item;
    Item.prototype.className = "Item";

    var graphics = Item.prototype.graphics;

    Item.prototype.gClass = graphics.addClass("TSprite", "TItem", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                type: TGraphicalObject.TYPE_ITEM | TGraphicalObject.TYPE_SPRITE,
                name: "item"
            }, props), defaultProps);
        },
        setName: function(value) {
            this.p.name = value;
        },
        getName: function() {
            return this.p.name;
        }
    });
    
    Item.prototype._setName = function(value) {
        value = TUtils.getString(value);
        this.gObject.setName(value);
    };

    return Item;
});


