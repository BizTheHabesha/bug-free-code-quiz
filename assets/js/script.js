var questionCardEls = document.getElementsByClassName('question-card');
var answerButtons = docuemtn.getElementsByClassName('question-answer')
var introCardEl = document.getElementById('intro-card');
var trackerCardEl = document.getElementById('intro-card');
var numQuestions = questionCardEls.length;
var currentQuestion = introCardEl;

// user gains 10 pts for a correctly answered question, then the current
// question is hidden and the next question displays
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
        alert('click');
    });
}
