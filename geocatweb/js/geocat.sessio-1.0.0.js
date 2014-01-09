
jQuery("#login_button").click(function(){

	checkValidityLogin();
	
	if(! $("span").hasClass( "text_error" )){
		$("#modal-message").remove();
		var user_login =jQuery("#login_user").val();
		var pass_login = jQuery("#login_pass").val();
		
		doLogin(user_login, pass_login).then(function(results){
			if(results.status==='OK'){
				$.cookie('uid', user_login, {path:'/'});
				if(results.results === 'login_map'){
					window.location="/geocatweb/mapa.html";
				}else{
					window.location="/geocatweb/galeria.html?private=1";
				}
			}else if(results.results === 'cannot_authenticate'){
				$('#modal_wrong_user').modal('toggle');						
			}else if(results.results === 'account_locked'){
				$('#modal_account_block').modal('toggle');						
			}else{
				$('#modal_login_ko').modal('toggle');				
			}				
		},function(results){
			$('#modal_login_ko').modal('toggle');					
		});

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
		$('#login_pass').after("<span class=\"text_error\" lang=\"ca\">La contrasenya ha de tenir com a mínim 5 caràcters.</span>");
	}
}
  
$('#signin_twitter').click(function() {
	window.location = paramUrl.socialAuth+"id=twitter";
	});

$('#signin_facebook').click(function() {
	window.location = paramUrl.socialAuth+"id=facebook";
	});

$('#signin_linkedin').click(function() {
	window.location = paramUrl.socialAuth+"id=linkedin";
	});