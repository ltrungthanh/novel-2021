'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GallerySchema = new Schema({
    url_image: {
        type: String,
        trim: true
    },
    idx: {
        type: Number,
        trim: true,
        required: true
    },
    thumb_image: {
        type: String,
        trim: true,
        required: true
    },
    url_video: {
        type: Object,
        required: false
    },
    type: {
        type: String,
        trim: true,
        required: true
    },
    note: {
        type: String,
        trim: true,
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    updated_date: {
        type: Date,
        default: Date.now
    },
});

let Gallerys = mongoose.model('Gallerys', GallerySchema);
module.exports = Gallerys;