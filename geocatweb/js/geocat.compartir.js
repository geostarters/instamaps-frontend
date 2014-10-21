/**
 * Funcionalitat compartir en xarxes socials
 */

function addCompartirMapa(){
	
	addHtmlInterficieCompartirMapa();
	
	var v_url = window.location.href;
	if (!url('?id')){
		v_url += "&id="+jQuery('#userId').val();
	}
	v_url = v_url.replace('localhost',DOMINI);
	v_url = v_url.replace('mapa','visor');	
	
	//Compartir en xarxes socials
	if (isRandomUser($.cookie('uid'))){
	
		jQuery(window).on('beforeunload',function(event){
			return 'Are you sure you want to leave?';
		});							
	
		jQuery('#socialShare').share({
			networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
			theme: 'square'
		});
		
		jQuery('#socialShare .pop-social').off('click').on('click', function(event){
			event.preventDefault();
			jQuery('.modal').modal('hide');
			$('#dialgo_messages').modal('show');
			$('#dialgo_messages .modal-body').html(window.lang.convert(msg_noguarda));
		});
	}else{
		shortUrl(v_url).then(function(results){

			jQuery('#socialShare').share({
				networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
				theme: 'square',
				urlToShare: results.data.url
			});
			
			jQuery('#socialShare .pop-social').on('click', function(event){
//				console.debug("social share click, publiquem!");
				publicarMapa(true);
			});				
		});
	}	
	
}

function addCompartirVisor(){
	
	var v_url = window.location.href;
	if(v_url.indexOf('localhost')!=-1){
		v_url = v_url.replace('localhost',DOMINI);
	}
	shortUrl(v_url).then(function(results){
		jQuery('#socialShare_visor').share({
			networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
			orientation: 'vertical',
			affix: 'left center',
			urlToShare: results.data.url
		});
	});	
}

function addHtmlInterficieCompartirMapa(){
	jQuery("#funcio_compartir").append(
			'<div id="socialShare" class="div_gr5_social">'+
				'<h5 lang="ca">Compartir</h5>'+
			'</div>'
	);
}