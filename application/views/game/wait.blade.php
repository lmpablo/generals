<html>
<head>
	<title>Game of Generals: Game {{ $game_id }}</title>
	{{ HTML::style('css/reset.css')}}
	{{ HTML::style('css/generals/jquery-ui-1.10.3.custom.css')}}
	<style>
		body{
			background: url('/css/images/back.png');
		}
		.wrapper{
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			width: 400px;
			height: 200px;
			margin: auto;
		}
		#container{
			background: rgba(52, 73, 94, 0.5);
			width: 400px;
			height: 200px;
			display:table-cell;
			vertical-align: middle;
			text-align: center;
			font-family: Segoe UI, Arial, sans-serif;
			font-weight: bolder;
			font-size: 2em;
			color: white;
			border-radius: 20px;
			border: double 3px white;
		}
		#progressbar{
			margin: 15px;
			height: 20px;
		}
		#progressbar .ui-progressbar-value{
			background-color: #95a5a6;
		}
	</style>
</head>
<body>
	<div class = "wrapper">
		<div id = "container">
			Waiting for your opponent's response...
			<div id="progressbar"></div>
		</div>
	</div>
	<script>
		var BASE = "{{ URL::base() }}",
			ID = "{{ Auth::user()->id }}",
			USERNAME = "{{ Auth::user()->username }}"
			game_id = {{ $game_id }};
	</script>
	<?php echo HTML::script('js/min/jquery.js'); ?>
	<?php echo HTML::script('js/jquery-ui-1.10.1.custom.js'); ?>
	<?php echo HTML::script('js/wait.js'); ?>
	
</body>
</html>
