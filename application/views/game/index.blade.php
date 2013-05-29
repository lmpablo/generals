<html>
<head>
	<title>Game of the Generals</title>
	<link href='http://fonts.googleapis.com/css?family=Roboto+Slab:700|Roboto' rel='stylesheet' type='text/css'>
	{{ HTML::style('css/reset.css')}}
	{{ HTML::style('css/generals/jquery-ui-1.10.3.custom.css')}}
	{{ HTML::style('css/game.css') }}
</head>
<body>
	<div id="container"></div>
	<div id="show-chat" class="show">OPEN CHAT</div>
	<div id="show-hints" class="show">OPEN QUICK HELP</div>
	<div id="show-log" class="show">OPEN MOVE LOG</div>
	<div id="chat" class="sidebar">
		<button id="hide-chat" class="hide"></button>
			<h5>Game Chat</h5>

		<div id="conversation">Welcome to <b>GENERALS</b>.<br>
		</div>
		<input id="data" placeholder="Send a message..." />
	</div>
	<div id="hints" class="sidebar">
		<button id="hide-hints" class="hide"></button>
			<h5>Quick Help</h5>
			<div class = "content-box">
				<b>Objective:</b> Capture the flag <b>OR</b> bring your flag to the other side.<br><br>
				Here are the pieces listed by ranking:<br><br>
				1) <b>Commander General</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				2) <b>Lieutenant General</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				3) <b>Major General</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				4) <b>Brigadier General</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				5) <b>Colonel</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				6) <b>Lieutenant Colonel</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				7) <b>Major</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				8) <b>Captain</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				9) <b>1st Lieutenant</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				10) <b>2nd Lieutenant</b> beats every lower ranking piece except for the <b>Agent</b><br><br>
				11) <b>Sergeant</b> can  only beat <b>Privates</b> and the <b>Flag</b></b><br><br>
				12) <b>Privates</b> beats can only beat <b>Agents</b> and the <b>Flag</b> <br><br>
				13) <b>Agents</b> can beat everyone except for <b>Privates</b><br><br>
				15) <b>Flag</b> can only beat other <b>Flags</b><br><br>
			</div>
	</div>
	<div id="log" class="sidebar">
		<button id="hide-log" class="hide"></button>
			<h5>Move Log</h5>

		<div id="moves" class = "content-box"><b>---COMING SOON---</b>
			<br>
		</div>
	</div>
	<div class = "right-bar">
		<div class = "wrapper">
			<div id="message">
				<h6>Rearrange the units as you wish. You may only put them in the 3 rows on your side.<br>
				<br>When you're finished, press the 'READY' button below.</h6>
			<div id="ready">
				<h5 class ="button-text">READY</h5>
			</div>
		</div>
	</div>
	<div id="loading"></div>
	<script>
		var BASE = "{{ URL::base() }}",
			ID = "{{ Auth::user()->id }}",
			USERNAME = "{{ Auth::user()->username }}",
			game_id = {{ $game_id }},
			player_number = {{ Session::get('player_number') }};
	</script>
	<?php echo HTML::script('js/jquery-1.9.1.js'); ?>
	<?php echo HTML::script('js/jquery-ui-1.10.1.custom.js'); ?>
	<?php echo HTML::script('js/kinetic-v4.5.2.min.js'); ?>
	<?php echo HTML::script('js/generals.js'); ?>
	<?php echo HTML::script('js/onload.js'); ?>
	
</body>
</html>
