var map, controlCapes;
var factorH = 50;
var factorW = 0;
var _htmlDadesObertes = [];
var capaUsrPunt, capaUsrLine, capaUsrPol,capaUsrActiva;
var mapConfig = {};
var dades1,dades2;
var estilP={'iconFons':'awesome-marker-web awesome-marker-icon-orange',
		'iconGlif':'fa fa-',
		'colorGlif':'#333333','fontsize':'14px','size':'28'};

jQuery(document).ready(function() {
	map = new L.IM_Map('map', {
		typeMap : 'topoMap',
		maxZoom : 19,
	// drawControl: true
	}).setView([ 41.431, 1.8580 ], 8);
	

	
	
var _minTopo=new L.TileLayer(URL_MQ, {minZoom: 0, maxZoom: 19, subdomains:subDomains});
	var miniMap = new L.Control.MiniMap(_minTopo, { toggleDisplay: true, autoToggleDisplay: true}).addTo(map);	
	
	
	L.control.scale({'metric':true,'imperial':false}).addTo(map);
	
	
	
	//iniciamos los controles
	initControls();
	
	if(typeof url('?businessid') == "string"){
		var data = {
			businessId: url('?businessid'),
			uid: $.cookie('uid')
		};
		getMapByBusinessId(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
				return false;
			}
			mapConfig = results.results;
			mapConfig.options = $.parseJSON( mapConfig.options );
			mapConfig.newMap = false;
			
			loadMapConfig(mapConfig).then(function(){
				avisDesarMapa();
			});
		},function(results){
			//window.location.href = paramUrl.loginPage;
		});
	}else{
		loadMapConfig(mapConfig).then(function(){
			mapConfig.newMap = true;
			avisDesarMapa();
		});
	}
	
	//carrega las capas del usuario
	var data = {uid: $.cookie('uid')};
	carregaDadesUsuari(data);
	
	jQuery('.bt_publicar').on('click',function(){
		$('#dialgo_publicar #nomAplicacio').removeClass("invalid");
		$( ".text_error" ).remove();
		$('#dialgo_publicar').modal('show');
	});
	
	jQuery('#dialgo_publicar .btn-primary').on('click',function(){
		publicarMapa();
	});
	
	jQuery('#dialgo_leave .btn-primary').on('click',function(){
		leaveMapa();
	});
	

}); // Final document ready

function addClicksInici() {
	jQuery('.bt_llista').on('click', function() {
		activaPanelCapes();
	});
	
	jQuery(document).on('click', function(e) {
        if(e.target.id.indexOf("popovercloseid" )!=-1)
        {
       	 var pop=e.target.id.split("#");
       	 var ddv="#"+pop[1];
       	 jQuery(ddv).popover('hide');
       	 //addCapaMunicipis();	        
        }

    });
}

function addOpcionsFonsMapes() {
	jQuery('.div_gr3 div').on('click', function() {
		var fons = jQuery(this).attr('id');
		if (fons == 'topoMap') {
			map.topoMap();
		} else if (fons == 'topoGrisMap') {
			map.topoGrisMap();
		} else if (fons == 'ortoMap') {
			map.ortoMap();
		} else if (fons == 'terrainMap') {
			map.terrainMap();
		} else if (fons == 'colorMap') {
			gestionaPopOver(this);
		} else if (fons == 'historicMap') {
			//gestionaPopOver(this);
		}
	});
}

function gestionaPopOver(pop) {
	jQuery('.popover').popover('hide');
	jQuery('.pop').not(pop).popover('hide');
	jQuery(pop).popover('toggle');
	jQuery(".popover").css('left', pLeft());
	jQuery('.popover-title').append('<span id="popovercloseid#'+jQuery(pop).attr('id')+'" class="glyphicon glyphicon-remove bt_tanca"></span>');
}

function addControlsInici() {
	sidebar = L.control.sidebar('sidebar', {
		position : 'left',
		closeButton : false
	});

	map.addControl(sidebar);
	setTimeout(function() {
		sidebar.show();
	}, 500);

	controlCapes = L.control.layers(null, null, {
		collapsed : false,
		id : 'div_capes'
	}).addTo(map);

	ctr_llistaCapes = L.control({
		position : 'topright'
	});
	ctr_llistaCapes.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'div_barrabotons btn-group-vertical');

		var btllista = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_llista');
		this._div.appendChild(btllista);
		btllista.innerHTML = '<span class="glyphicon glyphicon-th-list grisfort"></span>';

		var btcamera = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_captura');
		this._div.appendChild(btcamera);
		btcamera.innerHTML = '<span class="glyphicon glyphicon-camera grisfort"></span>';

		var btprint = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_print');
		this._div.appendChild(btprint);
		btprint.innerHTML = '<span class="glyphicon glyphicon-print grisfort"></span>';

		var btinfo = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_info');
		this._div.appendChild(btinfo);
		btinfo.innerHTML = '<span class="glyphicon glyphicon-info-sign grisfort"></span>';
		
		return this._div;
	};
	ctr_llistaCapes.addTo(map);

}

