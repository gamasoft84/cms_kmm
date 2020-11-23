const { model } = require("mongoose");
const mongoose = require('mongoose');

const {Schema} = mongoose;

const FeatureImageSchema = new Schema({
    year: {type: String, requiered: true},
    model: {type: String, requiered: true},
    modelCd: { type: String, requiered: true },
    url: {type: String, requiered: true},
    name: {type: String},
    description: {type: String},
    category: {type: String, requiered: true},
    isCover: {type: Boolean, default:false},   
    versions: {type: Array}
})

module.exports = mongoose.model('FeatureImage',FeatureImageSchema) 
