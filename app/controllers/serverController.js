'use strict';

var User = require('../models/user');
var Images = require('../models/images');
var request = require('request');
var FormData = require('form-data');

function server (passport) {
	this
		.checkTokens = function(req, res){
			var obj = (req.user).toObject();
		if	(obj.tokens) return res.render('profile', { user: req.user });
		req.logout();
		return res.redirect('/login');
		};
    this
        .githubRoute = passport.authenticate('github');
    
    this
        .githubCallback = passport.authenticate('github', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .googleRoute = passport.authenticate('google', { scope: ['profile'] });
	    
	this
	    .googleCallback = passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .twitterRoute = passport.authenticate('twitter');
	    
	this
	    .twitterCallback = passport.authenticate('twitter', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .facebookRoute = passport.authenticate('facebook');
	    
	this
	    .facebookCallback = passport.authenticate('facebook', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this.unlinkGithub = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.github = undefined;
			currentUser.save(function(err,doc){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkGoogle = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.google = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkTwitter = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.twitter = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkFacebook = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.facebook = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	this.deleteAccount = function(req, res) {
		User
			.findByIdAndRemove({'_id': req.user._id})
			.exec(function(err, doc){
				if (err) throw err;
				res.redirect('/index');
			});
	};
	this.userPage = function(req, res) {
		User
			.findOne(req.user._id)
			.exec(function(err, doc){
				if (err) throw err;
						res.json(doc)
			})
	}; 
	this.uploadPage = function(req, res){
		res.render('upload', {user: req.user})
	}

	this.uploadImage = function(req, res){
		console.log(req.file);
		console.log(req.body);
		res.json({'query': 'completed'});
	
	};
	this.convertImage = function(req, res){

		if (req.user.images.length > 10) return res.json('error': 'You have too many images.');

		if (req.body.title.length > 20 || /[\W]{2,2}|^\s|\s$/g.test(req.body.title)) return res.json({error: 'Invalid title.'});

		if (!/^(?=http:\/\/)|^(?=https:\/\/)/g.test(req.body.uploadHotlink)) {
			return res.json({error: 'Please enter a URL protocol (http or https)'});
		}

		var convert = new FormData();

		request.get(req.body.uploadHotlink, {timeout: 1500, encoding: null}, function(err, response, body){
			if (err) {
				if (err.code === "ETIMEDOUT") return res.json({error: 'request timed out.'})
				if (err.code === 'ENOTFOUND') return res.json({error: 'invalid URL or bad DNS lookup'})
				return res.json({error: err.message});
			}
			var checkBody = body.toString('hex',0,4);
			var imageTypes = ['ffd8ffe0', '89504e47', '47494638'];

			if (imageTypes.indexOf(checkBody) === -1){
				return res.json({error: 'invalid file type'});
			}
			
			convert.append('uploadHotlink', request(req.body.uploadHotlink));
			convert.submit('http://localhost:3000/uploadHotlink', function(err, result) {
				if (err) throw err;
				var obj = '';
				result.on('data', function(data){
					obj += data;
				});
				result.on('end',function(){
					obj = JSON.parse(obj);
				});

				var image = new Images({
					imageTitle: req.body.title,
					localImagePath: obj.path,
					shares: 0,
					//creator: req.user._id
				});








			});
		});

	};

	this.uploadHotlink = function(req, res){
		res.json(req.file);
	};

}
module.exports = server;
