<?php

/**
 * Contains all game logic, i.e. all things happening during the game only.
 *
 */
class Game_Controller extends Base_Controller{
	
	// shouldn't be allowed to access the index of the controller
	public function action_index(){
		return Response::error('500');
	}

	// loads the waiting screen
	public function action_wait($id){
		return View::make('game.wait')
			->with(array('game_id' => $id));
	}

	/**
	 * Serves the main game board.
	 * First it assigns a player number for the user, then serves the page.
	 *
	 */
	public function action_play($id){
		$player_number = Helper::get_player_number(Auth::user()->id, $id);

		// stores the player number in the Session
		// TODO: find a different way to implement this for the case
		//       that the user somehow overwrites the value even before
		//       the view loads
		Session::put('player_number', $player_number);
		return View::make('game.index')
			->with(array('game_id' => $id));
	}

	/**
	 * Receives a copy of each user's grid, then stores them.
	 *
	 */
	public function action_add_grid(){
		// counts as an activity, renew session
		Helper::renew_session();	

		$package = Input::json();
		$player_number = Helper::get_player_number(Auth::user()->id, $package->id);
		$grid = json_encode($package->grid);
		$id = $package->id;
		$complete = false;

		$row = DB::table('games')->where_id($id)->first();
		
		// check tuple: if both already filled, return true
		// if only one (incoming grid) is filled, return false
		if($player_number == 1){
			DB::table('games')
				->where_id($id)
				->update(array('p1_grid' => $grid));

			if($row->p2_grid == null){ 
				return Response::json(false);
			}
			else{
				// begin the game, set turn to player 1
				Helper::set_turn($id, 1);
				return Response::json(true);
			}
		}
		else{
			DB::table('games')
				->where_id($id)
				->update(array('p2_grid' => $grid));

			if($row->p1_grid == null){
				return Response::json(false);
			}
			else{
				// begin the game, set turn to player 1
				Helper::set_turn($id, 1);
				return Response::json(true);
			}
		}		
	}

	/**
	 * When requested, it returns a version of the opponent's game grid
	 * where each piece is replaced with an asterisk (*) for anonymity.
	 */
	public function action_get_enemy_grid(){
		$id = Input::json();

		$player_number = Helper::get_player_number(Auth::user()->id, $id);

		if($player_number == 1){
			$grid = DB::table('games')->where_id($id)->first()->p2_grid;
			$grid = json_decode($grid);
		}
		else{
			$grid = DB::table('games')->where_id($id)->first()->p1_grid;
			$grid = json_decode($grid);
		}

		$enemy_grid = Helper::anonymize($grid);
		$enemy_grid = json_encode($enemy_grid);
		return Response::json($enemy_grid);
	}

	/**
	 *
	 *
	 *
	 */
	public function action_update_move(){
		$package = Input::json();
		$id = $package->id;
		$x0 = $package->x0;
		$y0 = $package->y0;
		$x1 = $package->x1;
		$y1 = $package->y1;
		$piece = $package->piece;

		// $id = 17;
		$player_number = Helper::get_player_number(Auth::user()->id, $id);
		$row = DB::table('games')->where_id($id)->first();	

		// retrieve game grid for player from db, and grid of enemy
		if($player_number == 1){ 
			$grid = $row->p1_grid;
			$enemy_grid = $row->p2_grid;
		}
		else{
			$grid = $row->p2_grid;
			$enemy_grid = $row->p1_grid;
		}
		$grid = json_decode($grid);
		$enemy_grid = json_decode($enemy_grid);

		// update game grid based on the changes listed
		$grid[$x1][$y1] = $piece;
		$grid[$x0][$y0] = "_";

		// check for win condition (flag reaches other end)
		// check for captures by comparing new grid with opponent's current grid
	}

	// return an array of 27 possible positions, shuffled
	public function action_get_positions(){
		return Response::json(Helper::create_random_stack(27));
	}

	// return whose turn it is, given a gid
	public function action_get_turn($id){
		$game = DB::table('games')
			->where_id($id)
			->first();
		$turn = $game->turn;
		return Response::json($turn);
	}


	// DELETE!
	public function action_test_grid($id){
		$table = array();
		for($i = 0; $i < 9; $i++){
			for($j = 0; $j < 8; $j++){
				$table[$i][$j] = array('a' => $i . $j, 'b' => $j . $i);
			}
		}
		return json_encode($table);
		
	}
}