(function () {
	var method;
	var noop = function () {};
	var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
	var length = methods.length;
	var console = (window.console = window.console || {});
	while (length--) {
		method = methods[length];
		if (!console[method]) {
			console[method] = noop;
		}
	}
}
	());
    
    var factorW=9; var factorH=115;   
   function initDIVs(){ 
$('#mapa').height($(window).height() - factorH);
$('#mapa').width($(window).width() - ($('#legend').width() + factorW));
$('#legend').height($(window).height() - factorH);

$("#legend").resizable({});
$("#legend ").bind("resize", function (event, ui) {
	var setWidth = $("#legend").width() ;
	$('#mapa').width($(window).width() - setWidth);
});

}


$(window).resize(function () {

	$('#mapa').height($(window).height()- factorH );
	$('#mapa').width($(window).width() - ($('#legend').width() + factorW));
	$('#legend').height($(window).height() - factorH);

    
    });
$(window).trigger('resize');
