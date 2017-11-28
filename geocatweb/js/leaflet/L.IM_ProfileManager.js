;(function(global, $)
{

	var ProfileManager = function(options){
		return new ProfileManager.init(options);
	}

	ProfileManager.prototype = {

        options: {

        },

        elevationControl: null,
		
		addEvents: function() {

            var self = this;
            $("body").on("showProfile", function(event, layerId) {
                self.refreshProfile(event, layerId);
            });
            
        },
        
        refreshProfile: function(event, layerId) {

            var self = this;
            
            if(self.elevationControl !== null) {
                
                //Refresquem el perfil amb les dades de la línia
                self.elevationControl.clear();
                $("#profileText").show();
                $("#preloader6").show();

            } else  {
            
                self.elevationControl = L.control.elevation({useHeightIndicator: false}).addTo(map);
                $(".elevation.leaflet-control").append('<button id="profileClose" type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>');
                $(".elevation.leaflet-control").append('<div id="profileText" class="profileText" lang="ca">Calculant perfil<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>');
                $(".elevation.leaflet-control").append('<div id="preloader6"><span></span><span></span><span></span><span></span></div>');
                $(".elevation.leaflet-control svg").hide();
                $("#profileClose").on('click', function(e){ 
                    map.removeControl(self.elevationControl);
                    self.elevationControl = null;
                });
            }

            self.fetchData(layerId);

        },
        
        fetchData: function(layerId) {

            var self = this;
            var data = map._layers[layerId]._latlngs;
            if(data) {

                var ls = DataConverter.LatLngArrayToLineString(data);
                HeightService.fetch(ls).done(function(d,t,j) {
                    self.fetchOK(d,t,j); 
                }).fail(function(j,t,e) {
                    self.fetchKO(j,t,e);
                });

            }

        },

        fetchOK: function(data, textStatus, jqXHR) {
            this.elevationControl.addData(data.features[0]);

            $("#profileText").hide();
            $("#preloader6").hide();
            $(".elevation.leaflet-control svg").show();
        },

        fetchKO: function(jqXHR, textStatus, errorThrown) {
            console.log("Error while loading track profile: " + textStatus);
        },

	};

	ProfileManager.init = function(inOptions)
	{

		var self = this;
        self = $.extend(self, self.options, inOptions);
        self.addEvents();

	}

	ProfileManager.init.prototype = ProfileManager.prototype;

	global.ProfileManager = ProfileManager();

}(window, jQuery));
