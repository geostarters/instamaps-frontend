//Global vars
var map, controlCapes, hashControl;
var mapConfig = {};

var factorH = 50;
var factorW = 0;

var capaUsrPunt, capaUsrLine, capaUsrPol,capaUsrActiva;

var initMevesDades = false;
var download_layer;
var lsublayers = [];
var tipus_user;

//Arrays control elements repetits a la llegenda
var controlLegendPoint = [];//Boles
var controlLegendMarker = [];//Pintxos
var controlLegendLine = [];
var controlLegendPol = [];
var mapLegend = {};
var downloadableData = {};
var _UsrID;

var dades1;


//Contants del mapa 3D
var estatMapa3D=false;

//Evitem error javascript a les pagines html que no carreguen la llibreria de leaflet
if((urlApp.indexOf('mapa')!=-1)||(urlApp.indexOf('visor')!=-1)){
//default geometries style
var estilP={
		icon : '',
		iconFons:'awesome-marker-web awesome-marker-icon-orange',
		iconGlif:'fa fa-',
		colorGlif:'#333333',
		fontsize:'14px',
		size:'28'
	};

var default_line_style = {
	    weight: 3,
	    color: '#FF0000',
	    opacity:1,
	    dashArray: '3',
	    lineCap:'round',
	    lineJoin:'round'
	};

var default_area_style = {
	    weight: 3,
	    opacity: 1,
	    color: '#FF0000',
	    dashArray: '3',
	    fillColor: "rgb(255,196,0)",//hexToRgb('#FFC400'),
	    borderColor: '#FF0000',
	    borderWidth: '3',
	    fillOpacity: 0.5
	};

var default_marker_style = {
		icon : '',
		markerColor : 'red',
		divColor:'transparent',
		iconAnchor : new L.Point(14, 42),
		iconSize : new L.Point(28, 42),
		iconColor : '#000000',
		prefix : 'fa',
		isCanvas:false,
		radius:6,
		opacity:1,
		weight : 2,
		fillOpacity : 0.9,
		color : "#ffffff",
		fillColor :"transparent"
	};

var default_circulo_style = {
		isCanvas:true,
		simbolSize: 6,
		borderWidth: 2,
		opacity: 90,
		borderColor : "#ffffff",
		color :"#FF0000",
		lineWidth: 3,
	};

var default_circuloglyphon_style = {
		icon : '',
		markerColor: 'punt_r',
		prefix : 'fa',
		divColor:'transparent',
		iconAnchor : new L.Point(15, 15),
		iconSize : new L.Point(30, 30),
		iconColor : '#000000',
		isCanvas:false,
		radius:6,
		opacity:1,
		weight : 2,
		fillOpacity : 0.9,
		color : "#ffffff",
		fillColor :"#FFC500"
	};

var default_onsoc_style = {
		icon : '',
		markerColor : 'red',
		divColor:'transparent',
		iconAnchor : new L.Point(14, 42),
		iconSize : new L.Point(28, 42),
		iconColor : '#000000',
		prefix : 'fa',
		isCanvas:false,
		radius:6,
		opacity:1,
		weight : 2,
		fillOpacity : 0.9,
		color : "#ffffff",
		fillColor :"transparent"
	};
}

//constants
var t_geojsonvt = "geojsonvt";
var t_dades_obertes = "dades obertes";
var t_wms = "wms";
var t_json = "json";
var t_xarxes_socials = "xarxes socials";
var t_tematic = "tematic";
var t_visualitzacio = "visualitzacio";
var t_url_file = "url_file";
var t_vis_wms = "vis_wms";
var t_vis_wms_noedit = "vis_wms_noeditable";

/**tipus estandar instamaps**/
var t_polyline = "polyline";
var t_polygon = "polygon";
var t_marker = "marker";
/************************/

var t_multiple = "multiple";
var t_point = "point";
var t_multipoint = "multipoint";
var t_linestring = "linestring";
var t_multilinestring = "multilinestring";
var t_multipolygon = "multipolygon";
var t_heatmap = "heatmap";
var t_cluster = "cluster";
var t_size = "size";
var tem_origen = "origenTematic";
var tem_simple = "simpleTematic";
var tem_clasic = "clasicTematic";
var tem_size = "sizeTematic";
var tem_heatmap = "heatmapTematic";
var tem_cluster = "clusterTematic";
var tem_heatmap_wms = "heatmapTematic_wms";
var tem_cluster_wms = "clusterTematic_wms";
var from_creaPopup = "creaPopup";
var from_creaCapa = "creaCapa";
var visibilitat_open = 'O';
var visibilitat_privat = 'P';

var t_file_csv = ".csv";
var t_file_txt = ".txt";
var t_file_gpx = ".gpx";
var t_file_kml = ".kml";
var t_file_gml = ".gml";
var t_file_wkt = ".wkt";
var t_file_json = ".json";
var t_file_geojson = ".geojson";
var t_file_topojson = ".topojson";
var t_file_shp = ".shp";
var t_file_dxf = ".dxf";
var t_file_dgn = ".dgn";
var t_file_xls = ".xls";
var t_file_xlsx = ".xlsx";
var t_file_json = ".json";

