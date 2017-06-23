/**
 * Game Engine
 * 
 * @author Luis Moreira <up201102786@fc.up.pt>
 * @author Pedro Almeida <up201102741@fc.up.pt>
 * 
 */

/*
 * BOARD SETTINGS
 */
var board = {
	rows : 0,
	cols : 0,
	width : 30, // box
	height : 30, // box
	numberOfBombs : 0
};

/*
 * HIGH SCORE
 */
var highscore = {
	beginner : [],
	intermediate : [],
	expert : []
};

/*
 * LOAD IMAGES
 */
var box;
box = new Image();
box.src = "img/box.bmp";
var zero;
zero = new Image();
zero.src = "img/zero.bmp";
var one;
one = new Image();
one.src = "img/one.bmp";
var flag;
flag = new Image();
flag.src = "img/flag.bmp";
var mine;
mine = new Image();
mine.src = "img/mine.bmp";
var mine2;
mine2 = new Image();
mine2.src = "img/mine2.bmp";

/*
 * GLOBAL VARIABLES
 */
var user;
var pass;
var level;
var score;
var clock = 0;
var gameState = true;
var bombs = [];
var clickedBs = [];
var rClickedBs = [];

var c; // canvas 2d context
var canvas; // canvas element

var mouseX;
var mouseY;
var clickedX;
var clickedY;
var rClickedX;
var rClickedY;
var rClicks = 0;

/*
 * MAIN FUNCTIONS
 */
function validateForm() {
	var login_div = document.getElementById("login_page");
	var menu_div = document.getElementById("menu_page");
	var rank_div = document.getElementById("rank_page");
	user = document.forms["login_form"]["name"].value;
	pass = document.forms["login_form"]["pass"].value;
	console.log(user+" "+pass);
	var params = {
		'name' : user,
		'pass' : pass
	};
	console.log(params);
	if(user == 'admin' && pass == 'admin') {
		hideGame();
		login_div.style.display = 'none';
		menu_div.style.display = '';
		rank_div.style.display = '';
	} else {
		alert(serverResponse["error"]);
		menu_div.style.display = 'none';
		login_div.style.display = '';
	}
	/*
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://twserver.alunos.dcc.fc.up.pt:8000/register", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
		var serverResponse = JSON.parse(xhr.responseText);
		if (!serverResponse.error) {
			hideGame();
			login_div.style.display = 'none';
			menu_div.style.display = '';
			rank_div.style.display = '';
		} else {
			alert(serverResponse["error"]);
			menu_div.style.display = 'none';
			login_div.style.display = '';
		}
	}
	xhr.send(JSON.stringify(params));
	*/
	return false;
};

function goIndex() {
	level = document.forms["menu_form"].elements["level"].value;
	switch (level) {
	case 'beginner':
		board.rows = 9;
		board.cols = 9;
		board.numberOfBombs = 10;
		break;
	case 'intermediate':
		board.rows = 16;
		board.cols = 16;
		board.numberOfBombs = 40;
		break;
	case 'expert':
		board.rows = 16;
		board.cols = 30;
		board.numberOfBombs = 99;
		break;
	}
	hideMenu();
	showGame();
	var h = board.rows * board.height;
	var w = board.cols * board.width;
	start();
	canvas.height = h;
	canvas.width = w;
	drawCanvas(h, w);
	initBombs();
};

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x : evt.clientX - rect.left,
		y : evt.clientY - rect.top
	};
};

