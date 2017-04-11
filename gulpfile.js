var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var gulpif = require('gulp-if');
var util = require('gulp-util');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var revUrlhash = require('gulp-rev-urlhash');
var revReplace = require('gulp-rev-replace');
var del = require('del');
var pump = require('pump');
var runSequence = require('run-sequence');
var jsValidate = require('gulp-jsvalidate');
var Q = require('q');

var config = {
  srcFolder: 'geocatweb',
  distFolder: 'geocatweb/dist',
  templateFolder: 'geocatweb/templates',
  dirCssInstamaps: 'geocatweb/css',
  dirCssVendors: 'llibreries/css',
  dirVendors: 'llibreries',
  cssPattern: '/**/*.css',
  dirJsInstamaps: 'geocatweb/js',
  dirJsVendors: 'llibreries/js',
  jsPattern: '/**/*.js',
  revManifestPath: 'assets/rev-manifest.json',
  production: !!util.env.production,
  sourceMaps: !util.env.production
};

var app = {};

app.addStyle = function(paths, outputFilename) {
  return gulp.src(paths).on('end', function() { console.log('start '+outputFilename)})
    .pipe(gulpif(!util.env.production, plumber(function(error) { //solo en desarrollo
      console.log(error.toString());
      this.emit('end');
    })))
    .pipe(gulpif(config.sourceMaps, sourcemaps.init())) //solo en desarrollo tambien se puede hacer con un if como el cleanCSS
    .pipe(concat('css/'+outputFilename))
    .pipe(config.production ? cleanCSS() : util.noop()) //solo en produccion
    //.pipe(rev())
    .pipe(revUrlhash())
    .pipe(gulpif(config.sourceMaps, sourcemaps.write('.')))
    .pipe(gulp.dest(config.distFolder))
    // write the rev-manifest.json file for gulp-rev
    //.pipe(rev.manifest(config.revManifestPath, {merge: true}))
    .pipe(revUrlhash.manifest(config.revManifestPath, {merge: true}))
    .pipe(gulp.dest('.')).on('end', function() { console.log('end '+outputFilename)});
};

app.addScript = function(paths, outputFilename) {
  return gulp.src(paths).on('end', function() { console.log('start '+outputFilename)})
    .pipe(gulpif(!util.env.production, plumber(function(error) { //solo en desarrollo
      console.log(error.toString());
      this.emit('end');
    })))
    .pipe(gulpif(config.sourceMaps, sourcemaps.init())) //solo en desarrollo tambien se puede hacer con un if como el cleanCSS
    .pipe(concat('js/'+outputFilename))
    .pipe(config.production ? uglify().on('error', function(err) {
      util.log(util.colors.red('[Error]'), err.toString());
      this.emit('end');
    }) : util.noop()) //solo en produccion
    //.pipe(rev())
    .pipe(revUrlhash())
    .pipe(gulpif(config.sourceMaps, sourcemaps.write('.')))
    .pipe(gulp.dest(config.distFolder))
    // write the rev-manifest.json file for gulp-rev
    //.pipe(rev.manifest(config.revManifestPath, { merge: true}))
    .pipe(revUrlhash.manifest(config.revManifestPath, { merge: true}))
    .pipe(gulp.dest('.')).on('end', function() { console.log('end '+outputFilename)});
};

app.copy = function(srcFiles, outputDir) {
  return gulp.src(srcFiles)
    .pipe(gulp.dest(outputDir));
};

var Pipeline = function() {
    this.entries = [];
};
Pipeline.prototype.add = function() {
    this.entries.push(arguments);
};
Pipeline.prototype.run = function(callable) {
    var deferred = Q.defer();
    var i = 0;
    var entries = this.entries;
    var runNextEntry = function() {
        // see if we're all done looping
        if (typeof entries[i] === 'undefined') {
            deferred.resolve();
            return;
        }
        // pass app as this, though we should avoid using "this"
        // in those functions anyways
        callable.apply(app, entries[i]).on('end', function() {
            i++;
            runNextEntry();
        });
    };
    runNextEntry();
    return deferred.promise;
};


