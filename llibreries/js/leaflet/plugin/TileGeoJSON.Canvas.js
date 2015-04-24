/**
 * 
 */
L.TileLayer.GeoJSON = L.TileLayer.Canvas.extend({
	options: {
		//pane: 'overlayPane',
//		pane: 'overlayPane',
		maxZoom: 18,
		maxPoints: 100,
		baseZoom: 18,
		debug: 1,
		factor: 16.0,
		opacity: 1,
		style: {
			point: {
				radius: 6,
				fillColor: "#ff0000",
				strokeColor: "#ffffff",
				stroke: 2
			},
			line: {
				strokeColor: "#00ff00",
				stroke: 2	
			},
			polygon: {
				fillColor: "#000000",
				strokeColor: "#0000ff",
				stroke: 2, 
				alpha: 0.5
			}
		}
	},
		
	tileIndex: null,
	
	initialize: function(options){
		L.setOptions(this, options);
		_this = this;
		$.ajax({
            url: options.url,
            dataType: 'json',
            timeout: 60000,
            success: function(geojson) {
                console.debug(geojson);
                _this.tileIndex = geojsonvt(geojson, _this.options);
        		console.debug("AKI:"+_this.tileIndex);
            },
            error: function(xhr, ajaxOptions, thrownError) {
            	_this._tileLoaded();
            	console.debug(xhr);
            	console.debug(ajaxOptions);
            	console.debug(thrownError);
            }
		});
	}, 
//	onAdd: function (map) {
//        this._map = map;
//        console.debug("On Add...");
//        // create a DOM element and put it into one of the map panes
//        this._el = L.DomUtil.create('div', 'leaflet-tile-container leaflet-zoom-animated my-geojson-layer');
//        console.debug("this._el:");
//        console.debug(this._el);
//        
//        map.getPanes().overlayPane.appendChild(this._el);
//
//        
//        // add a viewreset event listener for updating layer's position, do the latter
//        map.on('viewreset', this._reset, this);
//        this._reset();
//    },
	
//    onAdd: function (map) {
//        this._map = map;
//        L.TileLayer.Ajax.prototype.onAdd.call(this, map);
//        map.addLayer(this.geojsonLayer);
//    },	
	
	drawTile: function(canvas, tilePoint, zoom) {
		var ctx =  canvas.getContext('2d');
		var options = this.options; 
		var factor = options.factor;
		var tileIndex = this.tileIndex;
		if (tileIndex!=undefined) {
			var stage = new createjs.Stage(canvas);
			stage.enableMouseOver(10);
			stage.mouseMoveOutside = true;
			var tile = tileIndex.getTile(zoom, tilePoint.x, tilePoint.y);
			if (tile != undefined) {
				var features = tile.features;
				for (var i = 0; i < features.length; i++) {
					var feature = features[i],
					type = feature.type;
					for (var j = 0; j < feature.geometry.length; j++) {
						var geom = feature.geometry[j];
						if (type === 1) { //Point
							var circle = new createjs.Shape();
							circle.cursor = "pointer";
							circle.graphics.beginFill(options.style.point.fillColor).beginStroke(options.style.point.strokeColor).setStrokeStyle(options.style.point.stroke).drawCircle(geom[0] / factor,geom[1] / factor,options.style.point.radius);
							circle.tags = feature.tags;
//							circle.bindPopup("<div>Prova</div>");
							
							circle.addEventListener("click", function(e){
								console.debug("Click");
								console.debug(e.target.tags);
//								console.debug(this);
//								circle.openPopup();
							});
							
							stage.addChild(circle);
						}
						else if (type === 2){ //Line
							var p = geom[0];
							var line = new createjs.Shape();
							line.cursor = "pointer";
							line.graphics.moveTo(p[0]/factor, p[1]/factor);
							line.graphics.beginStroke(options.style.line.strokeColor).setStrokeStyle(options.style.line.stroke);
							for (var k = 1; k < geom.length; k++) {
								p = geom[k];
								line.graphics.lineTo(p[0]/factor, p[1]/factor);
							}
							//line.graphics.closePath();
							line.tags = feature.tags;
//							line.bindPopup("<div>Prova</div>");
							line.addEventListener("click", function(e){
								console.debug("Click");
								console.debug(e.target.tags);
								
//								$("#info_geojsonvt").css( "top", e.stageY);
//								var width = $("#info_geojsonvt").css("width");
//								$("#info_geojsonvt").css( "left", 320 + e.stageX);
								
								//openGeojsonvtPopUp(e.target.tags);
								
								jQuery('#bt_info_geojsonvt_close').on('click', function (e) {
//									tancaFinestra();
									jQuery('#info_geojsonvt .div_popup_visor').html('');
									jQuery('#info_geojsonvt').hide();
								});
								
								var html ='';
								html+='<div class="popup_pres">';
								$.each( e.target.tags, function( key, value ) {
//									alert( key + ": " + value );
									if(key.indexOf("slot")==-1 && value!=undefined && value!=null && value != " "){
										if (key != 'id' && key != 'businessId' && key != 'slotd50'){
											html+='<div class="popup_data_row">';
											
											var txt = parseUrlTextPopUp(String(value), key);
											if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
												html+='<div class="popup_data_key">'+key+'</div>';
												html+='<div class="popup_data_value">'+
												(isBlank(txt)?window.lang.convert("Sense valor"):txt)+
												'</div>';
											}else{
												html+='<div class="popup_data_img_iframe">'+txt+'</div>';
											}
											html+= '</div>';
										}
									}
								});
								html+= '</div>';
								
								//var html = '<p>Hello world!<br />This is a nice popup.</p>';
								jQuery('#info_geojsonvt .div_popup_visor').html(html);
								jQuery('#info_geojsonvt').show();
								
//								console.debug(line);
////								console.debug(this);
////								line.openPopup();
//								
//								var popup = L.popup()
//							    .setLatLng(L.latLng(map.getCenter().lat, map.getCenter().lng))
//							    .setContent('<p>Hello world!<br />This is a nice popup.</p>')
//							    .openOn(map);
								
							});
							stage.addChild(line);
						}
						else if (type === 3){ //Polygon
							var p = geom[0];
							var polygon = new createjs.Shape();
							polygon.cursor = "pointer";
							polygon.alpha = options.style.polygon.alpha;
							polygon.graphics.moveTo(p[0]/factor, p[1]/factor);
							polygon.graphics.beginFill(options.style.polygon.fillColor).beginStroke(options.style.polygon.strokeColor).setStrokeStyle(options.style.polygon.stroke);
							for (var k = 1; k < geom.length; k++) {
								p = geom[k];
								polygon.graphics.lineTo(p[0]/factor, p[1]/factor);
							}
							polygon.graphics.closePath();
							polygon.tags = feature.tags;
							polygon.addEventListener("click", function(e){
								console.debug(e.target.tags);
							});
							console.debug("Polygon click:");
							console.debug(polygon);
							stage.addChild(polygon);
						}
					}
				}
				stage.update();
			}
		}
	}
	
});

L.tileLayer.geoJSON = function(options){
	return new L.TileLayer.GeoJSON(options);
}