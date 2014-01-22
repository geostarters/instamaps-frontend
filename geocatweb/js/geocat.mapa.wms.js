var _htmlServeisWMS= [];
var llista_servidorsWMS={"WMS":[{
	"TITOL" : "Base municipal",
	"ORGANITZAC" : "Institut Cartogràfic de Catalunya",
	"IDARXIU" : "http://galileo.icc.cat/arcgis/services/icc_limadmin_v_r/MapServer/WMSServer?",
	"URN" : " urn:uuid:761da3ce-233c-11e2-a4dd-13da4f953834"
},
{
	"TITOL" : "Mapa Urbanístic",
	"ORGANITZAC" :"Departament de Territori i Sostenibilitat",
	"IDARXIU" : "http://ptop.gencat.cat/webmap/MUC/request.aspx?",
	"URN" : "urn:uuid:e7a15a72-233b-11e2-a4dd-13da4f953834"
},	

{
	"TITOL" : "Mapa Cadastral",
	"ORGANITZAC" : "Dirección General del Catastro ",
	"IDARXIU" : "http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?",
	"URN" : "urn:uuid:260c0ccb-233c-11e2-a4dd-13da4f953834"
},

/*
{
	"TITOL" : "Avistaments cetàcis",
	"ORGANITZAC" : "Centre de Recerca Ecològica i Aplicacions Forestals (CREAF) - UAB",
	"IDARXIU" : "http://www.ogc.uab.es/cgi-bin/cetcat/MiraMon5_0.cgi?",
	"URN" : "urn:uuid:dc86e70e-79ca-11e3-aa3b-07b03c41b8e8"
},
*/
{
	"TITOL" : "Parcs eòlics",
	"ORGANITZAC" : "Direcció General de Polítiques Ambientals",
	"IDARXIU" : "http://mapaidec.icc.cat/ogc/geoservei?map=/opt/idec/dades/peolics/parcseolics.map&amp",
	"URN" : "urn:uuid:3dd3d606-79c8-11e3-aa3b-07b03c41b8e8"
},
{
	"TITOL" : "Mapes Medi Natural",
	"ORGANITZAC" : "Departament d'Agricultura, Ramaderia, Pesca, Alimentació i Medi Natural",
	"IDARXIU" : "http://magrana.gencat.cat/SIG_ws/services/PUBLIC_OGC/MapServer/WMSServer?",
	"URN" : "urn:uuid:6661c209-1462-11e3-8d85-e315c0a1d933"
},
{"TITOL":"Ortofotos històriques",
	"ORGANITZAC":"Institut Cartogràfic de Catalunya",
	"IDARXIU":"http://historics.icc.cat:80/lizardtech/iserv/ows?",
	"URN":"urn:uuid:6434ad48-66df-11e2-8be5-bd1ed7ebebe1"
},

	{
		"TITOL" : "Rutes turistiques",
		"ORGANITZAC" : "Direccio General de Difusio",
		"IDARXIU" : "http://delta.icc.cat/cgi-bin/mapserv?map=/opt/idec/dades/probert/idelocal_probert.map&",
		"URN" : "urn:uuid:6975bcce-2347-11e2-a4dd-13da4f953834"
	},

	{
		"TITOL" : "Cobertes del Sòl",
		"ORGANITZAC" : "Centre de Recerca Ecològica i Aplicacions Forestals (CREAF) - UAB",
		"IDARXIU" : "http://www.opengis.uab.es/cgi-bin/MCSC/MiraMon.cgi?",
		"URN" : "urn:uuid:54012596-233b-11e2-a4dd-13da4f953834"
	}, 
	
	 {
		"TITOL" : "Mapes Ambientals",
		"ORGANITZAC" : "Departament de Territori i Sostenibilitat",
		"IDARXIU" : "http://sima.gencat.cat/DMAH_ws/SIMA_OGC/MapServer/WMSServer?",
		"URN" : "urn:uuid:e84cb5ba-233b-11e2-a4dd-13da4f953834"
	},

	{
		"TITOL" : "Nodes guifi.net",
		"ORGANITZAC" : "GUIFI.NET",
		"IDARXIU" : "http://guifi.net/cgi-bin/mapserv?map=/home/guifi/maps.guifi.net/guifimaps/GMap.map&",
		"URN" : "urn:uuid:63013742-233c-11e2-a4dd-13da4f953834"
	}, 
	



				]};



function generaLlistaServeisWMS(){
			
_htmlServeisWMS.push('<div><ul class="bs-dadesO">');
	
	jQuery.each(
			llista_servidorsWMS.WMS,
					function(key, WMS) {
				
						_htmlServeisWMS
								.push('<li><a class="label label-wms" href="#" id="'
										+ WMS.IDARXIU
										+ '">'
										+ WMS.TITOL
										+ '</a>'
										+ '<a target="_blank" lang="ca" title="Informació dels serveis" href="http://catalegidec.icc.cat/wefex/client?do=cercaAssociacions&resposta=detall&idioma=ca&id='+WMS.URN+'"><span class="glyphicon glyphicon-info-sign info-wms"></span></a>'									
										+'</li>');
					});
	
	_htmlServeisWMS.push('</ul></div>');
	_htmlServeisWMS.push('<div style="height:100px;overflow:auto" class="tbl"></div><br>');
	 _htmlServeisWMS.push('<div class="input-group"><input type="text" lang="ca" placeholder="Entrar URL servei WMS" class="form-control">');
     _htmlServeisWMS.push('<span class="input-group-btn"><button class="btn btn-default" type="button"><span class="glyphicon glyphicon-play"></span></button></span>');
    _htmlServeisWMS.push('</div>');
	
	
	
	
	
}

