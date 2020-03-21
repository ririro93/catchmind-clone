//////////////////////////////////////////// Requirements
// express
const express = require('express');
const app = express();

// socket.io
const socket = require('socket.io');

// nedb
const Datastore = require('nedb');

//// Server init
const server = app.listen(3000, () => {
	console.log("listening to port 3000");
});
const io = socket(server);
const db = new Datastore('database.db');
db.loadDatabase();

app.use(express.static('public'));
app.use(express.json());


//////////////////////////////////////////// Global vars
let players = []
let playerNum = 1;
let currentSocketId;


//////////////////////////////////////////// requests
// send database info
app.get('/loadDb', (req, res) => {
	db.find({}, (error, docs) => {
		res.json(docs);
	});
})


// receive new entry -> add to db, sort db -> send back success message
app.post('/api/entry', async (req, res) => {
	const newEntry = req.body;
	console.log("new entry: ", newEntry);
	db.insert(newEntry);
	db.find({}, (error, docs) => {
		res.json(docs);
	});
})

///////////////////////////////////////////// socket connection
io.on('connection', (socket) => {
	console.log(`${socket.id} has connected`);
	currentSocketId = socket.id;
	
	// disconnection
	socket.on('disconnect', () => {
		console.log(`${socket.id} disconnected`);
		players = players.filter(player => player.id != socket.id);
		io.emit('disconnected player', players);
		console.log("online players: ", players);
	});
	
	// new player joins
	socket.on('new player', (playerName) => {
		players.push({ name: playerName, num: playerNum++, id: socket.id });
		io.emit('new player', players);
		console.log("online players: ", players);
	});
})

////////////////////////////////////////////// database



