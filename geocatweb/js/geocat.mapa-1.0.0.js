var map, controlCapes;
var factorH = 50;
var factorW = 0;
var _htmlDadesObertes = [];
var capaUsrPunt, capaUsrLine, capaUsrPol,capaUsrActiva;
var mapConfig = {};
var dades1,dades2;
var initMevesDades = false;
var download_layer;
var estilP={'iconFons':'awesome-marker-web awesome-marker-icon-orange',
		'iconGlif':'fa fa-',
		'colorGlif':'#333333','fontsize':'14px','size':'28'};
var default_line_style = {
    weight: 3,       
    color: '#FFC400',
    dashArray: '3'
};
var default_area_style = {
    weight: 3,
    opacity: 1,
    color: '#FFC400',
    dashArray: '3',
    fillColor: '#FFC400',
    fillOpacity: 0.5
};
var default_point_style = {
	icon : '',
	markerColor : 'orange',
	divColor:'transparent',
	iconAnchor : new L.Point(14, 42),
	iconSize : new L.Point(28, 42),
	iconColor : '#000000',
	prefix : 'fa'
};

jQuery(document).ready(function() {
	map = new L.IM_Map('map', {
		typeMap : 'topoMap',
		maxZoom : 19,
		//drawControl: true
	}).setView([ 41.431, 1.8580 ], 8);
	
	var _minTopo=new L.TileLayer(URL_MQ, {minZoom: 0, maxZoom: 19, subdomains:subDomains});
	var miniMap = new L.Control.MiniMap(_minTopo, { toggleDisplay: true, autoToggleDisplay: true}).addTo(map);	
	
	L.control.scale({'metric':true,'imperial':false}).addTo(map);
	
	//iniciamos los controles
	initControls();
	
	if(typeof url('?businessid') == "string"){
		if (!$.cookie('uid')){
			window.location.href = paramUrl.loginPage;
		}
		
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
			$('#nomAplicacio').html(mapConfig.nomAplicacio);
			
			loadMapConfig(mapConfig).then(function(){
				avisDesarMapa();
			});
		},function(results){
			window.location.href = paramUrl.loginPage;
		});
	}else{
		if (!$.cookie('uid')){
			mapConfig.newMap = true;
			createNewMap();
			avisDesarMapa();
		}else{
			//TODO 
			jQuery('#dialgo_leave').modal('show');
			createRandomUser().then(function(results){
				if (results.status==='OK'){
					var user_login = results.results.uid;
					var pass_login = "user1234";
					doLogin(user_login, pass_login).then(function(results){
						if(results.status==='OK'){
							jQuery.cookie('uid', user_login, {path:'/'});
							window.location="/geocatweb/mapa.html";
						}				
					});
				}
			});
			
			jQuery(window).on('beforeunload',function(event){
				deleteRandomUser({uid: $.cookie('uid')});
			});
			
		}	
		
		/*
		loadMapConfig(mapConfig).then(function(){
			mapConfig.newMap = true;
			avisDesarMapa();
		});
		*/
	}
	
	//carrega las capas del usuario si esta loginat
	if ($.cookie('uid')){
		var data = {uid: $.cookie('uid')};
		carregaDadesUsuari(data);
	}
		
	jQuery('.bt_publicar').on('click',function(){
		$('#dialgo_publicar #nomAplicacio').removeClass("invalid");
		$( ".text_error" ).remove();
		$('#dialgo_publicar').modal('show');
		var urlMap = url('protocol')+'://'+url('hostname')+url('path')+'?businessId='+jQuery('#businessId').val();
		$('#urlMap').val(urlMap);
		$('#iframeMap').val('<iframe width="700" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'" ></iframe>');
	});
	
	jQuery('#dialgo_publicar .btn-primary').on('click',function(){
		publicarMapa();
	});
	
	jQuery('#dialgo_leave .btn-primary').on('click',function(){
		leaveMapa();
	});
	
	//botons tematic
	jQuery('#st_Color').on('click',function(){
		showTematicLayersModal(tem_simple);
	});
	
	jQuery('#st_Tema').on('click',function(){
		showTematicLayersModal(tem_clasic);
	});

//	$('#add_twitter_layer').click(function(){
//		$('#twitter-collapse').toggle()();
//	});
	
//	$('#twitter-collapse').hide();
//	
//	$('#btn-add-twitter-layer').click(function(){
//		addTwitterLayer(jQuery("#hashtag_twitter_layer").val());
//	});
	
	$('#nomAplicacio').editable({
		type: 'text',
		mode: 'inline',
		success: function(response, newValue) {
			var data = {
			 	businessId: url('?businessid'), 
			 	nom: newValue, 
			 	uid: $.cookie('uid')
			}


			updateMapName(data).then(function(results){
				if(results.status!='OK') $('#nomAplicacio').html(results.results.nom);
			},function(results){
				$('#nomAplicacio').html(mapConfig.nomAplicacio);				
			});	
		}

	});
	//$.fn.editable.defaults.mode = 'inline';
	$('.leaflet-remove').click(function() {
		alert( "Handler for .click() called." );
	});	
	
	jQuery('#socialShare').share({
	        networks: ['email','facebook',/*'googleplus',*/'twitter','linkedin','pinterest'],
	        theme: 'square',
//	        title: 'InstaMapes',
//	        urlToShare: 'http://www.google.com'
//	        urlToShare: 'http://localhost/geocatweb/mapa.html?businessId='+url('?businessid')
	 });	
	  
	jQuery('#socialShare').on('click', function(evt){
			evt.preventDefault();
			console.debug('on click social');
//			var $thisIndex = jQuery(this).index();
//			var socialId = "";
//			switch($thisIndex){
//				case 0:
//					socialId = "email";
//					break;
//				case 1:
//					socialId = "facebook";
//					break;
//				case 2:
//					socialId = "googleplus";
//					break;
//				case 3:
//					socialId = "twitter";
//					break;
//				case 4:
//				socialId = "linkedin";
//				break;
//				case 5:
//					socialId = "pinterest";
//					break;
//			}
			
			
//			var url = 'http://localhost/geocatweb/mapa.html'+$('#permalink').attr('href');
//			
//			shortUrl(url).then(function(results){
//				$('#socialShare').share('refresh',{
//														url: results.data.url, 
//														text: $(document).attr('title'), 
//														pageDesc: window.lang.convert("InstaMapes")
//														}
//									).then(function(){
//				
//										var $this = $('.pop').get( $thisIndex );
//										window.open(jQuery($this).attr('href'),'t','toolbar=0,resizable=1,status=0,width=640,height=528');
//				});
//				
//				return false;
//				
//			}); 		
//			console.debug('Entra a on click!');
	});
		
		
//JESS
		//$.fn.editable.defaults.mode = 'inline';
		
		jQuery('#select-download-format').change(function() {	
			var ext = jQuery(this).val();
			if ((ext=="KML#.kml")||(ext=="GPX#.gpx")){
			jQuery("#select-download-epsg").val("EPSG:4326").attr('disabled',true);
			}else{
				jQuery("#select-download-epsg").attr('disabled',false);	
			}
		});		
		
		$('#bt_download_accept').on('click', function(evt){
			var formatOUT = $('#select-download-format').val();
			var epsgOUT = $('#select-download-epsg').val();
			var filename = $('#input-download-name').val();
			var layer_GeoJSON = download_layer.layer.toGeoJSON();
			for(var i=0;i<layer_GeoJSON.features.length;i++){
				layer_GeoJSON.features[i].properties.tipus = "downloaded";
			}

			var data = {
					cmb_formatOUT: formatOUT,
					cmb_epsgOUT: epsgOUT,
					layer_name: filename,
					fileIN: JSON.stringify(layer_GeoJSON)
			};
			
			getDownloadLayer(data).then(function(results){
				results = results.trim();
				if (results == "ERROR"){
					//alert("Error 1");
					$('#modal-body-download-error').show();
					$('#modal-body-download').hide();
					$('#modal_download_layer .modal-footer').hide();
					$('#modal_download_layer').modal('show');
				}else{
					window.location.href = GEOCAT02+results;
				}
			},function(results){
				$('#modal-body-download-error').show();
				$('#modal-body-download').hide();
				$('#modal_download_layer .modal-footer').hide();
				$('#modal_download_layer').modal('show');
			});
			
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
	
	
	
	jQuery('#st_Heat').on('click',function(e) {
	
			createHeatMap(controlCapes._layers[63])
		});
	
	
	jQuery('#st_Clust').on('click',function(e) {
		
		creaClusterMap(controlCapes._layers[63])
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

	controlCapes = L.control.orderlayers(null, null, {
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
		
//		var btsave = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_save');
//		this._div.appendChild(btsave);
//		btsave.innerHTML = '<span class="glyphicon glyphicon-floppy-disk grisfort"></span>';		

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
	$('.bt_save').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Desar el mapa actual")
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
	
	//cercador
	jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.convert('Cercar llocs a Catalunya ...'));
	jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.convert('Cercar llocs a Catalunya ...'));
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
	var estilTMP = default_line_style;







	estilTMP.color=canvas_linia.strokeStyle;
	estilTMP.weight=canvas_linia.lineWidth;


	if(objEdicio.obroModalFrom=="creaCapa"){
		 drawControl.options.polyline.shapeOptions= estilTMP;
	}

	return estilTMP;














}

function changeDefaultAreaStyle(canvas_pol){
	var estilTMP= default_area_style;








	
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

function createFeatureAreaStyle(style){
	var estilTMP= default_area_style;
	estilTMP.fillColor=style.color;
	estilTMP.fillOpacity=(style.opacity/100);
	estilTMP.weight=style.borderWidth;
	estilTMP.color=style.borderColor;
	return estilTMP;
}

function changeDefaultPointStyle(estilP) {

	var puntTMP= new L.AwesomeMarkers.icon(default_point_style);
















	
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
		puntTMP.options.divColor=estilP.divColor;
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
			puntTMP.options.iconAnchor= new L.Point(parseInt(num/2), parseInt(num/2));
			puntTMP.options.iconSize = new L.Point(num, num);		
			puntTMP.options.icon="";
		}else{
			puntTMP.options.iconAnchor= new L.Point(parseInt(num/2), parseInt(num/2));
			puntTMP.options.iconSize = new L.Point(num, num);	
			puntTMP.options.icon=_iconGlif + " "+cssText;
		}
		
	}else{ // sóc punt
		puntTMP.options.iconAnchor= new L.Point(14, 42);
		puntTMP.options.iconSize = new L.Point(28, 42);
		puntTMP.options.shadowSize = new L.Point(36, 16);
		puntTMP.options.divColor='transparent';
		puntTMP.options.icon=_iconGlif + " "+cssText;
	}
	
	

	puntTMP.options.markerColor=_iconFons;
	puntTMP.options.iconColor=_colorGlif;
	
	if(objEdicio.obroModalFrom=="creaCapa"){
		defaultPunt=puntTMP;
	}
	
	return puntTMP;
} 

function createFeatureMarkerStyle(style){
	var puntTMP= new L.AwesomeMarkers.icon(default_point_style);
	puntTMP.options.iconColor = style.simbolColor;
	puntTMP.options.icon = style.simbol;
	puntTMP.options.markerColor = style.marker;
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

			
			jQuery('#div_punt').css('background-color',estilP.divColor);	
			
			
			changeDefaultPointStyle(estilP);	
			
		}else if (objEdicio.obroModalFrom=="creaPopup"){
			

								// console.info(map._layers[objEdicio.featureID]);
			alert("Atenció problema amb tipus punt Awson i circle")
			map._layers[objEdicio.featureID].setIcon(changeDefaultPointStyle(estilP));
		}else if (objEdicio.obroModalFrom.from=="simpleTematic"){
			changeTematicLayerStyle(objEdicio.obroModalFrom, changeDefaultPointStyle(estilP));


		}else{
			console.debug(objEdicio.obroModalFrom);

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
		}else if (objEdicio.obroModalFrom.from=="simpleTematic"){
			changeTematicLayerStyle(objEdicio.obroModalFrom, changeDefaultLineStyle(canvas_linia));
		}else{
			console.debug(objEdicio.obroModalFrom);

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
		}else if (objEdicio.obroModalFrom.from=="simpleTematic"){
			changeTematicLayerStyle(objEdicio.obroModalFrom, changeDefaultAreaStyle(canvas_pol));
		}else{
			console.debug(objEdicio.obroModalFrom);

		}
		jQuery('#dialog_estils_arees').modal('toggle');	
				
	});
	
	jQuery('#dialog_estils_punts .btn-default').on('click',function(){			
		jQuery('#dialog_estils_punts').modal('toggle');
	})
	
	var hihaGlif=false;	
	
	jQuery(document).on('click', "#div_puntZ", function(e) {
		jQuery(".bs-punts li").removeClass("estil_selected");
		jQuery(this).addClass("estil_selected");
		estilP.iconFons=jQuery('div', this).attr('class');
		jQuery('#div_punt0').removeClass();
		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
		//if(!hihaGlif){
		jQuery('#dv_cmb_punt').show();
		//}else{
		//	jQuery('#dv_cmb_punt').hide();	
		var vv=jQuery('#cmb_mida_Punt').val();
			jQuery('#div_punt0').css('width',vv+'px');
			 jQuery('#div_punt0').css('height',vv+'px');
			 jQuery('#div_punt0').css('font-size',(vv/2)+"px");
			 jQuery('#div_punt0').css('background-color',jQuery('fill_color_punt').css('background-color'));
			 estilP.divColor=jQuery('.fill_color_punt').css('background-color');
			 jQuery('#div_punt0').css('background-color',estilP.divColor);
			 estilP.fontsize=(vv/2)+"px";
			 estilP.size=vv;
	
	
	});
	jQuery(document).on('click', ".bs-punts li", function(e) {
		
		jQuery(".bs-punts li").removeClass("estil_selected");
		jQuery("#div_puntZ").removeClass("estil_selected");
		
		
		jQuery('#div_punt0').removeClass();
		estilP.iconFons=jQuery('div', this).attr('class');
		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
		jQuery(this).addClass("estil_selected");	
		
		//if(jQuery('div', this).attr('class').indexOf('_r')!=-1){
			










		
			//}
		//}else{
			jQuery('#dv_cmb_punt').hide();
			jQuery('#div_punt0').css('width','28px');
			 jQuery('#div_punt0').css('height','42px');	
			 jQuery('#div_punt0').css('font-size',"14px");
			 estilP.divColor='transparent';
			 jQuery('#div_punt0').css('background-color',estilP.divColor);
			 estilP.fontsize="14px";

		//}
	});
	
	
	jQuery(document).on('change','#cmb_mida_Punt', function(e) { 
		
		if(jQuery('#div_puntZ').hasClass("estil_selected")){
			
			jQuery('#div_punt0').css('width',this.value+"px");
			jQuery('#div_punt0').css('height',this.value+"px");
			jQuery('#div_punt0').css('font-size',(this.value/2)+"px");
			estilP.fontsize=(this.value/2)+"px";
			estilP.size=this.value;
		}
	    jQuery('#div_punt9').css('width',this.value+"px");
		jQuery('#div_punt9').css('height',this.value+"px");
		jQuery('#div_punt9').css('font-size',(this.value/2)+"px");
		
		
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

function creaPopOverMevasDades2(){
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

function creaPopOverMevasDades(){	
	jQuery(".div_dades_usr").on('click', function() {
		$('#dialog_teves_dades').modal('show');
		
//		jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
//			var tbA = e.target.attributes.href.value;

//			if (tbA == "#id_sv") {
//				var source2 = jQuery("#meus-tematic-template").html();
//				var template2 = Handlebars.compile(source2);
//				var html2 = template2(dades2[0]);
//
//				jQuery("#id_sv").append(html2);
				
//			}else if(tbA == "#id_sw" /*&& !initMevesDades*/){
		//Per tenir actualitzar canvis: remove layers, add layers, etc
		jQuery("#id_sw").empty();		
		refrescaPopOverMevasDades();
				
		var source1 = jQuery("#meus-wms-template").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1(dades1[0]);				
		jQuery("#id_sw").append(html1);	
		
		initMevesDades = true;
		
		jQuery(".usr_wms_layer").on('click', function(event) {
			event.preventDefault();
			var _this = jQuery(this);
		
			var data = {
					uid: $.cookie('uid'),
					businessId: mapConfig.businessId,
					servidorWMSbusinessId: _this.data("businessid"),
					layers: _this.data("layers"),
					calentas:false,
					activas:true,
					visibilitats:true
			};						
			
			addServerToMap(data).then(function(results){
				if(results.status==='OK'){
					
					var value = results.results;
					
					if (value.epsg == "4326"){
						value.epsg = L.CRS.EPSG4326;
					}else if (value.epsg == "25831"){
						value.epsg = L.CRS.EPSG25831;
					}else if (value.epsg == "23031"){
						value.epsg = L.CRS.EPSG23031;
					}else{
						value.epsg = map.crs;
					}							
					
					if(_this.data("servertype") == t_wms){
						loadWmsLayer(value);
					}else if((_this.data("servertype") == t_dades_obertes)){
						loadDadesObertesLayer(value);
					}else if(_this.data("servertype") == t_xarxes_socials){
						
						var options = jQuery.parseJSON( value.options );
						if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
						else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
						else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
						
					}else if(_this.data("servertype") == t_tematic){
						loadTematicLayer(value);
					}							
					
					activaPanelCapes(true);
				}
		
			});					
		
		});					
				
		//Eliminem servidors
		jQuery("span.glyphicon-remove").on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			var _this = jQuery(this);
			var data = {
					uid: $.cookie('uid'),
					businessId: _this.data("businessid")
			};
			
			if(_this.data("servertype") == t_tematic){
				deleteTematicLayerAll(data).then(function(results){
					if (results.status == "OK"){
						_this.parent().remove();
//								refrescaPopOverMevasDades();
					}
				});
			}else{
				deleteServidorWMS(data).then(function(results){
					if (results.status == "OK"){
						_this.parent().remove();
//								refrescaPopOverMevasDades();
					}
				});						
			}
		});					
				
//			}
//		});
		
		jQuery(".usr_tematic_layer").on('click', function(event) {
			event.preventDefault();
			var _this = jQuery(this);
			carregarCapa(_this.data("businessid"));
		});
		
		jQuery("span.glyphicon-remove").on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			var _this = jQuery(this);
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
	
//	jQuery(".div_dades_usr").popover(
//		{
//			content : '<ul class="nav nav-tabs etiqueta">'
//					+ '<li><a href="#id_mysrvj" data-toggle="tab" id="#id_serveisv">Serveis vector</a></li>'
//					+ '<li><a href="#id_mysrvw" data-toggle="tab">Serveis WMS</a></li>'
//					+ '</ul>'
//					+ '<div class="tab-content">'
//					+ '<div class="tab-pane fade" id="id_mysrvj"></div>'
//					+ '<div class="tab-pane fade" id="id_mysrvw"></div>'
//					+ '</div>',
//			container : 'body',
//			html : true,
//			trigger : 'manual'
//	});

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
//				console.debug(results);
//				mapConfig = results.results;
				if(results.status==='OK'){
					var index = results.results.servidorsWMS.length -1;
					var value = results.results.servidorsWMS[index];
					
					 var newWMS = L.tileLayer.wms(value.url, {
						 layers: value.layers,
						 format: value.imgFormat,
						 transparent: value.transparency,
						 version: value.version,
						 opacity: value.opacity,
						 crs: value.epsg,
						 businessId: value.businessId//Jess
						 });
						 if (value.capesActiva == true || value.capesActiva == "true"){
						 newWMS.addTo(map);
						 }
						 controlCapes.addOverlay(newWMS, value.serverName, true); 				

					activaPanelCapes(true);						
				}
			
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
	console.debug("refrescaPopOverMevasDades");
	//carrega las capas del usuario
	var data = {uid: $.cookie('uid')};
	jQuery.when(getAllServidorsWMSByUser(data), getAllTematicLayerByUid(data)).then(function(results1, results2){
		dades1=results1;
		dades2=results2;
	},function(results){
		window.location.href = paramUrl.loginPage;
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
		var capaFeatures=new L.FeatureGroup();
		capaFeatures.options = {
			businessId : results.results.businessId,
			nom : results.results.nom,
//			zIndex : controlCapes._lastZIndex+1
		};
		var geometryType = results.results.geometryType;
		if (geometryType==t_marker){
			capaFeatures.options.tipus = t_marker;
		}else if (geometryType==t_polyline){
			capaFeatures.options.tipus = t_polyline;
		}else if (geometryType==t_polygon){
			capaFeatures.options.tipus = t_polygon;
		}else if (geometryType==t_mulitple){
			capaFeatures.options.tipus = t_mulitple;
		}
		
		//agregar la capa tematica al mapa. Leer los features y cargarlos
		if (results.status=="OK") {
			for (geometry in results.results.geometries.features.features){
				var geometria=results.results.geometries.features.features[geometry].geometry;
				var coordinates=""+geometria.coordinates;
				var tipus=geometria.type;
				if (tipus=="Point") {
					var coords=coordinates.split(",");
					var latlng = L.latLng(coords[0],coords[1]);
					var circle=L.circleMarker(latlng,200);
					capaFeatures.addLayer(circle);
				}
				if (tipus=="LineString"){
					var coords=coordinates.split(",");
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
					var polyline =  L.polyline(llistaPunts, {color: 'red'});						
					capaFeatures.addLayer(polyline);
				}
				if (tipus=="Polygon") {
					var coords=coordinates.split(",");
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
					capaFeatures.addLayer(polygon);				
				}
			}
			capaFeatures.addTo(map);
			
			if (capaFeatures!=null){
				controlCapes.addOverlay(capaFeatures,results.results.title, true);
			}
			
			activaPanelCapes(true);	
		}
		else {
			alert(results.status)
		};
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
				jQuery(tbA).html(_htmlDadesObertes.join(' ')+'<span class="label label-font">Font: <a target="_blank" href="http://www20.gencat.cat/portal/site/dadesobertes">Dades Obertes Gencat</a></span>');

				jQuery(tbA+" a.label-explora").on('click', function(e) {
					if(e.target.id !="id_do"){
						addCapaDadesObertes(e.target.id,jQuery(e.target).text());
					}
				});



				
			}else if(tbA == "#id_srvw"){
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlServeisWMS.join(' ')+'<span class="label label-font">Font: <a target="_blank" href="http://catalegidec.icc.cat">Cat&agrave;leg IDEC</a></span>');
				jQuery(tbA+" a.label-wms").on('click', function(e) {
					if(e.target.id !="id_srvw"){
						getCapabilitiesWMS(e.target.id,jQuery(e.target).text());
					}
				});	
				
			}else if(tbA == "#id_srvj"){
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlServeisJSON.join(' '));
				jQuery("#bt_connJSON").on('click', function(e) {
					if(e.target.id !="#id_srvj"){
						getServeiJSONP(jQuery("#txt_URLJSON").val());
					}
				});		
				
				
				
				
		
			}else if(tbA == "#id_xs"){//Jess
				
				jQuery(tbA).html(
						
						'<h4><a id="add_twitter_layer" href="javascript:toggleCollapseTwitter()" class="label label-primary">Twitter</a>&nbsp;'+
						'<a id="add_panoramio_layer" href="javascript:addPanoramioLayer();" class="label label-primary">Panoramio</a>&nbsp;'+
						'<a id="add_wikipedia_layer" href="javascript:addWikipediaLayer();" class="label label-primary">Wikipedia</a></h4>'+
						
						'<div id="twitter-collapse">'+
							'<div class="input-group">'+
			      				'<span class="input-group-addon">Hashtag</span>'+
			      				'<input id="hashtag_twitter_layer" type="text" class="form-control">'+
			      				'<span class="input-group-btn">'+
			      					'<button id="btn-add-twitter-layer" class="btn btn-primary editable-submit" type="button"><i class="glyphicon glyphicon-ok"></i></button>'+
			      				'</span>'+
				      		'</div>'+
			      		'</div>'						
				);
				
				$('#twitter-collapse').hide();
				$('#twitter-collapse .input-group .input-group-btn #btn-add-twitter-layer').click(function(){
					addTwitterLayer();
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

	var param_url = paramUrl.dadesObertes + "dataset=" + dataset;

	var estil_do = retornaEstilaDO(dataset);
	var lastZIndex = controlCapes._lastZIndex+1;
	capaDadaOberta = new L.GeoJSON.AJAX(param_url, {
		onEachFeature : popUp,
		nom : dataset,
		tipus : t_dades_obertes,

		businessId : '-1',
		dataType : "jsonp",
		zIndex: lastZIndex,
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
	if(typeof url('?businessid') == "string"){
		var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: nom_dataset,
				serverType: t_dades_obertes,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            epsg: '4326',
	            transparency: true,
	            visibilitat: 'O',
				options: '{"dataset":"'+dataset+'"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				capaDadaOberta.options.businessId = results.results.businessId;
				capaDadaOberta.addTo(map)
				controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
				activaPanelCapes(true);
			}
		});
		
	}else{

		capaDadaOberta.addTo(map)
		controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);













		activaPanelCapes(true);
	}
	//capaDadaOberta.on('layeradd',objecteUserAdded)


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
		_htmlDadesObertes.push('<div class="panel-danger"><ul class="bs-dadesO panel-heading">');
		$.each(results.dadesObertes, function(key, dataset) {
			_htmlDadesObertes.push('<li><a class="label-explora" lang="ca" title="Afegir capa" href="#" id="'
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
	console.debug(mapConfig);
	var dfd = jQuery.Deferred();
	if (!jQuery.isEmptyObject( mapConfig )){
		jQuery('#businessId').val(mapConfig.businessId);
		//TODO ver los errores de leaflet al cambiar el mapa de fondo 
		//cambiar el mapa de fondo a orto y gris
		if (mapConfig.options != null){
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
			
			//Si la capa es de tipus wms
			if(value.serverType == t_wms){
				loadWmsLayer(value);

			//Si la capa es de tipus dades obertes
			}else if(value.serverType == t_dades_obertes){
				loadDadesObertesLayer(value);

			//Si la capa es de tipus xarxes socials	
			}else if(value.serverType == t_xarxes_socials){
				
				var options = jQuery.parseJSON( value.options );
				
				if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
				else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
				else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
			
			}else if(value.serverType == t_tematic){


				loadTematicLayer(value);
			}
		});



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
				//update map name en el control de capas
				$('#nomAplicacio').text(mapConfig.nomAplicacio);
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
	//creaPopOverMevasDades();
	//generaLListaDadesObertes();
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

function addTwitterLayer(hashtag){
	var hashtag = $('#twitter-collapse .input-group #hashtag_twitter_layer').val();
	if(hashtag == null || hashtag == '') return;
	$('#twitter-collapse .input-group #hashtag_twitter_layer').val("");
	var lastZIndex = controlCapes._lastZIndex+1;//Jess
	var twitter = new L.Twitter({
						hashtag: hashtag,
						nom: 'twitter_'+ hashtag,
						zIndex: lastZIndex, 
						businessId: '-1',
						tipus: t_xarxes_socials
					});

	//Si el mapa existeix a BD
	if(typeof url('?businessid') == "string"){
		
		var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: 'twitter_'+ hashtag,
				serverType: t_xarxes_socials,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            epsg: '4326',
	            transparency: true,
	            visibilitat: 'O',
				options: '{"xarxa_social": "twitter", "hashtag": "'+hashtag+'"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				twitter.options.businessId = results.results.businessId;
				twitter.addTo(map);
				controlCapes.addOverlay(twitter, 'twitter_'+ hashtag, true);
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});

		
	}else{
		twitter.addTo(map);
		controlCapes.addOverlay(twitter, 'twitter_'+ hashtag, true);
		activaPanelCapes(true);
	}	
} 

function loadTwitterLayer(layer, hashtag){
	
	var twitter = new L.Twitter({
		hashtag: hashtag,
		nom: layer.serverName,
		tipus : layer.serverType,
		zIndex: parseInt(layer.capesOrdre), 
		businessId: layer.businessId
	});	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		twitter.addTo(map);
	}
	
	controlCapes.addOverlay(twitter, layer.serverName, true);		
}

function addPanoramioLayer(){
	
	var lastZIndex = controlCapes._lastZIndex+1;//Jess
	var panoramio = new L.Panoramio({
						maxLoad: 10, 
						maxTotal: 250, 
						zIndex: lastZIndex,
						nom : 'panoramio_'+lastZIndex,
						businessId: '-1',
						tipus: t_xarxes_socials
					});
	
	if(typeof url('?businessid') == "string"){
		var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: 'panoramio_'+ lastZIndex,
				serverType: t_xarxes_socials,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            epsg: '4326',
	            transparency: true,
	            visibilitat: 'O',
				options: '{"xarxa_social": "panoramio"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				panoramio.options.businessId = results.results.businessId;
				panoramio.addTo(map);
				controlCapes.addOverlay(panoramio, 'panoramio_'+ lastZIndex, true);
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});

		
	}else{
		panoramio.addTo(map);
		controlCapes.addOverlay(panoramio, 'panoramio_'+lastZIndex, true);
		activaPanelCapes(true);
	}	
}

function loadPanoramioLayer(layer){
	
	var panoramio = new L.Panoramio({
		maxLoad: 10, 
		maxTotal: 250, 
		zIndex: parseInt(layer.capesOrdre),
		nom : layer.serverName,
		tipus : layer.serverType,
		businessId: layer.businessId
	});	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		panoramio.addTo(map);
	}
	controlCapes.addOverlay(panoramio, layer.serverName, true);	
}

function addWikipediaLayer(){
	
	console.debug('Add wikipedia layer');
	var lastZIndex = controlCapes._lastZIndex+1;//Jess
	var wikipedia = new L.Wikipedia({
						zIndex: lastZIndex,
						nom : 'wikipedia_'+lastZIndex,
						businessId: '-1',
						tipus: t_xarxes_socials
					});
	
	if(typeof url('?businessid') == "string"){
		
		var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: 'wikipedia_'+ lastZIndex,
				serverType: t_xarxes_socials,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            epsg: '4326',
	            transparency: true,
	            visibilitat: 'O',
				options: '{"xarxa_social": "wikipedia"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				wikipedia.options.businessId = results.results.businessId;
				wikipedia.addTo(map);
				controlCapes.addOverlay(wikipedia, 'wikipedia_'+ lastZIndex, true);
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});

		
	}else{
		wikipedia.addTo(map);
		controlCapes.addOverlay(wikipedia, 'wikipedia_'+lastZIndex, true);
		activaPanelCapes(true);
	}	
}

