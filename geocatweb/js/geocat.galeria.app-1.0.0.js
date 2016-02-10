/**
 * require geocat.web
 * require Listjs http://www.listjs.com/docs/list-api
 * require url https://github.com/websanova/js-url
 */
var privatGaleria = url('?private');
var aplicacionsGaleria = url('?aplicacions');

//per GA
defineTipusUser(); //mira si el usuario es random (geocat.web)
	
if(typeof url('?uid') == "string"){
	$.removeCookie('uid', { path: '/' });
	$.cookie('uid', url('?uid'), {path:'/'});
	privatGaleria = "1";
	checkUserLogin();
}

var galeria = Galeria({
	tipusApp:1
});

galeria.getNumMaps().then(function(results){
	console.debug(results);
	if (results.status == "OK"){
		$('.sp_total_maps').html(results.results);
	}else{
		$('.total_maps').hide();
	}
});
