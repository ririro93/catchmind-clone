//////////////////////////////////////////// Requirements
// express
const express = require('express');
const app = express();

// socket.io
const socket = require('socket.io');

// nedb
const Datastore = require('nedb');

//// Server init
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`listening to port ${port}`);
});
const io = socket(server);
const db = new Datastore('database.db');
db.loadDatabase();

app.use(express.static('public'));
app.use(express.json());


//////////////////////////////////////////// Global vars
let players = []
let playerNum = 1;


//////////////////////////////////////////// requests
// send database info
app.get('/loadDb', (req, res) => {
	db.find({}, (error, docs) => {
		res.json(docs);
	});
})

app.get('/removeDb/:removeEntry', (req, res) => {
	db.remove({ entry: req.params.removeEntry }, (error, numRemoved) => {
		console.log("numRemoved: ", numRemoved);
		res.end();
	})
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
	
	// new player joins
	socket.on('new player', (playerName) => {
		players.push({ name: playerName, num: playerNum++, id: socket.id, score: 0 });
		io.emit('new player', players);
		console.log("online players: ", players);
	});
	
	// disconnection
	socket.on('disconnect', () => {
		console.log(`${socket.id} disconnected`);
		players = players.filter(player => player.id != socket.id);
		io.emit('disconnected player', players);
		console.log("online players: ", players);
	});
	
	// start game
	socket.on('start game', (random_entries) => {
		console.log(`game started by ${socket.id}`);
		console.log('the answers are', random_entries);
		io.emit('game started', random_entries);
		for (let i = 0; i < players.length; i++) {
			players[i].score = 0;
		}
	});
	
	// send drawing info
	socket.on('drawing', (drawing_info) => {
		// console.log(drawing_info);
		io.emit('receive drawing', drawing_info);
	});
	
	// send filling info
	socket.on('filling', (filling_info) => {
		io.emit('receive filling', filling_info);
	});
	
	// send clear info
	socket.on('clear', (clear_info) => {
		io.emit('receive clear', clear_info);
	})
	
	// when non-drawer answers right
	socket.on('correct answer', (data) => {
		// give score to drawer and correct answerer
		players.filter(player => {
			if (player.name == data.name) {
				player.score += data.score;
			}
			if (player.name == data.drawer) {
				player.score += Math.floor(data.score / 3);
			}
		});
		const sendData = [...players, data.name]
		io.emit('next question', sendData);
	})
	
	socket.on('answer submit', (answer_data) => {
		console.log(answer_data);
		io.emit('submitted answer', answer_data);
	})
	
	socket.on('time over', (data) => {
		const randPlayerNum = Math.floor(Math.random() * players.length);
		console.log("randPlayerNum: ", randPlayerNum);
		console.log("time over players: ", players);
		const drawer = players[randPlayerNum].name; // 여기 이상함
		
		players.filter(player => {
			if (player.name == data[1]) {
				player.score -= 30;
			}
		});
		io.emit('time over', [players, drawer]);
	})
	
	socket.on('end game', (data) => {
		console.log("game ended: ", data);
		io.emit('game ended', data);
	})
})

////////////////////////////////////////////// database



