var rABS = typeof FileReader !== 'undefined'
		&& typeof FileReader.prototype !== 'undefined'
		&& typeof FileReader.prototype.readAsBinaryString !== 'undefined';
var useworker = typeof Worker !== 'undefined';
var pending = false
var drgFromMapa;
var drgFromMapa = null;
var drgFromBoto = null;
var midaFitxer = 10000000;//en bytes
var matriuActiva = [];
var envioArxiu={isDrag:false,
	tipusAcc:'gdal', //gdal,adreca,coordenades,codis
	colX:null,
	colY:null,
	srid:'EPSG:4326',
	bid:null,
	codi:null,
	codiType:null,
	geomType:null,
	type:null,
	camps:null,
	ext:null,
	uid : null
};

var drOpcionsMapa = {
	//url : paramUrl.uploadproxy+"?uid="+$.cookie('uid')+"&",	
//	url : paramUrl.upload_gdal,
	url : paramUrl.upload_gdal_nou,
	paramName : "file", 
	maxFilesize : 10, // MB
	method : 'post',
	// clickable:false,
	accept : function(file, done) {
	}
};

var progressBarShow = true;

function creaAreesDragDropFiles() {
	// dropzone
	var opcionsBoto = drOpcionsMapa;
	opcionsBoto.clickable=false;
	
	if (drgFromMapa == null) {

		drgFromMapa = new window.Dropzone("div#map", drOpcionsMapa);

		drgFromMapa.on("addedfile", function(file) {
			envioArxiu.isDrag=true;
			accionaCarrega(file,envioArxiu.isDrag);
		});

		
		drgFromMapa.on("sending", function(file, xhr, formData) {
			formData.append("nomArxiu", file.name); 
			formData.append("tipusAcc", envioArxiu.tipusAcc); 
			formData.append("colX", envioArxiu.colX);	
			formData.append("colY", envioArxiu.colY);
			formData.append("srid", envioArxiu.srid);
			formData.append("bid", envioArxiu.bid);
			formData.append("codiCAMP", envioArxiu.codi);
			formData.append("codiType", envioArxiu.codiType);
			formData.append("geomType", envioArxiu.geomType);
			formData.append("type", envioArxiu.type);
			formData.append("camps", envioArxiu.camps);
			formData.append("ext", envioArxiu.ext);
			formData.append("uid", $.cookie('uid'));
			formData.append("uploadFile", paramUrl.uploadFile);
															
		});
				
		drgFromMapa.on('success', function(file, resposta) {
			drgFromMapa.removeAllFiles(true);
			if(resposta){
				resposta=jQuery.trim(resposta);
				resposta=jQuery.parseJSON(resposta);
				if(resposta.status=="OK"){
					progressBarShow = true;
					$('#dialog_carrega_dades').modal('hide');
					addDropFileToMap(resposta);
				}else{
					
					var txt_error = "ERROR";
					progressBarShow = false;
					jQuery('#progress_bar_carrega_dades').hide();
					
					if(resposta.codi.indexOf("CONVERT ERROR")!= -1){
						var txt_error = window.lang.convert("Error de conversió: format o EPSG incorrectes");
					}else if(resposta.codi.indexOf("501")!= -1){//+ de 5000 punts
						txt_error += ": "+window.lang.convert("El número de punts supera el màxim permès. Redueixi a 5000 o menys i torni a intentar-ho.");
					}else if(resposta.codi.indexOf("502")!= -1){//+ de 1000 features
						txt_error += ": "+window.lang.convert("El número de línies/polígons supera el màxim permès. Redueixi a 1000 o menys i torni a intentar-ho.");
					}else if(resposta.codi.indexOf("503")!= -1){//+ de 6000 geometries
						txt_error += ": "+window.lang.convert("El número total de geometries supera el màxim permès. Redueixi a 6000 o menys i torni a intentar-ho.");
					}else{
						txt_error = window.lang.convert("Error en la càrrega de l'arxiu");
					}
					jQuery("#div_carrega_dades_message").html(txt_error);
					jQuery("#div_carrega_dades_message").show();					
				}
			}else{
				progressBarShow = false;
				jQuery('#progress_bar_carrega_dades').hide();
				jQuery("#div_carrega_dades_message").html(window.lang.convert("Error en la càrrega de l'arxiu"));
				jQuery("#div_carrega_dades_message").show();
//				alert(window.lang.convert("Error en la càrrega de l'arxiu"));	
			}
		});
		
		drgFromMapa.on('error', function(file, errorMessage) {
			drgFromMapa.removeAllFiles(true);
			progressBarShow = false;
			jQuery('#progress_bar_carrega_dades').hide();
			jQuery("#div_carrega_dades_message").html(window.lang.convert("Error en la càrrega de l'arxiu"));
			jQuery("#div_carrega_dades_message").show();
			//alert(window.lang.convert("Error en la càrrega de l'arxiu"));
		});
		
		drgFromMapa.on('uploadprogress', function(file, progress,bytesSent) {
			//jQuery('#prg_bar').css('width',progress+"%");
		});
	}
	
}


