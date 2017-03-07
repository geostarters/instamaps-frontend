jQuery(document).ready(function() {

	weball_tornarInici();	
	
//	$(".title-white", this).hover(swapImageIn, swapImageOut);
//  $(".img-hover", this).hover(swapImageIn, swapImageOut);

	$("#div_E").hover(function(){
		console.info("entro");
		$("#img_E").attr('src','share/img/Explora_pujat.jpg');
	},function(){
		$("#img_E").attr('src','share/img/Explora_.jpg');
		console.info("surt");	
	});
	
	jQuery("#hl_contact").on('click', function() {
		jQuery(this).attr('href','mailto:instamapes@icgc.cat');
		
	});
});

//function swapImageIn(e) {
//this.src = this.src.replace("_", "_pujat");
//}
//function swapImageOut (e) {
//this.src = this.src.replace("_pujat", "_");
//}

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
