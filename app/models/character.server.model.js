'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Character Schema
 */
var CharacterSchema = new Schema({
	name: {
		type: String,
        unique: 'Name must be unique.',
		default: '',
		required: 'Please fill Character name',
		trim: true
	},
    image: {
        type: String,
        default: ''
    },
	anime: {
        type: Schema.ObjectId,
		ref: 'Animeitem'
    },
    manga: {
        type: Schema.ObjectId,
		ref: 'Mangaitem'
    },
    voice: {
        type: String,
        default: ''
    },
    tags: {
        type: Array,
        default: []
    },
    meta: {
       updated: {
		type: Date,
        default: Date.now
	   },
	   created: {
		type: Date,
		default: Date.now
	   }
    },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Character', CharacterSchema);