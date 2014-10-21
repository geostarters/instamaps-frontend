//Requeries OpenLayers

var DadesObertes = new function () {
	
    this.cameres = function () {
		
		var c1 = new OpenLayers.StyleMap({
				fillOpacity : 1,
				graphicWidth : 30,
				graphicHeight : 26,
				externalGraphic : "/share/img/icons/st_came.png"
			});
		
		var r1 = new OpenLayers.Layer.Vector("ST_CAME_GML", {
				projection : new OpenLayers.Projection("EPSG:4326"),
				displayInLayerSwitcher : false,
				styleMap : c1,
				isBaseLayer : false,
				protocol : new OpenLayers.Protocol.HTTP({
					url : "/share/jsp/openDataProxy.jsp?url=cameres",
					format : new OpenLayers.Format.GML()
				}),
                 renderers: ["Canvas", "SVG", "VML"],
				strategies : [new OpenLayers.Strategy.BBOX()]
			});
		
		controlCameres = new OpenLayers.Control.SelectFeature(r1, {
				onSelect : (function (feature) {
					
					var s = "<div style='padding:15px;font-family:tahoma,arial,helvetica,sans-serif;font-size:12px;font-style: bold;;border: 1px #d29c1d'>" +
						"<b>Carretera:</b>" + feature.attributes.carretera + "<br>" +
						"<b>Municipi:</b>" + feature.attributes.municipi + "<br>" +
						"<b>Punt kilomètric:</b>" + feature.attributes.pk + "<br>" +
						"<b>Font:</b>" + feature.attributes.font + "<br>" +
						"<img border='1' src=" + feature.attributes.link + ">" +
						"</div>";
					selectedFeature = feature;
					popup = new OpenLayers.Popup.FramedCloud("chicken",
							feature.geometry.getBounds().getCenterLonLat(),
							null,
							s,
							null, true, function (evt) {
							controlCameres.unselect(selectedFeature);
						});
					feature.popup = popup;
					map.addPopup(popup);
					
				}),
				onUnselect : (function (feature) {
					map.removePopup(feature.popup);
					feature.popup.destroy();
					feature.popup = null;
				})
			});
		map.addControl(controlCameres);
		controlCameres.activate();
		
		return r1;
		
	};
	
    this.incidencies = function () {
		
		var A = {
			Obres : {
				fillOpacity : 1,
				graphicWidth : 30,
				graphicHeight : 26,
				externalGraphic : "/share/img/icons/st_obre.png"
			},
			"Retenció" : {
				fillOpacity : 1,
				graphicWidth : 30,
				graphicHeight : 26,
				externalGraphic : "/share/img/icons/st_rete.png"
			},
			Cons : {
				fillOpacity : 1,
				graphicWidth : 30,
				graphicHeight : 26,
				externalGraphic : "/share/img/icons/st_cons.png"
			},
			Meterologia : {
				fillOpacity : 1,
				graphicWidth : 30,
				graphicHeight : 26,
				externalGraphic : "/share/img/icons/st_mete.png"
			}
		};
		
		var c = new OpenLayers.StyleMap();
		
		c.addUniqueValueRules("default", "descripcio_tipus", A);
		
		var r = new OpenLayers.Layer.Vector("ST_INCI_GML", {
				projection : new OpenLayers.Projection("EPSG:4326"),
				displayInLayerSwitcher : false,
				styleMap : c,
				isBaseLayer : false,
				protocol : new OpenLayers.Protocol.HTTP({
					url : "/share/jsp/openDataProxy.jsp?url=incidencies",
					format : new OpenLayers.Format.GML()
				}),
                 renderers: ["Canvas", "SVG", "VML"],
				strategies : [new OpenLayers.Strategy.BBOX()]
			});
		
		controlIncidencies = new OpenLayers.Control.SelectFeature(r, {
				onSelect : (function (feature) {
					
					var s = "<div style='padding:15px;font-family:tahoma,arial,helvetica,sans-serif;font-size:12px;font-style: bold;;border: 1px #d29c1d'>" +
						
						"<b>Carretera:</b>" + feature.attributes.carretera + "<br>" +
						"<b>Causa:</b>" + feature.attributes.causa + "<br>" +
						"<b>Data:</b>" + feature.attributes.data + "<br>" +
						"<b>Descripció:</b>" + feature.attributes.descripcio + "<br>" +
						"<b>Tipus:</b>" + feature.attributes.descripcio_tipus + "<br>" +
						"<b>Font:</b>" + feature.attributes.font + "<br>" +
						"<b>Identificador:</b>" + feature.attributes.identificador + "<br>" +
						"<b>Inici punt kilomètric:</b>" + feature.attributes.pk_inici + "<br>" +
						"<b>Fi punt kilomètric:</b>" + feature.attributes.pk_fi + "<br>" +
						"<b>Sentit:</b>" + feature.attributes.sentit + "<br>" +
						"</div>";
					selectedFeature = feature;
					popup = new OpenLayers.Popup.FramedCloud("chicken",
							feature.geometry.getBounds().getCenterLonLat(),
							null,
							s,
							null, true, function (evt) {
							controlIncidencies.unselect(selectedFeature);
						});
					feature.popup = popup;
					map.addPopup(popup);
					
				}),
				onUnselect : (function (feature) {
					map.removePopup(feature.popup);
					feature.popup.destroy();
					feature.popup = null;
				})
			});
		map.addControl(controlIncidencies);
		controlIncidencies.activate();
		
		return r;
		
	};
    
    
    this.centresTDT = function () {
    
   
   var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
style.fillOpacity = 0.2;
style.graphicOpacity = 1;
style.strokeWidth = 3; 
style.strokeColor = "#ff0000";
style.strokeOpacity = 1; style.pointRadius = 4; 

    var tt = new OpenLayers.Layer.Vector("CENTRES_TDT_KML", {
				projection : new OpenLayers.Projection("EPSG:4326"),
				displayInLayerSwitcher : false,				
				isBaseLayer : false,
                 style : style,
				protocol : new OpenLayers.Protocol.HTTP({
					url : "/share/jsp/openDataProxy.jsp?url=centresTDT",
                   
					format: new OpenLayers.Format.KML({
                  
                    extractAttributes: true,
                    maxDepth: 2
                })
				}),
                 renderers: ["Canvas", "SVG", "VML"],
				strategies : [new OpenLayers.Strategy.BBOX()]
			});
		
        
          
        controlcentresTDT = new OpenLayers.Control.SelectFeature(tt, {
				onSelect : (function (feature) {
					var s = "<div style='padding:15px;font-family:tahoma,arial,helvetica,sans-serif;font-size:12px;font-style: bold;;border: 1px #d29c1d'>" +
						feature.attributes.description +
						
						"</div>";
					selectedFeature = feature;
					popup = new OpenLayers.Popup.FramedCloud("chicken",
							feature.geometry.getBounds().getCenterLonLat(),
							null,
							s,
							null, true, function (evt) {
							controlcentresTDT.unselect(selectedFeature);
						});
					feature.popup = popup;
					map.addPopup(popup);
					
				}),
				onUnselect : (function (feature) {
					map.removePopup(feature.popup);
					feature.popup.destroy();
					feature.popup = null;
				})
			});
		map.addControl(controlcentresTDT);
		controlcentresTDT.activate();
        
        
        
           
    
    return tt;
	};
    
  
    this.metroKML = function () {
    
     var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
style.graphicOpacity = 1;
				 style.graphicWidth = 12;
				 style.graphicHeight = 12;
				 style.externalGraphic = "/share/img/icons/metro1.png";

     style.pointRadius = 4; 
 

 
 
    var mt = new OpenLayers.Layer.Vector("METRO_KML", {
				projection : new OpenLayers.Projection("EPSG:4326"),
				displayInLayerSwitcher : false,				
				isBaseLayer : false,
                 style : style,
                 //styleMap : c,
				protocol : new OpenLayers.Protocol.HTTP({
					url : "/share/jsp/openDataProxy.jsp?url=metro",
                   
					format: new OpenLayers.Format.KML({
                    extractStyles: false,
                    extractAttributes: true,
                    maxDepth: 2
                })
				}),
                 renderers: ["Canvas", "SVG", "VML"],
				strategies : [new OpenLayers.Strategy.BBOX()]
			});
		
        
          
        controlmetro = new OpenLayers.Control.SelectFeature(mt, {
				onSelect : (function (feature) {
               // console.info(feature);
					var s = "<div style='padding:15px;font-family:tahoma,arial,helvetica,sans-serif;font-size:12px;font-style: bold;;border: 1px #d29c1d'>" +
						feature.attributes.LINIA.value +
						
						"</div>";
					selectedFeature = feature;
					popup = new OpenLayers.Popup.FramedCloud("chicken",
							feature.geometry.getBounds().getCenterLonLat(),
							null,
							s,
							null, true, function (evt) {
							controlmetro.unselect(selectedFeature);
						});
					feature.popup = popup;
					map.addPopup(popup);
					
				}),
				onUnselect : (function (feature) {
					map.removePopup(feature.popup);
					feature.popup.destroy();
					feature.popup = null;
				})
			});
		map.addControl(controlmetro);
		controlmetro.activate();
        
        
        
           
    
    return mt;
	};
  
  
    this.estacionsTr = function () {
  
   var z = new OpenLayers.Layer.WMS("Estacions",
   "http://tauredev.icc.local/ogc/geoservei?map=/opt/idec/dades/gencat/dadesobertes.map", {
        layers: "Estacions",
        format: "image/png",
        transparent: "true"
    }, {
        isBaseLayer: false,
        displayInLayerSwitcher: false,
        singleTile: true
    });
   // z.setVisibility(false);
  
 return z;
  
  };
  
  
    this.lineesTr = function () {
  
   var z = new OpenLayers.Layer.WMS("Linees",
   "http://tauredev.icc.local/ogc/geoservei?map=/opt/idec/dades/gencat/dadesobertes.map", {
        layers: "Linees",
        format: "image/png",
        transparent: "true"
    }, {
        isBaseLayer: false,
        displayInLayerSwitcher: false,
        singleTile: true
    });
   // z.setVisibility(false);
  
 return z;
  
  };
      

    this.radars = function () {
    
     var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
style.graphicOpacity = 1;
				 style.graphicWidth = 16;
				 style.graphicHeight = 16;
				 style.externalGraphic = "/share/img/icons/radar1.png";

     style.pointRadius = 4; 
 

 
 
    var rad = new OpenLayers.Layer.Vector("RADARS_TXT", {
				projection : new OpenLayers.Projection("EPSG:23031"),
				displayInLayerSwitcher : false,				
				isBaseLayer : false,
                 style : style,
                 //styleMap : c,
				protocol : new OpenLayers.Protocol.HTTP({
					url : "/share/jsp/openDataProxy.jsp?url=radars",                  
					format: new OpenLayers.Format.GeoJSON()
				}),
                 renderers: ["Canvas", "SVG", "VML"],
				strategies : [new OpenLayers.Strategy.BBOX()]
			});
		
        
          
        controlradar = new OpenLayers.Control.SelectFeature(rad, {
				onSelect : (function (feature) {
              
					var s = "<div style='padding:15px;font-family:tahoma,arial,helvetica,sans-serif;font-size:12px;font-style: bold;;border: 1px #d29c1d'>" +
					"Via:<b>"+feature.attributes.Via +"</b><br>"+
                     "PK:<b>"+feature.attributes.PK +"</b><br>"+
                        "Km/h:<b>"+feature.attributes.Vel +"</b>"+
						
						"</div>";
					selectedFeature = feature;
					popup = new OpenLayers.Popup.FramedCloud("chicken",
							feature.geometry.getBounds().getCenterLonLat(),
							null,
							s,
							null, true, function (evt) {
							controlradar.unselect(selectedFeature);
						});
					feature.popup = popup;
					map.addPopup(popup);
					
				}),
				onUnselect : (function (feature) {
					map.removePopup(feature.popup);
					feature.popup.destroy();
					feature.popup = null;
				})
			});
		map.addControl(controlradar);
		controlradar.activate();
        
        
        
           
    
    return rad;
	};
  






      
}
