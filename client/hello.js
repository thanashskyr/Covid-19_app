import "regenerator-runtime/runtime";
import axios from "axios";
import { now } from "mongoose";

async function addPoi() {
  // Grab the credentials from the Log In form
  const PoiName = document.getElementById("PoiName").value;
  const PoiType = document.getElementById("PoiType").value;
  const PoiCapacity = document.getElementById("Capacity").value;
  const PoiLatitude = document.getElementById("latitude").value;
  const PoiLongtitude = document.getElementById("longtitude").value;
  const PoiPeople = document.getElementById("people").value;
  var PoiperCent = (PoiPeople / PoiCapacity) * 100;

  // Create the POST payload for Log In

  await axios
    .post("http://localhost:3000/pois/create", {
      POIName: PoiName,
      POIType: PoiType,
      maxCapacity: PoiCapacity,

      POILocation: {
        logtitude: PoiLongtitude,
        latitude: PoiLatitude,
      },
      avgTraffic: [
        {
          people: PoiPeople,
        },
      ],
      perCent: PoiperCent,
    })
    .then(function (response) {
      alert("poi created");
      console.log(response);
      //alert(response);
      //return false;
    })
    .catch(function (error) {
      alert(error);
      console.error(error);
    });
}

async function deletePois() {
  await axios
    .delete("http://localhost:3000/admin/delete")
    .then(function (response) {
      alert(response);
    })
    .catch(function (error) {
      alert(error);
    });
}
//patch a pois capacity
async function changeCapacity() {
  const PoiChange = document.getElementById("PoiChange").value;
  const Change = document.getElementById("newCapacity").value;

  const changeObj = {
    POIName: PoiChange,
    maxCapacity: Change,
  };
  axios
    .patch("http://localhost:3000/pois/patch", { changeObj })
    .then(function (response) {
      alert("change saved");
      console.log(response);
    })
    .catch(function (error) {
      alert(error);
    });
}

//patch a pois type
async function changeType() {
  const PoiChange = document.getElementById("PoiChange").value;
  const Change = document.getElementById("newType").value;

  const changeObj = {
    POIName: PoiChange,
    POIType: Change,
  };
  axios
    .patch("http://localhost:3000/pois/patch", { changeObj })
    .then(function (response) {
      alert("change saved");
      console.log(response);
    })
    .catch(function (error) {
      alert(error);
    });
}

//patch a pois traffic
async function changeTraffic() {
  const PoiChange = document.getElementById("PoiChange").value;
  const Change = document.getElementById("newTraffic").value;
  //PoiChange = JSON.stringify(PoiChange);
  const changeObj = {
    POIName: PoiChange,
    avgTraffic: [{ people: Change, date: now }],
  };
  axios
    .patch("http://localhost:3000/pois/patch", { changeObj })
    .then(function (response) {
      alert("change saved");
      console.log(response);
    })
    .catch(function (error) {
      alert(error);
    });
}

document.getElementById("CreatePoi").addEventListener("click", addPoi);
document.getElementById("delete").addEventListener("click", deletePois);
document
  .getElementById("CapacityChange")
  .addEventListener("click", changeCapacity);
document.getElementById("TypeChange").addEventListener("click", changeType);
document
  .getElementById("TrafficChange")
  .addEventListener("click", changeTraffic);
//module.exports = adminLog;
