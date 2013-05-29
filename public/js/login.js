jQuery(document).ready(function($) {
	$("#forms").hide();
	$("#login_form").hide();
	$("#signup_form").hide();

	$("#login").on('click', function(){
		$("#options").hide();
		$("#forms").fadeIn();
		$("#login_form").fadeIn();
	});

	$("#signup").on('click', function(){
		$("#options").hide();
		$("#forms").fadeIn();
		$("#signup_form").fadeIn();
	});
	$(".close").on('click', function(){
		$("#forms").hide();
		$("#options").fadeIn();
		$("#login_form").hide();
		$("#signup_form").hide();
	});
});