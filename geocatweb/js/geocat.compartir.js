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
	
	if (v_url.indexOf("mapacolaboratiu=si")>-1) v_url=v_url.replace("&mapacolaboratiu=si","");
	
	
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
				urlToShare: results.id
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
	if (v_url.indexOf("mapacolaboratiu=si")>-1) v_url=v_url.replace("&mapacolaboratiu=si","");
	
	shortUrl(v_url).then(function(results){
		jQuery('#socialShare_visor').share({
			networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
			//orientation: 'vertical',
			//affix: 'left center',
			theme: 'square',
			urlToShare: results.id
		});
	});	
	
	jQuery('.share-square a').attr('target','_blank');
	
	/*
	 * se declara el evento en el control 
	jQuery("#dv_bt_Share").on('click',function(e){
		posaClassActiu('#span_bt_Share');
		jQuery('#socialShare_visor').css('top', (e.clientY - 30) +'px');
		jQuery('#socialShare_visor').css('left', (e.clientX + 20) +'px');
		jQuery('#socialShare_visor').toggle();
		aturaClick(e);
	});
	*/
}

function posaClassActiu(_element){
	var cl = jQuery(_element).attr('class');
	if (cl.indexOf('grisfort') != -1) {
		jQuery(_element).removeClass('grisfort');
		jQuery(_element).addClass('greenfort');
	} else {
		jQuery(_element).removeClass('greenfort');
		jQuery(_element).addClass('grisfort');
	}
}

function addHtmlInterficieCompartirMapa(){
	jQuery("#funcio_compartir").append(
			'<div id="socialShare" class="div_gr5_social">'+
				'<h5 lang="ca">Compartir</h5>'+
			'</div>'
	);
}