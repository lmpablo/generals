<?php

class Lobby_Controller extends Base_Controller{
	/**
	 * Gets a JSON of all users with status 5 (online)
	 *
	 * @return JSON
	 * @param int
	 **/
	public function action_get_available_users($id){
		$users = DB::table('users')
			->where_status(5)
			->where('id', '!=', $id)
			->get(array('id', 'username'));

		return Response::json($users);
	}

	/**
	 * Gets a JSON of all games with status 2 (ongoing)
	 *
	 * @return JSON
	 * @author 
	 **/
	public function action_get_ongoing_games(){
		$games = DB::table('games')
			->where_status(2)
			->get(array('p1', 'p2'));

		foreach($games as $game){
			$game->p1 = DB::table('users')->where_id($game->p1)->first()->username;
			$game->p2 = DB::table('users')->where_id($game->p2)->first()->username;
		}
		return Response::json($games);
	}

	/**
	 * Gets a JSON of all games with status 1 (waiting)
	 *
	 * @return JSON
	 * @author 
	 **/
	public function action_get_invitation(){
		$games = DB::table('games')
			->where_status(1)
			->where_p2(Auth::user()->id)
			->get(array('id', 'p1'));

		$game = $games[0];
		$game->p1 = DB::table('users')->where_id($game->p1)->first()->username;
		
		return Response::json($game);
	}

	/**
	 * Creates a new invitation to challenge another player: Create a
	 * new game entry with status 1 (waiting). Current player is p1,
	 * invited player is p2.
	 *
	 * @return void
	 * @author 
	 **/
	public function action_create_invitation($id)
	{
		$gid = DB::table('games')->insert_get_id(array(
			'p1' => Auth::user()->id,
			'p2' => $id,
			'status' => 1,
			'turn' => 0,
			'chat' => '<b>Server:</b> Welcome to the Game of Generals.<br>',
		));

		// counts as an activity, renew session
		Helper::renew_session();

		return Response::json($gid);
	}

	/**
	 * undocumented function
	 *
	 * @return void
	 * @author 
	 **/
	public function action_respond_invitation($gid, $response)
	{
		$stat = ($response == "y") ? 2 : 4;
		DB::table('games')
			->where_id($gid)
			->update(array('status' => $stat));

		// counts as an activity, renew session
		Helper::renew_session();

		return Response::json($gid);
	}

	public function action_get_status($gid){
		$status = DB::table('games')
			->where_id($gid)
			->first();

		// dd($status);
		return Response::json($status);
	}

	/**
	 * Adds a message from the lobby chat into the conversation
	 *
	 * @return void
	 * @author 
	 **/
	public function action_post_message(){
		$package = Input::json();
		DB::table('chat')->insert(array(
			'uid' => $package->id,
			'msg' => $package->msg
		));

		// keep only 20 messages at most
		$count = DB::table('chat')->count();
		if($count > 40){
			$first = DB::table('chat')->first();
			$id = $first->id;
			DB::table('chat')->delete($id);
		}

		// counts as an activity, renew session
		Helper::renew_session();
	}

	/**
	 * Return a raw copy of the message list, but with names replaced
	 *
	 * @return void
	 * @author 
	 **/
	public function action_retrieve_message(){
		$convo = DB::table('chat')
			->get(array('uid as user', 'msg'));

		// match the chat.uid and user.username
		foreach($convo as $line){
			$line->user = DB::table('users')->where_id($line->user)->first()->username;
		}
		return Response::json($convo);

	}
}