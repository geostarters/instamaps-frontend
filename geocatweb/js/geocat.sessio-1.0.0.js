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
	
	if(url('?token')){
		loginToken({token:url('?token')}).then(function(results){
			if(results.status==='OK'){
				if (results.uid){
					Cookies.set('uid', results.uid);
					Cookies.set('tipusEntitat', results.tipusEntitat);
					Cookies.set('token', results.token);
				}
				redirectLogin(results, trackEventFrom);
			}else if(results.results === 'cannot_authenticate'){
				$('#modal_wrong_user').modal('toggle');						
			}
		});
	}
	
	$.publish('loadConfig', null);
	
});//Fi document ready

jQuery("#login_button").click(function(){

	$.publish('analyticsEvent',{event:[trackEventFrom,'inici sessio', 'retention']});
	
	checkValidityLogin("");
	
	if(! $("span").hasClass( "text_error" )){
		$("#modal-message").remove();
		var user_login =jQuery("#login_user").val();
		var pass_login = jQuery("#login_pass").val();
		var dataUrl = {user:user_login, password:pass_login};
		if (isRandomUser(Cookies.get('uid'))){
			dataUrl.randomuid = Cookies.get('uid');
		}
		
		doLogin(dataUrl).then(function(results){
			if(results.status==='OK'){
				if (results.uid){
					Cookies.set('uid', results.uid);
					Cookies.set('tipusEntitat', results.tipusEntitat);
					Cookies.set('token', results.token);
				}else{
					Cookies.set('uid', user_login);
					Cookies.set('token', results.token);
				}
				if(results.login_icgc){
					$('#modal_login_new_icgc').modal('toggle');
					jQuery('#modal_login_new_icgc').on('hide.bs.modal', function (e) {
						redirectLogin(results, trackEventFrom);
					});
				}else{
					redirectLogin(results, trackEventFrom);
				}
			}else if(results.results === 'cannot_authenticate'){
				$('#modal_wrong_user').modal('toggle');						
			}else if(results.results === 'account_locked'){
				$('#modal_account_block').modal('toggle');						
			}else if(results.results === 'unregistered_user'){
				$('#modal_login_ko_donat_baixa').modal('toggle');
				if (Cookies.get('collaboratebid')) Cookies.remove('collaboratebid');
				if (Cookies.get('collaborateuid')) Cookies.remove('collaborateuid');	
			}else if (results.status === 'MAIL'){
				window.location = results.url;
			}else{
				$('#modal_login_ko').modal('toggle');				
			}				
		},function(results){
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
		subject:window.lang.translate('Instamaps.Recordatori contrasenya'),
		esRecordatoriContrasenya: 'S',
		content: contingut
};
sendMail(data).then(function(results){
	//console.debug(results);							
});
});

jQuery("#demo_button").click(function(){
	window.location.href = paramUrl.mapaPage+"?tipus=geolocal";	
	$.publish('analyticsEvent',{event:[trackEventFrom, 'inici sessio demo geolocal','retention']});
});

function loginUserIcgc(){
	checkValidityLogin("_icgc");
	
	if(! $("span").hasClass( "text_error" )){
		$("#modal-message").remove();
		var user_login_icgc =jQuery("#login_user_icgc").val();
		var pass_login_icgc = jQuery("#login_pass_icgc").val();
		var dataUrl = {user:user_login_icgc, password:pass_login_icgc};
		if (isRandomUser(Cookies.get('uid'))){
			dataUrl.randomuid = Cookies.get('uid');
		}
		doLoginIcgc(dataUrl).then(function(results){
			if(results.status==='OK'){
				Cookies.set('uid', results.uid);
				Cookies.set('tipusEntitat', results.tipusEntitat);
				Cookies.set('token', results.token);
				redirectLogin(results, trackEventFrom);
			}else if (results.status === 'MAIL'){
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
		$('#login_pass'+tipus).after("<span class=\"text_error\" lang=\"ca\">La contrasenya ha de tenir com a mínim 4 caràcters.</span>");
	}
}
  
$('#signin_twitter').click(function() {
	$.publish('analyticsEvent',{event:[trackEventFrom, 'inici sessio twitter','retention']});
	window.location = paramUrl.socialAuth+"id=twitter";
});

$('#signin_facebook').click(function() {
	$.publish('analyticsEvent',{event:[trackEventFrom, 'inici sessio facebook','retention']});
	window.location = paramUrl.socialAuth+"id=facebook";
});

$('#signin_linkedin').click(function() {
	$.publish('analyticsEvent',{event:[trackEventFrom, 'inici sessio linkedin','retention']});
	window.location = paramUrl.socialAuth+"id=linkedin";
});

$('#signin_google').click(function() {
	$.publish('analyticsEvent',{event:[trackEventFrom, 'inici sessio google','retention']});
	window.location = paramUrl.socialAuth+"id=googleplus";
});

$('#signin_icc').click(function() {
	$.publish('analyticsEvent',{event:[trackEventFrom, 'inici sessio icc','retention']});
	$('#dialog_session_icgc').modal('show');
});

$('#signin_eacat').click(function() {
	$.publish('analyticsEvent',{event:[trackEventFrom, 'inici sessio eacat','retention']});
	window.location = paramUrl.eacat;
});

function fesRegistre(){
	//TODO REVISAR; AQUEST CAL???? NO ES PAS INTERMIG???
	if(trackEventFrom==null || trackEventFrom=="") trackEventFrom = "inici sessio";
	$.publish('analyticsEvent',{event:[ trackEventFrom,'registre', 'pre-activation']});
	window.location = "registre.html?from="+trackEventFrom;
}

function redirectLogin(results, from){
	var urlFile="";
	if (window.localStorage){
		if (window.localStorage.getItem("url")) urlFile=window.localStorage.getItem("url");
	}
	if(results.results === 'login_map' || urlFile!=""){
		if (results.mapBusinessId){
			window.location=GEOCAT02+paramUrl.mapaPage+"?businessid="+results.mapBusinessId;
		}else{
			window.location=GEOCAT02+paramUrl.mapaPage;
		}
	}else if(isGeolocalUser() && from != '' && from in paramAplications){
		var token = Cookies.get('token');
		window.open(paramAplications[from].url+results.uid+"&token="+token);
		window.location=GEOCAT02+paramUrl.galeriaPage+"?private=1&aplicacions=1";
	}else{
		if (Cookies.get('collaboratebid')) {
			if (Cookies.get('collaborateuid')){
				if (Cookies.get('collaborateuid')!=Cookies.get('uid')) {
					alert("No pots donar d'alta el mapa col·laboratiu perquè els usuaris no són iguals")
					window.location=GEOCAT02+paramUrl.galeriaPage+"?private=1";
					Cookies.remove('collaboratebid');
					Cookies.remove('collaborateuid');
				}
				else {
					window.location=GEOCAT02+paramUrl.visorPage+'?businessid='+Cookies.get('collaboratebid')+'&uid='+Cookies.get('uid')+'&mapacolaboratiu=alta';
				}
			}
			else {
				window.location=GEOCAT02+paramUrl.visorPage+'?businessid='+Cookies.get('collaboratebid')+'&uid='+Cookies.get('uid')+'&mapacolaboratiu=alta';
				Cookies.remove('collaboratebid');
				Cookies.remove('collaborateuid');
			}
		}
		else window.location=GEOCAT02+paramUrl.galeriaPage+"?private=1";
	}
}