function redimensioMapa() {
	jQuery(window).resize(function() {
		factorH = jQuery('.navbar').css('height').replace(/[^-\d\.]/g, '');
		jQuery('#map').css('top', factorH + 'px');
		jQuery('#map').height(jQuery(window).height() - factorH);
		jQuery('#map').width(jQuery(window).width() - factorW);
	});
	jQuery(window).trigger('resize');
}

var opt = {
	placement : 'right',
	container : 'body'
};
var optB = {
	placement : 'bottom',
	container : 'body'
};

function addToolTipsInici() {
	//eines mapa
	$('.bt_llista').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("LLista de capes")
	});
	$('.bt_captura').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Capturar la vista del mapa")
	});
	$('.bt_print').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Imprimir la vista del mapa")
	});
	$('.bt_info').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Veure informació al fer clic sobre el mapa")
	});
	
	jQuery.map(jQuery('[data-toggle="tooltip"]'), function (n, i){
		var title = $(n).attr('title');
		if (title == ""){
			title = $(n).attr('data-original-title');
		}
		$(n).attr('data-original-title', window.lang.convert(title));
	    var title = $(n).attr('title', $(n).attr('data-original-title'));
	});
		
	$('.div_carrega_dades').tooltip(optB);
	$('.div_gr3 div').tooltip(optB);
	$('.div_gr2 div').tooltip(optB);
	$('.add_costat_r').tooltip(opt);
	$('.taronja').tooltip(opt);
	$('.white').tooltip(opt);
	$('#div_punt').tooltip(optB);
	$('#div_linia').tooltip(optB);
	$('#div_area').tooltip(optB);
	$('.bt_publicar').tooltip(opt);
}

function activaPanelCapes(obre) {
	if (obre) {
		jQuery('.leaflet-control-layers').animate({
			width : 'show'
		});

	} else {
		jQuery('.leaflet-control-layers').animate({
			width : 'toggle'
		});

	}
	var cl = jQuery('.bt_llista span').attr('class');
	if (cl.indexOf('grisfort') != -1) {
		jQuery('.bt_llista span').removeClass('grisfort');
		jQuery('.bt_llista span').addClass('greenfort');
	} else {
		jQuery('.bt_llista span').removeClass('greenfort');
		jQuery('.bt_llista span').addClass('grisfort');
	}
}





function changeDefaultLineStyle(canvas_linia){
var estilTMP={
        weight: 3,       
        color: '#FFC400',
        dashArray: '3'
       
    };

estilTMP.color=canvas_linia.strokeStyle;
estilTMP.weight=canvas_linia.lineWidth;
//estilTMP.dashArray='3';

if(objEdicio.obroModalFrom=="creaCapa"){
	 drawControl.options.polyline.shapeOptions= estilTMP;
		
		
	}

return estilTMP;


/*
	if(estil.tipus=="pol"){
	
	
	
	
		drawControl.options.polygon.shapeOptions.fillColor=estil.fillStyle;
		drawControl.options.polygon.shapeOptions.fillOpacity=estil.opacity;
		drawControl.options.polygon.shapeOptions.weight=estil.lineWidth;
		drawControl.options.polygon.shapeOptions.color=estil.strokeStyle;
	}else{
		drawControl.options.polyline.shapeOptions.color=estil.strokeStyle;
		drawControl.options.polyline.shapeOptions.weight=estil.lineWidth;
		drawControl.options.polyline.shapeOptions.dashArray='3';
	}
	*/
	
}


