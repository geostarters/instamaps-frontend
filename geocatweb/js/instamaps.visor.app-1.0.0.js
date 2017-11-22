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
	random: url("?random") || null,
	//urlFile: url("?url") || null,
	tipusFile: url("?format") || null,
	coordX: url("?coordX") || null,
	coordY: url("?coordY") || null,
	epsg: url("?epsg") || null
};

var visor; 

function doModal(heading, formContent) {
    html =  '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<a class="close" data-dismiss="modal">×</a>';
    html += '<h4>'+heading+'</h4>'
    html += '</div>';
    html += '<div class="modal-body">';
    html += formContent;
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<span class="btn btn-primary" data-dismiss="modal">'+window.lang.translate("Acceptar")+'</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);
    $("#dynamicModal").modal();
    $("#dynamicModal").modal('show');

    $('#dynamicModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
      //alert("Versions diferents!");
		var data={
			businessId: visorOptions.businessid
		};
		replaceVisorFileByBusinessid(data).then(function(results){
			location.reload(true);
		})
    });
   
}

jQuery(document).ready(function() {
	//TODO ver si esto es mejor ponerlo cuando ya esté cargado todo el visor para cojer bien el titulo, etc.
	//$.publish('trackPageview', null);
	
	
	var urlFile = url("query");
	if (urlFile && urlFile.indexOf("&url=")>-1) urlFile = urlFile.substring(urlFile.indexOf("&url=")+5);
	else urlFile=null;
	visorOptions.urlFile = urlFile;
	
	var tipus_user = defineTipusUser();  //geocat.web-1.0.0
	
	visorOptions.tipusUser = tipus_user;
	
	if (visorOptions.businessid==null){
		var busid = url(-2);
		visorOptions.businessid=busid;
	}
	getCurrentVersion().then(function(results){
		if (typeof CURRENT_VERSION === 'undefined' 
		  || typeof CURRENT_VERSION_TEMPLATE === 'undefined' 
		  || (typeof CURRENT_VERSION_TEMPLATE !== 'undefined' && results.current_version!==CURRENT_VERSION_TEMPLATE) 
		  || (typeof CURRENT_VERSION !== 'undefined' && results.current_version!==CURRENT_VERSION)){
			doModal(window.lang.translate("Actualització d'Instamaps"),window.lang.translate("Instamaps ha canviat de versió. Si voleu refrescar el visor seleccioneu Acceptar"));
			
		}
	});
	visor = Visor(visorOptions).draw();
	
	
}); // Final document ready

