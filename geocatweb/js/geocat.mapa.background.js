/**
 * Funcionalitat de canvis de fons dels mapes
 * */

function addOpcionsFonsMapes() {
	
	addHtmlInterficieFonsMapes();
	
	jQuery('.div_gr3_fons div').on('click', function() {
		var fons = jQuery(this).attr('id');
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
		_kmq.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user, 'tipus fons':fons}]);
		if (fons == 'topoMap') {
			map.topoMap();
		} else if (fons == 'topoMapGeo') {
			map.topoMapGeo();
		}else if (fons == 'topoGrisMap') {
			map.topoGrisMap();
		}else if (fons == 'ortoMap') {
			map.ortoMap();
		} else if (fons == 'terrainMap') {
			map.terrainMap();
		} else if (fons == 'colorMap') {
			gestionaPopOver(this);
		} else if (fons == 'historicMap') {
		
		}
	});
}

function creaPopOverMesFons() {
	jQuery("#div_mesfons")
	.popover(
	{
		content : '<div id="div_menu_mesfons" class="div_gr3_fons">'
			+ '<div id="historicOrtoMap" lang="ca"  data-toggle="tooltip" title="Ortofoto històrica Catalunya 1956-57" class="div_fons_11"></div>'	
			+ '<div id="historicMap" lang="ca"  data-toggle="tooltip" title="Mapa històric Catalunya 1936" class="div_fons_10"></div>'
				
				+ '</div>',
		container : 'body',
		html : true,
		trigger : 'manual'
	});
	
	jQuery('#div_menu_mesfons div').tooltip(optB);

	jQuery(document).on('click', "#div_menu_mesfons div", function(e) {
		var fons = jQuery(this).attr('id');
		if (fons == 'historicMap') {
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
			_kmq.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user, 'tipus fons':fons}]);
			map.historicMap();
		}
		if (fons == 'historicOrtoMap') {
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
			_kmq.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user, 'tipus fons':fons}]);
			map.historicOrtoMap();
		}
		
	});
		
	jQuery("#div_mesfons").on('click',function(e){
		gestionaPopOver(this);
		
	});
}

function creaPopOverMesFonsColor() {
	jQuery("#colorMap")
	.popover(
	{
		content : '<div id="div_menufons" class="div_gr3_fons">'
				+ '<div id="topoGrisMap" lang="ca" data-toggle="tooltip" title="Topogràfic gris" class="div_fons_2"></div>'
				+ '<div id="nit" lang="ca"  data-toggle="tooltip" title="Nit" class="div_fons_6"></div>'
				+ '<div id="sepia" lang="ca"  data-toggle="tooltip" title="Sèpia" class="div_fons_7"></div>'
				+ '<div id="zombie" lang="ca"  data-toggle="tooltip" title="Zombie" class="div_fons_8"></div>'
				+ '<div id="orquidea" lang="ca"  data-toggle="tooltip" title="Orquídea" class="div_fons_9"></div>'
				+ '</div>',
		container : 'body',
		html : true,
		trigger : 'manual'
	});

	jQuery('#div_menufons div').tooltip(optB);

	jQuery(document).on('click', "#div_menufons div", function(e) {
		var fons = jQuery(this).attr('id');
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
		_kmq.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user, 'tipus fons':fons}]);
		if (fons == 'topoGrisMap') {
			map.topoGrisMap();
		}else{
			map.colorMap(fons);			
		}
	});
}

function addHtmlInterficieFonsMapes(){
	
	jQuery("#funcio_fonsMapes").append(
	'	<h5 lang="ca">Escollir el mapa de fons</h5>'+
	'		<div class="add_costat_r2">'+
	'		<div lang="ca" id="div_mesfons" data-toggle="tooltip" title="Més mapes de fons" class="icon-add white pop"></div>'+
	'	</div>'+
	'	<div class="div_gr3_fons">'+
	'		<div id="topoMap" lang="ca" data-toggle="tooltip" title="Topogràfic" class="div_fons_1"></div>'+
	'		<div id="topoMapGeo" lang="ca" data-toggle="tooltip" title="Simple" class="div_fons_12"></div>'+
	'		<!-- div id="topoGrisMap" lang="ca" data-toggle="tooltip" title="Topogràfic gris" class="div_fons_2"></div-->'+
	'		<div id="ortoMap" lang="ca" data-toggle="tooltip" title="Imatge" class="div_fons_3"></div>'+
	'		<div id="terrainMap" lang="ca" data-toggle="tooltip" title="Terreny" class="div_fons_4"></div>'+
	'		<div id="colorMap" lang="ca" data-toggle="tooltip" title="Combinacions de color" class="div_fons_5 pop"></div>'+
	'	</div>'		
	);
	
}