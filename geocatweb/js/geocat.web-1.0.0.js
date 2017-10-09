window.lang = new Lang();

var lsLang;
var Cookies = Cookies.withConverter({
	write: function (value, name) {
		if ( name === 'uid' ) {
			//Add " to the string because @ is only a valid Cookie character if it goes between them
			return '"' + encodeURIComponent(value + "").replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
				decodeURIComponent) + '"';
		}
		else
		{
			return value;
		}
	},
	read: function (value, name) {
		if ( name === 'uid' ) {
			//Add " to the string because @ is only a valid Cookie character if it goes between them
			return value.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent).replace(/\"/g, '');
		}
		else
		{
			return value;
		}
	}
});

jQuery(document).ready(function() {
	

	weball_tornarInici();
	lang.dynamic('en', '/geocatweb/js/language/en.json');
	lang.dynamic('es', '/geocatweb/js/language/es.json');
	window.lang.init({
        defaultLang: 'ca'
    });
	lsLang=web_determinaIdioma();
	isEditing = edit = ("mapa" == url('filename'));
	if (lsLang == null || lsLang == "null"){
		lsLang = "ca";
		canviaIdioma(lsLang);
	}
	web_menusIdioma(lsLang);
	
	initHover();
	checkUserLogin();
    //dialeg expired
    jQuery('#dialog_session_expired').on('hidden.bs.modal', function (e) {
    	logoutUser();
    });
    initCookies();
    
    if ($(".centered-form").length > 0){
    	controlLandingForm();
    }
    cambiarTitle();
});

function initCookies(){
	window.cookieconsent.initialise({
		cookies: {domain: 'instamaps.cat', analytics: {}},
		position: 'bottom',
	    palette:{
	      popup: {background: "#222222"},
	      button: {background: "#00b050"}
	    },
	    content: {
    	  message: window.lang.translate("Per tal de fer el seguiment de visites al nostre lloc web, utilitzem galetes. En cap cas emmagatzemem la vostra informació personal"),
    	  dismiss: window.lang.translate("Acceptar")
    	},
	    showLink: false,
	    dismissOnScroll: true,
	    law: {
	      regionalLaw: false,
	    }
	});
}

function controlLandingForm(){
	$('.centered-form').transition({ opacity: 100, delay: 600  });
	//intro per enviament del form
	jQuery(document).keypress(function(e) {
	    if(e.which == 13 ) {
	    	e.preventDefault();
	    	if($("#landing-form-email").is(":focus")){
	    		landingFormButtonClick("");  
	    	}else if($("#landing-form-email-xs").is(":focus")){
	    		landingFormButtonClick("-xs");  
	    	}
	    }
	});	
    
    $('#landing-form-email, #landing-form-email-xs').focus(function(){
    	$('#landing-form-message').html('');
    	$('#landing-form-email').removeClass("invalid-landing-form");
    	$('#landing-form-message-xs').html('');
    	$('#landing-form-email-xs').removeClass("invalid-landing-form");
    });
    
    $('#id-btn-landing-form').on("click", function(){
    	landingFormButtonClick(""); 
    });
    
    $('#id-btn-landing-form-xs').on("click", function(){
    	landingFormButtonClick("-xs");    	
    });	
}

function insertDataInstamaper(email){
	var defer = $.Deferred();
	
	var dataInsert = {
		email: email,
		options: curs_instamaps
	};
	var insert_error = "";
	registreInstamaper(dataInsert).then(function(results){
		if (results.status=="ERROR") {
			
			if(results.results == "ORA-00001"){
				insert_error = " (email ja inserit un cop durant el dia d'avui a la taula INSTAMAPERS)";
				defer.reject(insert_error);
			}else{
				insert_error = " (email no inserit correctament a la taula INSTAMAPERS)";
				defer.resolve(insert_error);
			}
		}else{
			defer.resolve(insert_error);
		}
	},function(results){
		insert_error = " (email no inserit correctament a la taula INSTAMAPERS)";
		defer.resolve(insert_error);
	});	

	return defer.promise();
}

