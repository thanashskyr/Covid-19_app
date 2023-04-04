const express = require('express')
var bodyParser = require('body-parser')
var app = express()

const mongoose = require('mongoose')
const config= require('config')
const { query } = require('express')
const dbConfig = config.get('web_db.dbConfig.dbName');
const users = require('./models/user')
const pois = require('./models/pois')
const userRouter = require('./routers/user')
const poiRouter = require('./routers/pois')
const jwt = require('jsonwebtoken') 


//connect db
mongoose.connect(dbConfig,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=>{console.log('DATABASE CONNECTED');})
    .catch(err=>{console.log('DATABASE NOT CONECTED'+err)
});


  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(express.json())

  
app.use(userRouter)
app.use(poiRouter)


//starting up server at port 3000
app.listen(3000,()=>{
    console.log('server working on port 3000')
    
})


