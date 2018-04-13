"use strict";

class LikeShare extends React.Component {
	
	render () {
		let imageType = (this.props.heart) ? "likes.png" : "shares.png"

		return (
			<div className = "likeShare">
			    <p className = "likeShareText">
				{this.props.text}
				</p>
			</div>
		
		)
		
	}
	
}



class ImageDiv extends React.Component {
	
	render () {
		let reshared = (this.props.shared) ? <likeShare heart = false text = {this.props.sharedBy} /> : null;
		
		return (
		<div className = "imageDiv">
		    {reshared}
			<img className = "image" src = {this.props.imageSrc}></img>
			<div className = "imageDivBottom">
				<p className = "imageTitle">
				<div className = "separator">
					<LikeShare heart = true text = {this.props.likes}>
					<LikeShare heart = false text = {this.props.shares}>
				</div>
			</div>
		
		</div>
		)
	}
}

class Overlay extends React.Component {
	
	render () {
		
		return (
		
		)
	}
}

class Main extends React.Component {
	constructor() {
		super();
		this.state = {data :[]};
	}
	
	didComponentMount() {
		
		
		
	}
	
	let ownership = (this.state.ownership) ? this.state.ownership : "All";
	
	
	render () {
		
		return (
		<div className = "indexContainer">
			<h1> {ownership} Images </h1>
		
		
			<div className = "imageContainer">
			
			</div>
		
		</div>
		)
	}
}
