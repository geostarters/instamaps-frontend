
window.lang = new jquery_lang_js();

var lsLang;

jQuery(document).ready(function() {
	weball_tornarInici();		
	window.lang.run();
	lsLang=web_determinaIdioma();
	if (lsLang == null || lsLang == "null"){
		lsLang = "ca";
		canviaIdioma(lsLang);
	}
	web_menusIdioma(lsLang);
	initHover();
	checkUserLogin();
    var currentLang = localStorage.getItem('langJs_currentLang');
    if(currentLang === 'es')$("#es").addClass("active");
    else if(currentLang === 'en') $("#en").addClass("active");
    else {
    	$("#ca").addClass("active");
    	localStorage['langJs_currentLang'] = 'ca';
    }
    
	jQuery("#hl_contact").on('click', function() {
		jQuery(this).attr('href','mailto:instamapes@icgc.cat');
		
	});
    
    //dialeg expired
    jQuery('#dialog_session_expired').on('hidden.bs.modal', function (e) {
    	logoutUser();
    	//window.location.href = paramUrl.loginPage;
    });
    initCookies();
    
//    if(window.location.href.indexOf("index.html")!=-1){
//    	controlLandingForm();
//    }
    
    if ($(".centered-form").length > 0){
    	controlLandingForm();
    }
    
    cambiarTitle();
});

function initCookies(){
	cc.initialise({
		cookies: {analytics: {}},
		settings: {
			consenttype: "implicit",
			bannerPosition: "bottom",
			hideprivacysettingstab: true,
			ignoreDoNotTrack: true,
			hideallsitesbutton: false,
			onlyshowbanneronce: true
		},
		strings: {
			notificationTitleImplicit: window.lang.convert("Per tal de fer el seguiment de visites al nostre lloc web, utilitzem galetes. En cap cas emmagatzemem la vostra informació personal"),
			seeDetailsImplicit:'',
			savePreference:window.lang.convert("Acceptar"),
			allowCookiesImplicit: window.lang.convert("Acceptar")
		}
	});
	
	if ($("#cc-tag a span").text() == "Privacy settings"){
		$("#cc-tag").hide();
	}
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
//	console.debug("insertDataInstamaper...");
	var defer = $.Deferred();
	
	var dataInsert = {
			email: email,
			options: curs_instamaps
	}
//	console.debug(dataInsert);
	var insert_error = "";
	registreInstamaper(dataInsert).then(function(results){
//		console.debug(results);					
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
//		console.debug(insert_error);
		defer.resolve(insert_error);
	});	

	return defer.promise();
}

function sendEmailInstamaper(email,insert_error, type){//type per saber si es per pantalles petites o grans
//	console.debug("sendEmailInstamaper ....");
	var data = {
			uid: $.cookie('uid'),
			to: instamaps_email,// to,
			subject: curs_instamaps,
			content: email + insert_error,//contingut,
			esColaboratiu: 'N',
			businessId: ""
	};
//	console.debug(data);
	sendMail(data).then(function(results){
//		console.debug(results);					
		if (results.status=="OK") {
//			console.debug(results)	;
			$('#landing-form-message'+type).html(
					'<div class="alert alert-success alert-dismissible" role="alert">'+
					  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
					  '<strong><span class="glyphicon glyphicon-ok"></span></strong> '+window.lang.convert("Gràcies. Prenem nota del teu correu i t'avisarem quan comencem el proper taller.")+'</div>'
			);				
		}
		else {
			$('#landing-form-message'+type).html(
					'<div class="alert alert-danger alert-dismissible" role="alert">'+
					  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
					  '<strong><span class="glyphicon glyphicon-warning-sign"></span></strong> '+window.lang.convert("Hi ha hagut un problema amb l'enviament del correu. Torni a intentar-ho.")+'</div>'
			);
		}
	},function(results){
		$('#landing-form-message'+type).html(
			'<div class="alert alert-danger alert-dismissible" role="alert">'+
			  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
			  '<strong><span class="glyphicon glyphicon-warning-sign"></span></strong> '+window.lang.convert("Hi ha hagut un problema amb l'enviament del correu. Torni a intentar-ho.")+'</div>'
		);
	});	
	
//	console.debug(".... sendEmailInstamaper");
}