function loadWikipediaLayer(layer){
	
	var wikipedia = new L.Wikipedia({
		zIndex: parseInt(layer.capesOrdre),
		nom : layer.serverName,
		tipus : layer.serverType,
		businessId: layer.businessId
	});	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		wikipedia.addTo(map);
	}
	controlCapes.addOverlay(wikipedia, layer.serverName, true);	
}

//function saveMap(){
//	console.debug('Save Map.......');
//	
//	//Comprovar si est� logat!!
//	if($.cookie('uid')=== null || $.cookie('uid')===''){
//		alert('Falta fer missatge no pots guardar sense estar logat!!!');
//		return;
//	}
//	
//	
//	if(typeof url('?businessid') == "string"){//s'ha de fer update del mapa
//		
//		var options = "{\"tags\":\""+ mapConfig.options.tags +"\",\"description\":\""+mapConfig.options.description+"\",\"bbox\":\""+ map.getBounds().toBBoxString()+"\",\"llegenda\":"+mapConfig.options.llegenda+",\"layers\":"+mapConfig.options.layers+",\"social\":"+mapConfig.options.social+",\"fons\":\""+ map.getActiveMap()+"\",\"foncsColor\":\""+ map.options.mapColor+"\"}";
//		var nomMapa = $('#nomAplicacio').html();
//		var data = {
//			businessId: url('?businessid'),
//			uid: $.cookie('uid'),
//			nom: nomMapa,
//			visibilitat: 'O',//FALTA!! NO ES GUARDA ENLLOC?
//			clauVisor: mapConfig.clau,
//			thumbnail: mapConfig.thumbnail,
//			options: options
//		};	
//		
//		//Update info i dades generals del mapa
//		doUpdateMap(data).then(function(results){
//			if(results.status==='OK'){
//				alert('save Map ok!');
//			}else{
////				$('#modal_login_ko').modal('toggle');
//				alert('save Map KO!');
//			}				
//		},function(results){
//			$('#modal_login_ko').modal('toggle');					
//		});		
//		
////		//Update de les capes del mapa
////		var listLayers = controlCapes._layers;
////		int size = listLayers.lenght();
////		for(int i=0;i<size);i++{
////			
////		}
//		
//	}else{//S'ha de crear un mapa nou
//		alert("S'ha de crear un mapa nou!");
//	}
//	
//}

