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

const scoreBoard = document.getElementById("scoreBoard");
const scoreBoardTable = document.getElementById("scoreBoardTable");

const restartBtn = document.getElementById("restartBtn");

const NUM_ENTRIES = 2;

let answer_num;

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
	restartBtn.addEventListener('click', handleRestartClick);
	
	// timer setup
	barTimerBackground.setAttribute("width", `${width}`);
	barTimerBackground.setAttribute("height", `${height}`);
	barTimer.setAttribute("width", `${width}`);
	barTimer.setAttribute("height", `${height}`);
	
	// socket comm
	socket.on('game started', async (random_entries) => {
		answer_num = -1;
		myScoreThisRound = 0;
		received_entries = await random_entries;
		console.log("received_entries: ", received_entries);
		
		// reset player scores
		for (let i = 0; i < players.length; i++) {
			players[i].score = 0;
			console.log(`${players[i].name} has ${players[i].score} points`);
		}
		
		// remove former scores from scoreboard
		eraseAllEntries(scoreBoardTable);
		
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
			showScores();
		}
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
	
	// when game ends (this gets executed too many times)
	socket.on('game ended', data => {
		let winner;
		let highScore = 0;
		
		for (let i = 0; i < players.length; i++) {
			if (players[i].score > highScore) {
				highScore = players[i].score;
				winner = players[i].name
			}
		}
		answerDiv.textContent = `${winner} WINS!`;
		
		// reset timer
		barTimer.setAttribute("width", `100%`);
		
		// hide canvas and show scoreboard
		gameCanvas.classList.add("hidden");
		scoreBoard.classList.remove("hidden");
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
	answer_num += 1;
	console.log("drawer: ", drawer, answer_num);
	console.log("players: ", players);
	
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
	
	// show inputs and hide restartBtn
	restartBtn.classList.add("hidden");
	scoreBoard.classList.add("hidden");
	gameCanvas.classList.remove("hidden");
	
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
		drawerTimeOver();
	}
}

function showScores() {
	console.log("the final scores are: ", players);
	players.sort((a, b) => {
		if (a.score < b.score) {
			return 1
		} else {
			return -1
		}
	});
	scoreBoardTable.innerHTML = `
		<tr>
			<th>Rank</th>
			<th>name</th>
			<th>score</th>
		</tr>
	`;
	
	for (let i = 0; i < players.length; i++) {
		const finalRow = document.createElement('tr');
		const finalRank = document.createElement('td');
		const finalName = document.createElement('td');
		const finalScore = document.createElement('td');
		
		finalRank.textContent = i + 1;
		finalName.textContent = players[i].name;
		finalScore.textContent = players[i].score;
		
		finalRow.appendChild(finalRank);
		finalRow.appendChild(finalName);
		finalRow.appendChild(finalScore);
		
		scoreBoardTable.appendChild(finalRow);
	}
	
	// show restart button, hide answerSubmitInput and drawControls
	restartBtn.classList.remove("hidden");
	answerSubmit.classList.add("hidden");
	drawControls.classList.add("hidden");
}

function drawerTimeOver() {
	console.log("time over next drawer up");
}

function handleRestartClick(event) {
	handleStartClick();
}


