window.onload = function () {
	// JQUERY HANDLERS and EVENTS

	$("#chat")
		.hide();
	$("#hints")
		.hide();
	$("#log")
		.hide();
	$("#winner")
		.hide();
	$("#loser")
		.hide();

	$("#winner").dialog({
		dialogClass: "no-close",
		modal: true,
		closeOnEscape: false
	});

	$("#loser").dialog({
		dialogClass: "no-close",
		modal: true,
		closeOnEscape: false
	});

	$("#hide-chat")
		.click(function () {
		$("#chat")
			.hide("slide", {
			direction: "left"
		}, 800);
		$(this)
			.hide();
		$("#show-chat")
			.show("slide", {
			direction: "left"
		}, 1100);
	});

	$("#hide-hints")
		.click(function () {
		$("#hints")
			.hide("slide", {
			direction: "left"
		}, 800);
		$(this)
			.hide();
		$("#show-hints")
			.show("slide", {
			direction: "left"
		}, 1100);
	});

	$("#hide-log")
		.click(function () {
		$("#log")
			.hide("slide", {
			direction: "left"
		}, 800);
		$(this)
			.hide();
		$("#show-log")
			.show("slide", {
			direction: "left"
		}, 1100);
	});

	$(".hide")
		.button({
		icons: {
			primary: "ui-icon-closethick"
		}
	});

	$("#ready").click(function () {
		generals.positionToGrid();		
		var pkg = new Object();
		pkg.grid = generals.gameGrid;
		pkg.id = game_id;

		// restrict movement and hide message
		generals.setMovement(false);
		$(this).fadeOut();
		$("#message").html("<h6>Waiting for the other player...</h6>");

		jsonPkg = JSON.stringify(pkg);
		$.post(BASE + '/game/add_grid/', jsonPkg, function(data){
			// if true request for opponent's coordinates
			// else poll for change on game's turn
			if(data){
				startGame();
			}
			else{
				pollGameStart();
			}
		});
		
	});

	$("#show-chat")
		.click(function () {
		$(this)
			.hide("slide", {
			direction: "left"
		}, 500);
		$("#chat")
			.show("slide", {
			direction: "left"
		}, 800);
		$("#hide-chat")
			.show("slide", {
			direction: "up"
		}, 800);
	});

	$("#show-hints")
		.click(function () {
		$(this)
			.hide("slide", {
			direction: "left"
		}, 500);
		$("#hints")
			.show("slide", {
			direction: "left"
		}, 800);
		$("#hide-hints")
			.show("slide", {
			direction: "up"
		}, 800);
	});

	$("#show-log")
		.click(function () {
		$(this)
			.hide("slide", {
			direction: "left"
		}, 500);
		$("#log")
			.show("slide", {
			direction: "left"
		}, 800);
		$("#hide-log")
			.show("slide", {
			direction: "up"
		}, 800);
	});

	// $('#data')
	// 	.keypress(function (e) {
	// 	if (e.which == 13) {
	// 		var message = $("#data").val();
	// 		socket.emit('sendchat', message);
	// 		$("#data").val("");
	// 	}
	// });

	// Set the variables for game start
	// including the movement bounds on the pieces
	function startGame(){
		// start the game
		generals.gameStarted = true;
		generals.resetBounds();

		var pkg = JSON.stringify(game_id);

		$.post(BASE + '/game/get_enemy_grid/', pkg, function(data){
			generals.drawEnemyPieces(JSON.parse(data));
		});

		// player1 always starts
		if (generals.playerNumber === 1){
			generals.setMovement(true);	
			$("#message").html("<h6>The game has started!<br><br>Your move.</h6>");
		}
		else{
			generals.setMovement(false);
			$("#message").html("<h6>The game has started!<br><br>Waiting for Player1 to start.<h6>");
		}		
	}

	// wait until the game's turn goes from 0 (ready turn) to 1 (start p1)
	function pollGameStart(){
		setTimeout(function(){
			$.get(BASE + '/game/get_turn/' + game_id, function(data){
				if(data === 1){
					startGame();
				}
			});
			pollGameStart();
		}, 2000);
	}


	generals.loadImages(sources, function () {
		generals.init();
		generals.playerNumber = player_number;

		// get randomized initial positions
		$.get(BASE + '/game/get_positions', function(data){
			generals.initializePositions(data, generals.playerNumber);
		});
		
	});
};
