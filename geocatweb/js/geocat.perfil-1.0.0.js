var old_email;
jQuery(document).ready(function() {
	var username = $.cookie('uid'); 
	if (username == undefined){
		window.location.href = "/geocatweb/sessio.html";
	}
	
	$("#text-uid").append(username);
	getUserData(username).then(function(results){
		if(results.status==='OK'){
			$("#perfil_name").val(results.results.cn);
			$("#perfil_surname").val(results.results.sn);
			$("#perfil_email").val(results.results.mail);
			old_email = results.results.mail;
		}else{
			alert("Error al recuperar les dades");
			//jQuery('#div_msg').html('<div class="alert alert-warning my-alert" lang="ca"> Nom <a href="#login_user" class="alert-link">d\'usuari</a> o <a href="#login_pass" class="alert-link">contrassenya</a> incorrectes.</div>');
		}			
	},function(results){
		alert("Error al recuperar les dades");
		//jQuery('#div_msg').html('<div class="alert alert-danger my-alert" lang="ca">No s\'ha iniciat la sessi&oacute;. <strong>Torni a intentar.</strong></div>');
	});	
	
	$('#frm_update_pssw').hide();
	
	$('#btn_update_pssw').on('click',function(){
		$('#frm_update_pssw').toggle();
	});
	
});

jQuery("#perfil_button_pass").click(function(){
	var old_pass = jQuery("#perfil_old_pass").val();
	var new_pass = jQuery("#perfil_pass").val();
	var new_confirm_pass =jQuery("#perfil_confirm_pass").val();	
	
	checkValidityPassword();
	
	if(!$("span").hasClass("text_error")){
		$("#modal-message").remove();
		updateUserPassword($.cookie('uid'), new_pass, old_pass).then(function(results){
			if(results.status==='OK'){
				$('#modal_pass_ok').modal('toggle');

			}else if(results.results === "NamingException"){
				$('#modal_pass_ko1').modal('toggle');
			}else{
				$('#modal_pass_ko2').modal('toggle');
			}
		},function(results){
			$('#modal_pass_ko3').modal('toggle');
		}
		);
	}
});

function checkValidityPassword(){
	$('#perfil_old_pass').removeClass("invalid");
	$('#perfil_pass').removeClass("invalid");
	$('#perfil_confirm_pass').removeClass("invalid");
	$( ".text_error" ).remove();	
	
	if(isBlank($('#perfil_old_pass').val())){
		$('#perfil_old_pass').addClass("invalid");
		$('#perfil_old_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#perfil_old_pass').val().length < 5){
		$('#perfil_old_pass').addClass("invalid");
		$('#perfil_old_pass').after("<span class=\"text_error\" lang=\"ca\">La contrassenya ha de tenir un mínim de 5 caràcters.</span>");
	}	
	
	if(isBlank($('#perfil_pass').val())){
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



jQuery("#perfil_button").click(function(){
	var name = jQuery("#perfil_name").val();
	var surname = jQuery("#perfil_surname").val();
	var correu_usuari=jQuery("#perfil_email").val();	
	
	checkValidityPerfil().then(function(){
		if(!$("span").hasClass("text_error")){
			$("#modal-message").remove();
			updateUserData($.cookie('uid'), name, surname, correu_usuari).then(function(results){
				if(results.status==='OK'){
					$('#modal_perfil_ok').modal('toggle');
					old_email = correu_usuari;

				}else{
					$('#modal_perfil_ko').modal('toggle');
				}
			},function(results){
				$('#modal_perfil_ko').modal('toggle');
			}
			);
		}
	});
	
	
});

function checkValidityPerfil(){
	
	var defer = $.Deferred();
	
	$('#perfil_name').removeClass("invalid");
	$('#perfil_surname').removeClass("invalid");
	$('#perfil_email').removeClass("invalid");
	$( ".text_error" ).remove();
	
	if(isBlank($('#perfil_name').val())){
		$('#perfil_name').addClass("invalid");
		$('#perfil_name').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}
	
	if(isBlank($('#perfil_surname').val())){
		$('#perfil_surname').addClass("invalid");
		$('#perfil_surname').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}
	
	if($('#perfil_email').val() === old_email){
		defer.resolve();		
	}else if(isBlank($('#perfil_email').val())){
		$('#perfil_email').addClass("invalid");
		$('#perfil_email').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
		defer.reject();
	}else if(!isValidEmailAddress($('#perfil_email').val())){
		$('#perfil_email').addClass("invalid");
		$('#perfil_email').after("<span class=\"text_error\" lang=\"ca\">El correu no és correcte</span>");
		defer.reject();
	}else{
		checkEmail($('#perfil_email').val()).then(function(results){
			if(results.status!='OK'){
				$('#perfil_email').addClass("invalid");
				$('#perfil_email').after("<span class=\"text_error\" lang=\"ca\">Correu associat a un altre usuari.</span>");
			}
			defer.resolve();
		}, function(results){
			$('#perfil_email').addClass("invalid");
			$('#perfil_email').after("<span class=\"text_error\" lang=\"ca\">Error de xarxa. Torni a intentar-ho</span>");
			defer.reject();
		});
	}	
	
	return defer.promise();
}
