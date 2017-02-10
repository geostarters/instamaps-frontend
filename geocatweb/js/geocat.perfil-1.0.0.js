var old_email;
var perfil;
jQuery(document).ready(function() {
	
	var uid = Cookies.get('uid'); 
	if (uid == undefined){
		window.location.href = paramUrl.loginPage;
	}
	
	subscribeEvents();
		
	$("#text-uid").append(uid);
	
	$('#frm_update_pssw').hide();
	
	$('#btn_update_pssw').on('click',function(){
		//Guardar token BBDD
		var data={
			email:$('#perfil_email').val()
		};
		generateTokenRemember(data).then(function(results){
			if (results.status==='OK'){
				window.location=renovarPassword+results.results.informacioAdicional+"&email="+results.results.email;
			}
		});
		//Redireccionar a la pàgina de modificar contrassenya
		//$('#frm_update_pssw').toggle();
	});
	
	$('#btn_delete_usr').on('click',function(){
		$('#modal_delete_usr').modal('show');
		$('#button-delete-ok').on('click',function(){
			$('#modal_delete_usr').modal('hide');
			$('#modal_delete_usr_conf').modal('show');
			$('#button-delete-ok-conf').on('click',function(){
				var data = {
					uid: Cookies.get('uid')
				};
				deleteUser(data).then(function(results){
					if (results.status==='OK'){
						logoutUser();
					}else{
						$('#modal_delete_usr_ko').modal('show');
					}
				});
			});
		});
	});
	
	perfil = Perfil({uid: uid});
	
});

jQuery("#perfil_button_pass").click(function(){
	var old_pass = jQuery("#perfil_old_pass").val();
	var new_pass = jQuery("#perfil_pass").val();
	var new_confirm_pass =jQuery("#perfil_confirm_pass").val();	
	
	checkValidityPassword();
	
	if(!$("span").hasClass("text_error")){
		$("#modal-message").remove();
		
		var data = {
			uid: Cookies.get('uid'), 
            userPassword: old_pass, 
            newPassword: new_pass
        };
		updatePasswordIcgc(data).then(function(results){
			if(results.status==='OK'){
				$('#modal_pass_ok').modal('toggle');
				$('#frm_update_pssw').toggle();
			}else if(results.results === "cannot_authenticate"){
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

function subscribeEvents(){
	$.subscribe('initPerfil', function(e, data){
		data.getPerfil();
	});
	
	$.subscribe('loadPerfil', function(e, data){
		$("#perfil_nomEntitatComplert").val(data.results.nomEntitatComplert);
		$("#perfil_email").val(data.results.email);
		old_email = data.results.mail;
	});
	
	$.subscribe('loadPerfilErr', function(e, data){
		alert(window.lang.translate(data));		
	});
}

function checkValidityPassword(){
	$('#perfil_old_pass').removeClass("invalid");
	$('#perfil_pass').removeClass("invalid");
	$('#perfil_confirm_pass').removeClass("invalid");
	$( ".text_error" ).remove();	
	
	if(isBlank($('#perfil_old_pass').val())){
		$('#perfil_old_pass').addClass("invalid");
		$('#perfil_old_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#perfil_old_pass').val().length < 4){
		$('#perfil_old_pass').addClass("invalid");
		$('#perfil_old_pass').after("<span class=\"text_error\" lang=\"ca\">La contrasenya ha de tenir un mínim de 4 caràcters.</span>");
	}	
	
	if(isBlank($('#perfil_pass').val())){
		$('#perfil_pass').addClass("invalid");
		$('#perfil_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#perfil_pass').val().length < 4){
		$('#perfil_pass').addClass("invalid");
		$('#perfil_pass').after("<span class=\"text_error\" lang=\"ca\">La contrasenya ha de tenir un mínim de 4 caràcters.</span>");
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
			updateUserData(Cookies.get('uid'), name, surname, correu_usuari).then(function(results){
				if(results.status==='OK'){
					$('#modal_perfil_ok').modal('toggle');
					Cookies.set('uid', results.results.uid);
					$('#modal_perfil_ok').on('hidden.bs.modal', function (e) {
						window.location.href = paramUrl.perfilPage;
					});
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

function updateUserData(username, name, surname, correu_usuari){
	return jQuery.ajax({
		url: paramUrl.updateUser,
		data: {
            cn: name,
            sn: surname,
            uid: username,
            email: correu_usuari
        },
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

