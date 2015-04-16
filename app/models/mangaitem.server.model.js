'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Mangaitem Schema
 */
var MangaitemSchema = new Schema({
  title: {
    type: String,
    default: '',
    trim: true
  },
  chapters: {
    type: Number,
    default: '0',
    trim: true
  },
  volumes: {
    type: Number,
    default: '0',
    trim: true
  },
  start: {
    type: Date,
    default: Date.now
  },
  latest: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: false
  },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Mangaitem', MangaitemSchema);