/**
 * Funcions i utilitats vàries
 */

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};

function isValidURL(url) {
	var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return pattern.test(url);
}

function isImgURL(str) {
	  var pattern = new RegExp('(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*\.(?:jpe?g|gif|png))','i'); // extension
	  return pattern.test(str);
}

function isBusinessId(str){
	var pattern = new RegExp('^[0-9a-f]{32}$');
	return pattern.test(str);	
}

function isBlank(str) {
    return (!str || (/^\s*$/).test(str));
}

function isDefaultMapTitle(str){
//	var pattern = new RegExp('^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[_](?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$');
	var pattern = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[_](?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/;
	return pattern.test(str);	
}

function getTimeStamp() {
    var now = new Date();
    return (now.getFullYear()+'/'+(((now.getMonth() + 1) < 10)
                    ? ("0" + (now.getMonth() + 1))
                    : ((now.getMonth() + 1))) + '/'+ 
            now.getDate() +'_'+
            ((now.getHours() < 10)
                    ? ("0" + now.getHours())
                    : (now.getHours())) +':'+
             ((now.getMinutes() < 10)
                 ? ("0" + now.getMinutes())
                 : (now.getMinutes())) +':'+
             ((now.getSeconds() < 10)
                 ? ("0" + now.getSeconds())
                 : (now.getSeconds())));
}

function calculateDistance(lLatLngs){
	var totalDistance = 0;
	var lastPoint;
	if(lLatLngs.length>0) lastPoint = lLatLngs[0];
	
	jQuery.each(lLatLngs, function( i, point){
		totalDistance += point.distanceTo(lastPoint);
		lastPointt = point;
	});
	return L.GeometryUtil.readableDistance(totalDistance, true);
}

function calculateArea(lLatLngs){
	var totalArea = L.GeometryUtil.geodesicArea(lLatLngs);
	return L.GeometryUtil.readableArea(totalArea, true);
}

function transformTipusGeometry(geometrytype){
	var ftype = geometrytype;
	if (ftype){
		ftype = ftype.toLowerCase();
		if (ftype === t_point){
			ftype = t_marker;
		}else if (ftype === t_linestring){
			ftype = t_polyline;
		}else if (ftype === t_multilinestring){
			ftype = t_polyline;
		}else if (ftype === t_multipolygon){
			ftype = t_polygon;
		}
	}
	return ftype;
}