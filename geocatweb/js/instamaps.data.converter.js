;(function(global, $)
{

    global.DataConverter = {

        LatLngArrayToLineString: function(data) {

            var coords = [];
            for(var i=0, len=data.length; i<len; ++i) {

                var latlng = data[i];
                coords.push([latlng.lng, latlng.lat]);

            }

            return { "type": "FeatureCollection",
                "features": [
                    { 
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": coords
                        },
                        "properties": { }
                    },
                ]
            };

        }

    };

}(window, jQuery));
