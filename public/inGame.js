////////////////////////////////////////////////////////// global vars
const answerDiv = document.getElementById("answerDiv");
const startGameBtn = document.getElementById("startGameBtn");
const answerSubmitInput = document.getElementById("answerSubmitInput");
const answerSubmitBtn = document.getElementById("answerSubmitBtn");

const popupContainer = document.getElementById("popupContainer");
const popupTexts = [...document.getElementsByClassName("popup-text")];

let answer_num = -1;

let received_entries;

//////////////////////////////////////////////////////////
init();

function init() {
	startGameBtn.addEventListener('click', handleStartClick);
	answerSubmitBtn.addEventListener('click', handleSubmitClick);
	
	// socket comm
	socket.on('game started', async (random_entries) => {
		received_entries = await random_entries;
		console.log("received_entries: ", received_entries);
		showNextAnswer();
	});
	
	// when non-drawer answers right
	socket.on('next question', (name) => {
		console.log(name, " got the answer right");
		drawer = name;
		setTimeout(showNextAnswer, 3000);
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
}

async function handleStartClick(event) {
	const entries_list = await loadRandomKey();
	
	received_entries = randomAnswers(entries_list, 10);
	answerDiv.classList.remove("hidden");
	startGameBtn.classList.add("hidden");
	socket.emit('start game', received_entries);
}

function handleSubmitClick(event) {
	event.preventDefault();
	const given_answer = answerSubmitInput.value;
	const correctAns = given_answer.toLowerCase() == received_entries[answer_num].toLowerCase();
	const data = { name: my_name, answer: given_answer, correct: correctAns };
	
	
	// socket comm with server
	socket.emit('answer submit', data);
	
	// if my answer is correct
	if (correctAns) {
		answerSubmitInput.value = "Correct!";
		socket.emit('correct answer', my_name);
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
	console.log("show next answer", my_name, drawer);
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
}