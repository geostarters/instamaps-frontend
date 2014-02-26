var map, controlCapes;
var factorH = 50;
var factorW = 0;
var _htmlDadesObertes = [];
var capaUsrPunt, capaUsrLine, capaUsrPol,capaUsrActiva;
var mapConfig = {};
var dades1;
var capaDadaOberta;
var initMevesDades = false;
var download_layer;
var estilP={iconFons:'awesome-marker-web awesome-marker-icon-orange',
		iconGlif:'fa fa-',
		colorGlif:'#333333',fontsize:'14px',size:'28'};
var default_line_style = {
    weight: 3,       
    color: '#FFC400',
    opacity:1,
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
	prefix : 'fa',
	isCanvas:false,
	radius:6,
	opacity:1,
	weight : 2,
	fillOpacity : 0.9,
	color : "#ffffff",
	fillColor :"#FFC500"
};
var opt = {
	placement : 'right',
	container : 'body'
};
var optB = {
	placement : 'bottom',
	container : 'body'
};

jQuery(document).ready(function() {
	if (!Modernizr.canvas ){
		jQuery("#mapaFond").show();
		jQuery("#dialgo_old_browser").modal('show');
		jQuery("#sidebar").hide();
		jQuery('#dialgo_old_browser').on('hide.bs.modal', function (e) {
			window.location = paramUrl.mainPage;
		});
	}else{
		jQuery.cookieCuttr({
			cookieAnalytics: false,
			cookieAcceptButtonText: window.lang.convert("Acceptar"),
			cookieMessage: window.lang.convert("Per tal de fer el seguiment de visites al nostre lloc web, utilitzem galetes. En cap cas emmagatzemem la vostra informació personal")
		});
		loadApp();
	}
}); // Final document ready

