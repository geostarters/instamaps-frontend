
var map;
var factorH = 50;

jQuery(document).ready(function () {

	map = new L.IM_Map('map', {
			typeMap : 'topoMap',
			maxZoom : 19
		}).setView([41.431, 1.8580], 8);
	var sidebar = L.control.sidebar('sidebar', {
			position : 'left',
			closeButton : false
		});

	map.addControl(sidebar);
	setTimeout(function () {
		sidebar.show();
	}, 500);

	factorH = jQuery('.navbar').css('height').replace(/[^-\d\.]/g, '');

	jQuery('#map').height(jQuery(window).height() - factorH);

});