function myRemoveLayer(obj){
	
	console.debug('Arriba a myRemoveLayer');
	map.closePopup();
	map.removeLayer(obj.layer);
	//Eliminem la capa de controlCapes, i actualitzem valors zindex de la resta
	var removeZIndex = obj.layer.options.zIndex;
	controlCapes.removeLayer(obj.layer);
	controlCapes._lastZIndex--;
	var aux = controlCapes._layers;
	for (var i in aux) {
		if (aux[i].layer.options.zIndex > removeZIndex) aux[i].layer.options.zIndex--;
	}
	//Actualitzem capaUsrActiva
	if(capaUsrActiva!=null && capaUsrActiva.options.businessId == obj.layer.options.businessId){
		capaUsrActiva.removeEventListener('layeradd');
		capaUsrActiva = null;
	}
}

function updateEditableElements(){
	//console.debug('updateEditableElements');
	$('.leaflet-name .editable').editable({
		type: 'text',
			success: function(response, newValue) {
				var id = this.id;
				if(typeof url('?businessid') == "string"){
					var data = {
					 	businessId: controlCapes._layers[this.id].layer.options.businessId, //url('?businessid') 
					 	uid: $.cookie('uid'),
					 	serverName: newValue
					 }
					var oldName = this.innerHTML;
					
					updateServidorWMSName(data).then(function(results){
						if(results.status==='OK'){
//						console.debug('udpate map name OK');
						controlCapes._layers[id].name = newValue;
					}else{
						controlCapes._layers[id].name = oldName;
						$('.leaflet-name label span#'+id).text(results.results.nom);
					}				
				},function(results){
					controlCapes._layers[id].name = oldName;
					var obj = $('.leaflet-name label span#'+id).text();
					$('.leaflet-name label span#'+id).text(oldName);
				});	
			}else{
				controlCapes._layers[id].name = newValue;
			}		
	 }
	});
}


