
jQuery("#login_button").click(function(){

	checkValidityLogin();
	
	if(! $("span").hasClass( "text_error" )){
		var user_login =jQuery("#login_user").val();
		var pass_login = jQuery("#login_pass").val();
		
		doLogin(user_login, pass_login).then(function(results){
			if(results.status==='OK'){
				$.cookie('uid', user_login, {path:'/'});
				if(results.results === 'login_map'){
					window.location="../geocatweb/mapa.html";
				}else{
					window.location="../geocatweb/galeria.html?private=1";
				}
				
			}else{
				jQuery('#div_msg').html('<div class="alert alert-warning my-alert" lang="ca"> Nom <a href="#login_user" class="alert-link">d\'usuari</a> o <a href="#login_pass" class="alert-link">contrasenya</a> incorrectes.</div>');
			}			
		},function(results){
			jQuery('#div_msg').html('<div class="alert alert-danger my-alert" lang="ca">No s\'ha iniciat la sessi&oacute;. <strong>Torni a intentar.</strong></div>');
		});
		
//		jQuery.ajax({
//					url: 'http://172.70.1.12/geocat/login.action?',
//					data: {user:user_login, password:pass_login},
//					async: false,
//					method: 'post',
//					dataType: 'jsonp'
//				}).done(function(results,textStatus, jqXHR){   
//					if(results.status==='OK'){
//							$.cookie('uid', user_login, {path:'/'});
//							window.open('../geocatweb/benvinguda.html', '_self');
//					}else{
//						jQuery('#div_msg').html('<div class="alert alert-error my-alert" lang="ca"> <strong>Ups!! No s\'ha iniciat la sessi&oacute;. </strong></div>');
//					}
//				}).fail(function(results){
//					jQuery('#div_msg').html('<div class="alert alert-error my-alert" lang="ca"> <strong>Ups!! No s\'ha iniciat la sessi&oacute;. </strong></div>');
//				});	
	}
});


function checkValidityLogin(){
	
	$('#login_user').removeClass("invalid");
	$('#login_pass').removeClass("invalid");
	$( ".text_error" ).remove();
	
	if(isBlank($('#login_user').val())){
		$('#login_user').addClass("invalid");
		$('#login_user').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}
	
	if(isBlank($('#login_pass').val())){
		$('#login_pass').addClass("invalid");
		$('#login_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#login_pass').val().length < 5){
		$('#login_pass').addClass("invalid");
		$('#login_pass').after("<span class=\"text_error\" lang=\"ca\">La contrasenya ha de tenir com a m&iacute;nim 5 car&aacute;cters.</span>");
	}
}
  
$('#signin_twitter').click(function() {
	window.location = "http://172.70.1.12/geocat/social/auth.action?id=twitter";
	});

$('#signin_facebook').click(function() {
	window.location = "http://172.70.1.12/geocat/social/auth.action?id=facebook";
	});

$('#signin_linkedin').click(function() {
	window.location = "http://172.70.1.12/geocat/social/auth.action?id=linkedin";
	});