function start() {
	initTimer();
	numOfFlags();
	canvas = document.getElementById("gCanvas");
	c = canvas.getContext("2d");
	/*
	 * LEFT CLICK EVENT
	 */
	canvas.onclick = function(event) {
		var cpos = getMousePos(canvas, event);
		mouseX = cpos.x;
		mouseY = cpos.y;
		if ((Math.floor(mouseX / board.width) < board.cols)
				&& (Math.floor(mouseY / board.height) < board.rows)) {
			clickedX = Math.floor(mouseX / board.width);
			clickedY = Math.floor(mouseY / board.height);
		}
		var clickedBomb = false;
		for (var i = 0; i < board.numberOfBombs; i++) {
			if (clickedX == bombs[i][0] && clickedY == bombs[i][1]) {
				clickedBomb = true;
				gameState = false;
				lose(event);
			}
		}
		/*
		 * CHECK REVEAL WIN
		 */
		if (!clickedBomb) {
			clickPass(clickedX, clickedY);
		}
	};
	/*
	 * RIGHT CLICK EVENT
	 */
	canvas.oncontextmenu = function(event) {
		event.preventDefault();
		var cpos = getMousePos(canvas, event);
		mouseX = cpos.x;
		mouseY = cpos.y;
		if ((Math.floor(mouseX / board.width) < board.cols)
				&& (Math.floor(mouseY / board.height) < board.rows)) {
			rClickedX = Math.floor(mouseX / board.width);
			rClickedY = Math.floor(mouseY / board.height);
		}
		var inRClickedBs = [ false, 0 ];
		for (i in rClickedBs) {
			if (rClickedBs[i][0] == rClickedX && rClickedBs[i][1] == rClickedY) {
				inRClickedBs = [ true, i ];
			}
		}
		if (!inRClickedBs[0]) {
			if (rClicks < board.numberOfBombs) {
				rClicks++;
				numOfFlags();
				var len = rClickedBs.length;
				rClickedBs[len] = [];
				rClickedBs[len][0] = rClickedX;
				rClickedBs[len][1] = rClickedY;
				/*
				 * CHECK FLAG WIN!
				 */
				if (rClickedBs.length == board.numberOfBombs) {
					gameState = true;
					var flag = new Array(board.numberOfBombs);
					var ctr = 0;
					for (var i = 0; i < board.numberOfBombs; i++) {
						for (var j = 0; j < board.numberOfBombs; j++) {
							if (bombs[i][0] == rClickedBs[j][0]
									&& bombs[i][1] == rClickedBs[j][1]) {
								flag[ctr++] = true;
								break;
							} else {
								flag = false;
							}
						}
					}
					if (ctr == board.numberOfBombs) {
						win();
					}
				}
			}
		} else {
			rClickedBs.splice(inRClickedBs[1], 1);
			rClicks--;
			numOfFlags();
		}
		drawCanvas();
	};
};

function drawCanvas(h, w) {
	for (var i = 0; i < board.rows; i++) {
		for (var j = 0; j < board.cols; j++) {
			var x = j * board.width;
			var y = i * board.height;
			var beenClicked = [ 0, false ];
			var rBeenClicked = [ 0, false ];
			/*
			 * LEFT CLICK ITERATION
			 */
			if (clickedBs.length > 0) {
				for (var k = 0; k < clickedBs.length; k++) {
					if (clickedBs[k][0] == j && clickedBs[k][1] == i) {
						beenClicked = [ k, true ];
					}
				}
			}
			if (beenClicked[1]) {
				if (clickedBs[(beenClicked[0])][2] > 0) {
					c.drawImage(one, x, y);
				} else {
					c.drawImage(zero, x, y);
				}
			} else {
				/*
				 * RIGHT CLICK ITERATION
				 */
				if (rClickedBs.length > 0) {
					for (var k = 0; k < rClickedBs.length; k++) {
						if (rClickedBs[k][0] == j && rClickedBs[k][1] == i) {
							rBeenClicked = [ k, true ];
						}
					}
				}
				if (rBeenClicked[1]) {
					c.drawImage(flag, x, y);
				} else {
					c.drawImage(box, x, y);
				}
			}
		}
	}
	for (i in clickedBs) {
		if (clickedBs[i][2] > 0) {
			c.font = "18px arial";
			c.fillText(clickedBs[i][2], clickedBs[i][0] * board.width + 3,
					clickedBs[i][1] * board.height + 20);
		}
	}
	return false;
};

function initBombs() {
	for (var i = 0; i < board.numberOfBombs; i++) {
		do {
			var x = Math.floor(Math.random() * board.cols);
			var y = Math.floor(Math.random() * board.rows);
		} while (exists(x, y));
		bombs[i] = [ x, y ];
	}
	drawCanvas();
};

function clickPass(x, y) {
	var boxesToCheck = [ [ -1, -1 ], [ 0, -1 ], [ 1, -1 ], [ -1, 0 ], [ 1, 0 ],
			[ -1, 1 ], [ 0, 1 ], [ 1, 1 ] ];
	var numOfBombsSurrounding = 0;
	for (i in boxesToCheck) {
		for (var j = 0; j < board.numberOfBombs; j++) {
			if (checkBomb(j, x + boxesToCheck[i][0], y + boxesToCheck[i][1])) {
				numOfBombsSurrounding++;
			}
		}
	}
	clickedBs[(clickedBs.length)] = [ x, y, numOfBombsSurrounding ];
	if (numOfBombsSurrounding == 0) {
		for (i in boxesToCheck) {
			if (x + boxesToCheck[i][0] >= 0
					&& x + boxesToCheck[i][0] <= board.cols
					&& y + boxesToCheck[i][1] >= 0
					&& y + boxesToCheck[i][1] <= board.rows) {
				var x1 = x + boxesToCheck[i][0];
				var y1 = y + boxesToCheck[i][1];
				var alreadyClicked = false;
				for (i in clickedBs) {
					if (clickedBs[i][0] == x1 && clickedBs[i][1] == y1) {
						alreadyClicked = true;
					}
				}
				var alreadyRClicked = false;
				for (i in rClickedBs) {
					if (rClickedBs[i][0] == x1 && rClickedBs[i][1] == y1) {
						alreadyRClicked = true;
					}
				}
				if (!alreadyClicked && !alreadyRClicked) {
					clickPass(x1, y1);
				}
			}
		}
	}
	drawCanvas();
};

