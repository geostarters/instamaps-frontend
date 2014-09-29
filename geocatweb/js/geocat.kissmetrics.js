 /**
  * Code snippet to track with kissmetrics
  * */ 

//MODIFICAR AMB EL CODE SNIPPET QUE ET DONEN A LA PÀGINA QUANF AS L'ALTA
 var _kmq = _kmq || [];
 var _kmk = _kmk || 'foo';//AQUI VA LA KEY AL FER L'ALTA
 function _kms(u){
   setTimeout(function(){
     var d = document, f = d.getElementsByTagName('script')[0],
     s = d.createElement('script');
     s.type = 'text/javascript'; s.async = true; s.src = u;
     f.parentNode.insertBefore(s, f);
   }, 1);
 }
 _kms('//i.kissmetrics.com/i.js');
 _kms('//doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js');