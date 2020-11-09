const mongoose = require('mongoose');
require("dotenv").config({ path: ".env" });
const BBDD = process.env.BBDD;

mongoose.connect(BBDD,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false
}).then( db => console.log('DB is conected'))
  .catch(err => console.error());