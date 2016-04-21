
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

console.info("modul Rubi arbres");

if (($(location).attr('href').indexOf('/visor.html') != -1)) {
	$("head").append('<link rel="stylesheet" href="/llibreries/css/leaflet/leaflet.draw.css">');
	$("head").append('<script src="/llibreries/js/leaflet/plugin/leaflet.draw-custom.js" type="text/javascript"></script>');
}

setTimeout(function () {
	L.control.addmodulArbres(new L.geoJson()).addTo(map);

}, 2000);

L.Control.addModulArbres = L.Control.extend({

		options : {
			urlWFS : 'http://172.30.22.41:8080/geoserver/Arbres/wms',
			parametersWFS : {
				service : 'WFS',
				outputFormat : 'text/javascript',
				srsName : 'EPSG:4326',
				typeName : 'Arbres:arbres_wfs',
				version : '1.1.0',
				maxfeatures : 3000,
				request : 'GetFeature'
			},

			layersWMS : 'arbres_alcada,arbres_ndvi_media'

		},

		initialize : function (GeoJsonLayer, options) {
			this.geoJsonLayer = GeoJsonLayer;
			this.controlDraw;

			L.Util.setOptions(this, options);
		},
		onAdd : function (map) {
			console.info(this.geoJsonLayer);
			this.geoJsonLayer.addTo(map);
			//this.getFeatureRequest(null, null, map);
			this.addControlDrawButtons(this.geoJsonLayer);
			this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
			return this._container;
		},
		onRemove : function (map) {},

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
			};

			this.controlDraw = new L.Control.Draw(optionsD);

			this.controlDraw.setDrawingOptions({
				rectangle : {
					shapeOptions : {
						color : '#F76504'
					}
				},
				polygon : {
					shapeOptions : {
						color : '#F76504'
					}
				},
				marker :false
				/*
				marker : {
					icon : L.icon({
						iconUrl : '/moduls/arbres/img/blank.png',
						iconSize : [1, 1],
						iconAnchor : [1, 1]
					})
				}
				*/
			});

			L.drawLocal.draw.toolbar.buttons.polygon = 'Selecció per àrea';
			L.drawLocal.draw.toolbar.buttons.rectangle = 'Selecció per rectangle';
			L.drawLocal.draw.toolbar.buttons.marker = 'Selecció per punt';
			L.drawLocal.draw.handlers.polygon.tooltip.start = 'Clica per començar a dibuixar una àrea';
			L.drawLocal.draw.handlers.marker.tooltip.start = 'Clica per seleccionar un arbre';
			L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Clica per continuar dibuixant una àrea';
			L.drawLocal.draw.handlers.polygon.tooltip.end = 'Clica el primer punt per tancar aquesta àrea';
			L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Clica i arrosega per dibuixar un rectangle';
			L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Deixa anar el ratolí per finalitzar el rectangle';

			map.addControl(this.controlDraw);
			
			
			var that = this;

			/*
			map.off('click');
			map.on('click',function(e){
			console.info("He fet click");
			});
			 */

			map.on('draw:drawstart', function (e) {
				console.info("draw start");
			});
			
			//draw:drawstart
			//draw:editstart

			map.on('draw:created', function (e) {

				var spatialFilter = 'Within';

				if (e.layerType == "rectangle") {
					
					spatialFilter = 'Within';
				}
				else if (e.layerType == "polygon") {
					
					
				}else {
					
					spatialFilter = 'Intersects';
					
				}

				that.getFeatureRequest(e.layer.toGML(), spatialFilter);

				//aturaClick(e);
			});

		},
		getFeatureRequest : function (geometryGML, spatialFilter) {

			var parameters = L.Util.extend(this.options.parametersWFS);
			var FILTER = 'FILTER=(<Filter xmlns:gml="http://www.opengis.net/gml" ><'+spatialFilter+'><PropertyName>geom</PropertyName>' + geometryGML + '</'+spatialFilter+'></Filter>)';

			var BBOX = "bbox=" + map.getBounds().getSouth() + "," + map.getBounds().getWest() + "," + map.getBounds().getNorth() + "," + map.getBounds().getEast();

			console.log(this.options.urlWFS + L.Util.getParamString(parameters) + '&' + FILTER + '&');
			var that = this;

			$.ajax({
				url : this.options.urlWFS + L.Util.getParamString(parameters) + '&' + FILTER + '&',
				dataType : "jsonp",
				method : 'post',
				jsonp : "false",
				jsonpCallback : "parseResponse",
				success : function (dataGeoJson) {
					console.info(dataGeoJson);
					that.handleJson(dataGeoJson);
				}
			});
		},

		handleJson : function (dataGeoJson) {

			this.geoJsonLayer.clearLayers();
			this.geoJsonLayer.addData(dataGeoJson);
			this.geoJsonLayer.setStyle({
				fillColor : "#FC07FC",
				color : "#FC07FC",
				weight : 2,
				opacity : 1,
				fillOpacity : 0.8
			});

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

			// Note: Geoserver doesn't support circles, need to convert this to a polygon
			//xml += '<gml:Circle srsName="EPSG:4326">';
			//xml += '<gml:pos>115.832 -31.939</gml:pos>';
			//xml += '<gml:radius uom="km">0.5</gml:radius>';
			//xml += '</gml:Circle>';

			//return xml;
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
