define(['platform-pr', 'json'], function() {
    function Grader() {

        /*this.gradeTask = function (answer, answerToken, callback) {
            var acceptedAnswers = this.getAcceptedAnswers();
            var taskParams = platform.getTaskParams();
            var score = taskParams.noScore;
            if (acceptedAnswers && acceptedAnswers[0]) {
                if ($.inArray("" + answer, acceptedAnswers) > -1) {
                    score = taskParams.maxScore;
                } else {
                    score = taskParams.minScore;
                }
            }
            callback(score, "");
        }*/

        this.gradeTask = function (strAnswer, token, callback) {
            var answer = JSON.parse(strAnswer);
            platform.getTaskParams('maxScore', 100, function(maxScore) {
               var score = answer.score * maxScore;
               callback(score, answer.message);
            });
        };           
        
    }
    return Grader; 
});

