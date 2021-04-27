'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContactUsSchema = new Schema({

    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    subject: {
        type: String,
        trim: true,
        required: true
    },
    message: {
        type: String,
        trim: true,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

let Contacts = mongoose.model('Contacts', ContactUsSchema);
module.exports = Contacts;