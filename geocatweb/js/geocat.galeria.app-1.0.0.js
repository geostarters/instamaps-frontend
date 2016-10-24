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
	Cookies.remove('uid');
	Cookies.set('uid', url('?uid'));
	privatGaleria = "1";
	checkUserLogin();
}

$("body").on("change-lang", function(event, lang){
	/*
	$('#galeriaSort>div>input').attr("placeholder", window.lang.translate("Cerca"));
	$('#obtenirUrlPublica').attr("placeholder", window.lang.translate("Cerca"));
	//Canviem textos botons galeria
	$("#btn-editar").attr('title',window.lang.translate('Editar'));
	$("#btn-grup").attr('title',window.lang.translate('Col·laborar'));
	$("#btn-enllacar").attr('title',window.lang.translate('Enllaça'));
	$("#btn-esborrar").attr('title',window.lang.translate('Esborrar'));
	$("#btn-privat").attr('title',window.lang.translate('El mapa només és visible a la teva galeria privada'));
	$("#btn-public").attr('title',window.lang.translate('El mapa és visible a la galeria pública'));
	*/
});

//$('#galeriaSort>input').attr("placeholder", window.lang.translate("Cerca"));

var galeria;
//PRIVATE GALLERY
if ((typeof privatGaleria == "string") && (typeof Cookies.get('uid') !== "undefined")){
	var isGeolocal = isGeolocalUser();
	
	galeria = Galeria({
		tipusApp:1,
		publica: false,
		isGeolocal: isGeolocal,
		uid: Cookies.get('uid')
	});
	
	galeria.loadGaleria();	
	
	if(aplicacionsGaleria){
		$('#typesTabs a:last').tab('show');
	}
	
	window.addEventListener("message", galeria.onMessage, true);
}else{ 
//PUBLIC GALLERY
	var isGeolocal = isGeolocalUser();
	
	var options = {
		tipusApp:1,
		publica: true,
		isGeolocal: isGeolocal
	};
	
	if(url('file') === "galeria_geolocal.html"){
		options.tipusApp = 2;
	}
	
	galeria = Galeria(options);
	
	galeria.drawGaleria();
	
	//cargar el número de mapas
	galeria.getNumMaps().then(function(results){
		if (results.status == "OK"){
			$('.sp_total_maps').html(results.results);
		}else{
			$('.total_maps').hide();
		}
	});
}
//window.lang.run();