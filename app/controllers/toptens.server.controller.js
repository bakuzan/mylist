'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Topten = mongoose.model('Topten'),
	_ = require('lodash');

/**
 * Create a Topten
 */
exports.create = function(req, res) {
	var topten = new Topten(req.body);
	topten.user = req.user;

	topten.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(topten);
		}
	});
};

/**
 * Show the current Topten
 */
exports.read = function(req, res) {
	res.jsonp(req.topten);
};

/**
 * Update a Topten
 */
exports.update = function(req, res) {
	var topten = req.topten ;

	topten = _.extend(topten , req.body);
	topten.meta.updated = Date.now();
	
	topten.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(topten);
		}
	});
};

/**
 * Delete an Topten
 */
exports.delete = function(req, res) {
	var topten = req.topten ;

	topten.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(topten);
		}
	});
};

/**
 * List of Toptens
 */
exports.list = function(req, res) {
	Topten.find().sort('-created')
        .populate('user', 'displayName')
        .populate('animeList', 'title')
        .populate('mangaList', 'title')
        .populate('characterList', 'name')
        .exec(function(err, toptens) {
        if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(toptens);
		}
	});
};

/**
 * Topten middleware
 */
exports.toptenByID = function(req, res, next, id) {
	Topten.findById(id)
        .populate('user', 'displayName')
        .populate('animeList', 'title image')
        .populate('mangaList', 'title image')
        .populate('characterList', 'name image')
        .exec(function(err, topten) {
        if (err) return next(err);
		if (! topten) return next(new Error('Failed to load Topten ' + id));
		req.topten = topten ;
		next();
	});
};

/**
 * Topten authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.topten.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
