const { model } = require("mongoose");
const mongoose = require('mongoose');

const { Schema } = mongoose;

const VersionSchema = new Schema({
    modlNameHtml: { type: String, requiered: true },
    modlName: { type: String, requiered: true },
    modlCd: { type: String, requiered: true },
    trimNm: { type: String, requiered: true },
    tmName: { type: String, requiered: true },
    tmCd: { type: String, requiered: true },
    desc: { type: String, requiered: true },
    year: { type: String, requiered: true },
    version: { type: String, requiered: true }
})

module.exports = mongoose.model('Versions', VersionSchema)