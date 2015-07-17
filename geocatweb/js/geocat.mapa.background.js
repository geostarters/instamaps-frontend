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
	jQuery("#div_mesfons")
	.popover(
	{
		content : '<div id="div_menu_mesfons" class="div_gr3_fons">'
			+ '<div id="historicOrtoMap" data-toggle="tooltip" title="'+window.lang.convert('Ortofoto històrica Catalunya 1956-57')+'" lang="ca"  class="div_fons_11"></div>'	
			+ '<div id="historicMap" data-toggle="tooltip" title="'+window.lang.convert('Mapa històric Catalunya 1936')+'" lang="ca"  class="div_fons_10"></div>'
				
				+ '</div>',
		container : 'body',
		html : true,
		trigger : 'manual'
	});
	
	var optB = {
			placement : 'bottom',
			container : 'body'
	};	
	jQuery('#div_menu_mesfons div').tooltip(optB);
	
//	$('.div_gr3_fons #historicOrtoMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Ortofoto històrica Catalunya 1956-57')});
//	$('.div_gr3_fons #historicMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Mapa històric Catalunya 1936')});	

	jQuery(document).on('click', "#div_menu_mesfons div", function(e) {
		var fons = jQuery(this).attr('id');
		if (fons == 'historicMap') {
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
			//_kmq.push.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user, 'tipus fons':fons}]);
			map.historicMap();
		}
		if (fons == 'historicOrtoMap') {
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
			//_kmq.push.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user, 'tipus fons':fons}]);
			map.historicOrtoMap();
		}
		
	});
		
	jQuery("#div_mesfons").on('click',function(e){
		$('.popover:not(.in)').hide().detach();
		jQuery(this).popover('toggle');
		jQuery(".popover").css('left', pLeft());
	});
}

function creaPopOverMesFonsColor() {
	
	jQuery("#colorMap")
	.popover(
	{
		content : '<div id="div_menufons" class="div_gr3_fons">'
				+ '<div id="terrainMap" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Terreny')+'" class="div_fons_4"></div>'
				+ '<div id="alcadaMap" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Model d\'elevacions')+'" class="div_fons_15"></div>'
				+ '<div id="historicOrtoMap46" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Ortofoto històrica Catalunya 1946')+'" class="div_fons_14"></div>'
				+ '<div id="historicOrtoMap" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Ortofoto històrica Catalunya 1956-57')+'" class="div_fons_11"></div>'
				+ '<div id="historicMap" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Mapa històric Catalunya 1936')+'" class="div_fons_10"></div>'
				+ '<div id="topoGrisMap" lang="ca" data-toggle="tooltip" title="'+window.lang.convert('Topogràfic gris')+'" class="div_fons_2"></div>'
				+ '<div id="nit" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Nit')+'" class="div_fons_6"></div>'
				+ '<div id="sepia" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Sèpia')+'" class="div_fons_7"></div>'
				+ '<div id="zombie" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Zombie')+'" class="div_fons_8"></div>'
				+ '<div id="orquidea" lang="ca"  data-toggle="tooltip" title="'+window.lang.convert('Orquídea')+'" class="div_fons_9"></div>'
				+'<div></div>'
				+'<div></div>'
				+ '</div>',
		container : 'body',
		html : true,
		trigger : 'manual',
		selector: '[rel="popover"]'
	});
	var optB = {
			placement : 'bottom',
			container : 'body'
	};	
	jQuery('#div_menufons div').tooltip(optB);
	
//	$('#div_menu_fons #topoGrisMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Topogràfic gris')});
//	$('.div_gr3_fons #nit').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Nit')});
//	$('.div_gr3_fons #sepia').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Sèpia')});
//	$('.div_gr3_fons #zombie').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Zombie')});
//	$('.div_gr3_fons #orquidea').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Orquídea')});
	
	
	
	jQuery("#colorMap").on('click',function(e){
		  $('.popover:not(.in)').hide().detach();
		  jQuery(".popover").css('height','145px');
		  jQuery(".popover").css('background-color','rgba(60, 62, 54, 0.9)');
	});
	
	jQuery(document).on('click', "#div_menufons div", function(e) {
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
	//'		<div lang="ca" id="div_mesfons" class="icon-add white pop"></div>'+
	'	</div>'+
	'	<div class="div_gr3_fons">'+
	'		<div id="topoMap" lang="ca" class="div_fons_1"></div>'+
	'		<div id="topoMapGeo" lang="ca" class="div_fons_12"></div>'+
	'		<!-- div id="topoGrisMap" lang="ca" data-toggle="tooltip" title="Topogràfic gris" class="div_fons_2"></div-->'+
	'		<div id="ortoMap" lang="ca" class="div_fons_3"></div>'+
	'		<div id="hibridMap" lang="ca" class="div_fons_13"></div>'+
	'		<div id="colorMap" lang="ca" class="div_fons_5 pop"></div>'+
	'	</div>'		
	);
	
	$('#div_mesfons').tooltip({placement : 'right',container : 'body',title : window.lang.convert('Més mapes de fons')});
	$('.div_gr3_fons #topoMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Topogràfic')});
	$('.div_gr3_fons #topoMapGeo').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Simple')});
	$('.div_gr3_fons #ortoMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Imatge')});
	$('.div_gr3_fons #hibridMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Mapa híbrid')});
	$('.div_gr3_fons #colorMap').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Més mapes de fons')});	
	
}