function changeDefaultAreaStyle(canvas_pol){
	var estilTMP={
	        weight: 3,
	        opacity: 1,
	        color: '#FFC400',
	        dashArray: '3',
	        fillColor: '#FFC400',
	        fillOpacity: 0.5
	    };
	
	estilTMP.fillColor=canvas_pol.fillStyle;
	estilTMP.fillOpacity=canvas_pol.opacity;
	estilTMP.weight=canvas_pol.lineWidth;
	estilTMP.color=canvas_pol.strokeStyle;
	 
	
	 if(objEdicio.obroModalFrom=="creaCapa"){
		 drawControl.options.polygon.shapeOptions= estilTMP;
			
			
		}
	
	return estilTMP;
	
	/*
		if(estil.tipus=="pol"){
		
		
		
		
			drawControl.options.polygon.shapeOptions.fillColor=estil.fillStyle;
			drawControl.options.polygon.shapeOptions.fillOpacity=estil.opacity;
			drawControl.options.polygon.shapeOptions.weight=estil.lineWidth;
			drawControl.options.polygon.shapeOptions.color=estil.strokeStyle;
		}else{
			drawControl.options.polyline.shapeOptions.color=estil.strokeStyle;
			drawControl.options.polyline.shapeOptions.weight=estil.lineWidth;
			drawControl.options.polyline.shapeOptions.dashArray='3';
		}
		*/
		
	}


function changeDefaultPointStyle(estilP) {
	
	
	var puntTMP= new L.AwesomeMarkers.icon({
		icon : '',
		markerColor : 'orange',
		iconAnchor : new L.Point(14, 42),
		iconSize : new L.Point(28, 42),
		iconColor : '#000000',
		prefix : 'fa'
	});
	
	var _iconFons=estilP.iconFons.replace('awesome-marker-web awesome-marker-icon-','');
	var _iconGlif=estilP.iconGlif;	
	var cssText="";
	
	if(_iconGlif.indexOf("fa fa-")!=-1){
		_iconGlif=estilP.iconGlif.replace('fa fa-','');
	};
	
	var _colorGlif=estilP.colorGlif;
	
	if(_iconFons.indexOf("_r")!=-1){ //sóc rodó		
		var num=estilP.size;
		puntTMP.options.shadowSize = new L.Point(1, 1);
		var tt=estilP.fontsize;
		if(tt=="9px"){
			cssText="font9";			
		}else if(tt=="11px"){
			cssText="font11";
		}else if(tt=="12px"){
			cssText="font12";
		}else if(tt=="14px"){
			cssText="font14";
		}else if(tt=="15px"){
			cssText="font15";
			
		}
		
		
		if(_iconGlif==""){//no tin glif
			
			//var num=parseInt(jQuery('#cmb_mida_Punt').val());
			
			
			puntTMP.options.iconAnchor= new L.Point(parseInt(num/2), parseInt(num/2));
			puntTMP.options.iconSize = new L.Point(num, num);		
		}else{
			//puntTMP.options.iconAnchor= new L.Point(14, 14);
			//puntTMP.options.iconSize = new L.Point(28, 28);
			
			puntTMP.options.iconAnchor= new L.Point(parseInt(num/2), parseInt(num/2));
			puntTMP.options.iconSize = new L.Point(num, num);	
			
			}
		
		}else{ // sóc punt
		puntTMP.options.iconAnchor= new L.Point(14, 42);
		puntTMP.options.iconSize = new L.Point(28, 42);
		puntTMP.options.shadowSize = new L.Point(36, 16);
		
	}
	
	
	
	puntTMP.options.icon=_iconGlif + " "+cssText;
	puntTMP.options.markerColor=_iconFons;
	puntTMP.options.iconColor=_colorGlif;
	
	if(objEdicio.obroModalFrom=="creaCapa"){
	
		defaultPunt=puntTMP;
		
	}
	
	return puntTMP;
	
} 

