const { model } = require("mongoose");
const mongoose = require('mongoose');

const {Schema} = mongoose;

const NoteSchema = new Schema({
    title: {type: String, requiered: true},
    description: {type: String, requiered: true},
    date: {type: Date, default: Date.now},
    user: {type: String}
})

module.exports = mongoose.model('Note',NoteSchema) 
