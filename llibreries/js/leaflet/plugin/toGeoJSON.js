/**
 * Created by Camron on 2/28/2015.
 */


$(function () {

    L.toGeoJSON = (function () {
        //An empty array to hold GeoJSON data
        var geoJsonData = [];

       
        //Method to be revealed for retrieving data
        function getData(url) {
        	var urlProxy = paramUrl.proxy_betterWMS + "?url="+url;
        	return jQuery.ajax({
				url: urlProxy,
				async: false,
				method: 'post'
			}).promise();
			//return $.getJSON(urlProxy);
        }

        //Method to be revealed for converting JSON to GeoJSON
        function convert(url, geometryType, lat, lon, localitzacio, separador) {
        	//Use promise from getData
            return getData(url).done(function (data) {
            	 //Filter to only use objects with Latitude and Longitude
            	var dades = data;
            	  var keys = [];
            	if (data.datasets!=undefined) dades=data.datasets;
            	
                var filteredData = dades.filter(function (item) {
                	return !!item[lat] && !!item[lon];
                });
                
                if (filteredData.length==0){
	                var filteredData2 = dades.filter(function (item) {
	                	var trobat=!!item[localitzacio] || JSON.stringify(item).indexOf(localitzacio)>-1;                	
	                	return trobat;
	                });
	                $.each(filteredData2, function (index, value, array) {
	                	Object.keys(value).forEach(function(k) {
	                		if (keys.indexOf(k) == -1) keys.push(k);
	                	});
	                });
	                //For each object create a new GeoJSON object
	                $.each(filteredData2, function (index, value, array) {
	                	 $.each(keys, function (index2, value2, array2) {
	                		 if (!value.hasOwnProperty(value2)){
	                			 value[value2]="";
	                		 }
	                	 });
	                	var localitzacio = value[localitzacio];
	                	var localitzacioSplit = localitzacio.split(separador);
	                	geoJsonData.push({
	                        "type": "Feature",
	                        "geometry": {
	                            "type": geometryType,
	                            "coordinates": [ parseFloat(localitzacioSplit[0]),  parseFloat(localitzacioSplit[1])]
	                        },
	                        "properties": value
	                    });
	                });
                }
                else {
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
                     	geoJsonData.push({
                             "type": "Feature",
                             "geometry": {
                                 "type": geometryType,
                                 "coordinates": [ parseFloat(value[lon]),  parseFloat(value[lat])]
                             },
                             "properties": value
                         });
                     });
                }
                L.toGeoJSON.geoJsonData = geoJsonData;
            });
           
            return L.toGeoJSON.geoJsonData;
           
        }

        function empty() {
            geoJsonData = [];
            L.toGeoJSON.geoJsonData = geoJsonData;
        }
        
        function createCORSRequest(method, url) {
        	$.ajax({
				url: paramUrl.proxy_betterWMS,
				data: {url: url},
				success: function (data, status, xhr) {
					console.debug(data);
					
				},
				error: function (xhr, status, error) {
					console.debug(error);
				}
			});
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