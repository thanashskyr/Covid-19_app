const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const users = require('./user')

//creating  pois SCHEMA
 const adminSchema = new mongoose.Schema({
    adminName: String,
    adminPassword: String
   });

   adminSchema.statics.findByCredentialsAdmin = async (adminName, adminPassword) => {
    
    const admin = await administrators.findOne({ adminName})
    
    if (!admin) {
        throw new Error('Unable to login')
    }
        var isMatch = false;
        if (adminPassword == admin.adminPassword){
            isMatch = true;
        }
    
        if (!isMatch) {
            throw new Error('Unable to login')
        }
    
        return admin
    }


  
   
var administrators = mongoose.model("administrator", adminSchema); 
module.exports= administrators