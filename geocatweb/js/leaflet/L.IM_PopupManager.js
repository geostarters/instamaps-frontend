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

			matches.sort(function(a, b) {
				if(a.isWMS && b.isWMS)
					return 0;
				else if(!a.isWMS)
					return -1;
				else if(!b.isWMS)
					return 1;
				else 
					return 0;
			});

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
					if (1 < self.numTabs){
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
			var deferred = $.Deferred();
			var visibleLayers = control.getVisibleLayers(self.options.addSublayers);

			if(event.originalEvent) {
				
				event.originalEvent.stopImmediatePropagation();
				event.originalEvent.preventDefault();

			}

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

				deferred.resolve();

			});

			return deferred.promise();
		
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
				var display = (i < offset || i >= maxVisible) ? 'none' : 'block';
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