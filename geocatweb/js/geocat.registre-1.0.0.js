var signin_social;
var trackEventFrom = '';
var text_confirma_dades = 'Confirmeu les dades';	
jQuery(document).ready(function() {
	$('.waiting_animation').toggle();
	var params = url('?');
	if(params!=null && params !='' && url('?from')!='null' && url('?from')=="social" ){
		signin_social = true;
		//alert("Hi ha parametres:"+signin_social);
		if(url('?FirstName')!='null') $('#signin_name').val(url('?FirstName'));
		if(url('?LastName')!='null') $('#signin_surname').val(url('?LastName'));
		if(url('?DisplayName')!='null') $('#signin_username').val(url('?DisplayName'));
		if(url('?Email')!='null') $('#signin_email').val(url('?Email'));
		if(url('?randomId')!='null') $('#randomId').val(url('?randomId'));
		$('#signin_pass').hide();
		$('#signin_confirm_pass').hide();
		checkValiditySignIn();
	}else {
		signin_social = false;
		//alert("No hi ha parametres:"+signin_social);
	}
	
	if(url('?from')){
		trackEventFrom = url('?from');
	}		
	
	if (signin_social){
		$('.form-signin-heading').text(window.lang.translate(text_confirma_dades));
		$('#signin_button').text(window.lang.translate(text_confirma_dades));
	}

	$.publish('loadConfig', null);
});
	
