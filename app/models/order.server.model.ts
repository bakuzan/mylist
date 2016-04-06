'use strict';

/**
 * Module dependencies.
 */
import * as mongoose from 'mongoose';
let Schema: any = mongoose.Schema;

export interface IOrder {
	series: Schema.ObjectId;
	nextVolume: {
		volume: Number;
		date: Date;
		rrp: Number;
		prices: Array<any>;
	};
	rrp: Number;
	orderHistory: Array<any>;
	meta: {
		 updated: Date;
		 created: Date;
		 history: Array<any>;
	};
	user: Schema.ObjectId;
}

export interface IOrderModel extends IOrder, mongoose.Document {}

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

export const Order = mongoose.model<IOrderModel>('Order', OrderSchema);