function addDialegsEstils() {
	jQuery('#div_mes_punts').on("click", function(e) {	
		obrirMenuModal('#dialog_estils_punts','toggle','creaCapa');
		
	});

	jQuery('#div_mes_linies').on("click", function(e) {			
		obrirMenuModal('#dialog_estils_linies','toggle','creaCapa');

	});
	
	jQuery('#div_mes_arees').on("click", function(e) {	
		
		obrirMenuModal('#dialog_estils_arees','toggle','creaCapa');
	});
	
	jQuery('#dialog_estils_punts .btn-success').on('click',function(){		
		
		
		if(objEdicio.obroModalFrom=="creaCapa"){
			jQuery('#div_punt').removeClass();
			jQuery('#div_punt').addClass(jQuery('#div_punt0').attr('class'));
			jQuery('#div_punt').css('font-size',jQuery('#div_punt0').css('font-size'));
			jQuery('#div_punt').css('width',jQuery('#div_punt0').css('width'));
			jQuery('#div_punt').css('height',jQuery('#div_punt0').css('height'));
			
			
			jQuery('#div_punt').css('color',estilP.colorGlif);			
			changeDefaultPointStyle(estilP);	
			
		}else if (objEdicio.obroModalFrom=="creaPopup"){
			
			
			//console.info(objEdicio.featureID);
			
			map._layers[objEdicio.featureID].setIcon(changeDefaultPointStyle(estilP));
			
			
			
		}else{
			//pensat per tematics
			
			
		}
		
		jQuery('#dialog_estils_punts').modal('toggle');				
	});
	
	jQuery('#dialog_estils_linies .btn-success').on('click',function(){		
		
		if(objEdicio.obroModalFrom=="creaCapa"){
			addGeometryInitL(document.getElementById("cv_linia")); 		
			jQuery('#dialog_estils_linies').modal('toggle');		
			//changeDefaultVectorStyle(canvas_linia);
			changeDefaultLineStyle(canvas_linia);
		}else if (objEdicio.obroModalFrom=="creaPopup"){
			
			
			map._layers[objEdicio.featureID].setStyle(changeDefaultLineStyle(canvas_linia));
			
			
			
		}else{
			
		}
		jQuery('#dialog_estils_linies').modal('toggle');			
	});
	
	jQuery('#dialog_estils_arees .btn-success').on('click',function(){		
		if(objEdicio.obroModalFrom=="creaCapa"){
			
		addGeometryInitP(document.getElementById("cv_pol"));  
		jQuery('#dialog_estils_arees').modal('toggle');		
		//changeDefaultVectorStyle(canvas_pol);
		changeDefaultAreaStyle(canvas_pol);
		
		}else if (objEdicio.obroModalFrom=="creaPopup"){
			
			
			map._layers[objEdicio.featureID].setStyle(changeDefaultAreaStyle(canvas_pol));
			
			
			
		}else{
			
		}
		jQuery('#dialog_estils_arees').modal('toggle');	
				
	});
	
	jQuery('#dialog_estils_punts .btn-default').on('click',function(){			
		jQuery('#dialog_estils_punts').modal('toggle');
	})
	
	var hihaGlif=false;	
	jQuery(document).on('click', ".bs-punts li", function(e) {
		jQuery(".bs-punts li").removeClass("estil_selected");
		jQuery('#div_punt0').removeClass();
		estilP.iconFons=jQuery('div', this).attr('class');
		
		
		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
		jQuery(this).addClass("estil_selected");	
		
		
		if(jQuery('div', this).attr('class').indexOf('_r')!=-1){
			
			
			//if(!hihaGlif){
			jQuery('#dv_cmb_punt').show();
			//}else{
			//	jQuery('#dv_cmb_punt').hide();	
			var vv=jQuery('#cmb_mida_Punt').val();
				jQuery('#div_punt0').css('width',vv+'px');
				 jQuery('#div_punt0').css('height',vv+'px');
				 jQuery('#div_punt0').css('font-size',(vv/2)+"px");
				 estilP.fontsize=(vv/2)+"px";
				 estilP.size=vv;
			//}
			
		}else{
			jQuery('#dv_cmb_punt').hide();
			jQuery('#div_punt0').css('width','28px');
			 jQuery('#div_punt0').css('height','42px');	
			 jQuery('#div_punt0').css('font-size',"14px");
			 estilP.fontsize="14px";
		}
		
		
	});
	
	
	 jQuery(document).on('change','#cmb_mida_Punt', function(e) { 
	    	
		 jQuery('#div_punt0').css('width',this.value+"px");
		 jQuery('#div_punt0').css('height',this.value+"px");
		 jQuery('#div_punt0').css('font-size',(this.value/2)+"px");
		 estilP.fontsize=(this.value/2)+"px";
		 estilP.size=this.value;
	    });
	
	
	
	
	jQuery(document).on('click', ".bs-glyphicons li", function(e) {
		jQuery(".bs-glyphicons li").removeClass("estil_selected");
		jQuery('#div_punt0').removeClass();
		estilP.iconGlif=jQuery('span', this).attr('class');
		
		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);

		jQuery(this).addClass("estil_selected");
	});
}

