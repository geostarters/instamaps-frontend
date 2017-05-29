L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
		onAdd : function (map) {
			// Triggered when the layer is added to a map.
			// Register a click listener, then do all the upstream WMS things
			
			this.options.maxZoom = 19;
			L.TileLayer.WMS.prototype.onAdd.call(this, map);
			map.on('click', this.getFeatureInfo, this);
			addBarraPSolar();
			activaPanelCapes(true);			
			addControLSolarLL();
			var params = this.getLegendGraphic();
			updateLLegendaPSolar(params,this.wmsParams.layers,true);
			
		},
		onRemove : function (map) {
			// Triggered when the layer is removed from a map.
			// Unregister a click listener, then do all the upstream WMS things
			L.TileLayer.WMS.prototype.onRemove.call(this, map);
			map.off('click', this.getFeatureInfo, this);
			esborraCapes();
			jQuery('#psolar_info_dv').hide();
			//if (this.wmsParams.layers.indexOf('irradiacio_global_calculada') != -1) {
			//jQuery('#psolar_info_dvLL').hide();
			//}
			var params = this.getLegendGraphic();
			//console.info(this.wmsParams.layers);
			updateLLegendaPSolar(params,this.wmsParams.layers,false);
			
		},
		getFeature : function (feature) {

		var that=this;
		
			var newFeature = feature[0];
			var coords = "";
			for (var z = 0; z < newFeature.length; z++) {

				coords = coords + newFeature[z][0] + "," + newFeature[z][1] + "%20";

			}

			var obj = jQuery.trim(coords);
			var params = this.getFeatureUrl();

			var urlApp = document.location.href;
			if ((urlApp.indexOf('localhost') != -1) || (urlApp.indexOf('.local') != -1) || (urlApp.indexOf('172.70.1.11') != -1)) {
				params = params.replace('betaserver.icgc.cat', '172.70.1.31');
				params = params.replace('www.instamaps.cat', '172.70.1.11');
				
				//params = params.replace('172.70.1.11', 'localhost');
			}
			//params=params.replace('betaserver.icgc.cat','84.88.72.98');


			var paramsWFS = this.wfsFyer(params, this.wmsParams.layers, map.getZoom(), obj, 'area');
						
			if (location.protocol == 'https:'){paramsWFS.url=paramsWFS.url.replace('http:','https:');}
			
			if (paramsWFS.capa != null) {
				if (map.hasLayer(capaGeoJSON_SOLAR)) {
					map.removeLayer(capaGeoJSON_SOLAR);
					
					map.on('click',function(e){ 
						that.getFeatureInfo(e);
						});
					
				}
			
				if((params.indexOf('instamaps.cat')!=-1) || (params.indexOf('instaweb') != -1) || (params.indexOf('172.70.1.11') != -1)){
										
									jQuery.ajax({
										url : paramsWFS.url,
										
										always : function (data, status, xhr) {
											map.spin(false);

										},
										success : function (geojson, status, xhr) {
											map.spin(false);

											if (geojson.features) {
												iniciaInfoPSolar(paramsWFS.capa, geojson);

											}

										},
										error : function (xhr, status, error) {
											map.spin(false);
										}

									});	
										
										
										
									}else{
				
				
				
				jQuery.ajax({
					url : paramUrl.proxy_betterWMS,
					data : {
						url : paramsWFS.url
					},
					always : function (data, status, xhr) {
						map.spin(false);

					},
					success : function (geojson, status, xhr) {
						map.spin(false);

						if (geojson.features) {
							iniciaInfoPSolar(paramsWFS.capa, geojson);

						}

					},
					error : function (xhr, status, error) {
						map.spin(false);
					}

				});
				
									}
				
				
				
				

			}// Fi If

			setTimeout(function () {
				heFetUnClick = true
			}, 3000);
			//heFetUnClick=true;

		},
		getFeatureUrl : function () {

			params = {
				request : 'GetFeature',
				service : 'WFS',
				srs : 'EPSG:4326',
				version : '1.0.0',
				//format: this.wmsParams.format,
				//filter: filter,
				//typename:capa;
				outputformat : 'geojson'
			};

			return this._url + L.Util.getParamString(params, this._url, true);

			return params;

		},
		getFeatureInfo : function (evt) {

		var that=this;
		
		
			if (heFetUnClick) {
				tancaFinestra();				
				var params = this.getFeatureUrl();			
			//	aturaClick(evt);

				var urlApp = document.location.href;
				if ((urlApp.indexOf('localhost') != -1) || (urlApp.indexOf('.local') != -1) || (urlApp.indexOf('172.70.1.11') != -1)) {
					params = params.replace('betaserver.icgc.cat', '172.70.1.31');
					params = params.replace('www.instamaps.cat', '172.70.1.11');
					
					//params = params.replace( '172.70.1.11','localhost');
				}
				
				
				var paramsWFS = this.wfsFyer(params, this.wmsParams.layers, map.getZoom(), evt.latlng, 'click');

				
				
			
				
				if (location.protocol == 'https:'){paramsWFS.url=paramsWFS.url.replace('http:','https:');}
				
				
				
				if (paramsWFS.capa != null) {
					if (map.hasLayer(capaGeoJSON_SOLAR)) {
						//map.clearLayers(capaGeoJSON_SOLAR);
						
						map.removeLayer(capaGeoJSON_SOLAR);	
						
						map.on('click',function(e){ 
						that.getFeatureInfo(e);
						});
						
					}
					

									if((params.indexOf('instamaps.cat')!=-1) || (params.indexOf('instaweb') != -1)|| (params.indexOf('172.70.1.11') != -1)){
										
									jQuery.ajax({
										url : paramsWFS.url,
										
										always : function (data, status, xhr) {
											map.spin(false);

										},
										success : function (geojson, status, xhr) {
											map.spin(false);

											if (geojson.features) {
												iniciaInfoPSolar(paramsWFS.capa, geojson);

											}

										},
										error : function (xhr, status, error) {
											map.spin(false);
										}

									});	
										
										
										
									}else{
									jQuery.ajax({
										url : paramUrl.proxy_betterWMS,
										data : {url : paramsWFS.url},
										always : function (data, status, xhr) {
											map.spin(false);

										},
										success : function (geojson, status, xhr) {
											map.spin(false);

											if (geojson.features) {
												iniciaInfoPSolar(paramsWFS.capa, geojson);

											}

										},
										error : function (xhr, status, error) {
											map.spin(false);
										}

									});

									}//fi else
				
				
				
				
				
				}//fi if
			}

			
			
		},

		getLegendGraphic : function () {

			params = {
				request : 'GetLegendGraphic',
				service : 'WMS',
				version : this.wmsParams.version,
				format : this.wmsParams.format,
				layer : this.wmsParams.layers

			};

			return this._url + L.Util.getParamString(params, this._url, true);

			return params;

		},

		getFeatureInfoUrl : function (latlng) {
			var bounds = this._map.getBounds();
			var SRS = this.wmsParams.srs;
			var BBOX = bounds.toBBoxString();
			if (SRS.indexOf('3857') != -1) {
				var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
				var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());

				BBOX = NW.x + "," + SE.y + "," + SE.x + "," + NW.y;

			}

			// Construct a GetFeatureInfo request URL given a point
			var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
			size = this._map.getSize(),
			params = {
				request : 'GetFeatureInfo',
				service : 'WMS',
				srs : SRS,
				styles : this.wmsParams.styles,
				transparent : this.wmsParams.transparent,
				version : this.wmsParams.version,
				format : this.wmsParams.format,
				bbox : BBOX,
				//bbox: ""+bounds.getSouth()+","+bounds.getWest()+","+bounds.getNorth()+","+bounds.getEast()+"",
				height : size.y,
				width : size.x,
				layers : this.wmsParams.layers,
				query_layers : this.wmsParams.layers,
				info_format : 'text/html'
			};
			params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
			params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
			return this._url + L.Util.getParamString(params, this._url, true);

			return params;
		},
		showGetFeatureInfo : function (err, latlng, content) {
			if (err) {
				console.log(err);
				return;
			} // do nothing if there's an error
			// Otherwise show the content in a popup, or something.
			L.popup({
				maxWidth : 800
			})
			.setLatLng(latlng)
			.setContent(content)
			.openOn(this._map);
		},

		wfsFyer : function (params, capa, zoom, latlng, tipus) {

			if (zoom >= 18) {

				if (capa.indexOf('_fotovoltaic') != -1) {
					capa = T_FV;
				} else if (capa.indexOf('_termosolar') != -1) {
					capa = T_TS;
				} else {
					capa = null;
				}
				//fotovoltaic
				//termosolar

			} else {

				if (capa.indexOf('_fotovoltaic') != -1) {
					capa = E_FV;
				} else if (capa.indexOf('_termosolar') != -1) {
					capa = E_TS;
				} else {
					capa = null;
				}

			}

			var filter = "";
			if (tipus == 'click') {
				/*

				filter="FILTER=<Filter><Intersects><PropertyName>Geometry</PropertyName><gml:Point>"+
				"<gml:coordinates>"+latlng.lng+","+latlng.lat+"</gml:coordinates></gml:Point><Distance units='m'>1</Distance>"+
				"</Intersects></Filter>";
				 */

				filter = "FILTER=<Filter>" +
					"<BBOX><PropertyName>NAME</PropertyName><Box%20srsName='EPSG:4326'>" +
					"<coordinates>" + latlng.lng + "," + latlng.lat + "%20" + parseFloat(latlng.lng + 0.00001) + "," + parseFloat(latlng.lat + 0.00001) + "</coordinates></Box></BBOX>" +
					"</Filter>";

			} else {

				//filter="FILTER=<Filter><Intersects><PropertyName>Geometry</PropertyName><gml:Polygon><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>"+latlng+"</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></Intersects></Filter>";

				filter = "FILTER=<Filter><Within><PropertyName>Geometry</PropertyName><gml:Polygon><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>" + latlng + "</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></Within></Filter>";

			}

			params = params.replace("REQUEST=GetFeatureInfo", "REQUEST=GetFeature");
			params = params.replace("SERVICE=WMS", "SERVICE=WFS");
			// params=params.replace("LAYERS=","TYPENAME=");
			params = params.replace("VERSION=1.1.1", "VERSION=1.1.0");
			params = params + "&OUTPUTFORMAT=geojson&MAXFEATURES=300&TYPENAME=" + capa + "&" + filter;

			var wfs = {
				url : params,
				capa : capa
			};

			return wfs;

		}

	});

L.tileLayer.betterWms = function (url, options) {
	return new L.TileLayer.BetterWMS(url, options);
};
