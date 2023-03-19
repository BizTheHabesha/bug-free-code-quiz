// some HTML DOM elements used often
var questionCardEls = document.getElementsByClassName('question-card');
var timerEl = document.getElementById('time');
var timerLiEl = document.getElementById('timerli');
var currentQuestion = document.getElementById('intro-card');
// and two variables for seconds left, one to decrement and one to track original. these
// are scoped globally so we can decrement the timer outside of the setTime() function
// (e.g. penalize the user for an incorrect answer).
var secondsLeft = initSecondsLeft = 60;
// initialize score with zero so be calculated later
var score = 0;
// initialize number of questions answered for review
var questionsAnswered = 0;
// a different styling can be applied when the timer gets very low
var lastFewSeconds = 10;
// access the root psuedoclass at any time (for variables)
var rootCSS = document.querySelector(':root');
// initialize timer variable so it's scoped globally. allows us to stop the timer before
// it's done (e.g. user answers all questions in time)
var timerInterval;
// create a globally scoped variable to check if we are in review mode or not. This disables some
// features that should only be active during a game.
var reviewMode = false;
var highscoresArr = [];
var highscoreSet = false;
// user gains 10 pts for a correctly answered question, looses 5 second for an incorrectly 
// answered question. then, if correct, the current question is hidden and the next question displays
// final score is the sum of seconds left and points gained
function main(){
    // initialize number of questions, subtracting one because the intro card is also a
    // question-card for styling purposes
    for(let tqs of document.getElementsByClassName('total-questions')){
        tqs.textContent = questionCardEls.length - 1;
    }
    for(let i = 0; i < 10; i++){
        if(localStorage.getItem(`highscore-${i}`) === null){
            console.log(`loaded ${i} highscore(s)`);
            break;
        }else{
            highscoresArr.push(JSON.parse(localStorage.getItem(`highscore-${i}`)));
        }
    }
    highscoresArr.sort(function(a,b){return b['scoreIn'] - a['scoreIn'];})
    console.log(localStorage.length)
    timerEl.textContent = 'Press the \'Start Quiz\' button to begin.'
    // initialize onclick for answer buttons
    for (let button of document.getElementsByClassName('question-answer')) {
        button.addEventListener("click", function(event){
            // get the button that was clicked as an element
            var pb = event.currentTarget;
            // TODO: current model does not obfuscate correct answer from the inspect feature
            // built into browsers.
            if (pb.dataset.answer === "c" && !reviewMode){
                // excludes buttons which are marked as answers for styling, but shouldn't be used here
                if(pb.dataset.exempt != 'exempt'){
                    // applies permanent effect to buttons which will be useful in review mode.
                    pb.style.border = "solid 1px " + getComputedStyle(rootCSS).getPropertyValue('--success-color');
                }
                // hide the current question
                currentQuestion.style.display = 'none'
                // each question links to the next question's id in a linked list kind of way.
                let nextQuestion = document.getElementById(currentQuestion.dataset.nextnode);
                // if the next node is empty, then the user has reached the last question.
                if(nextQuestion == null){
                    //stop the timer
                    clearInterval(timerInterval);
                    // enter review mode, specifiying it was because the user answered all questions
                    review('questions');
                    return;
                }
                // display the next question
                nextQuestion.style.display = 'block';
                // set the current question to the next question for next iteration.
                currentQuestion = nextQuestion;
                // number of questions answered is increased
                questionsAnswered++;
                // update any question number trackers on the page
                for(let questionTrackers of document.getElementsByClassName('question-number')){
                    questionTrackers.textContent = questionsAnswered;
                }
                // user gains 10 points for a correct answer.
                score+=10;
            } else if(!reviewMode) {
                // applies permanent effect to buttons which will be useful in review mode.
                pb.style.border = "solid 1px " + getComputedStyle(rootCSS).getPropertyValue('--danger-color')
                // penalize for incorrect answer by deducting 5 seconds, then render the new
                // time immedietly to avoid 1 second delay
                if(secondsLeft > 0){
                    secondsLeft-=5;
                }else{
                    secondsLeft = 0;
                }
                timerEl.textContent = " " + secondsLeft + " seconds remaining.";
                // apply styling to timer for incorrect answer
                timerLiEl.style.boxShadow = 'inset 1px 5px 75px '+
                    getComputedStyle(rootCSS).getPropertyValue('--danger-color-focus');
                // user looses 5 points for an incorrect answer. extra failsafe for nonnegatives provides user with a
                // better chance to get out of a ditch
                score <= 0 ? score = 0 : score-=5;
                // remove styling after 3 seconds
                let penaltyStylingTimer = setInterval(() => {
                    timerLiEl.style.boxShadow = 'none';
                    clearInterval(penaltyStylingTimer);
                }, 1000);
            }
        });
    }
    document.getElementById('try-again').addEventListener("click", function(event){
        window.location.reload();
    })
    document.getElementById('start').addEventListener('click', function(e){
        e.preventDefault();
        // Initialize timer
        timerEl.textContent = " " + secondsLeft + " seconds remaining.";
        // Sets interval in variable such that the interval counts in seconds
        timerInterval = setInterval(function() {
            // decrement timer every second
            secondsLeft--;
            // update on-screen timer
            timerEl.textContent = " " + secondsLeft + " seconds remaining.";
            // at half timing the timer will gain a 'warning' styling
            if(secondsLeft <= Math.floor(initSecondsLeft/2)){
                timerLiEl.style.border = "solid 3px " + getComputedStyle(rootCSS).getPropertyValue('--warning-color');
            }
            // at quarter time the timer will show a 'danger' styling
            if(secondsLeft <= Math.floor(initSecondsLeft/4)){
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
                // Stops execution of action at set interval
                clearInterval(timerInterval);
                // Calls function to enter review mode under the pretense the user ran out of time
                review('time');
            }
        }, 1000);
    })  
    document.getElementById('save-score').addEventListener('click',function(e){
        e.preventDefault()
        if(!highscoreSet){
            let scorePlaced = false;
            let newScore = {
                initials: document.getElementById('initials').value,
                scoreIn: score,
                storageIndex: 0
            };  
            for(let i = 0; i < 10; i++){
                if(localStorage.getItem(`highscore-${i}`) === null){
                    newScore.storageIndex = i;
                    localStorage.setItem(`highscore-${i}`,JSON.stringify(newScore));
                    highscoresArr.push(newScore);
                    highscoresArr.sort(function(a,b){return b['scoreIn'] - a['scoreIn'];});
                    scorePlaced = true;
                    break;
                }
            }
            if(!scorePlaced){
                highscoresArr.push(newScore);
                highscoresArr.sort(function(a,b){return b['scoreIn'] - a['scoreIn'];});
                localStorage.removeItem(`highscore-${highscoresArr.pop().storageIndex}`);
            }
            highscoreSet = true;
        }else{
            hsem = document.getElementById('score-saved-error-message');
            hsem.style.color = getComputedStyle(rootCSS).getPropertyValue('--danger-color');
            hsemInterval = setInterval(function(){
                hsem.style.color = 'transparent';
                clearInterval(hsemInterval);
            }, 2000)
        }  
    })
    return 0;
}
function setTime() {
    return 0;
}
// once the game ends, either via timeout or via a win, enter review mode.
function review(src){
    // for use later in updating and clearing score list
    var highScoresOl = document.getElementById('highscores-list');
    // now that the game is done, end the timer, and extra failsafe if one of the other clearIntervals is missed.
    // and the reason timerInterval needs to be scoped globally
    clearInterval(timerInterval);
    // add the seconds left to the score if this make the score nonnegative, otherwise make the score zero
    // e.g. the score cannot be negative.
    (score += secondsLeft) >= 0 ? score += secondsLeft : score = 0;
    // post the score to the page.
    document.getElementById('score').textContent = score;
    // setting to true disables some features meant only for quiz-taking
    reviewMode = true;
    // remove timer
    timerEl.textContent = "";
    // unset timer border styling
    timerLiEl.style.border = "solid 3px " + getComputedStyle(rootCSS).getPropertyValue('--tertiary-background-color');
    // remove tracker card title
    document.getElementById('tracker-card-title').textContent = '';
    // remove question tracker
    document.getElementById('tracker-card-tracker').innerHTML = '';
    // remove text shadow effect from alternative styling adopted from lastFewSeconds mode
    timerLiEl.style.textShadow = 'none';
    // unset coloring from  alternative styling adopted from lastFewSecodns mode
    timerLiEl.style.color = 'inherit';
    // display a different message depending on if the user ran out of time or answered all questions.
    if(src === 'time'){
        timerLiEl.textContent = "Time's up! How'd you do?";
    }else if(src === 'questions'){
        timerLiEl.textContent = "You answered every question in time! How'd you do?";
    }
    // a local function to toggle cards. for later on.
    function toggleCards(hide){
        // display or hide review card
        hide ? document.getElementById('review-card').style.display = 'none' : 
        document.getElementById('review-card').style.display = 'block';
        // display or hide non-exempted question cards
        for(let card of questionCardEls){
            if(card.dataset.exempt != 'exempt'){
                // reveal all questions for user to review
                hide ? card.style.display = 'none' : card.style.display = 'block';
            }
        }
    }
    // by default, once the game ends, toggle all cards on for review
    toggleCards(false);
    document.getElementById('clear-highscores').addEventListener('click', function(e){
        e.preventDefault();
        localStorage.clear()
        for(let i = 0; i < highscoresArr.length; i++){
            highscoresArr.pop();
        }
        highScoresOl.innerHTML = '';

    })
    // if the user wants to see high scores, then hide the other cards and display the score card
    document.getElementById('view-highscores').addEventListener('click', function(e){
        e.preventDefault();
        let scoresRendered = false;
        if(!scoresRendered){
            highScoresOl.innerHTML = '';
            let i = 0;
            for(let scoreFromArr of highscoresArr){
                i++;
                let newEntry = document.createElement('li');
                newEntry.setAttribute('class','highscore-li')
                newEntry.textContent = `${i}) ${scoreFromArr.initials} got ${scoreFromArr.scoreIn} points`
                highScoresOl.appendChild(newEntry);
                highScoresOl.appendChild(document.createElement('br'))
            }
            scoresRendered = true;
        }
        toggleCards(true);
        document.getElementById('highscores-card').style.display = 'block';
    })
    // undo the previous 
    document.getElementById('go-back').addEventListener('click', function(e){
        e.preventDefault();
        toggleCards(false);
        document.getElementById('highscores-card').style.display = 'none';
    })
}

main();