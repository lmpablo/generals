<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>Game Of The Generals: Online</title>
	<meta name="viewport" content="width=device-width">
	<link href='http://fonts.googleapis.com/css?family=Roboto+Slab:700|Roboto' rel='stylesheet' type='text/css'>
	{{ HTML::style('css/reset.css')}}
	{{ HTML::style('css/generals/jquery-ui-1.10.3.custom.css')}}
	{{ HTML::style('css/home.css') }}	
</head>
<body>
	<div class="wrapper">
		<header>
			<h1>GAME<b>OF</b>THE<b>GENERALS</b> [<i>{{ Auth::user()->username }}</i>]</h1>
		</header>
		<div class="main">
			<div class = "module-container">
				<div id = "c1" class = "column">
					<div id = "r1" class = "row">
						<div id = "online-players" class = "module">
							<div class = "module-heading">Online Players</div>
							<div id = "content-players" class = "module-content">There are currently no online users.</div>
						</div>
					</div>
					<div id = "r2" class = "row">
						<div id = "current-games" class = "module">
							<div class = "module-heading">Ongoing Games</div>
							<div id = "content-games" class = "module-content">Blah blah blah</div>
						</div>
					</div>					
				</div>
				<div id = "c2" class = "column">
					<div id = "chat-box" class = "module">
						<div id = "chat-title" class = "module-heading">Lobby Chat</div>
						<div id = "chat-window" class = "module-content">Retrieving messages...</div>
						<div class = "module-input">
							<div id = "c3" class = "column">
								<input id = "chat-input" placeholder = "Say something..." type = "text" />
							</div>
							<div id = "c4" class = "column">
								<div id = "chat-submit">SEND</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class = "float-bar">
				<div class = "column">
					<div id = "create-invite" class = "anchor">Challenge someone now!</div>
				</div>
				<div class = "column">
					<div id = "logout" class = "anchor">Log Out</div>
				</div>
			</div>
		</div>
	</div>
	<div id = "invite" title = "Challenge someone!" class = "dialog"></div>
 
	<script>
		var BASE = "{{ URL::base() }}",
			ID = "{{ Auth::user()->id }}",
			USERNAME = "{{ Auth::user()->username }}";
	</script>
	<?php echo HTML::script('js/jquery-1.9.1.js'); ?>
	<?php echo HTML::script('js/jquery-ui-1.10.1.custom.js'); ?>
	<?php echo HTML::script('js/lobby.js'); ?>
</body>
</html>