'use strict';


(function() {
    var profileImageText = document.getElementById('profileImageText');
    var main = document.getElementById('imageContainer');
	function profilePage(data) {


        for (var i in data.tokens) {
            var capital = i.substr(0,1).toUpperCase() + i.substr(1, i.length);
            document.getElementById(i).href = mainUrl + "/unlink/" + i;
            document.getElementById(i + "-text").innerHTML = "Unlink " + capital;
        }
         
         
}

function click(target) {
	var children = profileImageContainer.childNodes;

	var num;

	for (var i = 0, l = children.length; i < l; i++){
		if (children[i].id === target.id) {
			num = i;
			break;
		}
	}


	target.className = 'bigProfileDiv';
	var dimmer = document.createElement('div');
	dimmer.className = 'dimmer';
	profileImageContainer.appendChild(dimmer);

	var bigDivHolder = document.createElement('div');
	bigDivHolder.className = 'bigDivHolder';
	bigDivHolder.appendChild(target);

	var dividerColumn = document.createElement('div');
	dividerColumn.className = "dividerColumn";

	var shareLinksDiv = document.createElement('div');
	shareLinksDiv.className = "profileLinksDiv";

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

	var deleteDiv = document.createElement('div');
	deleteDiv.className = "deleteLinksDiv";

	var deleteButton = document.createElement('button');
	deleteButton.className = "deleteButton";
	deleteButton.textContent = "Delete image";
	deleteButton.addEventListener('click', function(e){
		xhttp.request('DELETE', mainUrl + '/deleteImage/' + target.id, function(d) {
			var d = JSON.parse(d);
			if (d.error) alert (d.error);
			xhttp.request('GET', mainUrl + '/getUser', function(arr){
			var arr = JSON.parse(arr);
			while (profileImageContainer.hasChildNodes()){
				profileImageContainer.removeChild(profileImageContainer.firstChild);
			}
			document.removeEventListener('click', addClick);
			if (arr.images.length) {
			 createImages(arr.images);
			 return window.scroll(0, document.body.scrollHeight);
			}
			main.removeChild(document.getElementById('pagination'));
			window.scroll(0, document.body.scrollHeight);
			return profileImageText.textContent = "You do not have any images";
			});

		});
	}, false);
	deleteDiv.appendChild(deleteButton);

	dividerColumn.appendChild(shareLinksDiv);
	dividerColumn.appendChild(deleteDiv);

	bigDivHolder.appendChild(dividerColumn);
	profileImageContainer.appendChild(bigDivHolder);
	window.scroll(0,0);

	function addClick(event){

		if (!bigDivHolder.contains(event.target) || target === event.target || bigDivHolder === event.target){
			profileImageContainer.removeChild(dimmer);
			target.className = "profileImageDiv";
			profileImageContainer.insertBefore(target, profileImageContainer.children[num]);
			profileImageContainer.removeChild(bigDivHolder);
			window.scroll(0, profileImageContainer.scrollHeight);
			document.removeEventListener('click', addClick);
		}
	}
	document.addEventListener('click', addClick);

}



function createImages(array, page){
	var fragment = new DocumentFragment();
	if (document.getElementById('pagination')) main.removeChild(document.getElementById('pagination'));
	var pagination = document.createElement('div');
	pagination.className = "pagination";
	pagination.id = 'pagination';
	profileImageText.textContent = "Your Images";

	for (var i = 0, l = array.length; i < l; i++){

		var imageDiv = document.createElement('div');
		imageDiv.className = "profileImageDiv";
		imageDiv.id = array[i]._id;


		var username = document.createElement('p');
		username.className = 'username';
		username.textContent = array[i].creator.localUsername;

		var shares = document.createElement('img');
		shares.src = "/public/images/shares.png";
		shares.className = "shares";

		if (array[i].original) {
		var reshareTop = document.createElement('div');
		reshareTop.className = "reshareDiv";
		reshareTop.appendChild(shares.cloneNode());

		var newUsername = username.cloneNode();
		newUsername.textContent = array[i].originalUsername;
		reshareTop.appendChild(newUsername);
		imageDiv.appendChild(reshareTop);
		}

		imageDiv.appendChild(username);


		var image = document.createElement('img');
		image.className = "image";
		image.src = array[i].localImagePath;
		imageDiv.appendChild(image);

		var title = document.createElement('p');
		title.textContent = array[i].imageTitle;
		title.className = "imageTitle";
		imageDiv.appendChild(title);

		var likesDiv = document.createElement('div');
		likesDiv.className = "likesDiv";

		var likes = document.createElement('img');
		likes.src = "/public/images/likes.png";
		likes.className = "likes";
		likesDiv.appendChild(likes);

		var likesText = document.createElement('p');
		likesText.textContent = array[i].likes.length || 0;
		likesText.className = "likesText";
		likesDiv.appendChild(likesText);

		var sharesDiv = document.createElement('div');
		sharesDiv.className = "sharesDiv";

		sharesDiv.appendChild(shares);

		var sharesText = document.createElement('p');
		sharesText.textContent = array[i].shares;
		sharesText.className = 'sharesText';
		sharesDiv.appendChild(sharesText);

		var separator = document.createElement('div');
		separator.className = 'separator';
		separator.appendChild(likesDiv);
		separator.appendChild(sharesDiv);

		imageDiv.appendChild(separator);


		fragment.appendChild(imageDiv);
		if (i === 4 || i === (l - 1)) {
			var link = document.createElement("p");
			link.className = "paginationLink";
			var profileImageContainer = document.createElement('div');
			profileImageContainer.className = 'profileImageContainer';
			profileImageContainer.id = "profileImageContainer";
			profileImageContainer.appendChild(fragment);
			profileImageContainer.addEventListener('click',function (ev){
				if (ev.target.className === "profileImageDiv") {
						ev.stopPropagation();
						click(ev.target);
					}
				}, false);
			(function(link, div){
				link.addEventListener('click', function(event){
					if (document.getElementById('profileImageContainer')) main.removeChild(document.getElementById('profileImageContainer'));
					var children = pagination.childNodes;
					for (var k = 0; k < children.length; k++){
						children[k].classList.remove('paginationLinkActive');
					}
					link.classList.add('paginationLinkActive');
					main.appendChild(div);
				}, false);
			})(link, profileImageContainer)
			pagination.appendChild(link);
			link.textContent = pagination.childNodes.length;
		}

	}
	main.appendChild(pagination);
	pagination.children[0].click();
}





	var recieveprofileUrl = mainUrl + "/getUser";
	xhttp.request("GET", recieveprofileUrl, function(data){
			var data = JSON.parse(data);
			profilePage(data);
			if (data.images.length) return createImages(data.images);
			return profileImageText.textContent = "You do not have any images";
	});















    
    
    
    
    
    
    
    
    
    
    
})();