function creaPopOverMesFons() {
	jQuery("#div_mesfons")
	.popover(
	{
		content : '<div id="div_menu_mesfons" class="div_gr3">'
				+ '<div id="historicMap" lang="ca"  data-toggle="tooltip" title="Catalunya 1936" class="div_fons_10"></div>'
				+ '</div>',
		container : 'body',
		html : true,
		trigger : 'manual'
	});
	
	jQuery('#div_menu_mesfons div').tooltip(optB);

	jQuery(document).on('click', "#div_menu_mesfons div", function(e) {
		var fons = jQuery(this).attr('id');
		if (fons == 'historicMap') {
			map.historicMap();
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
		content : '<div id="div_menufons" class="div_gr3">'
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
		map.colorMap(fons);
	});
}

function creaPopOverMevasDades(){
	jQuery(".div_dades_usr").popover(
		{
			content : '<ul class="nav nav-tabs etiqueta">'
					+ '<li><a href="#id_mysrvj" data-toggle="tab" id="#id_serveisv">Serveis vector</a></li>'
					+ '<li><a href="#id_mysrvw" data-toggle="tab">Serveis WMS</a></li>'
					+ '</ul>'
					+ '<div class="tab-content">'
					+ '<div class="tab-pane fade" id="id_mysrvj"></div>'
					+ '<div class="tab-pane fade" id="id_mysrvw"></div>'
					+ '</div>',
			container : 'body',
			html : true,
			trigger : 'manual'
	});
}

function loadPopOverMevasDades(){
	jQuery(".div_dades_usr").on('click', function() {
		var data = {uid: $.cookie('uid')};
		gestionaPopOver(this);		
				
		var source1 = jQuery("#meus-wms-template").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1(dades1[0]);
		
		var source2 = jQuery("#meus-tematic-template").html();
		var template2 = Handlebars.compile(source2);
		var html2 = template2(dades2[0]);
		
		jQuery("#id_mysrvw").append(html1);
		jQuery("#id_mysrvj").append(html2);
		
		jQuery(".usr_wms_layer").on('click', function(event) {
			event.preventDefault();
			var _this = jQuery(this);
			var data = {
				uid: $.cookie('uid'),
				businessId: mapConfig.businessId,
				servidorWMSbusinessId: _this.data("businessid"),
				layers: _this.data("layers"),
				calentas:false,
				activas:false,
				visibilitats:true
			};
			
			addServerToMap(data).then(function(results){
				console.debug(results);
				mapConfig = results.results;
			});
			
		});
	
		jQuery(".usr_tematic_layer").on('click', function(event) {
			event.preventDefault();
			var _this = jQuery(this);
			
			carregarCapa(_this.data("businessid"));
		
		});
		
		jQuery("span.glyphicon-remove").on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			var _this = jQuery(this);

			//console.debug(_this.data("businessid"));
			
			var data = {
				uid: $.cookie('uid'),
				businessId: _this.data("businessid")
			};

			deleteTematicLayerAll(data).then(function(results){
				console.debug(results);
				if (results.status == "OK"){
					_this.parent().remove();
				}
			});
		});
		
	});
	
}

function refrescaPopOverMevasDades(){
	//console.debug("refrescaPopOverMevasDades");
	//carrega las capas del usuario
	var data = {uid: $.cookie('uid')};
	jQuery.when(getAllServidorsWMSByUser(data), getAllTematicLayerByUid(data)).then(function(results1, results2){
		dades1=results1;
		dades2=results2;
	},function(results){
		//window.location.href = paramUrl.loginPage;
	});
	
}

