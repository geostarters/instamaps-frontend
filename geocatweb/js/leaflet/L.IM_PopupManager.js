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
			maxVisibleTabs: 3,
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

					lis.push(self.createTabTitle(title, i, tabWidth, (i<options.maxVisibleTabs)));
					contents.push(self.createTabContent(content, i));

				}

			}

			var html = '<div id="popup-' + options.id + '" class="' + options.class + '">' + 
				'<ul class="nav nav-tabs pagination">';

			if(hasHiddenTabs)
			{

				html += '<li id="popup-' + options.id + '-prev" class="disabled" data-tabOffset=0>' +
					'<a href="#" aria-label="Previous">' + 
					'<span aria-hidden="true">&laquo;</span></a></li>';
			}

			html += lis.join('');

			if(hasHiddenTabs)
			{

				html += '<li id="popup-' + options.id + '-next">' +
					'<a href="#" aria-label="Next">' +
					'<span aria-hidden="true">&raquo;</span></a></li>';

			}

			html += '</ul><div class="tab-content">' + contents.join('') + '</div></div>';

			self.options.html = html;

		},

		createTabTitle: function(name, index, tabWidth, isVisible)
		{

			var self = this;
			var options = self.options;
			var isActive = (0 == index);

			return '<li id="popup-' + options.id + '-tab-' + index + '" class="' + 
				(isActive ? ' active' : '') + '" style="' + 
				(isVisible ? '' : 'display:none') + '"><a href="#popup-' + 
				options.id + '-content-' + index + '" data-toggle="tab" class="popupTitleTab" style="' + 
				'width: ' + tabWidth + 'px">' +
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

			if(0 == offset)
			{

				$btn.addClass('disabled');

			}
			else
			{

				$btn.removeClass('disabled');

			}

			self.updateVisibleTabTitles();

		},

		nextTab: function(e)
		{

			var self = this;
			var $btnPrev = $('#popup-' + self.options.id + '-prev');
			var $btn = $('#popup-' + self.options.id + '-next');
			var offset = Number.parseInt($btnPrev.data('taboffset')) + 1;
			$btnPrev.data('taboffset', offset);

			if((offset + self.numVisibleTabs) >= self.numTabs )
			{

				$btn.addClass('disabled');

			}
			else
			{

				$btn.removeClass('disabled');

			}

			self.updateVisibleTabTitles();

		},

		updateVisibleTabTitles: function()
		{

			var self = this;

			var $tabs = $('[id^=popup-' + self.options.id + '-tab-');
			var $btnPrev = $('#popup-' + self.options.id + '-prev');
			var offset = Number.parseInt($btnPrev.data('taboffset'));
			var maxVisible = offset + self.options.maxVisibleTabs;

			for(var i=0, len=self.numTabs; i<len; ++i)
			{

				var current = $($tabs[i]);
				var display = (i < offset || i > maxVisible) ? 'none' : 'block';
				current.css('display', display);

			}

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