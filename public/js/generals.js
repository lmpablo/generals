/**
 * @package Generals - PHP Version
 * @version 0.1
 * @author Luis Pablo
 * @copyright 2013 Luis Pablo
 *
 */
var debug = false,
	sources = {
		com: BASE + "/img/5S.png",
		gen: BASE + "/img/4S.png",
		ltg: BASE + "/img/3S.png",
		mg:  BASE + "/img/2S.png",
		bg:  BASE + "/img/1S.png",
		col: BASE + "/img/col.png",
		ltc: BASE + "/img/ltc.png",
		maj: BASE + "/img/maj.png",
		cpt: BASE + "/img/cpt.png",
		flt: BASE + "/img/1lt.png",
		slt: BASE + "/img/2lt.png",
		sgt: BASE + "/img/sgt.png",
		pvt: BASE + "/img/pvt.png",
		agt: BASE + "/img/agt.png",
		flg: BASE + "/img/flg.png"
	};

// game namespace

var generals = (function (WINDOW_HEIGHT, WINDOW_WIDTH) {
	// kineticJS/canvas
	var stage, grid, pieceLayer, tooltipLayer, images,

	// canvas constants
		H_POS = 130,
		V_POS = 90,
		mult = ((WINDOW_HEIGHT + 30) / 955),
		coordStartX = (((WINDOW_WIDTH / mult) - (H_POS * 9)) / 2),
		coordStartY = (((WINDOW_HEIGHT / mult) - (V_POS * 8)) / 2),
		BLK_SPACE = 4,

		// game variables
		gameGrid = [],
		playerPieces = [],
		connected = false,
		gameStarted = false,
		startPositionX, startPositionY,
		playerNumber = 0,
		playerName = "",
		gamePieces=[{name:"Commander General",abbr:"5S",val:15},
			{name:"General",abbr:"4S",val:14},
			{name:"Lt. General",abbr:"3S",val:13},
			{name:"Major General",abbr:"2S",val:12},
			{name:"Brig. General",abbr:"1S",val:11},
			{name:"Colonel",abbr:"col",val:10},
			{name:"Lt. Colonel",abbr:"ltc",val:9},
			{name:"Major",abbr:"maj",val:8},
			{name:"Captain",abbr:"cpt",val:7},
			{name:"1st Lieutenant",abbr:"flt",val:6},
			{name:"2nd Lieutenant",abbr:"slt",val:5},
			{name:"Sergeant",abbr:"sgt",val:4},
			{name:"Private",abbr:"pvt1",val:3},{name:"Private",abbr:"pvt2",val:3},{name:"Private",abbr:"pvt3",val:3},{name:"Private",abbr:"pvt4",val:3},{name:"Private",abbr:"pvt5",val:3},{name:"Private",abbr:"pvt6",val:3},
			{name:"Agent",abbr:"agt1",val:2},{name:"Agent",abbr:"agt2",val:2},
			{name:"Flag",abbr:"flg",val:1}];

	function createTile(xPos, yPos, color, hoverColor) {
		var rect = new Kinetic.Rect({
			x: xPos,
			y: yPos,
			width: H_POS - BLK_SPACE,
			height: V_POS - BLK_SPACE,
			fill: color
		});
		rect.on('mouseover touchstart', function () {
			this.setFill(hoverColor);
			stage.draw();
		});
		rect.on('mouseout touchend', function () {
			this.setFill(color);
			stage.draw();
		});
		return rect;
	}

	/**
	 * Draw the standard 9 by 8 grid for the game board. Uses helper function
	 * createTile to create individual tiles.
	 */
	function drawGrid() {
		var i, j, rect = {}, tag = {},
		rowBound = coordStartY + (V_POS * 4),
			colBound = coordStartX + (H_POS * 9),
			bottomHalfStart = coordStartY + (V_POS * 4);
		// draw red blocks
		for (j = coordStartY; j < rowBound; j += V_POS) {
			for (i = coordStartX; i < colBound; i += H_POS) {
				rect = createTile(i, j, "#b91d1e", "#D47070");
				grid.add(rect);
			}
		}
		// draw blue blocks
		for (j = bottomHalfStart; j < (bottomHalfStart + (V_POS * 4)); j += V_POS) {
			for (i = coordStartX; i < colBound; i += H_POS) {
				rect = createTile(i, j, "#1957ba", "#6986DB");
				grid.add(rect);
			}
		}
	}

	function loadImages(sources, callback) {
		images = {}; // empty container
		var loadedImages = 0,
			numImages = 0;

		$("#loading").dialog({
			closeOnEscape: false,
			dialogClass: "no-close",
			modal: true,
			height: 90,
			width: 245
		}).show();

		//get num of sources
		for (var src in sources) {
			numImages += 1;
		}
		for (var src in sources) {
			images[src] = new Image();
			images[src].onload = function () {
				$("#loading").html("LOADING... " + Math.floor(((loadedImages + 1) / numImages) * 100) + "%");
				if (++loadedImages >= numImages) {
					$("#loading").dialog("close");
					callback(images);
				}
			};
			images[src].src = sources[src];
		}
		return images;
	}

	/**
	 * Checks the previous move using the destination coordinates. If more than 
	 * a box away, return the original coordinates (pulls piece back to original place).
	 * Used only when game has started
	 *
	 */
	function validatePositions(xMoveTo, yMoveTo) {
		var xDelta, yDelta, change;
		if (generals.gameStarted) {
			xDelta = Math.abs(xMoveTo - startPositionX);
			yDelta = Math.abs(yMoveTo - startPositionY);

			// Prevent pieces from moving more than one piece forward/backward
			if (((xDelta === 130) && (yDelta === 0)) || ((xDelta === 0) && (yDelta === 90))) {
				// if lateral movement
				if (xDelta > 0) {
					if ((xMoveTo - startPositionX) > 0) { change = "+x"; } 
					else { change = "-x"; }
				} else {
					if ((yMoveTo - startPositionY) > 0) { change = "+y"; } 
					else { change = "-y"; }
				}

				return {
					x: xMoveTo,
					y: yMoveTo,
					change: change,
					valid: true
				};
			} else {
				return {
					x: startPositionX,
					y: startPositionY,
					valid: false
				};
			}
		} else {
			return {
				x: xMoveTo,
				y: yMoveTo,
				valid: false
			};
		}
	}


	// Check for collisions with own units by comparing positions
	function checkInCollision(objLoc) {
		var x = objLoc.x + coordStartX - (H_POS / 2),
			y = objLoc.y + coordStartY - (V_POS / 2);

		for (var i = 0; i < 21; i++) {
			if ((playerPieces[i].getPosition().x === x) && (playerPieces[i].getPosition().y === y)) {
				return true;
			}
		}
		return false;
	}

	function createPiece(filename, rank) {
		var trans = null,
			startX, startY, newX, newY, textWidth,
			placeholder = new Kinetic.Rect({
				width: 5,
				height: 5,
				fill: 'black',
				visible: false
			}),
			label = new Kinetic.Text({
				text: rank,
				fontFamily: 'Calibri',
				fontSize: 22,
				padding: 3,
				fill: 'white',
				visible: false,
				align: 'center'
			}),
			piece = new Kinetic.RegularPolygon({
				x: -50, // draw every piece off-screen
				y: -50, // and wait for positions to be received post-connection
				sides: 5,
				radius: 40,
				draggable: true,
				startScale: 1,
				fillPatternImage: images[filename],
				fillPatternOffset: {
					x: 65,
					y: 68
				},
				fillPatternScale: 0.35,
				fillPatternRepeat: 'no-repeat',
				stroke: '#FFFFFF',
				strokeWidth: 2,
				// limit piece rearrangement to the first/last three rows of the game board
				dragBoundFunc: function (pos) {
					startX = this.getAbsolutePosition().x;
					startY = this.getAbsolutePosition().y;
					newX = (pos.x > ((coordStartX + (H_POS / 2)) * mult) && pos.x < (mult * (coordStartX + (H_POS * 9) - (H_POS / 2)))) ? pos.x : startX;
					newY = (pos.y > ((coordStartY + (V_POS / 2)) * mult) && pos.y < (mult * (coordStartY + (V_POS * 3) - (V_POS / 2)))) ? pos.y : startY;

					return {
						x: newX,
						y: newY
					};
				}
			});

		textWidth = label.getTextWidth();

		piece.on('mousemove', function () {
			label.setPosition(this.getPosition()
				.x - (textWidth / 2), this.getPosition()
				.y + 40);
			label.show();

			placeholder.setPosition(this.getPosition()
				.x - (textWidth / 2) - 10, this.getPosition()
				.y + 40);
			placeholder.setWidth(textWidth + 25);
			placeholder.setHeight(label.getTextHeight() + 10);
			placeholder.show();

			tooltipLayer.draw();
		});

		piece.on('mouseout', function () {
			placeholder.hide();
			label.hide();

			tooltipLayer.draw();
		});

		piece.on('dragstart', function () {
			// keep track of unit's starting point
			startPositionX = this.getPosition().x - coordStartX + (H_POS / 2);
			startPositionX = Math.round(startPositionX / H_POS) * H_POS;
			startPositionY = this.getPosition().y - coordStartY + (V_POS / 2);
			startPositionY = Math.round(startPositionY / V_POS) * V_POS;

			// animation stuff
			if (trans) {
				trans.pause();
			}
			this.setAttrs({
				stroke: "white",
				strokeWidth: 5,
				scale: {
					x: this.attrs.startScale * 1.3,
					y: this.attrs.startScale * 1.3
				}
			});
			tooltipLayer.draw();
			pieceLayer.draw();
		});

		piece.on('dragend', function () {
			var x = this.getPosition().x,
				y = this.getPosition().y,
				move, collided, piece, origX, origY;

			x = x - coordStartX + (H_POS / 2);
			y = y - coordStartY + (V_POS / 2);

			// depending on game state, allow how many spaces units can move
			move = validatePositions((Math.round(x / H_POS) * H_POS), (Math.round(y / V_POS) * V_POS));

			x = move.x;
			y = move.y;

			// regardless of state of the game, do not allow collisions
			collided = checkInCollision(move);
			if (collided) {
				x = startPositionX;
				y = startPositionY;
			}

			// snap to middle of each tile
			this.setX((Math.round(x / H_POS) * H_POS) + coordStartX - (H_POS / 2));
			this.setY((Math.round(y / V_POS) * V_POS) + coordStartY - (V_POS / 2));


			this.setAttrs({ strokeWidth: 2 });
			trans = new Kinetic.Tween({
				node: this,
				duration: 0.5,
				easing: Kinetic.Easings.BounceEaseOut,
				scaleX: this.getAttr('startScale'),
            	scaleY: this.getAttr('startScale'),			
            });

			trans.play();

			// if the move is completely valid
			if (!collided && move.valid) {
				generals.setMovement(false);
				$("#message").html("<h6>Waiting for opponent's move.</h6>");
				
				// update self-grid
				piece = gamePieces[playerPieces.indexOf(this)];
				console.log("++inside dragstart++");
				console.log(piece);
				for(var i = 0; i < 9; i++){
					for(var j = 0; j < 8; j++){
						if(gameGrid[i][j] === piece) { 
							origX = i; 
							origY = j; 
							gameGrid[i][j] = "_";
						}
					}
				}
				console.log(origX + ", "+ origY);
				if(move.change === "+x"){ gameGrid[origX+1][origY] = piece; }
				else if(move.change === "+y"){ gameGrid[origX][origY+1] = piece; }
				else if(move.change === "-x"){ gameGrid[origX-1][origY] = piece; }
				else if(move.change === "-y"){ gameGrid[origX][origY-1] = piece; }
				// update enemy's grid
				socket.emit('turnComplete', move.change, gamePieces[playerPieces.indexOf(this)]);
			}

			tooltipLayer.draw();
			pieceLayer.draw();
		});
		return {
			piece: piece,
			label: label,
			placeholder: placeholder
		}
	}

	function drawPieces() {
		var i, shuffled = null,
			positions = [],
			rank, temp,
			plist = ["com", "gen", "ltg", "mg", "bg", "col", "ltc", "maj",
				"cpt", "flt", "slt", "sgt", "pvt", "pvt", "pvt", "pvt",
				"pvt", "pvt", "agt", "agt", "flg"],
			position = null, title;

		for (i = 0; i < 21; i += 1) {
			title = plist[i];

			rank = gamePieces[i];
			temp = createPiece(title, rank.name);
			pieceLayer.add(temp.piece);
			playerPieces.push(temp.piece);

			tooltipLayer.add(temp.placeholder);
			tooltipLayer.add(temp.label);
			pieceLayer.draw();
			tooltipLayer.draw();
		}
	}

	function createEnemyPieces(x, y) {
		piece = new Kinetic.RegularPolygon({
			x: x,
			y: y,
			sides: 5,
			radius: 40,
			draggable: false,
			fill: '#000000',
			stroke: '#FFFFFF',
			strokeWidth: 2
		});
		return piece;
	}

	function drawEnemyPieces(matrix) {
		var i, j, xPos, yPos, piece;
		for (i = 0; i < 9; i++) {
			for (j = 0; j < 8; j++) {
				if (matrix[i][j] === "*") {
					// every enemy position is only denoted by asterisks
					// otherwise, player can see them
					xPos = coordStartX + (i * H_POS) + (H_POS / 2);
					yPos = coordStartY + (j * V_POS) + (V_POS / 2);
					piece = createEnemyPieces(xPos, yPos);
					gameGrid[i][j] = piece;
					pieceLayer.add(piece);
				}
			}
		}
		pieceLayer.draw();
	}


	// Creates a 9 x 8 array to store piece data
	// _ indicates empty spaces
	function initializeGrid() {
		for (var i = 0; i < 9; i++) {
			gameGrid[i] = [];
			for (var j = 0; j < 8; j++) {
				gameGrid[i][j] = '_';
			}
		}
	}

	// Takes a snapshot of the current board and transforms it
	// as an array.
	function positionToGrid() {
		var i = 0,
			loc, x, y;
		initializeGrid(); // clear current info

		for (var i = 0; i < 21; i += 1) {
			loc = playerPieces[i].getPosition();
			x = Math.ceil((((loc.x - (H_POS / 2)) - coordStartX) / H_POS)) * 10 / 10;
			y = Math.ceil((((loc.y - (V_POS / 2)) - coordStartY) / V_POS)) * 10 / 10;

			gameGrid[x][y] = gamePieces[i];
		}
	}

	/**
	 * Using the generated positions by the server, iterate through each game piece 
	 * pop the first 21 positions. The first 9 columns correspond to 1-9, next 9
	 * corresponds to 10-18, etc.
	 * If player2, just shift everythiing to the last 3 rows, instead of top 3.
	 *
	 * @param int positions, int playerNumber
	 *
	 */
	function initializePositions(positions, playerNumber) {
		var position, i;

		for (i = 0; i < 21; i += 1) {
			position = positions.pop();

			if (position < 10) {
				yPos = 1;
			} else if (position < 19) {
				yPos = 2;
			} else {
				yPos = 3;
			}
			xPos = position - ((yPos - 1) * 9);

			if (playerNumber === 2) {
				yPos += 5;
				playerPieces[i].setDragBoundFunc(function (pos) {
					startX = this.getAbsolutePosition()
						.x;
					startY = this.getAbsolutePosition()
						.y;
					newX = (pos.x > ((coordStartX + (H_POS / 2)) * mult) && pos.x < (mult * (coordStartX + (H_POS * 9) - (H_POS / 2)))) ? pos.x : startX;
					newY = (pos.y > ((coordStartY + (V_POS * 5) + (V_POS / 2)) * mult) && pos.y < (mult * (coordStartY + (V_POS * 8) - (V_POS / 2)))) ? pos.y : startY;

					return {
						x: newX,
						y: newY
					};
				});
			}
			xGrid = coordStartX + (xPos * H_POS) - (H_POS / 2);
			yGrid = coordStartY + (yPos * V_POS) - (V_POS / 2);

			playerPieces[i].setPosition(xGrid, yGrid);
		}
		pieceLayer.draw();
		positionToGrid();
	}

	/**
	 * Expand the overall movement boundary of all pieces to the whole board, i.e.
	 * positions can move past the first 3 initial rows, but within borders.
	 * Called when the game starts.
	 */
	function resetDragBounds() {
		for (var i = 0; i < 21; i += 1) {
			playerPieces[i].setDragBoundFunc(function (pos) {
				var inX, inY,
				startX = this.getAbsolutePosition()
					.x,
					startY = this.getAbsolutePosition()
						.y,
					inBoard = (pos.x > ((coordStartX + (H_POS / 2)) * mult) && pos.x < (mult * (coordStartX + (H_POS * 9) - (H_POS / 2))));
				inBoard = (pos.y > ((coordStartY + (V_POS / 2)) * mult) && pos.y < (mult * (coordStartY + (V_POS * 8) - (V_POS / 2))));

				newX = inBoard ? pos.x : startX;
				newY = inBoard ? pos.y : startY;

				return {
					x: newX,
					y: newY
				};
			});
		}
	}

	return {
		connected: connected,
		gameStarted: gameStarted,
		playerNumber: playerNumber,
		playerName: playerName,
		gameGrid: gameGrid,
		images: images,
		loadImages: loadImages,
		initializePositions: initializePositions,
		resetBounds: resetDragBounds,
		drawEnemyPieces: drawEnemyPieces,
		positionToGrid: positionToGrid,
		init: function () {
			stage = new Kinetic.Stage({
				container: 'container',
				width: WINDOW_WIDTH,
				height: WINDOW_HEIGHT,
				scale: mult
			});

			// instantiate kineticJS layers
			grid = new Kinetic.Layer();
			pieceLayer = new Kinetic.Layer();
			tooltipLayer = new Kinetic.Layer();

			drawGrid();
			drawPieces();

			stage.add(grid);
			stage.add(pieceLayer);
			stage.add(tooltipLayer);
		},
		forceRedraw: function () {
			grid.draw();
			pieceLayer.draw();
		},
		clearAll: function () {
			stage.clear();
		},
		setMovement: function (val) {
			for (var i = 0; i < 21; i++) {
				if (playerPieces[i] !== null){ playerPieces[i].setDraggable(val); }
			}
		},
		updateEnemyPositions: function (data) {
			console.log("**enter updateEnemyPositions**");
			console.log(gameGrid);
			var newX = coordStartX + (H_POS * data.newX) + (H_POS / 2),
				newY = coordStartY + (V_POS * data.newY) + (V_POS / 2),
				existingPiece;
			
			existingPiece = gameGrid[data.x][data.y];
			
			gameGrid[data.x][data.y] = "_";
			gameGrid[data.newX][data.newY] = existingPiece;
			existingPiece.setPosition(newX, newY);
			pieceLayer.draw();
			console.log(gameGrid);
			console.log("**exit updateEnemyPositions**");
		},
		// similar to removePiece, but on challengee side.
		eliminatePieces: function (data) {
			console.log("**enter eliminatePieces**");
			console.log(gameGrid);
			// remove enemy unit
			var piece = gameGrid[data.x][data.y], index;
			piece.destroy();
			gameGrid[data.x][data.y] = "_";
			
			// remove unit
			piece = gameGrid[data.newX][data.newY];
			gameGrid[data.newX][data.newY] = "_";
			index = gamePieces.indexOf(piece);
			playerPieces[index].destroy();
			playerPieces[index].setPosition(-50, -50);
			pieceLayer.draw();
			console.log(gameGrid);
			console.log("**exit eliminatePieces**");
		},
		// made specifically to delete two pieces from the same spot
		removePieces: function (x, y) {
			console.log("**enter removePieces**");
			console.log(gameGrid);
			var piece, pos, numberOfPieces, index;
			piece = gameGrid[x][y];
			index = gamePieces.indexOf(piece);
			playerPieces[index].destroy();
			playerPieces[index].setPosition(-50, -50);
			gameGrid[x][y] = "_";

			numberOfPieces = pieceLayer.children.length;
			// remove opponent unit
			x = coordStartX + (x * H_POS) + (H_POS/2);
			y = coordStartY + (y * V_POS) + (V_POS/2);
			for(var i = 0; i < numberOfPieces; i++){
				if (pieceLayer.children[i] !== null){
					pos = pieceLayer.children[i].getPosition();
					if((pos.x == x) && (pos.y == y)){
						pieceLayer.children[i].destroy();
						numberOfPieces -= 1;
					}
				}
			}
			pieceLayer.draw();
			console.log(gameGrid);
			console.log("**exit removePieces**");
		},
		// made to delete one specific unit from a tile
		removeLoser: function (x, y, loser) {
			console.log("**enter removeLoser**");
			console.log(gameGrid);
			var piece, pos, index = gamePieces.indexOf(gameGrid[x][y]), playerPiece = playerPieces[index], 
				numberOfPieces;
			numberOfPieces = pieceLayer.children.length;
			if (loser === "self"){
				playerPieces[index].setPosition(-50, -50);
				playerPiece.destroy();
			}
			else{
				x = coordStartX + (x * H_POS) + (H_POS/2);
				y = coordStartY + (y * V_POS) + (V_POS/2);
				for(var i = 0; i < numberOfPieces - 1; i++){
					pos = pieceLayer.children[i].getPosition();
					if((pieceLayer.children[i] != playerPiece) && (pos.x == x) && (pos.y == y)){
						pieceLayer.children[i].destroy();
					}
				}
			}
			pieceLayer.draw();
			console.log(gameGrid);
			console.log("**exit removeLoser**");
		}	
	};
})(window.innerHeight - 30, window.innerWidth - 20);