<<<<<<< HEAD
var heatLayerActiu
function createHeatMap(capa){
	var arrP=[];
	capa.layer.eachLayer(function(layer){
	
	var d =[layer.getLatLng().lat,layer.getLatLng().lng,1];	
	arrP.push(d);			
		
	});
	
	var heatLayerActiu = L.heatLayer(arrP,{radius:20,blur:15,max:1,
		gradient: {			
			0.35: "#070751",
			0.40: "#0095DE",
			0.45: "#02D5FF",
			0.50: "#02E0B9",
			0.55: "#00B43F",
			0.60: "#97ED0E",
			0.61: "#FFF800",
			0.65: "#FF9700",
			0.70: "#FF0101",
			1: "#720404"
			}	
	});	
	
	heatLayerActiu.options.businessId = '-1';
	heatLayerActiu.options.nom = capa.layer.options.nom+"_heatmap";
	heatLayerActiu.options.zIndex = controlCapes._lastZIndex+1;
	heatLayerActiu.options.tipus = t_heatmap;
	heatLayerActiu.options.capaOrigen=capa.layer.options.businessId;
	
	
	
	map.addLayer(heatLayerActiu);
	controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
	activaPanelCapes(true);
	
	map.removeLayer(capa.layer);
}
=======
var heatLayerActiu
function createHeatMap(capa){
	var arrP=[];
	capa.layer.eachLayer(function(layer){
	
	var d =[layer.getLatLng().lat,layer.getLatLng().lng,1];	
	arrP.push(d);			
		
	});
	
	var heatLayerActiu = L.heatLayer(arrP,{radius:20,blur:15,max:1,
		gradient: {
			0.45: "rgb(0,0,255)",
			0.50: "rgb(0,255,255)",
			0.60: "rgb(0,255,0)",
			0.65: "yellow",
			0.75: "rgb(255,0,0)",
				1: "rgb(255,0,0)"
		}
	});	
	
	heatLayerActiu.options.businessId = '-1';
	heatLayerActiu.options.nom = capa.layer.options.nom+"_heatmap";
	heatLayerActiu.options.zIndex = controlCapes._lastZIndex+1;
	heatLayerActiu.options.tipus = 'heatmap';
	heatLayerActiu.options.capaOrigen=capa.layer.options.businessId;
	
	controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
	activaPanelCapes(true);
	
	map.removeLayer(capa.layer);
}
>>>>>>> refs/remotes/origin/instamapes_jess_3
