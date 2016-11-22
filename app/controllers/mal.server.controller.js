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
	if(onHold) 	return 3; 	// 'onhold'
	if(!status) return 1;	  // 'watching'/'reading'
	if(status) 	return 2;   // 'completed'
}

function convertUSDateFormat(date) {
	var month = date.getMonth() + 1;
	return month + '' + date.getDate() + '' + date.getFullYear();
}

function getMalAnime(animeitem) {
	return {
		episode: animeitem.episodes,
		date_start: convertUSDateFormat(animeitem.start),
		date_finish: animeitem.end ? convertUSDateFormat(animeitem.end) : null,
		status: setMalStatus(animeitem.onHold, animeitem.status),
		enable_rewatching: animeitem.reWatching ? 1 : 0,
		score: animeitem.rating || 0
	};
}

function getMalManga(mangaitem) {
	return {
		chapter: mangaitem.chapters,
		volume: mangaitem.volumes,
		date_start: convertUSDateFormat(mangaitem.start),
		date_finish: mangaitem.end ? convertUSDateFormat(mangaitem.end) : null,
		status: setMalStatus(mangaitem.onHold, mangaitem.status),
		enable_rereading: mangaitem.reReading ? 1 : 0,
		score: mangaitem.rating || 0
	};
}

exports.addOnMal = function(type, item) {
	var malValues;
	if (type === 'anime') {
		malValues = getMalAnime(item);
		client.addAnime(item.mal.id, malValues).then(function(result) {
			console.log('add anime : ', result);
		}).catch(function(err) {
			console.log('add anime error : ', errorHandler.getErrorMessage(err));
		});
	} else if (type === 'manga') {
		malValues = getMalManga(item);
		client.addManga(item.mal.id, malValues).then(function(result) {
			console.log('add manga : ', result);
		}).catch(function(err) {
			console.log('add manga error : ', errorHandler.getErrorMessage(err));
		});
	}
};

exports.updateOnMal = function(type, item) {
	var malValues;
	if (type === 'anime') {
		malValues = getMalAnime(item);
		client.updateAnime(item.mal.id, malValues).then(function(result) {
			console.log('update anime : ', result);
		}).catch(function(err) {
			console.log('update anime error : ', errorHandler.getErrorMessage(err));
		});
	} else if (type === 'manga') {
		malValues = getMalManga(item);
		client.updateManga(item.mal.id, malValues).then(function(result) {
			console.log('update manga : ', result);
		}).catch(function(err) {
			console.log('update manga error : ', errorHandler.getErrorMessage(err));
		});
	}
};

exports.deleteOnMal = function(type, item) {
	if (type === 'anime') {
		client.deleteAnime(item.mal.id).then(function(result) {
			console.log('delete anime : ', result);
		});
	} else if (type === 'manga') {
		client.deleteManga(item.mal.id).then(function(result) {
			console.log('delete manga : ', result);
		});
	}
};
