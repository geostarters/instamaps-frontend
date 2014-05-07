/**
 * 
 */


function addURLfileLayer(){
	
//	var url = jQuery("#txt_URLfitxer").val();
	var url = 'https://dl.dropboxusercontent.com/u/1599563/campings.json';
	
	xhr(url, function(err, response) {
        if (err) {//return layer.fire('error', { error: err });
        	console.debug("Error xhr");
        }else{
        	console.debug(response);
            addData(layer, JSON.parse(response.responseText));
            layer.fire('ready');
        }

    });
	
//	var runLayer = omnivore.geojson('https://dl.dropboxusercontent.com/u/1599563/campings.json', null, L.FeatureGroup())
//    .on('ready', function() {
//    	console.debug(runLayer);
//        // An example of customizing marker styles based on an attribute.
//        // In this case, the data, a CSV file, has a column called 'state'
//        // with values referring to states. Your data might have different
//        // values, so adjust to fit.
//        this.eachLayer(function(marker) {
//        	console.debug(marker);
////            if (marker.toGeoJSON().properties.state === 'CA') {
////                // The argument to L.mapbox.marker.icon is based on the
////                // simplestyle-spec: see that specification for a full
////                // description of options.
////                marker.setIcon(L.mapbox.marker.icon({
////                    'marker-color': '#55ff55',
////                    'marker-size': 'large'
////                }));
////            } else {
////                marker.setIcon(L.mapbox.marker.icon({}));
////            }
////            // Bind a popup to each icon based on the same properties
////            marker.bindPopup(marker.toGeoJSON().properties.city + ', ' +
////                marker.toGeoJSON().properties.state);
//        });
//        map.fitBounds(this.getBounds());
//    })
//    .on('error', function() {
//        // fired if the layer can't be loaded over AJAX
//        // or can't be parsed
//    	console.debug("Error omnivore");
//    })
//    .addTo(map);	
	
}