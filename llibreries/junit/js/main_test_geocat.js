<<<<<<< HEAD
require.config({
    baseUrl: 'js',
    paths: {
        'jquery': '//code.jquery.com/jquery-2.0.2.min',
        'QUnit': '//code.jquery.com/qunit/qunit-1.12.0',
        'uri': 'jsv_requirejs/uri/',
        'jsv': 'jsv_requirejs/jsv',
        'draft': 'jsv_requirejs/json-schema-draft-03',
    },
    shim: {
    	'QUnit': {
    		exports: 'QUnit',
    		init: function(){
    			QUnit.config.autoload = false;
                QUnit.config.autostart = false;
                QUnit.config.reorder = false;
    		}
    	}
    }
});

//require the unit tests.
require(['jquery', 'QUnit', 'jsv', 'draft', 'modules/ajaxUrl', 
         'modules/login', 'modules/admin', 'modules/social', 'modules/aplications',
         'modules/servidors', 'modules/layers', 'modules/logout']
,function(Qunit, JSVExports){
	
	console.debug(JSVExports);
	
	var JSV = JSVExports.JSV;
	var env = JSV.createEnvironment();
	
	loginTest();
	
	adminTest();
	
	// start QUnit.
    QUnit.load();
    QUnit.start();
    
    
    
=======
require.config({
    baseUrl: 'js',
    paths: {
        'jquery': '//code.jquery.com/jquery-2.0.2.min',
        'QUnit': '//code.jquery.com/qunit/qunit-1.12.0',
        'uri': 'jsv_requirejs/uri/',
        'jsv': 'jsv_requirejs/jsv',
        'draft': 'jsv_requirejs/json-schema-draft-03',
    },
    shim: {
    	'QUnit': {
    		exports: 'QUnit',
    		init: function(){
    			QUnit.config.autoload = false;
                QUnit.config.autostart = false;
                QUnit.config.reorder = false;
    		}
    	}
    }
});

//require the unit tests.
require(['jquery', 'QUnit', 'jsv', 'draft', 'modules/ajaxUrl', 
         'modules/login', 'modules/admin', 'modules/social', 'modules/aplications',
         'modules/servidors', 'modules/layers', 'modules/logout']
,function(Qunit, JSVExports){
	
	console.debug(JSVExports);
	
	var JSV = JSVExports.JSV;
	var env = JSV.createEnvironment();
	
	loginTest();
	
	adminTest();
	
	// start QUnit.
    QUnit.load();
    QUnit.start();
    
    
    
>>>>>>> branch 'master' of git@montmajor.icc.local:v.pascual/geocatonline.git
});
