import "regenerator-runtime/runtime";
import axios from "axios";
import _ from "lodash";

//chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
async function signin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;

  let logInOb = {
    username: username,
    password: password,
    email: email,
  };
  logInOb = JSON.stringify(logInOb);

  await axios
    .post("http://localhost:3000/user/signIn", {
      username: username,
      password: password,
      email: email,
      test: {
        positive: false,
        date: Date.now(),
      },
    })
    .then(function (response) {
      if (response.status != 400) {
        console.log(response);
        var token = response.data.token;
        var id = response.data.myData._id;
        //const length = user.tokens.length - 1
        //var token =user.tokens[length].token
        window.location = "./HomePage.html?token=" + token + "&id=" + id;
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

document.getElementById("signin").addEventListener("click", signin);
