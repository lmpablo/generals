jQuery(document).ready(function($) {
	function checkResponse(){
		$.get(BASE + '/lobby/get_status/' + game_id, function(data){
			console.log(data);
			if(data.status === 2){
				window.location.href = BASE + "/game/play/" + game_id;
			}
			else if (data.status === 4) {
				window.location.href = BASE;
			}
		});
	}

	$( "#progressbar" ).progressbar({
      value: false
    });

	(function poll(){
		setTimeout(function(){
			checkResponse();
			poll();
		}, 2000);
	})();
});