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

function setMalStatus(onHold, status) {
	if(onHold) return 'onhold'; 			// 3
	if(!status) return 'watching';	  // 1
	if(status) return 'completed';    // 2
}

function convertUSDateFormat(date) {
	return date.getDate() + '' + date.getMonth() + 1 + '' + date.getFullYear();
}

exports.addToMal = function(animeitem) {
	var malValues = {
		episode: animeitem.episodes,
		date_start: convertUSDateFormat(animeitem.start),
		status: setMalStatus(animeitem.onHold, animeitem.status)
	};

	client.addAnime(animeitem.mal.id, malValues).then(function(result) {
		console.log('add anime : ', result);
	});
};

exports.updateOnMal = function(animeitem) {
	var malValues = {
		episode: animeitem.episodes,
		date_start: convertUSDateFormat(animeitem.start),
		date_finish: convertUSDateFormat(animeitem.end),
		status: setMalStatus(animeitem.onHold, animeitem.status),
		enable_rewatching: animeitem.reWatching ? 1 : 0,
		score: animeitem.rating || 0
	};

	client.updateAnime(animeitem.mal.id, malValues).then(function(result) {
		console.log('add anime : ', result);
	});
};