gulp.task('styles', function() {
  console.log("CSS!");
  var pipeline = new Pipeline();

  pipeline.add([
    config.dirCssVendors+'/bootstrap.min.visor.css',
    config.dirCssVendors+'/glyph.css',
    config.dirCssVendors+'/cookieconsent-3.0.1.min.css',
    config.dirCssVendors+'/font-awesome.min.css',
    config.dirCssVendors+'/traffico.css',
    config.dirCssVendors+'/bootstrap-switch.min.css',
    config.dirCssVendors+'/bootstrap-table.min.css',
    config.dirCssVendors+'/bootstrap-select.min.css',
    config.dirCssVendors+'/jquery-ui.css',
    config.dirCssVendors+'/blue.css',
    config.dirCssVendors+'/jquery.mCustomScrollbar.css',
    config.dirCssVendors+'/perfect-scrollbar.css',
    config.dirCssVendors+'/jquery.share.css'
  ], 'jquery.css');

  pipeline.add([
    config.dirCssVendors+'/leaflet/leaflet.0.7.7.css',
    config.dirCssVendors+'/leaflet/leaflet.draw.css',
    config.dirCssVendors+'/leaflet/MarkerCluster.css',
    config.dirCssVendors+'/leaflet/L.Control.MousePosition.css',
    config.dirCssVendors+'/leaflet/leaflet.awesome-markers.css',
    config.dirCssVendors+'/leaflet/Control.MiniMap.css',
    config.dirCssVendors+'/leaflet/leaflet-gps.css',
    config.dirCssVendors+'/leaflet/leaflet.label.css',
    config.dirCssVendors+'/leaflet.timedimension.control.css',
    config.dirCssVendors+'/leaflet/leaflet-routing-machine.css',
    config.dirCssVendors+'/leaflet/lrm-mapzen.css'
  ], 'leaflet.css');

  pipeline.add([
    config.dirCssInstamaps+'/L.IM_ControlLayerManager.css',
    config.dirCssInstamaps+'/L.IM_LegendControl.css',
    config.dirCssInstamaps+'/instamaps.visor.estils.css',
    config.dirCssInstamaps+'/instamaps.visor.geocat.css',
    config.dirCssInstamaps+'/instamaps.visor.mapa.css',
    config.dirCssInstamaps+'/collapse_visor.css'
  ], 'instamaps.css');

  pipeline.run(app.addStyle);
});

