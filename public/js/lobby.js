jQuery(document).ready(function($) {

	/**
	 * Creates the invitation dialogue. 
	 * Dialogue is dynamically updated with AJAX.
	 *
	 */
	$("#invite").dialog({
		width: "400px",
		autoOpen: false,
		modal: true,
		buttons: {
			"Challenge!": function(){
				var cid = $("input:radio[name='challenge']:checked").val();
				if (cid > 0){
					var stat;
					$.get(BASE + '/lobby/create_invitation/' + cid, function(data){
						// redirect to  waiting screen
						window.location.href = BASE + "/game/wait/" + data;
					});
					$(this).dialog("close");
				}
				else{
					$("#invite").append("<br><br><span class = \"error\">No value was selected. Please choose one or press Cancel.</span>");
				}
			},
	        "Cancel": function() {
	          $( this ).dialog( "close" );
	        }
	      }
	});

	$("#logout").on('click', function(){
		window.location.href = BASE + "/logout";
	});

	$("#create-invite").on('click', function(){
		$.get(BASE + '/lobby/get_available_users/' + ID, function(data, status){
			if(data.length > 0){
				$("#invite").html("Please choose a player to challenge:<br><br><div id = \"invite-choices\"></div>");
				$("#invite-choices")
					.append("<form action=\"\" >");
				for(var i = 0; i < data.length; i++){
					$("#invite-choices")
						.append("<input type = \"radio\" name = \"challenge\" value = \""+  
							data[i].id + "\">" + data[i].username + "</input><br>");
				}
				$("#invite-choices").append("</form>");
			}
			else{
				$("#invite").html("There are no other online players.<br>Please wait and try again.");
			}
		});
		$("#invite").dialog("open");
	});

	// Chat EventListeners-------------------------------
	$("#chat-submit").on('click', function(){
		var pkg = new Object();
		var msg = $("#chat-input").val();
		$("#chat-input").val("");
		pkg.msg = msg;
		sendMsg(pkg);
	});

	$('#chat-box').bind('keypress', function(e) {
		if(e.keyCode==13){
			var pkg = new Object();
			var msg = $("#chat-input").val();
			$("#chat-input").val("");
			pkg.msg = msg;
			sendMsg(pkg);
		}
	});

	function sendMsg(pkg){
		pkg.id = ID;
		pkg = JSON.stringify(pkg);
		$.post(BASE + '/lobby/post_message/', pkg, function(){
			return true;
		});
	}

	function checkOnlineUsers(){
		$.get(BASE + '/lobby/get_available_users/' + ID, function(data, status){
			$("#content-players").html("");
			if(data != null){
				for(var i = 0; i < data.length; i++){
					$("#content-players")
						.append("<span class = \"username\" data-id = \""+  
							data[i].id + "\">" + data[i].username + "</span><br>");
				}
			}
		});
	}

	function checkOngoingGames(){
		$.get(BASE + '/lobby/get_ongoing_games', function(data){
			$("#content-games").html("");
			if(data.length > 0  && data != null && data != []){
				for(var i = 0; i < data.length; i++){
					$("#content-games")
						.append("<span>" + data[i].p1 + " vs " + data[i].p2 + "</span><br>");
				}
			}
			else{
				$("#content-games").html("No ongoing games.");
			}
		});
	}

	function updateChat(){
		$.get(BASE + '/lobby/retrieve_message', function(data){
			$("#chat-window").html("");
			if (data != null){
				for(var i = 0; i < data.length; i++){
					$("#chat-window")
						.append("<span class = \"line\"><i>" + data[i].user + "</i>: " + data[i].msg + "</span><br>");
				}
			}
		});
	}

	function getInvitations(){
		$.get(BASE + '/lobby/get_invitation', function(data){
			var answer = confirm(data.p1 + " has challenged you to a game. Accept?");
			var response = null;
			if(answer){
				response = "y";
				$.get(BASE + '/lobby/respond_invitation/' + data.id + "/" + response, function(res){
					window.location.href = BASE + "/game/play/" + res;
				});				
			}
			else{
				response = "n";
				$.get(BASE + '/lobby/respond_invitation/' + data.id + "/" + response, function(data){});
			}
			
		});
	}

	/**
	 * Recursive function call thta constantly
	 * (1) checks for the online users
	 * (2) checks for ongoing games
	 * (3) updates the chat window
	 *
	 **/
	(function poll(){
		setTimeout(function(){
			checkOnlineUsers();
			checkOngoingGames();
			updateChat();
			getInvitations();
			poll();
		}, 2000);
	})();
});