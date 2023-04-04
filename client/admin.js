import 'regenerator-runtime/runtime';
import axios from 'axios';

async function adminLog(){
    
  // Grab the credentials from the Log In form
  const username = document.getElementById("Uname").value;
  const password = document.getElementById("Pass").value;


 
    // Create the POST payload for Log In
  
    await axios.post('http://localhost:3000/admin/login', {
        adminName: username,
        adminPassword: password
    })  
    .then(function (response) {
     //alert('logged in')
        console.log(response)
        window.location = ("./Hello.html");
        //return false;
    }) 
    .catch(function (error) {
        alert(error);
        console.error(error);
    });   
    
    
}
 
document.getElementById("logadmin").addEventListener('click', adminLog);


  
module.exports = adminLog;
    