var	ldpercent=0;
function uploadprogress(){
	if(progressBarShow){
		jQuery('#progress_bar_carrega_dades').show();
		ldpercent += 10;    
		if(ldpercent>100){ ldpercent = 100;    }  
		jQuery('#prg_bar').css('width',ldpercent+"%");
		if(ldpercent<100){ setTimeout("uploadprogress()", 1000);}	
	}
}


// zona 1

jQuery('#div_carrega_dades').on("click", function(e) {
	obreModalCarregaDades(false);

	var opcionsBoto = drOpcionsMapa;
	opcionsBoto.clickable = true;

	
	if (drgFromBoto == null) {
		//drgFromBoto = new window.Dropzone("input#upload_file", opcionsBoto);
		drgFromBoto = new window.Dropzone("button#upload_file", opcionsBoto);

		drgFromBoto.on("addedfile", function(file) {
			envioArxiu.isDrag=false;
			accionaCarrega(file, envioArxiu.isDrag);			
		});

		
		drgFromBoto.on("sending", function(file, xhr, formData) {
			//console.info("sending");
			formData.append("nomArxiu", file.name); 
			formData.append("tipusAcc", envioArxiu.tipusAcc); 
			formData.append("colX", envioArxiu.colX);	
			formData.append("colY", envioArxiu.colY);
			formData.append("srid", envioArxiu.srid);
			formData.append("bid", envioArxiu.bid);
			formData.append("codiCAMP", envioArxiu.codi);
			formData.append("codiType", envioArxiu.codiType);
			formData.append("geomType", envioArxiu.geomType);
			formData.append("type", envioArxiu.type);
			formData.append("camps", envioArxiu.camps);
			formData.append("ext", envioArxiu.ext);	
			formData.append("uid", $.cookie('uid'));
			formData.append("uploadFile", paramUrl.uploadFile);
													
		});
		
		drgFromBoto.on('success', function(file, resposta) {
			drgFromBoto.removeAllFiles(true);
			$('#dialog_carrega_dades').modal('hide');
			if(resposta){
				resposta=jQuery.trim(resposta);
				resposta=jQuery.parseJSON(resposta);
				if(resposta.status=="OK"){			
				addDropFileToMap(resposta);
				}else{
				alert(window.lang.convert("Error en la càrrega de l'arxiu"));
				}
			}
			
		});
		
		drgFromBoto.on('error', function(file, errorMessage) {
			drgFromBoto.removeAllFiles(true);
			$('#dialog_carrega_dades').modal('hide');
			alert(window.lang.convert("Error en la càrrega de l'arxiu"));	

		});
		
		
		
		
		drgFromBoto.on('uploadprogress', function(file, progress,bytesSent) {
			//console.info("progress");
			//jQuery('#prg_bar').css('width',progress+"%");

		});
	}

});

//Botons per enviar arxius

jQuery("#bt_esborra_ff").on('click', function() {
	if(envioArxiu.isDrag){
		drgFromMapa.removeAllFiles(true);	
	}else{
		drgFromBoto.removeAllFiles(true);
	}
	jQuery("#file_name").text("");
	jQuery('#dv_optCapa').hide();
	jQuery('#dv_optSRS').hide();
	jQuery("#bt_esborra_ff").hide();
	jQuery('#prg_bar').css('width',"0%");
});

