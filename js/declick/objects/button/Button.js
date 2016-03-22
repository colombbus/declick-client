define(['jquery', 'TEnvironment', 'TUtils', 'CommandManager', 'TGraphicalObject'], function($, TEnvironment, TUtils, CommandManager, TGraphicalObject) {
    /**
     * Defines Button, inherited from TGraphicalObject.
     * User can click on button and trigger an associated command.
     * @param {String} label    Text displayed on the button
     * @exports Button
     */
    var Button = function(label) {
        TGraphicalObject.call(this);
        if (TUtils.checkString(label)) {
            this._setText(label);
        }
        this.gObject.initialized();
    };

    Button.prototype = Object.create(TGraphicalObject.prototype);
    Button.prototype.constructor = Button;
    Button.prototype.className = "Button";

    var graphics = Button.prototype.graphics;

    Button.prototype.gClass = graphics.addClass("TGraphicalObject", "TButton", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                fillColor: "#4d8cc2",
                strokeColor: "#0d4c82",
                textColor: "#ffffff",
                fillColorActive: "#3276b1",
                strokeColorActive: "#0d4c82",
                textColorActive: "#ffffff",
                w: 50,
                h: 24,
                active: false,
                label: "",
                textSize: 12,
                radius: 7,
                executed: false,
                type: TGraphicalObject.TYPE_INPUT
            }, props), defaultProps);
        },
        updateSize: function() {
            var oldH = this.p.h;
            var oldW = this.p.w;
            var context = graphics.getContext();
            context.font = "normal " + this.p.textSize + "px Verdana,Sans-serif";
            this.p.h = 2 * this.p.textSize;
            this.p.w = context.measureText(this.p.label).width + 2 * this.p.textSize;
            this.p.x += this.p.w / 2 - oldW / 2;
            this.p.y += this.p.h / 2 - oldH / 2;
            graphics.objectResized(this);
        },
        draw: function(context) {
            // draw path
            context.beginPath();
            context.moveTo(-this.p.w / 2, 0);
            context.lineTo(-this.p.w / 2, -this.p.h / 2 + this.p.radius);
            context.arcTo(-this.p.w / 2, -this.p.h / 2, -this.p.w / 2 + this.p.radius, -this.p.h / 2, this.p.radius);
            context.lineTo(this.p.w / 2 - this.p.radius, -this.p.h / 2);
            context.arcTo(this.p.w / 2, -this.p.h / 2, this.p.w / 2, -this.p.h / 2 + this.p.radius, this.p.radius);
            context.lineTo(this.p.w / 2, this.p.h / 2 - this.p.radius);
            context.arcTo(this.p.w / 2, this.p.h / 2, this.p.w / 2 - this.p.radius, this.p.h / 2, this.p.radius);
            context.lineTo(-this.p.w / 2 + this.p.radius, this.p.h / 2);
            context.arcTo(-this.p.w / 2, this.p.h / 2, -this.p.w / 2, this.p.h / 2 - this.p.radius, this.p.radius);
            context.lineTo(-this.p.w / 2, 0);
            context.closePath();

            // fill button
            if (this.p.active)
                context.fillStyle = this.p.fillColorActive;
            else
                context.fillStyle = this.p.fillColor;
            context.fill();

            // stroke button
            context.lineWidth = 1;
            if (this.p.active)
                context.strokeStyle = this.p.strokeColorActive;
            else
                context.strokeStyle = this.p.strokeColor;
            context.stroke();

            // draw text
            if (this.p.active)
                context.fillStyle = this.p.textColorActive;
            else
                context.fillStyle = this.p.textColor;
            context.textBaseline = "middle";
            context.font = "normal " + this.p.textSize + "px Verdana,Sans-serif";
            context.fillText(this.p.label, -this.p.w / 2 + this.p.textSize, 0);

        },
        touch: function(touch) {
            if (!this.p.designMode) {
                this.p.active = true;
                this._super(touch);
            }
        },
        touchEnd: function(touch) {
            if (!this.p.designMode) {
                this.p.active = false;
                this._super(touch);
            }
        },
        addCommand: function(command) {
            this.commands.addCommand(command);
        },
        executeCommands: function() {
            this.commands.executeCommands();
        },
        removeCommands: function() {
            this.commands.removeCommands();
        }
    });

    /**
     * Set a label for Button.
     * @param {String} label    Label to be displayed
     */
    Button.prototype._setText = function(label) {
        label = TUtils.getString(label);
        var gObject = this.gObject;
        gObject.p.label = label;
        gObject.updateSize();
    };

    /**
     * Set a Label Size.
     * @param {Number} size
     */
    Button.prototype._setTextSize = function(size) {
        size = TUtils.getInteger(size);
        var gObject = this.gObject;
        gObject.p.textSize = size;
        gObject.updateSize();
    };

    /**
     * Fill Button with a color given in parameter.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Button.prototype._setColor = function(red, green, blue) {
        var color = TUtils.getColor(red, green, blue);
        var r, g, b, ra, ga, ba;
        r = color[0];
        g = color[1];
        b = color[2];
        ra = Math.max(r - 40, 0);
        ga = Math.max(g - 40, 0);
        ba = Math.max(b - 40, 0);
        var gObject = this.gObject;
        gObject.p.fillColor = "rgb(" + r + "," + g + "," + b + ")";
        gObject.p.fillColorActive = "rgb(" + ra + "," + ga + "," + ba + ")";
        gObject.p.strokeColor = "rgb(" + ra + "," + ga + "," + ba + ")";
        gObject.p.strokeColorActive = "rgb(" + ra + "," + ga + "," + ba + ")";
    };

    /**
     * Set the Label Color.
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    Button.prototype._setTextColor = function(red, green, blue) {
        var color = TUtils.getColor(red, green, blue);
        var gObject = this.gObject;
        gObject.p.textColor = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    };

    /**
     * Associate a command to Button.
     * @param {(string|function}} command to be added
     */
    Button.prototype._addCommand = function(command) {
        this._ifClick(command);
    };

    /**
     * Remove all commands associated to button.
     */
    Button.prototype._removeCommands = function() {
        this._removeClickCommands();
    };

    //TEnvironment.internationalize(Button, true);

    return Button;
});



