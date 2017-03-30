//Requires leafletPip
;(function(global, $)
{

	var PopupManager = function(options){
		return new PopupManager.init(options);
	}

	PopupManager.prototype = {

		options: {
			addSublayers: false,
			hideExtraTabs: true,
			maxVisibleTabs: 1,
			id: 'mng',
			class: 'popup',
			html: ''
		},

		numTabs: 0,

		createPopupContents: function(matches)
		{

			var self = this;
			var options = self.options;

			var lis = [];
			var contents = [];
			var numVisibleTabs = matches.length;
			self.numTabs = matches.length;
			var hasHiddenTabs = numVisibleTabs > options.maxVisibleTabs && options.hideExtraTabs;
			numVisibleTabs = hasHiddenTabs ? options.maxVisibleTabs : numVisibleTabs;
			var popupWidth = 220;
			var tabWidth = popupWidth/numVisibleTabs;

			for(var i=0, len=matches.length; i<len; ++i)
			{

				var match = matches[i];
				var title = '';
				var content = '';
				if(match.isWMS)
				{

					title = match.name;
					if(match.isQueryable)
						content = match.content;

				}
				else
				{

					title = match.properties.capaNom;
					content = match.properties.popupData;

				}

				if('' != content)
				{
					if (self.numTabs>1){
						lis.push(self.createTabTitle(title, i, tabWidth, (i<options.maxVisibleTabs)));
					}
					contents.push(self.createTabContent(content, i));
					
					
				}

			}

			if (self.numTabs>1){
				var html = '<div id="popup-' + options.id + '" class="' + options.class + '">' + 
					'<ul class="nav nav-tabs pagination nomargin">';
	
				if(hasHiddenTabs)
				{
				
	
					html += '<li id="popup-' + options.id + '-prev" data-tabOffset=0 class="margin1">' +
						'<a href="#" aria-label="Previous">' + 
						'<span aria-hidden="true">&laquo;</span></a></li>';
				}
	
				html += lis.join('');
	
				if(hasHiddenTabs)
				{
	
					html += '<li id="popup-' + options.id + '-next" class="margin1">' +
						'<a href="#" aria-label="Next">' +
						'<span aria-hidden="true">&raquo;</span></a></li>';
	
				}
	
				html += '</ul><div class="tab-content">' + contents.join('') + '</div></div>';
			}
			else {
				var html = '<div id="popup-' + options.id + '" class="' + options.class + '">' ;
				html += '<div class="tab-content">' + contents.join('') + '</div></div>';
			}
			self.options.html = html;

		},

		createTabTitle: function(name, index, tabWidth, isVisible)
		{

			var self = this;
			var options = self.options;
			var isActive = (0 == index);
			
			
			return '<li id="popup-' + options.id + '-tab-' + index + '" class="' + 
				(isActive ? ' active margin1' : 'margin1') + ' " style="' + 
				(isVisible ? '' : 'display:none') + '"><a href="#popup-' + 
				options.id + '-content-' + index + '" data-toggle="tab" class="popupTitleTab" style="' + 
				'width: ' + tabWidth + 'px" >' +
				name + '</a></li>'
				
			

		},

		createTabContent: function(data, index)
		{

			var self = this;
			var options = self.options;
			var isActive = (0 == index);

			return '<div class="tab-pane' + (isActive ? ' active' : '') + '" id="popup-' + 
				options.id + '-content-' + index + '">' + data + '</div>';

		},

		createMergedDataPopup: function(feat, event, control) 
		{
		

			var self = this;
			var visibleLayers = control.getVisibleLayers(self.options.addSublayers);

			$('#popup-' + self.options.id + ' .nav-tabs').empty();
			$('#popup-' + self.options.id + ' .tab-content').empty();

			var matches = [];
			var asyncs = [];
			for(var i=0, len=visibleLayers.length; i<len; ++i)
			{

				var currentLayer = visibleLayers[i];

				if(currentLayer.layer.options &&
					currentLayer.layer.options.tipus && 
					t_wms == currentLayer.layer.options.tipus)
				{

					var tileWMS = L.tileLayer.betterWms(currentLayer.layer._url, 
						currentLayer.layer.wmsParams);
					tileWMS.options.queryable = currentLayer.layer.options.queryable;
					tileWMS._map = map;
					var asyncr = tileWMS.getPopupContent(event).then(function(content) {

						matches.push({isWMS: true, 
							name: currentLayer.layer.options.nom, 
							content: content,
							isQueryable: currentLayer.layer.options.queryable
						});

					});
					asyncs.push(asyncr);

				}
				else
				{
					var match = leafletPip.pointInLayer(event.latlng, currentLayer.layer, false);
					for(var j=0, lenJ=match.length; j<lenJ; ++j)
					{
						matches.push(match[j]);

					}

				}

			}
			
		

			$.when.apply(asyncs).done(function() {

				self.createPopupContents(matches);
				if(0 != matches.length)
				{
					var popup = L.popup().setLatLng(event.latlng)
						.setContent(self.options.html).openOn(map);

					self.updateVisibleTabTitles();
					$('#popup-' + self.options.id + '-prev').on('click', function(e) {
						self.previousTab(e);
					});
					$('#popup-' + self.options.id + '-next').on('click', function(e) {
						self.nextTab(e);
					});

				}

			});
		
		},

		previousTab: function(e)
		{

			var self = this;
			var $btn = $('#popup-' + self.options.id + '-prev');
			var offset = Number.parseInt($btn.data('taboffset')) - 1;
			$btn.data('taboffset', offset);

			var displayPrev = (0 == offset || -1 == offset) ? 'none' : 'block';
			$('#popup-mng-prev').css('display', displayPrev);

			self.updateVisibleTabTitles();

		},

		nextTab: function(e)
		{

			var self = this;
			var $btnPrev = $('#popup-' + self.options.id + '-prev');
			var $btn = $('#popup-' + self.options.id + '-next');
			var offset = Number.parseInt($btnPrev.data('taboffset')) + 1;
			$btnPrev.data('taboffset', offset);

			var displayNext = ((offset + self.numVisibleTabs) >= self.numTabs) ? 'none' : 'block';
			$('#popup-mng-next').css('display', displayNext);
			
			self.updateVisibleTabTitles();

		},

		updateVisibleTabTitles: function()
		{

			var self = this;

			var $tabs = $('[id^=popup-' + self.options.id + '-tab-');
			var $btnPrev = $('#popup-' + self.options.id + '-prev');
			var offset = Number.parseInt($btnPrev.data('taboffset'));
			var maxVisible = offset + self.options.maxVisibleTabs;
			var currentTabId = 0;
			
			for(var i=0, len=self.numTabs; i<len; ++i)
			{

				var current = $($tabs[i]);
				var display = (i <= offset || i > maxVisible) ? 'none' : 'block';
				current.css('display', display);
				if ('block' == display) {
					$('a[href^="#popup-mng-content-'+i).click();
					currentTabId=i;
				}
			}
			
			
			var displayNext = (currentTabId==self.numTabs-1) ? 'none' : 'block';
			$('#popup-mng-next').css('display', displayNext);
			
			var displayPrev = (currentTabId==0) ? 'none' : 'block';
			$('#popup-mng-prev').css('display', displayPrev);
			

		},
		lineify: function(inputGeom) {
			var self = this;
		    var outputLines = {
		        "type": "GeometryCollection",
		            "geometries": []
		    }
		    switch (inputGeom.type) {
		        case "GeometryCollection":
		            for (var i in inputGeom.geometries) {
		                var geomLines = self.lineify(inputGeom.geometries[i]);
		                if (geomLines) {
		                    for (var j in geomLines.geometries) {
		                        outputLines.geometries.push(geomLines.geometries[j]);
		                    }
		                } else {
		                    outputLines = false;
		                }
		            }
		            break;
		        case "Feature":
		            var geomLines = self.lineify(inputGeom.geometry);
		            if (geomLines) {
		                for (var j in geomLines.geometries) {
		                    outputLines.geometries.push(geomLines.geometries[j]);
		                }
		            } else {
		                outputLines = false;
		            }
		            break;
		        case "FeatureCollection":
		            for (var i in inputGeom.features) {
		                var geomLines = self.lineify(inputGeom.features[i].geometry);
		                if (geomLines) {
		                    for (var j in geomLines.geometries) {
		                        outputLines.geometries.push(geomLines.geometries[j]);
		                    }
		                } else {
		                    outputLines = false;
		                }
		            }
		            break;
		        case "LineString":
		            outputLines.geometries.push(inputGeom);
		            break;
		        case "MultiLineString":
		        case "Polygon":
		            for (var i in inputGeom.coordinates) {
		                outputLines.geometries.push({
		                    "type": "LineString",
		                        "coordinates": inputGeom.coordinates[i]
		                });
		            }
		            break;
		        case "MultiPolygon":
		            for (var i in inputGeom.coordinates) {
		                for (var j in inputGeom.coordinates[i]) {
		                    outputLines.geometries.push({
		                        "type": "LineString",
		                            "coordinates": inputGeom.coordinates[i][j]
		                    });
		                }
		            }
		            break;
		        default:
		            outputLines = false;
		    }
		    return outputLines;
		},
		crossCheck: function(baseLayer, drawLayer) {
			var self=this;
		    var baseJson = baseLayer.toGeoJSON(),
		        drawJson = drawLayer.toGeoJSON(),
		        baseLines = self.lineify(baseJson),
		        drawLines = self.lineify(drawJson),
		        crossPoints = {
		            type: "GeometryCollection",
		            geometries: []
		        };
		    if (baseLines && drawLines) {
		        for (var i in drawLines.geometries) {
		            for (var j in baseLines.geometries) {
		                var crossTest = self.lineStringsIntersect(drawLines.geometries[i], baseLines.geometries[j]);
		                if (crossTest) {
		                    for (var k in crossTest) {
		                        crossPoints.geometries.push(crossTest[k]);
		                    }
		                }
		            }
		        }
		    }
		    if (crossPoints.geometries.length>0) return true;
		    else return false;
		},
		lineStringsIntersect: function(l1, l2) {
		    var intersects = [];
		    for (var i = 0; i <= l1.coordinates.length - 2; ++i) {
		        for (var j = 0; j <= l2.coordinates.length - 2; ++j) {
		            var a1Latlon = L.latLng(l1.coordinates[i][1], l1.coordinates[i][0]),
		                a2Latlon = L.latLng(l1.coordinates[i + 1][1], l1.coordinates[i + 1][0]),
		                b1Latlon = L.latLng(l2.coordinates[j][1], l2.coordinates[j][0]),
		                b2Latlon = L.latLng(l2.coordinates[j + 1][1], l2.coordinates[j + 1][0]),
		                a1 = L.Projection.SphericalMercator.project(a1Latlon),
		                a2 = L.Projection.SphericalMercator.project(a2Latlon),
		                b1 = L.Projection.SphericalMercator.project(b1Latlon),
		                b2 = L.Projection.SphericalMercator.project(b2Latlon),
		                ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
		                ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
		                u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
		            if (u_b != 0) {
		                var ua = ua_t / u_b,
		                    ub = ub_t / u_b;
		                if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
		                    var pt_x = a1.x + ua * (a2.x - a1.x),
		                        pt_y = a1.y + ua * (a2.y - a1.y),
		                        pt_xy = {
		                            "x": pt_x,
		                                "y": pt_y
		                        },
		                        pt_latlon = L.Projection.SphericalMercator.unproject(pt_xy);
		                    intersects.push({
		                        'type': 'Point',
		                            'coordinates': [pt_latlon.lng, pt_latlon.lat]
		                    });
		                }
		            }
		        }
		    }
		    if (intersects.length == 0) intersects = false;
		    return intersects;
		}
	
	};

	PopupManager.init = function(inOptions)
	{

		var self = this;
		self = $.extend(self, self.options, inOptions);

	}

	PopupManager.init.prototype = PopupManager.prototype;

	global.PopupManager = PopupManager;

}(window, jQuery));