$("#signin_button").click(function(event){ 
	event.preventDefault();
	$("#signin_username").val($("#signin_email").val());
	var name = $("#signin_name").val();
	var surname = $("#signin_surname").val();
	var id = $("#signin_username").val();
	var correu_usuari=$("#signin_email").val();
	var pass = $("#signin_pass").val();
	var confirm_pass = $("#signin_confirm_pass").val();
	var randomId = $("#randomId").val();
	checkValiditySignIn().then(function(){
		if(!$(".text_error").is(":visible")){
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
				var lang = web_determinaIdioma();
				reg_url = paramUrl.signinUserIcgc;
				dataUrl = {cn:name, sn:surname, uid:id, userPassword: pass, email: correu_usuari, tipusEntitatId:"1", ambitGeo:"1", bbox:"260383,4491989,527495,4748184", lang: lang};
			}
			if (isRandomUser(Cookies.get('uid'))){
				dataUrl.randomuid = Cookies.get('uid');
			}
			registerUser(reg_url, dataUrl).then(function(results){
				$("#signin_button").removeClass("disabled");
				if(results.status==='OK'){
					//Enviar mail confirmació de registre
					var contingut= createContingutEmail(id);//window.lang.translate("Registre completat correctament");
					var data = {
						uid: id,
						to:correu_usuari,
						subject:window.lang.translate('Instamaps.Registre'),
						content: contingut
					};
					sendMail(data).then(function(results){
						//console.debug(results);							
					});
					$.publish('analyticsEvent',{event:[ trackEventFrom, 'registre', 'activation']});
					
					Cookies.set('uid', id);
					$('#modal_registre_ok').modal('toggle');						
					$('#button-alta-ok').click(function(){
						redirectLogin(results);
						
					});
					$('.waiting_animation').hide();
					
				}else{
					
					$("#text_registre_ko").text(results.results);
					$('#modal_registre_ko').modal('toggle');
					$('.waiting_animation').hide();
				}					
			}, function(results){
				$("#text_registre_ko").text("El teu registre no s'ha processat correctament");
				$('#modal_registre_ko').modal('toggle');
				$('.waiting_animation').hide();
				$("#signin_button").removeClass("disabled");
			});
		}
		else
			$("#signin_button").removeClass("disabled");
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
	$('.text_error').hide();
	
	if(isBlank($('#signin_username').val())){
		//$('#signin_username').addClass("invalid");
		//$('#signin_username').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
		deferUser.reject();
	}else{
		checkUsername($('#signin_username').val()).then(function(results){
			if(results.status!='OK'){
				$('#signin_username').addClass("invalid");
				$('#signin_username').next(".text_error").removeClass('hide').show().html("Nom d'usuari no disponible.");
			}
			deferUser.resolve();
		}, function(results){
			$('#signin_username').addClass("invalid");
			$('#signin_username').next(".text_error").removeClass('hide').show().html("Error de xarxa. Torni a intentar-ho");
			deferUser.reject();
		});
	}
		
	if(isBlank($('#signin_name').val())){
		$('#signin_name').addClass("invalid");
		$('#signin_name').next(".text_error").removeClass('hide').show();
	}
	
	if(isBlank($('#signin_surname').val())){
		//$('#signin_surname').addClass("invalid");
		//$('#signin_surname').next(".text_error").removeClass('hide').show();
	}
	
	if(isBlank($('#signin_email').val())){
		$('#signin_email').addClass("invalid");
		$('#signin_email').next(".text_error").removeClass('hide').show().html("El camp no pot estar buit");
		deferEmail.reject();
	}else if(!isValidEmailAddress($('#signin_email').val())){
		$('#signin_email').addClass("invalid");
		$('#signin_email').next(".text_error").removeClass('hide').show().html("El correu no és correcte");
		deferEmail.reject();
	}else{
		checkEmail($('#signin_email').val()).then(function(results){
			if(results.status!='OK'){
				$('#signin_email').addClass("invalid");
				$('#signin_email').next(".text_error").removeClass('hide').show().html("Correu associat a un altre usuari.");
			}
			deferEmail.resolve();
		}, function(results){
			$('#signin_email').addClass("invalid");
			$('#signin_email').next(".text_error").removeClass('hide').show().html("Error de xarxa. Torni a intentar-ho");
			deferEmail.reject();
		});
	}
			
	if(!signin_social){
		if(isBlank($('#signin_pass').val())){
			$('#signin_pass').addClass("invalid");
			$('#signin_pass').next(".text_error").removeClass('hide').show().html("El camp no pot estar buit");
		}else if($('#signin_pass').val().length < 4){
			$('#signin_pass').addClass("invalid");
			$('#signin_pass').next(".text_error").removeClass('hide').show().html("La contrasenya ha de tenir un mínim de 4 caràcters.");
		}else if(isBlank($('#signin_confirm_pass').val())){
			$('#signin_confirm_pass').addClass("invalid");
			$('#signin_confirm_pass').next(".text_error").removeClass('hide').show().html("El camp no pot estar buit");
		}else if($('#signin_pass').val() != $('#signin_confirm_pass').val()){
			$('#signin_confirm_pass').addClass("invalid");
			$('#signin_confirm_pass').next(".text_error").removeClass('hide').show().html("Les contrasenyes han de coincidir.");
		}
	}
	
	$.when(deferEmail, deferUser).done(function(){
		defer.resolve();
	}).fail(function(){
		defer.reject();
	});
	
	return defer.promise();
}
	
function redirectLogin(results){
//	console.debug(results);
	if (Cookies.get('collaboratebid')) {
		if (Cookies.get('collaborateuid')){
			if (Cookies.get('collaborateuid')!=Cookies.get('uid')) {
				//window.location=HOST_APP+paramUrl.visorPage+'?businessid='+Cookies.get('collaboratebid')+'&uid='+Cookies.get('uid')+'&mapacolaboratiu=alta';
				alert("No pots donar d'alta el mapa col·laboratiu perquè els usuaris no són iguals")
				window.location=paramUrl.galeriaPage+"?private=1";
				Cookies.remove('collaboratebid');
				Cookies.remove('collaborateuid');
			}
			else {
				window.location=paramUrl.visorPage+'?businessid='+Cookies.get('collaboratebid')+'&uid='+Cookies.get('uid')+'&mapacolaboratiu=alta';
				Cookies.remove('collaboratebid');
				Cookies.remove('collaborateuid');
			}
		}
	}
	else {
		if (results.mapBusinessId){
			window.location=paramUrl.mapaPage+"?businessid="+results.mapBusinessId;
		}else if(results.results === 'login_map'){
			if (results.mapBusinessId){
				window.location=paramUrl.mapaPage+"?businessid="+results.mapBusinessId;
			}else{
				window.location=paramUrl.mapaPage;
			}
		}else{
			window.location=paramUrl.galeriaPage+"?private=1";
		}
	}
}
	
function createContingutEmail(email){
	//console.debug("Create contingut email....");
	//console.debug(email);
	uid = email.split("@");
	
	user = (uid[0]?uid[0]:email);
	//console.debug(user);
	var contingut = "<br><br>";
	contingut+= window.lang.translate("Hola");
	contingut+= " "+user+",<br><br>";
	contingut+= window.lang.translate("El vostre registre s'ha completat amb éxit.");
	contingut+= "<br>";
	contingut+= window.lang.translate("Us donem la benvinguda de part de tot l'equip d'Instamaps.");
	contingut+= "<br>";
	contingut+= "<br>";
	contingut+= window.lang.translate("Si teniu dubtes a l'hora d'utilitzar Instamaps podeu consultar l'apartat de preguntes freqüents a");
	contingut+= "<br>";
	contingut+= "<a href=\"http://betaportal.icgc.cat/wordpress/faq-dinstamaps/\" target=\"_blank\">http://betaportal.icgc.cat/wordpress/faq-dinstamaps/</a>";
	contingut+= "<br>";
	contingut+= "<br>";
	contingut+= window.lang.translate("També podeu veure consells i exemples per crear mapes amb Instamaps al Betaportal de l'ICGC");
	contingut+= "<br>";
	contingut+= "<a href=\"http://betaportal.icgc.cat/wordpress/category/instamaps/\" target=\"_blank\">http://betaportal.icgc.cat/wordpress/category/instamaps/</a>";		
	contingut+= "<br>";
	contingut+= "<br>";
	contingut+= window.lang.translate("I si us voleu inspirar per crear mapes espectaculars podeu consultar la galeria de mapes públics compartits per altres usuaris");
	contingut+= "<br>";
	contingut+= "<a href=\"http://www.instamaps.cat/geocatweb/galeria.html\" target=\"_blank\">http://www.instamaps.cat/geocatweb/galeria.html</a>";
	contingut+= "<br>";
	contingut+= "<br>";
	contingut+= window.lang.translate("Us convidem a fer les vostres consideracions a ");
	contingut+= "<a href=\"mailto:instamaps@icgc.cat\" target=\"_blank\">instamaps@icgc.cat</a>. ";
	contingut+= window.lang.translate("Entendre com utilitzeu aquesta eina i quines funcionalitats trobeu a faltar és clau pel seu desenvolupament.");
	contingut+= "<br>";
	contingut+= "<br>";		
		
		
	//console.debug(contingut);
	return contingut;
	
}
