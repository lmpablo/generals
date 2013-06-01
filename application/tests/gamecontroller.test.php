<?php

class TestGameController extends PHPUnit_Framework_TestCase {

	// /**
	//  * Test that a given condition is met.
	//  *
	//  * @return void
	//  */
	// public function testSomethingIsTrue()
	// {
	// 	$this->assertTrue(false);	
	// }
	public function testGetTurn(){
		$response = $this->call('GET', 'game/test_grid');

		$this->assertEquals(24, $response);
	}

}