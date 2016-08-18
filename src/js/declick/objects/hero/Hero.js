define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/character/Character', 'TUtils'], function ($, TEnvironment, TGraphicalObject, Character, TUtils) {
    /**
     * Defines Hero, inherited from Character.
     * It has predefined appearances, is animated when it moves,
     * can walk in a Scene and catch objects.
     * @param {String} name Hero's name
     * @exports Hero
     */
    var Hero = function (name) {
        Character.call(this);
        if (typeof (name) === 'undefined') {
            name = "tangy";
        }
        this._setAspect(name);
    };

    Hero.prototype = Object.create(Character.prototype);
    Hero.prototype.constructor = Hero;
    Hero.prototype.className = "Hero";

    var graphics = Hero.prototype.graphics;

    return Hero;
});
