////////////////////////////////////////////////////////// global vars
const answerDiv = document.getElementById("answerDiv");
const startGameBtn = document.getElementById("startGameBtn");

let answer;

let received_entries;

//////////////////////////////////////////////////////////
init();

function init() {
	startGameBtn.addEventListener('click', handleStartClick);
	
	// socket comm
	socket.on('game started', async (random_entries) => {
		received_entries = await random_entries;
		console.log("received_entries: ", received_entries);
		showNextAnswer();
	});
}

async function handleStartClick(event) {
	const entries_list = await loadRandomKey();
	random_entries = randomAnswers(entries_list, 10);
	console.log(random_entries);
	showNextAnswer(random_entries);
	
	answerDiv.classList.remove("hidden");
	startGameBtn.classList.add("hidden");
	socket.emit('start game', random_entries);
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
	console.log("my_name: ", my_name);
	console.log("drawer: ", drawer);
	if (my_name == drawer) {	
		answerDiv.textContent = random_entries[0];
	} else {
		answerDiv.classList.remove("hidden");
		startGameBtn.classList.add("hidden");
		answerDiv.textContent = "O".repeat(received_entries[0].length);
	}
}