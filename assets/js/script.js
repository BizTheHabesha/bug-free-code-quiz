// some HTML DOM elements used often
var questionCardEls = document.getElementsByClassName('question-card');
var answerButtons = document.getElementsByClassName('question-answer')
var introCardEl = document.getElementById('intro-card');
var trackerCardEl = document.getElementById('tracker-card');
var timerEl = document.getElementById('time');
var timerLiEl = document.getElementById('timerli');
var numQuestions = questionCardEls.length;
var currentQuestion = introCardEl;
// and two variables for seconds left, one to decrement and one to track original. these
// are scoped globally so we can decrement the timer outside of the setTime() function
// (e.g. penalize the user for an incorrect answer)
var secondsLeft = initSecondsLeft = 60;
// a different styling can be applied when the timer gets very low
var lastFewSeconds = 10;
// access the root psuedoclass at any time (for variables)
var rootCSS = document.querySelector(':root');
// initialize timer variable so it's scoped globally. allows us to stop the timer before
// it's done (e.g. user answers all questions in time)
var timerInterval;
// user gains 10 pts for a correctly answered question, looses 5 second for an incorrectly 
// answered question. then, if correct, the current question is hidden and the next question displays
// final score is the sum of seconds left and points gained
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
            // TODO: current model does not obfuscate correct answer from the inspect feature
            // built into browsers.
            if (pb.dataset.answer === "c"){
                // applies permanent effect to buttons which will be useful for review mode
                pb.style.border = "solid 1px " + getComputedStyle(rootCSS).getPropertyValue('--success-color');
                currentQuestion.style.display = 'none'
                nextQuestion = document.getElementById(currentQuestion.dataset.nextnode)
                document.getElementById(nextQuestion.style.display = 'block');
                currentQuestion = document.getElementById(nextQuestion);
            } else {
                pb.style.border = "solid 1px " + getComputedStyle(rootCSS).getPropertyValue('--danger-color')
                // penalize for incorrect answer by deducting 5 seconds, then render the new
                // time immedietly to avoid 1 second delay
                if(secondsLeft > 0){
                    secondsLeft-=5;
                }
                if(secondsLeft === 0){
                    secondsLeft = 0;
                }
                timerEl.textContent = " " + secondsLeft + " seconds remaining.";
                // apply styling to timer for incorrect answer
                timerLiEl.style.boxShadow = 'inset 1px 5px 75px '+
                    getComputedStyle(rootCSS).getPropertyValue('--danger-color-focus');
                // remove styling after 3 seconds
                let penaltyStylingTimer = setInterval(() => {
                    timerLiEl.style.boxShadow = 'none';
                    clearInterval(penaltyStylingTimer);
                }, 3000);
            }
        });
    }
    document.getElementById('try-again').addEventListener("click", function(event){
        window.location.reload();
    })
    setTime();
    return true;
}
function setTime() {
    // Initialize timer
    timerEl.textContent = " " + secondsLeft + " seconds remaining.";
    // Sets interval in variable such that the interval counts in seconds
    timerInterval = setInterval(function() {
        // decrement timer every second
        secondsLeft--;
        // update on-screen timer
        timerEl.textContent = " " + secondsLeft + " seconds remaining.";
        // at half timing the timer will gain a 'warning' styling
        if(secondsLeft === Math.floor(initSecondsLeft/2)){
            timerLiEl.style.border = "solid 3px " + getComputedStyle(rootCSS).getPropertyValue('--warning-color');
        }
        // at quarter time the timer will show a 'danger' styling
        if(secondsLeft === Math.floor(initSecondsLeft/4)){
            timerLiEl.style.border = "solid 3px " + getComputedStyle(rootCSS).getPropertyValue('--danger-color');
        }
        // alternative text styling at specified time
        if(secondsLeft <= lastFewSeconds){
            timerLiEl.style.color = getComputedStyle(rootCSS).getPropertyValue('--danger-color-focus');
            // font weight cannot be animated in vanilla CSS. Using text shadow mostly gives
            // the intended effect, however.
            timerLiEl.style.textShadow = '-1px -1px 0 '+ getComputedStyle(rootCSS).getPropertyValue('--danger-color') +
            ',1px -1px 0 '+ getComputedStyle(rootCSS).getPropertyValue('--danger-color') +
            ',-1px 1px 0 '+getComputedStyle(rootCSS).getPropertyValue('--danger-color')+
            ',1px 1px 0 '+getComputedStyle(rootCSS).getPropertyValue('--danger-color');
        }
        // once the timer is done, remove the timer and enter review mode
        if(secondsLeft <= 0) {
            timerEl.textContent = "";
            timerLiEl.style.border = "solid 3px " + getComputedStyle(rootCSS).getPropertyValue('--tertiary-background-color');
            document.getElementById('tracker-card-title').textContent = '';
            document.getElementById('tracker-card-tracker').innerHTML = '';
            timerLiEl.style.textShadow = 'none';
            timerLiEl.style.color = 'inherit';
            // Stops execution of action at set interval
            clearInterval(timerInterval);
            // Calls function to enter review mode under the pretense the user ran out of time
            review('time');
        }
    }, 1000);
}
// once the game ends, either via timeout or via a win, enter review mode.
function review(src){
    if(src === 'time'){
        timerLiEl.textContent = "Time's up! How'd you do?";
    }
    if(src === 'questions'){
        timerLiEl.textContent = "You answered every question in time! How'd you do?";
    }
    for (let button of answerButtons){
        button.removeEventListener();
    }
    return true;
}

main();