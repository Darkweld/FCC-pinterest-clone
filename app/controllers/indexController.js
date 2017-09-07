'use strict';

(function(){
var imageContainer = document.getElementById('Pictures');
var indexContainer = document.getElementById('indexContainer');
var buttonContainer = document.getElementById('buttonContainer');
var imageLabel = document.getElementById('imageLabel');

function createImages(array){

	return new Promise(function(resolve, reject) {

	var fragment = new DocumentFragment();

	for (var i = 0, l = array.length - 1; l >= i; l--){

		var imageDiv = document.createElement('div');
		imageDiv.className = "imageDiv";
		imageDiv.id = array[l]._id;


		var username = document.createElement('p');
		username.className = 'username';
		username.textContent = array[l].creator.localUsername;

		var shares = document.createElement('img');
		shares.src = "/public/images/shares.png";
		shares.className = "shares";

		if (array[l].original) {
		var reshareTop = document.createElement('div');
		reshareTop.className = "reshareDiv";
		reshareTop.appendChild(shares.cloneNode());

		var newUsername = username.cloneNode();
		newUsername.textContent = array[l].originalUsername;
		reshareTop.appendChild(newUsername);
		imageDiv.appendChild(reshareTop);
		}

		imageDiv.appendChild(username);


		var image = document.createElement('img');
		image.className = "image";
		image.src = array[l].localImagePath;
		imageDiv.appendChild(image);

		var title = document.createElement('p');
		title.textContent = array[l].imageTitle;
		(array[l].imageTitle.length > 15) ? title.className = "imageTitle" : title.className = "smallImageTitle";
		imageDiv.appendChild(title);

		var likesDiv = document.createElement('div');
		likesDiv.className = "likesDiv";

		var likes = document.createElement('img');
		likes.src = "/public/images/likes.png";
		likes.className = "likes";
		likesDiv.appendChild(likes);

		var likesText = document.createElement('p');
		likesText.textContent = array[l].likes.length || 0;
		likesText.className = "likesText";
		likesDiv.appendChild(likesText);

		var sharesDiv = document.createElement('div');
		sharesDiv.className = "sharesDiv";

		sharesDiv.appendChild(shares);

		var sharesText = document.createElement('p');
		sharesText.textContent = array[l].shares;
		sharesText.className = 'sharesText';
		sharesDiv.appendChild(sharesText);

		var separator = document.createElement('div');
		separator.className = 'separator';
		separator.appendChild(likesDiv);
		separator.appendChild(sharesDiv);

		imageDiv.appendChild(separator);

		fragment.appendChild(imageDiv);
	}

	resolve(fragment);
});

};

function get(urlAffix, hash){
xhttp.request('GET', mainUrl + urlAffix, function(data){
		var data = JSON.parse(data);
		if (data.error) return alert(data.error);
	
		createImages(data).then(function(newData) {
			while (imageContainer.hasChildNodes()){
		imageContainer.removeChild(imageContainer.firstChild);
		}
			imageContainer.appendChild(newData);

			if (hash) {
				if (document.getElementById(hash)) {
					singleImage(document.getElementById(hash));
					return window.location.hash = "";
				}
				return alert('Invalid image URL');
			}
		}).catch(function(reject){
			alert(reject);
		});
	});

};
function usernameAppend(value) {
	get('/getUsernameImages/' + value);

	imageLabel.textContent = value + "'s images";

	while (buttonContainer.hasChildNodes()) {
		buttonContainer.removeChild(buttonContainer.firstChild);
	}

	var backButton = document.createElement('button');
	backButton.textContent = "Show all images";
	backButton.className = "button";
	backButton.addEventListener('click', function(e){
	buttonContainer.removeChild(backButton);
	get('/indexImages');
	imageLabel.textContent = "All images";
	}, false)

	buttonContainer.appendChild(backButton);
}

function singleImage(target) {

	var children = imageContainer.childNodes;

	var num;

	for (var i = 0, l = children.length; i < l; i++){
		if (children[i] === target) {
			num = i;
			break;
		}
	}


	target.className = 'bigProfileDiv';
	var dimmer = document.createElement('div');
	dimmer.className = 'dimmer';
	imageContainer.appendChild(dimmer);

	var bigDivHolder = document.createElement('div');
	bigDivHolder.className = 'bigDivHolder';
	bigDivHolder.appendChild(target);

	var shareLinksDiv = document.createElement('div');
	shareLinksDiv.className = "shareLinksDiv";

	var inputLabel = document.createElement('p');
	inputLabel.textContent = "Link to share image with friends!";
	shareLinksDiv.appendChild(inputLabel);

	var shareLinksInput = document.createElement('input');
	shareLinksInput.className = 'profileInput';

	var actualLink = document.createElement('a');
	actualLink.textContent = 'Link';
	actualLink.className = 'profileLink';
	actualLink.href = shareLinksInput.value = mainUrl + '/#' + target.id;

	shareLinksDiv.appendChild(shareLinksInput);
	shareLinksDiv.appendChild(actualLink);

	bigDivHolder.appendChild(shareLinksDiv);
	imageContainer.appendChild(bigDivHolder);

	window.scroll(0,0);

	function addClick(event){

		if (!bigDivHolder.contains(event.target) || target === event.target || bigDivHolder === event.target){
			imageContainer.removeChild(dimmer);
			target.className = "imageDiv";
			imageContainer.insertBefore(target, imageContainer.children[num]);
			imageContainer.removeChild(bigDivHolder);
			document.removeEventListener('click', addClick);
		}
	}
	document.addEventListener('click', addClick);
}


	
	imageContainer.addEventListener('click', function(event){
		console.log(event.target.parentNode.className);
		switch(event.target.className){
			case "imageDiv":
			event.stopPropagation();
			singleImage(event.target)
			break;
			case "likesDiv":
				xhttp.request('POST', mainUrl + '/like/' + event.target.parentNode.parentNode.id, function(likeData){
					var likeData = JSON.parse(likeData);
					if (likeData.error) return alert(likeData.error);
					return event.target.getElementsByTagName('p')[0].textContent = likeData.likes;
				});
				break;

			case "sharesDiv":
			xhttp.request('POST', mainUrl + '/share/' + event.target.parentNode.parentNode.id, function(shareData){
				var shareData = JSON.parse(shareData);
				if (shareData.error) return alert(shareData.error);
				if (event.target.parentNode.parentNode.className === "bigProfileDiv") document.body.click();
				get('/indexImages', shareData.newId);
				});
				break;

			case "username":
			if (event.target.parentNode.className === "bigProfileDiv") document.body.click();
			usernameAppend(event.target.textContent);
			break;
		}

	}, false)

	function fadeOut(offset, target){
		target.style.opacity = 1;
		function opacity(t) {
			if (t.style.opacity > 0) {
				setTimeout(function() {
					t.style.opacity -= .025;
					opacity(t);
				}, 100);
			} else {
				t.style.display = "none";
				if (!indexContainer.style.marginTop) {
					indexContainer.style.marginTop = "15%";
				} else {
					buttonContainer.style.height = "5vh";
				}
			}
		}
		setTimeout(function() {
			opacity(target);
		}, offset);
	}

	document.addEventListener('DOMContentLoaded', function (event){
		fadeOut(1500, document.getElementById('indexTitle'));
		fadeOut(4500, document.getElementById('Instructions'));
		if (window.location.hash.length) {
			var image = window.location.hash.slice(1, window.location.hash.length);
			return get('/indexImages', image);
		}
		get('/indexImages');
	});


})();