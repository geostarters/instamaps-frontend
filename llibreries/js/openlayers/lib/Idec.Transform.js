Idec_Transform = OpenLayers.Class({
	
	/**
     * Constructor: IdeLocal.WMC
     * Create a new parser for WMC docs.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Util.extend(this, options);
        this.options = options;
        OpenLayers.Projection.addTransform("EPSG:23031", "EPSG:25831",
    		this.ED50toETRS89
    	);
        OpenLayers.Projection.addTransform("EPSG:25831","EPSG:23031",
    		this.ETRS89toED50
    	);
    },
	    
    ED50toETRS89: function(point){
    	console.debug(point);
    	var x = point.x;
    	var y = point.y;
    	
    	// X
    	// Pas a radiants d' alfa
    	var p1 = (-1.56504*(Math.PI/180))/3600;
    	
    	// Càlcul del gir
    	var minuendX = x * (Math.cos(p1));
    	var subtrahendX = y * (Math.sin(p1));
    	var girX = minuendX - subtrahendX;
    	
    	// Càlcul de l'escala
    	var escalaX = girX * (1+0.0000015504);
    	
    	var xETRS89 = escalaX - 129.549;
    	
    	// Y
    	var minuendY = x * (Math.sin(p1));
    	var subtrahendY = (Math.cos(p1)) * y;
    	var girY = minuendY + subtrahendY;
    	
    	var escalaY = girY * (1+0.0000015504);
    	
    	var yETRS89 = escalaY - 208.185;		
    	
    	var posETRS89 = new OpenLayers.LonLat(xETRS89,yETRS89);
    	
    	point.x = posETRS89.lon;
    	point.y = posETRS89.lat;
        return point;
    }, 
    
    ETRS89toED50: function(point){
    	var x = point.x;
    	var y = point.y;
    	
    	// X
    	// Pas a radiants d' alfa
    	var p1 = (1.56504*(Math.PI/180))/3600;
    	
    	// Càlcul del gir
    	var minuendX = x * (Math.cos(p1));
    	var subtrahendX = y * (Math.sin(p1));
    	var girX = minuendX - subtrahendX;
    	
    	// Càlcul de l'escala
    	var escalaX = girX * (1-0.0000015504);
    	
    	var xED50 = escalaX + 129.549;
    	
    	// Y
    	var minuendY = x * (Math.sin(p1));
    	var subtrahendY = (Math.cos(p1)) * y;
    	var girY = minuendY + subtrahendY;
    	
    	var escalaY = girY * (1-0.0000015504);
    	
    	var yED50 = escalaY + 208.186;		
    	
    	var posED50 = new OpenLayers.LonLat(xED50,yED50);
    	
    	point.x = posED50.lon;
    	point.y = posED50.lat;
    	return point;
    },
    
    calculadora: function(point, epsgIn, epsgOut){
    	var ref1, ref2, coord1, coord2;
    	var url = "/share/jsp/calculadoraIcc.jsp?";
    	var data = {
    		epsgIn:epsgIn,
    		epsgOut:epsgOut,
    		x_lon: point.x, 
    		y_lat: point.y 
    	};
    	return jQuery.ajax({
    		url: url, 
    		data: data, 
    		dataType: 'json'
    	});
    },
    
	CLASS_NAME: "Idec_Transform" 
});