jQuery("#load_TXT_coord").on('click', function() {// fitxer TXT
	var isOK=false;
	var colX = jQuery("#cmd_upload_colX").val();
	var colY = jQuery("#cmd_upload_colY").val();
	var srid = jQuery("#select-upload-epsg").val();
	
	if (colX == "null" || colY == "null" ||srid == "null"  ) {
		isOK = false;
		alert(window.lang.convert("Cal indicar els camps de les coordenades i el sistema de referència"));
	}else{
		isOK = true;
		
		if(envioArxiu.ext=="csv"){
			envioArxiu.tipusAcc='gdal'; 
		}else if(envioArxiu.ext=="txt"){
				envioArxiu.tipusAcc='gdal'; 	
		}else{
			envioArxiu.tipusAcc='coordenades';	
		}
		
		 //gdal,adreca,coordenades,codis
		envioArxiu.colX=colX;
		envioArxiu.colY=colY;
		envioArxiu.srid=srid;	
		enviarArxiu();
	}	
});

jQuery("#load_TXT_adre").on('click', function() {// fitxer TXT	
	var cc=$('input:radio[name="radio_adre"]:checked').val();
	//var isOK=false;
	var isOK=true; //mientras adaptamos el nuevo geocodificador
	envioArxiu.tipusAcc='adreca'; 
	if(cc == '0'){
	       if (jQuery('#cmd_upload_adre_0').val()!="null"){
	    	   isOK=true; 
	    	   envioArxiu.tipusAcc='adreca'; 
	    	   envioArxiu.camps=jQuery('#cmd_upload_adre_0').val();
	       }else{
	    	   isOK=false;
	    	   alert(window.lang.convert("Cal indicar el camp que conté l'adreça"));
	    	  
	       };	      
	    }else if(cc == '1'){	    	
	    	var nc=jQuery("#cmd_upload_adre_11").val();
	    	var mun=jQuery("#cmd_upload_adre_12").val();
	    	
	    	if((nc!='null') && (mun!='null') ){ 
	    		 isOK=true; 
	    		 envioArxiu.tipusAcc='adreca';
	    		 envioArxiu.camps=nc+","+mun;    		
	    	}else{
	    		 isOK=false;
		    	 alert(window.lang.convert("Cal indicar els camps que contenen l'adreça"));
	    	}
	    }else if(cc == '2'){	    	
	    	var nc=jQuery("#cmd_upload_adre_21").val();
	    	var numc=jQuery("#cmd_upload_adre_22").val();
	    	var mun=jQuery("#cmd_upload_adre_23").val();
	    	
	    	if((nc!='null') && (numc!='null') && (mun!='null') ){ 
	    		 isOK=true; 
	    		 envioArxiu.tipusAcc='adreca';
	    		 envioArxiu.camps=nc+","+numc+","+mun;    		
	    	}else{
	    		 isOK=false;
		    	 alert(window.lang.convert("Cal indicar els camps que contenen l'adreça"));
	    	}
	    }	
	if(isOK){enviarArxiu();}
});

jQuery("#load_TXT_codi").on('click', function() {// fitxer codi

			 if (jQuery('#cmd_upload_codi').val()!="null"){
				 isOK=true; 
			  	   envioArxiu.tipusAcc='codis'; 
			  	   envioArxiu.codi=jQuery('#cmd_upload_codi').val();
				   
				   //envioArxiu.codi="CODI INE";
			  	 envioArxiu.geomType=jQuery('#cmd_codiType_Capa').val();
				 envioArxiu.codiType=jQuery('#cmd_codiType').val();
					
			     }else{
			  	   isOK=false;
			  	   alert(window.lang.convert("Cal indicar el camp que conté el codi"));
			  	  
			     };
				
			     if(isOK){enviarArxiu();}



});

jQuery("#load_FF_SRS_coord").on('click', function() {
		
	 if (jQuery('#select-upload-ff-epsg').val()!="null"){
  	   isOK=true; 
  	   envioArxiu.tipusAcc='gdal'; 
  	   envioArxiu.srid=jQuery('#select-upload-ff-epsg').val();
     }else{
  	   isOK=false;
  	   alert(window.lang.convert("Cal indicar el sistema de referència"));
  	  
     };
	
     if(isOK){enviarArxiu();}
// fitxer geo coordenades
});


function enviarArxiu(){
	ldpercent=0;
	uploadprogress();
	if(envioArxiu.isDrag){
		drgFromMapa.uploadFile(drgFromMapa.files[0]);	
	}else{
		drgFromBoto.uploadFile(drgFromBoto.files[0]);;
	}
}

