import "regenerator-runtime/runtime";
import axios from "axios";

async function signin() {
  // Grab the credentials from the Log In form
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Create the POST payload for Log In
  let logInObj = {
    username: username,
    password: password,
  };

  logInObj = JSON.stringify(logInObj);

  await axios
    .post("http://localhost:3000/users/login", {
      username: username,
      password: password,
    })
    .then(function (response) {
      var user = response.data.user;
      const id = user._id;
      const length = user.tokens.length - 1;
      var token = user.tokens[length].token;

      window.location = "./HomePage.html?token=" + token + "&id=" + id;
      return user;
    })
    .catch(function (error) {
      alert(error);
      console.error(error);
    });
}

document.getElementById("login").addEventListener("click", signin);

module.exports = signin;
