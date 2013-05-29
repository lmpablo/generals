<?php

class Create_Games {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('games', function($table){
			$table->increments('id');

			$table->integer('p1')->unsigned();
			$table->integer('p2')->unsigned();
			$table->integer('status')->unsigned();
			$table->integer('turn');
			$table->text('chat');
			$table->string('p1_grid', 1200)->nullable();
			$table->string('p2_grid', 1200)->nullable();

			$table->foreign('p1')->references('id')->on('users');
			$table->foreign('p2')->references('id')->on('users');
			$table->foreign('status')->references('id')->on('status');

		});
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('games');
	}

}