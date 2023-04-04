const pois = require("../models/pois");
const user = require("../models/user");
const poi = require("../routers/user");

const completeness = ({ poi }) => {
  var rev = 0;
  for (let i = 0; i < poi.avgTraffic.length; i++) {
    rev = rev + poi.avgTraffic[i].people;
  }
  const average = rev / poi.avgTraffic.length;
  const percent = (average / poi.maxCapacity) * 100;

  return percent;
};

module.exports = completeness;
