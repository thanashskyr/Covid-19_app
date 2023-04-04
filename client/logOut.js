
import 'regenerator-runtime/runtime';
import axios from 'axios';

// Grab token from URL params -- NEEDS ATTENTION

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const token = urlParams.get('token')


function LogOut(){


  axios.get('http://localhost:3000/user/logout', { headers: {'Authorization': token}})
  .then(function (response) {
 console.log(response)
}) 
.catch(function (error) {
    console.log(error);
})
window.location = ("./loginPage.html");
}
document.getElementById("logOutButton").addEventListener('click', LogOut);