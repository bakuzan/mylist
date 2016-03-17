'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Topten Schema
 */
var ToptenSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Topten name',
		trim: true
	},
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    },
    animeList: [
        { type: Schema.ObjectId, ref: 'Animeitem' }
    ],
    mangaList: [
        { type: Schema.ObjectId, ref: 'Mangaitem' }
    ],
    characterList: [
        { type: Schema.ObjectId, ref: 'Character' }
    ],
    isFavourite: {
        type: Boolean,
        default: false
    },
    isRanked: {
        type: Boolean,
        default: false
    },
    conditions: {
        limit: {
            type: Number
        },
        series: [],
        tags: []
    },
    meta: {
        created: {
            type: Date,
            default: Date.now
        },
        updated: {
            type: Date,
            default: Date.now
        },
        archived: {
            type: Boolean,
            default: false
        }
    },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Topten', ToptenSchema);