jQuery('#bt_upload_cancel').on("click", function(e) {
	$('#dialog_carrega_dades').modal('hide');
	if(envioArxiu.isDrag){
		drgFromMapa.uploadFile(drgFromMapa.files[0]);	
	}else{
		drgFromBoto.uploadFile(drgFromBoto.files[0]);;
	}
});

jQuery('#cmd_codiType_Capa')
		.on(
				'change',
				function(e) {
					var html = "";
					if (jQuery(this).val() == "municipis") {
						html = "<option value='ine'>INE (5 digits)</option><option value='idescat'>IDESCAT (6 digits)</option><option value='municat'>MUNICAT (10 digits)</option><option value='cadastre'>CADASTRE (5 digits)</option>";
					} else {
						html = "<option value='ine'>NUM_COMARCA (2 digits)</option><option value='municat'>MUNICAT (10 digits)</option>";
					}
					jQuery('#cmd_codiType').html(html);
				});

function obreModalCarregaDades(isDrag) {

	$('#dialog_carrega_dades').modal('show');
	
	if(isDrag){
		$('#upload_file').attr('disabled',true);
	}else{
		$('#upload_file').attr('disabled',false);
	}
	
	jQuery('#dv_optCapa').hide();
	jQuery('#dv_optSRS').hide();
	$('#url').val(paramUrl.dragFile);
	jQuery('#prg_bar').css('width',"0%");
	jQuery("#bt_esborra_ff").hide();
	jQuery("#file_name").text("");
}

function accionaCarrega(file,isDrag) {
	//console.debug("accionaCarrega");
	var ff = miraFitxer(file);
	
	var obroModal = false;
	if (ff.isValid) {
		if ( isDrag) {obreModalCarregaDades(true);}
		jQuery("#file_name").text(file.name);
		jQuery("#bt_esborra_ff").show();
		
		if ((ff.ext == "csv") || (ff.ext == "txt")) {

			obteCampsCSV(file);
			obroModal = true;
		} else if (ff.ext == "xlsx") {

			obteCampsXLSX(file);
			obroModal = true;
		} else if (ff.ext == "xls") {

			obteCampsXLS(file);
			obroModal = true;
		} else if ((ff.ext == "dgn") || (ff.ext == "dxf") || (ff.ext == "zip") || (ff.ext == "geojson") || (ff.ext == "json")) {
			
			jQuery('#dv_optCapa').hide();
			
			jQuery('#dv_optSRS').show();
			
			obroModal = true;
		} else {
			envioArxiu.tipusAcc='gdal'; 
			// Fot-li castanya
			 enviarArxiu();
			 /*
			 if(isDrag){
			drgFromMapa.uploadFile(file);			
			}else{
			drgFromBoto.uploadFile(file);							
			}
			*/
			
			obroModal = false;
		}


		//if (obroModal && envioArxiu.isDrag) {obreModalCarregaDades();}
		
		

	} else { // novalid

		alert(ff.msg);
		obroModal = false;
		

	}

}


$('input:radio[name="radio_adre"]').change(function(){
    
	var cc=$(this).val(); 
	if(cc == '0'){
       jQuery('#cmd_upload_adre_0').attr('disabled',false);
       jQuery("[id*='cmd_upload_adre_1']").attr('disabled',true);
       jQuery("[id*='cmd_upload_adre_2']").attr('disabled',true);
    }else if(cc == '1'){
    	jQuery("[id*='cmd_upload_adre_1']").attr('disabled',false);
    	jQuery('#cmd_upload_adre_0').attr('disabled',true);
    	jQuery("[id*='cmd_upload_adre_2']").attr('disabled',true);
    }else if(cc == '2'){
    	jQuery("[id*='cmd_upload_adre_2']").attr('disabled',false);
    	jQuery('#cmd_upload_adre_0').attr('disabled',true);
    	jQuery("[id*='cmd_upload_adre_1']").attr('disabled',true);
    	
    }	
});




