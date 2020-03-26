////////////////////////////////////////////////////////// global vars
const answerDiv = document.getElementById("answerDiv");
const startGameBtn = document.getElementById("startGameBtn");
const answerSubmitInput = document.getElementById("answerSubmitInput");
const answerSubmitBtn = document.getElementById("answerSubmitBtn");

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
		setTimeout(showNextAnswer, 5000);
	})
}

async function handleStartClick(event) {
	const entries_list = await loadRandomKey();
	random_entries = randomAnswers(entries_list, 10);
	answerDiv.classList.remove("hidden");
	startGameBtn.classList.add("hidden");
	socket.emit('start game', random_entries);
}

function handleSubmitClick(event) {
	const given_answer = answerSubmitInput.value;
	console.log(event);
	
	event.preventDefault();
	if (given_answer == received_entries[answer_num]) {
		answerSubmitInput.value = "Correct!";
		socket.emit('correct answer', my_name);
	} else {
		answerSubmitInput.value = "Wrong!";
		setTimeout(() => {
			answerSubmitInput.value = "";
		}, 2000);
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
	answer_num += 1;
	if (my_name == drawer) {	
		answerDiv.textContent = random_entries[answer_num];
	} else {
		answerDiv.classList.remove("hidden");
		startGameBtn.classList.add("hidden");
		answerDiv.textContent = "O".repeat(received_entries[answer_num].length);
		answerSubmitInput.value = "";
		answerSubmitInput.placeholder = "what is the answer?";
	}
}