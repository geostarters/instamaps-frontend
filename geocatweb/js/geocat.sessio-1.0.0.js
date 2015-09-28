var trackEventFrom = '';

jQuery(document).ready(function() {
	jQuery(document).keypress(function(e) {
	    if(e.which == 13) {
	    	jQuery("#login_button").click();
	    	
	    }
	});
	
	if(url('?from')){
		trackEventFrom = url('?from');
	}
	
});//Fi document ready

jQuery("#login_button").click(function(){

	_gaq.push(['_trackEvent',trackEventFrom,'inici sessio', 'retention']);
	//_kmq.push(['record', 'inici sessio', {'from':trackEventFrom, 'funnel':'retention', 'usuari from':'instamapes'}]);
	
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
			console.debug(results);
			if(results.status==='OK'){
				if (results.uid){
					$.cookie('uid', results.uid, {path:'/'});
					$.cookie('tipusEntitat', results.tipusEntitat, {path:'/'});
				}else{
					$.cookie('uid', user_login, {path:'/'});
				}
				if(results.login_icgc){
					$('#modal_login_new_icgc').modal('toggle');
					jQuery('#modal_login_new_icgc').on('hide.bs.modal', function (e) {
						
//						jQuery('#dialog-migracio').modal('show');
//						jQuery('#dialog-migracio').on('hide.bs.modal', function (e) {
//							redirectLogin(results);
//						});
						
						redirectLogin(results);
					});
				}else{
					redirectLogin(results);
//					jQuery('#dialog-migracio').modal('show');
//					jQuery('#dialog-migracio').on('hide.bs.modal', function (e) {
//						redirectLogin(results);
//					});					
				}
			}else if(results.results === 'cannot_authenticate'){
				$('#modal_wrong_user').modal('toggle');						
			}else if(results.results === 'account_locked'){
				$('#modal_account_block').modal('toggle');						
			}else if(results.results === 'unregistered_user'){
				$('#modal_login_ko_donat_baixa').modal('toggle');
				if ($.cookie('collaboratebid')) $.removeCookie('collaboratebid',{path: '/' });
				if ($.cookie('collaborateuid')) $.removeCookie('collaborateuid',{path: '/' });	
			}else if (results.status === 'MAIL'){
				window.location = results.url;
			}else{
				$('#modal_login_ko').modal('toggle');				
			}				
		},function(results){
//			console.debug(results);
			$('#modal_login_ko').modal('toggle');					
		});
	}
});


//Recordar/modificar contrasenya
jQuery("#btn_remember_pssw").click(function(){
	window.location.href = paramUrl.oblidatPage;
	
});

jQuery("#perfil_button_remember").click(function(){
var contingut= "Tal i com ens has sol·licitat hem procedit a assignar-te una nova contrasenya per l'accés als serveis de la nostra web. Les noves dades d'accés són:";
var data = {
		to:$('#perfil_email').val(),
		subject:window.lang.convert('Instamaps.Recordatori contrasenya'),
		esRecordatoriContrasenya: 'S',
		content: contingut
};
sendMail(data).then(function(results){
	console.debug(results);							
});
});

