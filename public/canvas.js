////////////////////////////////////////////////////////////////////// global vars
const colorBtns = [...document.getElementsByClassName("color-Btn")];
const widthInput = document.getElementById("widthInput");
const gameCanvas = document.getElementById("gameCanvas");
const drawMode = document.getElementById("drawMode");
const drawClear = document.getElementById("drawClear");

const ctx = gameCanvas.getContext("2d");

// initiate canvas
gameCanvas.width = document.body.clientWidth * 0.9 * 0.9;
gameCanvas.height = document.body.clientHeight * 0.75;

console.log("width, height: ", gameCanvas.width, gameCanvas.height);

let currColor = "rgb(99, 110, 114)";
let currFillColor = "rgb(99, 110, 114)";
let currWidth = 2.5;

let painting = false;
let filling = false;

//////////////////////////////////////////////////////////////////////// 

init();

function init() {
	colorBtns.forEach(colorBtn => {
		colorBtn.addEventListener('click', handleColorClick);
	})
	
	// initial canvas
	ctx.fillStyle = "rgb(255, 255, 255, 0.4)";
	ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
	ctx.fillStyle = "rgb(99, 110, 114)";
	ctx.strokeStyle = "rgb(99, 110, 114)";
	ctx.lineWidth = 2.5;
	
	widthInput.value = 2.5;
	
	// draw on canvas
	console.log(gameCanvas);
	gameCanvas.addEventListener("mousemove", onMouseMove);
	gameCanvas.addEventListener("mouseleave", stopPainting);
	gameCanvas.addEventListener("mousedown", startPainting);
	gameCanvas.addEventListener("mouseup", stopPainting);
	
	widthInput.addEventListener("input", changeThick);
	drawMode.addEventListener("click", handleClickMode);
	drawClear.addEventListener("click", handleClickClear);
	
	// receive drawing
	socket.on('receive drawing', (drawing_info) => {
		const x = drawing_info.x;
		const y = drawing_info.y;
		const painting = drawing_info.painting;
		const color = drawing_info.currColor;
		const width = drawing_info.currWidth;



		if (my_name != drawer) {
			ctx.strokeStyle = color;
			ctx.lineWidth = width;
			
			if(!painting) {
				ctx.beginPath();
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
				ctx.stroke();
			}
		}
	});

	// receive filling
	socket.on('receive filling', (filling_info) => {
		const fillColor = filling_info.currFillColor;

		if (my_name != drawer) {
			ctx.fillStyle = fillColor;
			ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
		}
	});
	
	// receive clear
	socket.on('receive clear', (clear_info) => {
		ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
		ctx.fillStyle = "rgb(255, 255, 255, 0.4)"
		ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
	});
	
	// clear canvas on correct answer
	socket.on('next question', (name) => {
		setTimeout(() => {
			ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
			ctx.fillStyle = "rgb(255, 255, 255, 0.4)"
			ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
		}, 5000);
	});
}

function handleColorClick(event) {	
	// activate button and deactivate all other buttons
	colorBtns.forEach(colorBtn => {
		colorBtn.classList.remove("active");
	})
	event.target.classList.add("active");
	currColor = event.target.style.backgroundColor;
	currFillColor = "rgba("+`${currColor.slice(4, -1)}`+ ", 0.4)";
	ctx.strokeStyle = currColor;
	ctx.fillStyle = currFillColor;
}

function changeThick() {
	currWidth = widthInput.value
	ctx.lineWidth = currWidth;
}


function onMouseMove(event) {
	if (my_name == drawer) {
		const x = event.offsetX;
		const y = event.offsetY;
		
		if(!painting) {
			ctx.beginPath();
			ctx.moveTo(x, y);
			socket.emit('drawing', { x, y, painting, currColor, currWidth });
		} else {
			ctx.lineTo(x, y);
			ctx.stroke();
			socket.emit('drawing', { x, y, painting, currColor, currWidth });
		}
	}
}

function stopPainting() {
	painting = false;
}

function startPainting(event) {
	if (my_name == drawer) {
		if (filling) {
			ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
			socket.emit('filling', { currFillColor });
		} else {
			painting = true;
		}
	}
}

function handleClickMode(event) {
	const text = event.target.innerText;
	if(text == "Fill") {
		event.target.innerText = "Draw";
		filling = false;
	} else {
		event.target.innerText = "Fill";
		filling = true;
	}
}

function handleClickClear(event) {
	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	ctx.fillStyle = "rgb(255, 255, 255, 0.4)"
	ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
	socket.emit('clear', { clear: true });
}