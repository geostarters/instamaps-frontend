

/*
http://172.30.22.41:8080/geoserver/Arbres/wms?
service=WFS&
outputFormat=json&
srsName=EPSG:4326&
typeName=Arbres:arbres_circle&
version=1.1.0&
maxfeatures=2&
request=GetFeature

FILTER=(<Filter><Within><PropertyName>InWaterA_1M/wkbGeom
<PropertyName><gml:Envelope><gml:lowerCorner>43.5707 -79.5797</gml:lowerCorner>
<gml:upperCorner>43.8219 -79.2693</gml:upperCorner></gml:Envelope>
</Within></Filter>)


http://172.30.22.41:8080/geoserver/Arbres/wms?service=WFS&outputFormat=json&srsName=EPSG%3A4326&typeName=Arbres%3Aarbres_alcada&version=1.1.0&maxfeatures=50&request=GetFeature&FILTER=%28%3CFilter%3E%3CWithin%3E%3CPropertyName%3Ethe_geom%3CPropertyName%3E%3Cgml:Envelope%3E%3Cgml:lowerCorner%3E41.50564469006097%202.021484375%3C/gml:lowerCorner%3E%3Cgml:upperCorner%3E41.51330132805013%202.0350348949432373%3C/gml:upperCorner%3E%3C/gml:Envelope%3E%3C/Within%3E%3C/Filter%3E%29&_=1460549057526

 */



if (($(location).attr('href').indexOf('/visor.html') != -1)) {
	$("head").append('<link rel="stylesheet" href="/llibreries/css/leaflet/leaflet.draw.css">');
	$("head").append('<link rel="stylesheet" href="/moduls/arbres/css/arbres.css">');
	$("head").append('<script src="/llibreries/js/leaflet/plugin/leaflet.draw-custom.js" type="text/javascript"></script>');
}

/*
setTimeout(function () {
	L.control.addmodulArbres(new L.geoJson()).addTo(map);

}, 2000);


*/

//urlWFS : 'http://geoserver.icgc.cat:8080/geoserver/Arbres/wms',
//urlWFS : 'http://172.30.22.42:8080/geoserver/Arbres/wms',

var _protocol="https:";
if (location.protocol != 'https:'){_protocol="http:";}