function sendEmailInstamaper(email,insert_error, type){//type per saber si es per pantalles petites o grans
	var data = {
		uid: Cookies.get('uid'),
		to: instamaps_email,// to,
		subject: curs_instamaps,
		content: email + insert_error,//contingut,
		esColaboratiu: 'N',
		businessId: ""
	};
	sendMail(data).then(function(results){
		if (results.status=="OK") {
			$('#landing-form-message'+type).html(
					'<div class="alert alert-success alert-dismissible" role="alert">'+
					  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
					  '<strong><span class="glyphicon glyphicon-ok"></span></strong> '+window.lang.translate("Gràcies. Prenem nota del teu correu i t'avisarem quan comencem el proper taller.")+'</div>'
			);				
		}
		else {
			$('#landing-form-message'+type).html(
					'<div class="alert alert-danger alert-dismissible" role="alert">'+
					  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
					  '<strong><span class="glyphicon glyphicon-warning-sign"></span></strong> '+window.lang.translate("Hi ha hagut un problema amb l'enviament del correu. Torni a intentar-ho.")+'</div>'
			);
		}
	},function(results){
		$('#landing-form-message'+type).html(
			'<div class="alert alert-danger alert-dismissible" role="alert">'+
			  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
			  '<strong><span class="glyphicon glyphicon-warning-sign"></span></strong> '+window.lang.translate("Hi ha hagut un problema amb l'enviament del correu. Torni a intentar-ho.")+'</div>'
		);
	});	
	
}

function landingFormButtonClick(type){

	var email =  $('#landing-form-email'+type).val();
	
	if(isBlank(email)){
		$('#landing-form-email'+type).addClass("invalid-landing-form");
		$('#landing-form-message'+type).html(
				'<div class="alert alert-danger alert-dismissible" role="alert">'+
				  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
				  '<strong><span class="glyphicon glyphicon-warning-sign"></span></strong> '+window.lang.translate("El camp no pot estar buit")+'</div>'
		);			
	}else if(!isValidEmailAddress(email)){
		$('#landing-form-email'+type).addClass("invalid-landing-form");
		$('#landing-form-message'+type).html(
				'<div class="alert alert-danger alert-dismissible" role="alert">'+
				  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
				  '<strong><span class="glyphicon glyphicon-warning-sign"></span></strong> '+window.lang.translate("El correu no és correcte")+'</div>'
		);	
	}else{

    	$('#landing-form-message'+type).html(
    			'<div class="three-quarters-loader">'+
    			'  Loading…'+
    			'</div>'
    	);

    	insertDataInstamaper(email).then(function(results){
    			sendEmailInstamaper(email,results, type);
    		},function(results){
    			$('#landing-form-message'+type).html(
    					'<div class="alert alert-success alert-dismissible" role="alert">'+
    					  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
    					  '<strong><span class="glyphicon glyphicon-ok"></span></strong> '+window.lang.translate("Gràcies. Prenem nota del teu correu i t'avisarem quan comencem el proper taller.")+'</div>'
    			);	    			
    		}
    	);
	}	
}

