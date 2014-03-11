
jQuery(document).ready(function() {
	jQuery(document).keypress(function(e) {
	    if(e.which == 13) {
	    	jQuery("#login_button").click();
	    }
	});
	
});//Fi document ready

jQuery("#login_button").click(function(){

	checkValidityLogin("");
	
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

function loginUserIcgc(){

	checkValidityLogin("_icgc");
	
	if(! $("span").hasClass( "text_error" )){
		$("#modal-message").remove();
		var user_login_icgc =jQuery("#login_user_icgc").val();
		var pass_login_icgc = jQuery("#login_pass_icgc").val();
		var dataUrl = {user:user_login_icgc, password:pass_login_icgc};
//		if (isRandomUser($.cookie('uid'))){
//			dataUrl.randomuid = $.cookie('uid');
//		}
		
		doLoginIcgc(dataUrl).then(function(results){
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
}

function checkValidityLogin(tipus){
	
	$('#login_user'+tipus).removeClass("invalid");
	$('#login_pass'+tipus).removeClass("invalid");
	$( ".text_error" ).remove();
	
	if(isBlank($('#login_user'+tipus).val())){
		$('#login_user'+tipus).addClass("invalid");
		$('#login_user'+tipus).after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}
	var pass_length = 0;
	if(tipus == "") pass_length = 5;
	
	if(isBlank($('#login_pass'+tipus).val())){
		$('#login_pass'+tipus).addClass("invalid");
		$('#login_pass'+tipus).after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#login_pass'+tipus).val().length < 5){
		$('#login_pass'+tipus).addClass("invalid");
		$('#login_pass'+tipus).after("<span class=\"text_error\" lang=\"ca\">La contrassenya ha de tenir com a mínim 5 caràcters.</span>");
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
//	window.location = "http://aurigadev/descarregues_instamapes/main.php?t=mtc1000v10sd0fst1r030.zip&f=&l=cat";
	$('#dialog_session_icgc').modal('show');
});
