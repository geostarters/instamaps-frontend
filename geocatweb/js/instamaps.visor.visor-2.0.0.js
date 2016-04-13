/**
 * require jQuery
 * require geocat.web-1.0.0
 * require geocat.mapa.edit-data-table
 * require url.min
 * require leaflet
 * require L.IM_Map
 * require L.IM_controlFons
 * require jQuery.cookie
 * require geocat.utils
 * require geocat.constants
 */

;(function(global, $){
	
	var Visor = function(options){
		return new Visor.init(options);
	}
	
	var map_ = new L.IM_Map('map', {
	  	zoomAnimation:false,
        typeMap : 'topoMapGeo',
        minZoom: 2,
        maxZoom : 19,
        zoomControl: true,
        timeDimension: true,
	    timeDimensionControl: true,
	    timeDimensionControlOptions:{
	    	speedSlider:false
	    }
	}).setView([ 41.431, 1.8580 ], 8);
	
	var visorOptions = {
		addDefaultZoomControl: true,
		controls: {},
		map: map_
	};
	
	var changeInitVisor = function(){
		$('.container').css('width','95%');
		//TODO ver como hacer para no depender del timeout
		//if (!isIframeOrEmbed()) setTimeout('activaPanelCapes(false)',3000);
	};
	
	Visor.prototype = {
		addLogoInstamap: function(){
			var self = this;
			$.get("templates/logoInstamaps.html",function(data){
				self.controls.controlLogos.addLogoHtml(data);
			});
   			
			return self;
   		},
   		
   		removeLogoInstamap: function(){
			var self = this;
			self.controls.controlLogos.removeLogo({
				className: 'logo_instamaps'
			});
			
			return self;
   		},
   		
   		resizeMap: function(){
			var self = this,
			map = self.map,
			optionsBtn = {},
			factorH = 0,
			factorW = 0,
			_window = $( window ),
			widthW = _window.width(),
			heightW = _window.height(),
			_mapDiv = $('#map'),
			cl = jQuery('.bt_llista span').attr('class');
			if(self.embed){//Pel cas visor, embeded
				factorH = 0;
			}else{
				factorH = $('.navbar').css('height').replace(/[^-\d\.]/g, '');
			}
			_mapDiv.css('top', factorH + 'px');
			_mapDiv.height(heightW - factorH);
			_mapDiv.width(widthW - factorW);
						
			console.debug("Win:" + widthW + ", " + heightW);
						
			if(widthW<500 || heightW<=350){
				optionsBtn = {
					openInstamaps: true,	
					home: false,
					routing: false,
					search: false,
					location: false,
					share: false,
					snapshot: false,
					print: false,
					geopdf: false,
					c3d: false,
					mousePosition: false,
					scale: false,
					fons: false,
					legend: false,
					layers: false,
					minimap: false,
					widgets: false
				};
			}else{
				optionsBtn = {
					openInstamaps: false,	
					home: true,
					routing: true,
					search: true,
					location: true,
					share: true,
					snapshot: true,
					print: true,
					geopdf: true,
					c3d: true,
					mousePosition: true,
					scale: true,
					fons: true,
					legend: true,
					layers: true,
					minimap: true,
					widgets: true
				};
			}
			self._redrawButtons(optionsBtn);
			map.invalidateSize();
			/*
			if(self.embed || width<500 || height<=350){
				$('.leaflet-control-gps').attr("style","display:none");
				$('#dv_bt_Find').attr("style","display:none");
				$('#dv_bt_Routing').attr("style","display:none");
				$('.bt_captura').attr("style","display:none");
				$('.bt_print').attr("style","display:none");
				$('.bt_geopdf').attr("style","display:none");
				$('.leaflet-control-mouseposition').attr("style","display:none");
				$('.leaflet-control-scale').attr("style","display:none");
				$('.leaflet-control-minimap').attr("style","display:none");
				activaLlegenda(true);
				if (self.llegenda) setTimeout("activaLlegenda(false)", 500);
			}
			if(width>500){
				$('.leaflet-control-gps').attr("style","display:block");
				$('#dv_bt_Find').attr("style","display:block");
				$('#dv_bt_Routing').attr("style","display:block");
				$('.bt_captura').attr("style","display:block");
				$('.bt_print').attr("style","display:block");
				$('.bt_geopdf').attr("style","display:block");
				$('.leaflet-control-mouseposition').attr("style","display:block");
				$('.leaflet-control-scale').attr("style","display:block");
				$('.leaflet-control-minimap').attr("style","display:block");
				activaLlegenda(true);
				if (self.llegenda) setTimeout("activaLlegenda(false)", 500);
			}
			if(self.embed && widthW<=360) {
				$('.bt_llista').attr("style","display:none");
				$('.leaflet-control-layers').attr("style","display:none");
			}
			else if (self.embed) {
				$('.bt_llista').attr("style","display:block");
				$('.leaflet-control-layers').attr("style","display:block");
				$('.control-btn-fons').attr("style","display:none");
				activaPanelCapes(false);
			}
			if (cl){
				if (cl.indexOf('grisfort') == -1) {
					jQuery('.bt_llista span').removeClass('greenfort');
					jQuery('.bt_llista span').addClass('grisfort');
				}
			}
			//TODO ver el tema 3D
			if(estatMapa3D){ActDesOpcionsVista3D(true)};
			*/
			return self;
		},
		
		_redrawButtons: function(options){
			var self = this;
			if(options.home && self.controls.homeControl){
				self.controls.homeControl.showBtn();
			}else if(self.controls.homeControl){
				self.controls.homeControl.hideBtn();
			}
			
			if(options.openInstamaps && self.controls.openInstamapsControl){
				self.controls.openInstamapsControl.showBtn();
			}else if(self.controls.openInstamapsControl){
				self.controls.openInstamapsControl.hideBtn();
			}
			
			if(options.routing && self.controls.routingControl){
				self.controls.routingControl.showBtn();
			}else if(self.controls.routingControl){
				self.controls.routingControl.hideBtn();
			}
			
			if(options.location && self.controls.locationControl){
				self.controls.locationControl.showBtn();
			}else if(self.controls.locationControl){
				self.controls.locationControl.hideBtn();
			}
			
			if(options.share && self.controls.shareControl){
				self.controls.shareControl.showBtn();
			}else if(self.controls.shareControl){
				self.controls.shareControl.hideBtn();
			}
			
			if(options.search && self.controls.searchControl){
				self.controls.searchControl.showBtn();
			}else if(self.controls.searchControl){
				self.controls.searchControl.hideBtn();
			}
			
			if(options.snapshot && self.controls.snapshotControl){
				self.controls.snapshotControl.showBtn();
			}else if(self.controls.snapshotControl){
				self.controls.snapshotControl.hideBtn();
			}
			
			if(options.print && self.controls.printControl){
				self.controls.printControl.showBtn();
			}else if(self.controls.printControl){
				self.controls.printControl.hideBtn();
			}
			
			if(options.geopdf && self.controls.geopdfControl){
				self.controls.geopdfControl.showBtn();
			}else if(self.controls.geopdfControl){
				self.controls.geopdfControl.hideBtn();
			}
			
			if(options.c3d && self.controls.control3d){
				self.controls.control3d.showBtn();
			}else if(self.controls.control3d){
				self.controls.control3d.hideBtn();
			}
			
			if(options.mousePosition && self.controls.mousePositionControl){
				self.controls.mousePositionControl.show();
			}else if(self.controls.mousePositionControl){
				self.controls.mousePositionControl.hide();
			}
			
			if(options.scale && self.controls.scaleControl){
				self.controls.scaleControl.show();
			}else if(self.controls.scaleControl){
				self.controls.scaleControl.hide();
			}
			
			if(options.fons && self.controls.fonsControl){
				self.controls.fonsControl.show();
			}else if(self.controls.fonsControl){
				self.controls.fonsControl.hide();
			}
			
			if(options.legend && self.controls.llegendaControl){
				self.controls.llegendaControl.showBtn();
			}else if(self.controls.llegendaControl){
				self.controls.llegendaControl.hideBtn();
			}
			
			if(options.layers && self.controls.layersControl){
				self.controls.layersControl.showBtn();
			}else if(self.controls.layersControl){
				self.controls.layersControl.hideBtn();
			}
			
			if(options.minimap && self.controls.minimapControl){
				self.controls.minimapControl.showBtn();
			}else if(self.controls.minimapControl){
				self.controls.minimapControl.hideBtn();
			}
		},
   		
		removeCapes: function(){
			var self = this;
			//var map = self.map;
			//map.removeControl(self.controlCapes);
			$('.bt_llista').hide();
			return self;
		},
		
		drawEmbed: function(){
			var self = this;
			$('#navbar-visor').hide();
			$('#searchBar').css('top', '0');
			self.addDefaultZoomControl = false;
			_gaq.push (['_trackEvent', 'visor', 'embed']);
			return self;
		},
		
		addMousePositionControl: function(){
			var self = this,
			ctr_position,
			_map = self.map;
			ctr_position = L.control.coordinates({
	  			position : 'bottomright',
	  			'emptystring':' ',
	  			'numDigits': 2,
	  			'numDigits2': 6,
	  			'prefix': 'ETRS89 UTM 31N',
	  			'prefix2': 'WGS84',
	  			'separator': ' ',
	  			'showETRS89':true
	  		}).addTo(_map);
			
			self.controls.mousePositionControl = ctr_position;
			
			return self;
		},
		
		addScaleControl: function(){
			var self = this,
			ctr_scale,
			_map = self.map;
			ctr_scale = L.control.escala({
				position : 'bottomright', 
				'metric':true,
				'imperial':false
			}).addTo(_map);
			
			self.controls.scaleControl = ctr_scale;
			
			return self;
		},
		
		addMinimapControl: function(options){
			var self = this,
			_minTopo,
			ctr_minimap,
			_map = self.map,
			_options = { 
				toggleDisplay: true, 
				autoToggleDisplay: false,
				minimized: true,
				mapOptions: {trackResize: false}
			};
			
			_options = $.extend(_options, options);
			
			_minTopo = new L.TileLayer(URL_MQ, {
				minZoom: 0, 
				maxZoom: 19, 
				subdomains:subDomains});
			
			ctr_minimap = L.control.minimapa(_minTopo, _options).addTo(_map)._minimize();
			
			self.controls.minimapControl = ctr_minimap;
			
			return self;
		},
		
		addFonsControl: function(){
			var self = this,
			ctr_fons,
			_map = self.map;
			ctr_fons = new L.IM_controlFons().addTo(_map);
			
			self.controls.fonsControl = ctr_fons;
			
			return self;
		},
		
		addLayersControl: function(button){
			var self = this,
			btn_ctr_layers,
			_mapConfig = self.mapConfig,
			_map = self.map;
			
			button = (button !== undefined) ? button : true;
			
			btn_ctr_layers = L.control.layersBtn({
				mapConfig: _mapConfig,
				title: window.lang.convert('Llista de capes'),
				button: button
			});
			btn_ctr_layers.addTo(_map);
			
			self.controls.layersControl = btn_ctr_layers;
			
			return self;
		},
		
		addOpenInstamapsControl: function(){
			var self = this,
			ctr_linkViewMap,
			_map = self.map;
			
			ctr_linkViewMap = L.control.openInstamaps({
				businessid: self.businessid,
				urlwms: self.urlwms,
				layername: self.layername,
				title: window.lang.convert('Veure a InstaMaps'),
				fn: function(event) {
					_gaq.push (['_trackEvent', 'visor', 'veure a instamaps', 'label embed', 1]);
				}
			});
			ctr_linkViewMap.addTo(_map);
			
			self.controls.openInstamapsControl = ctr_linkViewMap;
		},
		
		addHomeControl: function(){
			var self = this,
			ctr_vistaInicial,
			_mapConfig = self.mapConfig,
			_map = self.map;
			
			ctr_vistaInicial = L.control.home({
				mapConfig: _mapConfig,
				title: window.lang.convert('Vista inicial')
			});
			ctr_vistaInicial.addTo(_map);
			
			self.controls.homeControl = ctr_vistaInicial;
			
			return self;
		},
		
		addShareControl: function(){
			var self = this,
			ctr_shareBT,
			v_url = window.location.href,
			_map = self.map;
			
			if(v_url.indexOf('localhost')!=-1){
				v_url = v_url.replace('localhost',DOMINI);
			}
			shortUrl(v_url).then(function(results){
				$('#socialShare_visor').share({
					networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
					//orientation: 'vertical',
					//affix: 'left center',
					theme: 'square',
					urlToShare: results.data.url
				});
			});	
			
			$('.share-square a').attr('target','_blank');
			
			ctr_shareBT = L.control.share({
				title: window.lang.convert('Compartir')
			});
			ctr_shareBT.addTo(_map);
			
			self.controls.shareControl = ctr_shareBT;
			
		},
		
		addRoutingControl: function(){
			var self = this,
			ctr_routingBT,
			_map = self.map;
			
			ctr_routingBT = L.control.routingControl({
				title: window.lang.convert('Routing'),
				lang: web_determinaIdioma()
			});
			
			ctr_routingBT.addTo(_map);
			
			self.controls.routingControl = ctr_routingBT;
			
			return self;
		},
		
		addLocationControl: function(){
			var self = this,
			ctr_gps,
			titleGPS = window.lang.convert('Centrar mapa a la seva ubicació'),
			textErr = window.lang.convert('Error del GPS')
			_map = self.map;
			
			//TODO agregar las opciones por defecto al control
			ctr_gps = L.control.locationControl({
				autoCenter: true,		//move map when gps location change
				style: {
					radius: 6,		//marker circle style
					weight:3,
					color: '#e03',
					fill: true,
					fillColor: '#e03',
					opacity: 1,
					fillOpacity: 0.5},
				title: titleGPS,
				textErr: textErr,	//error message on alert notification
				callErr: null		//function that run on gps error activating
			});
						
			_map.addControl(ctr_gps);
			
			self.controls.locationControl = ctr_gps;
			
			return self;
		},
		
		addSearchControl: function(){
			var self = this,
			ctr_findBT,
			_map = self.map;
			
			ctr_findBT = L.control.searchControl({
				title: window.lang.convert('Cercar'),
				searchUrl: paramUrl.searchAction+"searchInput={s}",
				inputplaceholderText: window.lang.convert('Cercar llocs al món o coordenades  ...')
			});
			_map.addControl(ctr_findBT);
			//TODO generar el control del search
			//addControlCercaEdit();
			
			self.controls.searchControl = ctr_findBT;
			
			return self;
		},
		
		addSnapshotControl: function(){
			var self = this,
			ctr_snapshot,
			_map = self.map;
			
			ctr_snapshot = L.control.snapshot({
				title: window.lang.convert('Capturar la vista del mapa')
			});
			ctr_snapshot.addTo(_map);
			
			self.controls.snapshotControl = ctr_snapshot;
			
			return self;
		},
		
		addPrintControl: function(){
			var self = this,
			ctr_printmap,
			_map = self.map;
			
			ctr_printmap = L.control.printmap({
				title: window.lang.convert('Imprimir la vista del mapa')
			});
			ctr_printmap.addTo(_map);
			
			self.controls.printControl = ctr_printmap;
			
			return self;
		},
		
		addGeopdfControl: function(){
			var self = this,
			ctr_geopdf,
			_map = self.map;
			
			ctr_geopdf = L.control.geopdf({
				title: window.lang.convert('Descarrega mapa en format GeoPDF')
			});
			ctr_geopdf.addTo(_map);
			
			self.controls.geopdfControl = ctr_geopdf;
			
			return self;
		},
		
		addLlegenda: function(){
			var self = this,
			ctr_legend,
			_map = self.map;
			
			ctr_legend = L.control.legend({
				title: window.lang.convert('Llegenda')
			});
			ctr_legend.addTo(_map);
			
			self.controls.llegendaControl = ctr_legend;
			
			return self;
		},
		
		addControl3d: function(){
			var self = this,
			ctr_3d,
			_map = self.map;
			
			ctr_3d = L.control.control3d({
				title: window.lang.convert('Descarrega mapa en format GeoPDF')
			});
			ctr_3d.addTo(_map);
			
			self.controls.control3d = ctr_3d;
			
			return self;
		},
		
		addControlLogos: function(){
			var self = this,
			ctr_logos,
			_map = self.map;
			
			ctr_logos = L.control.logos();
			ctr_logos.addTo(_map);
			
			self.controls.controlLogos = ctr_logos;
			
			return self;
		},
		
		drawMap: function(){
			var self = this,
			_map = self.map;
			map = self.map;
			
			self._listenEvents();
			return self;
		},
		
		drawControls: function(){
			var self = this;
			
			self.addControlLogos();
			
			if(!self.mouseposition){
				self.addMousePositionControl();
			}
			if(!self.scalecontrol){
				self.addScaleControl();
			}
			if(!self.minimapcontrol){
				self.addMinimapControl();
			}
			
			if(!self.fonscontrol){
				self.addFonsControl();
			}
			if(!self.ltoolbar){
				if(self.embed){
					if(!self.openinstamaps ){
						self.addOpenInstamapsControl();
					}
				}
				if(!self.homecontrol){
					self.addHomeControl();
				}
				if(!self.locationcontrol){
					self.addLocationControl();
				}
				if(!self.sharecontrol){
					self.addShareControl();
				}
				if(!self.searchcontrol){
					self.addSearchControl();
				}
				if(!self.routingcontrol){
					self.addRoutingControl();
				}
			}
			
			if(!self.rtoolbar){
				if(!self.layerscontrol){
					self.addLayersControl();
				}
				if(!self.control3d){
					self.addControl3d();
				}
				if(!self.snapshotcontrol){
					self.addSnapshotControl();
				}
				if(!self.printcontrol){
					self.addPrintControl();
				}
				if(!self.geopdfcontrol){
					self.addGeopdfControl();
				}
			}else{
				self.addLayersControl(false);
			}
			
			if(!self.llegenda){
				self.addLlegenda();
			}
			
			return self;
		},
		
		loadErroPage: function(){
			//TODO redirect a la pagina de error 404
			window.location.href = paramUrl.galeriaPage;
		},
		
		loadLoginPage: function(){
			window.location.href = paramUrl.loginPage;
		},
		
		loadMapConfig: function(){
			var self = this,
			_map = self.map,
			_uid = self.uid,
			_businessid = self.businessid,
			_mapacolaboratiu = self.mapacolaboratiu,
			data = {
				businessId: _businessid,
				id: _uid,
				mapacolaboratiu: _mapacolaboratiu,
				uid: _uid	
			};
			getCacheMapByBusinessId(data).then(function(results){
				if (results.status == "ERROR"){
					self.loadErroPage();
				}else if (results.status == "PRIVAT"){
					//ocultar las pelotas
					self._hideLoading();
					//mostar modal con contraseña
					loadPasswordModal();
				}else{
					var uidUrl = _uid;
					if ( _mapacolaboratiu && !$.cookie('uid')) {
						$.cookie('collaboratebid', _businessid, {path:'/'});
						$.cookie('collaborateuid', _uid, {path:'/'});
						self.loadLoginPage();
					}
					else if (_mapacolaboratiu && _uid != $.cookie('uid')) {
						$.removeCookie('uid', { path: '/' });
						$.cookie('collaboratebid', _businessid, {path:'/'});
						$.cookie('collaborateuid', _uid, {path:'/'});
						self.loadLoginPage();
					}
					else if (_mapacolaboratiu && _uid === $.cookie('uid')) {
						//window.location.href = paramUrl.galeriaPage+"?private=1";
						window.location=paramUrl.mapaPage+"?businessid="+_businessid+"&mapacolaboratiu=si";
					}
					if(results.status === "OK"){
						var mapConfig = $.parseJSON(results.results);
						mapConfig.options = $.parseJSON(mapConfig.options);
						self._mapConfig = mapConfig;
						_map.fire('loadconfig', mapConfig);
						$.publish('loadConfig', mapConfig);
					}
				}
			});
		},
		
		loadApp: function(){
			var self = this,
			_map = self.map,
			mapConfig = self._mapConfig;
			
			self._loadPublicMap(mapConfig);
			
			return self;
		},
		
		_loadPublicMap: function(mapConfig){
			var self = this,
				nomUser = mapConfig.entitatUid.split("@"),
				nomEntitat = mapConfig.nomEntitat,
				infoHtml = '';
			
			$('meta[name="og:title"]').attr('content', "Mapa "+mapConfig.nomAplicacio);
			
			$.cookie('perfil', 'instamaps', {path:'/'});
			checkUserLogin();
			
			infoHtml += '<p>'+nomUser[0]+'</p>';
			
			if (mapConfig.options){
				var desc=mapConfig.options.description;

				desc==""?desc=mapConfig.nomAplicacio:desc=desc;

				$('meta[name="description"]').attr('content', desc+' - Fet amb InstaMaps.cat');
				$('meta[name="og:description"]').attr('content', desc+' - Fet amb InstaMaps.cat');

				var urlThumbnail = GEOCAT02 + paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + url('?businessid');
				$('meta[name="og:image"]').attr('content', urlThumbnail);

				if (mapConfig.options.description!=undefined) infoHtml += '<p>'+mapConfig.options.description+'</p>';
				if (mapConfig.options.tags!=undefined) infoHtml += '<p>'+mapConfig.options.tags+'</p>';
				
				$('.escut').hide();
			}
			$("#mapTitle").html(mapConfig.nomAplicacio + '<span id="infoMap" lang="ca" class="glyphicon glyphicon-info-sign pop" data-toggle="popover" title="Informació" data-lang-title="Informació" ></span>');

			$('#infoMap').popover({
				placement : 'bottom',
				html: true,
				content: infoHtml
			});

			$('#infoMap').on('show.bs.popover', function () {
				$(this).attr('data-original-title', window.lang.convert($(this).data('lang-title')));		
			});
		
			//TODO quitar la global ya que se usa en el control de capas.
			downloadableData = (mapConfig.options && mapConfig.options.downloadable?
					mapConfig.options.downloadable:[]);
			
			mapConfig.newMap = false;
			$('#nomAplicacio').html(mapConfig.nomAplicacio);
			
			self._loadMapConfig(mapConfig).then(function(){
				
			});
		},
		
		_loadMapConfig: function(mapConfig){
			var self = this,
			_map = self.map,
			dfd = $.Deferred();
			
			if (!$.isEmptyObject( mapConfig )){
				
				$('#businessId').val(mapConfig.businessId);
				//TODO ver los errores de leaflet al cambiar el mapa de fondo
				//cambiar el mapa de fondo a orto y gris
				if (mapConfig.options != null){
					var fons = mapConfig.options.fons;
					if (fons == 'topoMap'){
						_map.topoMap();
					}else if (fons == 'topoMapGeo') {
						_map.topoMapGeo();
					}else if (fons == 'ortoMap') {
						_map.ortoMap();
					}else if (fons == 'terrainMap') {
						_map.terrainMap();
					}else if (fons == 'topoGrisMap') {
						_map.topoGrisMap();
					}else if (fons == 'historicOrtoMap') {
						_map.historicOrtoMap();
					}else if (fons == 'historicMap') {
						_map.historicMap();
					}else if (fons == 'hibridMap'){
						_map.hibridMap();
					}else if (fons == 'historicOrtoMap46'){
						_map.historicOrtoMap46();
					}else if (fons == 'alcadaMap'){
						_map.alcadaMap();
					}else if (fons == 'colorMap') {
						_map.colorMap(mapConfig.options.fonsColor);
					}else if (fons == 'naturalMap') {
						_map.naturalMap();
					}else if (fons == 'divadminMap') {
						_map.divadminMap();
					}
					_map.setActiveMap(mapConfig.options.fons);
					_map.setMapColor(mapConfig.options.fonsColor);
				}
				
				//carga las capas en el mapa
				self._loadOrigenWMS(mapConfig).then(function(results){
					var num_origen = 0;
					$.each(results.origen, function(index, value){
						loadLayer(value).then(function(){
							num_origen++;
							if (num_origen == results.origen.length){
								$.each(results.sublayers, function(index, value){
									loadLayer(value);
								});
							}
						});
					});
				});

				self._hideLoading();	
				//$(window).trigger('resize');
			}
			dfd.resolve();
			return dfd.promise();
		},
		
		_loadOrigenWMS: function(mapConfig){
			var dfd = $.Deferred(),
			layer_map = {origen:[],sublayers:[]};
			
			$.each(mapConfig.servidorsWMS, function(index, value){
				//TODO parsear las options y el group y dejarlo en json.
				//TODO quitar el parse de cada tipo de capa.
				if(value.options && value.capesGroup){
					var options;
					if(typeof (value.options)=="string"){
						try {
							options = JSON.parse(value.options);
						}
						catch (err) {
							options = value.options;
						}
					}else{
						options = value.options;
					}

					var group = JSON.parse(value.capesGroup);
					options.group = group;
					value.options = JSON.stringify(options);
				}
				if(value.capesOrdre == capesOrdre_sublayer){
					layer_map.sublayers.push(value);
					lsublayers.push(value);
				}else{
					layer_map.origen.push(value);
				}
			});

			$.each(layer_map.origen, function(index, value){
				var jsonOptions;
				if(typeof (value.options)=="string"){
					try {
						jsonOptions = JSON.parse(value.options);
					}
					catch (err) {
						jsonOptions = value.options;
					}
				}else{
					jsonOptions = value.options;
				}

				if(jsonOptions && jsonOptions.group){
					if(controlCapes){
						controlCapes._addGroupFromObject(jsonOptions.group);
					}
				}
			});

			dfd.resolve(layer_map);
			return dfd.promise();
		},
		
		loadVisorSimple: function(){
			var self = this,
			layername = self.layername,
			title = "Mapa  "+ layername +" cloudifier",
			_map = self.map;
			
			$('meta[name="og:title"]').attr('content', title);
			$('#nomAplicacio').html(title);
			document.title = title;
			$("#mapTitle").html(title);

			activaPanelCapes(true);

			//Actualitza idioma dels tooltips
			$("body").on("change-lang", function(event, lang){
				window.lang.change(lang);
				window.lang.run(lang);
				updateLangTooltips();
				updateLangText();
			});
			canviaIdioma(web_determinaIdioma());

			self._hideLoading();
			return self;
		},
		
		setMapWMSBoundingBox: function(url){
			getWMSLayers(url).then(function(results) {
				//Fem Layer.Layer perq des de el cloudifier sempre tindrem nomes una capa
				var bbox = results.Capability.Layer.Layer.LatLonBoundingBox;
				map.fitBounds([
			       [bbox["@miny"], bbox["@minx"]],
			       [bbox["@maxy"], bbox["@maxx"]]
				]);
			},function(){
				console.error("Error getCapabilities");
				//console.debug(results);
			});
		},
		
		loadWmsVisorSimple: function(){
			var self = this;
			layername = self.layername,
			map = self.map,
			layer = {
				"url": self.urlwms,
				"servername": layername,
				"layers": layername,
			    "imgFormat": "image/png",
			    "transparency": "true",
			    "version": "1.1.1",
			    "opacity": 1,
			    "epsg": undefined,
				"serverName": layername,
				"serverType": t_wms,
				"capesActiva": "true",
				"capesCalenta" : "false",
				"capesOrdre":  "1",
				"capesVisibilitat":  "true",
				"visibilitat": "O",
			    "businessId": "-1"
			};
			loadWmsLayer(layer, map);
			self.setMapWMSBoundingBox(layer.url);
			return self;
		},
		
		_drawVisor: function(){
			var self = this,
			map = self.map,
			mapConfig = self._mapConfig;
			
			if(mapConfig.tipusAplicacioId == TIPUS_APLIACIO_INSTAMAPS){
				self._initCenter().drawMap().resizeMap().drawControls().loadApp()._hideLoading();
			}else if(mapConfig.tipusAplicacioId == TIPUS_APLIACIO_GEOLOCAL){
				self._initCenter().drawMap().resizeMap().drawControls().loadApp()
				._drawVisorGeolocal()._hideLoading();
			}
			return self;
		},
		
		_drawVisorGeolocal: function(){
			var self = this;
			
			var visorGeolocal = VisorGeolocal({visor:self}).draw();
			
			return self;
		},
		
		_initCenter: function(){
			var self = this,
			_map = self.map,
			mapConfig = self._mapConfig;
			
			var hash = location.hash;
			hashControl = new L.Hash(_map);
			var parsed = hashControl.parseHash(hash);
			if (parsed){
				hashControl.update();
			}else{
				if (mapConfig.options.center){
					var opcenter = mapConfig.options.center.split(",");
					_map.setView(L.latLng(opcenter[0], opcenter[1]), mapConfig.options.zoom);
				}else if (mapConfig.options.bbox){
					var bbox = mapConfig.options.bbox.split(",");
					var southWest = L.latLng(bbox[1], bbox[0]);
				    var northEast = L.latLng(bbox[3], bbox[2]);
				    var bounds = L.latLngBounds(southWest, northEast);
				    _map.fitBounds( bounds );
				}
			}
			return self;
		},
		
		draw: function(){
			var self = this,
			   	_map = self.map;
			
			changeInitVisor();
			
			$(window).resize(_.debounce(function(){
				self.resizeMap();
			},150));
			
			if(self.businessid){
				self.loadMapConfig();
				_map.on('loadconfig', self._drawVisor, self);
			}/*else{
				if(self.urlwms){ //cloudifier
					
					self.fonscontrol = true;
					self.drawMap().resizeMap();
					self.loadVisorSimple();
					self.loadWmsVisorSimple();
				}else{
					self.loadErroPage();
				}
			}
			*/
			
			/*
			if(self.embed){
				self.drawEmbed();
			}else{
				$.publish('trackEvent',{event:['_trackEvent', 'visor', 'no embed']});
			}
						
			if(self.urlwms){
				self.fonscontrol = true;
				self.drawMap().resizeMap();
				self.loadVisorSimple();
				self.loadWmsVisorSimple();
			}else{
				if(self.businessid){
					if(self.embed){
						self.addLogoInstamap();
						
						setTimeout(function(){
							self.removeLogoInstamap();
						},5000);
						
						
					}
					self.drawMap().resizeMap().drawControls()._hideLoading();
					
					self.loadApp();		
				}else{
					self.loadErroPage();
				}
			}
			*/
		},
		
		_showRoutingEvent: function(){
			$.publish('trackEvent',{event:['_trackEvent', 'visor', this.tipusUser+'routing', 'label routing', 1]});
		},
		
		_mapsnapshotEvent: function(){
			$.publish('trackEvent',{event:['_trackEvent', 'visor', this.tipusUser+'captura pantalla', 'label captura', 1]});
		},
		
		_mapprintEvent: function(){
			$.publish('trackEvent',{event:['_trackEvent', 'visor', this.tipusUser+'print', 'label print', 1]});
		},
		
		_mapgeopdfEvent: function(){
			$.publish('trackEvent',{event:['_trackEvent', 'visor', this.tipusUser+'geopdf', 'label geopdf', 1]});
		},
		
		_map3dmodeEvent: function(){
			$.publish('trackEvent',{event:['_trackEvent', 'visor', this.tipusUser + '3D', 'label 3D', 1]});
		},
		
		_hideLoading: function(){
			$('#div_loading').hide();
			return this;
		},
		
		_listenEvents: function(){
			var self = this,
				_map = self.map;
			if(_map){
				_map.on('showRouting', self._showRoutingEvent, self);
				_map.on('mapsnapshot', self._mapsnapshotEvent, self);
				_map.on('mapprint', self._mapprintEvent, self);
				_map.on('mapgeopdf', self._mapgeopdfEvent, self);
				_map.on('map3dmode', self._map3dmodeEvent, self);
			}
		}
	};
	
	Visor.init = function(options){
		var self = this;
		self = $.extend(self, visorOptions, options);
	}
	
	Visor.init.prototype = Visor.prototype;
	
	global.Visor = Visor;
	
}(window, jQuery));
