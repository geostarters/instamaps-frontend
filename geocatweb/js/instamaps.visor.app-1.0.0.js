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
	likecontrol: url('?likecontrol') || null,
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
	ltoolbar: url('?ltoolbar') || null,
	appmodul: url('?appmodul') || null,
	lat : url("?lat") || null,
	lon : url("?lon") || null,
	zoom : url("?zoom") || null,
	text: url("?text") || null,
	link: url("?link") || null,
	appname: url("?appname") || null,
	fons: url("?fons") || null,
	INE10: url("?INE10") || null, 
	random: url("?random") || null
};

var visor; 

jQuery(document).ready(function() {
	//TODO ver si esto es mejor ponerlo cuando ya esté cargado todo el visor para cojer bien el titulo, etc.
	//$.publish('trackPageview', null);
	
	var tipus_user = defineTipusUser();  //geocat.web-1.0.0
	
	visorOptions.tipusUser = tipus_user;
	
	if (visorOptions.businessid==null){
		var loc=window.location;
		var locStr=loc+"";
		locStr=locStr.substring(locStr.lastIndexOf("/")+1,locStr.indexOf(".html"));
		locStr=locStr.substring(0,locStr.indexOf("_"));
		visorOptions.businessid=locStr;
	}
	visor = Visor(visorOptions).draw();
	
}); // Final document ready