function carregaDadesUsuari(data){
	console.debug("carregaDadesUsuari");
	//console.debug(data);
	jQuery.when(getAllServidorsWMSByUser(data), getAllTematicLayerByUid(data)).then(function(results1, results2){
		if (results1[0].status == "ERROR"){
			//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
			return false;
		}
		dades1=results1;
		dades2=results2;
//		loadPopOverMevasDades();
		creaPopOverMevasDades();
	},function(results){
		//JESS DESCOMENTAR!!!!
		//window.location.href = paramUrl.loginPage;
	});
}

function loadDadesObertesLayer(layer){
	var options = jQuery.parseJSON( layer.options );
	var url_param = paramUrl.dadesObertes + "dataset=" + options.dataset;
	var estil_do = retornaEstilaDO(options.dataset);				
	
	var capaDadaOberta = new L.GeoJSON.AJAX(url_param, {
		onEachFeature : popUp,
		nom : layer.serverName,
		tipus : layer.serverType,

		businessId : layer.businessId,
		dataType : "jsonp",
		zIndex: parseInt(layer.capesOrdre),
		pointToLayer : function(feature, latlng) {
			if(options.dataset.indexOf('meteo')!=-1){
				return L.marker(latlng, {icon:L.icon({					
					    iconUrl: feature.style.iconUrl,
					    iconSize:     [44, 44], 
					    iconAnchor:   [22, 22], 				   
					    popupAnchor:  [-3, -3] 
				})});
			}else if(options.dataset.indexOf('incidencies')!=-1){
				var inci=feature.properties.descripcio_tipus;
				var arr = ["Obres", "Retenci�", "Cons", "Meterologia" ];
				var arrIM = ["st_obre.png", "st_rete.png", "st_cons.png", "st_mete.png" ];
				var imgInci="/geocatweb/img/"+arrIM[jQuery.inArray( inci, arr )];
				return L.marker(latlng, {icon:L.icon({					
				    iconUrl: imgInci,
				    iconSize:     [30, 26], 
				    iconAnchor:   [15, 13], 				   
				    popupAnchor:  [-3, -3] 
			})});
			}else if(options.dataset.indexOf('cameres')!=-1){
				return L.marker(latlng, {icon:L.icon({					
				    iconUrl: "/geocatweb/img/st_came.png",
				    iconSize:     [30, 26], 
				    iconAnchor:   [15, 13], 				   
				    popupAnchor:  [-3, -3] 
			})});
			}else{
				return L.circleMarker(latlng, estil_do);
			}
			//return L.circleMarker(latlng, estil_do);
		}
	});	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		capaDadaOberta.addTo(map);
	}
	
	controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);	
}

