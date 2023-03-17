var questionCardEls = document.getElementsByClassName('question-card');
var answerButtons = document.getElementsByClassName('question-answer')
var introCardEl = document.getElementById('intro-card');
var trackerCardEl = document.getElementById('tracker-card');
var numQuestions = questionCardEls.length;
var currentQuestion = introCardEl;

// user gains 10 pts for a correctly answered question, then the current
// question is hidden and the next question displays
// final score is the sum of seconds left and points gained
function correctAnswer(){
    return true;
}
function reRender(){
    return true;
}
// user looses 5 seconds for an incorrect answer
function incorrectAnswer(){
    return true;
}
// once the previous question has been answered correctly
function nextQuestion(){
    return true;
}
// once the game ends, either via timeout or via a win, enter review mode.
function review(){
    return true;
}
for (let button of answerButtons) {
    button.addEventListener("click", function(event){
        if (event.currentTarget.dataset.answer === "correct"){
            // correctAnswer();
            alert('correct');
        } else {
            // incorrectAnswer();
            alert('incorrect');
        }
    });
}
