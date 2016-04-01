/**
 * require jQuery
 * require geocat.web-1.0.0
 * require geocat.mapa.edit-data-table
 * require url.min
 * require leaflet
 * require L.IM_Map
 * require L.IM_controlFons   
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
		logosContainerId: '#logos',
		map: map_
	};
	
	var changeInitVisor = function(){
		jQuery('.container').css('width','95%');
		//TODO ver como hacer para no depender del timeout
		//if (!isIframeOrEmbed()) setTimeout('activaPanelCapes(false)',3000);
	};
	
	
	Visor.prototype = {
		addLogoInstamap: function(){
			var self = this;
   			$.get("templates/logoInstamaps.html",function(data){
   				self.logosContainer.append(data);
   			});
   			return self;
   		},	
		
   		resizeMap: function(){
			var self = this,
			factorH = 0,
			factorW = 0,
			_window = $( window ),
			widthW = _window.width(),
			heightW = _window.height(),
			_map = $('#map'),
			width = _map.width(),
			height = _map.height(),
			cl = jQuery('.bt_llista span').attr('class');
			if(self.embed){//Pel cas visor, embeded
				factorH = 0;
			}else{
				factorH = $('.navbar').css('height').replace(/[^-\d\.]/g, '');
			}
			_map.css('top', factorH + 'px');
			_map.height(heightW - factorH);
			_map.width(widthW - factorW);
			
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
   		
		removeCapes: function(){
			var self = this;
			//var map = self.map;
			//map.removeControl(self.controlCapes);
			$('.bt_llista').hide();
			return self;
		},
		
		drawEmbed: function(){
			var self = this;
			jQuery('#navbar-visor').hide();
			jQuery('#searchBar').css('top', '0');
			self.addDefaultZoomControl = false;
			_gaq.push (['_trackEvent', 'visor', 'embed']);
			return self;
		},
		
		addMousePositionControl: function(){
			var self = this,
			_map = self.map;
			L.control.coordinates({
	  			position : 'bottomright',
	  			'emptystring':' ',
	  			'numDigits': 2,
	  			'numDigits2': 6,
	  			'prefix': 'ETRS89 UTM 31N',
	  			'prefix2': 'WGS84',
	  			'separator': ' ',
	  			'showETRS89':true
	  		}).addTo(_map);
			return self;
		},
		
		addScaleControl: function(){
			var self = this,
			_map = self.map;
			L.control.scale({
				position : 'bottomright', 
				'metric':true,
				'imperial':false
			}).addTo(_map);
			return self;
		},
		
		addMinimapControl: function(options){
			var self = this,
			_minTopo,
			_map = self.map,
			_options = { 
				toggleDisplay: true, 
				autoToggleDisplay: true
			};
			
			_options = $.extend(_options, options);
			
			_minTopo = new L.TileLayer(URL_MQ, {
				minZoom: 0, 
				maxZoom: 19, 
				subdomains:subDomains});
			new L.Control.MiniMap(_minTopo, _options).addTo(_map);
			return self;
		},
		
		addFonsControl: function(){
			var self = this,
			_map = self.map;
			new L.IM_controlFons().addTo(_map);
			return self;
		},
		
		addLayersControl: function(){
			var self = this,
			_map = self.map;
			
			controlCapes = L.control.orderlayers(null, null, {
				collapsed : false,
				id : 'div_capes'
			}).addTo(_map);

			_map.on('addItemFinish',function(){
				$(".layers-list").mCustomScrollbar("destroy");
				$(".layers-list").mCustomScrollbar({
				   advanced:{
				     autoScrollOnFocus: false,
				     updateOnContentResize: true
				   }
				});
			});
			
			return self;
		},
		
		addOpenInstamapsControl: function(){
			var self = this,
			_map = self.map;
			
			var ctr_linkViewMap = L.control.openInstamaps({
				businessid: self.businessid,
				urlwms: self.urlwms,
				layername: self.layername,
				title: window.lang.convert('Veure a InstaMaps'),
				fn: function(event) {
					_gaq.push (['_trackEvent', 'visor', 'veure a instamaps', 'label embed', 1]);
				}
			});
			ctr_linkViewMap.addTo(_map);
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
				jQuery('#socialShare_visor').share({
					networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
					//orientation: 'vertical',
					//affix: 'left center',
					theme: 'square',
					urlToShare: results.data.url
				});
			});	
			
			jQuery('.share-square a').attr('target','_blank');
			
			ctr_shareBT = L.control.share({
				title: window.lang.convert('Compartir')
			});
			ctr_shareBT.addTo(_map);
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
			
			return self;
		},
		
		addLocationControl: function(){
			var self = this,
			ctr_gps,
			titleGPS = window.lang.convert('Centrar mapa a la seva ubicació'),
			_map = self.map;
			
			ctr_gps = new L.Control.Gps({
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
				textErr: 'Error del GPS',			//error message on alert notification
				callErr: null,			//function that run on gps error activating
			});
			_map.addControl(ctr_gps);
			
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
			
			return self;
		},
		
		addLlegenda: function(){
			
		},
		
		addControl3d: function(){
			var self = this,
			ctr_3d,
			_map = self.map;
			
			ctr_3d = L.control.control3d({
				title: window.lang.convert('Descarrega mapa en format GeoPDF')
			});
			ctr_3d.addTo(_map);
			
			return self;
		},
		
		drawMap: function(){
			var self = this,
			_map = self.map;
			map = self.map;
			if(!self.mouseposition){
				self.addMousePositionControl();
			}
			if(!self.scalecontrol){
				self.addScaleControl();
			}
			if(!self.minimapcontrol){
				self.addMinimapControl();
			}else{
				self.addMinimapControl({toggleDisplay: false});
			}
			if(!self.fonscontrol){
				self.addFonsControl();
			}
			if(!self.layerscontrol){
				self.addLayersControl();
			}
			if(self.embed){
				if(!self.openinstamaps){
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
			if(!self.layerscontrol){
				
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
			if(!self.llegenda){
				self.addLlegenda();
			}
			
			
			self._listenEvents();
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
					jQuery('#div_loading').hide();
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
					//loadPublicMap(results);
					
					if(results.status === "OK"){
						var mapConfig = $.parseJSON(results.results);
						mapConfig.options = $.parseJSON(mapConfig.options);
						_map.fire('loadconfig', mapConfig);
					}
					
				}
			});
		},
		
		loadApp: function(){
			var self = this;
			
			self.loadMapConfig();
			
			jQuery('#div_loading').hide();
			return self;
		},
		
		loadVisorSimple: function(){
			var self = this;
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

			jQuery('#div_loading').hide();
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
		
		draw: function(){
			var self = this;
			changeInitVisor();
			
			$(window).resize(_.debounce(function(){
				self.resizeMap();
			},150));
			
			if(self.embed){
				self.drawEmbed();
			}else{
				_gaq.push (['_trackEvent', 'visor', 'no embed']);
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
					}
					self.drawMap().resizeMap();
					self.loadApp();		
				}else{
					self.loadErroPage();
				}
			}
			//jQuery(window).trigger('resize');
		},
		
		_showRoutingEvent: function(){
			_gaq.push(['_trackEvent', 'visor', this.tipusUser+'routing', 'label routing', 1]);
		},
		
		_mapsnapshotEvent: function(){
			_gaq.push(['_trackEvent', 'visor', this.tipusUser+'captura pantalla', 'label captura', 1]);
		},
		
		_mapprintEvent: function(){
			_gaq.push(['_trackEvent', 'visor', this.tipusUser+'print', 'label print', 1]);
		},
		
		_mapgeopdfEvent: function(){
			_gaq.push(['_trackEvent', 'visor', this.tipusUser+'geopdf', 'label geopdf', 1]);
		},
		
		_listenEvents: function(){
			console.debug("aca");
			var self = this,
				_map = self.map;
			if(_map){
				_map.on('showRouting', self._showRoutingEvent, self);
				_map.on('mapsnapshot', self._mapsnapshotEvent, self);
				_map.on('mapprint', self._mapprintEvent, self);
				_map.on('mapgeopdf', self._mapgeopdfEvent, self);
				
			}
		}
	};
	
	Visor.init = function(options){
		console.debug(options);
		var self = this;
		self = $.extend(self, visorOptions, options);
		self.logosContainer = $(self.logosContainerId);
	}
	
	Visor.init.prototype = Visor.prototype;
	
	global.Visor = Visor;
	
}(window, jQuery));