function initHover(){
	$("#div_V").hover(function(){
		$("#img_V").attr('src','llibreries/img/Visualitza_pujat.jpg');
	},function(){
		$("#img_V").attr('src','llibreries/img/Visualitza_.jpg');
	});
	
	$("#div_C").hover(function(){
		$("#img_C").attr('src','llibreries/img/Crea_pujat.jpg');
	},function(){
		$("#img_C").attr('src','llibreries/img/Crea_.jpg');
	});
	
	$("#div_E").hover(function(){
		$("#img_E").attr('src','llibreries/img/Explora_pujat.jpg');
	},function(){
		$("#img_E").attr('src','llibreries/img/Explora_.jpg');
	});
	
	$("#div_C1").hover(function(){
		$("#img_C1").attr('src','llibreries/img/Comparteix_pujat.jpg');
	},function(){
		$("#img_C1").attr('src','llibreries/img/Comparteix_.jpg');
	});
	
	/*langing geolocal*/
	$("#div_PC").hover(function(){
		//$("#img_PC").attr('src','geocatweb/img/thumb_ed_pcivil.png');
		$(this).fadeTo( 0, 0.7 );
	},function(){
		//$("#img_PC").attr('src','geocatweb/img/thumb_ed_pcivil.png');
		$(this).fadeTo( 0, 1 );
	});
	
	$("#div_IP").hover(function(){
		//$("#img_IP").attr('src','geocatweb/img/thumb_ed_infoparcela.png');
		$(this).fadeTo( 0, 0.7 );
	},function(){
		//$("#img_IP").attr('src','geocatweb/img/thumb_ed_infoparcela.png');
		$(this).fadeTo( 0, 1 );
	});
	
	$("#div_CC").hover(function(){
		//$("#img_CC").attr('src','geocatweb/img/thumb_ed_carrerer.png');
		$(this).fadeTo( 0, 0.7 );
	},function(){
		//$("#img_CC").attr('src','geocatweb/img/thumb_ed_carrerer.png');
		$(this).fadeTo( 0, 1 );
	});
	
	jQuery('#div_PC').on('click', function(e) {
		e.preventDefault();
		console.debug(this);
	$.publish('analyticsEvent',{event:[ 'aplicacions', t_user_loginat+'protecció civil']});
		document.location.href = paramUrl.loginGeolocalPage + "?from=pcivil";
	});
	jQuery('#div_IP').on('click', function(e) {
		e.preventDefault();
		console.debug(this);
	$.publish('analyticsEvent',{event:[ 'aplicacions', t_user_loginat+'infoParcela']});
		document.location.href = paramUrl.loginGeolocalPage + "?from=infoparcela";
	});
	jQuery('#div_CC').on('click', function(e) {
		e.preventDefault();
		console.debug(this);
	$.publish('analyticsEvent',{event:[ 'aplicacions', t_user_loginat+'carrerer']});
		document.location.href = paramUrl.loginGeolocalPage + "?from=carrerer";
	});
}

function checkUserLogin(){
	var uid = Cookies.get('uid');
	if (uid===undefined) uid=_UsrID;
	var tipusEntitat = parseInt(Cookies.get('tipusEntitat'));
	var logged = false;
	if(!uid || isRandomUser(uid)){
		$("#menu_login").show();
		$("#menu_user").hide();
		$("#text_username").remove();
	}else {
		logged = true;
		$("#menu_login").hide();
		$("#menu_user").show();	
		var nomUser = uid.split("@");
		$("#text_username").text(" "+nomUser[0]);
		
		var galeria_url = paramUrl.galeriaPage + "?private=1";
		$("#galeria a").attr('href', galeria_url);
		$("#aplicacions a").attr('href', galeria_url + "&aplicacions=1");
	}
	if($.inArray(tipusEntitat,TIPUS_ENTITATS_GEOLOCAL) != -1){
		$("#aplicacions").show();
	}else{
		$("#aplicacions").hide();
	}
	
	if(url('file') === "galeria_geolocal.html" || 
		url('file') === "sessio_geolocal.html" ||
		url('file') === "geolocal.html" 
	){
		Cookies.set('perfil', 'geolocal');
	}else if(url('file') === "galeria.html" ||
		url('file') === "sessio.html" ||
		url('file') === "index.html"
	){
		Cookies.set('perfil', 'instamaps');
	}
	
	if(!tipusEntitat){
		var perfil = Cookies.get('perfil');
		switch(perfil){
			case 'instamaps':
				tipusEntitat = 1;
				break;
			case 'geolocal':
				tipusEntitat = 2;
				break;
			case 'Psolar':
				tipusEntitat= 11;
				break;
			default: tipusEntitat = 1;
		}
	}
	
	var instamapsOptions = {
		uid: uid,
		tipusEntitat: tipusEntitat,
		logged: logged
	};
	var instamaps = Instamaps(instamapsOptions);
	instamaps.changeBrand('.brand-txt').changeBrandLink('.navbar-brand')
	.changeGaleria('.instamaps_galeria').changeSession('.instamaps_sessio')
	.changeFooter('.instamaps_footer').changeContact('#hl_contact');
}

