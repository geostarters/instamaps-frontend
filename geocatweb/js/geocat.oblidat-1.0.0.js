var trackEventFrom = '';

jQuery(document).ready(function() {
	jQuery(document).keypress(function(e) {
	    if(e.which == 13) {
	    	jQuery("#login_button").click();
	    }
	});
	
	$.publish('loadConfig', null);
	
});//Fi document ready

jQuery("#login_button").click(function(){

	_gaq.push(['_trackEvent',trackEventFrom,'remember password', 'retention']);
	
	if(!$('#login_user').val()){
		$('#login_user').addClass("invalid");
		$( ".text_error" ).removeClass('hide').show();
	}else{
		$('#login_user').removeClass("invalid");
		$( ".text_error" ).hide();
		
		var dataUrl = {
			email: $('#login_user').val(),
			lang: window.lang.currentLang
		}
		
		reminderMail(dataUrl).always(function(results){
			if (results.status=="OK") {
				if (results.results =="reminderMail") {
					$('#modal_send_mail').modal('toggle');
				}
				else {
					var providers = results.results;
					var html = providers;					
					$('#profiler').html(html);
					$('#modal_provider_noticgc').modal('toggle');
				}
			}
			else if (results.status=="ERROR") {
				if (results.results=="EntitatNotFoundException"){
					$('#modal_user_not_exists').modal('toggle');
				}
				else if (results.results=="EntitatNotActiveException"){
					$('#modal_user_not_active').modal('toggle');
				}
				else if (results.results=="unregistered_user"){
					$('#modal_user_not_active').modal('toggle');
				}
			}
		});
	}
});