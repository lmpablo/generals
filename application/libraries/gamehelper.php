<?php

class GameHelper{
	
	/**
	 * Checks whether or not there is a collision (or overlap)
	 * between two game grids, i.e. two pieces from both players reside
	 * in the same coordinate. "Overloaded" to support 2 or 4 arguments.
	 *
	 * @param array $grid1, array $grid2
	 * @return [x, y] - if collision
	 *         false - if none
	 *
	 * @param array $grid1, array $grid2, int $x, int $y
	 * @return true - if collision at [x, y]
	 *         false - if none
	 *
	 * @return -1 if invalid amount of arguments
	 */
	public static function check_grid_collision(){
		if(func_num_args() < 2 || func_num_args() == 3 || func_num_args() > 4){
			return -1;
		}
		$arguments = func_get_args();
		$grid1 = $arguments[0];
		$grid2 = $arguments[1];
		$has_coords = false;

		if (func_num_args() == 4){
			$x = $arguments[2];
			$y = $arguments[3];
			$has_coords = true;
		}

		if($has_coords){
			if($grid1[$x][$y] == "_" || $grid2[$x][$y] == "_"){
				return false;
			}
			else{
				return true;
			}
		}
		else{
			$coords = array();
			for($i = 0; $i < 9; $i++){
				for($j = 0; $j < 8; $j++){
					if($grid1[$x][$y] != "_" && $grid2[$x][$y] != "_"){
						$coords[] = $x;
						$coords[] = $y;
						return $coords;
					}
				}
			}
			return false;
		}
	}

	// Test the matchup of the units
	// 1) Agents (2) beats everyone except for privates (3)
	// 2) Everyone (15~3) beats anyone lower, except for agents (2)
	// 3) Privates(3) can only beat agents and flags 
	// 4) Equal pieces are a draw
	// 4a) Unless they're flags -- challenger flag wins
	public static function do_capture($challenger, $opponent){
		if($challenger->val == $opponent->val){
			if($challenger->val != 1){
				return 0;
			}
			return 1;
		}
		else{
			if($challenger->val > $opponent->val && $opponent->val != 2){
				return 1;
			}
			else if($challenger->val == 2 && $opponent->val != 3){
				return 1;
			}
			else if($challenger->val == 3 && $opponent->val == 2){
				return 1;
			}
			else{
				return 2;
			}
		}
	}

	public static function test($blue){
		return $blue;
	}
}