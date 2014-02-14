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
	
	$('.btn_codi').on('click',function(e){
		$('#localitzaCoord').hide();
		$('#localitzaCodi').show();
	});
	
	$('.btn_coord').on('click',function(e){
		$('#localitzaCoord').show();
		$('#localitzaCodi').hide();
	});
}

jQuery('#bt_upload_fitxer').on("click", function(e) {
	var srid=jQuery("#srid").val();
	var colX=jQuery("#colX").val();
	var colY=jQuery("#colY").val();
	var path=jQuery('#file_path').val();
	var bid=jQuery('#bid').val();
	var codi=jQuery('#codi').val();
	var codiType=jQuery("#codiType").val();
	var geomType=jQuery("#geomType").val();
	var type="";
	var isOK=true;
	if (jQuery('#localitzaCoord').is(':visible')){
		if (colX.value=="" || colY.value=="") {
			isOK=false;
			alert("Cal indicar els camps de les coordeandes X,Y");
		}
		if (path=="") {
			isOK=false;
			alert("Cal pujar un fitxer");
		}
		if (bid=="") {
			isOK=false;
			alert("Cal indicar els camps de ID");
		}
	}else{
		if (codi.value=="") {
			isOK=false;
			alert("Cal indicar els camps de Codi");
		}
		type = 'municipis';
	}
	if (isOK){
		var data = {uid:$.cookie('uid'),
			path:path, 
			colX: colX, 
			colY: colY,
			srid: srid,
			bid: bid,
			codi: codi,
			type: type,
			codiType: codiType,
			geomType: geomType};
		doUploadFile(data).then(function(results2){
			addDropFileToMap(results2);
		});
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
	console.debug(resposta);
	console.debug(file);
	if (resposta.indexOf("Error:") != -1){
		resposta = "E:/usuaris/w.szczerban/temp/"+file.name;
	}
	var path = resposta;
	
	var data = {uid:$.cookie('uid'),path:path};
	
	doReadFile(data).then(function(results){
		if (results.status=="OK"){
			if (jQuery.isEmptyObject(results.results)){
				console.debug(results.results);
				//var data = {uid:$.cookie('uid'),path:path,colX: "X",colY: "Y", srid:"4326"};
				var data = {uid:$.cookie('uid'),path:path};
				doUploadFile(data).then(function(results2){
					addDropFileToMap(results2);
				});
			}else{
				jQuery('#formFields')[0].reset();
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
					if (value == "codi"){
						dadesfields.codi = key;
					}
				});
				jQuery(".typeahead").typeahead({ source:data });
					
				if (dadesfields.isCoordinates){
					jQuery("#localitzaCodi").hide();
					jQuery("#localitzaCoord").show();
				}else{
					jQuery("#localitzaCodi").show();
					jQuery("#localitzaCoord").hide();
				}
			}
		}
	});
}

function addDropFileToMap(results){
	if (results.status=="OK") {
		//console.debug(results.results);
		var businessId=results.results.businessId;
		
		//crear el servidor WMS i agregarlo al mapa
		var data = {
				uid:$.cookie('uid'),
				businessId: businessId,
				mapBusinessId: url('?businessid'),
				serverName: results.results.nom,
				serverType: 'tematic',
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            epsg: '4326',
	            transparency: true,
	            visibilitat: 'O'
		};
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				//Un cop carregat el fitxer refresquem el popup de les dades de l'usuari i tambè
				//el control de capes
				carregarCapa(businessId);
				refrescaPopOverMevasDades();
				jQuery('#dialog_carrega_dadesfields').modal('hide');
			}
		});
	}
}