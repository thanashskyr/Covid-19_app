const express = require("express");
const users = require("../models/user");
const pois = require("../models/pois");
const admininstrators = require("../models/administrator");
const router = new express.Router();
const { validate } = require("../validations/password_validator");
const { validateName } = require("../validations/username_validator");
const auth = require("../middleware/auth");
const completeness = require("../helpers/poiHelper");
const poiValidTime = require("../helpers/poiTimeHelper");
const { now } = require("mongoose");

//SIGN IN create json from postman and saving it to database
router.post("/user/signIn", async (req, res) => {
  user_saver = req.body;

  const userPassword = req.body.password;
  const username = req.body.username;

  var passCheck = validate(userPassword);
  var usernameCheck = await validateName(username);
  var myData = new users(req.body); //store json to myData
  console.log(myData);

  if (passCheck == true && usernameCheck == true) {
    var token = await myData.generateAuthToken();
  }

  //save to db
  if (passCheck == true && usernameCheck == true) {
    await myData
      .save()
      .then((item) => {
        res.status(201).send({ myData, token });
      })
      .catch((err) => {
        res.status(400).send("unable to save to database");
      });
  } else {
    res.status(400).send("invalid username or password");
  }
});

//LOGIN user
router.post("/users/login", async (req, res) => {
  try {
    const user = await users.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await user.generateAuthToken();
    return res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//GET see my profile
router.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
});

//PATCH existing user
router.patch("/user/change", auth, async (req, res) => {
  var _id = req.body._id;
  var userPassword = req.body.password;
  var newusername = req.body.username;

  if (userPassword == undefined && newusername != undefined) {
    await users.findOneAndUpdate({ _id: _id }, req.body);
    res.status(200).send("item saved to database");
  } else if (userPassword == undefined && newusername == undefined) {
    res.send("please enter new credentials");
  } else {
    try {
      var passCheck = validate(userPassword);

      //save if valid password
      if (passCheck == true) {
        var userPatch = await users
          .findOneAndUpdate({ _id: _id }, req.body)
          .then((item) => {
            res.status(200).send("item saved to database");
          })
          .catch((err) => {
            res.status(400).send("unable to save to database");
          });
      } else {
        res.send(
          "Password must have at least 8 characters AND at least one upercase AND at least one symbol"
        );
      }
    } catch (e) {
      res.status(500).send("error occured");
    }
  }
});

//DELETE BY ID

router.delete("/user/:id", async (req, res) => {
  try {
    const userDelete = await users.findByIdAndDelete(req.params.id);
    if (!userDelete) {
      return res.send("not existing id");
    }
    res.send(req.params.id + " deleted");
  } catch (e) {
    res.status(500).send("error occured");
  }
});

//PATCH to add a test
// NEEDS AUTH
router.patch("/user/test", async (req, res) => {
  try {
    const userPatchLoc = await users.findByIdAndUpdate(req.params.id, req.body);

    await userPatchLoc
      .save()
      .then((item) => {
        res.send("item saved to database" + "\n" + userPatchLoc);
      })
      .catch((err) => {
        res.status(400).send("unable to save to database");
      });
  } catch (e) {
    res.status(500).send("error occured");
  }
});

//PATCH to add location

router.patch("/user/location", auth, async (req, res) => {
  try {
    var Location = req.body.Location;
    await users.updateOne(
      { _id: req.body.id },
      { $push: { Location: Location } }
    );
    res.status(200).send();
  } catch (e) {
    res.status(500).send("error occured");
  }
});
//SHOW ALL VISITS
router.post("/user/allVisits", auth, async (req, res) => {
  try {
    const user = await users.findById(req.body._id);
    res.status(200).send(user.visits);
  } catch (e) {
    res.status(400).send("can not show list of visits");
  }
});

//Logout
router.get("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send("Logged out successfully");
  } catch (e) {
    res.status(500).send;
  }
});

