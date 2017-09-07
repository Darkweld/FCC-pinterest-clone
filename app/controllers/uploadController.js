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
	uploadHotlink.value = uploadLocal.value = title.value = "";
}, false);

preview.addEventListener('error', function(event){
	preview.src = '/public/images/error.png';
	}, false);



clearButton.addEventListener('click',function(event){
	uploadHotlink.value = uploadLocal.value = title.value = "";
	preview.src = '/public/images/placeholder.png';
}, false);

uploadLocal.addEventListener('input', function(event){
	preview.src = URL.createObjectURL(event.target.files[0]);
}, false);

uploadHotlink.addEventListener('input', function(event){
		 return preview.src = uploadHotlink.value;
}, false);

function fadeOut(offset, target){
		target.style.opacity = 1;
		function opacity(t) {
			if (t.style.opacity > 0) {
				setTimeout(function() {
					t.style.opacity -= .025;
					opacity(t);
				}, 100);
			} else {
				t.textContent = "";
			}
		}
		setTimeout(function() {
			opacity(target);
		}, offset);
	}


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
		document.getElementById('noPacity').textContent = "Image Uploaded!";
		fadeOut(1000, document.getElementById('noPacity'));
		uploadHotlink.value = uploadLocal.value = title.value = "";
		preview.src = '/public/images/placeholder.png';
		console.log(data);
	});



}, false);











})();