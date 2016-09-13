/**
 * Crear el visor simple para el cloudifier
 */
;(function(global, $){
	
	var VisorSimple = function(options){
		return new VisorSimple.init(options);
	};
	
	var visorOptions = {
		controls: {},
	};
	
	VisorSimple.prototype = {
		
		drawEmbed: function(){
			var self = this,
			visor = self.visor;
			
			visor.hideControl('layersControl');
			
			return self;
		},
		
		setMapWMSBoundingBox: function(url){
			var instamapsWms = InstamapsWms({
				loadTemplateParam :false});
			var dataWMS = {url: url};
			instamapsWms.getWMSLayers(dataWMS).then(function(results) {
				//Fem Layer.Layer perq des de el cloudifier sempre tindrem nomes una capa
				var bbox = results.Capability.Layer.Layer.LatLonBoundingBox;
				map.fitBounds([
			       [bbox["@miny"], bbox["@minx"]],
			       [bbox["@maxy"], bbox["@maxx"]]
				]);
			},function(){
				console.error("Error getCapabilities");
			});
		},
		
		loadWmsVisorSimple: function(){
			var self = this,
			visor = self.visor,
			layername = visor.layername,
			map = visor.map,
			url = visor.urlwms;
			
			layer = {
				"url": url,
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
		
		loadVisorSimple: function(){
			var self = this,
			visor = self.visor,
			layername = visor.layername,
			title = "Mapa  "+ layername +" cloudifier",
			_map = visor.map;
			
			$('meta[poperty="og:title"]').attr('content', title);
			$('#nomAplicacio').html(title);
			document.title = title;
			$("#mapTitle").html(title);

			return self;
		},
		
		draw: function(){
			var self = this,
			visor = self.visor;
			
			if(visor.embed){
				self.drawEmbed();
			}
						
			self.loadVisorSimple();
			self.loadWmsVisorSimple();
			
			return self;
		}
	};
	
	VisorSimple.init = function(options){
		var self = this;
		self = $.extend(self, visorOptions, options);
	};
	
	VisorSimple.init.prototype = VisorSimple.prototype;
	
	global.VisorSimple = VisorSimple;
	
}(window, jQuery));