//add a visit
router.patch("/user/visit", auth, async (req, res) => {
  const _id = req.body._id;

  const poi = req.body.poi;
  const date = new Date();
  const myVisit = {
    poi: poi,
    date: date,
  };

  try {
    const newUser = await users.findOneAndUpdate(
      { _id: _id },
      { $push: { visits: myVisit } }
    );

    console.log(newUser);
    res.send("visit added");
  } catch (e) {
    res.status(400).send("visit did not added");
  }
});
//send traffic estimation to a poi
router.post("/user/estimation", auth, async (req, res) => {
  const POIName = req.body.POIName;
  const traffic = req.body.traffic;

  try {
    await pois.findOneAndUpdate(
      { POIName: POIName },
      { $push: { avgTraffic: traffic } }
    );
    const poi = await pois.findOne({ POIName });

    const validDates = poiValidTime({ poi });
    const perCent = completeness({ poi });

    await pois.findOneAndUpdate({ POIName: POIName }, (poi.perCent = perCent));

    res.send("estimation added");
  } catch (e) {
    res.status(400).send("not such a poi");
  }
});
//Positive test submit
router.post("/user/positive", auth, async (req, res) => {
  const positive = true;
  const date = req.body.date;
  const _id = req.body._id;
  const tests = {
    positive: positive,
    date: date,
  };

  try {
    await users.findOneAndUpdate({ _id: _id }, { test: tests });

    res.send("positive test submited");
  } catch (e) {
    res.status(400).send("cannot submit positive test");
  }
});
//alert for positive
router.post("/user/alert", auth, async (req, res) => {
  const _id = req.body._id;
  var covidAlert = false;
  try {
    const pos19 = await users.find({ "test.positive": "true" }); //pos19 is an array of users who are positive

    const user = await users.findById(req.body._id); //user is the information of the logged in user

    const userVisits = user.visits;

    var now = Math.floor(Date.now() / 1000); //get cuurent time at unix format

    for (let i = 0; i < pos19.length; i++) {
      var testDate = Math.floor(pos19[i].test.date / 1000);

      if (now - testDate < 604800 && pos19[i]._id != _id) {
        //keep an array of users that have possitive test the last 7 days an are different from user logged in

        var covid = pos19[i];

        for (let k = 0; k < covid.visits.length; k++) {
          for (let j = 0; j < userVisits.length; j++) {
            if (covid.visits[k].poi == userVisits[j].poi) {
              //check if 2 users have been at the same poi
              var visitDate = Math.floor(covid.visits[k].date / 1000);
              var myVisitDate = Math.floor(userVisits[j].date / 1000);

              if (
                visitDate - myVisitDate <= 7200 &&
                visitDate - myVisitDate >= -7200
              ) {
                //check if they where there in a period of +-2 hours
                covidAlert = true;
                var visitAlert = userVisits[j];
              } else {
                visitAlert = null;
              }
            }
          }
        }
      } else {
        covidAlert = false;
      }
    }

    res.status(200).send({ covidAlert, visitAlert });
  } catch (e) {
    res.status(400).send("something went wrong");
  }
});

//get all Pois
router.get("/user/allPois", auth, async (req, res) => {
  try {
    const allpois = await pois.find({});
    res.send(allpois);
  } catch (e) {
    res.status(500).send();
  }
});

//get poi completeness
router.get("/user/poiCompleteness", auth, async (req, res) => {
  const POIName = req.body.POIName;
  const poi = await pois.findOne({ POIName });

  const validDates = poiValidTime({ poi });
  const perCent = completeness({ poi });
  const pois = await pois.findOneAndUpdate(
    { POIName: POIName },
    { perCent: perCent }
  );

  res.send("the POI is " + perCent + "% full");
});

//return poi by name
router.post("/user/poi", auth, async (req, res) => {
  var poiName = req.body.poiName;
  const poi = await pois.find({ POIName: poiName });
  res.send(poi);
});

//------------------------ADMINNNN-------------------//

//ADMIN CREATE
router.post("/admin/create", async (req, res) => {
  const adminJson = req.body;
  var myData = new admininstrators(adminJson);
  await myData.save();
  res.send("admin created");
});
//admin log in
router.post("/admin/login", async (req, res) => {
  try {
    const administrator = await admininstrators.findByCredentialsAdmin(
      req.body.adminName,
      req.body.adminPassword
    );

    return res.status(200).send(administrator);
  } catch (e) {
    res.status(400).send("unable to login");
  }
});
//give an id and delete user
router.delete("/admin/delete", async (req, res) => {
  try {
    const poisDelete = await pois.deleteMany({});

    res.status(200).send("Pois deleted");
  } catch (e) {
    res.status(500).send("error occured");
  }
});

module.exports = router;
