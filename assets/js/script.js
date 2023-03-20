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
// an array to store highscores within the code, outside of just localStorage. This way we can easily sort
// the highscores.
var highscoresArr = [];
// a global variable to ensure the highscore isn't set twice in one session.
var highscoreSet = false;
// user gains 10 pts for a correctly answered question, looses 5 second for an incorrectly 
// answered question. then, if correct, the current question is hidden and the next question displays
// final score is the sum of seconds left and points gained
function main(){
    // initialize number of questions, subtracting 1 because the intro card is also a
    // question-card for styling purposes
    for(let tqs of document.getElementsByClassName('total-questions')){
        tqs.textContent = questionCardEls.length - 1;
    }
    // store all scores from local storage in the array defined above. hard-coded to stop at 10 entries
    // because localStorage should not have more than 10 entries.
    for(let i = 0; i < 10; i++){
        // stop after we have found the first empty score, otherwise we know we've stored all 10
        if(localStorage.getItem(`highscore-${i}`) === null){
            console.log(`loaded ${i} highscore(s)`);
            break;
        }else{
            // push the scores into the array
            highscoresArr.push(JSON.parse(localStorage.getItem(`highscore-${i}`)));
        }
    }
    // after all scores are stored, we sort the array using a custom function. this is nescceary because
    // the default sort function is function(a,b){return b-a;}
    highscoresArr.sort(function(a,b){return b['scoreIn'] - a['scoreIn'];})
    // debug tool to check that the array has indeed loaded all score from localStorage
    console.log(localStorage.length)
    // at the start of the game, the timer hasn't started. let's take this opportunity to display instructions
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
    // the 'try again' button just reloads the page, effectivly ending the current session
    document.getElementById('try-again').addEventListener("click", function(){
        window.location.reload();
    })
    // set event listener for the start button, which starts the timer among other things.
    document.getElementById('start').addEventListener('click', function(e){
        e.preventDefault();
        // Initialize timer on screen
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
                // use root psuedoclass to style this portion, as well as the rest.
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
    // initialize event listener to sort scores, among other things.
    document.getElementById('save-score').addEventListener('click',function(e){
        // prevent the page from reloading.
        e.preventDefault()
        // ensure the user hasn't set a highscore already.
        if(!highscoreSet){
            // a variable to indicate wether we were able to store it in one of the 10 empty slots
            // in localStorage
            let scorePlaced = false;
            // an object to store the intials of the player, their score, and the score's index in localStorage
            let newScore = {
                initials: document.getElementById('initials').value,
                scoreIn: score,
                storageIndex: 0
            };  
            // loop through the 10 possible slots of localStorage
            for(let i = 0; i < 10; i++){
                // check if one of these slots is empty
                if(localStorage.getItem(`highscore-${i}`) === null){
                    // if we find an empty localStorage slot, add that index to the object
                    newScore.storageIndex = i;
                    // insert the score into localStorage
                    localStorage.setItem(`highscore-${i}`,JSON.stringify(newScore));
                    // insert the score into the array
                    highscoresArr.push(newScore);
                    // sort the array using the same custom function above.
                    highscoresArr.sort(function(a,b){return b['scoreIn'] - a['scoreIn'];});
                    // indicate the score was able to be placed
                    scorePlaced = true;
                    break;
                }
            }
            // in the event the score wasn't placed in one of the 10 slots, we remove the lowest score.
            if(!scorePlaced){
                // we add it to the arrau
                highscoresArr.push(newScore);
                // sort the array
                highscoresArr.sort(function(a,b){return b['scoreIn'] - a['scoreIn'];});
                // then remove from localStorage and the array the item that was at the end of the array.
                // because the array is already sorted, we know the last element will be the lowest score.
                localStorage.removeItem(`highscore-${highscoresArr.pop().storageIndex}`);
            }
            // indicate that the highscore has been set for this session.
            highscoreSet = true;
        // if the user has already set a score, then display the error message and fade it out.
        }else{
            // get the error message element
            hsem = document.getElementById('score-saved-error-message');
            // display the element by giving it a color other than transparent
            hsem.style.color = getComputedStyle(rootCSS).getPropertyValue('--danger-color');
            // fade out the message after 2 seconds.
            hsemInterval = setInterval(function(){
                hsem.style.color = 'transparent';
                clearInterval(hsemInterval);
            }, 2000)
        }  
    })
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
    // initialize event listener to clear highscores
    document.getElementById('clear-highscores').addEventListener('click', function(e){
        e.preventDefault();
        // clear the localStorage
        localStorage.clear()
        // clear the array
        for(let i = 0; i < highscoresArr.length; i++){
            highscoresArr.pop();
        }
        // remove the highscore <li>s from the highscores card.
        highScoresOl.innerHTML = '';

    })
    // intialize event listener to view high scores
    document.getElementById('view-highscores').addEventListener('click', function(e){
        e.preventDefault();
        // clear whatever was rendered before to avoid rendering double
        highScoresOl.innerHTML = '';
        // below is a for-let-of loop, but we'll need an increment as well
        let i = 0;
        // loop through the scores in the array
        for(let scoreFromArr of highscoresArr){
            // increment so we can display the order of the scores
            i++;
            // create a new element to append score objets to
            let newEntry = document.createElement('li');
            // give this element the highscore-li class for styling purposes
            newEntry.setAttribute('class','highscore-li')
            // dismantle the score object and parse them into a string using template literals
            newEntry.textContent = `${i}) ${scoreFromArr.initials} got ${scoreFromArr.scoreIn} points`
            // append this new list item to the highscores array
            highScoresOl.appendChild(newEntry);
        }
        // hide the review mode cards
        toggleCards(true);
        // show the highscores card
        document.getElementById('highscores-card').style.display = 'block';
    })
    // undo the previous 
    document.getElementById('go-back').addEventListener('click', function(e){
        e.preventDefault();
        // show all review mode cards
        toggleCards(false);
        // hide the highscores card
        document.getElementById('highscores-card').style.display = 'none';
    })
}

main();