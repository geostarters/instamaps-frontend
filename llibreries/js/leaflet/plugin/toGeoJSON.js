/**
 * Created by Camron on 2/28/2015.
 */


$(function () {

    L.toGeoJSON = (function () {
        //An empty array to hold GeoJSON data
        var geoJsonData = [];

        //Method to be revealed for retrieving data
        function getData(url) {
            return $.getJSON(url);
        }

        //Method to be revealed for converting JSON to GeoJSON
        function convert(url, geometryType) {

            //Use promise from getData
            return getData(url).done(function (data) {

                //Filter to only use objects with Latitude and Longitude
                var filteredData = data.filter(function (item) {
                	return !!item.latitud && !! item.longitud;
                });

                var keys = [];
                $.each(filteredData, function (index, value, array) {
                	Object.keys(value).forEach(function(k) {
                		if (keys.indexOf(k) == -1) keys.push(k);
                	});
                });
                //For each object create a new GeoJSON object
                $.each(filteredData, function (index, value, array) {
                	 $.each(keys, function (index2, value2, array2) {
                		 if (!value.hasOwnProperty(value2)){
                			 value[value2]="";
                		 }
                	 });
                	console.debug(value);
                	geoJsonData.push({
                        "type": "Feature",
                        "geometry": {
                            "type": geometryType,
                            "coordinates": [ parseFloat(value.longitud),  parseFloat(value.latitud)]
                        },
                        "properties": value
                    });
                });
                L.toGeoJSON.geoJsonData = geoJsonData;
                console.debug(keys);
            });
           
            return L.toGeoJSON.geoJsonData;
           
        }

        function empty() {
            geoJsonData = [];
            L.toGeoJSON.geoJsonData = geoJsonData;
        }

        //Reveal methods and GeoJSON data
        return {
            getData: getData,
            convert: convert,
            empty: empty,
            geoJsonData: geoJsonData
        };

    }());

});