L.Control.addModulArbres = L.Control.extend({

		options : {
			urlWFS : "https://geoserveis.icgc.cat/rubi_arbres/wms/service',
			parametersWFS : {
				service : 'WFS',
				outputFormat : 'text/javascript',
				srsName : 'EPSG:4326',
				typeName : 'arbres:arbres_wfs',
				version : '1.1.0',
				maxfeatures : 2000,
				request : 'GetFeature'
			},
			position : 'topleft',
			layersWMS : 'arbres_alcada,arbres_ndvi_media'

		},

		initialize : function (GeoJsonLayer, options) {
			this.geoJsonLayer = GeoJsonLayer;
			this.geoJsonLayerSelect=new L.geoJson();
			this.controlDraw;

			L.Util.setOptions(this, options);
		},
		onAdd : function (map) {

			this.geoJsonLayer.addTo(map);
			this.geoJsonLayerSelect.addTo(map);
			//this.getFeatureRequest(null, null, map);
			this.addControlDrawButtons(this.geoJsonLayer);
			this._container = L.DomUtil.create('div', 'arbres_info'); // create a div
			this._container.id = 'arbres_info_dv'; // with a class

			this._info_title = L.DomUtil.create('div', 'arbres_info_title'); // create a div
			this._info_title.id = 'arbres_info_title'; // with a class


			this._span = L.DomUtil.create('span', 'tema_verd glyphicon glyphicon-remove group-conf');
			this._span.id = 'info_tanca';
			L.DomEvent.on(this._span, 'click', this.closeInfo, this);

			this._info_content = L.DomUtil.create('div', 'arbres_info_content'); // create a div
			this._info_content.id = 'arbres_info_content'; // with a class
			L.DomEvent.on(this._info_content, 'click', aturaClick, this);
			
			
			this._info_title.appendChild(this._span);

			this._container.appendChild(this._info_title);
			this._container.appendChild(this._info_content);

			this.update("", false);
			return this._container;
		},
		onRemove : function (map) {},

		closeInfo : function (e) {
			this._container.style.display = 'none';
			this.geoJsonLayer.clearLayers();
			this.geoJsonLayerSelect.clearLayers();
			 changeWMSQueryable(true);

			aturaClick(e);

		},

		update : function (props, show) {
			/*
			this._div.innerHTML = '<button aria-hidden="true" id="bt_arbres_close" "data-dismiss="modal" class="close" type="button">×</button>'
			+ props;
			 */
			show ? this._container.style.display = 'block' : this._container.style.display = 'none';
			this._info_content.innerHTML = props;

		},

		addControlDrawButtons : function (geoJsonLayer) {

			var optionsD = {
				position : 'topleft',
				draw : {
					polyline : false,
					polygon : {
						allowIntersection : false, // Restricts shapes to simple
						drawError : {
							color : '#e1e100', // Color the shape will turn when
							message : '' // Message
						},
						shapeOptions : {
							color : '#bada55'
						}
					},
					circle : false, // Turns off this drawing tool
					rectangle : {
						shapeOptions : {
							clickable : false
						}
					},
					marker : true,
				},
				edit : false,
				remove : false
			};

			this.controlDraw = new L.Control.Draw(optionsD);

			this.controlDraw.setDrawingOptions({
				rectangle : {
					shapeOptions : {
						color : '#FFCC00'
					}
					,
				repeatMode:true
				},
				polygon : {
					shapeOptions : {
						color : '#FFCC00'
					}
					,
				repeatMode:true
				},
				//marker : false
				
				marker : {
				icon : L.icon({
				iconUrl : '/moduls/arbres/img/blank.png',
				iconSize : [1, 1],
				iconAnchor : [1, 1]
				}),
				repeatMode:true
				}
				 
			});

			L.drawLocal.draw.toolbar.actions.title = "Aturar selecció";
			L.drawLocal.draw.toolbar.actions.text = "Aturar&nbsp;selecció";

			//	L.drawLocal.draw.toolbar.finish.title="Acabar";
			//L.drawLocal.draw.toolbar.finish.text="Acabar";

			L.drawLocal.draw.toolbar.undo.title="";
			L.drawLocal.draw.toolbar.undo.text="&nbsp";

			//L.drawLocal.draw.toolbar.actions.title = "Cancel.lar";
			//L.drawLocal.draw.toolbar.actions.text = "Cancel.lar";
			L.drawLocal.draw.toolbar.buttons.polygon = 'Selecció arbres dibuixant una àrea';
			L.drawLocal.draw.toolbar.buttons.rectangle = 'Seleccióna arbres dibuixant un rectangle';
			L.drawLocal.draw.toolbar.buttons.marker = 'Seleccióna un arbre amb un punt';
			L.drawLocal.draw.handlers.polygon.tooltip.start = 'Clica per començar a dibuixar una àrea';
			L.drawLocal.draw.handlers.marker.tooltip.start = 'Clica per seleccionar un arbre';
			L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Clica per continuar dibuixant una àrea';
			L.drawLocal.draw.handlers.polygon.tooltip.end = 'Clica el primer punt per tancar aquesta àrea';
			L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Clica i arrosega per dibuixar un rectangle';
			L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Deixa anar el ratolí per finalitzar el rectangle';

			map.addControl(this.controlDraw);

			var that = this;
		
						
			map.on('draw:drawstop', function (e) {			
				changeWMSQueryable(true);

			});
			
			map.on('draw:editstop', function (e) {			
				changeWMSQueryable(true);
			});
			

			map.on('draw:drawstart', function (e) {			
				changeWMSQueryable(false);
			});

			map.on('draw:created', function (e) {

				var spatialFilter = 'Within';

				if (e.layerType == "rectangle") {

					spatialFilter = 'Within';
					that.getFeatureRequest(e, spatialFilter, getAreaLayer(e.layer));

				} else if (e.layerType == "polygon") {

					spatialFilter = 'Within';
					that.getFeatureRequest(e, spatialFilter, getAreaLayer(e.layer));
			
				} else {
					spatialFilter = 'Intersects';
					that.getFeatureRequest(e, spatialFilter, null);
					
				}

				

				//aturaClick(e);
			});

		},
		getFeatureRequest : function (geometry, spatialFilter, areaSeleccio) {

			var parameters = L.Util.extend(this.options.parametersWFS);
			var FILTER = 'FILTER=(<Filter xmlns:gml="http://www.opengis.net/gml" ><' + spatialFilter + '><PropertyName>geom</PropertyName>' + geometry.layer.toGML() + '</' + spatialFilter + '></Filter>)';

			var BBOX = "bbox=" + map.getBounds().getSouth() + "," + map.getBounds().getWest() + "," + map.getBounds().getNorth() + "," + map.getBounds().getEast();

			//console.log(this.options.urlWFS + L.Util.getParamString(parameters) + '&' + FILTER + '&');
			var that = this;

			$.ajax({
				url : this.options.urlWFS + L.Util.getParamString(parameters) + '&' + FILTER + '&',
				dataType : "jsonp",
				method : 'post',
				jsonp : "false",
				jsonpCallback : "parseResponse",
				success : function (dataGeoJson) {
					that.handleJson(dataGeoJson, areaSeleccio,geometry);
				}
			});
		},

		handleJson : function (dataGeoJson, areaSeleccio,geometry) {
			this.geoJsonLayerSelect.clearLayers();
			this.geoJsonLayer.clearLayers();
			this.geoJsonLayer.addData(dataGeoJson);
			this.geoJsonLayer.setStyle({
				fillColor : "#FC07FC",
				color : "#FC07FC",
				weight : 2,
				opacity : 1,
				fillOpacity : 0.8
			});



			if(geometry.layerType !="marker"){
				this.geoJsonLayerSelect.addData(geometry.layer.toGeoJSON());
				this.geoJsonLayerSelect.setStyle({
					fillColor : "#FC07FC",
					color : "#FFCC00",
					weight : 2,
					opacity : 1,
					fillOpacity : 0
				});
			}



			this.jsonTemplateInfo(dataGeoJson, areaSeleccio);
		},

		jsonTemplateInfo : function (dataGeoJson, areaSeleccio) {

			/*
			properties
			areaproj:5.40625
			bat:185.03467
			cat:91.87488
			compact:1.1893765
			gid:302602
			height:341
			hsum:60.0099999904633
			mcsc_raster:null
			ndvi_median:141.5
			perimeter:9.803301
			radieq:1.3118166
			 */

			var numTT = dataGeoJson.totalFeatures;
			var numFF = dataGeoJson.features.length;
			var coberta_percent = 0;
			var coberta_m2 = 0;
			var height_acc = 0;
			var height_min = 0;
			var bat_kg = 0;
			var cat_kg = 0;
			var ndvi_median=0;

			for (i = 0; i < numFF; i++) {

				var ff = dataGeoJson.features[i].properties;
				coberta_m2 = parseFloat(coberta_m2) + parseFloat(ff.areaproj);
				height_acc = parseFloat(height_acc) + parseFloat(ff.height);

				bat_kg = parseFloat(bat_kg) + parseFloat(ff.bat);
				cat_kg = parseFloat(cat_kg) + parseFloat(ff.cat);
				ndvi_median=(ff.ndvi_median/100) -1;
				
			}

			var html = '';

			if(areaSeleccio !=null){
			
			coberta_percent = coberta_m2 * 100 / parseFloat(areaSeleccio);
			height_min = height_acc / parseFloat(numFF);

			html = '<table class="tbl_dades" style="width:100%">' +
				'<tr><th>Àrea del polígon de selecció:</th><td>' + decimalComa(areaSeleccio.toFixed(1)) + ' m<sup>2</sup></td></tr>' +
				'<tr><th>Nombre d\'abres:</th><td>' + numFF + '</td></tr>' +
				'<tr><th>Àrea coberta (m<sup>2</sup>):</th><td>' + decimalComa(coberta_m2.toFixed(1)) + ' m<sup>2</sup></td></tr>' +
				'<tr><th>Àrea coberta (%):</th><td>' + decimalComa(coberta_percent.toFixed(1)) + ' %</td></tr>' +
				'<tr><th>Alçada mitjana (cm):</th><td>' + decimalComa(height_min.toFixed(1)) + ' cm</td></tr>' +
				'<tr><th>Biomassa aèria total (kg):</th><td>' + decimalComa(bat_kg.toFixed(1)) + ' kg</td></tr>' +
				'<tr><th>Carboni aèri total (kg):</th><td>' + decimalComa(cat_kg.toFixed(1)) + ' kg</td></tr>' +
				'</table>';

			}else{

			
			html = '<table class="tbl_dades" style="width:100%">' +
			
				'<tr><th>Alçada (cm):</th><td>' + decimalComa(height_acc.toFixed(1)) + ' cm</td></tr>' +				
				'<tr><th>Àrea de capçada (m<sup>2</sup>):</th><td>' + decimalComa(coberta_m2.toFixed(1)) + ' m<sup>2</sup></td></tr>' +
				'<tr><th>Biomassa aèria total (kg):</th><td>' + decimalComa(bat_kg.toFixed(1)) + ' kg</td></tr>' +
				'<tr><th>Carboni aèri total (kg):</th><td>' + decimalComa(cat_kg.toFixed(1)) + ' kg</td></tr>' +
				'<tr><th>NDVI:</th><td>' + decimalComa(ndvi_median.toFixed(1)) + ' </td></tr>' +
				'</table>';

			}			
				
			this.update(html, true);
			numTT > numFF ? alert("s'han trobat " + numTT + ".La selecció màxima és de " + this.options.parametersWFS.maxfeatures + ".\r Es mostren dades dels" + this.options.parametersWFS.maxfeatures + " primers arbres") : null;

		}

	});

