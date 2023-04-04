const poi=require('../routers/user')
const pois=require('../models/pois')
const users=require('../models/user')


//run all pois.avgTraffic.date
//delete pois.avgTraffic.date before 2 hours
//save new item to database
var timeValidator=async ({poi})=>{

    
     var now= Math.floor(Date.now() / 1000)                  //get cuurent time at unix format
     var poi_id=poi.id

    for(i=0; i<poi.avgTraffic.length; i++)
   {
    var trafDate= Math.floor(poi.avgTraffic[i].date/1000)  //database element of avgTraffic array
        if (now-trafDate>7200){                           //check if 7200 seconds have past then delete estimation from database
           
           poi.avgTraffic[i].remove()                     //delete invalid dates
        }
    var newPoi= await pois.findOneAndUpdate({_id:poi_id},poi)//update avgTraffic array
    await newPoi.save()
   }
}

module.exports= timeValidator