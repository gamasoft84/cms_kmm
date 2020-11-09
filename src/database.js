const mongoose = require('mongoose');
require("dotenv").config({ path: ".env" });
//const BBDD = process.env.BBDD;
const BBDD = 'mongodb+srv://Gamasoft:Gamasoft@clustercms.gbsxk.mongodb.net/cmsKMM?retryWrites=true&w=majority';

mongoose.connect(BBDD,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false
}).then( db => console.log('DB is conected'))
  .catch(err => 'Error to connect DB');