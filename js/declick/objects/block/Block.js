define(['jquery', 'TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, TUtils) {
    /**
     * Defines Block, inherited from Sprite.
     * Its utility is to be an obstacle for Walker.
     * Walker will be stop by any non-transparent area of Block.
     * @param {String} name Block's name
     * @exports Block
     */
    var Block = function(name) {
        Sprite.call(this, name);
    };

    Block.prototype = Object.create(Sprite.prototype);
    Block.prototype.constructor = Block;
    Block.prototype.className = "Block";

    var graphics = Block.prototype.graphics;

    Block.prototype.gClass = graphics.addClass("TSprite", "TBlock", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                type: TGraphicalObject.TYPE_BLOCK,
                collisionMask: TGraphicalObject.TYPE_SPRITE,
                imageData: null,
                transparencyMask: null
            }, props), defaultProps);
        },
        setImageData: function(data) {
            this.perform(function(value) {
                this.p.imageData = value;
            }, [data]);
        },
        checkTransparency: function(object, col) {

            if (this.p.transparencyMask === null) {
                return false;
            }

            // get coordinates of bounding box, relative to this object
            var objectWidth = object.p.w;
            var objectHeight = object.p.h;
            var thisWidth = this.p.w;
            var thisHeight = this.p.h;
            var actualObjectX = object.p.x - objectWidth / 2 - this.p.x + thisWidth / 2;
            var actualObjectY = object.p.y - objectHeight / 2 - this.p.y + thisHeight / 2;

            var objectX = Math.round(actualObjectX);
            var objectY = Math.round(actualObjectY);

            var deltaX = actualObjectX - objectX;
            var deltaY = actualObjectY - objectY;

            var separateXL = 0, separateXR = 0, separateYT = 0, separateYB = 0;

            var clear = true;
            var index;
            var mask = this.p.transparencyMask;

            // CHECK HORIZONTALLY
            var middleY = Math.max(0, Math.min(Math.round(objectY + objectHeight / 2), thisHeight - 1));
            if (typeof mask[middleY] !== 'undefined') {
                for (var i = 0; i < objectWidth / 2; i++) {
                    index = objectX + i;
                    if ((typeof mask[middleY][index] !== 'undefined') && !mask[middleY][index]) {
                        separateXL = i + 1;
                        clear = false;
                    }
                    index = objectX + objectWidth - 1 - i;
                    if ((typeof mask[middleY][index] !== 'undefined') && !mask[middleY][index]) {
                        separateXR = i + 1;
                        clear = false;
                    }
                }
            }

            // CHECK VERTICALLY
            var middleX = Math.max(0, Math.min(Math.round(objectX + objectWidth / 2), thisWidth - 1));
            for (var j = 0; j < objectHeight / 2; j++) {
                index = objectY + j;
                if ((typeof mask[index] !== 'undefined') && (typeof mask[index][middleX] !== 'undefined') && !mask[index][middleX]) {
                    separateYT = j + 1;
                    clear = false;
                }
                index = objectY + objectHeight - j;
                if ((typeof mask[index] !== 'undefined') && (typeof mask[index][middleX] !== 'undefined') && !mask[index][middleX]) {
                    separateYB = j + 1;
                    clear = false;
                }
            }
            if (clear) {
                return true;
            }
            //return false;
            if (separateXL !== 0) {
                if (separateXR !== 0) {
                    // cannot move horizontally
                    col.separate[0] = 0;
                } else {
                    col.separate[0] = -separateXL + deltaX;
                }
            } else {
                col.separate[0] = separateXR + deltaX;
            }

            if (separateYT !== 0) {
                if (separateYB !== 0) {
                    // cannot move vertically
                    col.separate[1] = 0;
                } else {
                    col.separate[1] = -separateYT + deltaY;
                }
            } else {
                col.separate[1] = separateYB + deltaY;
            }


            //return false;

            // calculate normal
            var normalX = col.separate[0];
            var normalY = -col.separate[1];



            var dist = Math.sqrt(normalX * normalX + normalY * normalY);
            if (dist > 0) {
                normalX /= dist;
                normalY /= dist;
            }

            col.normalX = normalX;
            col.normalY = normalY;

            return false;
        }
    });

    /**
     * Set the image to be displayed.
     * If the image is ready, set it and compute Transparency Mask on it.
     * @param {String} name
     * @returns {Boolean}   Return true is the image is ready, else false.
     */
    Block.prototype.setDisplayedImage = function(name) {
        if (Sprite.prototype.setDisplayedImage.call(this, name)) {
            // compute transparency mask
            this.computeTransparencyMask(name);
            return true;
        } else {
            return false;
        }
    };

    /**
     * Execute a Transparency Mask on the image.
     * Walker will be able to move on transparent areas.
     * @param {String} name Image's name
     */
    Block.prototype.computeTransparencyMask = function(name) {
        var image = this.resources.get(name);
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var width = image.width;
        var height = image.height;
        canvas.width = width;
        canvas.height = height;
        this.gObject.p.transparencyMask = new Array();
        var mask = this.gObject.p.transparencyMask;
        var row = -1, col = width;
        ctx.drawImage(image, 0, 0);
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            col++;
            if (col >= width) {
                col = 0;
                row++;
                mask[row] = new Array();
            }
            mask[row][col] = (data[i + 3] === 0) ? true : false;
        }
    };

    return Block;
});
