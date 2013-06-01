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
		H_POS = 130,			// horizontal distance between the left side of each grid tile
		V_POS = 90,				// vertical distance between the top of each grid tile
		mult = ((WINDOW_HEIGHT + 30) / 955),
		coordStartX = (((WINDOW_WIDTH / mult) - (H_POS * 9)) / 2),
		coordStartY = (((WINDOW_HEIGHT / mult) - (V_POS * 8)) / 2),
		BLK_SPACE = 4, 			// spacing between grid tiles

		// game variables
		gameGrid = [],			// a 9x8 grid containing an object representation of each unit
		enemyGrid = [],			// a 9x8 grid containing a canvas object of each enemy piece
		playerPieces = [],		// an array of 21 corresponding to canvas object of each game unit
		gameStarted = false,
		startPositionX, startPositionY,
		playerNumber = 0,
		playerName = USERNAME,
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

	/**
	 * Helper function to create each tile.
	 * TODO: Implement caching. No use in drawing 72 individual tiles.
	 */
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

	/**
	 * Iterates through every tile and checks its contents. If the old grid
	 * is empty, but the grid is not, create an enemy piece and place it on 
	 * that tile. Conversely, if the tile used to have something and is now 
	 * empty, destroy that piece.
	 */
	function refreshEnemyGrid(matrix){
		for (var i = 0; i < 9; i++){
			for (var j = 0; j < 8; j++){
				// if grid position is not empty anymore
				var oldPiece = enemyGrid[i][j],
					newPiece = matrix[i][j];

				if(oldPiece != "_" && newPiece === "_"){
					oldPiece.destroy();
					enemyGrid[i][j] = "_";
				}
				else if(oldPiece === "_" && newPiece === "*"){
					xPos = coordStartX + (i * H_POS) + (H_POS / 2);
					yPos = coordStartY + (j * V_POS) + (V_POS / 2);

					piece = createEnemyPieces(xPos, yPos);
					pieceLayer.add(piece);
					enemyGrid[i][j] = piece;
				}
			}
		}
		pieceLayer.draw();
	}

	/**
	 * Redraws player's grid at the BEGINNING(pre) of the turn. Only modifies the 
	 * board in the case that there as been a captured piece after opponent's
	 * last move. 
	 * (Any movement or captures that occurred during the user's move is updated
	 *  after user's turn.)
	 *
	 */
	function refreshOwnGrid(matrix){
		console.log(typeof(matrix));
		for(var i = 0; i < 9; i++){
			for(var j = 0; j < 8; j++){
				if(gameGrid[i][j] != "_" && matrix[i][j] === "_"){
					removePiece("self", i, j);
					gameGrid[i][j] = "_";
				}
			}
		}		
		pieceLayer.draw();
	}

	/**
	 * Wait every 2 seconds to check if its player's turn yet. When it is,
	 * stop looping, refresh both grids, and allow movement. Lastly, check
	 * if there is a listed winner yet, if so, alert the player who it is.
	 */
	function turnListener(){
		$.get(BASE + '/game/listen_turn/' + game_id, function(data){
			if(data === "true"){
				clearTimeout(listenerTimer);
				
				var pkg = game_id;
				json = JSON.stringify(pkg);
							
				// update my grid
				$.post(BASE + '/game/get_player_grid', json, function(data){
					refreshOwnGrid(JSON.parse(data));
				});

				// update enemy grid
				$.post(BASE + '/game/get_enemy_grid/', json, function(data){
					refreshEnemyGrid(JSON.parse(data));
					generals.setMovement(true);

					// check for win condition
					$.get(BASE + '/game/get_winner/' + game_id, function(data){
						if(data === 1 || data === 2){
							if(data === playerNumber){
								alert("You win!");
							}
							else{
								alert("You lost!");
							}
						}
					});
				});				
			}
		});		
		listenerTimer = setTimeout(turnListener, 2000);
	}

	/**
	 * Tell server player's turn is done, opponent's turn now.
	 */
	function toggleTurn(){
		var pkg = new Object();
		pkg.id = game_id;

		json = JSON.stringify(pkg);

		$.post(BASE + '/game/toggle_turn/', json, function(data){
			// wait for the next turn change
			turnListener();
		});
	}

	/**
	 * Removes a game piece from either grid at [x, y] by calling the
	 * polygon's destroy() function.
	 */
	function removePiece(owner, x, y){
		if(owner === "self"){
			var piece = gameGrid[x][y];
			var index = gamePieces.indexOf(piece);
			
			// Make sure to set it offscreen first before calling destroy.
			// Otherwise, [x,y] position stays, causing conflicts with collision
			// checking on dragEnd event of the polygon.
			// Not necessary for enemy grid as there is no collision checking locally.
			playerPieces[index].setPosition(-50, -50);
			playerPieces[index].destroy();
		}
		else{
			var piece = enemyGrid[x][y];
			piece.destroy();
		}
		pieceLayer.draw();
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
			// creates a label for each piece.
			// TODO: Find a different way to represent this
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
				var pkg = new Object(); // json package to be sent over
				pkg.id = game_id;
				generals.setMovement(false);
				$("#message").html("<h6>Waiting for opponent's move.</h6>");
				
				// update self-grid
				piece = gamePieces[playerPieces.indexOf(this)];
				pkg.piece = piece;

				for(var i = 0; i < 9; i++){
					for(var j = 0; j < 8; j++){
						if(gameGrid[i][j] === piece) { 
							origX = i; 
							origY = j; 
							gameGrid[i][j] = "_";

							pkg.x0 = i;
							pkg.y0 = j;
							pkg.x1 = i;
							pkg.y1 = j;
						}
					}
				}
				
				if(move.change === "+x"){ 
					gameGrid[origX+1][origY] = piece; 
					pkg.x1 = pkg.x0 + 1;
				}
				else if(move.change === "+y"){ 
					gameGrid[origX][origY+1] = piece;
					pkg.y1 = pkg.y0 + 1; 
				}
				else if(move.change === "-x"){ 
					gameGrid[origX-1][origY] = piece; 
					pkg.x1 = pkg.x0 - 1;
				}
				else if(move.change === "-y"){ 
					gameGrid[origX][origY-1] = piece;
					pkg.y1 = pkg.y0 - 1; 
				}
				

				// update enemy's grid
				var json = JSON.stringify(pkg);
				var is_winner = null;

				// send the changes to the server
				// check the callback if there was a capture/win-condition is met
				$.post(BASE + '/game/update_move', json, function(code){
					console.log(code);
					// check controller return codes for reference
					// if code === 0, do nothing at all
					if(code === 1 || code === 4){
						removePiece("opponent", pkg.x1, pkg.y1);
						enemyGrid[pkg.x1][pkg.y1] = "_";

						if(code === 4){
							is_winner = true;
						}
					}
					else if(code === 2 || code === 5){
						removePiece("self", pkg.x1, pkg.y1);
						gameGrid[pkg.x1][pkg.y1] = "_";
						
						if(code === 5){
							is_winner = false;
						}
					}
					else if(code === 3){
						is_winner = true;
					}
					else if(code === 6){
						removePiece("self", pkg.x1, pkg.y1);
						removePiece("opponent", pkg.x1, pkg.y1);
						
						gameGrid[pkg.x1][pkg.y1] = "_";
						enemyGrid[pkg.x1][pkg.y1] = "_";
					}
					toggleTurn();
					if(is_winner != null){
						if(is_winner){
							alert("You are win!");
						}
						else{
							alert("You are disappoint!");
						}
					}
				});
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
			pieceLayer.add(temp.piece);			// add to layer
			playerPieces.push(temp.piece);		// add to list of player pieces for indexing

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


	/**
	 * Initial function called to draw all enemy pieces
	 * in their initial positions. The game pieces (canvas objects)
	 * are stored directly in the grid for convenience.
	 */
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
					enemyGrid[i][j] = piece;
					pieceLayer.add(piece);
				}
			}
		}
		pieceLayer.draw();
	}


	// Creates two 9 x 8 arrays to store piece data
	// _ indicates empty spaces
	function initializeGrid() {
		for (var i = 0; i < 9; i++) {
			gameGrid[i] = [];
			enemyGrid[i] = [];
			for (var j = 0; j < 8; j++) {
				gameGrid[i][j] = '_';
				enemyGrid[i][j] = "_";
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
		turnListener: turnListener,
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
		clearAll: function () {
			stage.clear();
		},
		setMovement: function (val) {
			for (var i = 0; i < 21; i++) {
				if (playerPieces[i] !== null){ playerPieces[i].setDraggable(val); }
			}
		}
	};
})(window.innerHeight - 30, window.innerWidth - 20);