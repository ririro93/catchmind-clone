////////////////////////////////////////////////////////////// global vars
const socket = io();

const gameLobby = document.getElementById("gameLobby");
const gameEntries = document.getElementById("gameEntries");
const inGame = document.getElementById("inGame");

const nameForm = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");
const nameBtn = document.getElementById("nameBtn");

const entryForm = document.getElementById("entryForm");
const entryInput = document.getElementById("entryInput");
const entryBtn = document.getElementById("entryBtn");

const searchedEntryList = document.getElementById("searchedEntryList");

const playersDiv = document.getElementsByClassName("player");

const drawControls = document.getElementById("drawControls");
const answerSubmit = document.getElementById("answerSubmit");

let db;

let players;

let drawer;

let my_name;

let first_round = true;

//////////////////////////////////////////////////////////////

init();

function init() {
	console.log(socket);
	
	// submit name event listeners
	nameForm.addEventListener('submit', handleNameSubmit);
	nameBtn.addEventListener('click', handleNameSubmit);
	entryForm.addEventListener('submit', handleEntrySubmit);
	entryBtn.addEventListener('click', handleEntrySubmit);
	entryInput.addEventListener('input', handleSearchInput);
	
	// load database
	db = loadDatabase();
	
	// socket comm
	socket.on('new player', async (serverPlayers) => {
		players = await serverPlayers;
		inGameSetup();
	})
	
	socket.on('disconnected player', async (serverPlayers) => {
		players = await serverPlayers;
		inGameSetup();
	})
	
}

async function loadDatabase() {
	const data = await fetch ('/loadDb');
	const data_json = await data.json();
	// console.log("current entries: ", data_json);
	
	//sort the data
	return data_json.sort((a, b) => {
		const nameA = a.entry.toLowerCase();
		const nameB = b.entry.toLowerCase();
		if (nameA > nameB) {
			return 1
		} else {
			return -1
		}
	})
}

function handleNameSubmit(event) {
	event.preventDefault();
	
	// introduce new player
	my_name = nameInput.value;
	socket.emit('new player', my_name);
	
	// enter in-game
	gameLobby.classList.add("hidden");
	gameEntries.classList.add("hidden");
	inGame.classList.remove("hidden");
}

async function handleEntrySubmit(event) {
	event.preventDefault();
	const data = { entry: entryInput.value };
	const confirmed = window.confirm(`add ${data.entry} to entries?`);
	if (confirmed) {
		const options = {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		};
		const entry_res = await fetch('/api/entry', options);
		const entry_json = await entry_res.json();
		db = loadDatabase();
		
		// empty entry input string
		entryInput.value = "";
	}

}

async function handleSearchInput() {
	// if keyword in entry -> show entry with erase button
	const keyWord = entryInput.value;
	const database = await db;
	console.log("database: ", database);
	eraseAllEntries(searchedEntryList);
	entryBtn.textContent = "Add to Database";
	database.forEach(data => {
		if (keyWord && data.entry.toLowerCase().includes(keyWord.toLowerCase())) {
			const entryItem = document.createElement('div');
			entryItem.textContent = data.entry;
			const entryEraseBtn = document.createElement('button');
			entryEraseBtn.textContent = "X";
			entryEraseBtn.addEventListener('click', handleEntryRemoveClick);
			entryItem.appendChild(entryEraseBtn);
			searchedEntryList.appendChild(entryItem);
			
			// if keyword is in database
			if (keyWord.toLowerCase() == data.entry.toLowerCase()) {
				entryBtn.textContent = "Already In Database";
			} else {
				entryBtn.textContent = "Add to Database";
			}
		} 
	});
}

async function handleEntryRemoveClick(event) {
	const removeEntry = event.target.parentNode.firstChild.data;
	const removedEntry = await fetch(`/removeDb/${removeEntry}`);
	db = loadDatabase();
	entryInput.value = "";
	handleSearchInput();
}

function eraseAllEntries(node) {
	let child = node.lastElementChild;  
	while (child) { 
	  node.removeChild(child); 
	  child = node.lastElementChild;
	}
}

function inGameSetup() {
	// first round setting
	if (players.length > 0 && first_round && my_name) {
		drawer = players[0].name;
		console.log("first drawer: ", drawer, my_name);
		first_round = false;
		
		if (drawer != my_name) {
			// if player is not the drawer
			startGameBtn.textContent = "Waiting for Game to Start";
			startGameBtn.classList.add("not-drawer");
			startGameBtn.disabled = true;
			answerSubmit.classList.remove("hidden");
			drawControls.classList.add("hidden");
		}
	}
	console.log("players: ", players);

	for (let i = 0; i < 8; i++) {
		if (i < players.length) {
			playersDiv[i].textContent = players[i].name;
			playersDiv[i].classList.add("online");
		} else {
			playersDiv[i].textContent = `Player ${i+1}`;
			playersDiv[i].classList.remove("online");
		}
	}
}