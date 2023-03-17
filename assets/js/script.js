var questionCardEls = document.getElementsByClassName('question-card');
var answerButtons = document.getElementsByClassName('question-answer')
var introCardEl = document.getElementById('intro-card');
var trackerCardEl = document.getElementById('tracker-card');
var timerEl = document.getElementById('time');
var timerLiEl = document.getElementById('timerli');
var numQuestions = questionCardEls.length;
var currentQuestion = introCardEl;
var secondsLeft = initSecondsLeft = 60;
var rootCSS = document.querySelector(':root');

// user gains 10 pts for a correctly answered question, then the current
// question is hidden and the next question displays
// final score is the sum of seconds left and points gained
function correctAnswer(button){
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
function setTime() {
    // Sets interval in variable
    timerEl.textContent = " " + secondsLeft + " seconds remaining.";
    var timerInterval = setInterval(function() {
        secondsLeft--;
        timerEl.textContent = " " + secondsLeft + " seconds remaining.";
        // 
        if(secondsLeft === Math.floor(initSecondsLeft/2)){
            timerLiEl.style.border = "solid 3px " + getComputedStyle(rootCSS).getPropertyValue('--warning-color');
        }
        if(secondsLeft === Math.floor(initSecondsLeft/4)){
            timerLiEl.style.border = "solid 3px " + getComputedStyle(rootCSS).getPropertyValue('--danger-color');
        }
        if(secondsLeft === 0) {
            // Stops execution of action at set interval
            clearInterval(timerInterval);
            // Calls function to create and append image
            review();
        }
    }, 1000);
}
function main(){
    // initialize number of questions, subtracting one because the intro card is also a
    // question-card for styling purposes
    for(let tqs of document.getElementsByClassName('total-questions')){
        tqs.textContent = numQuestions - 1;
    }
    // initialize onclick for answer buttons
    for (let button of answerButtons) {
        button.addEventListener("click", function(event){
            var pb = event.currentTarget;
            if (pb.dataset.answer === "c"){
                // correctAnswer();
                pb.style.border = "solid 1px " + getComputedStyle(rootCSS).getPropertyValue('--success-color');
                console.log('correct!');
            } else {
                pb.style.border = "solid 1px " + getComputedStyle(rootCSS).getPropertyValue('--danger-color')
                // incorrectAnswer();
                console.log('incorrect!');
            }
        });
    }
    document.getElementById('try-again').addEventListener("click", function(event){
        window.location.reload();
    })
    setTime();
    return true;
}
main();