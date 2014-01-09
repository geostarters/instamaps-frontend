//var crs25831
L.CRS.EPSG25831 = L.CRS.proj4js('EPSG:25831', '+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs',
		//new L.Transformation(0.5 / (Math.PI * L.Projection.Mercator.R_MAJOR), 0.5, -0.5 / (Math.PI * L.Projection.Mercator.R_MINOR), 0.5),
		new L.Transformation(1, -258000, -1, 4766600),
		
		{
	/*
	new L.Transformation(0.5 / (Math.PI * L.Projection.Mercator.R_MAJOR),
			             0.5, -0.5 / (Math.PI * L.Projection.Mercator.R_MINOR), 0.5),
		*/	 
	scale:function(zoom) {
        return 1 / (1100 / Math.pow(2, zoom));
	},
	resolutions : [1100, 550, 275, 100, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0.1]}	

);

//var crs23031 
L.CRS.EPSG23031 = L.CRS.proj4js('EPSG:23031', "+proj=utm +zone=31 +ellps=intl +towgs84=-136.65549,-141.46580,-167.29848,-2.09308759,-0.00140548839,-0.107708594,1.000011546110 +units=m +no_defs",		
		L.Transformation(1, 0, -1, 0),
		{origin:[258000, 4485000, 536000, 4752000],
		/*
		new L.Transformation(0.5 / (Math.PI * L.Projection.Mercator.R_MAJOR),
				             0.5, -0.5 / (Math.PI * L.Projection.Mercator.R_MINOR), 0.5),
			*/	             
		resolutions : [1100, 550, 275, 100, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0.1]}		             
);



/*

new L.Proj.CRS('EPSG:2400',
  '+lon_0=15.808277777799999 +lat_0=0.0 +k=1.0 +x_0=1500000.0 ' +
  '+y_0=0.0 +proj=tmerc +ellps=bessel +units=m ' +
  '+towgs84=414.1,41.3,603.1,-0.855,2.141,-7.023,0 +no_defs',
  {
    resolutions: [8192, 4096, 2048], // 3 example zoom level resolutions
  }
);


new L.Proj.CRS('EPSG:3006',
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  {
    origin: [218128.7031, 6126002.9379],
    resolutions: [8192, 4096, 2048], // 3 example zoom level resolutions
  }
);

// EPSG:102012 served by TMS with bounds (-5401501.0, 4065283.0, 4402101.0, 39905283.0)
new L.Proj.CRS.TMS('EPSG:102012',
    '+proj=lcc +lat_1=30 +lat_2=62 +lat_0=0 +lon_0=105 +x_0=0 +y_0=0 '
    + '+ellps=WGS84 +datum=WGS84 +units=m +no_defs',
    [-5401501.0, 4065283.0, 4402101.0, 39905283.0],
    {
        resolutions: [
           140000.0000000000,
            70000.0000000000,
            35000.0000000000,
            17500.0000000000
        ]
    }
);

*/