function web_menusIdioma(lsLang){
	jQuery('#ch_idioma li').each(function() {
		jQuery(this).removeClass('active');
		if (jQuery(this).attr('id') == lsLang){
			jQuery(this).addClass('active');
		}
		jQuery(this).click(function() {
			jQuery('#ch_idioma li').removeClass('active');
			jQuery(this).addClass('active');
			canviaIdioma(jQuery(this).attr('id'));
	    });
  });
}

function canviaIdioma(lsLang){
	window.lang.change(lsLang);
	$("body").trigger( "change-lang", lsLang );
	$.publish('change-lang',{lang: lsLang});
}

function web_determinaIdioma(){//Determinar idioma per paràmetre
	if (url('?hl')){
		var lsLang = url('?hl');//obteValorURL("hl");
		window.lang.change(lsLang);		
		jQuery("a[id^='hl_']").each(function(index){
			var _href=jQuery(this).attr('href');
			_href.indexOf('?') == -1 ? jQuery(this).attr('href',_href+'?hl='+lsLang): jQuery(this).attr('href',_href+'&hl='+lsLang);
		});
	}
	else if (Cookies.get("langCookie")){
		var lsLang = Cookies.get("langCookie");
		if (lsLang != null && lsLang != "null"){
			window.lang.change(lsLang);
		}
	}
	return lsLang;
}

function web_roundCircles(){
	jQuery('#div_E').on('click', function() {
		document.location.href = "#row_E";
	});
	jQuery('#div_C').on('click', function() {
		document.location.href = "#row_C";
	});
	jQuery('#div_V').on('click', function() {
		document.location.href = "#row_V";
	});
	jQuery('#div_C1').on('click', function() {
		document.location.href = "#row_C1";
	});
}
	
	
	
function weball_tornarInici(){
	
jQuery("#back-top").hide();
jQuery('#fes-mapa-inici').hide();
	
	jQuery(function () {
		jQuery(window).scroll(function () {
			if (jQuery(this).scrollTop() > 150) {
				jQuery('#back-top').fadeIn();
				jQuery('#fes-mapa-inici').fadeIn();
			} else {
				jQuery('#back-top').fadeOut();
				jQuery('#fes-mapa-inici').fadeOut();
			}
		});

		jQuery('#back-top button').click(function () {
			jQuery('body,html').animate({
				scrollTop: 0
			}, 800);
			return false;
		});
		jQuery('#fes-mapa-inici').click(function () {
			window.open("../geocatweb/mapa.html","_self");
		});
	});
}	

function defineTipusUser(){
	if(!Cookies.get('uid') || Cookies.get('uid').indexOf('random')!=-1){
		tipus_user = t_user_random;
	}else{
		tipus_user = t_user_loginat;
	}
	return tipus_user;
}

function logoutUser(){
	
		
	if (isRandomUser(Cookies.get('uid'))){
		deleteRandomUser({uid: Cookies.get('uid')});
	}
	var redirect = "/index.html";
	if(isGeolocalUser()){
		redirect = "/geolocal.html";
	}
	Cookies.remove('uid');
	Cookies.remove('tipusEntitat');
	Cookies.remove('token');
	doLogout().then(function(results){
		if(results.status==='OK'){
			Cookies.remove('uid');
			Cookies.remove('tipusEntitat');
			Cookies.remove('token');
			window.location.href=redirect;
		}else{
			alert("no logout");
		}			
	},function(results){
		alert("no logout");
		//jQuery('#div_msg').html('<div class="alert alert-danger my-alert" lang="ca">No s\'ha iniciat la sessi&oacute;. <strong>Torni a intentar.</strong></div>');
	});
}

