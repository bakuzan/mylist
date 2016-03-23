'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
exports.OrderSchema = new Schema({
    series: {
        type: Schema.ObjectId,
        ref: 'Mangaitem',
        required: 'Please link to a series.'
    },
    nextVolume: {
        volume: {
            type: Number
        },
        rrp: {
            type: Number
        },
        prices: {
            type: Array,
            default: []
        }
    },
    rrp: {
        type: Number
    },
    orderHistory: {
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
        },
        history: {
            type: Array,
            default: []
        }
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});
exports.Order = mongoose.model('Order', exports.OrderSchema);