function analitzaMatriu(matriu) {
	var op = [];
	jQuery('#dv_optCapa').show();
	jQuery('#dv_optSRS').hide();

	
	$.each(matriu, function(index, value) {
		op.push("<option value=\"" + value + "\">" + value.toUpperCase()
				+ "</option>");
	});

	jQuery('#cmd_upload_colX').html("<option value='null'>" + window.lang.convert('Selecciona un camp')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_colY').html("<option value='null'>" + window.lang.convert('Selecciona un camp')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_0').html("<option value='null'>" + window.lang.convert('Selecciona un adreça sencera')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_11').html("<option value='null'>" + window.lang.convert('Selecciona nom carrer i número')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_12').html("<option value='null'>" + window.lang.convert('Selecciona municipi')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_21').html("<option value='null'>" + window.lang.convert('Selecciona nom carrer')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_22').html("<option value='null'>" + window.lang.convert('Selecciona número')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_23').html("<option value='null'>" + window.lang.convert('Selecciona municipi')+ "</option>"+op.join(" "));
	
	jQuery('#cmd_upload_codi').html("<option value='null'>" + window.lang.convert('Selecciona un camp amb el codi')+ "</option>"+op.join(" "));

	var fieldType = "";
	for (x = 0; x < matriu.length; x++) {

		if (matriu[x].toUpperCase() == "X" || matriu[x].toUpperCase() == "LON"
				|| matriu[x].toUpperCase() == "LONGITUD") {
			fieldType = "colX";
			$('#cmd_upload_colX option:contains("' + matriu[x] + '")').prop(
					'selected', true);
			isCoordinates = true;

			$('#nav_pill a[href="#opt_coord"]').tab('show');

		} else if (matriu[x].toUpperCase() == "Y"
				|| matriu[x].toUpperCase() == "LAT"
				|| matriu[x].toUpperCase() == "LATITUD") {

			fieldType = "colY";
			$('#cmd_upload_colY option:contains("' + matriu[x] + '")').prop(
					'selected', true);
			isCoordinates = true;
			$('#nav_pill a[href="#opt_coord"]').tab('show');

		} else if (matriu[x].toUpperCase() == "CARRER"
				|| matriu[x].toUpperCase() == "ADRECA") {
			fieldType = "adre";
			$('#cmd_upload_adre option:contains("' + matriu[x] + '")').prop(
					'selected', true);
			isCoordinates = false;
			$('#nav_pill a[href="#opt_adreca"]').tab('show');
		} else if (matriu[x].toUpperCase() == "MUNICIPI"
				|| matriu[x].toUpperCase() == "MUNI"
				|| matriu[x].toUpperCase() == "POPBLA"
				|| matriu[x].toUpperCase() == "COMARC") {
			fieldType = "adre";
			$('#cmd_upload_mun option:contains("' + matriu[x] + '")').prop(
					'selected', true);
			$('#nav_pill a[href="#opt_adreca"]').tab('show');
			isCoordinates = false;
		} else if (matriu[x].toUpperCase() == "ID"
				|| matriu[x].toUpperCase() == "BID"
				|| matriu[x].toUpperCase() == "CODI") {
			fieldType = "bid";
		} else if (matriu[x].toUpperCase() == "CODI_INE"
				|| matriu[x].toUpperCase() == "CODI INE"
				|| matriu[x].toUpperCase() == "INE"
				|| matriu[x].toUpperCase() == "CODI_MUNICAT"
				|| matriu[x].toUpperCase() == "MUNICAT"
				|| matriu[x].toUpperCase() == "IDESCAT"
				|| matriu[x].toUpperCase() == "CADASTRE") {
			fieldType = "codi";
			$('#cmd_upload_codi option:contains("' + matriu[x] + '")').prop(
					'selected', true);
			$('#nav_pill a[href="#opt_codi"]').tab('show');
		}

	}

}



function obteCampsCSV(file) {
	matriuActiva = [];
	var reader = new FileReader();
	reader.onload = function(e) {
		var csvval = e.target.result.split("\n");
		var separador = ";";
		if (csvval[0].indexOf(";") != -1) {
			separador = ";";
		} else if (csvval[0].indexOf(",") != -1) {
			separador = ",";
		} else if(csvval[0].indexOf(",") != -1) {
			separador = " ";
		}
		var csvvalue = csvval[0].split(separador);
		for ( var i = 0; i < csvvalue.length; i++) {
			matriuActiva.push(csvvalue[i].replace("\r", ""));
		}
		analitzaMatriu(matriuActiva);
	};
	reader.readAsText(file);

}

var use_worker = true;

function xlsworker(data, cb) {
	var worker = new Worker('/llibreries/js/formats/xlsworker.js');
	worker.onmessage = function(e) {
		
		
		
		switch (e.data.t) {
		case 'ready':
			break;
		case 'e':
			//cb(e.data.d);
			console.error(e);
			break;
		case 'xls':
			cb(e.data.d);
			break;
		}
	};
	worker.postMessage(data);
}

function obteCampsXLS(f) {
	var reader = new FileReader();
	var name = f.name;
	reader.onload = function(e) {
		var data = e.target.result;
		if (use_worker && typeof Worker !== 'undefined') {
			
			xlsworker(data, llegirTitolXLS);
		} else {

			var wb = XLS.read(data, {
				type : 'binary'
			});
						llegirTitolXLS(wb);
		}
	};
	reader.readAsBinaryString(f);

}

function llegirTitolXLS(workbook) {
	matriuActiva = [];
	if(workbook){
			workbook.SheetNames.forEach(function(sheetName) {
				matriuActiva = get_columns(workbook.Sheets[sheetName], 'XLS');
				analitzaMatriu(matriuActiva);
			});
	}else{
		
		$('#dialog_carrega_dades').modal('hide');
		alert(window.lang.convert("Versió incorrecta. No es pot llegir aquest XLS."));
	}
	return matriuActiva;

}

function obteCampsXLSX(f) {
	matriuActiva = [];
	var reader = new FileReader();
	var name = f.name;
	reader.onload = function(e) {
		var data = e.target.result;
		var wb, arr, xls;
		var readtype = {
			type : rABS ? 'binary' : 'base64'
		};
		if (!rABS) {
			arr = fixdata(data);
			data = btoa(arr);
		}
		xls = [ 0xd0, 0x3c ].indexOf(data.charCodeAt(0)) > -1;
		if (!xls && arr)
			xls = [ 0xd0, 0x3c ].indexOf(arr[0].charCodeAt(0)) > -1;
		if (rABS && !xls && data.charCodeAt(0) !== 0x50)
			alert("Error arxiu");
		function doit() {
			try {
				if (useworker) {
					sheetjsw(data, llegirTitolXLSX, readtype, xls);
					return;
				}
				if (xls) {
					wb = XLS.read(data, readtype);
					llegirTitolXLSX(wb, 'XLS');
				} else {
					wb = XLSX.read(data, readtype);
					llegirTitolXLSX(wb, 'XLSX');
				}
			} catch (e) {
				alert(window.lang.convert("No es pot llegir l'arxiu"));
			}
		}

		if (e.target.result.length > 500000) {
			alert(window.lang.convert("Arxiu massa gran!!"));

		} else {
			doit();
		}
	};
	if (rABS)
		reader.readAsBinaryString(f);
	else
		reader.readAsArrayBuffer(f);

}

function llegirTitolXLSX(wb, type, sheetidx) {
	matriuActiva = [];
	last_wb = wb;
	last_type = type;
	var sheet = wb.SheetNames[sheetidx || 0];
	if (type.toLowerCase() == 'xls' && wb.SSF)
		XLS.SSF.load_table(wb.SSF);
	matriuActiva = get_columns(wb.Sheets[sheet], type);
	analitzaMatriu(matriuActiva);
	return matriuActiva;
}

function get_columns(sheet, type) {
	var val, rowObject, range, columnHeaders, emptyRow, C;
	range = XLS.utils.decode_range(sheet["!ref"]);
	columnHeaders = [];
	for (C = range.s.c; C <= range.e.c; ++C) {
		val = sheet[XLS.utils.encode_cell({
			c : C,
			r : range.s.r
		})];
		if (!val)
			continue;
		columnHeaders[C] = type.toLowerCase() == 'xls' ? XLS.utils
				.format_cell(val) : val.v;
		// console.log(val, columnHeaders[C]);
	}
	return columnHeaders;
}

;
function fixdata(data) {
	var o = "", l = 0, w = 10240;
	for (; l < data.byteLength / w; ++l)
		o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l
				* w + w)));
	o += String.fromCharCode.apply(null, new Uint8Array(data.slice(o.length)));
	return o;
}