function sessionExpired(){
	jQuery('#dialog_session_expired').modal('show');
}

function isRandomUser(user){
	var isRandom = false;
	if (user && user.indexOf("random_") != -1 && user.indexOf("random_") == 0){
		isRandom = true;
	}
	return isRandom;
}

//Funcions afegir modals
function addHtmlModalMessages(){
	jQuery('#mapa_modals').append(
		'	<!-- Modal messages -->'+
		'	<div id="dialgo_messages" class="modal fade">'+
		'	<div class="modal-dialog">'+
		'		<div class="modal-content">'+
		'			<div class="modal-header">'+
		'				<button id="old_icon_close" type="button" class="close" data-dismiss="modal"'+
		'					aria-hidden="true">&times;</button>'+
		'				<h4 lang="ca" class="modal-title">&nbsp;</h4>'+
		'			</div>'+
		'			<div class="modal-body">'+
		'			</div>'+
		'			<div class="modal-footer">'+
		'				<button id="old_btn_close" lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Acceptar</button>'+
		'			</div>'+
		'		</div>'+
		'		<!-- /.modal-content -->'+
		'	</div>'+
		'	<!-- /.modal-dialog -->'+
		'</div>'+
		'<!-- fi messages -->'
	);
}

function addHtmlModalExpire(){
	jQuery('#mapa_modals').append(
		'	<!-- Modal expired -->'+
		'	<div class="modal fade" id="dialog_session_expired">'+
		'	<div class="modal-dialog">'+
		'		<div class="modal-content">'+
		'			<div class="modal-header">'+
		'				<button type="button" class="close" data-dismiss="modal"'+
		'					aria-hidden="true">&times;</button>'+
		'				<h4 class="modal-title" lang="ca">Sessió caducada</h4>'+
		'			</div>'+
		'			<div lang="ca" class="modal-body">'+
		'				Ha caducat la sessió. Si vols continuar treballant torna a iniciar la sessió'+
		'			</div>'+
		'			<div class="modal-footer">'+
		'		    	<button id="bt_upload_cancel" lang="ca" type="button" class="btn" data-dismiss="modal">Acceptar</button>'+
		'		    </div>'+
		'		</div>'+
		'		<!-- /.modal-content -->'+
		'	</div>'+
		'	<!-- /.modal-dialog -->'+
		'</div>'+
		'<!-- /.modal -->'+
		'<!-- fi Modal expired -->'	
	);
}


function addHtmlModalLeave(){
	jQuery('#mapa_modals').append(
		'	<!-- Modal Leave -->'+
		'		<div id="dialgo_leave" class="modal fade">'+
		'		<div class="modal-dialog">'+
		'			<div class="modal-content">'+
		'				<div class="modal-header">'+
		'					<button type="button" class="close" data-dismiss="modal"'+
		'						aria-hidden="true">&times;</button>'+
		'					<h4 lang="ca" class="modal-title">Edició en mode demostració</h4>'+
		'				</div>'+
		'				<div class="modal-body" lang="ca">'+
		'					Per poder guardar les dades has d\'entrar com un usuari registrat'+
		'				</div>'+
		'				<div class="modal-footer">'+
		'					<button lang="ca" type="button" class="btn bt-sessio"'+ 
		'							onClick="$.publish(\'analyticsEvent\',{event:[\'mapa\', \'inici sessio\', \'modal inici mapa\']);">Inicia la sessió</button>'+
		'					<button lang="ca" type="button" class="btn bt_orange"'+ 
		'							onClick="$.publish(\'analyticsEvent\',{event:[\'mapa\', \'registre\', \'modal inici mapa\']);">Crea un compte</button>'+
		'					<button id="btn-guest" lang="ca" type="button" class="btn btn-default" data-dismiss="modal"'+ 
		'							onClick="$.publish(\'analyticsEvent\',{event:[\'mapa\', \'guest\', \'modal inici mapa\']);">Més tard</button>'+
		'				</div>'+
		'			</div>'+
		'			<!-- /.modal-content -->'+
		'		</div>'+
		'		<!-- /.modal-dialog -->'+
		'	</div>'+
		'	<!-- fi Modal Leave -->'		
	);
}


