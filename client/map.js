import "regenerator-runtime/runtime";
import axios from "axios";
import { get } from "mongoose";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const token = urlParams.get("token");
const id = urlParams.get("id");

// Global variables to be accessible from every function

var map;
var markerPOIArray = []; // Create an array for individuals markers to manipulate them correctly
var markerAllPOIArray = []; // Create an array for individuals markers to manipulate them correctly
var markerPOI;
var popup;
var myPositionLat;
var myPositionLong;
var distance;
var estimationToBeSent;

async function submitVisit(visitData) {
  // user/visit
  await axios
    .patch("http://localhost:3000/user/visit", visitData, {
      headers: { Authorization: token },
    })
    .then(function (response) {
      console.log(response);
      alert("Your visit has been submitted successfully");
    })

    .catch((e) => {
      alert(e);
    });
}

async function Estimation(estimationData) {
  // user/visit
  await axios
    .post("http://localhost:3000/user/estimation", estimationData, {
      headers: { Authorization: token },
    })
    .then(function (response) {
      console.log(response);
      //alert("Your Estimation has been submitted successfully");
    })

    .catch((e) => {
      alert(e);
    });
}

// Find my Location
navigator.geolocation.getCurrentPosition(function (position) {
  myPositionLat = position.coords.latitude;
  myPositionLong = position.coords.longitude;

  map = L.map("map").setView([myPositionLat, myPositionLong], 12);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGFwYWZpb2dvcyIsImEiOiJja2ZncTk1NDIwNTQzMnBxOTVucjYybDRqIn0.hB_TqANwo9kx1t8KsKPkaA",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: "your.mapbox.access.token",
    }
  ).addTo(map);

  var myLocationMarker = L.marker([myPositionLat, myPositionLong]).addTo(map);
  popup = L.popup().setContent("You are here!");

  myLocationMarker.bindPopup(popup).openPopup();
});

async function displayPOI() {
  // Clear the array of ALL Markers to make them disappear from the map
  if (markerAllPOIArray.length) {
    markerAllPOIArray.forEach((poi, arrayIndex) => {
      map.removeLayer(poi);
    });
    markerAllPOIArray = [];
  }

  const poiNameToBeSent = document.getElementById("poiSend").value;

  const poiName = {
    poiName: poiNameToBeSent,
  };

  await axios
    .post("http://localhost:3000/user/poi", poiName, {
      headers: { Authorization: token },
    })
    .then(function (response) {
      var poiInfo = response.data[0];

      var lat = poiInfo.POILocation.latitude;
      var long = poiInfo.POILocation.logtitude;
      var perCent = poiInfo.perCent;

      // Set the map view above the POI marker
      map.setView([lat, long], 12);
      // Create the marker
      markerPOI = L.marker([lat, long]).addTo(map);
      // Push marker into the array
      markerPOIArray.push(markerPOI);
      // Display the marker onto the map
      map.addLayer(markerPOI);

      popup = L.popup().setContent(
        poiInfo.POIName + " is " + perCent + "% full"
      ); //+'<br></br>'+'<button id="visit">submit visit</button>'
      // +'<br></br>'+'<label for="people">estimation of people at this Poi:</label>'+ '<br></br>'+
      // '<input type="text" id="people">'+'<script type = "text/javascript" src="./homepage.js"></script>');

      markerPOI.bindPopup(popup);

      // Add Colors to the Markers
      if (perCent < 33) {
        markerPOI._icon.classList.add("huechange1"); // huechange1 = green
      } else if (perCent > 32 && perCent < 66) {
        markerPOI._icon.classList.add("huechange2");
      } else {
        markerPOI._icon.classList.add("huechange3");
      }
    })
    .catch(function (error) {
      alert("Something went wrong - Please make sure you typed a correct POI.");
      console.error(error);
    });
}

