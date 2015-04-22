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
  end: {
    type: Date
  },
  latest: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: false
  },
  hardcopy: {
    type: Boolean,
    default: false
  },
  finalChapter: {
    type: Number,
    default: '0',
    trim: true
  },
  finalVolume: {
    type: Number,
    default: '0',
    trim: true
  },
  rating: {
    type: Number,
    default: 0
  },
  reReading: {
    type: Boolean,
    default: false
  },
  reReadCount: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
   },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Mangaitem', MangaitemSchema);