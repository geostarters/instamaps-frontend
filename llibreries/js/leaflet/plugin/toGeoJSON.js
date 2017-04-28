/**
 * Created by Camron on 2/28/2015.
 */


$(function () {

    L.toGeoJSON = (function () {
        //An empty array to hold GeoJSON data
        var geoJsonData = [];

       
        //Method to be revealed for retrieving data
        function getData(url) {
        	var urlProxy = HOST_APP+paramUrl.proxy_betterWMS + "?url="+encodeURIComponent(url);
        	return jQuery.ajax({
				url: urlProxy,
				async: false,
				method: 'get'
			}).promise();
			//return $.getJSON(urlProxy);
        }

        //Method to be revealed for converting JSON to GeoJSON
        function convert(url, geometryType, lat, lon, localitzacio, separador) {
        	var convArrToObj = function(array){
        	    var thisEleObj = new Object();
        	    if(typeof array == "object"){
        	        for(var i in array){
        	            var thisEle = convArrToObj(array[i]);
        	            thisEleObj[i] = thisEle;
        	        }
        	    }else {
        	        thisEleObj = array;
        	    }
        	    return thisEleObj;
        	};
        	//Use promise from getData
            return getData(url).then(function(results)  {
            	 //Filter to only use objects with Latitude and Longitude
            	var dades = results;
            	  var keys = [];
            	if (dades.datasets!=undefined) dades=dades.datasets;
            	else if (dades.data!=undefined) dades=dades.data;
            	
            	if (typeof dades.filter != "function") { 
	            	for (var key in dades) {
	            			var value = dades[key];
	            			if (value instanceof Array) dades=dades[key];
	            	}
            	}
            	
            	var splitlat;
            	if (lat.indexOf(".")>-1){
            		splitlat = lat.split(".");
            	}
            	var splitlon;
            	if (lon.indexOf(".")>-1){
            		splitlon = lon.split(".");
            	}
                var filteredData = dades.filter(function (item) {
                	if (splitlat!=undefined && splitlon!=undefined){
                		return !!item[splitlat[0]][splitlat[1]] &&  !!item[splitlon[0]][splitlon[1]] ;
                	}
                	else{
                		return !!item[lat] && !!item[lon];
                	}
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
	                	if (value instanceof Array){
                   		 	value=convArrToObj(value);
                   		}
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
	                            "coordinates": [ parseFloat(localitzacioSplit[1]),  parseFloat(localitzacioSplit[0])]
	                        },
	                        "properties": value
	                    });
	                });
                }
                else {
                	 $.each(filteredData, function (index, value, array) {
                     	Object.keys(value).forEach(function(k) {
                     		if (keys.indexOf(k) == -1) keys.push(k.toString());
                     	});
                     });
                	 //For each object create a new GeoJSON object
                     $.each(filteredData, function (index, value, array) {
                    	 if (value instanceof Array){
                    		 value=convArrToObj(value);
                    	 }
                    	 $.each(keys, function (index2, value2, array2) {
                     		 if (!value.hasOwnProperty(value2)){
                     			 value[value2]="";
                     		 }
                     	 });
                    	 var latitud,longitud;
                    	 if (splitlat!=undefined && splitlon!=undefined){
                    		 latitud=value[splitlat[0]][splitlat[1]];
                    		 longitud=value[splitlon[0]][splitlon[1]] ;
                     	}
                     	else{
                     		latitud=value[lat];
                     		longitud=value[lon];
                     	}
                     	geoJsonData.push({
                             "type": "Feature",
                             "geometry": {
                                 "type": geometryType,
                                 "coordinates": [ parseFloat(latitud),  parseFloat(longitud)]
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
        
        // Changes XML to JSON
        function urlToXml(url){
        	var xml;
        	getData(url).then(function(results)  {
        		xml=results;
        		var results2= xmlToJson(xml);
        		console.debug(results2);      		
        	});
        }
        function xmlToJson(xml) {
        	var xml;
        	// Create the return object
            var obj = {};

            	if (xml.nodeType == 1) { // element
            		// do attributes
            		if (xml.attributes.length > 0) {
            		obj["@attributes"] = {};
            			for (var j = 0; j < xml.attributes.length; j++) {
            				var attribute = xml.attributes.item(j);
            				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            			}
            		}
            	} else if (xml.nodeType == 3) { // text
            		obj = xml.nodeValue;
            	}

            	// do children
            	if (xml.hasChildNodes()) {
            		for(var i = 0; i < xml.childNodes.length; i++) {
            			var item = xml.childNodes.item(i);
            			var nodeName = item.nodeName;
            			if (typeof(obj[nodeName]) == "undefined") {
            				obj[nodeName] = L.toGeoJSON.xmlToJson(item);
            			} else {
            				if (typeof(obj[nodeName].push) == "undefined") {
            					var old = obj[nodeName];
            					obj[nodeName] = [];
            					obj[nodeName].push(old);
            				}
            				obj[nodeName].push(L.toGeoJSON.xmlToJson(item));
            			}
            		}
            	}
            	return obj;
        	
        }

        //Reveal methods and GeoJSON data
        return {
            getData: getData,
            convert: convert,
            empty: empty,
            geoJsonData: geoJsonData,
            urlToXml: urlToXml,
            xmlToJson: xmlToJson
        };

    }());

});