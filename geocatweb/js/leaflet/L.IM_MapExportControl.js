/**
 * 
 */
L.Control.MapExport = L.Control
		.extend({
			options : {
				position : 'topright',
				id : 'dv_bt_mapExport',
				className : 'leaflet-bar btn btn-default btn-sm bt_exportfile grisfort',
				title : 'Exportar i imprimir mapa',
				langTitle : 'Exportar i imprimir mapa',
				html : '<span class="glyphicon glyphicon-paste"></span>',
				tooltip : 'bottom'
			},

			onAdd : function(map) {
				var self = this, options = self.options, stop = L.DomEvent.stopPropagation, container = L.DomUtil
						.create('div', options.className);

				container.id = options.id;
				container.innerHTML = options.html;
				container.title = options.title;

				container.dataset.toggle = 'tooltip';
				container.dataset.placement = window.lang.translate(options.tooltip);
				container.dataset.langTitle = window.lang.translate(options.langTitle);

				self._div = container;
				self._map=map;

				var _scope = 'visor';
				var tipus_user = "";
				getModeMapa() ? _scope = 'mapa' : _scope = 'visor';

				if (_scope == 'mapa') {
					tipus_user = defineTipusUser();
				}else{
					tipus_user ="button#";
				}	

				this._div_H_Export = L.DomUtil.create('div',
						'div_barraexport div_gr40');

				var btcamera = jQuery(
						"<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_captura\" title=\"Capturar la vista del mapa\" data-lang-title=\"Capturar la vista del mapa\"><span class='glyphicon glyphicon-camera grisfort'></span></div>")
						.on(
								'click',
								function(event) {
									aturaClick(event);
									$.publish('analyticsEvent',{event:[ _scope,
											tipus_user + 'captura pantalla',
											'label captura', 1]});
									capturaPantalla(CAPTURA_MAPA);
									self.hide()
								});

				this._div_H_Export.appendChild(btcamera[0]);

				var btprint = jQuery(
						"<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_print\" title=\"Imprimir la vista del mapa\" data-lang-title=\"Imprimir la vista del mapa\"><span class='glyphicon glyphicon-print grisfort'></span></div>")
						.on(
								'click',
								function(event) {

									aturaClick(event);
									$.publish('analyticsEvent',{event:[ _scope,
											tipus_user + 'print',
											'label print', 1]});
									capturaPantalla(CAPTURA_INFORME);
									self.hide();
								});
				this._div_H_Export.appendChild(btprint[0]);

				var btgeopdf = jQuery(
						"<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_geopdf\" title=\"Descarrega mapa en format GeoPDF\" data-lang-title=\"Descarrega mapa en format GeoPDF\"><span class='fa fa-file-pdf-o geopdf'></span></div>")
						.on(
								'click',
								function(event) {

									aturaClick(event);
									$.publish('analyticsEvent',{event:[ _scope,
											tipus_user + 'geopdf',
											'label geopdf', 1]});
									capturaPantalla(CAPTURA_GEOPDF);
									self.hide();
								});
				this._div_H_Export.appendChild(btgeopdf[0]);

				var btgeotiff = jQuery(
						"<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_geotiff\" title=\"Descarrega mapa en format GeoTiff\" data-lang-title=\"Descarrega mapa en format GeoTiff\"><span class='fa fa-file-image-o grisfort'></span></div>")
						.on(
								'click',
								function(event) {
									aturaClick(event);

									$.publish('analyticsEvent',{event:[ _scope,
											tipus_user + 'geotiff',
											'label geotiff', 1]});

									capturaPantalla(CAPTURA_MAPA_GEOTIFF);
									self.hide();

								});
				this._div_H_Export.appendChild(btgeotiff[0]);

				var btgeopkg = jQuery(
						"<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_geopkg\" title=\"Descarrega vectors en format GeoPackage\" data-lang-title=\"Descarrega vectors en format GeoPackage\"><span class='fa fa-database grisfort'></span></div>")
						.on('click',
								function(event) {
									
									aturaClick(event);
									$.publish('analyticsEvent',{event:[ _scope,
											tipus_user + 'geopkg',
											'label geopkg', 1]});
									
									
									capturaPantalla(CAPTURA_MAPA_GEOPACKAGE);
									self.hide()
								});

				this._div_H_Export.appendChild(btgeopkg[0]);

				jQuery('body').append(this._div_H_Export);

				L.DomEvent.on(container, 'click', stop).on(container,
						'mousedown', stop).on(container, 'dblclick', stop).on(
						container, 'click', L.DomEvent.preventDefault).on(
						container, 'click', self._toggle, self);

				return container;
			},

			hideBtn : function() {
				var self = this;
				$(self._div).hide();
			},

			showBtn : function() {
				var self = this;
				$(self._div).show();
			},

			hide : function() {
				L.DomUtil.removeClass(this._div, 'greenfort');
				L.DomUtil.addClass(this._div, 'grisfort');
				$('.div_barraexport').hide();
			},

			show : function(e) {
				var _map = this._map;
				L.DomUtil.removeClass(this._div, 'grisfort');
				L.DomUtil.addClass(this._div, 'greenfort');
				var leftO = ($(this._div_H_Export).width() + parseInt(10));
				var offset = $(this._div).offset();
				$('.div_barraexport').css('top', (offset.top - 10) + 'px');
				$('.div_barraexport').css('left', (offset.left - leftO) + 'px');
				$('.div_barraexport').show();				
				jQuery('.leaflet-control-layers').hide();
				
				var _scope = 'visor';
				var tipus_user = "";
				getModeMapa() ? _scope = 'mapa' : _scope = 'visor';
				
				$.publish('analyticsEvent',{event:[ _scope,
					tipus_user + 'exportmapa', 'label exportmap', 1]});		
			},

			_toggle : function(e) {
				var collapsed = L.DomUtil.hasClass(this._div, 'grisfort');
				this[collapsed ? 'show' : 'hide']();
			},

		});

L.control.mapExport = function(options) {
	return new L.Control.MapExport(options);
};