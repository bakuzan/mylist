'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Mangaitem = mongoose.model('Mangaitem'),
	_ = require('lodash');

/**
 * Create a Mangaitem
 */
exports.create = function(req, res) {
	var mangaitem = new Mangaitem(req.body);
	mangaitem.user = req.user;

	mangaitem.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mangaitem);
		}
	});
};

/**
 * Show the current Mangaitem
 */
exports.read = function(req, res) {
	res.jsonp(req.mangaitem);
};

/**
 * Update a Mangaitem
 */
exports.update = function(req, res) {
	var mangaitem = req.mangaitem ;

	mangaitem = _.extend(mangaitem , req.body);

	mangaitem.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mangaitem);
		}
	});
};

/**
 * Delete an Mangaitem
 */
exports.delete = function(req, res) {
	var mangaitem = req.mangaitem ;

	mangaitem.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mangaitem);
		}
	});
};

/**
 * List of Mangaitems
 */
exports.list = function(req, res) { 
	Mangaitem.find().sort('-created').populate('user', 'displayName').exec(function(err, mangaitems) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mangaitems);
		}
	});
};

/**
 * Mangaitem middleware
 */
exports.mangaitemByID = function(req, res, next, id) { 
	Mangaitem.findById(id).populate('user', 'displayName').exec(function(err, mangaitem) {
		if (err) return next(err);
		if (! mangaitem) return next(new Error('Failed to load Mangaitem ' + id));
		req.mangaitem = mangaitem ;
		next();
	});
};

/**
 * Mangaitem authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.mangaitem.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
