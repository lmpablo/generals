<?php

class Login_Controller extends Base_Controller{
	public $restful = true;
	
	public function get_index(){
		if (Auth::check()){
			// return "you're logged in";
			return Redirect::to('main');
		}
		else{
			return View::make('home.login_page');
		}
	}

	public function post_index(){
		// get POST data
		$userdata = array(
			'username' => Input::get('username'),
			'password' => Input::get('password')
		);

		if (Auth::attempt($userdata))
		{
			DB::table('users')
				->where('id', '=', Auth::user()->id)
				->update(array('status' => 5)); 
			return Redirect::to('main');
		}
		else
		{
			// authentication failure
			return Redirect::to('login')
				->with('login_errors', true);
		}
	}

	public function get_signup(){
		return View::make('home.login_page');
	}
	public function post_signup(){
		$rules = array(
			'username' => 'required|max:50|alpha_num',
			'email' => 'required|max:128',
			'password' =>'required'
		);

		$input = Input::all();
		$validation = Validator::make($input, $rules);

		if($validation->fails()){
			return Redirect::to('home.login_page');
		}
		else{
			$password = Input::get('password');
			$id = DB::table('users')->insert_get_id(
				array(
					'username' => Input::get('username'),
					'email' => Input::get('email'),
					'password' => Hash::make($password),
					'status' => 5,
			));

			Auth::login($id);
			return Redirect::to('main')->with('welcome', 'Hi!');
		}
	}
}