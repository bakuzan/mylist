'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	_ = require('lodash'),
  popura = require('popura');

const client = popura('Bakuzan', 'Myanime52');

client.getAnimeList().then(res => console.log(res)).catch(err => console.log(err));
