function loadGaleria(params){
	return jQuery.ajax({
		url: paramUrl.getAllMapsByUser,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}

function loadPublicGaleria(){
	return jQuery.ajax({
		url: paramUrl.getAllPublicsMaps,
  		dataType: 'jsonp'
	}).promise();
}

function deleteMap(data){
	return jQuery.ajax({
		url: paramUrl.deleteMap,
		data: data,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

/* registre.html */

function registerUser(url, dataUrl){
	 return jQuery.ajax({
			url: url,
			data: dataUrl,
			method: 'post',
			dataType: 'jsonp'
			}).promise();		
}

function checkUsername(username){
	  return jQuery.ajax({
			url: paramUrl.validateUsername,
			data: {uid:username},
			method: 'post',
			dataType: 'jsonp'
		}).promise();
		
}

function checkEmail(user_email){
	  return jQuery.ajax({
			url: paramUrl.validateEmail,
			data: {email: user_email},
			method: 'post',
			dataType: 'jsonp'
		}).promise();
		
}

/* sessio.html */

function doLogin(user_login,pass_login){
	return jQuery.ajax({
		url: paramUrl.loginUser,
		data: {user:user_login, password:pass_login},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

/* perfil.html */

function getUserData(username){
	return jQuery.ajax({
		url: paramUrl.getUser,
		data: {uid : username},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function updateUserData(username, name, surname, correu_usuari){
	return jQuery.ajax({
		url: paramUrl.updateUser,
		data: {
            cn: name,
            sn: surname,
            uid: username,
            email: correu_usuari},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function updateUserPassword(username, new_pass, old_pass){
	alert("updateUserPassword");
	return jQuery.ajax({
		url: paramUrl.updatePassword,
		data: {
            uid: username, 
            userPassword: old_pass, 
            newPassword: new_pass},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

/* comuns */

function doLogout(){
	return jQuery.ajax({
		url: paramUrl.logoutUser,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

/* sessio.html */

function doLogin(user_login,pass_login){
	return jQuery.ajax({
		url: paramUrl.loginUser,
		data: {user:user_login, password:pass_login},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

/* perfil.html */

function getUserData(username){
	return jQuery.ajax({
		url: paramUrl.getUser,
		data: {uid : username},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function updateUserData(username, name, surname, correu_usuari){
	return jQuery.ajax({
		url: paramUrl.updateUser,
		data: {
            cn: name,
            sn: surname,
            uid: username,
            email: correu_usuari},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function updateUserPassword(username, new_pass, old_pass){
	alert("updateUserPassword");
	return jQuery.ajax({
		url: paramUrl.updatePassword,
		data: {
            uid: username, 
            userPassword: old_pass, 
            newPassword: new_pass},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

