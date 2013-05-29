<?php

class Helper{

	// convert a DateTime object to the cardinal value in minutes
	public static function to_minutes($diff){
		return ($diff->y * 365 * 24 * 60) + 
               ($diff->m * 30 * 24 * 60) + 
               ($diff->d * 24 * 60) + 
               ($diff->h * 60) + 
               ($diff->i);
	}

	// takes the current user, and touches the last activity
	public static function renew_session(){
		date_default_timezone_set('America/New_York');
		$now = new DateTime();
		DB::table('users')
			->where_id(Auth::user()->id)
			->update(array('last_activity' => $now));
	}

	// create a list of numbers from 1 to $max
	// shuffle the list and return shuffled.
	public static function create_random_stack($max){
		$stack = array();
		
		// starting point is offset by 1, because there is no 
		// column 0 in the grid, just 1 to 9
		for($i = 1; $i < $max + 1; $i++){
			$stack[] = $i;
		}

		shuffle($stack);
		return $stack;
	}

	// takes a game id and a player id and identifies if player
	// is player1 or player2 for that specific game.
	// if player isn't in the game, returns null.
	public static function get_player_number($pid, $gid){
		$game = DB::table('games')
			->where_id($gid)
			->first();

		$p1 = $game->p1;
		$p2 = $game->p2;
		if($p1 == $pid){ return 1; }
		else if ($p2 == $pid){ return 2; }
		else{ return null; }
	}

	// given a grid with pieces, convert each piece to an '*'
	public static function anonymize($grid){
		$anonymous = array();

		for($i = 0; $i < 9; $i++){
			for($j = 0; $j < 8; $j++){
				if($grid[$i][$j] != "_"){
					$anonymous[$i][$j] = "*";
				}
				else{
					$anonymous[$i][$j] = "_";
				}
			}
		}
		return $anonymous;
	}

	public static function set_turn($gid, $turn){
		DB::table('games')
			->where_id($gid)
			->update(array('turn' => $turn));
	}
}