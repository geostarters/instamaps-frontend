var trackEventFrom = '';

$(document).ready(function() {
	$(document).keypress(function(e) {
	    if(e.which == 13) {
	    	$("#login_button").click();
	    }
	});
	
	if(!url('?token')){
		window.location=paramUrl.mainPage;
	}
	
	if (url('?email')){
		console.debug(url('?email'));
		$('#login_user').val(url('?email'));
	}
	
	
});//Fi document ready

$("#perfil_button_pass").click(function(){

	$.publish('analyticsEvent',{event:[trackEventFrom,'remember password', 'retention']});
	
	checkValidityPassword();
	
	if(!$("span").hasClass("text_error")){
		var dataUrl = {
			email: $('#login_user').val(),
			token: url('?token'),
			newPassword: $('#perfil_pass').val()
		}
		
		renewPassword(dataUrl).then(function(results){
			if(results.status==='OK'){
				$('#modal_registre_ok').modal('toggle');
				$('#button-alta-ok').on('click',function(){
					window.location=paramUrl.loginPage;
				});
			}else{
				if (results.results=="unregistered_user") $('#modal_registre_ko_unregistered_user').modal('toggle');
				else $('#modal_registre_ko').modal('toggle');
			}
		});
	}
});

function checkValidityPassword(){
	$('#login_user').removeClass("invalid");
	$('#perfil_pass').removeClass("invalid");
	$('#perfil_confirm_pass').removeClass("invalid");
	$( ".text_error" ).remove();
	
	if(!($('#login_user').val())){
		$('#login_user').addClass("invalid");
		$('#login_user').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if(!($('#perfil_pass').val())){
		$('#perfil_pass').addClass("invalid");
		$('#perfil_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#perfil_pass').val().length < 4){
		$('#perfil_pass').addClass("invalid");
		$('#perfil_pass').after("<span class=\"text_error\" lang=\"ca\">La contrasenya ha de tenir un mínim de 4 caràcters.</span>");
	}else if(!($('#perfil_confirm_pass').val())){
		$('#perfil_confirm_pass').addClass("invalid");
		$('#perfil_confirm_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#perfil_pass').val() != $('#perfil_confirm_pass').val()){
		$('#perfil_confirm_pass').addClass("invalid");
		$('#perfil_confirm_pass').after("<span class=\"text_error\" lang=\"ca\">Les contrasenyes han de coincidir.</span>");
	}
}