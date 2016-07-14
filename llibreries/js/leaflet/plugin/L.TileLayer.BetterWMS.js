var control_llegenda_WMS;
L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
	onAdd: function (map) {
		this.creaControlLLegenda(map);
		// Triggered when the layer is added to a map.
		// Register a click listener, then do all the upstream WMS things
		this.options.maxZoom=20;
		this.options.queryable=true;
		L.TileLayer.WMS.prototype.onAdd.call(this, map);
		map.on('click', this.getFeatureInfo, this);
		
		var params = this.getLegendGraphic();
		this.updateControlLLegenda(params,this.wmsParams.layers,true,this.options.nom,this.options.businessId);
	},
	onRemove: function (map) {
		// Triggered when the layer is removed from a map.
		// Unregister a click listener, then do all the upstream WMS things
		L.TileLayer.WMS.prototype.onRemove.call(this, map);
		map.off('click', this.getFeatureInfo, this);
		var params = this.getLegendGraphic();
		this.updateControlLLegenda(params,this.wmsParams.layers,false,this.options.nom,this.options.businessId);
	},
	getFeatureInfo: function (evt) {
		// Make an AJAX request to the server and hope for the best
		var params = this.getFeatureInfoUrl(evt.latlng);
		
		if(this.options.queryable){
		
		if ((params.indexOf('instamaps.cat')!=-1 || params.indexOf('172.70.1.11')!=-1 || params.indexOf('localhost')!=-1) && params.indexOf('instaserver')==-1){
			
			if (params.indexOf('/geoservicelocal/')!=-1){
				params = params.replace("INFO_FORMAT=text%2Fhtml","INFO_FORMAT=text%2Fplain");
			}
			
			var dataF="<iframe style=\"display: block; width:300px; height:200px;border:none;\"  src="+params+" ></iframe></div>";
			
			var pop=L.popup({ maxWidth: 800})
			.setLatLng(evt.latlng)
			.setContent(dataF).openOn(map);	
			
		}else{
			var esNomesWMS = true;
			var teUtfGrid = false;
			
			//De moment, si es un wms creat pel cloudifier, demanem text/pla
			//mes endavant passarem per ogrinfo i podrem demanar HTML amb template
			//per mostrar la informacio
			if (params.indexOf('http://betaserver.icgc.cat/geoservice/')!=-1){
				params = params.replace("INFO_FORMAT=text%2Fhtml","INFO_FORMAT=text%2Fplain");
			}
			
			
			for(val in controlCapes._layers){
				if(controlCapes._layers[val].layer.options.tipus != t_wms){
					esNomesWMS = false;
				}
				if (controlCapes._layers[val].layer.options.tipus == t_vis_wms){
					teUtfGrid=true;
				}
			}
		
			if(esNomesWMS){
				$.ajax({
					url: paramUrl.proxy_betterWMS,
					data: {url: params},
					success: function (data, status, xhr) {
						var err = typeof data === 'string' ? null : data;
		
						if(data.length > 5){
							var pop=L.popup({ maxWidth: 800})
								.setLatLng(evt.latlng)
								.setContent(data).openOn(map);					
						}
					},
					error: function (xhr, status, error) {
		
					}
					});				
			}else{
				if (!teUtfGrid || params.indexOf('instaserver')==-1) {
					
				
					var dataF="<iframe style=\"display: block; width:300px; height:200px;border:none;\"  src="+params+" ></iframe></div>";
					
					var pop=L.popup({ maxWidth: 800})
					.setLatLng(evt.latlng)
					.setContent(dataF).openOn(map);	
				}
				
				
				
			}
		}
		
		}//fi querable
		
		
	},
	
	getFeatureInfoUrl: function (latlng) {
		var bounds = this._map.getBounds();
		var SRS=this.wmsParams.srs;
		var BBOX=bounds.toBBoxString();
			if(SRS.indexOf('3857')!=-1){
				var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
				var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());
				  
				 BBOX=NW.x+","+SE.y+","+SE.x+","+NW.y;
			
			}
		
		// Construct a GetFeatureInfo request URL given a point
		var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
		size = this._map.getSize(),
		params = {
			request: 'GetFeatureInfo',
			service: 'WMS',
			srs: SRS,
			styles: this.wmsParams.styles,
			transparent: this.wmsParams.transparent,
			version: this.wmsParams.version,
			format: this.wmsParams.format,
			bbox: BBOX,
			//bbox: ""+bounds.getSouth()+","+bounds.getWest()+","+bounds.getNorth()+","+bounds.getEast()+"",
			height: size.y,
			width: size.x,
			//exceptions:'application/vnd.ogc.se_blank',
			layers: this.wmsParams.layers,
			query_layers: this.wmsParams.layers,
			info_format: 'text/html'
		};
		params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
		params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
		return this._url + L.Util.getParamString(params, this._url, true);
		
		return params;
	},
	showGetFeatureInfo: function (err, latlng, content) {
		if (err) { console.log(err); return; } // do nothing if there's an error
		// Otherwise show the content in a popup, or something.
		L.popup({ maxWidth: 800})
		.setLatLng(latlng)
		.setContent(content)
		.openOn(this._map);
	},
	
	getLegendGraphic : function () {

	
	var _format=this.wmsParams.format;
	_format=_format.replace('png8','png');
	
		params = {
			request : 'GetLegendGraphic',
			service : 'WMS',
			version : this.wmsParams.version,
			format : _format,
			layer : this.wmsParams.layers

		};

	
		
		return this._url + L.Util.getParamString(params, this._url, true);

		
		return params;

	},
	
	creaControlLLegenda : function (map) {
	
		var fet = false;

		
		
	
		if(jQuery('#div_control_wms_llegenda').length==0){
			
				if (map) {
				
					control_llegenda_WMS = L.control({
						position : 'bottomright'
					});
		
					control_llegenda_WMS.onAdd = function(map) {
						this._div = L.DomUtil.create('div', 'psolar_infoLL'); // create a
						// div
						this._div.id = 'div_control_wms_llegenda'; // with a class
						// "info"
						this.update();
						return this._div;
					};
		
					control_llegenda_WMS.update = function(props) {
						this._div.innerHTML = props;
					};
		
					control_llegenda_WMS.addTo(map);
					control_llegenda_WMS.update("");
		
					
					fet = true;
					return fet;
				}

		}
		
		return fet;

	},
	
	updateControlLLegenda :function (params,layer,estat,nom,businessId){
		
		
		if(getModeMapa()){//si estic visor i no hi ha llegenda
			
			
			
		if($("#mapLegend").length==0 && $("#mapLegendEdicio").length==0){
			
			
			addLegend();
			
		}
		
		
		
		
		if(estat){ //afegeixo
			
			var html = '<div style="text-align:center" id="wms_' + businessId + '"><div class="titol-legend col-md-12 col-xs-12">'+nom+'</div><div class="titol-separate-legend-row"></div>';
			html+='<img onerror="document.getElementById(\'wms_' + businessId + '\').style.display=\'none\';"  src="' + params + '"></div>';
			//mapLegendEdicio
			var divLlegenda='mapLegendEdicio';
			
			if($("#mapLegend").length > 0){divLlegenda='mapLegend';}
			
					$("#"+divLlegenda).append(html);			
					$("#"+divLlegenda).addClass("info");
					$("#"+divLlegenda).addClass("legend");
					$("#"+divLlegenda).addClass("visor-legend");
			
			if(!$("#mapLegend").hasClass("mCustomScrollbar") && $("#mapLegend").length > 0){				
				$("#mapLegend").addClass("mCustomScrollbar");
				$("#mapLegend").mCustomScrollbar();
			}
			
			if(!$("#mapLegendEdicio").hasClass("mCustomScrollbar") && $("#mapLegendEdicio").length > 0){
				
				$("#mapLegendEdicio").addClass("mCustomScrollbar");
				$("#mapLegendEdicio").mCustomScrollbar();
			}
			
			
			
			
			
			
			
			$(".bt_legend").show();
			activaLlegenda(true);
		
		
		
		}else{ //esborro
			//$(".bt_legend").hide();
		
			//activaLlegenda(false);
			
			jQuery('#wms_' + businessId).remove();
		}
		
		
		
		
		}
		
		
		
		
		
	}
	
	
});
 
L.tileLayer.betterWms = function (url, options) {
return new L.TileLayer.BetterWMS(url, options);
};
