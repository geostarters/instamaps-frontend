/**
 * InstamapsLayers 
 * 
 * require todos los archivos con los diferentes tipos de capas
 * require geocat.mapa.wms
 * require geocat.mapa.json
 * require geocat.mapa.tematic
 * require geocat.mapa.url-file
 * require geocat.mapa.geojsonvt
 * require geocat.mapa.dades-obertes
 * require geocat.mapa.xarxes-socials
 * require geocat.mapa.heat
 * require geocat.mapa.cluster
 * require geocat.mapa.visualitzacioWMS
 */
;(function(global, $){
	var InstamapsLayers = function(options){
		return new InstamapsLayers.init(options);
	};
	
	InstamapsLayers.prototype = {
		loadLayer: function(value){
			var self = this,
			_map = self.map,
			defer = $.Deferred();

			if (value.epsg == "4326"){
				value.epsg = L.CRS.EPSG4326;
			}else if (value.epsg == "25831"){
				value.epsg = L.CRS.EPSG25831;
			}else if (value.epsg == "23031"){
				value.epsg = L.CRS.EPSG23031;
			}else{
				value.epsg = _map.options.crs;
			}

			//Si la capa es de tipus wms
			if(value.serverType == t_wms){
				loadWmsLayer(value);
				defer.resolve();
			//Si la capa es de tipus dades obertes
			}else if(value.serverType == t_json){
				loadCapaFromJSON(value).then(function(){
					defer.resolve();
				});
			//Si la capa es de tipus url file
			}else if(value.serverType == t_url_file){
				loadURLfileLayer(value).then(function(){
					defer.resolve();
				},function(result){
					defer.reject(result);
				});
			//Si la capa es de tipus dades obertes
			}else if(value.serverType == t_geojsonvt){
				//console.debug(loadGeojsonvtLayer);
				loadGeojsonvtLayer(value);
				defer.resolve();
			//Si la capa es de tipus dades obertes
			}else if(value.serverType == t_dades_obertes){
				loadDadesObertesLayer(value).then(function(){
					defer.resolve();
				},function(result){
					defer.reject(result);
				});
			//Si la capa es de tipus xarxes socials
			}else if(value.serverType == t_xarxes_socials){
				var options = $.parseJSON( value.options );
				if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
				else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
				else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
				defer.resolve();
			}else if(value.serverType == t_tematic){
				loadTematicLayer(value).then(function(){
					defer.resolve();
				});
			}else if(value.serverType == t_visualitzacio){
				if (self.edit) {
					loadVisualitzacioLayer(value).then(function(){
						defer.resolve();
					});	
				}
				else {
					loadCacheVisualitzacioLayer(value).then(function(){
						defer.resolve();
					});	
				}
			//Si la capa es de tipus vis_wms
			}else if(value.serverType == t_vis_wms || value.serverType == t_vis_wms_noedit){
				loadVisualitzacioWmsLayer(value);
				defer.resolve();
			}
			else if(value.serverType == tem_heatmap_wms || value.serverType == tem_cluster_wms){
				loadVisualitzacioWmsLayerSenseUtfGrid(value);
				defer.resolve();
			}else{
				console.error("Tipus capa no soportat");
				defer.reject({msg:"Tipus capa no soportat"});
			}

			return defer.promise();
		}, 
		
		_loadAllLayers: function(_mapConfig, _controlCapes){
			var self = this,
			dfd = $.Deferred();
			self.waitDeferred = dfd;
			
			self._loadOrigenWMS(_mapConfig, _controlCapes).then(function(results){
				var num_origen = 0;
				self.numLayers = results.origen.length + results.sublayers.length;
				if(self.numLayers === 0){
					self._waitLoadAll(0);
				}

				if (!self.edit)
				{
				
					self.map.oms = new OverlappingMarkerSpiderfier(self.map, {keepSpiderfied : true});
					var popup = new L.Popup();
					self.map.oms.addListener('click', function(marker) {

						if(marker.getPopup)
						{
						
							popup.setContent(marker.getPopup().getContent());
							popup.setLatLng(marker.getLatLng());
							self.map.openPopup(popup);

						}
						
					});

				}

				$.each(results.origen, function(index, value){

					self.loadLayer(value).then(function(){
						num_origen++;
						self._waitLoadAll(num_origen);
						if (num_origen == results.origen.length){
							$.each(results.sublayers, function(index, value){
								self.loadLayer(value).then(function(){
									num_origen++;
									self._waitLoadAll(num_origen);
								},function(){
									num_origen++;
									self._waitLoadAll(num_origen);
								});
							});
						}
					},function(){
						num_origen++;
						self._waitLoadAll(num_origen);
					});
				});
			});
			return dfd.promise();
		},
				
		_waitLoadAll: function(numLayers){
			var self = this;
			if(self.numLayers === numLayers){
				self.waitDeferred.resolve();
			}
			return self;
		},
		
		_loadOrigenWMS: function(_mapConfig, _controlCapes){
			var dfd = $.Deferred(),
			layer_map = {origen:[],sublayers:[]};
			
			$.each(_mapConfig.servidorsWMS, function(index, value){
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
					lsublayers.push(value); //variable global se tendría que quitar
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
					if(_controlCapes){
						_controlCapes._addGroupFromObject(jsonOptions.group);
					}
				}
			});

			dfd.resolve(layer_map);
			return dfd.promise();
		},

	};
	
	InstamapsLayers.init = function(options){
		var self = this;
		self = $.extend(self, options);
	};
	
	InstamapsLayers.init.prototype = InstamapsLayers.prototype;
	
	global.InstamapsLayers = InstamapsLayers;
	
}(window, jQuery));