function loginUserIcgc(){
	console.debug("loginUserIcgc");
	checkValidityLogin("_icgc");
	
	if(! $("span").hasClass( "text_error" )){
		$("#modal-message").remove();
		var user_login_icgc =jQuery("#login_user_icgc").val();
		var pass_login_icgc = jQuery("#login_pass_icgc").val();
		var dataUrl = {user:user_login_icgc, password:pass_login_icgc};
		if (isRandomUser($.cookie('uid'))){
			dataUrl.randomuid = $.cookie('uid');
		}
		doLoginIcgc(dataUrl).then(function(results){
			if(results.status==='OK'){
				$.cookie('uid', results.uid, {path:'/'});
				$.cookie('tipusEntitat', results.tipusEntitat, {path:'/'});
				redirectLogin(results);
			}else if (results.status === 'MAIL'){
				/*
				//solo para local OJO al subir
				if(results.url.indexOf('instamapes.icgc.cat')!= -1){
					results.url = results.url.replace('instamapes.icgc.cat','localhost');
				}
				*/
				window.location = results.url;
			}else if(results.results === 'cannot_authenticate'){
				$('#dialog_session_icgc').modal('toggle');
				$('#modal_wrong_user').modal('toggle');						
			}else if(results.results === 'account_locked'){
				$('#dialog_session_icgc').modal('toggle');
				$('#modal_account_block').modal('toggle');						
			}else{
				$('#dialog_session_icgc').modal('toggle');
				$('#modal_login_ko').modal('toggle');				
			}				
		},function(results){
			$('#dialog_session_icgc').modal('toggle');
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
	if(tipus == "") pass_length = 4;
	
	if(isBlank($('#login_pass'+tipus).val())){
		$('#login_pass'+tipus).addClass("invalid");
		$('#login_pass'+tipus).after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
	}else if($('#login_pass'+tipus).val().length < pass_length){
		$('#login_pass'+tipus).addClass("invalid");
		$('#login_pass'+tipus).after("<span class=\"text_error\" lang=\"ca\">La contrassenya ha de tenir com a mínim 4 caràcters.</span>");
	}
}
  
$('#signin_twitter').click(function() {
	_gaq.push(['_trackEvent',trackEventFrom, 'inici sessio twitter','retention']);
	//_kmq.push(['record', 'inici sessio', {'from':trackEventFrom, 'funnel':'retention', 'usuari from':'twitter'}]);
	window.location = paramUrl.socialAuth+"id=twitter";
});

$('#signin_facebook').click(function() {
	_gaq.push(['_trackEvent',trackEventFrom, 'inici sessio facebook','retention']);
	//_kmq.push(['record', 'inici sessio', {'from':trackEventFrom, 'funnel':'retention', 'usuari from':'facebook'}]);
	window.location = paramUrl.socialAuth+"id=facebook";
});

$('#signin_linkedin').click(function() {
	_gaq.push(['_trackEvent',trackEventFrom, 'inici sessio linkedin','retention']);
	//_kmq.push(['record', 'inici sessio', {'from':trackEventFrom, 'funnel':'retention', 'usuari from':'linkedin'}]);
	window.location = paramUrl.socialAuth+"id=linkedin";
});

$('#signin_google').click(function() {
	_gaq.push(['_trackEvent',trackEventFrom, 'inici sessio google','retention']);
	//_kmq.push(['record', 'inici sessio', {'from':trackEventFrom, 'funnel':'retention', 'usuari from':'google'}]);
	window.location = paramUrl.socialAuth+"id=googleplus";
});

$('#signin_icc').click(function() {
	_gaq.push(['_trackEvent',trackEventFrom, 'inici sessio icc','retention']);
	//_kmq.push(['record', 'inici sessio', {'from':trackEventFrom, 'funnel':'retention', 'usuari from':'icc'}]);
	$('#dialog_session_icgc').modal('show');
});

function fesRegistre(){
	//TODO REVISAR; AQUEST CAL???? NO ES PAS INTERMIG???
	if(trackEventFrom==null || trackEventFrom=="") trackEventFrom = "inici sessio";
	_gaq.push(['_trackEvent', trackEventFrom,'registre', 'pre-activation']);
	window.location = "registre.html?from="+trackEventFrom;
	
//	if(url('?from')){
//		window.location = "registre.html?from="+url('?from');
//	}else{
//		window.location = "registre.html";
//	}
}

function redirectLogin(results){
	console.debug(results);
	if(results.results === 'login_map'){
		if (results.mapBusinessId){
			window.location=GEOCAT02+paramUrl.mapaPage+"?businessid="+results.mapBusinessId;
		}else{
			window.location=GEOCAT02+paramUrl.mapaPage;
		}
	}else{
		if ($.cookie('collaboratebid')) {
			if ($.cookie('collaborateuid')){
				if ($.cookie('collaborateuid')!=$.cookie('uid')) {
					//window.location=GEOCAT02+paramUrl.visorPage+'?businessid='+$.cookie('collaboratebid')+'&uid='+$.cookie('uid')+'&mapacolaboratiu=alta';
					alert("No pots donar d'alta el mapa col·laboratiu perquè els usuaris no són iguals")
					window.location=GEOCAT02+paramUrl.galeriaPage+"?private=1";
					$.removeCookie('collaboratebid',{path: '/' });
					$.removeCookie('collaborateuid',{path: '/' });
				}
				else {
					window.location=GEOCAT02+paramUrl.visorPage+'?businessid='+$.cookie('collaboratebid')+'&uid='+$.cookie('uid')+'&mapacolaboratiu=alta';
					$.removeCookie('collaboratebid',{path: '/' });
					$.removeCookie('collaborateuid',{path: '/' });
				}
			}
			else {
				window.location=GEOCAT02+paramUrl.visorPage+'?businessid='+$.cookie('collaboratebid')+'&uid='+$.cookie('uid')+'&mapacolaboratiu=alta';
				$.removeCookie('collaboratebid',{path: '/' });
				$.removeCookie('collaborateuid',{path: '/' });
			}
		}
		else window.location=GEOCAT02+paramUrl.galeriaPage+"?private=1";
	}
}