async function displayAllPOIs() {
  // Clear the array of Individual Markers to make them disappear from the map
  if (markerPOIArray.length) {
    markerPOIArray.forEach((poi) => {
      map.removeLayer(poi);
      markerPOIArray.pop();
    });
  }

  await axios
    .get("http://localhost:3000/user/allPois", {
      headers: { Authorization: token },
    })
    .then((response) => {
      const poiDataArray = response.data;

      poiDataArray.forEach((poiObj) => {
        var lat = poiObj.POILocation.latitude;
        var long = poiObj.POILocation.logtitude;
        var perCent = poiObj.perCent;
        // Create the marker
        markerPOI = L.marker([lat, long]).addTo(map);
        // Push marker into the array
        markerAllPOIArray.push(markerPOI);
        // Display the marker onto the map
        map.addLayer(markerPOI);
        // Generate the popUp for each POI Marker

        function getDistance(origin, destination) {
          // return distance in meters
          var lon1 = toRadian(origin[1]),
            lat1 = toRadian(origin[0]),
            lon2 = toRadian(destination[1]),
            lat2 = toRadian(destination[0]);

          var deltaLat = lat2 - lat1;
          var deltaLon = lon2 - lon1;

          var a =
            Math.pow(Math.sin(deltaLat / 2), 2) +
            Math.cos(lat1) *
              Math.cos(lat2) *
              Math.pow(Math.sin(deltaLon / 2), 2);
          var c = 2 * Math.asin(Math.sqrt(a));
          var EARTH_RADIUS = 6371;
          return c * EARTH_RADIUS * 1000;
        }
        function toRadian(degree) {
          return (degree * Math.PI) / 180;
        }

        distance = getDistance([lat, long], [myPositionLat, myPositionLong]);
        //console.log("DISTANCE="+distance);

        function createButton(label, container) {
          var btn = L.DomUtil.create("button", "", container);
          btn.setAttribute("type", "button");
          btn.innerHTML = label + " to " + poiObj.POIName;
          return btn;
        }

        if (distance < 20) {
          popup = L.popup();
          var container = L.DomUtil.create("div");
          var submitVisitButton = createButton("Submit Visit", container);

          popup.setContent(container);

          const visitData = {
            _id: id,
            poi: poiObj.POIName,
          };

          L.DomEvent.on(submitVisitButton, "click", () => {
            submitVisit(visitData);
          });

          markerPOI.bindPopup(popup);
        } else {
          popup = L.popup().setContent(
            poiObj.POIName + " is " + perCent + "% full"
          ); //+'<br></br>'+'<button id="visit">submit visit</button>'
          // +'<br></br>'+'<label for="people">estimation of people at this Poi:</label>'+ '<br></br>'+
          // '<input type="text" id="people">'+'<script type = "text/javascript" src="./homepage.js"></script>');
        }
        markerPOI.bindPopup(popup);

        // Add Colors to the Markers
        if (perCent < 33) {
          markerPOI._icon.classList.add("huechange1"); // huechange1 = green
        } else if (perCent > 32 && perCent < 66) {
          markerPOI._icon.classList.add("huechange2");
        } else {
          markerPOI._icon.classList.add("huechange3");
        }
      });
    });
}

function clearPOIMarkers() {
  // Clear the array of Individual Markers to make them disappear from the map
  if (markerPOIArray.length) {
    markerPOIArray.forEach((poi) => {
      map.removeLayer(poi);
      markerPOIArray.pop();
    });
  }

  // Clear the array of ALL Markers to make them disappear from the map
  if (markerAllPOIArray.length) {
    markerAllPOIArray.forEach((poi) => {
      map.removeLayer(poi);
    });
    markerAllPOIArray = [];
  }
}