function loadWmsLayer(layer){
	
	var newWMS = L.tileLayer.wms(layer.url, {
	    layers: layer.layers,
	    format: layer.imgFormat,
	    transparent: layer.transparency,
	    version: layer.version,
	    opacity: layer.opacity,
	    crs: layer.epsg,
		nom : layer.serverName,
		tipus: layer.serverType,
		zIndex :  parseInt(layer.capesOrdre),	    
	    businessId: layer.businessId
	});
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		newWMS.addTo(map);
	}
	controlCapes.addOverlay(newWMS, layer.serverName, true);	
}

function loadTematicLayer(layer){










	var data={
		businessId: layer.businessId,
		uid: $.cookie('uid')
	};
	
	var layerWms = layer;









	
	console.time("loadTematicLayer " + layerWms.serverName);
	getTematicLayer(data).then(function(results){
		console.timeEnd("loadTematicLayer " + layerWms.serverName);

		if(results.status == "OK" ){
			var tematic = results.results;
			var Lgeom = tematic.geometries.features.features;
			var idDataField = tematic.idDataField;
			var idGeomField = tematic.idGeomField;
			var dataField = tematic.dataField;
			var Lrangs = tematic.rangs;
			var Ldades = (tematic.capes ? tematic.capes.dades : []);
			
			var capaTematic = new L.FeatureGroup();
			
			capaTematic.options = {
				businessId : layerWms.businessId,
				nom : layerWms.serverName,
				zIndex :  parseInt(layerWms.capesOrdre),
				tipus : layerWms.serverType,
				geometryType: tematic.geometryType
			};





			
			for(var g=0;g<Lgeom.length;g++){
				var geom = Lgeom[g];
				var rangStyle;
				if (geom.geometry){
					var dataGeom = jQuery.grep(Ldades, function(e){ return e[idDataField] == geom.properties[idGeomField]; });
					if (dataGeom.length > 0){
						dataGeom = dataGeom[0];
						jQuery.extend(geom.properties, {data: dataGeom});
					}else{
						dataGeom = null;
					}
					var ftype = geom.geometry.type;
					ftype = ftype.toLowerCase();
					if (ftype === t_point){
						ftype = t_marker;
					}else if (ftype === t_linestring){
						ftype = t_polyline;
					}
					//Sin rangos
					if (Lrangs.length == 0){
						if (ftype === t_marker){
							rangStyle = L.AwesomeMarkers.icon(default_point_style);
						}else if (ftype === t_polyline){
							rangStyle = default_line_style;
						}else if (ftype === t_polygon){
							rangStyle = default_area_style;
						}
					}
					//1 Rango
					else if (Lrangs.length == 1){
						rangStyle = Lrangs[0];
						if (ftype === t_marker){
							//TODO
							rangStyle = createFeatureMarkerStyle(rangStyle);
						}else if (ftype === t_polyline){
							//TODO
						}else if (ftype === t_polygon){
							rangStyle = createFeatureAreaStyle(rangStyle);
						}
					}
					//Multiples rangos
					else{
						if (dataGeom){
							rangStyle = jQuery.grep(Lrangs, function(e){ return e.valorMax == dataGeom[dataField]; });
							if (rangStyle.length > 0){
								rangStyle = rangStyle[0];
								if (ftype === t_marker){
									rangStyle = L.AwesomeMarkers.icon(rangStyle);
								}else if (ftype === t_polyline){
									//TODO
								}else if (ftype === t_polygon){
									rangStyle = createFeatureAreaStyle(rangStyle);
								}
							}else{
								if (ftype === t_marker){
									rangStyle = L.AwesomeMarkers.icon(default_point_style);
								}else if (ftype === t_polyline){
									rangStyle = default_line_style;
								}else if (ftype === t_polygon){
									rangStyle = default_area_style;
								}
							}
						}else{
							if (ftype === t_marker){
								rangStyle = L.AwesomeMarkers.icon(default_point_style);
							}else if (ftype === t_polyline){
								rangStyle = default_line_style;
							}else if (ftype === t_polygon){
								rangStyle = default_area_style;
							}
						}
					}
					var featureTem;
					if (ftype === t_marker){
						featureTem = L.marker([geom.geometry.coordinates[0],geom.geometry.coordinates[1]],
							 {icon: rangStyle}).addTo(map);
					}else if (ftype === t_polyline){
						var coords=geom.geometry.coordinates;
						var k=0;
						var j=0;
						var llistaPunts=[];
						while (k < coords.length){
							var c=coords[k];
							var punt=new L.LatLng(c[0], c[1]);
							llistaPunts[j]=punt;
							k++;
							j++;
						}
						featureTem = L.polyline(llistaPunts, rangStyle);						
					}else if (ftype === t_polygon){
						var coords=geom.geometry.coordinates;
						var k=0;
						var j=0;
						var llistaPunts=[];
						while (k < coords.length){
							var linecoord=coords[k];
							var l=0;
							while (l < linecoord.length){
								var c=linecoord[l];
								var punt=new L.LatLng(c[1], c[0]);
								llistaPunts[j]=punt;
								j++;
								l++;
							}
							k++;
						}
						featureTem = new L.Polygon(llistaPunts, rangStyle);









					}
					if (featureTem){
						featureTem.properties = geom.properties;














						capaTematic.addLayer(featureTem);





					}





				}
			}
			if (capaTematic!=null){
				capaTematic.addTo(map);
				controlCapes.addOverlay(capaTematic, layerWms.serverName, true);
			}

		}else{
			alert("Error getTematicLayer");
		}
		
	},function(results){
		console.debug('getTematicLayer ERROR');
	});






}

