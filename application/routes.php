<?php

Route::get('/', function()
{
	return Redirect::to('login');
});

Route::get('logout', function(){
	DB::table('users')
		->where('id', '=', Auth::user()->id)
		->update(array('status' => 6)); 
	Auth::logout();
	return Redirect::to('login');
});

Route::get('layout1', function(){
	return View::make('home.l1-index');
});

// ------------------------------------------------------------------------
Event::listen('404', function()
{
	return Response::error('404');
});

Event::listen('500', function($exception)
{
	return Response::error('500');
});

// ------------------------------------------------------------------------

Route::filter('api-auth', function(){
	if (!Auth::check()){
		return null;
	}
});

/**
 * Always check if the user has been inactive
 * then logout.
 * timeout = 60
 **/
Route::filter('timeout', function()
{
	if(Auth::check()){
		$timeout = 90;

		date_default_timezone_set('America/New_York');
		$now = new DateTime();
		$last_activity = DB::table('users')
			->where_id(Auth::user()->id)
			->first('last_activity');

		$last_activity = new DateTime($last_activity->last_activity);
		$time_diff = Helper::to_minutes($last_activity->diff($now));
		
		if ($time_diff > $timeout){
			DB::table('users')
				->where('id', '=', Auth::user()->id)
				->update(array('status' => 6)); 
			Auth::logout();
			return Redirect::to('login')->with('timeout', true);
		}
		else{
			Helper::renew_session();
		}
	}
});

Route::filter('before', function()
{

});

Route::filter('after', function($response)
{
	// Do stuff after every request to your application...
});

Route::filter('csrf', function()
{
	if (Request::forged()) return Response::error('500');
});

Route::filter('auth', function()
{
	if (Auth::guest()) return Redirect::to('login');
});

// ------------------------------------------------------------------------

// API Group
Route::group(array('before' => 'api-auth'), function()
{
	Route::controller('lobby');
});

Route::group(array('before' => 'timeout'), function()
{
	Route::controller(array(
		'main',
		'login',
		'game'
	));
});

// Route::controller(Controller::detect());