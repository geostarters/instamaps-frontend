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

      var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

      this.eachLayer(function (layer) {
        if (layer.toGeoJSON) {
         json = layer.toGeoJSON();
         //Custom: que no es perdin les propietats del feature
         if(jQuery.isEmptyObject(json.properties)){
           if(layer.properties.nom) json.properties.name = layer.properties.nom;
           if(layer.properties.data){
             jQuery.each(layer.properties.data, function(key, value){
               if(key.indexOf("slot")==-1 && key.indexOf("businessId")==-1){
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