function toggleCollapseTwitter(){
	console.debug('toggleCollapseTwitter');
	$('#twitter-collapse').toggle();
}

function showConfOptions(businessId){
//	console.debug('showConfOptions');
	if(jQuery("#conf-"+businessId+"").is(":visible")) jQuery("#conf-"+businessId+"").hide();
	else jQuery("#conf-"+businessId+"").show();
}

function createNewMap(){
	var data = {
		nom: "Untitle map",
		uid: $.cookie('uid'),
		visibilitat: 'O',
		tipusApp: 'vis',
	};
	
	createMap(data).then(function(results){
		if (results.status == "ERROR"){
			//TODO Mensaje de error
		}else{
			mapConfig = results.results;
			mapConfig.options = jQuery.parseJSON( mapConfig.options );
			jQuery('#businessId').val(mapConfig.businessId);
			mapConfig.newMap = false;
		}
	});
}

function showTematicLayersModal(tipus){
	jQuery('.modal').modal('hide');
	jQuery('#dialog_layers_tematic').modal('show');
	var layers = [];
	jQuery.each( controlCapes._layers, function( key, value ) {
		if (this.layer.options.geometryType == t_marker){
			layers.push(this);
		}else if (this.layer.options.geometryType == t_polyline){
			layers.push(this);
		}else if (this.layer.options.geometryType == t_polygon){
			layers.push(this);
		}
	});
	
	layers = {layers: layers};

	var source = jQuery("#tematic-layers-template").html();
	var template = Handlebars.compile(source);
	var html = template(layers);
	$('#list_tematic_layers').html(html);
	
	$('.usr_wms_layer').on('click',function(e){
		var _this = jQuery(this);
		var data = _this.data();
		data.from = tipus;
		if (tipus == tem_simple){
			if (data.geometrytype == t_marker){
				obrirMenuModal('#dialog_estils_punts','toggle',data);
			}else if (data.geometrytype == t_polyline){
				obrirMenuModal('#dialog_estils_linies','toggle',data);
			}else if (data.geometrytype == t_polygon){
				obrirMenuModal('#dialog_estils_arees','toggle',data);
			}
		}else if(tipus == tem_clasic){
			createTematicClasic(data);
		}
	});
}

