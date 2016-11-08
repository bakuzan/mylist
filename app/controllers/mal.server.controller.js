'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
		errorHandler = require('./errors.server.controller'),
		_ = require('lodash'),
  	popura = require('popura');

var client = popura(process.env.MAL_USER, process.env.MAL_PASSWORD);

exports.search = function(req, res) {
	var type = req.params.type,
			search = req.query.searchString;

	if (type === 'anime') {
		client.searchAnimes(search).then(function(result) {
			res.jsonp(result);
		}).catch(function(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	} else if (type === 'manga') {
		client.searchMangas(search).then(function(result) {
			res.jsonp(result);
		}).catch(function(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		});
	}

};