function carregarCapa(businessId){
	var data = {
			uid: $.cookie('uid'),
			businessId: businessId
		};
		
		getTematicLayerByBusinessId(data).then(function(results){
			console.debug(results);
			//TODO
			//agregar la capa tematica al mapa. Leer los features y cargarlos
			var capaPunts=null;
			var capaLinies=null;
			var capaPoligons=null;
			if (results.status=="OK") {
			for (geometry in results.results.geometries.features.features){
				var geometria=results.results.geometries.features.features[geometry].geometry;
				var coordinates=""+geometria.coordinates;
				
				var tipus=geometria.type;
				alert("TIPUS: "+tipus);
				if (tipus=="Point") {
					alert("AKI");
					var coords=coordinates.split(",");
					alert(coords[0]+","+coords[1]);
					if (capaPunts==null) {
						capaPunts = new L.FeatureGroup();
						var latlng = L.latLng(coords[0],coords[1]);
						var circle=L.circleMarker(latlng,200);
						capaPunts.addLayer(circle);
					}
					else {
						var latlng = L.latLng(coords[0],coords[1]);
						var circle=L.circleMarker(latlng,200);
						capaPunts.addLayer(circle);
					}
					
					capaPunts.addTo(map);
				}
				if (tipus=="LineString"){
					var coords=coordinates.split(",");
					if (capaLinies==null){
						capaLinies = new L.FeatureGroup();
						var i=0;
						var j=0;
						var llistaPunts=[];
						while (i< coords.length){
							var c1=coords[i];
							var c2=coords[i+1];
							var punt=new L.LatLng(c1, c2);
							llistaPunts[j]=punt;
							i=i+2;
							j++;
						}
						 var polyline =  L.polyline(llistaPunts, {color: 'red'})
						
						capaLinies.addLayer(polyline);
					}
					else {
						var i=0;
						var j=0;
						var llistaPunts=[];
						while (i< coords.length){
							var c1=coords[i];
							var c2=coords[i+1];
							var punt=new L.LatLng(c1, c2);
							llistaPunts[j]=punt;
							i=i+2;
							j++;
						}
						 var polyline =  L.polyline(llistaPunts, {color: 'red'})
						
						capaLinies.addLayer(polyline);
					}
					
					capaLinies.addTo(map);
				}
				if (tipus=="Polygon") {
					var coords=coordinates.split(",");
					if (capaPoligons==null){
						capaPoligons = new L.FeatureGroup();
						var i=0;
						var j=0;
						var llistaPunts=[];
						while (i< coords.length){
							var c1=coords[i];
							var c2=coords[i+1];
							var punt=new L.LatLng(c1, c2);
							llistaPunts[j]=punt;
							i=i+2;
							j++;
						}
						var polygon = new L.Polygon(llistaPunts,{color: 'red'});
						capaPoligons.addLayer(polygon);
					}
					else {
						var i=0;
						var j=0;
						var llistaPunts=[];
						while (i< coords.length){
							var c1=coords[i];
							var c2=coords[i+1];
							var punt=new L.LatLng(c1, c2);
							llistaPunts[j]=punt;
							i=i+2;
							j++;
						}
						var polygon = new L.Polygon(llistaPunts,{color: 'red'});
						capaPoligons.addLayer(polygon);
						
					}
					capaPoligons.addTo(map);
				}
			}
			
				if (capaPunts!=null) controlCapes.addOverlay(capaPunts,results.results.title, true);
				if (capaLinies!=null) controlCapes.addOverlay(capaLinies,results.results.title, true);
				if (capaPoligons!=null) controlCapes.addOverlay(capaPoligons,results.results.title, true);
				activaPanelCapes(true);
				
			}
			else alert(results.status);
		});
}

function creaPopOverDadesExternes() {
	jQuery(".div_dades_ext").on('click', function() {

		//gestionaPopOver(this);
		$('#dialog_dades_ex').modal('show');
		
		jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			var tbA = e.target.attributes.href.value;

			if (tbA == "#id_do") {
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlDadesObertes.join(' '));

				jQuery(tbA+" a.label").on('click', function(e) {
					if(e.target.id !="id_do"){
						addCapaDadesObertes(e.target.id,jQuery(e.target).text());
					}
				});
			}else if(tbA == "#id_srvw"){
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlServeisWMS.join(' '));
				jQuery(tbA+" a.label").on('click', function(e) {
					if(e.target.id !="id_srvw"){
					//addCapaDadesObertes(e.target.id,jQuery(e.target).text());
						console.info("hola");
					}
				});	
			}
			
		});
	})
}

function pLeft() {
	return jQuery(".leaflet-left").css('left');
}

var capaDadaOberta;

function addCapaDadesObertes(dataset,nom_dataset) {

	var url = paramUrl.dadesObertes + "dataset=" + dataset;

	var estil_do = retornaEstilaDO(dataset);
	capaDadaOberta = new L.GeoJSON.AJAX(url, {
		onEachFeature : popUp,
		nom : dataset,
		tipus : 'Marker',
		businessId : '-1',
		dataType : "jsonp",
		pointToLayer : function(feature, latlng) {
			if(dataset.indexOf('meteo')!=-1){
				return L.marker(latlng, {icon:L.icon({					
					    iconUrl: feature.style.iconUrl,
					    iconSize:     [44, 44], 
					    iconAnchor:   [22, 22], 				   
					    popupAnchor:  [-3, -3] 
				})});
			}else if(dataset.indexOf('incidencies')!=-1){
				var inci=feature.properties.descripcio_tipus;
				var arr = ["Obres", "Retenció", "Cons", "Meterologia" ];
				var arrIM = ["st_obre.png", "st_rete.png", "st_cons.png", "st_mete.png" ];
				var imgInci="/geocatweb/img/"+arrIM[jQuery.inArray( inci, arr )];
				return L.marker(latlng, {icon:L.icon({					
				    iconUrl: imgInci,
				    iconSize:     [30, 26], 
				    iconAnchor:   [15, 13], 				   
				    popupAnchor:  [-3, -3] 
			})});
			}else if(dataset.indexOf('cameres')!=-1){
				return L.marker(latlng, {icon:L.icon({					
				    iconUrl: "/geocatweb/img/st_came.png",
				    iconSize:     [30, 26], 
				    iconAnchor:   [15, 13], 				   
				    popupAnchor:  [-3, -3] 
			})});
			}else{
			return L.circleMarker(latlng, estil_do);
			}
		}
	});

	capaDadaOberta.addTo(map)
	controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
	activaPanelCapes(true);
	// capaDadaOberta.on('layeradd',objecteUserAdded)

}

