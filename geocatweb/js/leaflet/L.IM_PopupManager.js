//Requires leafletPip
;(function(global, $)
{

	var PopupManager = function(options){
		return new PopupManager.init(options);
	}

	PopupManager.prototype = {

		options: {
			addSublayers: false,
			id: 'mng',
			class: 'popup',
			html: ''
		},

		createPopupContents: function(matches)
		{

			var self = this;
			var options = self.options;

			var lis = [];
			var contents = [];
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

				lis.push(self.createTabTitle(title, i));
				contents.push(self.createTabContent(content, i));

			}

			var num = $('[id^=popup-' + options.id + '-').length;
			var html = '<div id="popup-' + options.id + '-' + num +'" class="' + options.class + '">' + 
				'<ul class="nav nav-tabs">' + lis.join('') + '</ul><div class="tab-content">' + 
				contents.join('') + '</div></div>';


			self.options.html = html;

		},

		createTabTitle: function(name, index)
		{

			var self = this;
			var options = self.options;
			var isActive = (0 == index);

			return '<li class="' + (isActive ? ' active' : '') + '"><a href="#popup-' + 
				options.id + '-' + index + '-content" data-toggle="tab">' +
				name + '</a></li>'

		},

		createTabContent: function(data, index)
		{

			var self = this;
			var options = self.options;
			var isActive = (0 == index);

			return '<div class="tab-pane' + (isActive ? ' active' : '') + '" id="popup-' + 
				options.id + '-' + index + '-content">' + data + '</div>';

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
				var popup = L.popup().setLatLng(event.latlng)
					.setContent(self.options.html).openOn(map);

			});
		
		},
	
	};

	PopupManager.init = function(inOptions)
	{

		var self = this;
		self = $.extend(self, self.options, inOptions);

	}

	PopupManager.init.prototype = PopupManager.prototype;

	global.PopupManager = PopupManager;

}(window, jQuery));