var t_user_loginat = '1#';
var t_user_random = '0#';

var num_max_pintxos = 250;
var capesOrdre_sublayer = "sublayer";//10000;

var msg_noguarda = "Per publicar o compartir el mapa has d'iniciar sessió";

var CAPTURA_MAPA = "captura_mapa";
var CAPTURA_GALERIA = "captura_galeria";
var CAPTURA_INFORME = "captura_informe";
var CAPTURA_FONS = "captura_fons";
var CAPTURA_GEOPDF = "captura_geopdf";
var CAPTURA_MAPA_GEOTIFF="captura_mapa_geotiff";
var CAPTURA_MAPA_GEOPACKAGE="captura_mapa_geopackage";
var NODATA_VALUE = "nodata";
var NODATA_COLOR = "#CCCCCC";
var NODATA_MIDA = 10;

var TIPUS_APLIACIO_INSTAMAPS = 1;
var TIPUS_APLIACIO_GEOLOCAL = 2;
var TIPUS_APLIACIO_AOC = 3;

//VAR per nou model de dades
var nou_model = true;

var instamaps_email = "instamapes@icgc.cat";
//var curs_instamaps = "1er curs InstaMaps";
//var curs_instamaps = "2n curs InstaMaps";
//var curs_instamaps = "3r curs InstaMaps";
//var curs_instamaps = "4rt curs InstaMaps";
//var curs_instamaps = "5e curs InstaMaps";
var curs_instamaps = "6e curs InstaMaps";

//Llistat exemples de dades externes
var llista_dadesExternes = {
		"dadesExternes" : [

			{
				"titol" : "Països del món",
				"ORGANITZAC" : "Natural Earth Data",
				"urlOrganitzacio" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson",
				"urlDadesExternes" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson",
				"formatDadesExternes": t_file_geojson,
				"epsgDadesExternes":"EPSG:4326"
			},
   				{
	                "titol" : "Rius del Món",
	                "ORGANITZAC" : "Natural Earth Data",
	                "urlOrganitzacio" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_rivers_lake_centerlines_scale_rank.geojson",
	                "urlDadesExternes" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_rivers_lake_centerlines_scale_rank.geojson",
					"formatDadesExternes": t_file_geojson,
					"epsgDadesExternes":"EPSG:4326"
				},
											
				{
					"titol" : "Ciutats del món",
					"ORGANITZAC" : "Natural Earth Data",
					"urlOrganitzacio" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_populated_places.geojson",
					"urlDadesExternes" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_populated_places.geojson",
					"formatDadesExternes": t_file_geojson,
					"epsgDadesExternes":"EPSG:4326"
				},
								
				{
					"titol" : "Ports del món",
					"ORGANITZAC" : "Natural Earth Data",
					"urlOrganitzacio" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson",
					"urlDadesExternes" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson",
					"formatDadesExternes": t_file_geojson,
					"epsgDadesExternes":"EPSG:4326"
				},
				
				
				{
					"titol" : "Zones en litigi",
					"ORGANITZAC" : "Natural Earth Data",
					"urlOrganitzacio" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_admin_0_disputed_areas_scale_rank_minor_islands.geojson",
					"urlDadesExternes" : "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_admin_0_disputed_areas_scale_rank_minor_islands.geojson",
					"formatDadesExternes": t_file_geojson,
					"epsgDadesExternes":"EPSG:4326"
				},
							
				
				{
					"titol" : "Comarques de Catalunya",
					"ORGANITZAC" : "ICGC",
					"urlOrganitzacio" : "https://raw.githubusercontent.com/geostarters/dades/master/Comarques_Catalunya_EPSG4326.geojson",
					"urlDadesExternes" : "https://raw.githubusercontent.com/geostarters/dades/master/Comarques_Catalunya_EPSG4326.geojson",
					"formatDadesExternes": t_file_geojson,
					"epsgDadesExternes":"EPSG:4326"
				},

				{
					"titol" : "Municipis de Catalunya",
					"ORGANITZAC" : "ICGC",
					"urlOrganitzacio" : "https://raw.githubusercontent.com/geostarters/dades/master/Municipis_Catalunya_EPSG4326.geojson",
					"urlDadesExternes" : "https://raw.githubusercontent.com/geostarters/dades/master/Municipis_Catalunya_EPSG4326.geojson",
					"formatDadesExternes": t_file_geojson,
					"epsgDadesExternes":"EPSG:4326"
				},

				{
					"titol" : "Camí de Sant Jaume",
					"ORGANITZAC" : "Gencat",
					"urlOrganitzacio" : "http://www.gencat.cat/",
					"urlDadesExternes" : "http://www.gencat.cat/opendata/recursos/rutes/cami_de_sant_jaume.kml",
					"formatDadesExternes": t_file_kml,
					"epsgDadesExternes":"EPSG:4326"
				}
		]
};

var TIPUS_ENTITATS_GEOLOCAL = [2,3,4,5,6,7,8,9];
var TIPUS_ADMIN = 0;
var TIPUS_INSTAMAPS = 1;
var TIPUS_AOC = 10;

var guideLayers = new Array();
