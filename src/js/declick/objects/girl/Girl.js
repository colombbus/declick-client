define(['objects/robot/Robot'], function(Robot) {

    var Girl = function() {
        Robot.call(this, "girl");
    };

    Girl.prototype = Object.create(Robot.prototype);
    Girl.prototype.constructor = Girl;
    Girl.prototype.className = "Girl";

    return Girl;
  });
