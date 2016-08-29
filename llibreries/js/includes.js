/**
 * 
 */
L.LayerGroup.include({
    toGeoJSONcustom: function () {
      var geometry = this.feature && this.feature.geometry,
        jsons = [],
        json;

      if (geometry && geometry.type === 'MultiPoint') {
        return multiToGeoJSON('MultiPoint').call(this);
      }
      
     /*
      if (geometry && geometry.type === 'MultiPolygon') {
          return multiToGeoJSON('MultiPolygon').call(this);
        }
*/
      var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

      this.eachLayer(function (layer) {
        if (layer.toGeoJSON) {
         json = layer.toGeoJSON();
         //Custom: que no es perdin les propietats del feature
        
         
         var tipus=json.geometry.type;
        
         
         
         if(jQuery.isEmptyObject(json.properties)){
           if(layer.properties.nom) json.properties.name = layer.properties.nom;
           
           
           if(layer.properties.data){
          
        	   
        	   jQuery.each(layer.properties.data, function(key, value){
               if(key.indexOf("businessId")==-1){
                     json.properties[''+key+''] = value;
               }
             });
           }
         }
         
         
         if(jQuery.isEmptyObject(json.styles)){
        	
        	 
        	if(!jQuery.isEmptyObject(layer.options)){
        		 json.styles=layer.options;
        	 }else if(!jQuery.isEmptyObject(layer._options.style)){       		
        		 json.styles=layer._options.style;
        	 }
        	
        	
        	
 if(tipus.indexOf("Multi")!=-1){
	   		 if (layer.properties){		 
	        		 json.styles.fillColor=layer.properties.estil.color;
	        		 json.styles.borderColor=layer.properties.estil.borderColor;
	        		 json.styles.color=layer.properties.estil.borderColor;
	        		 json.styles.weight=layer.properties.estil.borderWidth;
	        		 json.styles.borderWidth=layer.properties.estil.borderWidth;
        		 }
        		 else if (layer._options.style){
        			 json.styles.fillColor=layer._options.style.color;
	        		 json.styles.borderColor=layer._options.style.borderColor;
	        		 json.styles.color=layer._options.style.borderColor;
	        		 json.styles.weight=layer._options.style.borderWidth;
	        		 json.styles.borderWidth=layer._options.style.borderWidth;
        		 }
             	
              }
        
         
         } 
         
         //assegurem que s'han guardat estils correctament...
         var count = Object.keys(json.styles).length;
         
         if(count <=1){
        	 if(!jQuery.isEmptyObject(layer.options) && Object.keys(layer.options).length>1){
        		 json.styles=layer.options;
        	 }else if(!jQuery.isEmptyObject(layer._options) && Object.keys(layer._options).length>1){
        		 json.styles=layer._options;
        	 }
         }         
         
         /*
         if(json.geometry.type != 'Point'){
	         try{
	          _newJson = turf.simplify(json, 0.00001, false);
	
	          json.geometry=_newJson.geometry;
	          
	         }catch(err){
	         	console.debug(err);
	
	         }
     }
         */
         
         jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
       
       
        
        
        }
        
       
      });

      if (isGeometryCollection) {
        return L.GeoJSON.getFeature(this, {
             geometries: jsons,
             type: 'GeometryCollection'
        });
      }

      return {
        type: 'FeatureCollection',
            features: jsons
      };

    }
});

//nou metode per 3D afegir els styles dins dels properties

L.LayerGroup.include({
    toGeoJSONStyles2ToProperties: function () {
      var geometry = this.feature && this.feature.geometry,
        jsons = [],
        json;

      if (geometry && geometry.type === 'MultiPoint') {
        return multiToGeoJSON('MultiPoint').call(this);
      }

      var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

      this.eachLayer(function (layer) {
        if (layer.toGeoJSON) {
         json = layer.toGeoJSON();
         //Custom: que no es perdin les propietats del feature
         if(jQuery.isEmptyObject(json.properties)){
        	 
			if(layer.properties && layer.properties.nom){ json.properties.name = layer.properties.nom;}
					   
			

			/*
        	 try{
        		 
        		 if(layer.properties && layer.properties.nom) { 
					json.properties.name = layer.properties.nom; 
        		 }else{
        			 json.properties=layer.options; 
        			 
        		 }
        		
        	 }catch(err){
				 
				 console.info(err);	
        		 json.properties=layer.options; 
        		
        	 }
        	 
          */
		  
		  
		  
           if(layer.properties && layer.properties.data){
             jQuery.each(layer.properties.data, function(key, value){
               if(key.indexOf("slot")==-1 && key.indexOf("businessId")==-1){
                     json.properties[''+key+''] = value;
               }
             });
           }
         }
         if(jQuery.isEmptyObject(json.styles)){
        	 if(!jQuery.isEmptyObject(layer.options)){
        		 json.properties.styles=layer.options;
        		 json.styles=layer.options;
        	 }else if(!jQuery.isEmptyObject(layer._options.style)){
        		 json.properties.styles=layer._options.style;
        		 json.styles=layer._options.style;
        	 }
         }

         //assegurem que s'han guardat estils correctament...
         var count = Object.keys(json.styles).length;
         if(count <=1){
        	 if(!jQuery.isEmptyObject(layer.options) && Object.keys(layer.options).length>1){
        		 json.properties.styles=layer.options;
        		 json.styles=layer.options;
        	 }else if(!jQuery.isEmptyObject(layer._options) && Object.keys(layer._options).length>1){
        		 json.properties.styles=layer._options;
        		 json.styles=layer._options;
        	 }
         }

         /*
        
         if(json.geometry.type != 'Point'){
		         try{
		          _newJson = turf.simplify(json, 0.000001, false);
		
		          json.geometry=_newJson.geometry;
		          
		         }catch(err){
		         	console.debug(err);
		
		         }
         }
         
         */
		
		 
         jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
        }
      });

      if (isGeometryCollection) {
        return L.GeoJSON.getFeature(this, {
             geometries: jsons,
             type: 'GeometryCollection'
        });
      }

      return {
        type: 'FeatureCollection',
            features: jsons
      };

    }
});