/**
 * Funcionalitat de canvis de fons dels mapes
 * */
function addOpcionsFonsMapes() {
	
	addHtmlInterficieFonsMapes();
	
	jQuery('.div_gr3_fons div').on('click', function() {
		var fons = jQuery(this).attr('id');
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
		//_kmq.push.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user, 'tipus fons':fons}]);
		if (fons == 'topoMap') {
			map.topoMap();
		} else if (fons == 'topoMapGeo') {
			map.topoMapGeo();
		}else if (fons == 'topoGrisMap') {
			map.topoGrisMap();
		}else if (fons == 'ortoMap') {
			map.ortoMap();
		}else if (fons == 'hibridMap') {
			map.hibridMap();
		
		} else if (fons == 'colorMap') {
			gestionaPopOver(this);
		} 
	});
}


function creaPopOverMesFons() {
	
}

function creaPopOverMesFonsColor() {
	jQuery("#colorMap")
	.popover(
	{
		content : '<div id="div_menufons" class="div_gr3_fons">'
				+ '<div id="terrainMap" lang="ca" data-toggle="tooltip" title="Terreny" data-lang-title="Terreny" class="div_fons_4"></div>'
				+ '<div id="alcadaMap" lang="ca" data-toggle="tooltip" title="Model d\'elevacions" data-lang-title="Model d\'elevacions" class="div_fons_15"></div>'
				+ '<div id="historicOrtoMap46" lang="ca" data-toggle="tooltip" title="Ortofoto històrica Catalunya 1946" data-lang-title="Ortofoto històrica Catalunya 1946" class="div_fons_14"></div>'
				+ '<div id="historicOrtoMap" lang="ca" data-toggle="tooltip" title="Ortofoto històrica Catalunya 1956-57" data-lang-title="Ortofoto històrica Catalunya 1956-57" class="div_fons_11"></div>'
				+ '<div id="historicMap" lang="ca" data-toggle="tooltip" title="Mapa històric Catalunya 1936" data-lang-title="Mapa històric Catalunya 1936" class="div_fons_10"></div>'
				+ '<div id="topoGrisMap" lang="ca" data-toggle="tooltip" title="Topogràfic gris" data-lang-title="Topogràfic gris" class="div_fons_2"></div>'
				+ '<div id="nit" lang="ca" data-toggle="tooltip" title="Nit" data-lang-title="Nit" class="div_fons_6"></div>'
				+ '<div id="sepia" lang="ca" data-toggle="tooltip" title="Sèpia" data-lang-title="Sèpia" class="div_fons_7"></div>'
				+ '<div id="zombie" lang="ca" data-toggle="tooltip" title="Zombie" data-lang-title="Zombie" class="div_fons_8"></div>'
				+ '<div id="orquidea" lang="ca" data-toggle="tooltip" title="Orquídea" data-lang-title="Orquídea" class="div_fons_9"></div>'
				+ '<div id="naturalMap" lang="ca" data-toggle="tooltip" title="Natural" data-lang-title="Natural" class="div_fons_16"></div>'
				+ '<div id="divadminMap" lang="ca" data-toggle="tooltip" title="Divisions administratives" data-lang-title="Divisions administratives" class="div_fons_17"></div>'
				+ '</div>',
		container : 'body',
		html : true,
		trigger : 'manual',
		selector: '[rel="popover"]'
	});
	
	jQuery("#colorMap").on('show.bs.popover',function(){
		jQuery(this).attr('data-original-title','');
	});
	
	// please note, that IE11 now returns undefined again for window.chrome
	var isChromium = window.chrome,
	    vendorName = window.navigator.vendor;
	
	jQuery("#colorMap").on('click',function(e){
		jQuery('#div_menufons [data-toggle="tooltip"]').tooltip({
			placement : 'bottom',
			container : 'body'
		});
		
		$('.popover:not(.in)').hide().detach();
		
		if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
		   // is Google chrome
		  jQuery(".popover").css('height','150px');
		  jQuery(".popover").css('width','185px');
		} else { 
			 jQuery(".popover").css('height','150px');
			 jQuery(".popover").css('width','185px');
		}
				
		jQuery(".popover").css('background-color','rgba(60, 62, 54, 0.9)');
		jQuery(".popover").css('z-index','1');
	});
	
	jQuery(document).on('click', "#div_menufons div", function(e) {
		jQuery('#div_menufons [data-toggle="tooltip"]').tooltip('hide');
		var fons = jQuery(this).attr('id');
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
		//_kmq.push.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user, 'tipus fons':fons}]);
		if (fons == 'topoGrisMap') {
			map.topoGrisMap();
			jQuery("#colorMap").popover('hide');
		}else if (fons == 'historicOrtoMap') {
			map.historicOrtoMap();
			jQuery("#colorMap").popover('hide');
		}else if (fons == 'historicMap') {
			map.historicMap();
			jQuery("#colorMap").popover('hide');
		} else if (fons == 'terrainMap') {
			map.terrainMap();
			jQuery("#colorMap").popover('hide');
		}else if (fons == 'historicOrtoMap46') {
			map.historicOrtoMap46();
			jQuery("#colorMap").popover('hide');
		}else if (fons == 'alcadaMap') {
			map.alcadaMap();
			jQuery("#colorMap").popover('hide');
		}else if (fons == 'naturalMap') {
			map.naturalMap();
			jQuery("#colorMap").popover('hide');
		}else if (fons == 'divadminMap') {
			map.divadminMap();
			jQuery("#colorMap").popover('hide');
		}else{
			map.colorMap(fons);			
			jQuery("#colorMap").popover('hide');
		}
	});
}

function addHtmlInterficieFonsMapes(){
	
	jQuery("#funcio_fonsMapes").append(
	'	<h5 lang="ca">Escollir el mapa de fons</h5>'+
	'		<div class="add_costat_r2">'+
	'	</div>'+
	'	<div class="div_gr3_fons">'+
	'		<div id="topoMap" lang="ca" class="div_fons_1" data-toggle="tooltip" data-lang-title="Topogràfic" title="Topogràfic"></div>'+
	'		<div id="topoMapGeo" lang="ca" class="div_fons_12" data-toggle="tooltip" data-lang-title="Simple" title="Simple"></div>'+
	'		<div id="ortoMap" lang="ca" class="div_fons_3" data-toggle="tooltip" data-lang-title="Imatge" title="Imatge"></div>'+
	'		<div id="hibridMap" lang="ca" class="div_fons_13" data-toggle="tooltip" data-lang-title="Mapa híbrid" title="Mapa híbrid"></div>'+
	'		<div id="colorMap" lang="ca" class="div_fons_5 pop" data-toggle="tooltip" data-lang-title="Més mapes de fons" title="Més mapes de fons"></div>'+
	'	</div>'		
	);
	
	$('.div_gr3_fons [data-toggle="tooltip"]').tooltip({placement : 'bottom',container : 'body'});
	/*
	$('#div_mesfons').tooltip({placement : 'right',container : 'body',title : window.lang.convert('Més mapes de fons')});
	$('.div_gr3_fons #topoMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Topogràfic')});
	$('.div_gr3_fons #topoMapGeo').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Simple')});
	$('.div_gr3_fons #ortoMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Imatge')});
	$('.div_gr3_fons #hibridMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Mapa híbrid')});
	$('.div_gr3_fons #colorMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Més mapes de fons')});	
	*/
}

