'use strict';


(function(){
var mainContainer = document.getElementById('uploadPageContainer');
var form = document.getElementById('uploadForm');
var uploadLocal = document.getElementById('uploadLocal');
var uploadHotlink = document.getElementById('uploadHotlink');
var dividerContainerUpload = document.getElementById('dividerContainerUpload');
var url;


uploadLocal.addEventListener('input', function(event){
	if (form.contains(uploadHotlink)) {
		dividerContainerUpload.className = "dividerContainerNoFlex";
		dividerContainerUpload.removeChild(uploadHotlink.parentNode);
		url = mainUrl + '/uploadLocal';
	}
	if (document.getElementById('preview')) return document.getElementById('preview').src = URL.createObjectURL(event.target.files[0]);
	var preview = document.createElement('img');
	preview.className = 'preview'
	preview.id = 'preview';
	preview.src = URL.createObjectURL(event.target.files[0]);
	preview.addEventListener('error', function(event){
	document.getElementById('preview').src = '/public/images/error.png';
	}, false);
	return uploadPageContainer.insertBefore(preview, form);

}, false)
uploadHotlink.addEventListener('input', function(event){
	if (form.contains(uploadLocal)) {
		dividerContainerUpload.className = "dividerContainerNoFlex";
		dividerContainerUpload.removeChild(uploadLocal.parentNode);
		url = mainUrl + '/upload';
	}
	if (document.getElementById('preview')) return document.getElementById('preview').src = uploadHotlink.value;

	var preview = document.createElement('img');
	preview.className = 'preview'
	preview.id = 'preview';
	preview.src = uploadLocal.value;
	preview.addEventListener('error', function(e){
	document.getElementById('preview').src = '/public/images/error.png';
	}, false);
	return uploadPageContainer.insertBefore(preview, form);

}, false)

form.addEventListener('submit', function(event){
	event.preventDefault();
	var formdata = new FormData(form);

	if (!url) return alert('You must submit an image to upload.');

	xhttp.upload('POST', url, formdata, function(data){
		var data = JSON.parse(data);
		if (data.error) return alert(data.error);
		console.log(data);
	});



}, false);











})();