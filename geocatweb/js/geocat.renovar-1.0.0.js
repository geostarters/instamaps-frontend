
var trackEventFrom = '';

jQuery(document).ready(function() {
	jQuery(document).keypress(function(e) {
	    if(e.which == 13) {
	    	jQuery("#login_button").click();
	    }
	});
	
	if(!url('?token')){
		window.location=paramUrl.mainPage;
	}
	
});//Fi document ready

jQuery("#perfil_button_pass").click(function(){

	_gaq.push(['_trackEvent',trackEventFrom,'remember password', 'retention']);
	_kmq.push(['record', 'remember password', {'from':trackEventFrom, 'funnel':'retention'}]);
	
	checkValidityPassword();
	
	if(!$("span").hasClass("text_error")){
		var dataUrl = {
			email: $('#login_user').val(),
			token: url('?token'),
			userPassword: $('#perfil_pass').val()
		}
		
		renewPassword(dataUrl).then(function(results){
			if(results.status==='OK'){
				$('#modal_registre_ok').modal('toggle');
				$('perfil_button_pass').on('click',function(){
					window.location=paramUrl.loginPage;
				});
			}else{
				$('#modal_registre_ko').modal('toggle');
			}
		});
	}
});

function checkValidityPassword(){
	$('#login_user').removeClass("invalid");
	$('#perfil_pass').removeClass("invalid");
	$('#perfil_confirm_pass').removeClass("invalid");
	$( ".text_error" ).remove();
	
	if(isBlank($('#login_user').val())){
		$('#login_user').addClass("invalid");
		$('#login_user').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if(isBlank($('#perfil_pass').val())){
		$('#perfil_pass').addClass("invalid");
		$('#perfil_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#perfil_pass').val().length < 5){
		$('#perfil_pass').addClass("invalid");
		$('#perfil_pass').after("<span class=\"text_error\" lang=\"ca\">La contrassenya ha de tenir un mínim de 5 caràcters.</span>");
	}else if(isBlank($('#perfil_confirm_pass').val())){
		$('#perfil_confirm_pass').addClass("invalid");
		$('#perfil_confirm_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#perfil_pass').val() != $('#perfil_confirm_pass').val()){
		$('#perfil_confirm_pass').addClass("invalid");
		$('#perfil_confirm_pass').after("<span class=\"text_error\" lang=\"ca\">Les contrasenyes han de coincidir.</span>");
	}
}