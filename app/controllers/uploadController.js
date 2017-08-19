'use strict';


(function(){
var mainContainer = document.getElementById('uploadPageContainer');
var form = document.getElementById('uploadForm');
var uploadLocal = document.getElementById('uploadLocal');
var uploadHotlink = document.getElementById('uploadHotlink');
var title = document.getElementById('Title');
var clearButton = document.getElementById('Clear');
var dividerContainerUpload = document.getElementById('dividerContainerUpload');
var preview = document.getElementById('Preview');

document.addEventListener('DOMContentLoaded', function(event){
	uploadHotlink.value = uploadLocal.value = "";
}, false);

preview.addEventListener('error', function(event){
	document.getElementById('preview').src = '/public/images/error.png';
	}, false);



clearButton.addEventListener('click',function(event){
	uploadLocal.value = uploadHotlink.value = "";
	preview.src = '/public/images/error.png';
}, false);

uploadLocal.addEventListener('input', function(event){
	preview.src = URL.createObjectURL(event.target.files[0]);
}, false);

uploadHotlink.addEventListener('input', function(event){
	preview.src = uploadHotlink.value;
}, false);

form.addEventListener('submit', function(event){
	event.preventDefault();

	var formdata = new FormData();
	formdata.append("title", title.value);
	if (uploadHotlink.value && uploadLocal.value) return alert('You may not submit two images at once.')

	var url;

	if (uploadLocal.value) { 
			url = mainUrl + '/uploadLocal', formdata.append('uploadLocal', uploadLocal.files[0]);
		} else {
			url = mainUrl + '/upload',formdata.append('uploadHotlink', uploadHotlink.value);
		}

	xhttp.upload('POST', url, formdata, function(data){
		var data = JSON.parse(data);
		if (data.error) return alert(data.error);
		uploadHotlink.value = uploadLocal.value = "";
		console.log(data);
	});



}, false);











})();