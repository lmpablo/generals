<?php

class Create_Status {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('status', function($table){
			$table->increments('id');

			$table->string('name', 15);
		});

		DB::table('status')->insert(array(
			array('name' => 'waiting'),
			array('name' => 'ongoing'),
			array('name' => 'completed'),
			array('name' => 'declined'),
			array('name' => 'online'),
			array('name' => 'offline'),
		));
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('status');
	}

}