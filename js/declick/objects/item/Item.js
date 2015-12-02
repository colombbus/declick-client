define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, TUtils) {
    /**
     * Defines Item, inherited from Sprite.
     * Item is a Sprite which can be picked up.
     * @param {String} name Item's name
     * @exports Item
     */
    var Item = function(name) {
        var translated = this.getMessage(name);
        if (translated !== name) {
            // name is one of the default category
            Sprite.call(this);
            this.addImage(translated, "", false);
            this.setDisplayedImage(translated);
            this.gObject.setName(name);
        } else {
            Sprite.call(this, name);
            if (typeof name === 'undefined') {
                this.addImage("coin.png", "", false);
                this.setDisplayedImage("coin.png");
                this.gObject.setName(this.getMessage("default"));                
            } else { 
                this.gObject.setName(name);                
            }
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
            this.setCategory(value);
        },
        getName: function() {
            return this.p.name;
        }
    });
    
    Item.prototype._setName = function(value) {
        value = TUtils.getString(value);
        var translated = this.getMessage(value);
        if (translated !== value) {
            // name is one of the default category
            this.addImage(translated, "", false);
            this.setDisplayedImage(translated);
        }
        this.gObject.setName(value);
    };

    return Item;
});


