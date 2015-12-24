'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
/*
            description: $scope.newTask,
            day: $scope.newTaskDay.name,
            date: $scope.newTaskDate,
            repeat: $scope.newTaskRepeat,
            completeTimes: 0,
            updated: day === 1 ? true : false,
            complete: false,
            category: $scope.newTaskCategory.name,
            daily: $scope.newTaskDaily,
            dailyRefresh: $scope.today.getDate(),
            checklist: $scope.newTaskChecklist,
            checklistOptions: $scope.optionArray
*/

/**
 * Task Schema
 */
var TaskSchema = new Schema({
	description: {
		type: String,
		default: '',
		required: 'Please fill Task description',
        lowercase: true,
		trim: true
	},
    link: {
        linked: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: ''
        },
        id: {
            type: Schema.ObjectId
        }
    },
    day: {
        type: String,
        default: 'Any'
    },
    date: {
        type: Date,
        default: Date.now
    },
    repeat: {
        type: Number,
        default: 1
    },
    completeTimes: {
        type: Number,
        default: 0
    },
    updateCheck: {
        type: Boolean,
        default: true
    },
    complete: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        default: 'Other'
    },
    daily: {
        type: Boolean,
        default: false
    },
    dailyRefresh: {
        type: Date,
        default: new Date().toISOString().slice(0,10)
    },
    checklist: {
        type: Boolean,
        default: false
    },
    checklistItems: {
        type: Array,
        default: []
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

mongoose.model('Task', TaskSchema);