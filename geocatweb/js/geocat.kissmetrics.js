 /**
  * Code snippet to track with kissmetrics
  * */ 
var KM_REFERRER = parent.document.referrer;// Línia a afegir
 var _kmq = _kmq || [];
 var _kmk = _kmk || 'fb9f65f2dd6f9c2790c632b53dd98d18e00d3075';
 function _kms(u){
   setTimeout(function(){
     var d = document, f = d.getElementsByTagName('script')[0],
     s = d.createElement('script');
     s.type = 'text/javascript'; s.async = true; s.src = u;
     f.parentNode.insertBefore(s, f);
   }, 1);
 }
 if (!window.location.host.match(/localhost/)) {
	 _kms('//i.kissmetrics.com/i.js');
	 _kms('//doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js');
}