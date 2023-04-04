const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const users = require('./user')


//creating  pois SCHEMA
 const poisSchema = new mongoose.Schema({
    POIName: String,
    POIType: String,
    maxCapacity: Number,
   
    POILocation:{
            logtitude: String,
            latitude: String
            
    },
    avgTraffic:[{
          people:  Number,
          date: { type: Date, default: Date.now },
         
    }],
    perCent: Number               
   });




  
   
var pois = mongoose.model("pois", poisSchema); 
  
   
module.exports = pois
