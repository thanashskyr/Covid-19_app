import "regenerator-runtime/runtime";
import axios from "axios";
// var visitData=require('./map.js')
// Grab token from URL params -- NEEDS ATTENTION

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const token = urlParams.get("token");
const id = urlParams.get("id");

// Use the token to authorize the user and get their data

axios
  .get("http://localhost:3000/user/me", { headers: { Authorization: token } })
  .then(function (response) {
    populateData(response.data);
  })
  .catch(function (error) {});

// Find my Location
navigator.geolocation.getCurrentPosition(function (position) {
  let lat = position.coords.latitude;
  let long = position.coords.longitude;

  const payload = {
    id: id,
    Location: [
      {
        logtitude: long,
        latitude: lat,
        date: new Date(),
      },
    ],
  };

  axios
    .patch("http://localhost:3000/user/location", payload, {
      headers: { Authorization: token },
    })
    .then(function (response) {
      var user = response.data.user;
      const length = user.tokens.length - 1;
      var token = user.tokens[length].token;

      console.log(response.status);
      console.log(token);
      return user;
    })
    .catch(function (error) {
      console.log(error);
    });
});

function populateData(data) {
  console.log(data);
  document.getElementById("name").innerHTML = data.username;
  document.getElementById("email").innerHTML = data.email;
}