function landingFormButtonClick(type){
//	console.debug("CLICK!");
	
	var email =  $('#landing-form-email'+type).val();
	
	if(isBlank(email)){
		$('#landing-form-email'+type).addClass("invalid-landing-form");
		$('#landing-form-message'+type).html(
				'<div class="alert alert-danger alert-dismissible" role="alert">'+
				  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
				  '<strong><span class="glyphicon glyphicon-warning-sign"></span></strong> '+window.lang.convert("El camp no pot estar buit")+'</div>'
		);			
	}else if(!isValidEmailAddress(email)){
		$('#landing-form-email'+type).addClass("invalid-landing-form");
		$('#landing-form-message'+type).html(
				'<div class="alert alert-danger alert-dismissible" role="alert">'+
				  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
				  '<strong><span class="glyphicon glyphicon-warning-sign"></span></strong> '+window.lang.convert("El correu no és correcte")+'</div>'
		);	
	}else{

    	$('#landing-form-message'+type).html(
    			'<div class="three-quarters-loader">'+
    			'  Loading…'+
    			'</div>'
    	);

    	insertDataInstamaper(email).then(function(results){
//    		console.debug("insertDataInstamaper results:");
//    		console.debug(results);
    			sendEmailInstamaper(email,results, type);
    		},function(results){
//    			console.debug("Email ja enviat i apunta't!");
    			$('#landing-form-message'+type).html(
    					'<div class="alert alert-success alert-dismissible" role="alert">'+
    					  '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
    					  '<strong><span class="glyphicon glyphicon-ok"></span></strong> '+window.lang.convert("Gràcies. Prenem nota del teu correu i t'avisarem quan comencem el proper taller.")+'</div>'
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
		document.location.href = paramUrl.loginGeolocalPage + "?from=pcivil";
	});
	jQuery('#div_IP').on('click', function(e) {
		e.preventDefault();
		console.debug(this);
		document.location.href = paramUrl.loginGeolocalPage + "?from=infoparcela";
	});
	jQuery('#div_CC').on('click', function(e) {
		e.preventDefault();
		console.debug(this);
		document.location.href = paramUrl.loginGeolocalPage + "?from=carrerer";
	});
}

function checkUserLogin(){
	var uid = $.cookie('uid');
	var tipusEntitat = parseInt($.cookie('tipusEntitat'));
	if(!uid || isRandomUser(uid)){
		$("#menu_login").show();
		$("#menu_user").hide();
		$("#text_username").remove();
	}else {
		$("#menu_login").hide();
		$("#menu_user").show();	
//		$("#text_welcome").append("<span id=\"text_username\"> "+uid+"</span>");
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
}


function web_menusIdioma(lsLang){
	jQuery('#ch_idioma li').each(function() {
		jQuery(this).removeClass('active');
		if (jQuery(this).attr('id') ==lsLang){
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
	//console.info("entro");
//	console.debug(lsLang);
	window.lang.change(lsLang);
	$("body").trigger( "change-lang", lsLang );
}

function web_determinaIdioma(){
	if(localStorage){
		var lsLang = localStorage.getItem('langJs_currentLang');
		if (lsLang != null && lsLang != "null"){
			window.lang.change(lsLang);
		}
	}else{
		var lsLang = obteValorURL("hl");
		window.lang.change(lsLang);		
		jQuery("a[id^='hl_']").each(function(index){
			var _href=jQuery(this).attr('href');
			_href.indexOf('?') == -1 ? jQuery(this).attr('href',_href+'?hl='+lsLang): jQuery(this).attr('href',_href+'&hl='+lsLang);
			
		});
				
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
	if(!$.cookie('uid') || $.cookie('uid').indexOf('random')!=-1){
		tipus_user = t_user_random;
	}else{
		tipus_user = t_user_loginat;
	}
}

function logoutUser(){
	if (isRandomUser($.cookie('uid'))){
		deleteRandomUser({uid: $.cookie('uid')});
	}
	var redirect = "/index.html";
	if(isGeolocalUser()){
		redirect = "/geolocal.html";
	}
	$.removeCookie('uid', { path: '/' });
	$.removeCookie('tipusEntitat', { path: '/' });
	$.removeCookie('token', { path: '/' });
	doLogout().then(function(results){
		if(results.status==='OK'){
			$.removeCookie('uid', { path: '/' });
			$.removeCookie('tipusEntitat', { path: '/' });
			$.removeCookie('token', { path: '/' });
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
		'							onClick="_gaq.push([\'_trackEvent\', \'mapa\', \'inici sessio\', \'modal inici mapa\']);">Inicia la sessió</button>'+
		'					<button lang="ca" type="button" class="btn bt_orange"'+ 
		'							onClick="_gaq.push([\'_trackEvent\', \'mapa\', \'registre\', \'modal inici mapa\']);">Crea un compte</button>'+
		'					<button id="btn-guest" lang="ca" type="button" class="btn btn-default" data-dismiss="modal"'+ 
		'							onClick="_gaq.push([\'_trackEvent\', \'mapa\', \'guest\', \'modal inici mapa\']);">Més tard</button>'+
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
	if($.cookie('tipusEntitat')){
		if($.inArray(parseInt($.cookie('tipusEntitat')),TIPUS_ENTITATS_GEOLOCAL) != -1){
			isGeolocal = true;
		}
	}
	return isGeolocal;
}

function cambiarTitle(){
	if($.cookie('tipusEntitat')){
		if(isGeolocalUser()){
			$('.brand-txt').text("InstaMaps.GeoLocal");
			$('.navbar-brand').prop('href','/geolocal.html');
		}else{
			$('.brand-txt').text("InstaMaps");
			$('.navbar-brand').prop('href','/index.html');
		}
	}
}