function loadApp(){
	if(typeof url('?uid') == "string"){
		$.removeCookie('uid', { path: '/' });
		$.cookie('uid', url('?uid'), {path:'/'});
	}
	
	if(typeof url('?businessid') == "string"){
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
				//avisDesarMapa();
			});
		},function(results){
			window.location.href = paramUrl.loginPage;
		});
	}else{
		if (!$.cookie('uid')){
			jQuery("#mapaFond").show();
			jQuery("#sidebar").hide();
			
			jQuery('#dialgo_leave').modal('show');
			
			jQuery('#dialgo_leave .btn-success').on('click',function(){
				window.location = paramUrl.registrePage;
			});
			
			jQuery('#dialgo_leave').on('hide.bs.modal', function (e) {
				createRandomUser().then(function(results){
					if (results.status==='OK'){
						var user_login = results.results.uid;
						var pass_login = "user1234";
						doLogin(user_login, pass_login).then(function(results){
							console.debug(results);
							if(results.status==='OK'){
								jQuery.cookie('uid', user_login, {path:'/'});
								createNewMap();
							}				
						});
					}
				});
				
				jQuery(window).on('beforeunload',function(event){
					deleteRandomUser({uid: $.cookie('uid')});
				});
			});
		}else{	
			mapConfig.newMap = true;
			createNewMap();
			//avisDesarMapa();
		}
	}
	
	if ($.cookie('uid') && $.cookie('uid').indexOf("random_") != -1 && $.cookie('uid').indexOf("random_") == 0){
		jQuery(window).on('beforeunload',function(event){
			deleteRandomUser({uid: $.cookie('uid')});
		});
		
		jQuery('.bt_publicar').on('click',function(){
			jQuery('.modal').modal('hide');
			$('#dialgo_messages').modal('show');
			$('#dialgo_messages .modal-body').html(window.lang.convert("No es guardarà el mapa. Per guardar les dades has d'entrar amb un usuari registrat. En tancar la sessió es perdran les dades"));
		});
	}else{
		//publicar el mapa solo para registrados
		jQuery('.bt_publicar').on('click',function(){
			$('#dialgo_publicar #nomAplicacio').removeClass("invalid");
			$( ".text_error" ).remove();
			jQuery('.modal').modal('hide');
			$('#dialgo_publicar').modal('show');
			var urlMap = url('protocol')+'://'+url('hostname')+url('path')+'?businessId='+jQuery('#businessId').val();
			urlMap = v_url.replace('mapa','visor');
			$('#urlMap').val(urlMap);
			$('#iframeMap').val('<iframe width="700" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
		});
		
		jQuery('#dialgo_publicar .btn-primary').on('click',function(){
			publicarMapa();
		});
		
		jQuery('#dialgo_leave .btn-primary').on('click',function(){
			leaveMapa();
		});
	}
		
	//carrega las capas del usuario si esta loginat
	if ($.cookie('uid')){
		var data = {uid: $.cookie('uid')};
		carregaDadesUsuari(data);
	}
		
	//botons tematic
	jQuery('#st_Color').on('click',function(){
		showTematicLayersModal(tem_simple,jQuery(this).attr('class'));
	});
	
	jQuery('#st_Tema').on('click',function(){
		showTematicLayersModal(tem_clasic);
	});

	jQuery('#st_Size').on('click',function(){
		showTematicLayersModal(tem_size);
	});
	
	jQuery('#st_Heat').on('click',function(e) {
		showTematicLayersModal(tem_heatmap);
		
	});	

	jQuery('#st_Clust').on('click',function(e) {		
		showTematicLayersModal(tem_cluster);
		
	});	
	
	$('#nomAplicacio').editable({
		type: 'text',
		mode: 'inline',
	    validate: function(value) {
	        if($.trim(value) == '') {
//	        	return 'This field is required';
	        	return {newValue: this.innerHTML};
	        }
        },		
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
	
	
	//Compartir en xarxes socials
	var v_url = window.location.href;
	if(true){//if(v_url.contains('localhost')){
		v_url = v_url.replace('localhost',DOMINI);
	}
	v_url = v_url.replace('mapa','visor');
	shortUrl(v_url).then(function(results){
		console.debug(results);
		jQuery('#socialShare').share({
	        networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
	        theme: 'square',
	        urlToShare: results.data.url
		});
	});
		
		
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
}

function addClicksInici() {
	jQuery('.bt_llista').on('click', function() {
		activaPanelCapes();
	});
	
	// new vic
	jQuery('.bt_captura').on('click', function() {
		capturaPantalla('captura');
	});
	
	jQuery('.bt_print').on('click', function() {
		capturaPantalla('print');
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

function addToolTipsInici() {
	//eines mapa
	$('.bt_llista').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Llista de capes")
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



function addDialegsEstils() {
	jQuery('#div_mes_punts').on("click", function(e) {	
		obrirMenuModal('#dialog_estils_punts','toggle',from_creaCapa);
	});

	jQuery('#div_mes_linies').on("click", function(e) {			
		obrirMenuModal('#dialog_estils_linies','toggle',from_creaCapa);
	});
	
	jQuery('#div_mes_arees').on("click", function(e) {	
		obrirMenuModal('#dialog_estils_arees','toggle',from_creaCapa);
	});
	
	jQuery('#dialog_estils_punts .btn-success').on('click',function(){
		if(objEdicio.obroModalFrom==from_creaCapa){
			jQuery('#div_punt').removeClass();
			jQuery('#div_punt').addClass(jQuery('#div_punt0').attr('class'));
			jQuery('#div_punt').css('font-size',jQuery('#div_punt0').css('font-size'));
			jQuery('#div_punt').css('width',jQuery('#div_punt0').css('width'));
			jQuery('#div_punt').css('height',jQuery('#div_punt0').css('height'));
			jQuery('#div_punt').css('color',estilP.colorGlif);			
			jQuery('#div_punt').css('background-color',estilP.divColor);	
			changeDefaultPointStyle(estilP);		
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var cvStyle=changeDefaultPointStyle(estilP);
			var feature=map._layers[objEdicio.featureID];
			console.debug(feature);
			var capaMare=map._layers[feature.properties.capaLeafletId];
			canviaStyleSinglePoint(cvStyle,feature,capaMare,true);
			getRangsFromLayer(capaMare);
		}else if (objEdicio.obroModalFrom.from==tem_simple){
			var cvStyle=changeDefaultPointStyle(estilP);
			changeTematicLayerStyle(objEdicio.obroModalFrom, cvStyle);
		}else{
			console.debug(objEdicio.obroModalFrom);
		}	
		jQuery('#dialog_estils_punts').modal('toggle');				
	});
	
	jQuery('#dialog_estils_linies .btn-success').on('click',function(){		
		if(objEdicio.obroModalFrom==from_creaCapa){
			addGeometryInitL(document.getElementById("cv_linia")); 		
			jQuery('#dialog_estils_linies').modal('toggle');		
			//changeDefaultVectorStyle(canvas_linia);
			changeDefaultLineStyle(canvas_linia);
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var feature=map._layers[objEdicio.featureID];
			var capaMare=map._layers[feature.properties.capaLeafletId];
			map._layers[objEdicio.featureID].setStyle(changeDefaultLineStyle(canvas_linia));
			getRangsFromLayer(capaMare);
		}else if (objEdicio.obroModalFrom.from=="simpleTematic"){
			changeTematicLayerStyle(objEdicio.obroModalFrom, changeDefaultLineStyle(canvas_linia));
		}else{
			console.debug(objEdicio.obroModalFrom);
		}
		jQuery('#dialog_estils_linies').modal('toggle');			
	});
	
	jQuery('#dialog_estils_arees .btn-success').on('click',function(){		
		if(objEdicio.obroModalFrom==from_creaCapa){
			addGeometryInitP(document.getElementById("cv_pol"));  
			jQuery('#dialog_estils_arees').modal('toggle');		
			//changeDefaultVectorStyle(canvas_pol);
			changeDefaultAreaStyle(canvas_pol);
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var feature=map._layers[objEdicio.featureID];
			var capaMare=map._layers[feature.properties.capaLeafletId];
			map._layers[objEdicio.featureID].setStyle(changeDefaultAreaStyle(canvas_pol));
			getRangsFromLayer(capaMare);
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
		activaPuntZ();	
	});
		
	jQuery(document).on('click', ".bs-punts li", function(e) {		
		jQuery(".bs-punts li").removeClass("estil_selected");
		jQuery("#div_puntZ").removeClass("estil_selected");
		jQuery('#div_punt0').removeClass();
		estilP.iconFons=jQuery('div', this).attr('class');
		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
		jQuery(this).addClass("estil_selected");	
		jQuery('#dv_cmb_punt').hide();
		jQuery('#div_punt0').css('width','28px');
		jQuery('#div_punt0').css('height','42px');	
		jQuery('#div_punt0').css('font-size',"14px");
		estilP.divColor='transparent';
		jQuery('#div_punt0').css('background-color',estilP.divColor);
		estilP.fontsize="14px";
	});
	
	jQuery(document).on('change','#cmb_mida_Punt', function(e) { 
		if(!jQuery('#div_puntZ').hasClass("estil_selected")){
			activaPuntZ();
		}
		else{
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
			map.historicMap();
		}
		if (fons == 'historicOrtoMap') {
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
	jQuery(".div_dades_usr").on('click', function() {
		
		jQuery('.modal').modal('hide');
		$('#dialog_teves_dades').modal('show');
		
		//Per tenir actualitzar canvis: remove layers, add layers, etc
		jQuery("#id_sw").empty();
		
		refrescaPopOverMevasDades();
			
		var source1 = jQuery("#meus-wms-template").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1(dades1);				
		jQuery("#id_sw").append(html1);	
		
		initMevesDades = true;
		
		jQuery("ul.bs-dadesO").on('click', '.usr_wms_layer', function(event) {
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
		jQuery("ul.bs-dadesO").on('click', 'span.glyphicon-remove', function(event) {
			event.preventDefault();
			event.stopPropagation();
			var _this = jQuery(this);
			var data = {
				uid: $.cookie('uid'),
				businessId: _this.data("businessid")
			};
			
			var parent = _this.parent();
			var parentul = parent.parent();
			_this.parent().remove();
			
			console.debug(_this.data("servertype"));
			if(_this.data("servertype") == t_tematic){
				deleteTematicLayerAll(data).then(function(results){
					console.debug(results);
					if (results.status == "ERROR"){
						parentul.append(parent);
						if (results.results == "DataIntegrityViolationException"){
							$('#dialgo_messages').modal('show');
							$('#dialgo_messages .modal-body').html(window.lang.convert("Aquesta capa actualment és en ús i no es pot esborrar"));
						}
					}					
				});
			}else{
				deleteServidorWMS(data).then(function(results){
					console.debug(results);
					if (results.status == "ERROR"){
						parentul.append(parent);
						if (results.results == "DataIntegrityViolationException"){
							$('#dialgo_messages').modal('show');
							$('#dialgo_messages .modal-body').html(window.lang.convert("Aquesta capa actualment és en ús i no es pot esborrar"));
						}
					}
				});						
			}
		});
	});	
}

function loadPopOverMevasDades(){
	console.debug("loadPopOverMevasDades");
	jQuery(".div_dades_usr").on('click', function() {
		var data = {uid: $.cookie('uid')};
		gestionaPopOver(this);		
		
		console.debug(dades1);
		
		var source1 = jQuery("#meus-wms-template").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1(dades1);
		jQuery("#id_mysrvw").append(html1);
		
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
						 newWMS.options.zIndex = controlCapes._lastZIndex+1;
						 controlCapes.addOverlay(newWMS, value.serverName, true);
						 controlCapes._lastZIndex++;

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
	var dfd = jQuery.Deferred();
	var data = {uid: $.cookie('uid')};
	getAllServidorsWMSByUser(data).then(function(results){
		dades1=results;
		dfd.resolve(dades1);
	},function(results){
		window.location.href = paramUrl.loginPage;
	});
	return dfd.promise();
}

function carregarCapa(businessId){
	var data = {
		uid: $.cookie('uid'),
		businessId: businessId
	};
	
	loadTematicLayer(data);
	
	/*
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
		}else if (geometryType==t_multiple){
			capaFeatures.options.tipus = t_multiple;
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
	*/
	
}

function creaPopOverDadesExternes() {
	jQuery(".div_dades_ext").on('click', function() {

		
		//gestionaPopOver(this);
		jQuery('.modal').modal('hide');
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
						'<div class="panel-info"><ul class="bs-dadesO_XS panel-heading">'+
						'<li><a id="add_twitter_layer" href="javascript:toggleCollapseTwitter()" class="label-xs">Twitter <i class="fa fa-twitter"></i></a></li>'+
						'<li><a id="add_panoramio_layer" href="javascript:addPanoramioLayer();" class="label-xs">Panoramio <i class="fa fa-picture-o"></i></a></li>'+
						'<li><a id="add_wikipedia_layer" href="javascript:addWikipediaLayer();" class="label-xs">Wikipedia <i class="fa fa-book"></i></a></li>'+
						'</ul>'+
						'<div id="twitter-collapse">'+
							'<div class="input-group">'+
			      				'<span class="input-group-addon">Hashtag #</span>'+
			      				'<input id="hashtag_twitter_layer" type="text" class="form-control">'+
			      				'<span class="input-group-btn">'+
			      					'<button id="btn-add-twitter-layer" class="btn btn-primary editable-submit" type="button"><i class="glyphicon glyphicon-ok"></i></button>'+
			      				'</span>'+
				      		'</div>'+
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

function addCapaDadesObertes(dataset,nom_dataset) {

	var param_url = paramUrl.dadesObertes + "dataset=" + dataset;

	var estil_do = retornaEstilaDO(dataset);
//	var lastZIndex = controlCapes._lastZIndex;//+1;
	capaDadaOberta = new L.GeoJSON.AJAX(param_url, {
		onEachFeature : popUp,
		nom : dataset,
		tipus : t_dades_obertes,
		dataset: dataset,
		businessId : '-1',
		dataType : "jsonp",
//		zIndex: lastZIndex,
		geometryType:t_marker,
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
				capaDadaOberta.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}
		});
		
	}else{
		capaDadaOberta.addTo(map)
		capaDadaOberta.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
		controlCapes._lastZIndex++;
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
				var southWest = L.latLng(bbox[1], bbox[0]);
			    var northEast = L.latLng(bbox[3], bbox[2]);
			    var bounds = L.latLngBounds(southWest, northEast);
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
			}else if(value.serverType == t_json){
				loadCapaFromJSON(value);				
				
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
				
			}else if(value.serverType == t_heatmap){
				loadHeatLayer(value);
				
			}else if(value.serverType == t_cluster){
				loadClusterLayer(value);
				
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
	/*//TODO de los botones ver nuevos botones
	options.llegenda = jQuery('#llegenda_chk').bootstrapSwitch('state');
	options.layers = jQuery('#layers_chk').bootstrapSwitch('state');
	options.social = jQuery('#social_chk').bootstrapSwitch('state');
	*/
	options.llegenda = true;
	options.layers = true;
	options.social = true;
	options.fons = map.getActiveMap();
	options.fonsColor = map.getMapColor();
	console.debug(options);
	options = JSON.stringify(options);
	
	var newMap = true;
	
	if (jQuery('#businessId').val() != ""){
		newMap = false;
	}
	
	var layers = jQuery(".leaflet-control-layers-selector").map(function(){
		return {businessId: this.id.replace('input-',''), activa: jQuery(this).is(':checked')};
	}).get();
	//console.debug(layers);
	
	var data = {
		nom: jQuery('#dialgo_publicar #nomAplicacio').val(),
		uid: $.cookie('uid'),
		visibilitat: 'O',
		tipusApp: 'vis',
		options: options,
		layers: JSON.stringify(layers)
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
/*
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
*/

function initControls(){
	addControlsInici();
	addClicksInici();
	addOpcionsFonsMapes();
	addToolTipsInici();
	redimensioMapa();
	creaAreesDragDropFiles();
	tradueixMenusToolbar();
	addDrawToolbar();
	activaEdicioUsuari();
	addDialegsEstils();
	addControlCercaEdit();
	//dades
	generaLListaDadesObertes();
	creaPopOverMesFonsColor();
	creaPopOverDadesExternes();
	creaPopOverMesFons();
	generaLlistaServeisWMS();
}

function addTwitterLayer(hashtag){
	var hashtag = $('#twitter-collapse .input-group #hashtag_twitter_layer').val();
	//Control no afegit #
	if(hashtag.indexOf("#") == 0) hashtag = hashtag.substr(1);
	
	if(hashtag == null || hashtag == "") return;
	
	$('#twitter-collapse .input-group #hashtag_twitter_layer').val("");
//	var lastZIndex = controlCapes._lastZIndex;//+1;//Jess
	var twitter = new L.Twitter({
		hashtag: hashtag,
		nom: 'twitter #'+ hashtag,
//		zIndex: lastZIndex, 
		businessId: '-1',
		tipus: t_xarxes_socials
	});

	//Si el mapa existeix a BD
	if(typeof url('?businessid') == "string"){	
		var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: 'twitter #'+ hashtag,
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
				twitter.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(twitter, 'twitter #'+ hashtag, true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});	
	}else{
		twitter.addTo(map);
		twitter.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(twitter, 'twitter #'+ hashtag, true);
		controlCapes._lastZIndex++;
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
	controlCapes._lastZIndex++;
}

function addPanoramioLayer(){
	
//	var lastZIndex = controlCapes._lastZIndex;//+1;//Jess
	var panoramio = new L.Panoramio({
		maxLoad: 10, 
		maxTotal: 250, 
//		zIndex: lastZIndex,
		nom : 'panoramio',
		businessId: '-1',
		tipus: t_xarxes_socials
	});
	
	if(typeof url('?businessid') == "string"){
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: 'panoramio',
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
				panoramio.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(panoramio, 'panoramio', true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});	
	}else{
		panoramio.addTo(map);
		panoramio.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(panoramio, 'panoramio', true);
		controlCapes._lastZIndex++;
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
	controlCapes._lastZIndex++;
}

function addWikipediaLayer(){	
	console.debug('Add wikipedia layer');
//	var lastZIndex = controlCapes._lastZIndex;//+1;//Jess
	var wikipedia = new L.Wikipedia({
//		zIndex: lastZIndex,
		nom : 'wikipedia',
		businessId: '-1',
		tipus: t_xarxes_socials
	});
	
	if(typeof url('?businessid') == "string"){
		
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: 'wikipedia',
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
				wikipedia.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(wikipedia, 'wikipedia', true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});
	}else{
		wikipedia.addTo(map);
		wikipedia.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(wikipedia, 'wikipedia', true);
		controlCapes._lastZIndex++;
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
	controlCapes._lastZIndex++;
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
	    validate: function(value) {
		        if($.trim(value) == '') {
		        	return {newValue: this.innerHTML};
		        }
	        },
			success: function(response, newValue) {
				map.closePopup();//Perque no queden desactualitzats
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
						controlCapes._layers[id].layer.options.nom = newValue;
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
				controlCapes._layers[id].layer.options.nom = newValue;
			}		
	 }
	});
	//Hide les opcions de configuracio
	jQuery('.options-conf').hide();
}

function carregaDadesUsuari(data){
	//console.debug("carregaDadesUsuari");
	getAllServidorsWMSByUser(data).then(function(results){
		if (results.status == "ERROR"){
			//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
			return false;
		}
		dades1=results;
		creaPopOverMevasDades();
	},function(results){
		//JESS DESCOMENTAR!!!!
		//window.location.href = paramUrl.loginPage;
	});
}

function loadDadesObertesLayer(layer){
	var options = jQuery.parseJSON( layer.options );
	if(options.tem == null || options.tem == tem_simple){
		var url_param = paramUrl.dadesObertes + "dataset=" + options.dataset;
		var estil_do = retornaEstilaDO(options.dataset);	
		if (options.tem == tem_simple){
			//estil_do = options.style;
			estil_do = createFeatureMarkerStyle(options.style);
			console.debug(estil_do);
		}
		var capaDadaOberta = new L.GeoJSON.AJAX(url_param, {
			onEachFeature : popUp,
			nom : layer.serverName,
			tipus : layer.serverType,
			dataset: options.dataset,
			businessId : layer.businessId,
			dataType : "jsonp",
//			zIndex: parseInt(layer.capesOrdre),
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
					var arr = ["Obres", "Retenció", "Cons", "Meterologia" ];
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
					if (estil_do.isCanvas){
						return L.circleMarker(latlng, estil_do);
					}else{
						//console.debug(L.marker(latlng, {icon:L.AwesomeMarkers.icon(estil_do)}));
						return L.marker(latlng, {icon:estil_do,isCanvas:false, tipus: t_marker});
					}
				}
			}
		});	
		
		if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
			capaDadaOberta.addTo(map);
		}
		
		capaDadaOberta.eachLayer(function(layer) {
			console.debug("1"+layer);
		});		
		
		if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
			capaDadaOberta.options.zIndex = controlCapes._lastZIndex + 1;
		}else{
			capaDadaOberta.options.zIndex = parseInt(layer.capesOrdre);
		}		
		
		controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);	
		controlCapes._lastZIndex++;
		
	}else if(options.tem == tem_cluster){
		loadDadesObertesClusterLayer(layer);
	}else if(options.tem == tem_heatmap){
		loadDOHeatmapLayer(layer);
	}
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
	controlCapes._lastZIndex++;
}

function toggleCollapseTwitter(){
	console.debug('toggleCollapseTwitter');
	$('#twitter-collapse').toggle();
}

function showConfOptions(businessId){
//	console.debug('showConfOptions');
//	if(jQuery("#conf-"+businessId+"").is(":visible")) jQuery("#conf-"+businessId+"").hide("slow");
//	else jQuery("#conf-"+businessId+"").show("2000");
	jQuery("#conf-"+businessId+"").toggle("fast");
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
			window.location = paramUrl.mapaPage+"?businessid="+mapConfig.businessId;
		}
	});
}


function activaPuntZ(){
	jQuery(".bs-punts li").removeClass("estil_selected");
	jQuery('#div_puntZ').addClass("estil_selected");
	estilP.iconFons=jQuery('#div_punt9').attr('class');
	jQuery('#div_punt0').removeClass();
	jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
	
	var vv=jQuery('#cmb_mida_Punt').val();
	jQuery('#div_punt0').css('width',vv+'px');
	jQuery('#div_punt0').css('height',vv+'px');
	jQuery('#div_punt0').css('font-size',(vv/2)+"px");
//	jQuery('#div_punt0').css('background-color',jQuery('fill_color_punt').css('background-color'));
	estilP.divColor=rgb2hex(jQuery('.fill_color_punt').css('background-color'));
	jQuery('#div_punt0').css('background-color',estilP.divColor);
	estilP.fontsize=(vv/2)+"px";
	estilP.size=vv;	
}
