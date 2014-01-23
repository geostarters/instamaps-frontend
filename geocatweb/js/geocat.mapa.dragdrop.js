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
				//console.info(file.mozFullPath);
				//doUploadFile(file.mozFullPath,'','','');
				//console.info(file);
				done();
			}
		}
	};
	
	var opcionsBoto=drOpcionsMapa;//opcionsBoto.clickable=true;
	//drgMapa = new Dropzone("div#div_carrega_dades2", opcionsBoto);
	drgBoto = new Dropzone("div#map", drOpcionsMapa);
	
	/*
	drgMapa.on('success', function(file,resposta) {
		console.info(resposta);
	});
	
	drgMapa.on('progress', function(file,progress) {
		console.info(progress);
	});*/
	
	drgBoto.on('success', function(file,resposta) {
		console.info(resposta);  
	});
	
	drgBoto.on('progress', function(file,progress) {
		console.info(progress);
	});
}

jQuery('#bt_upload_fitxer').on("click", function(e) {
	var srid=document.getElementById("srid").value;
	var colX=document.getElementById("colX").value;
	var colY=document.getElementById("colY").value;
	var path=document.getElementById("pathFile").value;
	var isOK=true;
	if (colX.value=="" || colY.value=="") {
		isOK=false;
		alert("Cal indicar els camps de les coordeandes X,Y");
		
	}
	if (pathFile.value=="") {
		isOK=false;
		alert("Cal pujar un fitxer");
	}
	if (isOK) doUploadFile(path,colX,colY,srid);
	else return false;
});

jQuery('#bt_upload_cancel').on("click", function(e) {
	$('#dialog_carrega_dades').modal('hide');
});

jQuery('#div_carrega_dades').on("click", function(e) {
	console.info(e);
	$('#dialog_carrega_dades').modal('show');
	/*
	bootbox.dialog({
		message : "<div style='display: inline;font-weight: bold;margin-right: 15px;width: 150px;'>" +
				"<input type='hidden' id='formFile' value='false'>"+
				"<input type='hidden' id='pathFile' value=''>"+
				"<div style='display: inline;font-weight: bold;margin-right: 15px;width: 150px;'>SRID:</div>"+
				"<select id='srid' style='margin-left: 68px;'><option value='4326'>4326</option>" +
				"<option value='23031'>23031</option>" +
				"<option value='25831'>25831</option>" +
				"</select><br/>" +
				"<div style='display: inline;font-weight: bold;margin-right: 15px;width: 150px;'>Coordenades:</div>" +
				"X: <input type='text' name='colX' id='colX' value='' style='margin-left: 68px;'>" +
				"Y: <input type='text' name='colY' id='colY' value=''><br/>"+
				"<div style='display: inline;font-weight: bold;margin-right: 15px;width: 150px;'>Fitxer</div>" +
				"<input type='text'id='file_name' style='margin-left: 68px;'>" +
				"<input type='button' name='upload' id='upload_file' value='Upload file'>",
		title : "Carrega dades",
		buttons : {
			success : {
				label : "ok",
				className : "btn-success",
				callback : function() {
					var srid=document.getElementById("srid").value;
					var colX=document.getElementById("colX").value;
					var colY=document.getElementById("colY").value;
					var path=document.getElementById("pathFile").value;
					var isOK=true;
					if (colX.value=="" || colY.value=="") {
						isOK=false;
						alert("Cal indicar els camps de les coordeandes X,Y");
						
					}
					if (pathFile.value=="") {
						isOK=false;
						alert("Cal pujar un fitxer");
					}
					if (isOK) doUploadFile(path,colX,colY,srid);
					else return false;
				}
			},
			danger : {
				label : "cancel",
				className : "btn-danger",
				callback : function() {
					// Example.show("uh oh, look out!");
				}
			}

		}
	});
	*/
	var drOpcionsMapa = {
			url : paramUrl.dragFile,
			paramName : "file", // The name that will be used to transfer the file
			maxFilesize : 10, // MB
			method:'post',
			clickable:false,
			accept : function(file, done) {
				//alert("ACCEPT:"+file.name);
				done();				
			}
		};
	var opcionsBoto=drOpcionsMapa;
	opcionsBoto.clickable=true;
	var drgFile = new Dropzone("input#upload_file", opcionsBoto);
	drgFile.on('success', function(file,resposta) {
		document.getElementById("file_name").value= file.name;
	});
	
	drgFile.on('progress', function(file,progress) {
		console.info(progress);
	});
});

function doReadFile(path){
	return jQuery.ajax({
		url: paramUrl.readFile,
		data: {uid:$.cookie('uid'),path:path},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function doUploadFile(path,colX,colY,srid){
	return jQuery.ajax({
		url: paramUrl.uploadFile,
		data: {uid:$.cookie('uid'),path:path,colX: colX,colY: colY, srid:srid},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}