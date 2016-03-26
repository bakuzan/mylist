'use strict';

/**
 * Module dependencies.
 */
import * as mongoose from 'mongoose';
const Schema: any = mongoose.Schema;

export interface IOrder extends mongoose.Document {
	series: Schema.ObjectId;
	nextVolume: {
		volume: Number;
		date: Date;
		rrp: Number;
		prices: Array<Object>;
	};
	rrp: Number;
	orderHistory: Array<Object>;
	meta: {
		 updated: Date;
		 created: Date;
		 history: Array<Object>;
	};
	user: Schema.ObjectId;
}

export const OrderSchema = new Schema({
	/** Order Schema */
		series: {
			type: Schema.ObjectId,
			ref: 'Mangaitem',
			required: 'Please link to a series.'
		},
		nextVolume: {
			volume:{
				type: Number
			},
			date: {
				type: Date,
				default: Date.now
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

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
