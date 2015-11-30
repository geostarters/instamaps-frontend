/**
 * 
 */
  var _gaq = _gaq || [];
//Diferenciem entre usuari Geolocal i Instamaps
  if (isGeolocalUser()) _gaq.push(['_setAccount', 'UA-46332195-6']);
  else  _gaq.push(['_setAccount', 'UA-46332195-3']);

  
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

