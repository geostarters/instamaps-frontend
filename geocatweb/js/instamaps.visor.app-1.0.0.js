/**
 * require geocat.web-1.0.0
 * require url https://github.com/websanova/js-url
 * require geocat.google-analytics.js
 * requier geocat.utils
 */
var visorOptions = {
	uid: url('?uid') || null,
	urlwms: url('?urlwms') || null,
	layername: url('?layername') || null,
	type: url('?type') || null,
	url: url('?url') || null,
	q: url('?q') || null,
	businessid: url('?businessid') || null,
	mapacolaboratiu: url('?mapacolaboratiu') || null,
	embed: url('?embed') || null,
	llegenda: url('?llegenda') || null,
	mouseposition: url('?mouseposition') || null,
	layerscontrol: url('?layerscontrol') || null,
	printcontrol: url('?printcontrol') || null,
	minimapcontrol: url('?minimapcontrol') || null,
	snapshotcontrol: url('?snapshotcontrol') || null,
	geopdfcontrol: url('?geopdfcontrol') || null,
	widgetscontrol: url('?widgetscontrol') || null,
	fonscontrol: url('?fonscontrol') || null,
	sharecontrol: url('?sharecontrol') || null,
	searchcontrol: url('?searchcontrol') || null,
	routingcontrol: url('?routingcontrol') || null,
	openinstamaps: url('?openinstamaps') || null,
	scalecontrol: url('?scalecontrol') || null,
	control3d: url('?control3d') || null,
	view3d: url('?3d') || null,
	homecontrol: url('?homecontrol') || null,
	locationcontrol: url('?locationcontrol') || null,
	zoomcontrol: url('?zoomcontrol') || null,
	staticmap: url('?staticmap') || null,
	navbar: url('?navbar') || null,
	rtoolbar: url('?rtoolbar') || null,
	ltoolbar: url('?ltoolbar') || null
};

jQuery(document).ready(function() {
	//TODO ver si esto es mejor ponerlo cuando ya esté cargado todo el visor para cojer bien el titulo, etc.
	//$.publish('trackPageview', null);
	
	var tipus_user = defineTipusUser();  //geocat.web-1.0.0
	
	visorOptions.tipusUser = tipus_user;
	
	var visor = Visor(visorOptions).draw();

}); // Final document ready