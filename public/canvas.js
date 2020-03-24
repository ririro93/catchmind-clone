////////////////////////////////////////////////////////////////////// global vars
const colorBtns = [...document.getElementsByClassName("color-Btn")];
const widthInput = document.getElementById("widthInput");
const gameCanvas = document.getElementById("gameCanvas");
const drawMode = document.getElementById("drawMode");
const drawClear = document.getElementById("drawClear");

const ctx = gameCanvas.getContext("2d");

// initiate canvas
gameCanvas.width = gameCanvas.getBoundingClientRect().width;
gameCanvas.height = gameCanvas.getBoundingClientRect().height;

// console.log("width, height: ", gameCanvas.width, gameCanvas.height);

let currColor = "rgba(0, 0, 0, 1)";
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
}

function handleColorClick(event) {	
	// activate button and deactivate all other buttons
	colorBtns.forEach(colorBtn => {
		colorBtn.classList.remove("active");
	})
	event.target.classList.add("active");
	currColor = event.target.style.backgroundColor;
	ctx.strokeStyle = currColor;
	ctx.fillStyle = "rgba("+`${currColor.slice(4, -1)}`+ ", 0.4)";
}

function changeThick() {
	const width = widthInput.value
	ctx.lineWidth = width;
}


function onMouseMove(event) {
	const x = event.offsetX;
	const y = event.offsetY;
	if(!painting) {
		ctx.beginPath();
		ctx.moveTo(x, y);
	} else {
		ctx.lineTo(x, y);
		ctx.stroke();
	}
}

function stopPainting() {
	painting = false;
}

function startPainting(event) {
	if (filling) {
		ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
	} else {
		painting = true;
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
}