////////////////////////////////////////////////////////// global vars
const answerDiv = document.getElementById("answerDiv");
const startGameBtn = document.getElementById("startGameBtn");
const answerSubmitInput = document.getElementById("answerSubmitInput");
const answerSubmitBtn = document.getElementById("answerSubmitBtn");

const popupContainer = document.getElementById("popupContainer");
const popupTexts = [...document.getElementsByClassName("popup-text")];

const timerContainer = document.getElementById("timerContainer");
const barTimerBackground = document.getElementById("barTimerBackground");
const barTimer = document.getElementById("barTimer");

const NUM_ENTRIES = 3;

let answer_num = -1;

let received_entries;

// timer
const width = document.body.clientWidth * 0.9;
const height = document.body.clientHeight * 0.05;

const ROUND_TIME = 60;

let calculatedWidth = 100;

let countdownInterval;

// score system
let myScoreThisRound = 0;


//////////////////////////////////////////////////////////
init();

function init() {
	startGameBtn.addEventListener('click', handleStartClick);
	answerSubmitBtn.addEventListener('click', handleSubmitClick);
	
	// timer setup
	barTimerBackground.setAttribute("width", `${width}`);
	barTimerBackground.setAttribute("height", `${height}`);
	barTimer.setAttribute("width", `${width}`);
	barTimer.setAttribute("height", `${height}`);
	
	// socket comm
	socket.on('game started', async (random_entries) => {
		received_entries = await random_entries;
		console.log("received_entries: ", received_entries);
		showNextAnswer();
	});
	
	// when non-drawer answers right
	socket.on('next question', (data) => {
		console.log(data[data.length-1], " got the answer right");
		players = data.slice(0, data.length-1);
		drawer = data[data.length-1];
		clearInterval(countdownInterval);
		if (answer_num < received_entries.length - 1) {
			setTimeout(showNextAnswer, 3000);
		} else {
			socket.emit('end game', players);
			console.log('game ended');
		}
		console.log("players: ", players);
	})
	
	// when user submits answer
	socket.on('submitted answer', answer_data => {
		for (let i = 0; i < players.length; i++) {
			if (players[i].name == answer_data.name) {
				popupTexts[i].classList.remove("hiding");
				popupTexts[i].textContent = answer_data.answer;
				
				// if submitted answer is correct
				if (answer_data.correct) {
					popupTexts[i].classList.add("correct");
					setTimeout(() => {
						popupTexts[i].classList.remove("correct");
						for (let j = 0; j < players.length; j++) {
							popupTexts[j].classList.add("hiding");
						}
					}, 3000);
				}
			}

		}
	});
	
	// when game ends
	socket.on('game ended', data => {
		let winner;
		let highScore = 0;
		
		console.log('game ended: ', data);
		
		for (let i = 0; i < players.length; i++) {
			if (players[i].score > highScore) {
				highScore = players[i].score;
				winner = players[i].name
			}
		}
		console.log("the winner is ", winner, " with a score of ", highScore);
		answerDiv.textContent = `${winner} wins with ${highScore} points!`;
	})
}

async function handleStartClick(event) {
	const entries_list = await loadRandomKey();
	
	received_entries = randomAnswers(entries_list, NUM_ENTRIES);
	answerDiv.classList.remove("hidden");
	startGameBtn.classList.add("hidden");
	socket.emit('start game', received_entries);
}

function handleSubmitClick(event) {
	event.preventDefault();
	const given_answer = answerSubmitInput.value;
	const correctAns = given_answer.toLowerCase() == received_entries[answer_num].toLowerCase();
	const data = { name: my_name, drawer: drawer, answer: given_answer, correct: correctAns, score: Math.floor(calculatedWidth) };
	
	
	// socket comm with server
	socket.emit('answer submit', data);
	
	// if my answer is correct
	if (correctAns) {
		answerSubmitInput.value = "Correct!";
		socket.emit('correct answer', data);
	} else {
		answerSubmitInput.value = "";
	}
}

async function loadRandomKey() {
	const entries = await fetch('/loadDb');
	const entries_json = await entries.json();
	let entries_list = [];
	entries_json.forEach(entry => {
			entries_list.push(entry.entry);
	});
	// console.log("in-game: ", entries_list);
	return entries_list
}

function randomAnswers(entries_list, num_questions) {
	const entry_len = entries_list.length;
	let random_entries = [];
	for (let i = 0; i < num_questions; i++) {
		random_entries.push(entries_list[Math.floor(Math.random()*entry_len)]);
	}
	return random_entries
}

function showNextAnswer() {
	console.log("show next answer, drawer: ", drawer);
	answer_num += 1;
	
	// show drawer in red
	for (let i = 0; i < 8; i++) {
		if (i < players.length) {
			playersDiv[i].textContent = players[i].name;
			playersDiv[i].classList.add("online");
			if (playersDiv[i].textContent == drawer) {
				playersDiv[i].classList.add("drawer");
			} else {
				playersDiv[i].classList.remove("drawer");
			}
		} else {
			playersDiv[i].textContent = `Player ${i+1}`;
			playersDiv[i].classList.remove("online");
		}
	}
	
	if (my_name == drawer) {	
		answerDiv.textContent = received_entries[answer_num];
		answerSubmit.classList.add("hidden");
		drawControls.classList.remove("hidden");
	} else {
		answerSubmit.classList.remove("hidden");
		drawControls.classList.add("hidden");
		answerDiv.classList.remove("hidden");
		startGameBtn.classList.add("hidden");
		answerDiv.textContent = "O".repeat(received_entries[answer_num].length);
		answerSubmitInput.value = "";
		answerSubmitInput.placeholder = "what is the answer?";
	}
	
	// start timer
	calculatedWidth = 100;
	countdownInterval = setInterval(countdown, 1000);
}

function countdown() {
	calculatedWidth -= 100 / ROUND_TIME;
	barTimer.setAttribute("width", `${calculatedWidth}%`);
	
	if (calculatedWidth < 50) {
		barTimer.classList.add("warning");
	}
	
	if (calculatedWidth < 25) {
		barTimer.classList.remove("warning");
		barTimer.classList.add("danger");
	}
	if (calculatedWidth < 0) {
		clearInterval(countdownInterval);
	}
}

function showScores() {
	console.log("the final scores are: ", players);
}