function addCapaMunicipis() {
	var url = "/llibreries/dades/json/municipis.geojson";
	capaDadaOberta = new L.GeoJSON.AJAX(url, {
		onEachFeature : popUp,
		nom : "Minicipis",
		tipus : 'Poligon',
		businessId : '-1',
		style:{"color": "#ff7800","weight": 1,"opacity": 0.65}
	});
	capaDadaOberta.addTo(map)
	controlCapes.addOverlay(capaDadaOberta, "Municipis", true);
	activaPanelCapes(true);
}

function loadingMap(accio){	
	if(accio){		
		if(jQuery('.search-load').css('display')!='block'){
			jQuery('.search-load').show();
		}	
	}else{
		jQuery('.search-load').hide();
	}	
}

function popUp(f, l) {
	var out = [];
	if (f.properties) {
		for (key in f.properties) {
			if(key!='gml_id'){
				if(key=='Name' || key=='Description'){
					out.push(f.properties[key]);
				}else if(key=='link' || key=='Web'){				
					ll=f.properties[key];
					if(ll.indexOf('.gif')!=-1){
						out.push('<img width="100" src="'+ll+'"/>');
					}else{
						out.push('<b>'+key +'</b>:<a target="_blank" href="'+ll+'"/>'+ll+'</a>');
					}
				}else{
					out.push("<b>"+key + "</b>: " + f.properties[key]);
				}
			}
		}
		l.bindPopup(out.join("<br />"));
	}
}

function generaLListaDadesObertes() {
	getLListaDadesObertes().then(function(results) {
		_htmlDadesObertes.push('<div><ul class="bs-dadesO">');
		$.each(results.dadesObertes, function(key, dataset) {
			_htmlDadesObertes.push('<li><a class="label label-explora" lang="ca" title="Afegir capa" href="#" id="'
				+ dataset.dataset
				+ '">'
				+ dataset.text
				+ '</a>'
				+ '<a target="_blank" lang="ca" title="Informació de les dades" href="'+dataset.urn+'"><span class="glyphicon glyphicon-info-sign info-explora"></span></a>'							
				+'</li>');
		});
		_htmlDadesObertes.push('</ul></div>');
	});
}

function loadMapConfig(mapConfig){
	//console.debug(mapConfig);
	var dfd = jQuery.Deferred();
	if (!jQuery.isEmptyObject( mapConfig )){
		jQuery('#businessId').val(mapConfig.businessId);
		//TODO ver los errores de leaflet al cambiar el mapa de fondo 
		//cambiar el mapa de fondo a orto y gris
		if (mapConfig.options.fons != 'topoMap'){
			map.setActiveMap(mapConfig.options.fons);
			map.setMapColor(mapConfig.options.fonsColor);
			//map.gestionaFons();
		}
			
		if (mapConfig.options.bbox){
			var bbox = mapConfig.options.bbox.split(",");
			var southWest = L.latLng(bbox[1], bbox[0]),
		    northEast = L.latLng(bbox[3], bbox[2]),
		    bounds = L.latLngBounds(southWest, northEast);
			map.fitBounds( bounds ); 
		}
	
		//carga las capas en el mapa
		jQuery.each(mapConfig.servidorsWMS, function(index, value){
			
			if (value.epsg == "4326"){
				value.epsg = L.CRS.EPSG4326;
			}else if (value.epsg == "25831"){
				value.epsg = L.CRS.EPSG25831;
			}else if (value.epsg == "23031"){
				value.epsg = L.CRS.EPSG23031;
			}else{
				value.epsg = map.crs;
			}
			
			var newWMS = L.tileLayer.wms(value.url, {
			    layers: value.layers,
			    format: value.imgFormat,
			    transparent: value.transparency,
			    version: value.version,
			    opacity: value.opacity,
			    crs: value.epsg,
			});
			
			if (value.capesActiva == true || value.capesActiva == "true"){
				newWMS.addTo(map);
			}
			
			controlCapes.addOverlay(newWMS, value.serverName, true);
			
		});
				
	}else{
		
	}
	
	var source = $("#map-properties-template").html();
	var template = Handlebars.compile(source);
	var html = template(mapConfig);
	$('#frm_publicar').append(html);
	
	$('.make-switch').bootstrapSwitch();
	//$('.make-switch').bootstrapSwitch('setOnLabel', "<i class='glyphicon glyphicon-ok glyphicon-white'></i>");		
	//$('.make-switch').bootstrapSwitch('setOffLabel', "<i class='glyphicon glyphicon-remove'></i>");
		
	dfd.resolve();
	
	return dfd.promise();
}