L.Map.mergeOptions({
	positionControl : false
});

L.Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new L.Control.addModulArbres();
		this.addControl(this.positionControl);
	}
});

L.control.addmodulArbres = function (options) {
	return new L.Control.addModulArbres(options);
};

L.Path.include({
	toGML : function () {
		var coords,
		xml = '';

		if (this instanceof L.MultiPolygon || this instanceof L.MultiPolyline) {
			console.log("GML TODO: L.MultiPolygon and L.MultiPolyline"); //MultiPolygon and MultiLineString
		} else if (this instanceof L.Polygon) {
			//Polygon
			xml += '<gml:Polygon srsName="EPSG:4326">';

			coords = this.gmlCoordPairs(this.getLatLngs());
			xml += '<gml:exterior><gml:LinearRing><gml:coordinates cs="," decimal="." ts=" ">';
			xml += coords.join(' ') + ' ' + coords[0];
			xml += '</gml:coordinates></gml:LinearRing></gml:exterior>';
			if (this._holes && this._holes.length) {
				// Deal with holes
				for (var h in this._holes) {
					coords = this.gmlCoordPairs(this._holes[h]);
					xml += '<gml:interior><gml:LinearRing><gml:coordinates>';
					xml += coords.join(' ') + ' ' + coords[0];
					xml += '</gml:coordinates></gml:LinearRing></gml:interior>';
				}
			}

			xml += "</gml:Polygon>";
			return xml;
		} else if (this instanceof L.Polyline) {
			xml += '<gml:LineString srsName="EPSG:4326">';
			coords = this.gmlCoordPairs(this.getLatLngs());
			xml += '<gml:coordinates cs="," decimal="." ts=" ">';
			xml += coords.join(' ');
			xml += '</gml:coordinates>';
			xml += "</gml:LineString>";
			return xml;
		} else if (this instanceof L.Circle) {
			console.log("GML TODO: L.Circle");

			
		}
	},

	gmlCoordPairs : function (arrLatlng) {
		coords = [];
		for (var i = 0; i < arrLatlng.length; i++) {
			coords.push(arrLatlng[i].lng + ',' + arrLatlng[i].lat);
		}
		return coords;
	}
});

L.Marker.include({
	toGML : function () {
		var xml;
		xml = '<gml:Point srsName="EPSG:4326"><gml:coordinates cs="," decimal="." ts=" ">';
		xml += this.getLatLng().lng + ',' + this.getLatLng().lat;
		xml += '</gml:coordinates></gml:Point>';
		return xml;
	}
});


