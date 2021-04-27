'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChapterSchema = new Schema({
    chapter_name: {
        type: String,
        required: true,
        trim: true
    },
    chapter_content: {
        type: String,
        required: true,
        trim: true
    },
    chapter_id: {
        type: String,
        required: true,
        trim: true
    },
    novel: {
        type: Object,
        require: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    crawler_date: {
        type: Date,
        default: Date.now
    },
});

let Chapter = mongoose.model('Chapters', ChapterSchema);
module.exports = Chapter;