function initTimer() {
	timer = setTimeout(function() {
		var timerDiv = document.getElementById("timer");
		clock++;
		timerDiv.innerHTML = clock;
		initTimer();
	}, 1000);
};

function numOfFlags() {
	var availableFlags = board.numberOfBombs - rClicks;
	var flagDiv = document.getElementById("flag");
	flagDiv.innerHTML = availableFlags;
	return false;
};

function newGame() {
	bombs = [];
	clickedBs = [];
	rClickedBs = [];
	rClicks = 0;
	clearTimeout(timer);
	clock = 0;
	drawCanvas();
	initBombs();
	start();
	return false;
};

function quitGame() {
	bombs = [];
	clickedBs = [];
	rClickedBs = [];
	rClicks = 0;
	clearTimeout(timer);
	clock = 0;
	validateForm();
	return false;
};

function win() {
	saveScore();
	canvas.onclick = function(event) {
		return false;
	};
	canvas.oncontextmenu = function(event) {
		return false;
	};
	clearTimeout(timer);
	alert("YOU WON WITH " + score + " POINTS\nPRESS RESTART or EXIT");
	return false;
};

function lose(event) {
	saveScore();
	showBombs();
	canvas.onclick = function(event) {
		return false;
	};
	canvas.oncontextmenu = function(event) {
		return false;
	};
	clearTimeout(timer);
	alert("YOU LOST WITH " + score + " POINTS\nPRESS RESTART or EXIT");
	return false;
};

function saveScore() {
	var mainDiv = document.getElementById("rank_page");
	var scoreDiv = mainDiv.getElementsByClassName("inner-wrap");
	if (!gameState) {
		score = 0;
	} else {
		score = 1000 - clock;
	}
	highscore[level].push({
		'user' : user,
		'score' : score,
	});
	highscore[level].forEach(function(entry) {
		scoreDiv[0].innerHTML += entry.user + ' - ' + entry.score + ' - ' + level
				+ '<br />';
	});
	return false;
};

/*
 * AUX FUNCTIONS
 */
function checkBomb(i, x, y) {
	if (bombs[i][0] == x && bombs[i][1] == y) {
		return true;
	} else {
		return false;
	}
};

function exists(x, y) {
	for (i in bombs) {
		if (bombs[i][0] == x && bombs[i][1] == y) {
			return true;
		}
	}
	return false;
};

function showBombs() {
	for (i in bombs) {
		c
				.drawImage(mine, bombs[i][0] * board.width, bombs[i][1]
						* board.height);
	}
	c.drawImage(mine2, clickedX * board.width, clickedY * board.height);
	return false;
};

function hideMenu() {
	var rank_div = document.getElementById("rank_page");
	var menu_div = document.getElementById("menu_page");
	menu_div.style.display = 'none';
	rank_div.style.display = 'none';
	return false;
};

function hideGame() {
	var game_div = document.getElementById("game_page");
	var newGame_div = document.getElementById("newGame");
	var timer_div = document.getElementById("timer");
	var timer_img_div = document.getElementById("timer_img");
	var quitGame_div = document.getElementById("quitGame");
	var flag_div = document.getElementById("flag");
	var flag_img_div = document.getElementById("flag_img");
	game_div.style.display = 'none';
	newGame_div.style.display = 'none';
	timer_div.style.display = 'none';
	timer_img_div.style.display = 'none';
	quitGame_div.style.display = 'none';
	flag_div.style.display = 'none';
	flag_img_div.style.display = 'none';
	return false;
};

function showGame() {
	var game_div = document.getElementById("game_page");
	var newGame_div = document.getElementById("newGame");
	var timer_div = document.getElementById("timer");
	var timer_img_div = document.getElementById("timer_img");
	var quitGame_div = document.getElementById("quitGame");
	var flag_div = document.getElementById("flag");
	var flag_img_div = document.getElementById("flag_img");
	var controls_div = document.getElementById("controls");
	game_div.style.display = '';
	newGame_div.style.display = '';
	timer_div.style.display = '';
	timer_img_div.style.display = '';
	quitGame_div.style.display = '';
	flag_div.style.display = '';
	flag_img_div.style.display = '';
	controls_div.style.display = '';
	return false;
};