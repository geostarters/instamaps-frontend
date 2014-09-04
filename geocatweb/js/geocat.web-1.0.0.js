
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
    else $("#ca").addClass("active");
    
	jQuery("#hl_contact").on('click', function() {
		jQuery(this).attr('href','mailto:instamapes@icgc.cat');
		
	});
    
    //dialeg expired
    jQuery('#dialog_session_expired').on('hidden.bs.modal', function (e) {
    	logoutUser();
    	//window.location.href = paramUrl.loginPage;
    });
    initCookies();
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
}

function checkUserLogin(){
	var uid = $.cookie('uid');
	if(!uid || isRandomUser(uid)){
		$("#menu_login").show();
		$("#menu_user").hide();
		$("#text_username").remove();
	}else {
		$("#menu_login").hide();
		$("#menu_user").show();	
//		$("#text_welcome").append("<span id=\"text_username\"> "+uid+"</span>");
		$("#text_username").text(" "+uid);
		var galeria_url = paramUrl.galeriaPage + "?private=1";
		$("#galeria a").attr('href', galeria_url);
	}
}

//function swapImageIn(e) {
//	this.src = this.src.replace("_", "_pujat");
//}
//function swapImageOut (e) {
//	this.src = this.src.replace("_pujat", "_");
//}

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
	//console.debug(lsLang);
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

//jQuery("#frm_email").submit(function(){ 
//	var correu_usuari=jQuery("#text_email").val(); 
////	alert("correu:"+correu_usuari);
//	  if( isValidEmailAddress( correu_usuari ) ) {
//	  
//			  jQuery.ajax({
//					url: 'http://geocat02.icc.local:8080/geocat/registreEmail.action?',
//					data: {email: correu_usuari},
//					method: 'post',
//					dataType: 'jsonp',
//				}).done(function(results){
//					//console.debug(results);
//					if(results.OK){
//						jQuery('#div_msg').html('<div class="alert alert-success my-alert" lang="ca"> <strong>Rebut!!</strong>  Correu enviat correctament. Et mantindrem informat. Gr&agrave;cies!!</div>');
//					}else{
//						jQuery('#div_msg').html('<div class="alert alert-error my-alert" lang="ca"> <strong>Ups!!</strong> '+results.ERROR+'</div>');
//					}
//					//deepEqual(results, {OK: "Password updated."}, "Passed:"+ results);
//					//start();
//				}).fail(function(results){
////					console.debug(results);
//					//ok( false, "Fail!:" + results);
//					//start();
//					jQuery('#div_msg').html('<div class="alert alert-error" lang="ca"> <strong>Ups!!</strong> Error </div>');
//			  
//				});
//	   
//	  }else{		 
//		jQuery('#div_msg').html('<div class="alert alert-error" lang="ca"> <strong>Ups!!</strong> Sembla que <strong>'+correu_usuari+'</strong> no &eacute;s una adre&ccedil;a correcta</div>');  
//	 }
//  return false;
//  });


 


/////^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
//function isValidURL(str) {
//  var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
//    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
//    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
//    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
//    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
//    '(\#[-a-z\d_]*)?$','i'); // fragment locater
//  if(!pattern.test(str)) {
////	    alert("Please enter a valid URL.");
//    return false;
//  } else {
//    return true;
//  }
//}

//estava a geocat.mapa.wms


//(http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png)
//  (?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*\.(?:jpg|gif|png))(?:\?([^#]*))?(?:#(.*))?




/*
function obteValorURL(name){
	    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	    results = regex.exec(location.search);
	    return results == null ? window.lang.currentLang : decodeURIComponent(results[1].replace(/\+/g, " "));
}*/

function logoutUser(){
	if (isRandomUser($.cookie('uid'))){
		deleteRandomUser({uid: $.cookie('uid')});
	}
	$.removeCookie('uid', { path: '/' });
	doLogout().then(function(results){
		if(results.status==='OK'){
			$.removeCookie('uid', { path: '/' });
			window.location.href="/index.html";
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

