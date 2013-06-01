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
	 * Retrieves the player grid from db.
	 */
	public function action_get_player_grid(){
		$id = Input::json();
		$player_number = Helper::get_player_number(Auth::user()->id, $id);

		if($player_number == 1){
			$grid = DB::table('games')->where_id($id)->first()->p1_grid;
		}
		else{
			$grid = DB::table('games')->where_id($id)->first()->p2_grid;
		}
		
		// since no manipulation is being done on the grid, just straight retrieval,
		// don't bother encoding or decoding it -- already in json
		return Response::json($grid);
	}

	/**
	 * After every move, this function is called to check the effects
	 * of the most recent move. It will return one of the return codes below
	 * and the client should act accordingly.
	 *
	 * VALID RETURN CODES:
	 * 0 - no collision, no winning conditions met
	 * 1 - collision: player won, no winning conditions met
	 * 2 - collision: opponent won, no winning conditions met
	 * 3 - no collision, winning condition met (player reached the other side)
	 * 4 - collision: player won, winning conditions met (player won, captured flag)
	 * 5 - collision: opponent won, winning conditions met (player lost, flag captured);
	 * 6 - collision: draw, no winning conditions (equal valued units)
	 */
	public function action_update_move(){
		$package = Input::json();
		$id = $package->id;
		$x0 = $package->x0;
		$y0 = $package->y0;
		$x1 = $package->x1;
		$y1 = $package->y1;
		$piece = $package->piece;

		$winner = 0;
		$condition = 0;
		$opp_modified = false;

		// $id = 17;
		$player_number = Helper::get_player_number(Auth::user()->id, $id);
		$row = DB::table('games')->where_id($id)->first();	

		// retrieve game grid for player from db, and grid of opponent
		if($player_number == 1){ 
			$grid = $row->p1_grid;
			$opp_grid = $row->p2_grid;
		}
		else{
			$grid = $row->p2_grid;
			$opp_grid = $row->p1_grid;
		}
		// json to array
		$grid = json_decode($grid);
		$opp_grid = json_decode($opp_grid);


		// update game grid based on the changes listed
		$grid[$x1][$y1] = $piece;
		$grid[$x0][$y0] = "_";

		$collision = GameHelper::check_grid_collision($grid, $opp_grid, $x1, $y1);

		$challenger = $grid[$x1][$y1];

		// for use with database update
		if($player_number == 1){ 
			$player_grid = "p1_grid";
			$other_grid = "p2_grid";
		}
		else{
			$player_grid = "p2_grid";
			$other_grid = "p1_grid";
		}

		if($collision){
			// find out who won the collision
			// 0 - draw; 1 - challenger; 2 - opponent
			$winner = GameHelper::do_capture($challenger, $opp_grid[$x1][$y1]);

			// check if winning condition met
			if($winner == 0){
				if($opp_grid[$x1][$y1]->val == 1 || $grid[$x1][$y1]->val == 1){
					$condition = 4; // code 4 -- captured enemy flag, win

					$opp_grid[$x1][$y1] = "_";
					$opp_grid = json_encode($opp_grid);
					$opp_modified = true;

					DB::table('games')->where_id($id)->update(array('winner' => $player_number));
				}
				else{
					$condition = 6; // code 6 -- draw, both captured
					$grid[$x1][$y1] = "_";
					
					$opp_grid[$x1][$y1] = "_";
					$opp_grid = json_encode($opp_grid);
					$opp_modified = true;
				}
			}
			else{
				if($opp_grid[$x1][$y1]->val == 1 || $grid[$x1][$y1]->val == 1){
					$condition = 3; // code 4 -- captured enemy flag

					$opp_grid[$x1][$y1] = "_";
					$opp_grid = json_encode($opp_grid);
					$opp_modified = true;

					DB::table('games')->where_id($id)->update(array('winner' => $player_number));
				}
				else{
					$condition = 0; // code 1 or 2 -- regular capture, no win

					// challenger won
					if($winner == 1){
						$opp_grid[$x1][$y1] = "_";
						$opp_grid = json_encode($opp_grid);
						$opp_modified = true;
					}
					// challenger lost
					else{
						$grid[$x1][$y1] = "_";
					}
				}
			}
		}
		else{
			// check if winning condition met without collision
			// if player1, flag must reach row 7, if player2, must reach row 0

			if($challenger->val == 1){

				if($player_number == 1){
					if($y1 == 7){
						$condition = 3; // code 3 -- flag reached opposite end (p1)

						DB::table('games')->where_id($id)->update(array('winner' => $player_number));
					}
					else{
						$condition = 0; // code 0 -- nothing happened
					}
				}
				else{
					if($y1 == 0){
						$condition = 3; // code 3 -- flag reached opposite end (p2)
						DB::table('games')->where_id($id)->update(array('winner' => $player_number));
					}
					else{
						$condition = 0; // code 0 -- nothing happened
					}
				}
			} 
			else{
				$condition = 0; // code 0 -- nothing happened
			}
		}
		$grid = json_encode($grid);

		DB::table('games')->where_id($id)->update(array($player_grid => $grid));
		if($opp_modified){
			DB::table('games')->where_id($id)->update(array($other_grid => $opp_grid));
		}

		// see return codes
		return Response::json($winner + $condition);
	}

	// Toggles the turn; switches from p1 <-> p2
	public function action_toggle_turn(){
		$package = Input::json();
		$id = $package->id;

		$player_number = Helper::get_player_number(Auth::user()->id, $id);

		if($player_number == 1){
			$turn = 2;
		}
		else{
			$turn = 1;
		}
		DB::table('games')->where_id($id)->update(array('turn' => $turn));
	}

	/**
	 * Queries the db for winner in the current game.
	 */
	public function action_get_winner($id){
		$winner = DB::table('games')->where_id($id)->first()->winner;

		return Response::json($winner);
	}

	// Listen if it is clients turn
	public function action_listen_turn($id){
		$player_number = Helper::get_player_number(Auth::user()->id, $id);
		$game = DB::table('games')->where_id($id)->first();

		if($game->turn == $player_number){
			return Response::json("true");
		}
		else{
			return Response::json("false");
		}

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
}