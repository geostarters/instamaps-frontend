
jQuery(document).ready(function() {
	jQuery(document).keypress(function(e) {
	    if(e.which == 13) {
	    	jQuery("#login_button").click();
	    }
	});
});

jQuery("#login_button").click(function(){

	checkValidityLogin();
	
	if(! $("span").hasClass( "text_error" )){
		$("#modal-message").remove();
		var user_login =jQuery("#login_user").val();
		var pass_login = jQuery("#login_pass").val();
		var dataUrl = {user:user_login, password:pass_login};
		if (isRandomUser($.cookie('uid'))){
			dataUrl.randomuid = $.cookie('uid');
		}
		
		doLogin(dataUrl).then(function(results){
			if(results.status==='OK'){
				$.cookie('uid', user_login, {path:'/'});
				if(results.results === 'login_map'){
					window.location=paramUrl.mapaPage;
				}else{
					window.location=paramUrl.galeriaPage+"?private=1";
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
		$('#login_pass').after("<span class=\"text_error\" lang=\"ca\">La contrassenya ha de tenir com a mínim 5 caràcters.</span>");
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

$('#signin_google').click(function() {
	window.location = paramUrl.socialAuth+"id=googleplus";
});

$('#signin_icc').click(function() {
	window.location = "http://aurigadev/descarregues_instamapes/main.php?t=mtc1000v10sd0fst1r030.zip&f=&l=cat";
});
