'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
    settings: {
        type: Object,
        required: true,
        default: {}
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    host: {
        type: String,
        required: true,
        trim: true
    },
    updated_date: {
        type: Date,
        default: Date.now
    }
});

let Clients = mongoose.model('clients', ClientSchema);
module.exports = Clients;