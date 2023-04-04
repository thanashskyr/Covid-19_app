const express = require("express");
const pois = require("../models/pois");
const router = new express.Router();

//CREATE POIS
router.post("/pois/create", async (req, res) => {
  var POI = req.body;

  var poi = new pois(POI); //store json to myData

  await poi.save();

  res.status(201).send(poi);
});

router.patch("/pois/patch", async (req, res) => {
  var change = req.body.changeObj;
  var Poi = req.body.changeObj.POIName;
  // change = JSON.stringify(change);

  await pois.findOneAndUpdate({ POIName: Poi }, change);
  const abc = await pois.findOne({ POIName: Poi });

  const capacity = abc.maxCapacity;

  const traffic = abc.avgTraffic[abc.avgTraffic.length - 1].people;

  const percent = (traffic / capacity) * 100;

  const change1 = {
    perCent: percent,
  };
  await pois.findOneAndUpdate({ POIName: Poi }, change1);

  res.status(200).send("item saved to database");
});

module.exports = router;
