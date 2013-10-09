
window.lang = new jquery_lang_js();


jQuery(document).ready(function() {

	

	
	web_roundCircles();
	weball_tornarInici();		
	window.lang.run();
		
	if(!localStorage){
		var lsLang = localStorage.getItem('langJs_currentLang');
		//console.info(lsLang);
		window.lang.change(lsLang);	
	}else{
		
		var lsLang =obteValorURL("hl");
		window.lang.change(lsLang);		
		jQuery("a[id^='hl_']").each(function(index){
			var _href=jQuery(this).attr('href');
			_href.indexOf('?') == -1 ? jQuery(this).attr('href',_href+'?hl='+lsLang): jQuery(this).attr('href',_href+'&hl='+lsLang);
			//console.info(jQuery(this).attr('href'));	
		});
				
	}
	
	
	
	


});

	

function web_roundCircles(){
	jQuery('#div_D').on('click', function() {
		document.location.href = "#row_D";
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
	
	jQuery(function () {
		jQuery(window).scroll(function () {
			if (jQuery(this).scrollTop() > 150) {
				jQuery('#back-top').fadeIn();
			} else {
				jQuery('#back-top').fadeOut();
			}
		});

		jQuery('#back-top button').click(function () {
			jQuery('body,html').animate({
				scrollTop: 0
			}, 800);
			return false;
		});
	});
}	
	
	
	
	
	
jQuery("#frm_email").submit(function(){ 
	var correu_usuari=jQuery("#text_email").val();  
	  if( isValidEmailAddress( correu_usuari ) ) {
	  
			  jQuery.ajax({
					url: 'http://geocat02.icc.local:8080/geocat/registreEmail.action?',
					data: {email: correu_usuari},
					method: 'post',
					dataType: 'jsonp',
				}).done(function(results){
					//console.debug(results);
					if(results.OK){
					jQuery('#div_msg').html('<div class="alert alert-success"> <strong>Rebut!!</strong>  Correu enviat correctament. Et mantindrem informat. Gràcies!!</div>');
					}else{
					jQuery('#div_msg').html('<div class="alert alert-error"> <strong>Ups!!</strong> '+results.ERROR+'</div>');
					}
					//deepEqual(results, {OK: "Password updated."}, "Passed:"+ results);
					//start();
				}).fail(function(results){
					//console.debug(results);
					//ok( false, "Fail!:" + results);
					//start();
					jQuery('#div_msg').html('<div class="alert alert-error"> <strong>Ups!!</strong> Error </div>');
			  
				});
	   
	  }else{  
		jQuery('#div_msg').html('<div class="alert alert-error"> <strong>Ups!!</strong> Sembla que <strong>'+correu_usuari+'</strong> no és una adreça correcta</div>');  
	 }
  return false;
  });
  
 function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}; 
  

function obteValorURL(name){
	
	    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	  
	    return results == null ? window.lang.currentLang : decodeURIComponent(results[1].replace(/\+/g, " "));
	
	
}


function changeLanguage(lang){
	
	window.lang.change(lang);
	
}

