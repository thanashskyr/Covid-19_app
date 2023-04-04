const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

//const { validate } = require('./validations/password_validator')

//creating SCHEMA
 const nameSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    Location:[{
            logtitude: Number,
            latitude: Number,
            date: Date,
            required: false
    }],
    test:{
          positive: Boolean,
          date: Date,
          required: false
    },
    visits:[
        {
            poi : String,
            date: { type: Date, default: Date.now },
        }
    ],
    tokens: [{
        token: {
            type: String,
            required: true
            
        }
    }]
                     
   });

         
nameSchema.methods.generateAuthToken = async function() {
    const users = this
    const token = jwt.sign({ _id: users._id.toString() }, 'thisismynewcourse', {expiresIn: '20 days'})

    const data = jwt.verify(token, 'thisismynewcourse')
    users.tokens = users.tokens.concat({ token })
    await users.save()

    return token
}



nameSchema.statics.findByCredentials = async (username, password) => {
    
    const user = await users.findOne({ username })
    
    if (!user) {
        throw new Error('Unable to login')
    }
        var isMatch = false;
        if (password == user.password){
            isMatch = true;
        }
    
        if (!isMatch) {
            throw new Error('Unable to login')
        }
    
        return user
    }
    


  
   
var users = mongoose.model("users", nameSchema); 
  
   
module.exports = users 
