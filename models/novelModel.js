'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;
var NovelSchema = new Schema({
    novel_status: {
        type: Number,
        require: true
    },
    view: {
        type: Number,
        default: 0
    },
    totalChapter: {
        type: Number,
        default: 0
    },
    avgPoint: {
        type: SchemaTypes.Decimal128,
        default: 0
    },
    avgPointType2: {
        type: SchemaTypes.Decimal128,
        default: 0
    },
    voteCount: {
        type: Number,
        default: 0
    },
    voteCountType2: {
        type: Number,
        default: 0
    },
    novel_name: {
        type: String,
        required: true,
        trim: true
    },
    novel_other_name: {
        type: String,
        required: true,
        trim: true
    },
    novel_author: {
        type: String,
        required: true,
        trim: true
    },
    novel_author_cn: {
        type: String,
        trim: true,
        default: ''
    },
    novel_id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    novel_desc: {
        type: String,
        trim: true
    },
    novel_genres: {
        type: Array,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    recentChapter: {
        type: Object
    },
    firstChapter: {
        type: Object
    },
    crawler_date: {
        type: Date,
        default: Date.now
    },
    followCount: {
        type: Number,
        default: 0
    }
});

let Novel = mongoose.model('Novels', NovelSchema);
module.exports = Novel;