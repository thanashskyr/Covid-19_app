const jwt = require ('jsonwebtoken')
const users= require('../models/user')

const auth = async (req, res,  next) => {
   try{
       const token = req.header('Authorization').replace('Bearer ','')//take token from headers
       const decoded = jwt.verify(token,'thisismynewcourse')//verify the token
       const user = await users.findOne({ _id: decoded._id, 'tokens.token': token })//return the user with this token
       
       if(!user){
           throw new Error()
       }
       req.token = token
       req.user = user
       next()//continue if user with this token exists

    } catch(e) {
        res.status(401).send({error:'Please authenticate.'})
    }
}

module.exports = auth