function publicarMapa(){
	if(isBlank($('#dialgo_publicar #nomAplicacio').val())){
		$('#dialgo_publicar #nomAplicacio').addClass("invalid");
		$('#dialgo_publicar #nomAplicacio').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
		return false;
	}
		
	var options = {};
	options.tags = jQuery('#dialgo_publicar #optTags').val();
	options.description = jQuery('#dialgo_publicar #optDescripcio').val();
	options.bbox = map.getBounds().toBBoxString();
	options.llegenda = jQuery('#llegenda_chk').bootstrapSwitch('state');
	options.layers = jQuery('#layers_chk').bootstrapSwitch('state');
	options.social = jQuery('#social_chk').bootstrapSwitch('state');
	options.fons = map.getActiveMap();
	options.fonsColor = map.getMapColor();
		
	console.debug(options);
	
	options = JSON.stringify(options);
	
	var newMap = true;
	
	if (jQuery('#businessId').val() != ""){
		newMap = false;
	}
	
	var data = {
		nom: jQuery('#dialgo_publicar #nomAplicacio').val(),
		uid: $.cookie('uid'),
		visibilitat: 'O',
		tipusApp: 'vis',
		options: options
	}
	
	if (newMap){
		createMap(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO Mensaje de error
			}else{
				mapConfig = results.results;
				mapConfig.options = $.parseJSON( mapConfig.options );
				jQuery('#businessId').val(mapConfig.businessId);
				mapConfig.newMap = false;
				
			}
		});
	}else{
		data.businessId = jQuery('#businessId').val();
		updateMap(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO Mensaje de error
			}else{
				mapConfig = results.results;
				mapConfig.options = $.parseJSON( mapConfig.options );
				$('#dialgo_publicar').modal('hide');
				mapConfig.newMap = false;
			}	
		});
	}
}

/*TODO estas funciones estaban pensadas para prevenir al usaurio al abandonar 
la pagína sin publicar el mapa. La idea era que al entrar en un mapa nuevo
se creara el mapa en la BD y que el si el usuario abandona la página sin publicar se 
mostrara el mensaje de advertencia y se borrara el mapa.
*/
function avisDesarMapa(){
	//console.debug(mapConfig.newMap);
	if (mapConfig.newMap){
		jQuery(window).on('beforeunload',function(event){
			//$('#dialgo_leave').modal('show');
			//event.stopPropagation();
			//event.preventDefault();
			//console.debug("antes de ir e");
			//return "Mensaje de aviso que no se muestra en Firefox";
		});
	}else{
		jQuery(window).off('beforeunload',function(){
			return true;
		});
	}
}

function leaveMapa(){
	console.debug("borrar el mapa e ir a la galeria");
}

function initControls(){
	addControlsInici();
	addClicksInici();
	addOpcionsFonsMapes();
	addToolTipsInici();
	redimensioMapa();
	creaPopOverDadesExternes();
	creaPopOverMevasDades();
	generaLListaDadesObertes();
	creaAreesDragDropFiles();
	creaPopOverMesFonsColor();
	tradueixMenusToolbar();
	addDrawToolbar();
	activaEdicioUsuari();
	addDialegsEstils();
	addControlCercaEdit();
	creaPopOverMesFons();
	generaLlistaServeisWMS();
}

function carregaDadesUsuari(data){
	//console.debug("carregaDadesUsuari");
	//console.debug(data);
	jQuery.when(getAllServidorsWMSByUser(data), getAllTematicLayerByUid(data)).then(function(results1, results2){
		if (results1[0].status == "ERROR"){
			//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
			return false;
		}
		dades1=results1;
		dades2=results2;
		//console.debug(dades1);
		//console.debug(dades2);
		loadPopOverMevasDades();
	},function(results){
		//window.location.href = paramUrl.loginPage;
	});
}