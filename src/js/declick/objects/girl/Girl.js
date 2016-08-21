define(['objects/robot/Robot', 'CommandManager', 'TUtils'],
function (Robot, CommandManager, TUtils)
{
    var Girl = function()
    {
        Robot.call(this, 'girl');
    };

    Girl.prototype = Object.create(Robot.prototype);
    Girl.prototype.constructor = Girl;
    Girl.prototype.className = 'Girl';

    function drawBubble(context, X, Y, width, height, radius, direction)
    {
	Y += radius;
	height -= radius;
	if (typeof direction === 'undefined')
	{
		direction = 'left';
	}
	var right = X + width;
	var bottom = Y + height;
	context.beginPath();
	context.moveTo(X + radius, Y);
	context.lineTo(right - radius, Y);
	context.quadraticCurveTo(right, Y, right, Y + radius);
	context.lineTo(right, bottom - radius);
	context.quadraticCurveTo(right, bottom, right - radius, bottom);
	if (direction === 'left')
	{
	    context.quadraticCurveTo(right - radius, bottom + radius, right - radius - radius, bottom + radius);
	    context.quadraticCurveTo(right - (radius * 1.5), bottom + radius, right - (radius * 1.5), bottom);
	    context.lineTo(X + radius, bottom);
	}
	else if (direction === 'right')
	{
	    context.lineTo(X + (radius * 1.5), bottom);
	    context.quadraticCurveTo(X + (radius * 1.5), bottom + radius, X + radius + radius, bottom + radius);
	    context.quadraticCurveTo(X + radius, bottom + radius, X + radius, bottom);
	}
	context.quadraticCurveTo(X, bottom, X, bottom - radius);
	context.lineTo(X, Y + radius);
	context.quadraticCurveTo(X, Y, X + radius, Y);
	context.fillStyle = 'white';
	context.fill();
	context.strokeStyle = 'black';
	context.lineWidth = '2';
	context.stroke();
    }

    Girl.prototype.gClass = Girl.prototype.graphics.addClass('TRobot', 'Girl',
    {
	message: null,
	sayCommands: new CommandManager(),
	draw: function (context)
	{
	    if (this.message !== null)
	    {
		context.font = '12px Lucida Console';
		var padding = 6;
		var height = 15;
		var width = context.measureText(this.message).width;
		var X = -(width / 2);
		var Y = -height - (padding * 3);
		drawBubble(context, X - padding, Y - height - padding, width + (padding * 2), height + (padding * 2), padding, 'left');
		context.fillStyle = 'black';
		context.fillText(this.message, X, Y);
	    }
	    this._super(context);
	},
	say: function (message)
	{
	    this.message = message;
	    this.synchronousManager.begin();
	    var context = this;
	    window.setTimeout(function ()
	    {
		context.message = null;
		context.sayCommands.executeCommands({'parameters': [message]});
		context.synchronousManager.end();
	    }, (message.length * 50) + 1500);
	}
    });

    Girl.prototype._say = function (message)
    {
	var text = null;
	try
	{
	    text = TUtils.getInteger(message) + '';
	}
	catch (exception)
	{
	    text = TUtils.getString(message);
	}
        this.gObject.say(text);
    };

    Girl.prototype._ifSay = function (command)
    {
	command = TUtils.getCommand(command);
	this.gObject.sayCommands.addCommand(command);
    };

    return Girl;
  });
