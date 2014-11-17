var trackEventFrom = '';

jQuery(document).ready(function() {
	jQuery(document).keypress(function(e) {
	    if(e.which == 13) {
	    	jQuery("#login_button").click();
	    }
	});
	
});//Fi document ready

jQuery("#login_button").click(function(){

	_gaq.push(['_trackEvent',trackEventFrom,'remember password', 'retention']);
//	_kmq.push(['record', 'remember password', {'from':trackEventFrom, 'funnel':'retention'}]);
	
	if(isBlank($('#login_user').val())){
		$('#login_user').addClass("invalid");
		$('#login_user').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else{
		$('#login_user').removeClass("invalid");
		$( ".text_error" ).remove();
		
		var dataUrl = {
			email: $('#login_user').val(),
			lang: window.lang.currentLang
		}
		
		reminderMail(dataUrl).always(function(results){
			$('#modal_send_mail').modal('toggle');
		});
		
	}
});