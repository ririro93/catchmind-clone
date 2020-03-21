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

let db;

let players;

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
	socket.on('new player', (serverPlayers) => {
		players = serverPlayers;
		inGameSetup();
	})
	
	socket.on('disconnected player', (serverPlayers) => {
		players = serverPlayers;
		inGameSetup();
	})
	
}

async function loadDatabase() {
	const data = await fetch ('/loadDb');
	const data_json = await data.json();
	console.log("current entries: ", data_json);
	
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
	socket.emit('new player', nameInput.value);
	
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
	database.forEach(data => {
		if (keyWord && data.entry.toLowerCase().includes(keyWord.toLowerCase())) {
			entryBtn.textContent = "Add to Database";
			const entryItem = document.createElement('div');
			entryItem.textContent = data.entry;
			const entryEraseBtn = document.createElement('button');
			entryEraseBtn.textContent = "X";
			entryItem.appendChild(entryEraseBtn);
			searchedEntryList.appendChild(entryItem);
		}
		if (keyWord.toLowerCase() === data.entry.toLowerCase()) {
			entryBtn.textContent = "Already In Database";
		}
	});
}

function eraseAllEntries(node) {
	let child = node.lastElementChild;  
	while (child) { 
	  node.removeChild(child); 
	  child = node.lastElementChild;
	}
}

function inGameSetup() {
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