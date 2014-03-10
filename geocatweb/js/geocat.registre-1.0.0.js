var signin_social;
	
	jQuery(document).ready(function() {
		
		$('.waiting_animation').hide();
		
		var params = url('?');
		if(params!=null && params !=''){
			signin_social = true;
//			alert("Hi ha parametres:"+signin_social);
			if(url('?FirstName')!='null') $('#signin_name').val(url('?FirstName'));
			if(url('?LastName')!='null') $('#signin_surname').val(url('?LastName'));
			if(url('?DisplayName')!='null') $('#signin_username').val(url('?DisplayName'));
			if(url('?Email')!='null') $('#signin_email').val(url('?Email'));
			$('#signin_pass').hide();
			$('#signin_confirm_pass').hide();
			checkValiditySignIn();
		}else {
			signin_social = false;
//			alert("No hi ha parametres:"+signin_social);
		}
	});
	
	jQuery("#signin_button").click(function(event){ 
		event.preventDefault();
		var name = jQuery("#signin_name").val();
		var surname = jQuery("#signin_surname").val();
		var id = jQuery("#signin_username").val();
		var correu_usuari=jQuery("#signin_email").val();
		var pass = jQuery("#signin_pass").val();
		var confirm_pass = jQuery("#signin_confirm_pass").val();
				
		checkValiditySignIn().then(function(){
			if(! $("span").hasClass( "text_error" )){
				$('.waiting_animation').show();
				$("#modal-message").remove();
				var reg_url;
				var dataUrl;
				if(signin_social){
					var providerId =url('?ProviderId');
					var valId = url('?ValidatedId');				
					reg_url = paramUrl.signinSocial; 
					dataUrl = {cn:name, sn:surname, uid:id, email: correu_usuari, tipusEntitatId:"1",  ambitGeo:"1", bbox:"260383,4491989,527495,4748184", provider:providerId, socialName:id ,validatedId: valId};
				}else{
					reg_url = paramUrl.signinUser;
					dataUrl = {cn:name, sn:surname, uid:id, userPassword: pass, email: correu_usuari, tipusEntitatId:"1", ambitGeo:"1", bbox:"260383,4491989,527495,4748184"};
					if (isRandomUser($.cookie('uid'))){
						dataUrl.randomuid = $.cookie('uid');
					}
				}
				
				registerUser(reg_url, dataUrl).then(function(results){
					if(results.status==='OK'){
						$('#modal_registre_ok').modal('toggle');						
						jQuery('#button-alta-ok').click(function(){window.location="../geocatweb/sessio.html";});
						$('.waiting_animation').hide();
						
					}else{
						$('#modal_registre_ko').modal('toggle');						
						$('.waiting_animation').hide();
					}					
				}, function(results){
					$('#modal_registre_ko').modal('toggle');						
					$('.waiting_animation').hide();
				});
			}
		});
	});
	
	function checkValiditySignIn(){
		var defer = $.Deferred();
		var deferUser = $.Deferred();
		var deferEmail = $.Deferred();
		
		$('#signin_username').removeClass("invalid");
		$('#signin_name').removeClass("invalid");
		$('#signin_surname').removeClass("invalid");
		$('#signin_email').removeClass("invalid");
		$('#signin_pass').removeClass("invalid");
		$('#signin_confirm_pass').removeClass("invalid");
		$( ".text_error" ).remove();	
		
		if(isBlank($('#signin_username').val())){
			$('#signin_username').addClass("invalid");
			$('#signin_username').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
			deferUser.reject();
		}else{
			checkUsername($('#signin_username').val()).then(function(results){
				if(results.status!='OK'){
					$('#signin_username').addClass("invalid");
					$('#signin_username').after("<span class=\"text_error\" lang=\"ca\">Nom d\'usuari no disponible.</span>");
				}
				deferUser.resolve();
			}, function(results){
				$('#signin_username').addClass("invalid");
				$('#signin_username').after("<span class=\"text_error\" lang=\"ca\">Error de xarxa. Torni a intentar-ho</span>");
				deferUser.reject();
			});
		}
			
		if(isBlank($('#signin_name').val())){
			$('#signin_name').addClass("invalid");
			$('#signin_name').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
		}
		
		if(isBlank($('#signin_surname').val())){
			$('#signin_surname').addClass("invalid");
			$('#signin_surname').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
		}
		
		if(isBlank($('#signin_email').val())){
			$('#signin_email').addClass("invalid");
			$('#signin_email').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
			deferEmail.reject();
		}else if(!isValidEmailAddress($('#signin_email').val())){
			$('#signin_email').addClass("invalid");
			$('#signin_email').after("<span class=\"text_error\" lang=\"ca\">El correu no és correcte</span>");
			deferEmail.reject();
		}else{
			checkEmail($('#signin_email').val()).then(function(results){
				if(results.status!='OK'){
					$('#signin_email').addClass("invalid");
					$('#signin_email').after("<span class=\"text_error\" lang=\"ca\">Correu associat a un altre usuari.</span>");
				}
				deferEmail.resolve();
			}, function(results){
				$('#signin_email').addClass("invalid");
				$('#signin_email').after("<span class=\"text_error\" lang=\"ca\">Error de xarxa. Torni a intentar-ho</span>");
				deferEmail.reject();
			});
		}
				
		if(!signin_social){
			if(isBlank($('#signin_pass').val())){
				$('#signin_pass').addClass("invalid");
				$('#signin_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
			}else if($('#signin_pass').val().length < 5){
				$('#signin_pass').addClass("invalid");
				$('#signin_pass').after("<span class=\"text_error\" lang=\"ca\">La contrassenya ha de tenir un mínim de 5 caràcters.</span>");
			}else if(isBlank($('#signin_confirm_pass').val())){
				$('#signin_confirm_pass').addClass("invalid");
				$('#signin_confirm_pass').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
			}else if($('#signin_pass').val() != $('#signin_confirm_pass').val()){
				$('#signin_confirm_pass').addClass("invalid");
				$('#signin_confirm_pass').after("<span class=\"text_error\" lang=\"ca\">Les contrasenyes han de coincidir.</span>");
			}
		}
		
		$.when(deferEmail, deferUser).done(function(){
			defer.resolve();
		}).fail(function(){
			defer.reject();
		});
		
		return defer.promise();
	}