function createTematicClasic(data){
	jQuery('.modal').modal('hide');
	jQuery('#dialog_tematic_rangs').modal('show');
	console.debug(data);
	
	jQuery('#dialog_tematic_rangs .btn-success').on('click',function(e){
		
		jQuery('#dialog_tematic_rangs').modal('hide');
	});
	
	var dataTem={
		businessId: data.businessid,
		uid: jQuery.cookie('uid')
	};
		
	getTematicLayer(dataTem).then(function(results){
		if (results.status == "OK"){
			var tematic = results.results;
			console.debug(tematic);
			var fields = {};
			if (tematic.capes){
				var dataNames = tematic.capes.fieldsName.split(',');
				jQuery.each(dataNames, function( index, value ) {
					fields[value] = "slotd"+(index+1);
				});
			}else{ //sin datos
				fields['nom'] = 'nom';
				var geomNames = tematic.geometries.fieldsName.split(',');
				jQuery.each(geomNames, function( index, value ) {
					fields[value] = "slotf"+(index+1);
				});
			}
			var source1 = jQuery("#tematic-layers-fields").html();
			var template1 = Handlebars.compile(source1);
			var html1 = template1({fields:fields});
			jQuery('#dataField').html(html1);
			
			jQuery('#dataField').on('change',function(e){
				var this_ = jQuery(this);
				readDataTematicFromSlotd(tematic, this_.val()).then(function(results){
					displayTematicRangs(tematic ,results);
					
				});
			});
			
			jQuery('#dataField').val(tematic.dataField);
			readDataTematicFromSlotd(tematic, jQuery('#dataField').val()).then(function(results){
				displayTematicRangs(tematic ,results);
			});
		}
	});
	/*
	var layer = controlCapes._layers[data.leafletid];
	console.debug(layer.layer);
	var features = layer.layer.getLayers();
	var fields = [];
	if (features.length > 0){
		var feature = features[0];
		jQuery.each(feature.properties, function( key, value ) {
			if (key != 'businessId' && key != 'data'){
				fields.push(key);
			}
		});
	}
	*/	
}

