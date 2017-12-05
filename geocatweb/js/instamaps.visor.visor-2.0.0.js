/**
 * require geocat.ajax-1.0.0
 * require geocat.web-1.0.0
 * require geocat.mapa.edit-data-table
 * require leaflet
 * require L.IM_Map
 * require L.IM_controlFons
 * require jQuery.cookie
 * require geocat.utils
 * require geocat.constants
 * require instamaps.visor.geolocal
 */

;(function(global, $){

	var Visor = function(options){
		return new Visor.init(options);
	}

	var map_ = new L.IM_Map('map', {
	  	zoomAnimation: false,
        typeMap : "topoMapGeo",
        minZoom: 2,
        maxZoom : 19,
        zoomControl: true,
        timeDimension: true,
	    timeDimensionControl: true,
	    timeDimensionControlOptions:{
	    	speedSlider:false
	    },
	    spinerDiv: 'div_loading'
	}).setView([ 41.431, 1.8580 ], 8);

	var visorOptions = {
		addDefaultZoomControl: true,
		controls: {},
		map: map_
	};

	var changeInitVisor = function(){
		$('.container').css('width','95%');
	};

	Visor.prototype = {
		addLogoInstamap: function(){
			var self = this;
			$.get("/geocatweb/templates/logoInstamaps.html",function(data){
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

			if(widthW<500 || heightW<=350){
				optionsBtn = {
					openInstamaps: true,
					home: false,
					routing: false,
					search: false,
					location: false,
					share: false,
					like: false,
					snapshot: false,
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
					like: true,
					snapshot: true,
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

			if(options.like && self.controls.likeControl){
				self.controls.likeControl.showBtn();
			}else if(self.controls.likeControl){
				self.controls.likeControl.hideBtn();
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

			if(options.c3d && self.controls.control3d){
				self.controls.control3d.showBtn();
			}else if(self.controls.control3d){
				self.controls.control3d.hideBtn();
			}

			if(options.mousePosition && self.controls.mousePositionControl){
				self.controls.mousePositionControl.showBtn();
			}else if(self.controls.mousePositionControl){
				self.controls.mousePositionControl.hideBtn();
			}

			if(options.scale && self.controls.scaleControl){
				self.controls.scaleControl.showBtn();
			}else if(self.controls.scaleControl){
				self.controls.scaleControl.hideBtn();
			}

			if(options.fons && self.controls.fonsControl){
				self.controls.fonsControl.showBtn();
			}else if(self.controls.fonsControl){
				self.controls.fonsControl.hideBtn();
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
			return self;
		},

		hideControl: function(control){
			var self = this;
			if(self.controls[control]){
				self.controls[control].hideBtn();
			}
			return self;
		},

		showControl: function(control){
			var self = this;
			if(self.controls[control]){
				self.controls[control].showBtn();
			}
			return self;
		},

		removeCapes: function(){
			var self = this;
			$('.bt_llista').hide();
			return self;
		},

		drawEmbed: function(){
			var self = this;
			$('#navbar-visor').hide();
			$('#searchBar').css('top', '0');

			//Per defecte embed té el control de zoom, el botó d'obrir finestra Instamaps i el control de capes.
			self.addDefaultZoomControl = 1;
			self.openinstamaps = 1;
			//self.layerscontrol = 1;
			self.ltoolbar=1;
			self.rtoolbar=1;

			if (!self.mouseposition) self.mouseposition = 0;
			if (!self.scalecontrol) self.scalecontrol = 0;
			if (!self.minimapcontrol) self.minimapcontrol = 0;
			if (!self.fonscontrol) self.fonscontrol = 0;

			if (!self.homecontrol) self.homecontrol = 0;
			if (!self.locationcontrol) self.locationcontrol = 0;
			if (!self.sharecontrol) self.sharecontrol = 0;
			if (!self.searchcontrol) self.searchcontrol = 0;
			if (!self.routingcontrol) self.routingcontrol = 0;
			if (!self.likecontrol) self.likecontrol = 0;

			if (!self.control3d) self.control3d = 0;

			if (!self.snapshotcontrol) self.snapshotcontrol = 0;

			if (!self.printcontrol) self.printcontrol = 0;
			if (!self.geopdfcontrol) self.geopdfcontrol = 0;

			if (!self.llegenda) self.llegenda = 0;
			if (!self.colorscalecontrol) self.colorscalecontrol = 0;
			
			if (!self.layerscontrol) self.layerscontrol=0;
			
			if (!self.measurecontrol) self.measurecontrol=0;

			$.publish('analyticsEvent',{event:[ 'visor', 'embed']});
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
			ctr_fons = new L.IM_controlFons({
				title: window.lang.translate('Escollir el mapa de fons'),
			}).addTo(_map);

			self.controls.fonsControl = ctr_fons;

			return self;
		},

		addLayersControl: function(button){
			var self = this,
			btn_ctr_layers,
			_mapConfig = self._mapConfig,
			_map = self.map;

			button = (button !== undefined) ? button : true;

			btn_ctr_layers = L.control.layersBtn({
				mapConfig: _mapConfig,
				title: window.lang.translate('Llista de capes'),
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
				title: window.lang.translate('Veure a InstaMaps'),
				fn: function(event) {
					
					$.publish('analyticsEvent',{event:['visor', 'button#veureInstamaps', 'label embed', 1]});
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
				title: window.lang.translate('Vista inicial')
			});
			ctr_vistaInicial.addTo(_map);

			self.controls.homeControl = ctr_vistaInicial;

			return self;
		},

		addLikeControl: function(){
			var self = this,
			ctr_like,
			_mapConfig = self.mapConfig,
			_map = self.map;

			ctr_like = L.control.like({
				mapConfig: _mapConfig,
				title: window.lang.translate("M'agrada")
			});
			ctr_like.addTo(_map);

			self.controls.likeControl = ctr_like;

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
			if (v_url.indexOf("mapacolaboratiu=si")>-1) v_url=v_url.replace("&mapacolaboratiu=si","");

			shortUrl(v_url).then(function(results){
				$('#socialShare_visor').share({
					networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
					//orientation: 'vertical',
					//affix: 'left center',
					theme: 'square',
					urlToShare: results.id
				});
			});

			$('.share-square a').attr('target','_blank');

			ctr_shareBT = L.control.share({
				title: window.lang.translate('Compartir')
			});
			ctr_shareBT.addTo(_map);

			self.controls.shareControl = ctr_shareBT;

		},

		addRoutingControl: function(){
			var self = this,
			ctr_routingBT,
			_map = self.map;

			ctr_routingBT = L.control.routingControl({
				title: window.lang.translate('Routing'),
				lang: web_determinaIdioma()
			});

			ctr_routingBT.addTo(_map);

			self.controls.routingControl = ctr_routingBT;

			return self;
		},

		addLocationControl: function(){
			var self = this,
			ctr_gps,
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
				title: window.lang.translate('Centrar mapa a la seva ubicació'),
				textErr: window.lang.translate('Error del GPS'),	//error message on alert notification
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
				title: window.lang.translate('Cercar'),
				searchUrl: paramUrl.searchAction+"searchInput={s}",
				inputplaceholderText: window.lang.translate('Cercar llocs al món o coordenades  ...')
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

			ctr_snapshot = L.control.mapExport({
				title: window.lang.translate('Capturar la vista del mapa')
			});
			ctr_snapshot.addTo(_map);

			self.controls.snapshotControl = ctr_snapshot;

			return self;
		},



		addAppModul:function(modul){

			var self = this,
			ctr_arbres,
			ctr_sostenibilitat,
			_map = self.map;
			if(modul=='arbres'){
				$.getScript( "/moduls/" + modul + "/js/modul_"+modul+"_1.0.0.js", function( data, textStatus, jqxhr ) {
					if (jqxhr.status==200){
					ctr_arbres=L.control.addmodulArbres(new L.geoJson()).addTo(_map);
					self.controls.arbresControl = ctr_arbres;
					}
				});
			}else if(modul=='sostenibilitat'){		

			
			
				try{
			
				$.getScript( "/moduls/" + modul + "/js/modul-"+modul+"-2.0.0.js", function( data, textStatus, jqxhr ) {
		
					
					if (jqxhr.status==200){
						
						if(self._mapConfig && self._mapConfig.options && self._mapConfig.options.sostenibilitat){					
					ctr_sostenibilitat=new L.control.addModulSostenibilitat(new L.geoJson()).addTo(_map);
					self.controls.sostenibilitatControl = ctr_sostenibilitat;									
					ctr_sostenibilitat.setOptionsSostenibilitat(self._mapConfig.options.sostenibilitat);
						}					
					}
				}).fail(function( jqxhr, settings, exception ) {
						console.info(jqxhr);
						console.info(settings);
						console.info(exception);				
				});  		
				}catch(Err){				
					console.info(Err);
				}				
			}	
			return self;

		},

		addLlegenda: function(){
			var self = this,
			ctr_legend,
			_map = self.map;

			ctr_legend = L.control.legend({
				title: window.lang.translate('Llegenda'),
				tipusllegenda: self.tipusllegenda,  //"dinamica"
				llegendaOpt: self.llegendaOpt,
				origenllegenda:'visor'
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
				title: window.lang.translate('Canviar vista')
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

			if((self.mouseposition && self.mouseposition=="1") || self.mouseposition===null){
				self.addMousePositionControl();
			}
			if((self.scalecontrol && self.scalecontrol=="1") || self.scalecontrol===null){
				self.addScaleControl();
			}
			if((self.minimapcontrol && self.minimapcontrol=="1") || self.minimapcontrol===null){
				self.addMinimapControl();
			}

			if((self.fonscontrol && self.fonscontrol=="1") || self.fonscontrol===null) {
				self.addFonsControl();
			}

			if((self.ltoolbar && self.ltoolbar=="1") || (self.ltoolbar===null)){
				if(self.embed){
					if((self.openinstamaps && self.openinstamaps=="1") || (self.openinstamaps===null)){
						self.addOpenInstamapsControl();
					}
				}
				if((self.homecontrol && self.homecontrol=="1") || self.homecontrol===null ){
					self.addHomeControl();
				}
				if((self.locationcontrol && self.locationcontrol=="1") || self.locationcontrol===null){
					self.addLocationControl();
				}
				if((self.searchcontrol && self.searchcontrol=="1") || self.searchcontrol===null){
					self.addSearchControl();
				}
				if((self.routingcontrol && self.routingcontrol=="1") || self.routingcontrol===null ){
					self.addRoutingControl();
				}
				if((self.sharecontrol && self.sharecontrol=="1") || self.sharecontrol===null){
					self.addShareControl();
				}
				if((self.likecontrol && self.likecontrol=="1") || self.likecontrol===null){
					self.addLikeControl();

				}

			}

			if((self.rtoolbar && self.rtoolbar=="1") || (self.rtoolbar===null)){
				if((self.layerscontrol && self.layerscontrol=="1") || (self.layerscontrol===null)){
					self.addLayersControl();
				}else{
					self.addLayersControl(false);
				}

				if((self.control3d && self.control3d=="1") || self.control3d===null) {
					self.addControl3d();
				}



				if((self.snapshotcontrol && self.snapshotcontrol=="1") || self.snapshotcontrol===null){


					self.addSnapshotControl();
				}else if((self.printcontrol && self.printcontrol=="1") || self.printcontrol===null){


				//	self.addSnapshotControl();
				}
				else if ((self.geopdfcontrol && self.geopdfcontrol=="1") || self.geopdfcontrol===null){


				//	self.addSnapshotControl();
				}



			}else{
				self.addLayersControl(false);
			}
			if((self.llegenda && self.llegenda=="1") || self.llegenda===null){
				var hasLayers = false;
				if(self._mapConfig && self._mapConfig.hasOwnProperty("legend"))
				{

					var leg = JSON.parse(self._mapConfig.legend);
					var keys = Object.keys(leg);
					for(var i=0; i<keys.length; ++i) {
						for  (var j=0;j<leg[keys[i]].length;j++){
							if (hasLayers || leg[keys[i]][j].chck) {
								hasLayers=hasLayers || leg[keys[i]][j].chck;
							}
						}

					}

					if (!self.nollegenda && hasLayers) {
						self.addLlegenda();
						if (self.llegendaOpt==false){
							self.controls.llegendaControl.button.show();
						}
					};

				}
			}

			if(self.appmodul){
				self.addAppModul(self.appmodul);

			}

			return self;
		},

		loadErrorPage: function(){
			//TODO redirect a la pagina de error 404
			//console.debug("error");
			$.publish('analyticsEvent',{event:['error', 'loadingPage','loadErrorPage']});	
			window.location.href = paramUrl.galeriaPage;
		},

		loadLoginPage: function(){
			window.location.href = paramUrl.loginPage;
		},

		//hace el redirect para que el invitado al colaborativo pueda ver que puede editar el mapa
		loadMapaColaboratiuPage: function(){
			var self = this,
			_businessid = self.businessid;
			window.location = paramUrl.mapaPage+"?businessid="+_businessid+"&mapacolaboratiu=si";
		},

		_loadPasswordModal: function(){
			var self = this,
			_businessid = self.businessid;

			$('#dialog_password').modal('show');

			$('#dialog_password .btn-primary').on('click',function(){
				var clau = $.trim($('#inputPassword').val());
				if(clau == ""){
					$('#password_msg').removeClass('hide');
				}else{
					$('#password_msg').addClass('hide');
					var data = {
						clauVisor: clau,
						businessId: _businessid
					};
					loadPrivateMapByBusinessId(data).then(function(results){
						if(results.status == "ERROR"){
							$('#password_msg').removeClass('hide');
						}else{
							self._beforeLoadConfig(results);
							$('#password_msg').addClass('hide');
							$('#dialog_password').modal('hide');
						}
					});
				}
			});

			return self;
		},

		_colaboratiuToLogin: function(){
			var self = this,
			_uid = self.uid;
			_businessid=self.businessid;
			Cookies.remove('uid');
			Cookies.set('collaboratebid', _businessid);
			Cookies.set('collaborateuid', _uid);
			self.loadLoginPage();

			return self;
		},

		_beforeLoadConfig: function(results){
			var self = this,
			_map = self.map,
			_uid = self.uid,
			_businessid = self.businessid,
			_mapacolaboratiu = self.mapacolaboratiu;

			if ( _mapacolaboratiu  &&  _mapacolaboratiu=="alta" && !Cookies.get('uid')) {
				self._colaboratiuToLogin();
			}
			else if (_mapacolaboratiu &&  _mapacolaboratiu=="alta" && _uid!=Cookies.get('uid')) {
				self._colaboratiuToLogin();
			}
			else if (url('?mapacolaboratiu') &&  url('?mapacolaboratiu')=="alta" && _uid==Cookies.get('uid')) {
				self.loadMapaColaboratiuPage();
			}
			var _mapConfig;
			if (undefined != results.results) _mapConfig= $.parseJSON(results.results);
			else _mapConfig=results;
			if(_mapConfig.options){
				_mapConfig.options = $.parseJSON(_mapConfig.options);
				if(_mapConfig.options.llegenda === false){
					self.nollegenda = "1"; //ocultar la llegenda
					self.llegenda = 0;
				}
				self.tipusllegenda=_mapConfig.options.tipusllegenda;
				self.llegendaOpt=_mapConfig.options.llegendaOpt;
			}
			self._mapConfig = _mapConfig;

			self._configControls();

			_map.fire('loadconfig', _mapConfig);
			$.publish('loadConfig', _mapConfig);

			return self;
		},

		_configControls: function(){
			var self = this,
			mapConfigOptions = self._mapConfig.options;

			if(mapConfigOptions.params){
				var params = mapConfigOptions.params;
				if(self.embed && (!$.isEmptyObject(params.iframe))){
					var piframe = params.iframe;
					$.each(piframe, function(key, value){
						if(self[key] == 0 || self[key] == 1){

						}else{
							self[key] = value;
						}
					});
				}else if(!$.isEmptyObject(params.visor)){
					var pvisor = params.visor;
					$.each(pvisor, function(key, value){
						if(self[key] == 0 || self[key] == 1){

						}else{
							self[key] = value;
						}
					});
				}
			}

			return self;
		},

		fireLoadConfig: function(){
			var self = this,
			_map = self.map,
			_mapConfig = self._mapConfig;

			_map.fire('visorconfig', _mapConfig);

			return self;
		},
		
		_loadCacheMap: function(_businessid,_uid,_mapacolaboratiu){
			var self=this;
			if (_uid==null){
				if (undefined != url('?id')){ 
					_uid=url('?id');
				}
				else {
					_uid = url(-3);
				}
			}
			//console.debug(HOST_APP+'capesuser/'+_uid+'/'+_businessid+'.json');
			$.get(HOST_APP+'capesuser/'+_uid+'/'+_businessid+'.json', function(results) { 
				if(results){	
					if (results.clau){
						//ocultar las pelotas
						self._hideLoading();
						//mostar modal con contraseña
						self._loadPasswordModal();
					}
					else self._beforeLoadConfig(results);
				}
				else {
					var data = {
							businessId: _businessid,
							id: _uid,
							mapacolaboratiu: _mapacolaboratiu,
							uid: _uid	
						};
					getCacheMapByBusinessId(data).then(function(results){
						if (results.status == "ERROR"){
							self.loadErrorPage();
						}else if (results.status == "PRIVAT"){
							//ocultar las pelotas
							self._hideLoading();
							//mostar modal con contraseña
							self._loadPasswordModal();
						}else{
			
							self._beforeLoadConfig(results);
			
						}
					});
				}
			}).fail(function() {
				var data = {
						businessId: _businessid,
						id: _uid,
						mapacolaboratiu: _mapacolaboratiu,
						uid: _uid	
					};
				getCacheMapByBusinessId(data).then(function(results){
					if (results.status == "ERROR"){
						self.loadErrorPage();
					}else if (results.status == "PRIVAT"){
						//ocultar las pelotas
						self._hideLoading();
						//mostar modal con contraseña
						self._loadPasswordModal();
					}else{
		
						self._beforeLoadConfig(results);
		
					}
				});
			});
			
		},
		
		loadMapConfig: function(){
			var self = this,
			_map = self.map,
			_uid = self.uid,
			_businessid = self.businessid,
			_mapacolaboratiu = self.mapacolaboratiu;
						
			self._loadCacheMap(_businessid,_uid,_mapacolaboratiu);
			
			return self;
		},
		

		loadURLConfig: function() {

			var self = this;

			self.mouseposition = self.mouseposition || false;
			self.scalecontrol = self.scalecontrol || false;
			self.minimapcontrol = self.minimapcontrol || false;
			self.fonscontrol = self.fonscontrol || false;
			self.homecontrol = self.homecontrol || false;
			self.locationcontrol = self.locationcontrol || false;
			self.searchcontrol = self.searchcontrol || false;
			self.routingcontrol = self.routingcontrol || false;
			self.sharecontrol = self.sharecontrol || false;
			self.likecontrol = self.likecontrol || false;
			self.layerscontrol = self.layerscontrol || false;
			self.control3d = self.control3d || false;

			self.snapshotcontrol = self.snapshotcontrol || false;

			self.printcontrol = self.printcontrol || false;
			self.geopdfcontrol = self.geopdfcontrol || false;

			self.rtoolbar = self.rtoolbar || false;
			self.llegenda = self.llegenda || false;
			self.appmodul = self.appmodul || false;
			self.zoomcontrol = self.zoomcontrol || false;
			self.fons = self.fons || "hibridMap";
			
			var lat = url('?lat');
			var lng = url('?lng');
			var zoom = url('?zoom');

			var lat = url('?lat');
			var lng = url('?lng');
			var zoom = url('?zoom');

			var hash = location.hash;
			hashControl = new L.Hash(self.map);
			var parsed = hashControl.parseHash(hash);

			if(lat && lng && zoom)
				parsed = hashControl.parseHash("#" + zoom + "/" + lat + "/" + lng);
			
			self._mapConfig = {
				tipusAplicacioId : TIPUS_APLIACIO_INSTAMAPS,
				nomAplicacio : (self.appname ? self.appname : ""),
				entitatUid : "@",
				nomEntitat : "",
				servidorsWMS : [],
				options : {
					center : (parsed ? parsed.center.lat + "," + parsed.center.lng : "41.431,1.8580"),
					zoom : (parsed ? parsed.zoom : 8),
					description : "",
					fons : self.fons
				}
			};

			if(!self.zoomcontrol){
				self.map.removeControl(self.map.zoomControl);
			}

			return self;
		},

		loadApp: function(){
			var self = this,
			_map = self.map,
			_mapConfig = self._mapConfig;

			self._loadPublicMap(_mapConfig);

			return self;
		},

		_mapNameShortener: function(inName) {
			name = "<div id='mapNameContainer'><span title=\"" + inName + "\">" + inName + "</span></div>";
			return name;
		},

		_loadPublicMap: function(_mapConfig){
			var self = this,
				nomUser = _mapConfig.entitatUid.split("@"),
				nomEntitat = _mapConfig.nomEntitat,
				infoHtml = '';

			var nomAp = _mapConfig.nomAplicacio;
			if ($(location).attr('href').indexOf('/visor.html') != -1) {
				$('meta[property="og:title"]').attr('content', "Mapa "+nomAp.replaceAll("'","\'"));
			}
			if ($(location).attr('href').indexOf('/visor_onsoc.html') != -1) {
				document.title=url('?title');
			}
			Cookies.set('perfil', 'instamaps');
			checkUserLogin();

			
			if (_mapConfig.options){
				var alies = _mapConfig.options.alies;
				if (alies!=undefined && alies!=""){
					infoHtml += '<p>'+alies+'</p>';	
				}
				else {
					infoHtml += '<p>'+nomUser[0]+'</p>';
				}
				var desc=_mapConfig.options.description;

				desc==""?desc=_mapConfig.nomAplicacio:desc=desc;

				if (desc!=undefined)  desc = desc.replaceAll("'","\'");
				if ($(location).attr('href').indexOf('/visor.html') != -1) {
					$('meta[name="description"]').attr('content', desc+' - Fet amb InstaMaps.cat');
					$('meta[property="og:description"]').attr('content', desc+' - Fet amb InstaMaps.cat');

					var urlThumbnail = GEOCAT02 + paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + url('?businessid');
					$('meta[property="og:image"]').attr('content', urlThumbnail);
					var urlMap = HOST_APP+paramUrl.visorPage+"?businessid="+_mapConfig.businessId;
					var nomApp=_mapConfig.nomAplicacio;
					if (undefined!=nomApp){
						var nomIndexacio=nomApp;
			        	(nomIndexacio.length > 100)?nomIndexacio=nomIndexacio.substring(0,100):nomIndexacio;
			        	nomIndexacio= encodeURI(nomIndexacio);
						urlMap += "&title="+nomIndexacio;
					}
					var generatedScript="<script type=\"application/ld+json\">"+
					generarScriptMarkupGoogle(urlMap,nomAp,urlThumbnail,_mapConfig.entitatUid,_mapConfig.dataPublicacio,desc)+
					"</script>";
					$('head').append(generatedScript);
				}
				if (_mapConfig.options.description!=undefined) infoHtml += '<p>'+_mapConfig.options.description+'</p>';
				if (_mapConfig.options.tags!=undefined) infoHtml += '<p>'+_mapConfig.options.tags+'</p>';

				$('.escut').hide();
			}
			$("#mapTitle").html(self._mapNameShortener(_mapConfig.nomAplicacio) + '<span id="infoMap" lang="ca" class="glyphicon glyphicon-info-sign pop" data-toggle="popover" title="Informació" data-lang-title="Informació" ></span>');

			$('#infoMap').popover({
				placement : 'bottom',
				html: true,
				content: infoHtml
			});

			$('#infoMap').on('show.bs.popover', function () {
				$(this).attr('data-original-title', window.lang.translate($(this).data('lang-title')));
			});

			if (_mapConfig.options.barColor){
				$('#navbar-visor').css('background-color', _mapConfig.options.barColor);
			}
			else $('#navbar-visor').css('background-color',"#333333");

			if (_mapConfig.options.textColor){
				$('#navbar-visor').css('color', _mapConfig.options.textColor).css('border-color', '#ffffff');
				$('.navbar-brand').css('color', _mapConfig.options.textColor);
				$('#mapTitle #mapNameContainer > span').css('color', _mapConfig.options.textColor);
				//$('#mapTitle h3').css('color', '#ffffff');
				$('.navbar-inverse .navbar-nav > li > a').css('color', _mapConfig.options.textColor);
				$('#menu_user > a > span').removeClass('green').css('color', _mapConfig.options.textColor);
				$('.navbar-form').css('border-color', 'transparent');
				$('.bt-sessio').css('border-color', '#ffffff');
			}
			else {
				$('#navbar-visor').css('color', '#9d9d9d').css('border-color', '#ffffff');
				$('.navbar-brand').css('color','#9d9d9d');
				$('#mapTitle').css('color', '#9d9d9d');
				$('#mapTitle h3').css('color', '#9d9d9d');
				$('.navbar-inverse .navbar-nav > li > a').css('color', '#9d9d9d');
				$('#menu_user > a > span').removeClass('green').css('color', '#9d9d9d');
				$('.navbar-form').css('border-color', 'transparent');
				$('.bt-sessio').css('border-color', '#ffffff');
			} 

			if (_mapConfig.options.fontType){
				$('#navbar-visor').css('font-family', _mapConfig.options.fontType);
			}
			
			$('.escut').show();
			if (_mapConfig.logo){
				$('.escut img').prop('src', '/logos/'+_mapConfig.logo);
				var _logo=_mapConfig.logo;
				if(_logo && _logo.indexOf("blank.gif")==-1){
					
					$('.brand-txt').hide();
					$('.img-circle2-icon').hide();
				}
			}
			
			//TODO quitar la global ya que se usa en el control de capas.
			downloadableData = (_mapConfig.options && _mapConfig.options.downloadable?
					_mapConfig.options.downloadable:[]);

			_mapConfig.newMap = false;
			$('#nomAplicacio').html(_mapConfig.nomAplicacio);

			self._loadMapConfig(_mapConfig).then(function(){

			});
		},

		_loadMapConfig: function(_mapConfig){
			var self = this,
			_map = self.map,
			_layers = self.instamapsLayers,
			dfd = $.Deferred();

			if (!$.isEmptyObject( _mapConfig )){

				$('#businessId').val(_mapConfig.businessId);
				//TODO ver los errores de leaflet al cambiar el mapa de fondo
				//cambiar el mapa de fondo a orto y gris
				if (_mapConfig.options != null){
					if(_mapConfig.options.hasOwnProperty("fons"))
					{
						var fons = _mapConfig.options.fons;
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
							_map.colorMap(_mapConfig.options.fonsColor);
						}else if (fons == 'naturalMap') {
							_map.naturalMap();
						}else if (fons == 'divadminMap') {
							_map.divadminMap();
						}else if (fons == 'hibridTerrainMap') {
							_map.hibridTerrainMap();
						}else if (fons.indexOf('colorBlankMap')!=-1) {
							_map.colorBlankMap(fons);
						}
						_map.setActiveMap(_mapConfig.options.fons);
						_map.setMapColor(_mapConfig.options.fonsColor);

					}
				}

				//carga las capas en el mapa
				var controlCapes = (self.controls.layersControl) ? self.controls.layersControl.control : null;
				_UsrID = _mapConfig.entitatUid;
				_layers._loadAllLayers(_mapConfig, controlCapes).then(function(){
					self._updateLayerControl();
				});

				self._hideLoading();
			}
			dfd.resolve();
			return dfd.promise();
		},

		_addDownloadLayer: function(){
			var self = this;
			addFuncioDownloadLayer('visor');
			return self;
		},

		_addDataTable: function(){
			var self = this;
			addFuncioEditDataTable();
			return self;
		},

		_drawVisor: function(){
			var self = this,
			map = self.map,
			_mapConfig = self._mapConfig;

			if(self.embed){
				self.drawEmbed();
			}

			if(_mapConfig.tipusAplicacioId == TIPUS_APLIACIO_INSTAMAPS){
				self._initCenter().drawMap().resizeMap().drawControls().fireLoadConfig().loadApp()._addTooltips()._addDownloadLayer()._addDataTable()._hideLoading();

				if(self.embed){
					self.addLogoInstamap();
				}
				if (!self.measurecontrol) $(".leaflet-control-draw-measure").hide();	//Eliminem el control de mesura si no és geolocal/AOC
				$.publish('analyticsEvent',{event:[ 'visor', 'visor_instamaps', _mapConfig.entitatUid, 1]});
			}else if(_mapConfig.tipusAplicacioId == TIPUS_APLIACIO_GEOLOCAL){
				self._initCenter().drawMap().resizeMap().drawControls().fireLoadConfig().loadApp()
				._drawVisorGeolocal()._addTooltips()._addDownloadLayer()._addDataTable()._hideLoading();
				addDrawTooltips();
				$.publish('analyticsEvent',{event:[ 'visor','visor_entitat', _mapConfig.nomEntitat, 1]});

			}else if(_mapConfig.tipusAplicacioId == TIPUS_APLIACIO_AOC){
				self._initCenter().drawMap().resizeMap().drawControls().fireLoadConfig().loadApp()
				._drawVisorGeolocal()._addTooltips()._addDownloadLayer()._addDataTable()._hideLoading();
				addDrawTooltips();
				$.publish('analyticsEvent',{event:[ 'visor','visor_entitat', _mapConfig.nomEntitat, 1]});

			}else{

			alert("No hi ha tipus definit");

			}

			return self;
		},

		_drawVisorGeolocal: function(){
			var self = this;

			var visorGeolocal = VisorGeolocal({visor:self}).draw();

			return self;
		},

		_drawVisorSimple: function(){
			var self = this;

			var visorSimple = VisorSimple({visor:self}).draw();

			$.publish('trackPageview', null);

			return self;
		},

		_initCenter: function(){
			var self = this,
			_map = self.map,
			_mapConfig = self._mapConfig;

			var ineFound = false;
			if(self.INE10)
			{

				var municipis = ListViewMunicipis.municipis;
				for(var i=0; i<municipis.length && !ineFound; ++i)
				{

					ineFound = (municipis[i].municipiCodi == self.INE10);
					if(ineFound)
					{

						var data = municipis[i];
						var bbox = data.bbox.split(",");
						var southWest = L.latLng(bbox[1], bbox[0]),
						northEast = L.latLng(bbox[3], bbox[2]),
						bounds = L.latLngBounds(southWest, northEast);
						_map.fitBounds(bounds)

					}

				}

			}

			if(!ineFound)
			{

				var hash = location.hash;
				hashControl = new L.Hash(_map);
				var parsed = hashControl.parseHash(hash);

				if("" == hash && _mapConfig.options){
					if (_mapConfig.options.center){
						var opcenter = _mapConfig.options.center.split(",");
						_map.setView(L.latLng(opcenter[0], opcenter[1]), _mapConfig.options.zoom);
					}else if (_mapConfig.options.bbox){
						var bbox = _mapConfig.options.bbox.split(",");
						var southWest = L.latLng(bbox[1], bbox[0]);
					    var northEast = L.latLng(bbox[3], bbox[2]);
					    var bounds = L.latLngBounds(southWest, northEast);

					    _map.fitBounds( bounds );
					}
				}else if (parsed){

					hashControl.update();
				}

			}

			return self;
		},

		_drawControlsVisorBuit:function(){
			var self=this;
			self.addMousePositionControl();
			self.addScaleControl();
			self.addMinimapControl();
			self.addFonsControl();
			self.addLocationControl();
			self.addSearchControl();
			return self;
		},
		draw: function(){
			var self = this,
			   	_map = self.map;

			changeInitVisor();

			$(window).resize(_.debounce(function(){
				self.resizeMap();
			},150));

			if(self.businessid && self.businessid!="geocatweb"){
				self.loadMapConfig();
				_map.on('loadconfig', self._drawVisor, self);
			}else{
				if(self.urlwms){ //cloudifier
					if(self.embed){
						self.drawEmbed();
					}
					self.drawMap().resizeMap().drawControls()._drawVisorSimple()._hideLoading();
				}
				else if(self.urlFile && self.text){
					self.loadURLConfig().drawMap().resizeMap().drawControls()._loadUrlFile()._addURLMarker()._hideLoading();
				}
				else if(self.text) {	//map defined by url params
					self.loadURLConfig()._initCenter()._drawVisor()._addURLMarker();
				}
				else if(self.urlFile){
					self.drawMap().resizeMap().drawControls()._loadUrlFile()._hideLoading();
				}
				else{
					//self.loadErrorPage();
					//Carreguem visor buit
					self.drawMap().resizeMap()._drawControlsVisorBuit()._hideLoading();
				}
			}

			if(!self.embed){
				$.publish('analyticsEvent',{event:[ 'visor', 'no embed']});
			}
			return self;
		},
		

		_loadUrlFile: function() {
			
			var self = this;
			var map = self.map;
			var urlFile = self.urlFile;
			var colX=self.coordX;
			var colY=self.coordY;
			var tipusFile = "geojson";
			
			if (self.tipusFile && self.tipusFile!="") tipusFile=self.tipusFile;
			if (self.controls.homeControl!=undefined) self.controls.homeControl.hideBtn();
			if (self.controls.layersControl!=undefined) self.controls.layersControl.hideBtn();
			if (self.controls.routingControl!=undefined) self.controls.routingControl.hideBtn();
			if (self.controls.shareControl!=undefined) self.controls.shareControl.hideBtn();
			if (self.controls.likeControl!=undefined) self.controls.likeControl.hideBtn();
			if (self.controls.control3d!=undefined) self.controls.control3d.hideBtn();
			if (self.controls.snapshotControl!=undefined) self.controls.snapshotControl.hideBtn();
			
			var estil_do = retornaEstilaDO();
			estil_do.fillColor="#ff0000";
			estil_do.color="#ff0000";
			
			//Recuperem estils de la barra d'eines
			var canvas_linia2={"id":"cv_linia","strokeStyle":"#ff0000","lineWidth":"3","tipus":"linia","opacity":"100"};
			var lineStyle = getLineRangFromStyle(canvas_linia2);
			lineStyle.weight = lineStyle.lineWidth;
			lineStyle.color="#ff0000";

			var polygonStyle = getPolygonRangFromStyle(canvas_pol);
			polygonStyle.weight = polygonStyle.borderWidth;//lineWidth;
			polygonStyle.fillColor = "#ff0000";
			polygonStyle.color = "#ff0000";
			polygonStyle.fillOpacity = polygonStyle.opacity/100; 
			polygonStyle.opacity = 1;
			
			
			if (tipusFile=="json"){
				 L.toGeoJSON.convert(urlFile,"Point",colX,colY).then(function(){
					 var dataSocrata={
								serverName: "Capa fitxer",
								jsonSocrata: JSON.stringify(L.toGeoJSON.geoJsonData)
						};
						
					//console.debug(dataSocrata);
					crearFitxerSocrata(dataSocrata).then(function(results){
						if (results.status="OK"){
							param_url =results.filePath;
							$('#dialog_dades_ex').modal('hide');
							jQuery("#div_uploading_txt").html("");
							jQuery("#div_uploading_txt").html('<div id="div_upload_step1" class="status_current" lang="ca"> '+
									window.lang.translate('Carregant dades')+
							'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>');		
							jQuery('#info_uploadFile').show();


						   if (undefined!=param_url && (param_url.indexOf("/opt/")>-1 || param_url.indexOf("\\temp\\")>-1 )){
							    if (param_url.indexOf("\\temp\\")>-1)  urlFile=HOST_APP3+"/jsonfiles/"+param_url.substring(param_url.lastIndexOf("\\")+1,param_url.length);
							    else  urlFile=HOST_APP3+"/jsonfiles/"+param_url.substring(param_url.lastIndexOf("/")+1,param_url.length);
								param_url = paramUrl.urlFileDin	+"tipusFile=" + ".geojson"+
								"&urlFile="+encodeURIComponent(urlFile)+
								"&epsgIN=EPSG:4326"+	
								"&dinamic=true"+
								"&uploadFile="+paramUrl.uploadFile+							
								"&uid="+Cookies.get('uid');		
							}
						   
						   var capaURLfile = new L.GeoJSON.AJAX(param_url, {
								nom : "urlFile",
								tipus : tipusFile,
								estil_do: estil_do,
								style: polygonStyle,//Estil de poligons i linies
								pointToLayer : function(feature, latlng) {
									var geom = L.circleMarker(latlng, estil_do);
									var pp = feature.properties;
									var html ='<div class="div_popup_visor"><div class="popup_pres">';
									propName = "";
									$.each( pp, function( key, value ) {
										propName = propName+key+",";
										if(isValidValue(value) && !validateWkt(value)){
											if ( key != 'businessId' && key != 'slotd50'){
												
												var txt = value;
													html+='<div class="popup_data_row">';
													if (!$.isNumeric(txt)) {		    				
														txt = parseUrlTextPopUp(value,key);
														if (typeof txt == 'string' || txt instanceof String) {
															if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
																html+='<div class="popup_data_key">'+key+'</div>';
																html+='<div class="popup_data_value">'+txt+'</div>';
															}else{
																html+='<div class="popup_data_img_iframe">'+txt+'</div>';
															}
														}
														else{
															var txtVal=txt;
															try{
																txtVal = JSON.stringify(txt);
															}catch(e){
																
															}																	
															html+='<div class="popup_data_key">'+key+'</div>';
															html+='<div class="popup_data_value">'+txtVal+'</div>';
														}
													}
													else if (!(txt instanceof Object)){
														html+='<div class="popup_data_key">'+key+'</div>';
														html+='<div class="popup_data_value">'+txt+'</div>';
													}
													html+= '</div>';
												
											}
										}
									});	
									propName = propName.substr(0, propName.length-1);
									html+='</div></div>'; 
									return geom.bindPopup(html);
								},
								onEachFeature : function(feature, latlng) {
									var pp = feature.properties;
									var html ='<div class="div_popup_visor"><div class="popup_pres">';
									propName = "";
									$.each( pp, function( key, value ) {
										propName = propName+key+",";
										if(isValidValue(value) && !validateWkt(value)){
											if ( key != 'businessId' && key != 'slotd50'){
												
												var txt = value;
													html+='<div class="popup_data_row">';
													if (!$.isNumeric(txt)) {		    				
														txt = parseUrlTextPopUp(value,key);
														if (typeof txt == 'string' || txt instanceof String) {
															if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
																html+='<div class="popup_data_key">'+key+'</div>';
																html+='<div class="popup_data_value">'+txt+'</div>';
															}else{
																html+='<div class="popup_data_img_iframe">'+txt+'</div>';
															}
														}
														else{
															var txtVal=txt;
															try{
																txtVal = JSON.stringify(txt);
															}catch(e){
																
															}																	
															html+='<div class="popup_data_key">'+key+'</div>';
															html+='<div class="popup_data_value">'+txtVal+'</div>';
														}
													}
													else if (!(txt instanceof Object)){
														html+='<div class="popup_data_key">'+key+'</div>';
														html+='<div class="popup_data_value">'+txt+'</div>';
													}
													html+= '</div>';
												
											}
										}
									});	
									propName = propName.substr(0, propName.length-1);
									html+='</div></div>'; 
									return latlng.bindPopup(html);
								},
								middleware:function(data){
									if(data.status && data.status.indexOf("ERROR")!=-1){
										processFileError(data, urlFile);
										jQuery('#info_uploadFile').hide();
									}else{
										var stringData = JSON.stringify(data);
										var geometryType = defineGeometryType(stringData);
				
										if(geometryType.indexOf("point")!=-1){
											capaURLfile.options.style = estil_do;
										}else if(geometryType.indexOf("line")!=-1){
											capaURLfile.options.style = lineStyle;
										}else if(geometryType.indexOf("polygon")!=-1){
											capaURLfile.options.style = polygonStyle;
										}
										try{
											capaURLfile.addData(data);
											capaURLfile.addTo(map);
											var bounds = capaURLfile.getBounds();
											map.fitBounds(bounds);
										}catch(err){
											console.debug(err);
											$.publish('analyticsEvent',{event:['error', 'CapaUrlFile2',JSON.stringify(err)]});	
										}
									}
								}
							});
						}
					});
				 });
			}
						
			else{	   
			
				if(urlFile.indexOf("https://drive.google.com/file/d/")!=-1){
					urlFile = urlFile.replace("https://drive.google.com/file/d/", "");
					var res = urlFile.split("/");
					var fileId = res[0];
					urlFile = "https://drive.google.com/uc?export=download&id="+fileId;
				}
				else if(urlFile.indexOf("https://www.dropbox.com")!=-1){
					urlFile = urlFile.replace("https://www.dropbox.com", "https://dl.dropboxusercontent.com");		
				}
				
				if (urlFile.indexOf("https")>-1 && urlFile.indexOf("csv")>-1) {
					urlFile = HOST_APP3+paramUrl.proxy_betterWMS + "?url="+encodeURIComponent(urlFile);
		        	//urlFile = httpOrhttps(urlFile,false);
				}
				
				if (tipusFile.toLowerCase().indexOf("geojson")>-1) tipusFile=".geojson";
				if (tipusFile.toLowerCase().indexOf("kml")>-1) tipusFile=".kml";
				if (tipusFile.toLowerCase().indexOf("kmz")>-1) tipusFile=".kmz";
				if (tipusFile.toLowerCase().indexOf("gpx")>-1) tipusFile=".gpx";
				if (tipusFile.toLowerCase().indexOf("csv")>-1) tipusFile=".csv";
				if (tipusFile.toLowerCase().indexOf("xls")>-1) {
					if (tipusFile.toLowerCase().indexOf("xlsx")>-1) tipusFile=".xlsx";
					else tipusFile=".xls";
				}						
				if (tipusFile.toLowerCase().indexOf("txt")>-1) tipusFile=".txt";
				
				var epsg ="EPSG:4326";
				
				if (self.epsg && self.epsg!="") epsg=self.epsg;
				
				if (epsg.indexOf("4326")>-1) epsg="EPSG:4326";
				else if (epsg.indexOf("23031")>-1) epsg="EPSG:23031";
				else if (epsg.indexOf("25831")>-1) epsg="EPSG:25831";
				else if (epsg.indexOf("4258")>-1) epsg="EPSG:4258";
				else if (epsg.indexOf("4230")>-1) epsg="EPSG:4230";
				else if (epsg.indexOf("32631")>-1) epsg="EPSG:32631";
				else if (epsg.indexOf("3857")>-1) epsg="EPSG:3857";
				
				
				var param_url = paramUrl.urlFileDin	+
				"tipusFile=" + tipusFile+				
				"&epsgIN="+ epsg+				
				"&dinamic=true"+
				"&uploadFile="+paramUrl.uploadFile+		
				"&uid="+Cookies.get('uid')+
				"&colX="+colX+
				"&colY="+colY+
				"&urlFile="+encodeURIComponent(urlFile)+
				"&tipusAcc=coordenades";
				
				if (((urlFile.indexOf("socrata")>-1 && urlFile.indexOf("method=export&format=GeoJSON")>-1) || 
						urlFile.indexOf("https")>-1) && (urlFile.indexOf("drive")==-1)
						&& (urlFile.indexOf("dropbox")==-1)  && (urlFile.indexOf("csv")==-1)) 	{
					param_url = urlFile;
				}
								
				
				var capaURLfile = new L.GeoJSON.AJAX(param_url, {
					nom : "urlFile",
					tipus : tipusFile,
					estil_do: estil_do,
					style: polygonStyle,//Estil de poligons i linies
					pointToLayer : function(feature, latlng) {
						var geom = L.circleMarker(latlng, estil_do);
						var pp = feature.properties;
						var html ='<div class="div_popup_visor"><div class="popup_pres">';
						propName = "";
						$.each( pp, function( key, value ) {
							propName = propName+key+",";
							if(isValidValue(value) && !validateWkt(value)){
								if (key != 'name' && key != 'Name' && key != 'description' && key != 'id' && key != 'businessId' && key != 'slotd50'){
									html+='<div class="popup_data_row">';
									var txt = value;
									if (!$.isNumeric(txt)) {		    				
										txt = parseUrlTextPopUp(value,key);
										if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
											html+='<div class="popup_data_key">'+key+'</div>';
											html+='<div class="popup_data_value">'+txt+'</div>';
										}else{
											html+='<div class="popup_data_img_iframe">'+txt+'</div>';
										}
									}
									else {
										html+='<div class="popup_data_key">'+key+'</div>';
										html+='<div class="popup_data_value">'+txt+'</div>';
									}
									html+= '</div>';
								}
							}
						});	
						propName = propName.substr(0, propName.length-1);
						html+='</div></div>'; 
						return geom.bindPopup(html);
					},
					onEachFeature : function(feature, latlng) {
						var pp = feature.properties;
						var html ='<div class="div_popup_visor"><div class="popup_pres">';
						propName = "";
						$.each( pp, function( key, value ) {
							propName = propName+key+",";
							if(isValidValue(value) && !validateWkt(value)){
								if (key != 'name' && key != 'Name' && key != 'description' && key != 'id' && key != 'businessId' && key != 'slotd50'){
									html+='<div class="popup_data_row">';
									var txt = value;
									if (!$.isNumeric(txt)) {		    				
										txt = parseUrlTextPopUp(value,key);
										if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
											html+='<div class="popup_data_key">'+key+'</div>';
											html+='<div class="popup_data_value">'+txt+'</div>';
										}else{
											html+='<div class="popup_data_img_iframe">'+txt+'</div>';
										}
									}
									else {
										html+='<div class="popup_data_key">'+key+'</div>';
										html+='<div class="popup_data_value">'+txt+'</div>';
									}
									html+= '</div>';
								}
							}
						});	
						propName = propName.substr(0, propName.length-1);
						html+='</div></div>'; 
						return latlng.bindPopup(html);
					},
					middleware:function(data){
						if(data.status && data.status.indexOf("ERROR")!=-1){
							processFileError(data, urlFile);
							jQuery('#info_uploadFile').hide();
						}else{
							var stringData = JSON.stringify(data);
							var geometryType = defineGeometryType(stringData);
	
							if(geometryType.indexOf("point")!=-1){
								capaURLfile.options.style = estil_do;
							}else if(geometryType.indexOf("line")!=-1){
								capaURLfile.options.style = lineStyle;
							}else if(geometryType.indexOf("polygon")!=-1){
								capaURLfile.options.style = polygonStyle;
							}
							try{
								capaURLfile.addData(data);
								capaURLfile.addTo(map);
								var bounds = capaURLfile.getBounds();
								map.fitBounds(bounds);
							}catch(err){
								console.debug(err);
								$.publish('analyticsEvent',{event:['error', 'CapaUrlFile3',JSON.stringify(err)]});
							}
						}
					}
				});		
			}
			return self;
		},
		saveLocalStorage:function(){
			var self = this;
			if (self.urlFile){
				try{
					if(window.localStorage){
						window.localStorage.setItem("url",self.urlFile);
					}
				}catch(e){}
			}
			if (self.tipusFile){
				try{
					if(window.localStorage){
						window.localStorage.setItem("format",self.tipusFile);
					}
				}catch(e){}
			}
		},
		_addURLMarker: function() {
			var self = this;
			var opcenter = self._mapConfig.options.center.split(",");
			var defaultPunt = L.AwesomeMarkers.icon(default_onsoc_style);
			var marker = L.marker(new L.LatLng(opcenter[0], opcenter[1]), {icon: defaultPunt,
					 tipus: t_marker}).addTo(self.map);

			if(self.text)
			{

				var html = '';
				var hasValidLink = ((null != self.link) && ("" != self.link.trim()) && isValidURL(self.link));

				if(hasValidLink)
				{

					var hasProtocol = (-1 != self.link.indexOf("://"));
					if(!hasProtocol)
						html += "<a href=\"http://" + self.link + "\" target=\"_blank\">";
					else
						html += "<a href=\"" + self.link + "\" target=\"_blank\">";

					html += self.text;
					html += "</a>";

				}
				else
				{

					html += parseUrlTextPopUp(self.text, "");

				}

				marker.bindPopup(html);
				marker.openPopup();
				$.publish('loadConfig', null);
				$.publish('analyticsEvent',{event:[ 'visor','parametres']});

			}

			$("#infoMap").hide();
			return self;
		},

		_addTooltips: function(){
			var self = this;
			$('[data-toggle="tooltip"]').tooltip({container: 'body'});
			return self;
		},

		_updateLang: function(e, data){
			var self = this;
			//TODO esto deberia ir en cada control que es responsable de toda su funcionalidad
			jQuery('body').on('show.bs.tooltip','[data-toggle="tooltip"]',function(){
				jQuery(this).attr('data-original-title', window.lang.translate(jQuery(this).data('lang-title')));
			});
			//Add tooltip caixa cerca
			jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.translate('Cercar llocs o coordenades ...'));
			jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.translate('Cercar llocs o coordenades ...'));

			return self;
		},

		_updateLayerControl: function(e, data){
			var self = this;
			var controlCapes = (self.controls.layersControl) ? self.controls.layersControl.control : null;
			if(controlCapes){
				controlCapes.forceUpdate();
			}
			return self;
		},

		_showRoutingEvent: function(){
			$.publish('analyticsEvent',{event:[ 'visor', 'button#routing', 'label routing', 1]});
		},

		_mapsnapshotEvent: function(){
			//$.publish('analyticsEvent',{event:['visor', 'button#exportmapa', 'label exportmap', 1]});		
		},


		/*
		_mapprintEvent: function(){
			$.publish('analyticsEvent',{event:[ 'visor', this.tipusUser+'print', 'label print', 1]});
		},

		_mapgeopdfEvent: function(){
			$.publish('analyticsEvent',{event:[ 'visor', this.tipusUser+'geopdf', 'label geopdf', 1]});
		},
		*/
		_map3dmodeEvent: function(){
			$.publish('analyticsEvent',{event:[ 'visor', 'button#3D', 'label 3D', 1]});
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
				_map.on('zoomend',self._gestionaEtiquetes, self);
			}
			$.subscribe('change-lang',self._updateLang);
		},
		_gestionaEtiquetes: function(){
			var self=this;
			var controlCapes = (self.controls.layersControl) ? self.controls.layersControl.control : null;
			if (controlCapes!=null){
				jQuery.each(controlCapes._layers, function(i, obj){
					var optionsVis;
					if (obj.layer!=undefined && obj.layer.options!=undefined && obj.layer.options.opcionsVis!=undefined) optionsVis = obj.layer.options.opcionsVis;
					if (obj.layer!=undefined && obj.layer.options!=undefined && obj.layer.options.opcionsVisEtiqueta!=undefined) optionsVis = obj.layer.options.opcionsVisEtiqueta;
					else if (obj.options!=undefined && obj.optionsobj.opcionsVis!=undefined)  optionsVis = obj.options.opcionsVis;
					else if (obj.options!=undefined && obj.optionsobj.opcionsVisEtiqueta!=undefined) optionsVis = obj.options.opcionsVisEtiqueta;
				
					 if (optionsVis!=undefined && (optionsVis=="nomesetiqueta" ||
							 optionsVis=="etiquetageom")){
						 		var zoomInicial = zoomInicialEt;
						 		if (obj.layer.options.zoomInicial) zoomInicial=obj.layer.options.zoomInicial;
						 		var zoomFinal = zoomFinalEt;
						 		if (obj.layer.options.zoomFinal) zoomFinal = obj.layer.options.zoomFinal;
	
						 		if ( map.getZoom()>=zoomInicial &&  map.getZoom() <= zoomFinal) {//mostrem labels
									jQuery.each(obj.layer._layers, function(i, lay){
										if (lay.label!=undefined) {
											if(lay.label){
												lay.label.setOpacity(1);
											}
											if(lay._showLabel){
						                        lay._showLabel({latlng: lay.label._latlng});
											}
										}
									});
						 		 }
						 		 else {//amaguem labels
									jQuery.each(obj.layer._layers, function(i, lay){
										if(lay.label){
											lay.label.setOpacity(0);
										}
									});
								 }
					}
				});
			}
		}

	};

	Visor.init = function(options){
		var self = this;
		self = $.extend(self, visorOptions, options);
		self.instamapsLayers = InstamapsLayers(visorOptions);
		$('#hl_sessio1').on('click',function(){
			_gaq.push(['_trackEvent', 'visor', 'fer mapa', 'acquisition']);
			self.saveLocalStorage();			
		});
		$('#newMap a').on('click',function(){
			self.saveLocalStorage();			
		});
	}

	Visor.init.prototype = Visor.prototype;

	global.Visor = Visor;
	
	

}(window, jQuery));
