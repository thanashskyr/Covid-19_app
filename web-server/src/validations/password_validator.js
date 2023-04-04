//password validator

    const validate = (userPassword) => {

        var pascheck = false;//true if valid password
        var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        var format1 = /[A-Z]/;
        var format2 = /[a-z]/;

        if ((userPassword.length > 7) && (userPassword.match(format))&&(userPassword.match(format1))&&(userPassword.match(format2))) 
        {
                pascheck = true;
        }else{
                pascheck = false;
        }

    return pascheck;

    }


module.exports = {
    validate
}
