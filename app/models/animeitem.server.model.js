'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Animeitem Schema
 */
var AnimeitemSchema = new Schema({
  title: {
    type: String,
    unique: 'Title must be unique.',
    default: '',
    required: 'Please fill in an anime title',
    trim: true
  },
  episodes: {
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
  onHold: {
      type: Boolean,
      default: false
  },
  disc: {
    type: Boolean,
    default: false
  },
  finalEpisode: {
    type: Number,
    default: '0',
    trim: true
  },
  season: {
      season: {
          type: String,
          default: ''
      },
      year: {
          type: String,
          default: ''
      }
  },
  rating: {
    type: Number,
    default: 0
  },
  reWatching: {
    type: Boolean,
    default: false
  },
  reWatchCount: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
   },
  manga: {
        type: Schema.ObjectId,
		ref: 'Mangaitem'
    },
    tags: {
        type: Array,
        default: []
    },
		video: {
			location: {
				type: String,
				default: ''
			},
			files: {
				type: Array,
				default: []
			}
		},
    meta: {
			updated: {
				type: Date,
        default: Date.now
			},
		   created: {
				type: Date,
				default: Date.now
		   },
		   history: {
		     type: Array,
		     default: []
		   },
		   revisits: {
		     type: Array,
		     default: []
		   }
    },
   user: {
		type: Schema.ObjectId,
		ref: 'User'
  }
});

mongoose.model('Animeitem', AnimeitemSchema);