function addHtmlModalOldBrowser(){
	jQuery('#mapa_modals').append(
	'	<!-- Modal Old Browser -->'+
	'		<div id="dialgo_old_browser" class="modal">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'					<button id="old_icon_close" type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 lang="ca" class="modal-title">Sabia vostè que el seu navegador no està actualitzat?</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<div lang="ca">Per aconseguir la millor experiència possible utilitzant el nostre lloc web nosaltres recomanem que vostè actualitzeu a una nova versió d\'Internet Explorer o utilitzi un altre navegador web. Una llista dels navegadors web més populars pot ser trobada sota.</div>'+
	'					<div>'+
	'					<a href="http://www.microsoft.com/windows/Internet-explorer/default.aspx" target="_blank"><div class=\'ie_img browser_img\'></div></a>'+
	'					<a href="http://www.mozilla.com/firefox/" target="_blank"><div class=\'firefox_img browser_img\'></div></a>'+
	'					<a href="http://www.apple.com/safari/download/" target="_blank"><div class=\'safari_img browser_img\'></div></a>'+
	'					<a href="http://www.opera.com/download/" target="_blank"><div class=\'opera_img browser_img\'></div></a>'+
	'					<a href="http://www.google.com/chrome" target="_blank"><div class=\'chrome_img browser_img\'></div></a>'+
	'					</div>'+
	'					<div lang="ca">Només faci clic a les icones per anar a la pàgina de descàrrega</div>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button id="old_btn_close" lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Continuar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- fi Modal Old Browser -->'		
	);
}

function isGeolocalUser(){
	var isGeolocal = false;
	
	
	if(Cookies.get('tipusEntitat')){
		if($.inArray(parseInt(Cookies.get('tipusEntitat')),TIPUS_ENTITATS_GEOLOCAL) != -1){
			isGeolocal = true;
		}
	}
	
	return isGeolocal;
}



function isSostenibilitatUser(publica){
	var isSostenibilitat = false;
	
	
	if(Cookies.get('tipusEntitat')){
		if(parseInt(Cookies.get('tipusEntitat'))==TIPUS_ENTITATS_SOSTENIBILITAT){
			isSostenibilitat = true;
			
	if(publica){
			$("head").append('<link rel="stylesheet" href="/moduls/sostenibilitat/css/sostenibilitat.css">');
			$("head").append('<script src="/moduls/sostenibilitat/js/sostenibilitat-2.0.0.js" type="text/javascript"></script>');
			//$("head").append('<script src="/moduls/sostenibilitat/js/modul-sostenibilitat-2.0.0.js" type="text/javascript"></script>');
	}
	
	
			
			
		}
	}
	
	return isSostenibilitat;
}








function cambiarTitle(){
	

	if(Cookies.get('tipusEntitat')){
		if(isGeolocalUser()){
			$('.brand-txt').text("InstaMaps.GeoLocal");
			$('.navbar-brand').prop('href','/geolocal.html');
		}else{
			$('.brand-txt').text("InstaMaps");
			$('.navbar-brand').prop('href','/index.html');
		}
	}
	else if (typeof url('?tipus') == "string" && url('?tipus')=="geolocal"){
		$('.brand-txt').text("InstaMaps.GeoLocal");
		$('.navbar-brand').prop('href','/geolocal.html');
	}
}
