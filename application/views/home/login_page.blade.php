<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>Game Of Generals: Online</title>
	<meta name="viewport" content="width=device-width">
	<link href='http://fonts.googleapis.com/css?family=Droid+Sans|Roboto' rel='stylesheet' type='text/css'>
	{{ HTML::style('css/login.css') }}
</head>
<body>
	<div class="wrapper">
		<header>
			<h1>GAME<b>OF</b>GENERALS</h1>
		</header>
		<div class="main">
			<div id = "options" class = "container">
					<h2>Wanna play?</h2>
					<div id = "login" class = "button red">Log In</div><br>
					<h2>No Account?</h2>
					<div id = "signup" class = "button blue">Sign Up</div>
			</div>
		</div>
		<div id = "forms" class = "container">
			<div class = "close">(GO BACK)</div>
			<div id ="login_form">
				{{ Form::open('login') }}

				<!-- check for login errors-->
				@if (Session::has('login_errors'))
					<span class = "error">Username or password incorrect. Please try again.</span>
				@endif

				<p>{{ Form::label('username', 'Username') }}</p>
				<p>{{ Form::text('username') }} </p>

				<p>{{ Form::label('password', 'Password') }}</p>
				<p>{{ Form::password('password') }} </p>

				<!-- submit button-->
				<p>{{ Form::submit('Log In', array("class" => "submit")) }}</p>

				{{ Form::close() }}
			</div>
			<div id = "signup_form">
				{{ Form::open('login/signup') }}

				<p>{{ Form::label('username', 'Username') }}</p>
				<p>{{ Form::text('username') }} </p>

				<p>{{ Form::label('password', 'Password') }}</p>
				<p>{{ Form::password('password') }} </p>

				<p>{{ Form::label('email', 'Email Address') }}</p>
				<p>{{ Form::text('email') }} </p>

				<!-- submit button-->
				<p>{{ Form::submit('Sign Up', array("class" => "submit")) }}</p>

				{{ Form::close() }}
			</div>
		</div>
	</div>
	<script>
		var BASE = "{{ URL::base() }}";
	</script>
	<?php echo HTML::script('js/jquery-1.9.1.js'); ?>
	<?php echo HTML::script('js/jquery-ui-1.10.1.custom.js'); ?>
    <?php echo HTML::script('js/login.js'); ?>
</body>
</html>
