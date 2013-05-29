<?php

class Create_Chat {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('chat', function($table){
			$table->increments('id');

			$table->integer('uid')->unsigned();
			$table->text('msg');

			$table->foreign('uid')->references('id')->on('users');
		});
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('chat');
	}

}