function sheetjsw(data, cb, readtype, xls) {
	pending = true;
	var worker = new Worker('/llibreries/js/formats/xlsxworker.js');
	worker.onmessage = function(e) {
		switch (e.data.t) {
		case 'ready':
			break;
		case 'e':
			pending = false;
			console.error(e.data.d);
			break;
		case 'xls':
		case 'xlsx':
			pending = false;
			cb(JSON.parse(e.data.d), e.data.t);
			break;
		}
	};
	worker.postMessage({
		d : data,
		b : readtype,
		t : xls ? 'xls' : 'xlsx'
	});
}

var last_wb, last_type;

function miraFitxer(fitxer) {

	var obj = {}

	obj.ext = fitxer.name.split('.').pop().toLowerCase();

	var arr = [ 'shp', 'xls', 'xlsx', 'dgn', 'dxf', 'zip', 'geojson', 'kml',
			'kmz', 'gml', 'xml', 'gpx', 'txt', 'csv', 'json' ];
	
	if (jQuery.inArray(obj.ext, arr) != -1) { // hi hso
	
		if(obj.ext=="shp"){
			obj.isValid = false;
			obj.msg =  window.lang.convert("El fitxer SHP ha d'anar dins d'un ZIP juntament amb els fitxers SHX i DBF.");	
		
		}else{
		
				if (fitxer.size < midaFitxer) {			
					obj.isValid = true;		
				
				} else {
								
					obj.isValid = false;
					obj.msg =  window.lang.convert("La mida del fitxer és massa gran. Mida màxima 10MB");
					}
		}

	} else {
		obj.isValid = false;
		obj.msg = window.lang.convert("Tipus de fitxer no acceptat");
	}
	
	envioArxiu.ext=obj.ext;

	return obj;

}