gulp.task('scripts', function() {
  console.log("JS!");
  var pipeline = new Pipeline();

  pipeline.add([
    config.dirJsVendors+'/lodash.js',
    config.dirJsVendors+'/jquery/jquery-2.1.4.min.js',
    config.dirJsVendors+'/jquery/jquery-ui-1.10.3.custom.min.js',
    config.dirJsVendors+'/bootstrap.min.js',
    config.dirJsVendors+'/jquery/plugins/js.cookie-2.1.3.min.js',
    config.dirJsVendors+'/cookieconsent-3.0.1.min.js',
    config.dirJsVendors+'/jquery/plugins/url.min.js',
    config.dirJsVendors+'/jquery/plugins/jquery-lang-3.0.0.js',
    config.dirJsVendors+'/jquery/plugins/jquery.json-2.4.min.js',
    config.dirJsVendors+'/jquery/plugins/jquery.share.js',
    config.dirJsVendors+'/jquery/plugins/jquery.color.plus-names-2.1.2.min.js',
    config.dirJsVendors+'/jquery/plugins/jquery.mCustomScrollbar.js',
    config.dirJsVendors+'/jquery/plugins/jquery.transit.js',
    config.dirJsVendors+'/jquery/plugins/jquery.mousewheel.min.js',
    config.dirJsVendors+'/jquery/plugins/perfect-scrollbar.js',
    config.dirJsVendors+'/jquery/plugins/jquery.scrollTo.js',
    config.dirJsVendors+'/jquery/plugins/icheck.min.js',
    config.dirJsVendors+'/dropzone.js',
    config.dirJsVendors+'/moment.min.js',
    config.dirJsVendors+'/handlebars-v1.1.2.js',
    config.dirJsVendors+'/bootstrap-switch.min.js',
    config.dirJsVendors+'/bootstrap3-typeahead.min.js',
    config.dirJsVendors+'/html2canvas.js',
    config.dirJsVendors+'/bootstrap-colorpalette.js',
    config.dirJsVendors+'/bootstrap-select.min.js',
    config.dirJsVendors+'/bootstrap-table.js',
    config.dirJsVendors+'/bootstrap-table-es-ca-en.min.js',
    config.dirJsVendors+'/extensions/editable/bootstrap-table-editable.js',
    config.dirJsVendors+'/extensions/export/bootstrap-table-export.js',
    config.dirJsVendors+'/extensions/export/tableExport.js',
    config.dirJsVendors+'/extensions/export/jquery.base64.js',
    config.dirJsVendors+'/easeljs-0.8.0.min.js',
    config.dirJsVendors+'/chroma.min.js',
    config.dirJsVendors+'/DateFormat.js',
    config.dirJsVendors+'/iso8601.js'
  ], 'jquery.js');

  pipeline.add([
    config.dirJsVendors+'/leaflet/leaflet-src.js',
    config.dirJsVendors+'/includes.js',
    config.dirJsVendors+'/leaflet/plugin/BoundaryCanvas.js',
    //config.dirJsVendors+'/leaflet/plugin/leaflet.spin.js',
    config.dirJsVendors+'/leaflet/plugin/proj4js-compressed.js',
    config.dirJsVendors+'/leaflet/plugin/proj4leaflet.js',
    config.dirJsVendors+'/leaflet/plugin/epsg.leaflet.js',
    config.dirJsVendors+'/leaflet/plugin/L.Control.Sidebar.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet.ajax.custom.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet.markercluster.js',
    config.dirJsVendors+'/leaflet/plugin/Control.MiniMap.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet-hash.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet-gps.js',
    config.dirJsVendors+'/leaflet/plugin/L.TileLayer.BetterWMS.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet.draw-custom.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet.measurecontrol.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet.awesome-markers-custom.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet-heat_custom.js',
    config.dirJsVendors+'/leaflet/plugin/oms.min.js',
    config.dirJsVendors+'/turf/turf.min.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet.utfgridWMS.js',
    config.dirJsVendors+'/leaflet/plugin/L.Panoramio.js',
    config.dirJsVendors+'/leaflet/plugin/L.Panoramio.custom.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet.label-src.js',
    config.dirJsVendors+'/leaflet/plugin/geojson-vt-dev.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet.timedimension.custom.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet-routing-machine.js',
    config.dirJsVendors+'/leaflet/plugin/lrm-mapzen.js',
    config.dirJsVendors+'/leaflet/plugin/Control.Geocoder.js',
    config.dirJsVendors+'/leaflet/plugin/leaflet-pip.js'
  ], 'leaflet.js');

  pipeline.add([
    config.dirJsInstamaps+'/leaflet/L.IM_ControlLayerManager.js',
    config.dirJsInstamaps+'/leaflet/L.IM_Search.js',
    config.dirJsInstamaps+'/leaflet/L.IM_Map-2.0.0.js',
    config.dirJsInstamaps+'/leaflet/L.IM_ColorLayer.js',
    config.dirJsInstamaps+'/leaflet/L.IM_Coordinates.js',
    config.dirJsInstamaps+'/leaflet/L.IM_OpenInstamapsControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_HomeControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_ShareControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_RoutingControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_SearchControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_SnapshotControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_LikeControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_PrintControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_GeoPdfControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_3DControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_LegendBtnControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_LegendControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_LayersBtnControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_LocationControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_ControlScale.js',
    config.dirJsInstamaps+'/leaflet/L.IM_MinimapControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_LogosControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_WidgetsControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_MapExportControl.js',
    config.dirJsInstamaps+'/leaflet/L.IM_Spin.js',
    config.dirJsInstamaps+'/leaflet/L.Wikipedia.js',
    config.dirJsInstamaps+'/leaflet/L.Twitter.js',
    config.dirJsInstamaps+'/leaflet/L.IM_Label.js',
    config.dirJsInstamaps+'/leaflet/L.IM_PopupManager.js',
    config.dirJsInstamaps+'/geocat.config-1.0.0.js',
    config.dirJsInstamaps+'/geocat.constants.js',
    config.dirJsInstamaps+'/geocat.ajax-1.0.0.js',
    config.dirJsInstamaps+'/geocat.utils.js',
    config.dirJsInstamaps+'/geocat.web-1.0.0.js',
    config.dirJsInstamaps+'/geocat.compartir.js',
    config.dirJsInstamaps+'/instamaps.analytics-2.0.0.js',
    config.dirJsInstamaps+'/geocat.panel-capes.js',
    config.dirJsInstamaps+'/geocat.mapa.draw.js',
    config.dirJsInstamaps+'/geocat.mapa.wms.js',
    config.dirJsInstamaps+'/geocat.mapa.tematics.js',
    config.dirJsInstamaps+'/geocat.mapa.url-file.js',
    config.dirJsInstamaps+'/geocat.mapa.visualitzacioWMS.js',
    config.dirJsInstamaps+'/geocat.mapa.xarxes-socials.js',
    config.dirJsInstamaps+'/geocat.mapa.dades-obertes.js',
    config.dirJsInstamaps+'/geocat.mapa.json.js',
    config.dirJsInstamaps+'/geocat.mapa.heat.js',
    config.dirJsInstamaps+'/geocat.mapa.cluster.js',
    config.dirJsInstamaps+'/geocat.mapa.canvas.js',
    config.dirJsInstamaps+'/geocat.mapa.semaforic.js',
    config.dirJsInstamaps+'/geocat.mapa.basic.js',
    config.dirJsInstamaps+'/geocat.mapa.categories.js',
    config.dirJsInstamaps+'/geocat.mapa.edit-data-table.js',
    config.dirJsInstamaps+'/instamaps.layers-1.0.0.js',
    config.dirJsInstamaps+'/instamaps.wms-1.0.0.js',
    config.dirJsInstamaps+'/geocat.visor.fons.js',
    config.dirJsInstamaps+'/instamaps.mapa.3D-1.0.0.js',
    config.dirJsInstamaps+'/instamaps.visor.visor-2.0.0.js',
    config.dirJsInstamaps+'/instamaps.visor.app-1.0.0.js',
    config.dirJsInstamaps+'/instamaps.geolocal.selectMunicipis.js',
    config.dirJsInstamaps+'/instamaps.geolocal.listViewMunicipis.js',
    config.dirJsInstamaps+'/instamaps.geolocal.widgets.meteo.js',
    config.dirJsInstamaps+'/instamaps.geolocal.widgets.idescat.js',
    config.dirJsInstamaps+'/instamaps.geolocal.widgets.cartoteca.js',
    config.dirJsInstamaps+'/instamaps.geolocal.widgets.rpuc.js',
    config.dirJsInstamaps+'/instamaps.geolocal.widgets.cadastre.js',
    config.dirJsInstamaps+'/instamaps.geolocal.widgets.infoparcela.js',
    config.dirJsInstamaps+'/instamaps.mapa.color-scale.js?v=1.0.0',
    config.dirJsInstamaps+'/instamaps.geolocal.widgets.mascara.js',
    config.dirJsInstamaps+'/instamaps.visor.geolocal.js',
    config.dirJsInstamaps+'/instamaps.visor.simple.js',
    config.dirJsInstamaps+'/instamaps.mapa.color-scale.js',
    config.dirJsInstamaps+'/instamaps.app-1.0.0.js'
  ], 'instamaps.js');

  return pipeline.run(app.addScript);

});