//traffic estimation
async function trafficEstimation() {
  const poiNameEst = document.getElementById("poiName").value;
  const estimationInput = document.getElementById("people").value;
  const jsonPoiName = {
    poiName: poiNameEst,
  };

  //check if poi is 20 meters near you
  await axios
    .post("http://localhost:3000/user/poi", jsonPoiName, {
      headers: { Authorization: token },
    })
    .then((response) => {
      console.log(response.data);
      const lat = response.data[0].POILocation.latitude;
      const long = response.data[0].POILocation.logtitude;

      function getDistance(origin, destination) {
        // return distance in meters
        var lon1 = toRadian(origin[1]),
          lat1 = toRadian(origin[0]),
          lon2 = toRadian(destination[1]),
          lat2 = toRadian(destination[0]);

        var deltaLat = lat2 - lat1;
        var deltaLon = lon2 - lon1;

        var a =
          Math.pow(Math.sin(deltaLat / 2), 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
        var c = 2 * Math.asin(Math.sqrt(a));
        var EARTH_RADIUS = 6371;
        return c * EARTH_RADIUS * 1000;
      }
      function toRadian(degree) {
        return (degree * Math.PI) / 180;
      }

      distance = getDistance([lat, long], [myPositionLat, myPositionLong]);

      console.log(distance + " this");
    });

  var jsonEstimation = {
    POIName: poiNameEst,
    traffic: [
      {
        people: estimationInput,
      },
    ],
  };
  if (distance < 20) {
    await axios
      .post("http://localhost:3000/user/estimation", jsonEstimation, {
        headers: { Authorization: token },
      })
      .then(function (response) {
        console.log(response);
        alert("Your Estimation has been submitted successfully");
      })

      .catch((e) => {
        alert(e);
      });
  } else {
    alert("you're not close enough to make an estimation for " + poiNameEst);
  }
}

async function positiveTest() {
  var positiveDate = document.getElementById("date").value;
  const jsonPositive = {
    _id: id,
    date: positiveDate,
  };

  await axios
    .post("http://localhost:3000/user/positive", jsonPositive, {
      headers: { Authorization: token },
    })
    .then(function (response) {
      console.log(response);
      alert("Your test has been submitted successfully");
    })

    .catch((e) => {
      alert(e);
    });
}
async function covidAlertTest() {
  const jsonId = {
    _id: id,
  };
  await axios
    .post("http://localhost:3000/user/alert", jsonId, {
      headers: { Authorization: token },
    })
    .then(function (response) {
      console.log(response.data);

      if (response.data.covidAlert == true) {
        alert(
          "you were with a positive person at " +
            response.data.visitAlert.poi +
            " on " +
            response.data.visitAlert.date
        );
      } else {
        alert("you are covid free");
      }
    })

    .catch((e) => {
      alert(e);
    });
}
async function seeMyVisits() {
  const jsonId = {
    _id: id,
  };
  await axios
    .post("http://localhost:3000/user/allVisits", jsonId, {
      headers: { Authorization: token },
    })
    .then(function (response) {
      const visitArray = response.data;
      var POIArray = [];
      var DateArray = [];
      for (let i = 0; i < visitArray.length; i++) {
        POIArray[i] = visitArray[i].poi;
        DateArray[i] = visitArray[i].date;
      }

      const ul = document.createElement("ul");

      document.getElementById("myItemList").appendChild(ul);

      POIArray.forEach((item) => {
        let li = document.createElement("li");
        ul.appendChild(li);
        for (let i = 0; i < DateArray.length; i++)
          li.innerHTML = item + " at " + DateArray[i];
      });
    })
    .catch((e) => {
      alert(e);
    });
}

async function changeCredentials() {
  var username = document.getElementById("uname").value;
  var password = document.getElementById("pword").value;
  console.log(username);
  console.log(password);

  if (username == 0 && password != 0) {
    patchJson = {
      _id: id,
      password: password,
    };
  } else if (username != 0 && password == 0) {
    patchJson = {
      _id: id,
      username: username,
    };
  } else if (password == 0 && username == 0) {
    patchJson = {
      _id: id,
    };
  } else {
    var patchJson = {
      _id: id,
      username: username,
      password: password,
    };
  }

  await axios
    .patch("http://localhost:3000/user/change", patchJson, {
      headers: { Authorization: token },
    })
    .then(function (response) {
      alert(response.data);
    })

    .catch((e) => {
      alert(e);
    });
}

document.getElementById("searchPOI").addEventListener("click", displayPOI);
document
  .getElementById("showAllPOIs")
  .addEventListener("click", displayAllPOIs);
document
  .getElementById("clearAllPOIs")
  .addEventListener("click", clearPOIMarkers);
document
  .getElementById("submitEstimation")
  .addEventListener("click", trafficEstimation);
document.getElementById("positive").addEventListener("click", positiveTest);
document.getElementById("covidAlert").addEventListener("click", covidAlertTest);
document.getElementById("showVisits").addEventListener("click", seeMyVisits);
document
  .getElementById("changeCred")
  .addEventListener("click", changeCredentials);

// clearAllPOIs
// showAllPOIs
// module.exports=visitData;