function displayTematicRangs(tematic ,results){
	showTematicRangs(tematic ,results).then(function(results1){
		var source1 = jQuery("#tematic-values-template").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1({values:results1});
		jQuery('#list_tematic_values').html(html1);
	});
}

function readDataTematicFromSlotd(tematic, slotd){
	var defer = jQuery.Deferred();
	var dades = tematic.capes.dades;
	var values = jQuery.map( dades, function( a ) {
		return a[slotd];
	});
	defer.resolve(values);
	return defer.promise();
}

function showTematicRangs(tematic, values){
	var defer = jQuery.Deferred();
	var rangs = tematic.rangs;
	var valuesStyle = [];
	if(rangs.length == 0){
		if (tematic.geometryType == t_marker){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: default_point_style};
			});
		}else if (tematic.geometryType == t_polyline){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: default_line_style};
			});
		}else if (tematic.geometryType == t_polygon){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: default_area_style};
			});
		}
	}else if(rangs.length == 1){
		rangStyle = rangs[0];
		if (tematic.geometryType == t_marker){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: rangStyle};
			});
		}else if (tematic.geometryType == t_polyline){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: rangStyle};
			});
		}else if (tematic.geometryType == t_polygon){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: rangStyle};
			});
		}
	}else{
		
	}
	defer.resolve(valuesStyle);
	
	return defer.promise();
}

function changeTematicLayerStyle(tematic, styles){
	var rangs = getRangsFromStyles(tematic, styles);
	console.debug(rangs);
	rangs = JSON.stringify({rangs:rangs});
		
	var data = {
		businessId: tematic.businessid,
		uid: $.cookie('uid'),
		rangs: rangs
	};
	
	updateTematicRangs(data).then(function(results){
		console.debug(results);
	});
		
	if (jQuery.isArray(styles)){
		
	}else{
		var layer = controlCapes._layers[tematic.leafletid];
		if (tematic.geometrytype == t_marker){
			jQuery.each(layer.layer._layers, function( key, value ) {
				this.setIcon(styles);
			});
		}else if (tematic.geometrytype == t_polyline){
			jQuery.each(layer.layer._layers, function( key, value ) {
				this.setStyle(styles);
			});
		}else if (tematic.geometrytype == t_polygon){
			jQuery.each(layer.layer._layers, function( key, value ) {
				this.setStyle(styles);
			});
		}
	}
}

function getRangsFromStyles(tematic, styles){
	console.debug(styles);
	var rangs = [];
	if (jQuery.isArray(styles)){
		
	}else{
		if (tematic.geometrytype == t_marker){
			var rang = {
				simbol: jQuery.trim(styles.options.icon),
				simbolSize: styles.options.iconSize.y, 
				simbolColor: styles.options.iconColor, 
				marker: styles.options.markerColor
			};
		}else if (tematic.geometrytype == t_polyline){
			/*var rang = {
				borderWidth: 2,
				borderColor: '#000000',
				color: styles.options.iconColor,
				label: false,
				labelColor: '#000000',
				labelFont: 'arial',
				labelHaloColor: '#ffffff',
				labelHaloWidth: 2,
				labelSize: 10,
				lineWidth: styles.lineWidth,
				lineStyle: 'solid',			
				llegenda: '',
				opacity: (styles.opacity * 100),
				poligonStyle: '',
				simbol: styles.options.icon,
				simbolSize: , 
				simbolColor: styles.options.markerColor, 
				valorMax: '',
				valorMin: '',
				marker: ''
			};
			*/
		}else if (tematic.geometrytype == t_polygon){
			console.debug(styles.fillColor);
			styles.fillColor = jQuery.Color(styles.fillColor).toHexString();
			var rang = {
				borderWidth: styles.weight,
				borderColor: styles.color,
				color: styles.fillColor,
				opacity: (styles.fillOpacity * 100)
			};
		}
		rangs.push(rang);
	}
	return rangs;
}
