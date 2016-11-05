'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	_ = require('lodash'),
  popura = require('popura');

var client = popura('Bakuzan', 'Myanime52');

exports.search = function(req, res) {
	console.log('search mal: ', req);
	//get params here
	var type = '',
			search = '';

	// for now log the result, when got it working just return the query.
	if(type === 'anime') {
		client.searchAnimes(search).then(function(res) {
			console.log(res);
		}).catch(function(err) {
			console.log(err);
		});
	} else if (type === 'manga') {
		client.searchMangas(search).then(function(res) {
			console.log(res);
		}).catch(function(err) {
			 console.log(err);
		});
	}
};