gulp.task('compress', function(cb){
  var paths = config.dirJsInstamaps+config.jsPattern;
  pump([
    gulp.src(paths),
    uglify(),
    gulp.dest(config.distFolder)
  ],function(err) {
    console.log('pipe finished', err)
  });
});

gulp.task('watch', function() {
    gulp.watch(config.dirCssInstamaps+config.cssPattern, ['build+']);
    gulp.watch(config.dirJsInstamaps+config.jsPattern, ['build+']);
});

gulp.task('fonts', function() {
  app.copy(config.dirCssInstamaps+'/fonts/*',config.distFolder+'/fonts')
  .on('end', function() {console.log('finished fonts!')});
  app.copy(config.dirVendors+'/fonts/*',config.distFolder+'/fonts')
  .on('end', function() {console.log('finished fonts!')});
});


gulp.task('images', function() {
  app.copy(config.dirCssInstamaps+'/images/*',config.distFolder+'/css/images')
  .on('end', function() {console.log('finished images!')});
  app.copy(config.srcFolder+'/img/*',config.distFolder+'/img')
  .on('end', function() {console.log('finished images!')});
  app.copy(config.dirCssVendors+'/images/*',config.distFolder+'/css/images')
  .on('end', function() {console.log('finished images!')});
  
});

gulp.task('revreplace', function(){
  runSequence('revreplace_template','revreplace_visor');
});

gulp.task('revreplace_template', function(){
  var manifest = gulp.src(config.revManifestPath);
  return gulp.src(config.templateFolder + "/template_visor.html")
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest(config.distFolder));
});

gulp.task('revreplace_visor', function(){
  var manifest = gulp.src(config.revManifestPath);
  return gulp.src(config.templateFolder + "/visor.html")
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest(config.srcFolder));
});
   
gulp.task('clean', function() {
  del.sync(config.revManifestPath);
  del.sync(config.distFolder+'/css/*');
  del.sync(config.distFolder+'/img/*');
  del.sync(config.distFolder+'/js/*');
  del.sync(config.distFolder+'/fonts/*');
});

gulp.task('build',function(callback){
  runSequence('validateJS', 'clean',
  ['styles','fonts','images','scripts'], 
  callback)
});

gulp.task('build+',function(callback){
  runSequence('build', 'revreplace', callback);
});

gulp.task('validateJS', function() {

  return gulp.src([config.dirJsInstamaps + '/leaflet/*.js',
    config.dirJsInstamaps + '/*.js']
  ).pipe(jsValidate());

});


gulp.task('default', ['clean','styles','fonts','images','scripts','watch']);
