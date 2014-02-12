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
			0.45: "rgb(0,0,255)",
			0.50: "rgb(0,255,255)",
			0.60: "rgb(0,255,0)",
			0.65: "yellow",
			0.75: "rgb(255,0,0)",
				1: "rgb(255,0,0)"
			}
		
	});	
	
	
	
	heatLayerActiu.options = {
			businessId : '-1',
			nom : capa.layer.options.nom+"_heatmap",
			zIndex : controlCapes._lastZIndex+1,
			tipus : 'heatmap',
			capaOrigen:capa.layer.options.businessId,
		};


	
	map.addLayer(heatLayerActiu).on('layeradd',
			objecteUserAdded);
	
		controlCapes.addOverlay(heatLayerActiu,
				heatLayerActiu.options.nom, true);
		
		activaPanelCapes(true);
	
	
	
	
	
	
	
	
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
	
	
	
	heatLayerActiu.options = {
			businessId : '-1',
			nom : capa.layer.options.nom+"_heatmap",
			zIndex : controlCapes._lastZIndex+1,
			tipus : 'heatmap',
			capaOrigen:capa.layer.options.businessId,
		};


	
	map.addLayer(heatLayerActiu).on('layeradd',
			objecteUserAdded);
	
		controlCapes.addOverlay(heatLayerActiu,
				heatLayerActiu.options.nom, true);
		
		activaPanelCapes(true);
	
	
	
	
	
	
	
	
}



>>>>>>> refs/remotes/origin/master
