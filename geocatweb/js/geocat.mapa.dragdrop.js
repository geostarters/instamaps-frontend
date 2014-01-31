var drgMapa;
var drgBoto;
function creaAreesDragDropFiles() {
	// dropzone
	var drOpcionsMapa = {
		url : paramUrl.uploadproxy,
		paramName : "file", // The name that will be used to transfer the file
		maxFilesize : 10, // MB
		method:'post',
		clickable:false,
		accept : function(file, done) {
			if (file.name == "newsssss.kml") {
				done("Naha, you don't.");
			} else {
				done();
			}
		}
	};
	
	var opcionsBoto=drOpcionsMapa;//opcionsBoto.clickable=true;
	drgBoto = new window.Dropzone("div#map", drOpcionsMapa);
	
	drgBoto.on('success', function(file,resposta) {
		readAndUploadFile(file,resposta);
	});
	
	drgBoto.on('progress', function(file,progress) {
		//console.info(progress);
	});
}

jQuery('#bt_upload_fitxer').on("click", function(e) {
	var srid=jQuery("#srid").val();
	var colX=jQuery("#colX").val();
	var colY=jQuery("#colY").val();
	var path=jQuery('#file_path').val();
	var bid=jQuery('#bid').val();
	var isOK=true;
	if (colX.value=="" || colY.value=="") {
		isOK=false;
		alert("Cal indicar els camps de les coordeandes X,Y");
	}
	if (path=="") {
		isOK=false;
		alert("Cal pujar un fitxer");
	}
	
	if (isOK){
		var data = {uid:$.cookie('uid'),
				path:path, 
				colX: colX, 
				colY: colY,
				srid: srid,
				bid: bid};
		doUploadFile(data).then(function(results2){
			if (results2.status=="OK") {
				var businessId=results2.results.businessId;
				//Un cop carregat el fitxer refresquem el popup de les dades de l'usuari i tambè
				//el control de capes			
				carregarCapa(businessId);
				refrescaPopOverMevasDades();
				jQuery('#dialog_carrega_dadesfields').modal('hide');
			}
		});
		//readAndUploadFile(file, resposta);
	}
	else return false;
});

jQuery('#bt_upload_cancel').on("click", function(e) {
	$('#dialog_carrega_dades').modal('hide');
});

jQuery('#div_carrega_dades').on("click", function(e) {
	$('#dialog_carrega_dades').modal('show');

	$('#url').val(paramUrl.dragFile);
	
	var drOpcionsMapa = {
			url : paramUrl.uploadproxy,
			paramName : "file", // The name that will be used to transfer the file
			maxFilesize : 10, // MB
			method:'post',
			//clickable:false,
			accept : function(file, done) {
				done();				
			}
		};
	
	var opcionsBoto=drOpcionsMapa;
	opcionsBoto.clickable=true;
	
	var drgFile = new window.Dropzone("input#upload_file", opcionsBoto);
	
	drgFile.on('success', function(file,resposta) {
		$('#dialog_carrega_dades').modal('hide');
		readAndUploadFile(file, resposta);
	});
	
	drgFile.on('progress', function(file,progress) {
		//console.debug(file);
		//console.info(progress);
	});
});

function readAndUploadFile(file, resposta){
	if (resposta.indexOf("Error:") != -1){
		resposta = "E:/usuaris/w.szczerban/temp/"+file.name;
	}
	var path = resposta;
	
	var data = {uid:$.cookie('uid'),path:path};
	
	doReadFile(data).then(function(results){
		if (results.status=="OK"){
			if (jQuery.isEmptyObject(results.results)){
				//var data = {uid:$.cookie('uid'),path:path,colX: "X",colY: "Y", srid:"4326"};
				var data = {uid:$.cookie('uid'),path:path};
				doUploadFile(data).then(function(results2){
					if (results2.status=="OK") {
						var businessId=results2.results.businessId;
						//Un cop carregat el fitxer refresquem el popup de les dades de l'usuari i tambè
						//el control de capes			
						carregarCapa(businessId);
						refrescaPopOverMevasDades();
					}
				});
			}else{
				var dadesfields = results.results;
				jQuery('#dialog_carrega_dadesfields').modal('show');
				
				jQuery('#file_path').val(dadesfields.path);
				jQuery('#isCoordinates').val(dadesfields.isCoordinates);
				
				var data = [];
				jQuery.each( dadesfields, function( key, value ) {
					if (key != "path" && key != "isCoordinates"){
						data.push(key);
						if (value !== ""){
							var id = '#'+value;
							jQuery(id).val(key);
						}
					}
				});
				jQuery(".typeahead").typeahead({ source:data });
					
				if (dadesfields.isCoordinates){
					//TODO ocultar los campos que no se usan 
				}else{
					//TODO formulario de seleccionar la capa de geometrias
					console.debug("archivo sin geometrias");
				}
			}
		}
	});
}