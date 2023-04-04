
//username validator
const users = require('../models/user')


const validateName = async (username) => {

    var usernameCheck = false;//true if valid username
    
    const user=  await users.findOne({username: username})

    if (!user) {
        usernameCheck = true;
    }else{
        usernameCheck = false;
    }

  return usernameCheck;

}


module.exports = {
    validateName
}