function addDropFileToMap(results) {
	if (results.status == "OK") {
		// console.debug(results.results);
		var businessId = results.results.businessId;

		// crear el servidor WMS i agregarlo al mapa
		var data = {
			uid : $.cookie('uid'),
			businessId : businessId,
			mapBusinessId : url('?businessid'),
			serverName : results.results.nom,
			serverType : 'tematic',
			calentas : false,
			activas : true,
			visibilitats : true,
			epsg : '4326',
			transparency : true,
			visibilitat : 'O'
		};
		createServidorInMap(data).then(function(results) {
			if (results.status == "OK") {
				var extensio = ((envioArxiu.ext!=null)?envioArxiu.ext:"");
				_gaq.push(['_trackEvent', 'mapa', 'carregar dades', envioArxiu.ext, tipus_user]);
				// Un cop carregat el fitxer refresquem el popup de les dades de
				// l'usuari i tambÃ¨
				// el control de capes
				//console.debug(results.results);
				results.results.dragdrop = true;
				loadTematicLayer(results.results).then(function(results1){
					
					getRangsFromLayer(results1);
					
					if(results1){
					map.fitBounds(results1.getBounds());
					}
					
				});

				// carregarCapa(businessId);
				refrescaPopOverMevasDades();
				//jQuery('#dialog_carrega_dadesfields').modal('hide');
				map.spin(false);
			}
		});
	}else{
		var txt_error = "ERROR";
		progressBarShow = false;
		jQuery('#progress_bar_carrega_dades').hide();
		
		if(results.results.indexOf("CONVERT ERROR")!= -1){
			var txt_error = window.lang.convert("Error de conversió: format o EPSG incorrectes");
		}else if(results.results.indexOf("501")!= -1){//+ de 5000 punts
			txt_error += ": "+window.lang.convert("El número de punts supera el màxim permès. Redueixi a 5000 o menys i torni a intentar-ho.");
		}else if(results.results.indexOf("502")!= -1){//+ de 1000 features
			txt_error += ": "+window.lang.convert("El número de línies/polígons supera el màxim permès. Redueixi a 1000 o menys i torni a intentar-ho.");
		}else if(results.results.indexOf("503")!= -1){//+ de 6000 geometries
			txt_error += ": "+window.lang.convert("El número total de geometries supera el màxim permès. Redueixi a 6000 o menys i torni a intentar-ho.");
		}else{
			txt_error = window.lang.convert("Error en la càrrega de l'arxiu");
		}
		_gaq.push(['_trackEvent', 'mapa', 'carregar dades error', results.results, tipus_user]);
		jQuery("#div_carrega_dades_message").html(txt_error);
		jQuery("#div_carrega_dades_message").show();	
	}
}
