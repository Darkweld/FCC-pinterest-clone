"use strict";

class LikeShare extends React.Component {
	
	render () {
		let imageType = (this.props.heart) ? "likes.png" : "shares.png"
		let clickType = (this.props.userClick) true : false;
		
		return (
			<div className = "likeShare" onClick = {(e) => clicktype(e, clickType, this.props.val)}>
			    <p className = "likeShareText">
				{this.props.text}
				</p>
			</div>
		
		)
		
	}
	
}



class ImageDiv extends React.Component {
	
	render () {
		return (
		<div className = {(this.props.big) ? "imageDiv" : "bigImageDiv"}>
		    {reshared}
			<img className = "image" src = {this.props.imageSrc} onClick = {(e) => this.props.click(e, false, this.props.index)}></img>
			<div className = "imageDivBottom">
				<p className = "imageTitle">
				<div className = "separator">
					<LikeShare heart = true text = {this.props.likes} />
					<LikeShare heart = false text = {this.props.shares} />
				</div>
			</div>
		
		</div>
		)
	}
}

class Overlay extends React.Component {
	
	render () {
		
		return (
		<div class = "dimmer">
			<div class = "bigDivHolder">
				{this.props.image}
				
				<div class="shareLinksDiv">
				<p>Link to share image with friends!</p>
				<input class="profileInput"><a className="profileLink" href={this.props.link}>Link</a>
				</div>
			</div>
		
		</div>
		
		
		
		)
	}
}

class Main extends React.Component {
	constructor() {
		super();
		this.state = {data :[] ownership: null, big: null};
		
		this.setOwnership = this.setOwnership.bind(this);
		this.imageClick = this.imageClick.bind(this);
	}
	
	didComponentMount() {
		
		//window.location.hash.length ?? could use this to determine image to link..
		
		fetch(mainUrl  + "/indexImages")
		.then(response => response.json())
		.then(data => {	
			if (data.error) alert(data.error);
			this.setState({data: data})
		});
	}
	
}
	
	
	setOwnership(e) {
		this.setState({ownership: null});	
	}
	imageClick(e,  likeShare, id) {
		e.stopPropagation();
		
		if (!likeShare) {
			this.setState({big: id});
			
			//document click off 
		}
		
	}
	
	
	render () {
		
		let ownership = (this.state.ownership) ? this.state.ownership : "All";
		let button = (ownership) ? <button onClick = this.setOwnership></button> : null; 
		let big = null;
		let datArray = this.state.data.map((v, i) => {
			let c = <ImageDiv title = {v.imageTitle} imageSrc = {v.localImagePath} shares = {v.shares} 
		likes = {v.likes.length || 0} reshared = {v.originalUsername || null} createdBy = {v.creator} id = {v._id}
		click = this.imageClick />
			
			if (v._id === this.state.big) big = <Overlay image = {c} link = {mainurl + "/#" + v._id} />
			return c;
		})
		return (
		<div className = "indexContainer">
			<h1> {ownership} Images </h1>
				{button}
		
			<div className = "imageContainer">
			
			</div>
		
		</div>
		)
	}
}
