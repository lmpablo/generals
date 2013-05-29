<?php

class Create_Users {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('users', function($table){
			$table->increments('id');

			$table->string('username', 50)->unique();
			$table->string('email', 128)->unique();
			$table->string('password', 64);
			$table->integer('status')->unsigned();
			$table->timestamp('last_activity');

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
		Schema::drop('users');
	}

}