"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var ReactDOM = require("react-dom");
var mainUrl = "https://whispering-lowlands-73800.herokuapp.com";

var LikeShare = function (_React$Component) {
	_inherits(LikeShare, _React$Component);

	function LikeShare() {
		_classCallCheck(this, LikeShare);

		return _possibleConstructorReturn(this, (LikeShare.__proto__ || Object.getPrototypeOf(LikeShare)).apply(this, arguments));
	}

	_createClass(LikeShare, [{
		key: "render",
		value: function render() {
			var _this2 = this;

			var type = this.props.heart ? "likes" : "shares";
			var imagePath = "/public/images/" + type + ".png";
			var cName = type + "Div";

			return React.createElement(
				"div",
				{ className: cName, onClick: function onClick(e) {
						return _this2.props.clickLikeShare(e, _this2.props.clickType, _this2.props.id);
					} },
				React.createElement(
					"p",
					{ className: "likeShareText" },
					this.props.text
				),
				React.createElement("img", { src: imagePath, className: "likeShareImage" })
			);
		}
	}]);

	return LikeShare;
}(React.Component);

var ImageDiv = function (_React$Component2) {
	_inherits(ImageDiv, _React$Component2);

	function ImageDiv() {
		_classCallCheck(this, ImageDiv);

		return _possibleConstructorReturn(this, (ImageDiv.__proto__ || Object.getPrototypeOf(ImageDiv)).apply(this, arguments));
	}

	_createClass(ImageDiv, [{
		key: "render",
		value: function render() {
			var _this4 = this;

			return React.createElement(
				"div",
				{ className: this.props.big ? "bigImageDiv" : "imageDiv" },
				React.createElement("img", { className: "image", src: this.props.imageSrc, onClick: function onClick(e) {
						return _this4.props.click(e, false, _this4.props.id);
					} }),
				React.createElement(
					"div",
					{ className: "imageDivBottom" },
					React.createElement(
						"p",
						{ className: "imageTitle" },
						this.props.title
					),
					React.createElement(
						"p",
						{ className: "imageTitle", onClick: function onClick(e) {
								_this4.props.userClick(e, _this4.props.createdBy);
							} },
						"By:" + this.props.createdBy
					),
					React.createElement(
						"div",
						{ className: "separator" },
						React.createElement(LikeShare, { heart: true, text: this.props.likes, clickType: "like", clickLikeShare: this.props.click, id: this.props.id }),
						React.createElement(LikeShare, { heart: false, text: this.props.shares, clickType: "share", clickLikeShare: this.props.click, id: this.props.id })
					)
				)
			);
		}
	}]);

	return ImageDiv;
}(React.Component);

var Overlay = function (_React$Component3) {
	_inherits(Overlay, _React$Component3);

	function Overlay() {
		_classCallCheck(this, Overlay);

		return _possibleConstructorReturn(this, (Overlay.__proto__ || Object.getPrototypeOf(Overlay)).apply(this, arguments));
	}

	_createClass(Overlay, [{
		key: "render",
		value: function render() {

			return React.createElement(
				"div",
				{ className: "dimmer", onClick: this.props.bigClick },
				React.createElement(
					"div",
					{ className: "bigDivHolder" },
					this.props.image,
					React.createElement(
						"div",
						{ className: "shareLinksDiv" },
						React.createElement(
							"p",
							{ className: "profileText" },
							"Link to share image with friends!"
						),
						React.createElement(
							"a",
							{ className: "profileLink", href: this.props.link },
							this.props.link
						)
					)
				)
			);
		}
	}]);

	return Overlay;
}(React.Component);

var Main = function (_React$Component4) {
	_inherits(Main, _React$Component4);

	function Main() {
		_classCallCheck(this, Main);

		var _this6 = _possibleConstructorReturn(this, (Main.__proto__ || Object.getPrototypeOf(Main)).call(this));

		_this6.setOwnership = function (e, v) {
			return _this6.setState({ ownership: v || null });
		};

		_this6.setBig = function (e) {
			return _this6.setState({ big: null });
		};

		_this6.state = { data: [], ownership: null, big: window.location.hash.slice(1) || null };

		_this6.setOwnership = _this6.setOwnership.bind(_this6);
		_this6.imageClick = _this6.imageClick.bind(_this6);
		_this6.fetchData = _this6.fetchData.bind(_this6);
		_this6.setBig = _this6.setBig.bind(_this6);
		return _this6;
	}

	_createClass(Main, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			//window.location.hash.length ?? could use this to determine image to link..

			return this.fetchData();
		}
	}, {
		key: "fetchData",
		value: function fetchData() {
			var _this7 = this;

			//I realize reusing this for the likes and shares is not ideal, but I will have to reformat the back-end another time.

			fetch(mainUrl + "/indexImages").then(function (response) {
				return response.json();
			}).then(function (data) {
				if (data.error) alert(data.error);
				console.log(data);
				return _this7.setState({ data: data });
			});
		}
	}, {
		key: "imageClick",
		value: function imageClick(e, likeShare, id) {
			var _this8 = this;

			e.stopPropagation();

			if (!likeShare) {
				this.setState({ big: id });

				//document click off 
			} else {
				fetch(mainUrl + "/" + likeShare + "/" + id, { method: "POST" }).then(function (response) {
					return response.json();
				}).then(function (data) {

					if (data.error) return alert(data.error);
					_this8.fetchData();
				});
			}
		}
	}, {
		key: "render",
		value: function render() {
			var _this9 = this;

			var ownership = this.state.ownership ? this.state.ownership + "'s" : "All";
			var button = this.state.ownership ? React.createElement(
				"button",
				{ className: "indexButton", onClick: this.setOwnership },
				"Return to all images"
			) : null;
			var big = null;
			var ownArray = this.state.ownership ? this.state.data.filter(function (v) {
				return v.creator.localUsername === _this9.state.ownership;
			}) : this.state.data;

			var datArray = ownArray.map(function (v) {

				var c = React.createElement(ImageDiv, { key: v._id, title: v.imageTitle, imageSrc: v.localImagePath, shares: v.shares,
					likes: v.likes.length || 0, createdBy: v.creator.localUsername, click: _this9.imageClick, id: v._id,
					userClick: _this9.setOwnership });

				if (v._id === _this9.state.big) big = React.createElement(Overlay, { image: c, link: mainUrl + "/#" + v._id, bigClick: _this9.setBig });
				return c;
			});

			return React.createElement(
				"div",
				{ className: "indexContainer" },
				big,
				React.createElement(
					"h1",
					null,
					" ",
					ownership,
					" Images "
				),
				button,
				React.createElement(
					"div",
					{ className: "imageContainer" },
					datArray
				)
			);
		}
	}]);

	return Main;
}(React.Component);

ReactDOM.render(React.createElement(Main, null), document.getElementById("root"));
