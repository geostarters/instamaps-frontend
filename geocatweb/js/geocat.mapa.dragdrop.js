var drgMapa;
var drgBoto;
function creaAreesDragDropFiles() {

	// dropzone

	var drOpcionsMapa = {
		url : paramUrl.dragFile,
		paramName : "file", // The name that will be used to transfer the file
		maxFilesize : 10, // MB
		method:'post',
		clickable:false,
		accept : function(file, done) {
			if (file.name == "newsssss.kml") {

				done("Naha, you don't.");
			} else {
			console.info(file);
			alert("Enviat:"+file.name);
				done();
			}
		}
	};
var opcionsBoto=drOpcionsMapa;opcionsBoto.clickable=true;
	drgMapa = new Dropzone("div#div_carrega_dades", opcionsBoto);
	drgBoto = new Dropzone("div#map", drOpcionsMapa);
	
	
	drgMapa.on('success', function(file,resposta) {
	console.info(resposta);
  });
  drgMapa.on('progress', function(file,progress) {
	console.info(progress);
  });
	
	drgBoto.on('success', function(file,resposta) {
	console.info(resposta);  
  });
  drgMapa.on('progress', function(file,progress) {
	console.info(progress);
  });
	
	

}