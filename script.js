document.body.style.userSelect = "none";
geojsonFixData = fixData;
var mode = "ALL";
var radarCanvas;
var toprightCanvas;
var rctx;
var map;
var maxFlights = 30;
var hookedFlight = -999;
var showrouteflightid = -1;
var vrtTimeHorizonMins = 30.0;
var vrtScaleMins = 1.0;
var numTimes = vrtTimeHorizonMins/vrtScaleMins;
var vrtCurrentPosOffset = 5;
var vrtMaxLevel = 330;
var vrtMaxMaxLevel = 400;
var vrtMinLevel = 180;
var vrtMinMinLevel = 0;
var clockStep = 1000;
var vrtGraduation = 10;
var bSetClearanceIssueTime = true;
var selectedClearanceIssueTime = 0;
var selectedClearanceTime = 0;
var selectedClearanceLevel = 0;
var selectedHeading = 0;
var selectedSpeed = 0;
var trackPositions= [];
var tdbWidth = 45;
var tdbHeight = 60;
// Store headings/speeds
var flightHeadingClearances = new Map();
var flightHeadingProbeClearances = new Map();
var flightSpeedClearances = new Map();
var flightSpeedProbeClearances = new Map();
var bDirectRouteProbe = false;
var directRouteFix = "";
var directRouteFlight = -1;

var originalHeading;
var originalSpeed;

var flightSpeedClearances = new Map();

var flights = [{callsign: "BAW123", fixroute:[{name:"BUCFA",level:200},{name:"NEDEX",level:250},{name:"HEMEL",level:300}]},
			   {callsign: "RYR209", fixroute:[{name:"TEWXI",level:280},{name:"ELVOS",level:240},{name:"CHASE",level:220}]},
			   {callsign: "KLM20",  fixroute:[{name:"ELEZE",level:150},{name:"BETAX", level:180},{name:"AMVEL",level:250}]},
			   {callsign: "EZY687", fixroute:[{name:"AMVEL",level:200},{name:"BETAX",level:230},{name:"BRUMI",level:300}]},
			   {callsign: "BAW007", fixroute:[{name:"BIFIN",level:250},{name:"UMBAG",level:290}]},
			   {callsign: "EIN138", fixroute:[{name:"TELBA",level:260},{name:"WELIN",level:290},{name:"KEMPY",level:320}]}];

let routes = [
 			 [{name:"EDFAR"},{name: "BETPO"},{name:"ITVIP"}],
			 [{name:"LANON"},{name: "EMKUK"},{name:"IDESI"}],
			 [{name:"UNFIT"},{name: "SOPIT"},{name:"IDESI"}],
			 [{name:"BAGIT"},{name: "DIGUT"},{name:"ROTNO"}],
			 [{name:"NUGRA"},{name: "SILVA"},{name:"NETVU"}],
			 [{name:"LONAN"},{name: "HEMEL"},{name:"KORXA"},{name:"EGSY"}],
			 [{name:"UNDUG"},{name: "BETPO"},{name:"EGCB"}]

			 ];

let testflights = [
{callsign: "EZY687",startTime: "09:00:00",ifl: 200,initSpeed: 300,fixroute:[{name:"DUCNO"},{name:"BUGUP"},{name:"KIDLI"},{name:"UMLAT"},{name:"TANET"},{name:"VABIK"}]},
{callsign: "DAL777",startTime: "09:00:00",ifl: 300,initSpeed: 300,fixroute: routes[0]},		  
{callsign: "BAW123",startTime: "09:00:00",ifl: 200,initSpeed: 300,fixroute:[{name:"BUCFA"},{name:"DIGUT"},{name:"HEMEL"},{name:"LOFFO"},{name:"REDFA"}]},
{callsign: "RYR209",startTime: "09:00:00", ifl: 220, initSpeed: 300,fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"},{name:"GODOS"}]},
{callsign: "AAL10",startTime: "09:02:00", ifl: 200, initSpeed: 300, fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"}]},
{callsign: "AAL20", startTime: "09:04:00", ifl: 220, initSpeed: 300,fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"}]},
{callsign: "TAL321", startTime: "09:00:00", ifl: 240, initSpeed: 300, fixroute:[{name:"FITBO"},{name:"WOBUN"},{name:"TABIS"},{name:"LOGAN"}]},
{callsign: "DAL51", startTime: "09:01:00", ifl: 230, initSpeed: 300,fixroute:[{name:"EMKAD"},{name:"SILVA"},{name:"FITBO"}]},
{callsign: "TAL123", startTime: "09:00:00", ifl: 230, initSpeed: 300,fixroute:[{name:"LOGAN"},{name:"TABIS"},{name:"WOBUN"},{name:"FITBO"}]},
{callsign: "RYR320", startTime: "09:05:00", ifl: 230, initSpeed: 300,fixroute:[{name:"LOGAN"},{name:"TABIS"},{name:"WOBUN"},{name:"FITBO"}]},
{callsign: "EIN72", startTime: "09:00:00", ifl: 230, initSpeed: 300,fixroute:[{name:"ELEZE"},{name:"SAPCO"},{name:"VELAG"},{name:"EDCOX"},{name:"BRAIN"},{name:"KONAN"}]},
{callsign: "THA092", startTime: "09:00:00", ifl: 150, initSpeed: 390,fixroute:[{name:"ADLOG"},{name:"BOGNA"},{name:"OTSID"},{name:"HILLY"},{name:"UMBUR"},{name:"EGLL"}]},
{callsign: "EZY688",startTime: "09:05:00",ifl: 230,initSpeed: 300,fixroute:[{name:"DUCNO"},{name:"BUGUP"},{name:"KIDLI"},{name:"UMLAT"},{name:"TANET"},{name:"VABIK"}]},
{callsign: "DAL778",startTime: "09:05:00",ifl: 240,initSpeed: 300,fixroute: routes[0]},		  
{callsign: "BAW124",startTime: "09:05:00",ifl: 240,initSpeed: 250,fixroute:[{name:"BUCFA"},{name:"DIGUT"},{name:"HEMEL"},{name:"LOFFO"},{name:"REDFA"}]},
{callsign: "RYR210",startTime: "09:05:00", ifl: 240, initSpeed: 200,fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"},{name:"GODOS"}]},
{callsign: "AAL11",startTime: "09:07:00", ifl: 250, initSpeed: 300, fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"}]},
{callsign: "AAL21", startTime: "09:12:00", ifl: 250, initSpeed: 300,fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"}]},
{callsign: "TAL322", startTime: "09:05:00", ifl: 250, initSpeed: 400, fixroute:[{name:"FITBO"},{name:"WOBUN"},{name:"TABIS"},{name:"LOGAN"}]},
{callsign: "DAL52", startTime: "09:06:00", ifl: 250, initSpeed: 350,fixroute:[{name:"EMKAD"},{name:"SILVA"},{name:"FITBO"}]},
{callsign: "TAL124", startTime: "09:05:00", ifl: 250, initSpeed: 320,fixroute:[{name:"LOGAN"},{name:"TABIS"},{name:"WOBUN"},{name:"FITBO"}]},
{callsign: "RYR321", startTime: "09:10:00", ifl: 250, initSpeed: 300,fixroute:[{name:"LOGAN"},{name:"TABIS"},{name:"WOBUN"},{name:"FITBO"}]},
{callsign: "EIN73", startTime: "09:05:00", ifl: 250, initSpeed: 300,fixroute:[{name:"ELEZE"},{name:"SAPCO"},{name:"VELAG"},{name:"EDCOX"},{name:"BRAIN"}]},
{callsign: "EZY689",startTime: "09:05:00",ifl: 220,initSpeed: 350,fixroute:[{name:"DUCNO"},{name:"BUGUP"},{name:"KIDLI"},{name:"UMLAT"},{name:"TANET"},{name:"VABIK"}]},
{callsign: "DAL779",startTime: "09:10:00",ifl: 230,initSpeed: 350,fixroute: routes[0]},		  
{callsign: "BAW125",startTime: "09:10:00",ifl: 230,initSpeed: 250,fixroute:[{name:"BUCFA"},{name:"DIGUT"},{name:"HEMEL"},{name:"LOFFO"}]},
{callsign: "RYR211",startTime: "09:10:00", ifl: 230, initSpeed: 200,fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"},{name:"GODOS"}]},
{callsign: "AAL12",startTime: "09:23:00", ifl: 240, initSpeed: 300, fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"}]},
{callsign: "AAL22", startTime: "09:14:00", ifl: 240, initSpeed: 300,fixroute:[{name:"HAWFA"},{name:"DONNA"},{name:"ADMIS"},{name:"KEMPY"}]},
{callsign: "TAL323", startTime: "09:10:00", ifl: 240, initSpeed: 400, fixroute:[{name:"FITBO"},{name:"WOBUN"},{name:"TABIS"},{name:"LOGAN"}]},
{callsign: "DAL53", startTime: "09:11:00", ifl: 240, initSpeed: 350,fixroute:[{name:"EMKAD"},{name:"SILVA"},{name:"FITBO"}]},
{callsign: "TAL125", startTime: "09:10:00", ifl: 260, initSpeed: 320,fixroute:[{name:"LOGAN"},{name:"TABIS"},{name:"WOBUN"},{name:"FITBO"}]},
{callsign: "RYR322", startTime: "09:14:00", ifl: 220, initSpeed: 300,fixroute:[{name:"LOGAN"},{name:"TABIS"},{name:"WOBUN"},{name:"FITBO"}]},
{callsign: "EIN74", startTime: "09:10:00", ifl: 210, initSpeed: 370,fixroute:[{name:"ELEZE"},{name:"SAPCO"},{name:"VELAG"},{name:"EDCOX"},{name:"BRAIN"}]}
				  ];		  
let testflights1 = [
{callsign: "TAL321", startTime: "09:00:00", ifl: 150, initSpeed: 300,fixroute:[{name:"FITBO"},{name:"WOBUN"},{name:"TABIS"},{name:"LOGAN"}]},
{callsign: "TAL123", startTime: "09:00:00", ifl: 150, initSpeed: 300,fixroute:[{name:"LOGAN"},{name:"TABIS"},{name:"WOBUN"},{name:"FITBO"}]}
];	
					  
let tamaEastSouthFlights = [
{callsign: "ADG11", startTime: "09:00:00", ifl: 330, initSpeed: 300,fixroute:routes[1]},
{callsign: "LWA21", startTime: "09:00:00", ifl: 310, initSpeed: 300,fixroute:routes[2]},
{callsign: "MEL31", startTime: "09:00:00", ifl: 310, initSpeed: 300,fixroute:routes[3]},
{callsign: "ADG41", startTime: "09:00:00", ifl: 250, initSpeed: 300,fixroute:routes[4]}
];


let tamaWestNorthFlights = [
{callsign: "MEL51", startTime: "09:00:00", ifl: 340, initSpeed: 300,fixroute:routes[5]},
{callsign: "LWA61", startTime: "09:00:00", ifl: 340, initSpeed: 300,fixroute:routes[6]}];


function deepCopyMap(originalMap) {
    return new Map(
        [...originalMap].map(([key, value]) => 
            [key, (value instanceof Object) ? structuredClone(value) : value]
        )
    );
}

function getFlightId(callsign){
	let flightId = 999; // We want it to fail
	for (f = 0; f < flights.length; f++){
		if (flights[f].callsign == callsign){
			flightId = f;
			break;
		}
	}
	return flightId;
}	
					  
// map of flight->clearance events
var initClearanceEvents= new Map();


var clearanceEvents = new Map();

//tamaEastSouthClearanceEvents= new Map();
function addTamaClearanceEvents(){
	clearanceEvents.set(getFlightId("ADG11"),[{issue_time:"09:14:00",time:"09:27:00",level: 270,probe:false}]);
	clearanceEvents.set(getFlightId("LWA21"),[{issue_time:"09:14:00",time:"09:27:00",level: 310,probe:false}]);
	clearanceEvents.set(getFlightId("MEL31"),[{issue_time:"09:14:00",time:"09:27:00",level: 290,probe:false}]);
	clearanceEvents.set(getFlightId("ADG41"),[{issue_time:"09:14:00",time:"09:27:00",level: 350,probe:false}]);
	clearanceEvents.set(getFlightId("LWA61"),[{issue_time:"09:14:00",time:"09:27:00",level: 220,probe:false}]);

}
function initEvents(){
	initClearanceEvents.set(getFlightId("EZY687"),[{issue_time:"09:01:00",time:"09:02:00",level:210,probe:false},{issue_time:"09:04:00",time:"09:09:00",level: 220,probe:false},{issue_time:"09:13:00",time:"09:15:10",level: 250,probe:false}]);
	initClearanceEvents.set(getFlightId("BAW123"),[{issue_time:"09:13:00",time:"09:27:00",level: 290,probe:false}]);
	initClearanceEvents.set(getFlightId("RYR209"),[{issue_time:"09:05:00",time:"09:07:00",level: 250,probe:false},{issue_time:"09:10:00",time:"09:13:10",level: 300,probe:false},{issue_time:"09:13:30",time:"09:17:00",level:310,probe:false}]);
	initClearanceEvents.set(getFlightId("THA092"),[{issue_time:"09:00:30",time:"09:15:00",level: 10,probe:false}]);
	initClearanceEvents.set(getFlightId("EIN72"),[{issue_time:"09:14:00",time:"09:27:00",level: 250,probe:false}]);

	clearanceEvents = deepCopyMap(initClearanceEvents);
	addTamaClearanceEvents();
}

const clearanceEventColours = ['rgb(80,180,25)','rgb(51,111,166)','rgb(230,200,50)','rgb(255,255,0)','rgb(255,0,255)','rgb(0,255,255)'];
var scenario;
//var nineOclock = new Date();
var nineOclock = "09:00:00";
var simTime = new Date();
simTime = setTimeFromString(simTime, nineOclock);

var bInteractionFound = false;
var bPlay = true;
var bNewEvent = false;
var bShowAllEvents = false;
var onTickIntervalId;
var updateDataIntervalId;
var emergencyEventsIntervalId;
var conflictEventsIntervalId;

// Emergency Support - events that cause a popup to appear with options to re-route the aircraft, create a buffer around
var emergencyEvents = new Map();
var initEmergencyEvents = new Map(); // Flight id is the key
initEmergencyEvents.set(0,[{time:"09:01:00",time:"09:02:00",level:210,probe:false},{issue_time:"09:04:00",time:"09:09:00",level: 220,probe:false},{issue_time:"09:13:00",time:"09:15:10",level: 250,probe:false}]);

// Conflict Detection and Resolution
var conflictEvents = new Map();
//initConflictEvents = 

function setTimeFromString(date, timeString) {
    				let [hours, minutes, seconds] = timeString.split(':').map(Number);
    				date.setHours(hours, minutes, seconds);
    				return date;
}

function getRandomNumber(min, max) {
	// Generate a random number between min and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function GenerateRandomFlights()
{
	// Generate some random flights and routes
	for (let f=0; f < maxFlights; f++){
		flights[f]={};
		let numFixes = getRandomNumber(2,5);
		let levelinc = getRandomNumber(1,3)*10;
		flights[f].fixroute = [{}];
		var Speed = 500;
		flights[f].ifl = getRandomNumber(10,20)*10;
		flights[f].cfl = getRandomNumber(0,30)*10;
		var Level = flights[f].ifl + getRandomNumber(1,8)*10;
		flights[f].startTime = "09:00:00";
		flights[f].initSpeed = 300;
		for (let nf=0; nf < numFixes; nf++)
		{
			flights[f].fixroute[nf] = {};
			// get random fix number
			let rf = getRandomNumber(0,geojsonFixData.features.length-1);
			flights[f].callsign = "BAW0"+f;
			flights[f].fixroute[nf].name = geojsonFixData.features[rf].properties.name;
			flights[f].fixroute[nf].level = 0;
			flights[f].fixroute[nf].speed = Speed;
			Level = Level+levelinc;
		}	
	}
}

// Initialise flights object with 
function initFlights(){
	flights = [];
	testflights = testflights.concat(tamaEastSouthFlights);
	testflights = testflights.concat(tamaWestNorthFlights);
	flights = JSON.parse(JSON.stringify(testflights));
}
function initData(){
	initFlights();
	initEvents();
}
initData();



var centre = {lat: 51.7, lng: -1.0};
// Array to store radar TDB shapes
var TDBShapes = new Map();		
var VRTInteractionShapes = [];
var VRTLevelShapes = [];
var VRTTimeShapes = [];
var VRTAnchorShapes = [];	   
var trajectories = [];

function drawVrtAnchor(ctx, x, y, radius, color) {
    ctx.beginPath();
   	ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, Math.PI * 2); // Create a circle
    VRTAnchorShapes.push({x: x,y: y, r: radius});
    ctx.fill(); // Fill the circle
    ctx.stroke();
}
function drawTriangle(ctx,x,y,color) {
 ctx.beginPath();
 ctx.fillStyle=color;
 ctx.moveTo(x+6, y);
 ctx.lineTo(x-6,y+6);
 ctx.lineTo(x-6,y-6);
 ctx.closePath();
 ctx.fill();
}

function isPointInCircle(px, py, x, y, r) {
    // Calculate the squared distance between the point and the circle's center
    const distanceSquared = (px - x) * (px - x) + (py - y) * (py - y);
    // Calculate the squared radius
    const radiusSquared = r * r;
    // Check if the squared distance is less than or equal to the squared radius
    return distanceSquared <= radiusSquared;
}
function timeToLevel(currentLev, nextLev)
{
	const climbDescentRate = 2000; //ft/min
	var mins = Math.abs(nextLev-currentLev)*100/climbDescentRate;	
	return mins;					
}
	
function newClimbLevel(currentLev, time)
{
	const climbDescentRate = 2000; //ft/min
	var newLevel = currentLev + (time*climbDescentRate)/100;
	return newLevel;
}
function newDescendLevel(currentLev, time)
{
	const climbDescentRate = 2000; //ft/min
	var newLevel = currentLev - (time*climbDescentRate)/100;
	return newLevel;
}

function timeToPosHrs(currentPos, nextPos, speed)
{
	var distanceNm = haversineDistance(currentPos.lat, currentPos.lng, nextPos.lat, nextPos.lng);		
	var timeHrs = distanceNm/speed; //kts
	
	return timeHrs;
}
function drawInteractionSymbol(ctx,x,y,flightid,color)
{
	ctx.beginPath();
	ctx.fillStyle=color;
	ctx.moveTo(x-3, y);
	ctx.lineTo(x,y-6);
 	ctx.lineTo(x+3,y);
 	ctx.closePath();
 	ctx.fill();
	
	ctx.fillText(flights[flightid].callsign,x+10, y);
	
	VRTInteractionShapes.push({shapeX: x+20, shapeY: y, width: 30,height:15, flight: flightid});
}

function flightLevelAtTime(flightid, time)
{
	// loop through the trajectory and return the level the flight is at a particular time
	for (let p=0; p < trajectories[flightid].length; p++)
	{
		var point = trajectories[flightid][p];
		if (point.time.getTime() > time && p > 0)
		{
			var lastPointTime = new Date(trajectories[flightid][p-1].time);
			var ratio = (new Date(time).getTime()-lastPointTime.getTime())/(point.time.getTime()-lastPointTime.getTime());
			var lastPointLevel = trajectories[flightid][p-1].level;
			return lastPointLevel+(ratio*(point.level-lastPointLevel));
		}
		
	}
}

function calculateInitialTrackPositions()
		{
			for (let i=0; i < flights.length; i++)
			{
				// set initial track position
				var startTime = new Date();
				startTime = setTimeFromString(startTime,flights[i].startTime);
				var FixCoord = GetFixCoords(flights[i].fixroute[0].name,i); 
				let bearing = 0;
				if (flights[i].fixroute.length > 1){
					var NextFixCoord = GetFixCoords(flights[i].fixroute[1].name,i);					
					bearing = calculateBearing(FixCoord.lat,
											   FixCoord.lng,
											   NextFixCoord.lat,
											   NextFixCoord.lng);
				}

				var newPoint = {time	: startTime,
    							name	: "INIT",
    							coords	: FixCoord,
    							level	: flights[i].ifl,
    							speed	: flights[i].initSpeed,
    							bearing	: bearing,
    							sector: "",
					            cid: -1,
					            rocd: 0
    							};

				trackPositions[i] = newPoint;
				// Remove the first fix from the route as we have progressed past
				flights[i].fixroute.shift();
			}			
		}		
function GetFixCoords(name,flightid)
{
	let bFound = false;
	geojsonFixData.features.forEach(function(feature) {
		// Access feature properties and geometry
		var properties = feature.properties;
  		var geometry = feature.geometry;

  		// Example: Access coordinates of the geometry
  		if (geometry.type === "Point" && properties.name == name) {
    		XY = geometry.coordinates;
   			bFound = true;
  		}
   });
   if (!bFound){
   	airportData.features.forEach(function(feature) {
		// Access feature properties and geometry
		var properties = feature.properties;
  		var geometry = feature.geometry;

  		// Example: Access coordinates of the geometry
  		if (geometry.type === "Point" && properties.name == name) {
    		XY = geometry.coordinates;
   			bFound = true;
  		}
   	});
   }
   // If called HDG return the position depending on if probing or not
   if (!bFound && name == 'HDG'){
	   if (flightHeadingProbeClearances.has(flightid)){
		   	headingData = flightHeadingProbeClearances.get(flightid);
			XY = [headingData.probePos.lng, headingData.probePos.lat];
	   		bFound = true;
	   } else if (flightHeadingClearances.has(flightid)){
		   	headingData = flightHeadingClearances.get(flightid);
			XY = [headingData.pos.lng, headingData.pos.lat];
	   		bFound = true;
	   }     
	}

  return {lat: XY[1],lng: XY[0]};
}



function calculateTrajectoriesV2()
{
			// For each flight:
			// Add first point as first fix with IFL
			// Calculate time to reach RFL from IFL.
			// Search along route for other level clearances, and calculate time to climb to each of them
			// E.g. Next point will either be a level achievement or fix achievement
			//
			trajectories = [];

			const TargetType = Object.freeze({NEXT_FIX_POINT:0, CLEARANCE_BOC_POINT:1, CLEARANCE_TOC_POINT:2});
			for (let i=0; i < flights.length; i++)
    		{
				var Traj = [];
				// Push the current track position onto the front and calculate bearing to next fix
				Traj.push(trackPositions[i]);
    			var startTime = new Date();
  				startTime = setTimeFromString(startTime, flights[i].startTime);
				fixes = structuredClone(flights[i].fixroute);
				// if the flight has a heading
				if (flightHeadingClearances.has(i) || flightHeadingProbeClearances.has(i)){
					fixes = [];
					// calculate a position 200Nm away
					fixes.push({name:"HDG",speed:0,level:0});
				}
				if (bDirectRouteProbe && i == directRouteFlight){
					fixes = [];
					fixes.push({name: directRouteFix});
				}
    			if (simTime.getTime() >= startTime.getTime())
    			{
    		
            	var Target = TargetType.NEXT_FIX_POINT;
				var bFinished = false;
    			trajectories[i] = [];
				var fix_index=0;
				var clearance_index=0;

				var currentLevel;
				var currentSpeed;
   				var currentPos;
   				var currentBearing = 0;
   				var currentROCD = 0;
				var currentTarget = 0;
 				var nextFixTime = new Date(startTime);
				var clearanceIssueTime = new Date(startTime);
				var clearanceTime = new Date(startTime);				
				var pointIndex = 0;
				var nextPoint;
				var events = [];

				if (clearanceEvents.has(i)){
					events = clearanceEvents.get(i).slice();				
				}
				
				var lastPointTime = new Date(trackPositions[i].time);
				currentLevel = Traj[0].level;
				currentSpeed = Traj[0].speed;

				// Check if the flight has a speed clearance
				if (flightSpeedProbeClearances.has(i)){
					currentSpeed = flightSpeedProbeClearances.get(i);
					Traj[0].speed = currentSpeed;
				} else if (flightSpeedClearances.has(i)){
					currentSpeed = flightSpeedClearances.get(i);
					Traj[0].speed = currentSpeed;
				}
								
				
				currentPos = Traj[0].coords;
								
   				var fixPos = GetFixCoords(fixes[0].name,i);    				    				
   				currentBearing = calculateBearing(currentPos.lat, currentPos.lng, fixPos.lat, fixPos.lng);				
				var eventNo = -1;
				var bClearanceIssuedPointAdded = false;
				// Fix loop. The first/current point when entering is the current track position
    			while (!bFinished)
    			{    	    									
					// Calculate time to travel to next fix and set time
					var nextFixPos = GetFixCoords(fixes[fix_index].name,i);    				    				
					var distanceNm = haversineDistance(currentPos.lat, currentPos.lng, nextFixPos.lat, nextFixPos.lng);
					var decimalHrs = distanceNm/currentSpeed; //kts						
					var milliseconds = decimalHrs*60*60*1000;
					nextFixTime.setTime(lastPointTime.getTime() + milliseconds);
						
					//might not need this// Handle hour increment if minutes exceed 59
					if (nextFixTime.getMinutes() >= 60) {
					    nextFixTime.setHours(nextFixTime.getHours() + 1);
					    nextFixTime.setMinutes(nextFixTime.getMinutes() - 60);
					}
    				var bLastFix = (fix_index == fixes.length-1);
    				var nextLevelClearance;
					var clearanceIssueTime;
					var clearanceTime;
					var clearanceIssueTimeDeltaMins;
					var clearanceTimeDeltaMins;

    				// Ensure we have clearance events at this index else just fly to next fixes
					var bValidClearance = false;
					if (clearance_index < events.length && events.length != 0){
   						bValidClearance = true;    				    				    					
	    				nextLevelClearance = events[clearance_index].level;
						clearanceIssueTime = setTimeFromString(clearanceIssueTime, events[clearance_index].issue_time);
						clearanceTime = setTimeFromString(clearanceTime, events[clearance_index].time);
						clearanceIssueTimeDeltaMins = (clearanceIssueTime.getTime() - lastPointTime.getTime())/60/1000;
						clearanceTimeDeltaMins = (clearanceTime.getTime() - lastPointTime.getTime())/60/1000;
					}
											
					// calculate time to achieve the next fix from the current pos
					var timeToNextFixMins = timeToPosHrs(currentPos, nextFixPos , currentSpeed)*60;	
					currentBearing = calculateBearing(currentPos.lat, currentPos.lng, nextFixPos.lat, nextFixPos.lng);
																														
					// this fix has a level associated with it calculate time to achieve that level	
					//var timeToAchieveLevelClearance = timeToLevel(currentLevel,nextLevelClearance);	
						
					// calculate next TARGET
					// 
					if (bValidClearance){
						if (timeToNextFixMins < clearanceIssueTimeDeltaMins){
							currentTarget = TargetType.NEXT_FIX_POINT;
						} else if (clearanceIssueTimeDeltaMins < timeToNextFixMins) {
							currentTarget = TargetType.CLEARANCE_BOC_POINT;
						}
						if (bClearanceIssuedPointAdded && timeToNextFixMins < clearanceTimeDeltaMins){
							currentTarget = TargetType.NEXT_FIX_POINT;
						}
						if (bClearanceIssuedPointAdded && clearanceTimeDeltaMins < timeToNextFixMins){
							currentTarget = TargetType.CLEARANCE_TOC_POINT;
						}
					}else{
						currentTarget = TargetType.NEXT_FIX_POINT;
					}
											
					
					if (currentTarget == TargetType.CLEARANCE_BOC_POINT){
    					currentROCD = Math.round((nextLevelClearance*100-currentLevel*100)/(clearanceTimeDeltaMins-clearanceIssueTimeDeltaMins));
						currentPos = calculateNewLatLonTimeSpeedBearing(currentPos.lat, currentPos.lng, clearanceIssueTimeDeltaMins/60, currentSpeed, currentBearing);
						lastPointTime.setTime(lastPointTime.getTime()+clearanceIssueTimeDeltaMins *60*1000 );
						var pointTime = new Date(lastPointTime);
						var currentSector = getSector(i,currentPos);
						nextPoint = {time	: pointTime,
    								name	: "BOC",
    								coords	: currentPos,
    								level	: currentLevel ,
    								speed	: currentSpeed ,
    								bearing	: currentBearing,
    								sector  : currentSector,
    								cid		: clearance_index,
    								rocd	: structuredClone(currentROCD) };
    					Traj.push(nextPoint);
    						
    					// calculate currentROCD
    					bClearanceIssuedPointAdded = true;
    				} else if (currentTarget == TargetType.NEXT_FIX_POINT){
    					// using currentROCD and currentLevel work out level fix should be at
    					var currentSector = getSector(i,nextFixPos);
    					currentLevel = currentLevel+(currentROCD*timeToNextFixMins)/100;
						lastPointTime = new Date(nextFixTime);

						// calculate next bearing from here as currentBearing is from the previous fix
						var nextBearing = 0;
						if (fix_index != fixes.length-1){
							var nextnextFixPos = GetFixCoords(fixes[fix_index+1].name,i);    				    				
   							nextBearing = calculateBearing(currentPos.lat, currentPos.lng, nextnextFixPos.lat, nextnextFixPos.lng);	
						}

    					// Now add a point which the next level at the fix pos
    					nextPoint = {time	: new Date(nextFixTime),
    							name	: fixes[fix_index].name,
    							coords	: nextFixPos ,
    							level	: currentLevel,
    							speed	: currentSpeed ,
	   							bearing	: nextBearing,
	   							sector  : currentSector,
	   							cid		: -1,
	   							rocd	: structuredClone(currentROCD)
	   							};    	
		    			Traj.push(nextPoint);
			    		currentPos = nextFixPos;
						fix_index++;
						if (fix_index >= fixes.length){
							bFinished = true;
						}
							

    				} else if (currentTarget == TargetType.CLEARANCE_TOC_POINT){
    					// Calculate new pos at timeToAchieveLevelClearance away
						var levelAchievedPos = calculateNewLatLonTimeSpeedBearing(currentPos.lat, currentPos.lng, clearanceTimeDeltaMins/60, currentSpeed, currentBearing);
						var nextLevel= nextLevelClearance;
						// Calc new time from current time
						lastPointTime.setTime(lastPointTime.getTime()+clearanceTimeDeltaMins*60*1000 );
						var pointTime = new Date(lastPointTime);
						var currentSector = getSector(i,levelAchievedPos);
						currentROCD = 0;

						// Add new point which is at the next level and pos
    					nextPoint = {time	: pointTime,
    								name	: "TOC",
    								coords	: levelAchievedPos,
    								level	: nextLevel,
    								speed	: currentSpeed ,
    								bearing	: currentBearing,
    								sector  : currentSector,
				    				cid		: clearance_index,
				    				rocd	: structuredClone(currentROCD) };
 				    								
    					Traj.push(nextPoint);
    					currentPos = levelAchievedPos;
						currentLevel = nextLevel;
						clearance_index++;
    					bClearanceIssuedPointAdded = false;
    				}	    									    							    																																																																								 					    									
    			}
	    		trajectories[i] = Traj;	
	    	  }
	    	  else
	    	  {
	    	  	trajectories[i] = new Array();
	    	  }
    		}
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
	
// Probably need to thinkabout resizing and 
	radarCanvas = document.getElementById('radar');
    var radarContainer = document.querySelector('.radar-canvas-container');            
    // Set canvas dimensions to match the container's dimensions
    radarCanvas.width = radarContainer.clientWidth;
    radarCanvas.height = radarContainer.clientHeight;
    
    toprightCanvas = document.getElementById('top');
    var toprightContainer = document.querySelector('.top-canvas-container');            
    // Set canvas dimensions to match the container's dimensions
    toprightCanvas.width = toprightContainer.clientWidth;
    toprightCanvas.height = toprightContainer.clientHeight;    

    // Draw a rectangle for testing
    rctx = radarCanvas.getContext('2d');
    rctx.clearRect(0, 0, radarCanvas.width, radarCanvas.height); // Clear radar
    // Initial position of the rectangle
    rctx.fillStyle = 'rgb(115,159,169,255)';
    // Draw a rectangle (x, y, width, height)
    rctx.font = "12px Roboto";
		   
    // Initialize the leaflet map and set its view to the specified coordinates and zoom level
    map = L.map('map',{wheelPxPerZoomLevel:2000,
    				   zoomDelta:0.5, 
    				   zoomSnap:0.5, 
    				   zoomAnimation: false,
    				   doubleClickZoom: false }).setView([centre.lat,centre.lng], 9);
    //map.dragging.disable();
	//L.geoJSON(coastlinesData, style = {"color": "#90a090"}).addTo(map);
		
    // Add sectors data to the map
    L.geoJSON(sectorData, {
         style: function (feature) {
		if (feature.properties.name[0].text === "SWANWICK AC S12_1")
		{
			return {
                    color: 'blue',       // Set the outline color to red for Feature 1
                    weight: 2,          // Set the weight of the outline
                    fillColor: 'black', // Set fill color to black
                    fillOpacity: 0      // Ensure the polygon is not filled
                };
		}
		else
		{
          	      return {
                    color: 'grey',       // Set the outline color to white
                    weight: 1,            // Set the weight of the outline
                    fillColor: 'black',   // Set fill color to black
                    fillOpacity: 0        // Ensure the polygon is not filled
                };
		}
    }
    }).addTo(map);

		// Function to style the point feature
        function pointToLayer(feature, latlng) {
            var geojsonMarkerOptions = {
                radius: 1,
                fillColor: "rgb(255,0,0)",
                color: "#000",
                weight: 0.5,
                opacity: 0.2,
                fillOpacity: 0.2
            };

            var marker =  L.circleMarker(latlng, geojsonMarkerOptions);
			 marker.bindTooltip(feature.properties.name, {	
                permanent: true,
                direction: 'bottom',
                className: 'fix-tooltip',
                fillColor: 'black',
                opacity: 0.3
            });			
            return marker;
        }
		//var fixesLayer = L.geoJSON(geojsonFixData,{
        //    pointToLayer: pointToLayer
        //});
        var fixesLayer = L.geoJSON(geojsonFixData,{
    // This overrides the default marker behavior
    pointToLayer: function (feature, latlng) {
        // Customize the marker as a circle
        return L.circleMarker(latlng, {
            radius: 2,           // Circle size
            fillColor: "#a0a0a0", // Fill color
            color: "#000",        // Border color
            weight: 1,            // Border width
            opacity: 1,           // Border opacity
            fillOpacity: 0.8      // Fill opacity
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
            layer.bindTooltip(feature.properties.name,{	
                permanent: true,
                direction: 'bottom',
                className: 'fix-tooltip',
                fillColor: 'black',
                opacity: 0.3,
                fillOpacity: 0
            }); // Bind a popup to each feature
        }
    }
});        
		// Function to style the point feature
        function airportToLayer(feature, latlng) {
            var geojsonMarkerOptions = {
                radius: 0,
                fillColor: "rgb(255,0,0,200)",
                color: "#000",
                weight: 0.5,
                opacity: 0.2,
                fillOpacity: 0.2
            };

            var marker =  L.circleMarker(latlng, geojsonMarkerOptions);
			 marker.bindTooltip(feature.properties.name, {	
                permanent: true,
                direction: 'bottom',
                className: 'airport-tooltip',
                fillColor: 'black',
                opacity: 0.3
            });			
            return marker;
        }

		var airportLayer = L.geoJSON(airportData,{
            pointToLayer: airportToLayer
        });

	 
        // Disable the map tiles
		var mapLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', { attribution: '&copy; Stamen Design', maxZoom:20, minZoom:6.5 });
		// Define base layers (for layer control, optional)
	    var baseLayers = {
	    };

	    // Define overlay layers (can toggle GeoJSON layers)
	    var overlayLayers = {
	        "Fixes": fixesLayer,
	        "Airports": airportLayer,
	        "Coast" : mapLayer 
	    };

    	// Add layer control to the map
    	L.control.layers(baseLayers, overlayLayers).addTo(map);


		// modify the radar canvas overlay when the zoom level changes so that the tracks are re-drawn in the correct place
		map.on('zoomstart', function() {
			});

		map.on('zoom', function() {
    		drawTracks(radarCanvas);
			});
			
		// Add an event listener for the 'move' event
        map.on('move', function() {
            drawTracks(radarCanvas);
        });
         // Define the bounds (southwest and northeast corners)
        var southWest = L.latLng(46.0, -3.227); // Southwest corner
        var northEast = L.latLng(54.0,2.125); // Northeast corner
        var bounds = L.latLngBounds(southWest, northEast);
               
		
		    	    	
       	function logBounds() {
    		var bounds = map.getBounds();
    		var southWest = bounds.getSouthWest();
    		var northEast = bounds.getNorthEast();
    
		}
              	    				
	
		
		function insertLevelInstruction(flightid, level, timeMins)
		{		
			var InsTime = new Date(trajectories[flightid][0].time);
			InsTime.setMinutes(InsTime.getMinutes()+timeMins);
			// loop through the trajectory and insert a point
			for (let p=0; p < trajectories[flightid].length; p++)
			{
				var point = trajectories[flightid][p];
				if (InsTime.getTime() > point.time.getTime())
				{
					var levelAchievedPos = calculateNewLatLonTimeSpeedBearing(point.coords.lat, point.coords.lng, timeMins/60, point.speed, point.bearing);
					var currentSector  = getSector(flightid,levelAchievedPos);
					var nextPoint = {time:new Date(InsTime),
    							   name		: "CL",
    							   coords	:levelAchievedPos,
    							   level	:level,
    							   speed	: point.speed,
    							   bearing	: point.bearing,
    							   sector   : currentSector,
    							   cid		: -1};
    				trajectories[flightid].splice(p+1,0,nextPoint);	
    				return;								
				}
			}	
		}
						
		// Constants
        const R = 6378137; // Earth's radius in meters
              
        // Map a point (lat, lon) to canvas coordinates
        function mapPointToRadarCanvas(can,lat, lon) {
        // Map bounds (adjust as necessary)
            var bounds = map.getBounds();
    		var northWest = bounds.getNorthWest();
    		var southEast = bounds.getSouthEast();
        	const topLeft = latLonToXY(northWest.lat, northWest.lng);
        	const bottomRight = latLonToXY(southEast.lat, southEast.lng);
            const point = latLonToXY(lat, lon);
            
            // Normalize coordinates to [0, 1]
            const normalizedX = (point.x - topLeft.x) / (bottomRight.x - topLeft.x);
            const normalizedY = (point.y - bottomRight.y) / (topLeft.y - bottomRight.y);

            // Map to canvas coordinates
            const canvasX = normalizedX * can.width;
            const canvasY = (1 - normalizedY) * can.height;

            return { x: canvasX, y: canvasY };
        }	
        map.on('mousedown', function(event) {
            const latLng = event.latlng;
			// Manually dispatch the event to the radar container
 			var customEvent = new CustomEvent('radarMouseDown', {
                detail: {
                    clientX: event.originalEvent.clientX,
                    clientY: event.originalEvent.clientY,
                    pageX: event.originalEvent.pageX,
                    pageY: event.originalEvent.pageY,
                    screenX: event.originalEvent.screenX,
                    screenY: event.originalEvent.screenY,
                    button: event.originalEvent.button
                	}
                });           
                radarCanvas.dispatchEvent(customEvent);        
        });
         map.on('mouseup', function(event) {
            const latLng = event.latlng;

			// Manually dispatch the event to the radar container
 			var customEvent = new CustomEvent('radarMouseUp', {
                detail: {
                    clientX: event.originalEvent.clientX,
                    clientY: event.originalEvent.clientY,
                    pageX: event.originalEvent.pageX,
                    pageY: event.originalEvent.pageY,
                    screenX: event.originalEvent.screenX,
                    screenY: event.originalEvent.screenY,
                    button: event.originalEvent.button
                	}
                });           
                radarCanvas.dispatchEvent(customEvent);        
        });

        
        radarCanvas.addEventListener('radarMouseUp', (event) => {
 			const rect = radarCanvas.getBoundingClientRect();
 			
 			// right click is the route display button
 			if (event.detail.button == 2)
 			{
 				// hide route
 				showrouteflightid = -1; 				
 			}
 			// left button up is hook/unhook
 			else if (event.detail.button = 0)
 			{
 				
 			}
 			//alert(event.detail.button);
 		});	

        // Event listeners for mousedown events
    	radarCanvas.addEventListener('radarMouseDown', (event) => {
	        const rect = radarCanvas.getBoundingClientRect();

			let keys = Array.from(TDBShapes.keys());
			for (k = 0; k < keys.length; k++)
			{	
	        						
			    const x = event.detail.clientX - rect.left;
		        const y = event.detail.clientY - rect.top;
				var w = TDBShapes.get(keys[k]).width;
				var h = TDBShapes.get(keys[k]).height;
	        	if (x >= (TDBShapes.get(keys[k]).x) && x <= (TDBShapes.get(keys[k]).x + w) && 
	        		y >= (TDBShapes.get(keys[k]).y) && y <= (TDBShapes.get(keys[k]).y + h)) {	
	        		if (event.detail.button == 2)
	        		{	        		
	   				    showrouteflightid = keys[k];
					    drawRoute(keys[k]);
					    setTimeout(()=>{showrouteflightid = -1;},6000);
					    return;					    
					}
					if (event.detail.button == 0)
					{					
				    	HookFlight(keys[k]);
				    	return;
				    }
		        }
		    }
    	});	
	    toprightCanvas.addEventListener('wheel', function(event) {
	    	if (event.deltaY > 0){
	    		if (vrtMinLevel >= vrtMinMinLevel){		    	
		    		vrtMinLevel = vrtMinLevel-10;
		    		vrtMaxLevel = vrtMaxLevel-10;
		    	}
	    		
	    	}else if (vrtMaxLevel <= vrtMaxMaxLevel){
	    		console.log("Wheely up");
	    		vrtMinLevel = vrtMinLevel+10;
	    		vrtMaxLevel = vrtMaxLevel+10;
	    	}
    	   	refreshVrt(toprightCanvas);	

	    });
	    	

    	// Event listener for mousedown on the vrt
    	toprightCanvas.addEventListener('mousedown', (event) => {
	        const rect = toprightCanvas.getBoundingClientRect();
	        var len = VRTInteractionShapes.length;
	        const x = event.clientX - rect.left;
		    const y = event.clientY - rect.top;
			for (let i=0; i < len; i++)
			{	    
			    
				var w = VRTInteractionShapes[i].width/2;
				var h = VRTInteractionShapes[i].height/2;
	        	if (x >= (VRTInteractionShapes[i].shapeX-w) && x <= (VRTInteractionShapes[i].shapeX + w*2) && 
	        		y >= (VRTInteractionShapes[i].shapeY-h) && y <= (VRTInteractionShapes[i].shapeY + h)) {	
	        		if (event.button == 2)
	        		{	        		
	   				    showrouteflightid = i;
					    drawRoute(VRTInteractionShapes[i].flightid);
					    setTimeout(()=>{showrouteflightid = -1;},5000);
					    return;
					    
					}					
		        }
		    }
		    var len = VRTTimeShapes.length;
			for (let i=0; i < len; i++)
			{	
				var w = VRTTimeShapes[i].width/2;
				var h = VRTTimeShapes[i].height/2;
	        	if (x >= (VRTTimeShapes[i].shapeX-w) && x <= (VRTTimeShapes[i].shapeX + w*2) && 
	        		y >= (VRTTimeShapes[i].shapeY-h) && y <= (VRTTimeShapes[i].shapeY + h*2+5)) {	
	        		if (event.button == 0)
	        		{
	        			var selectedTime = VRTTimeShapes[i].time;
	        			
	        			if (bSetClearanceIssueTime && (selectedClearanceIssueTime == 0 || selectedTime < selectedClearanceTime)){	        			
							selectedClearanceIssueTime = selectedTime;
							bSetClearanceIssueTime = false;
						}else if (selectedClearanceTime != 0 && selectedClearanceIssueTime != 0){
							if (Math.abs(selectedTime-selectedClearanceTime) < Math.abs(selectedTime-selectedClearanceIssueTime)){							
								selectedClearanceTime = selectedTime;
							}else{
								selectedClearanceIssueTime = selectedTime;
							}						
						}else {
							selectedClearanceTime = selectedTime;
						}
						
						//if (selectedClearanceTime != 0 && selectedClearanceIssueTime != 0 && selectedClearanceTime < selectedClearanceIssueTime){
					//		let temp = selectedClearanceIssueTime;
				//			selectedClearanceIssueTime = selectedClearanceTime;
				//			selectedClearanceTime = temp;
				//		}
						console.log(selectedClearanceIssueTime,":",selectedClearanceTime,":",selectedClearanceLevel);
						levelClearanceProbeChanged();
						return;
					}					
		        }
 
			} 
			 var len = VRTLevelShapes.length;
			for (let i=0; i < len; i++)
			{	
				var w = VRTLevelShapes[i].width;
				var h = VRTLevelShapes[i].height;
	        	if (x >= (VRTLevelShapes[i].shapeX-w) && x <= (VRTLevelShapes[i].shapeX + w*2) && 
	        		y >= (VRTLevelShapes[i].shapeY-h) && y <= (VRTLevelShapes[i].shapeY + h)) {	
	        		if (event.button == 0)
	        		{	        		
						selectedClearanceLevel = VRTLevelShapes[i].level;
						levelClearanceProbeChanged();
  						return;
					}					
		        }
 
			}
			
			// if we've got this far somewhere else has been clicked
			// 
			const tctx = toprightCanvas.getContext('2d');

			for (let a = 0; a < VRTAnchorShapes.length; a++)
			{
				if (isPointInCircle(x,y,VRTAnchorShapes[a].x,VRTAnchorShapes[a].y,VRTAnchorShapes[a].r))
				{
					alert("clicked");
				}
			}
			//if (isPointInCircle(x,y,
			//drawCircle(tctx,x,y ,4,'rgb(255,255,255');
		    
    	});	

    	 map.getContainer().addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
    	radarCanvas.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
        toprightCanvas.addEventListener('contextmenu',function(event) {
	       	event.preventDefault();
	    });
	    
	    const switchElement = document.getElementById('allEventsSwitch');
		switchElement.style.backgroundColor = '#0A2732';
		switchElement.style.color = '#a0a0a0';
		switchElement.style.width=80;
		this.innerHTML = "Show All";
    	switchElement.addEventListener('click', function() {
        if (bShowAllEvents) {
			bShowAllEvents = false;			
			this.innerHTML = "Show All";
        } else {
    			this.innerHTML = "Show Hooked";
			bShowAllEvents = true;
        }
		populateClearanceTable(hookedFlight);
    });
     
     
	    
    
	
		// STARTUP CALLS
    	logBounds();
    	calculateInitialTrackPositions();
    	calculateTrajectoriesV2();
    	

    	onTickIntervalId = setInterval(onTick, 1000);
    	updateDataIntervalId = setInterval(updateData,1000);
    	updateClock();
    	//insertLevelInstruction(1, 150, 2);
		createClearanceTable();
    	populateClearanceTable(-1);

    	window.addEventListener('resize', resizeCanvas);
    	
    	function resizeCanvas()
    	{
    		radarContainer = document.querySelector('.radar-canvas-container');            
    		// Set canvas dimensions to match the container's dimensions
    		radarCanvas.width = radarContainer.clientWidth;
    		radarCanvas.height = radarContainer.clientHeight;
    
    		toprightCanvas = document.getElementById('top');
    		toprightContainer = document.querySelector('.top-canvas-container');            
    		// Set canvas dimensions to match the container's dimensions
    		toprightCanvas.width = toprightContainer.clientWidth;
    		toprightCanvas.height = toprightContainer.clientHeight;    

    	}
	    	
});


function levelClearanceProbeChanged(){
	updateProbeEvent(false);
	enableClearanceButtons(true);
	populateCurrentClearanceDisplay();
   	refreshVrt(toprightCanvas);	
}
function HookFlight(flightid){
	hookedFlight=flightid;
	let currentNearestWholeLevel = Math.round(trajectories[hookedFlight][0].level/10)*10;

	vrtMinLevel = currentNearestWholeLevel-70;
	if (vrtMinLevel < vrtMinMinLevel){
		vrtMinLevel = vrtMinMinLevel;
	}
	
	vrtMaxLevel = currentNearestWholeLevel+70;
	if (vrtMaxLevel > vrtMaxMaxLevel){
		vrtMaxLevel = vrtMaxMaxLevel;
	}
   	refreshVrt(toprightCanvas);
   	populateClearanceTable(hookedFlight);
   	populateClearanceEntry(hookedFlight);
   	
   	// put random value in 3di

   	label = document.getElementById('tdilabel');
   	label.textContent = "  "+getRandomNumber(20,60);
   	drawTracks(radarCanvas);

}  

// Map a point (lat, lon) to canvas coordinates
function mapPointToRadarCanvas(can, lat, lon) {
        // Map bounds (adjust as necessary)
        var bounds = map.getBounds();
        var northWest = bounds.getNorthWest();
        var southEast = bounds.getSouthEast();
        const topLeft = latLonToXY(northWest.lat, northWest.lng);
        const bottomRight = latLonToXY(southEast.lat, southEast.lng);
        const point = latLonToXY(lat, lon);

        // Normalize coordinates to [0, 1]
        const normalizedX = (point.x - topLeft.x) / (bottomRight.x - topLeft.x);
        const normalizedY = (point.y - bottomRight.y) / (topLeft.y - bottomRight.y);

        // Map to canvas coordinates
        const canvasX = normalizedX * can.width;
        const canvasY = (1 - normalizedY) * can.height;

        return {
            x: canvasX,
            y: canvasY
        };
    }
// Function to draw an arrow on the canvas
function drawArrow(context, startX, startY, bearing, length, offset) {
    // Convert the bearing to radians
    let angle = degreesToRadians(bearing-90);

    // Calculate the end coordinates of the arrow
    let offsetStartX = startX + offset * Math.cos(angle);
    let offsetStartY = startY + offset * Math.sin(angle);
    let endX = offsetStartX + length * Math.cos(angle);
    let endY = offsetStartY + length * Math.sin(angle);
    // Draw the main line of the arrow
    context.beginPath();
	context.strokeStyle = 'green';
	context.setLineDash([]);

    context.moveTo(offsetStartX, offsetStartY);
    context.lineTo(endX, endY);
    context.stroke();

    // Draw the arrowhead (two lines to form a V)
    let arrowAngle = Math.PI / 6;  // Arrowhead angle (30 degrees)
    let arrowLength = 5;  // Length of the arrowhead lines

    // Left side of the arrowhead
    let leftX = endX - arrowLength * Math.cos(angle - arrowAngle);
    let leftY = endY - arrowLength * Math.sin(angle - arrowAngle);
    context.moveTo(endX, endY);
    context.lineTo(leftX, leftY);

    // Right side of the arrowhead
    let rightX = endX - arrowLength * Math.cos(angle + arrowAngle);
    let rightY = endY - arrowLength * Math.sin(angle + arrowAngle);
    context.lineTo(endX, endY);
    context.lineTo(rightX, rightY);
    context.stroke();
}
function drawTracks(Canvas)
{
	    	TDBShapes.clear();
    	    var thisctx = Canvas.getContext('2d');

    	    thisctx.clearRect(0, 0, Canvas.width, Canvas.height); // Clear radar

    		// for each flight
    		for (let f=0; f < flights.length; f++){ 
 
    			if ( simTime.getTime() >= trackPositions[f].time.getTime())
    			{			
    			var p1 = mapPointToRadarCanvas(Canvas, trackPositions[f].coords.lat, trackPositions[f].coords.lng);								
				
				// Don't draw if negative value as it means its off the screen
				if (p1.x > 0 && p1.y > 0 && p1.x < Canvas.width && p1.y < Canvas.height){    				
	    			
					if (hookedFlight == f){
	       				// Optionally, you can also draw a rectangle outline
	       				thisctx.setLineDash([]);
	        			thisctx.strokeStyle = 'white';
	        			thisctx.lineWidth = 2;
	        			thisctx.strokeRect(p1.x , p1.y-11, tdbWidth+1, tdbHeight)
	       			}
	       			if (emergencyFlightId == f){
	       			  	// Function to create a hatching pattern
       					 function createHatchPattern() {
           				 // Create an offscreen canvas for the pattern
           					 const patternCanvas = document.createElement('canvas');
           					 patternCanvas.width = 15; // Pattern width
            				patternCanvas.height = 15; // Pattern height

            				const patternCtx = patternCanvas.getContext('2d');

            				// Draw diagonal lines for the hatch pattern
            				patternCtx.strokeStyle = 'red'; // Line color
            				patternCtx.lineWidth = 1; // Line width

            				// Draw diagonal line (top-left to bottom-right)
            				patternCtx.beginPath();
            				patternCtx.moveTo(0, 0);
            				patternCtx.lineTo(15, 15);
            				patternCtx.stroke();

            				// Draw diagonal line (bottom-left to top-right)
            				patternCtx.beginPath();
            				patternCtx.moveTo(0, 15);
            				patternCtx.lineTo(15, 0);
            				patternCtx.stroke();
			
            				// Create a pattern from the offscreen canvas
            				return thisctx.createPattern(patternCanvas, 'repeat');
        				}
	       				// Optionally, you can also draw a rectangle outline
	       				thisctx.setLineDash([]);
	        			thisctx.strokeStyle = 'red';
	        			thisctx.lineWidth = 2;
	        			thisctx.strokeRect(p1.x , p1.y-11, tdbWidth, tdbHeight)
	        			// Also draw a hatched area around the TDB in the direction
	        			thisctx.beginPath();
	        			thisctx.setLineDash([]);
	        			thisctx.strokeStyle = 'red';
	        			thisctx.lineWidth = 2;
		        		bearing=trackPositions[f].bearing;
	        			// Convert to rads
	        			let angle = degreesToRadians(trackPositions[f].bearing);
		        		let bearingrads = angle;
	        			
						// vertice 1
	        			let vbearing = bearingrads-(Math.PI/4);
	        			let x = p1.x+120*Math.cos(vbearing);
	        			let y = p1.y+120*Math.sin(vbearing);
	        			let ox = x;
	        			let oy = y;

						thisctx.moveTo(x,y);
						// vertice 2
						vbearing = bearingrads + Math.PI+(Math.PI/4);
	        			x = p1.x + 120*Math.cos(vbearing);
	        			y = p1.y + 120*Math.sin(vbearing);							        		
						thisctx.lineTo(x,y);						
						//thisctx.fillText("V2",x,y);
						// vertice 3
						vbearing = bearingrads+Math.PI-(Math.PI/4);
	        			x = p1.x + 80*Math.cos(vbearing);
	        			y = p1.y + 80*Math.sin(vbearing);
						thisctx.lineTo(x,y);
						// vertice 4
						vbearing = bearingrads + (Math.PI/4);
	        			x = p1.x + 80*Math.cos(vbearing );
	        			y = p1.y + 80*Math.sin(vbearing );
						thisctx.lineTo(x,y);
						thisctx.fillStyle = createHatchPattern();					
						thisctx.lineTo(ox,oy);
						thisctx.stroke();
						thisctx.closePath();
						thisctx.fill();
						
	        			thisctx.moveTo(p1.x, p1.y);

	       			}
	       			
	   				// Set the fill style (color)
       				thisctx.fillStyle = 'rgb(35,35,35,255)';
       				// Draw the filled rectangle
       				let y = p1.y;
       				let x = p1.x;
       				height = tdbHeight;
	       			if (emergencyFlightId == f){
						height+=11;
					}
		   			thisctx.fillRect(p1.x , p1.y-11, tdbWidth , height);
	       			drawArrow(thisctx, p1.x+20, p1.y+20, trackPositions[f].bearing,25,40);					       								        						

	       			if (emergencyFlightId == f){
	   				thisctx.fillStyle = 'rgb(200,0,0,255)';
		   				thisctx.fillText('7700',x,y);
		   				y+=11;
	       			}
	   				thisctx.fillStyle = 'rgb(0,150,0,255)';

	   				thisctx.fillText(flights[f].callsign,x,y);y+=11;
	   				thisctx.fillText(String("F"+Math.floor(trackPositions[f].level)),x, y);y+=11;
	   				
	   				thisctx.fillText(String(flights[f].fixroute[0].name),x, y);y+=11;
	   				thisctx.fillText(String(trackPositions[f].rocd),x,y);y+=11;
	   				thisctx.fillText('G'+String(trackPositions[f].speed),x,y);y+=11;
	   				thisctx.fillStyle = 'white';
					if (clearanceEvents.has(f))
					{
						var events = clearanceEvents.get(f);
		   				thisctx.fillText(String(events.length),x+40,y);
		   			}
		   			else
		   			{	
		   				thisctx.fillText('0',x+40,y);
		   			}

	   				// store the shape
	   				TDBShapes.set(f,{x: p1.x, y: p1.y-11, width: tdbWidth , height: height, colour: 'rgb(30,30,30,90)', nextpoint: 1});
	   			}
	   			}
	   		}	    				
}
function updateTracksAndTrajectories()
		{
			// loop through each trajectory
			for (let t=0; t < trajectories.length; t++)
			{
				if (t == 11)
				{
					var a = 20;
				}
				let bearingToNextPoint;
				if (trajectories[t].length > 0){
				
				let simTimeMS = simTime.getTime();
				let firstPointTimeMS = trajectories[t][0].time.getTime();
				// update first point of trajectory if active
				if ((simTimeMS  >= firstPointTimeMS ) && trajectories[t].length > 1)
				{				
					// calculate time between now and first point
					let timeDiffMs = simTime.getTime()-trajectories[t][0].time.getTime();
					let timeDiffHrs = timeDiffMs/(1000*60*60);
					// distance travelled since last time
					let distanceNm = trajectories[t][0].speed * timeDiffHrs;
					bearingToNextPoint = calculateBearing(trajectories[t][0].coords.lat,
														  trajectories[t][0].coords.lng,
														  trajectories[t][1].coords.lat,
														  trajectories[t][1].coords.lng);
					var distanceToNextPoint = haversineDistance(trajectories[t][0].coords.lat,
														  trajectories[t][0].coords.lng,
														  trajectories[t][1].coords.lat,
														  trajectories[t][1].coords.lng);
										// calculate new position using current position (first item in trajectory), heading to next fix, speed, time diff
					var nextCoord = calculateNewLatLonDistanceBearing(trajectories[t][0].coords.lat,trajectories[t][0].coords.lng,distanceNm,bearingToNextPoint);
					
					
					let currentPointTime = trajectories[t][0].time.getTime();
					let nextPointTime = trajectories[t][1].time.getTime();
					let nextTime = new Date(nextPointTime);
					let currentTime = new Date(currentPointTime);
					
					var ratio;
    				if (currentPointTime-nextPointTime < 0)	{
    					ratio = (simTime.getTime()-currentPointTime )/(nextPointTime-currentPointTime);       
    				}else{
    					ratio = 0;
    				}
   					let newLevel = trajectories[t][0].level+((trajectories[t][1].level-trajectories[t][0].level)*ratio);

					let newPointTime = new Date(simTime);
					let currentSector = getSector(t,nextCoord);
					var newPoint = {time:newPointTime,
    							  name: "CURRENT",
    							  coords:nextCoord,
    							  level:newLevel,
    							  speed: trajectories[t][0].speed,
    							  bearing: bearingToNextPoint,
    							  sector : currentSector,
    							  cid: -1,
    							  rocd: structuredClone(trajectories[t][0].rocd)
    							  };
					// Remove old CURRENT point
					trajectories[t].shift();
					
					// if we're very close to the next point, remove that too
					// This is also used for fix progression from the route, e.g. removing fixes from the flight's route
					// for when the trajectories are recalculated
					if (nextPointTime <= currentPointTime)
					{
						// before removing set the current ROCD
						newPoint.rocd = structuredClone(trajectories[t][0].rocd);
						let fixName = trajectories[t][0].name;
						trajectories[t].shift();
						if (trajectories[t].length == 1){
							console.log("length of 1");
						} else{
							bearingToNextPoint = calculateBearing(trajectories[t][0].coords.lat,
														  trajectories[t][0].coords.lng,
														  trajectories[t][1].coords.lat,
														  trajectories[t][1].coords.lng);
							newPoint.bearing = bearingToNextPoint;
						}
						// As current point has been removed, examine index 0 to see if its a fix which has been progressed
						// and can be removed from the route.
						// If this fix is not TOC or BOC - remove the fix from the flight's fixes route
						
						if (fixName  != "TOC" && fixName  != "BOC"){
							if (flights[t].fixroute[0].name == fixName ){
								//alert("removing:",flights[t].fixroute[0]);
								flights[t].fixroute.shift();
							}							
						}						
						
					}
					
					// Add newly calculate position to the front
					trajectories[t].unshift(newPoint);
					
					trackPositions[t] = newPoint;
					
					bFirstTime = false;
					// remove first point and replace with new position, name = "current"
				}
				}
			}
}
		
// remove any events before simTime
		function purgeOldEvents()
		{
			for (var [flightid, events] of clearanceEvents) {
				var bPurging = true;
				var	index = 0;
				while(index < events.length){
					var eventTime = new Date();
					eventTime = setTimeFromString(eventTime, events[index].time);
					if (simTime.getTime() > eventTime.getTime())
					{
						events.splice(index,1);	
						populateClearanceTable(flightid);
					}
					else
					{
						index++;
					}				
				}					
			}
		}
  // Called once a second, updates trajectories, track positions, and the vertical risk tool (top right corner)
    function updateData()
    {
    	if (bNewEvent){
    		calculateTrajectoriesV2();
    		bNewEvent = false;
    	}
    	purgeOldEvents();
	   	// update the trajectories
	    updateTracksAndTrajectories();
   		probeTrajectories();

	    // move tracks
    	drawTracks(radarCanvas);
    	
		if (showrouteflightid != -1)
		{
    		drawRoute(showrouteflightid);
    	}
		if (hookedFlight >= 0)
		{
    		refreshVrt(toprightCanvas);	
		}
		
		// Check whether a flight doesn't have a trajectories and simTime is greater than startTime
		for (let f = 0; f < flights.length; f++){
			var startTime = new Date();
  			startTime = setTimeFromString(startTime, flights[f].startTime);

   			if (simTime.getTime() >= startTime.getTime() && trajectories[f].length == 0){
				calculateTrajectoriesV2();
			}
		}
		showInteractionVectors();
		
		if (emergencyFlightId != -1){
			drawRoute(emergencyFlightId);
		}		
    }
    
function drawRoute(flightid) {

	if (TDBShapes.has(flightid)){
		
        const centerX = TDBShapes.get(flightid).x;
        const centerY = TDBShapes.get(flightid).y;
		let colour = 'white';
		if (flightid == emergencyFlightId){
			colour = 'red';
		}
        rctx.beginPath();
        rctx.setLineDash([6, 3]); // Create a dotted line pattern
        rctx.moveTo(centerX, centerY);
        for (let p = TDBShapes.get(flightid).nextpoint; p < trajectories[flightid].length; p++)
        {
        	var p1 = mapPointToRadarCanvas(radarCanvas, trajectories[flightid][p].coords.lat, trajectories[flightid][p].coords.lng);
        	rctx.lineTo(p1.x, p1.y);
   			rctx.lineWidth=1;			
   	        rctx.strokeStyle = colour;
   	        rctx.fillStyle = colour;
        	rctx.stroke();
        	// Draw dot on the 2d route to indicate where the level clearances are
        	if (trajectories[flightid][p].name != "TOC" &&
        		trajectories[flightid][p].name != "BOC"){
        		rctx.fillText(trajectories[flightid][p].name, p1.x-10,p1.y);
	        	rctx.stroke();
	        }
	        else if (trajectories[flightid][p].name == "TOC")
	        {
	        	rctx.strokeStyle = 'rgba(70,195,215,255)';
	        	drawVrtAnchor(rctx,p1.x,p1.y,7,'rgba(70,195,215,255)');		
	        }
        }        
	}
}  
function RemoveShowRoute(){
	showrouteflightid = -1;
}	  		
// Function to update the clock
function updateClock() {
	if (bPlay){                        
	    
		simTime = new Date(simTime.getTime() + clockStep);
            
	    // Format and update the clock display
	    var timeString = simTime.toLocaleTimeString();
	    document.getElementById('clock').textContent = timeString+"";
	}
}
function onTick()
{
	updateClock();    		    		
}
    	
 // Latitude and longitude to Web Mercator X, Y
function latLonToXY(lat, lon) {
	const R = 3440.065; // Earth's radius in nautical miles

    var x = R * degreesToRadians(lon);
    var y = R * Math.log(Math.tan(Math.PI / 4 + degreesToRadians(lat) / 2));
    return { x: x, y: y };
}
        
// Convert degrees to radians
function degreesToRadians(degrees) {
	return degrees * Math.PI / 180;
}

// Convert radians to degrees
function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
}
// redraws the vertical risk tool and the vertical trajectory profile
function refreshVrt(Can)
{
		const tctx = Can.getContext('2d');
        tctx.clearRect(0, 0, Can.width, Can.height); // Clear vrt
        VRTInteractionShapes = [];
		// Draws the lines, levels and minutes
		drawVrt(Can);
		// Draws the trajectories
		populateVrt(Can);
}
function drawVrt(Can)
{
        const tctx = Can.getContext('2d');
        tctx.clearRect(0, 0, Can.width, Can.height); // Clear vrt

        //tctx.strokeStyle = '#2b4952';
		tctx.lineWidth=1;
		VRTTimeShapes = [];
		tctx.font = "14px Roboto";
        // draw the times
    	for (let lineno = 1; lineno <= numTimes ; lineno++)
    	{  
			tctx.beginPath();
			var xcoord = lineno*(Can.width/numTimes);
			tctx.moveTo(xcoord,0);
			if (selectedClearanceTime == lineno*vrtScaleMins){
				tctx.fillStyle = '#FFFFFF';
		        tctx.strokeStyle = '#ff00ff';							
			}
			else if (selectedClearanceIssueTime == lineno*vrtScaleMins){
				tctx.fillStyle = '#FFFFFF';
		        tctx.strokeStyle = '#ff00ff';							
			} else {
				tctx.fillStyle = '#a0a0a0';
			}
			//tctx.fillRect(xcoord-5,Can.height-12,12,20);
			//tctx.stroke();
			tctx.fillText(String((lineno)*vrtScaleMins),xcoord-5, Can.height-5);
			VRTTimeShapes.push({shapeX: xcoord-5, shapeY: Can.height-5, width: 12,height:20, time: lineno*vrtScaleMins});
			
    	}
    	tctx.setLineDash([]);
    	tctx.strokeStyle = '#2b4952';
    	tctx.lineWidth=1;
		tctx.font = 20+'px';
    	// draw horizontal level lines
		const numhlines = (vrtMaxLevel-vrtMinLevel)/vrtGraduation;
		// calculate offset
		var deltaLineDiffPx = Can.height/numhlines;
		VRTLevelShapes = [];
    	for (let lineno = 1; lineno <= numhlines ; lineno++)
    	{  
			tctx.beginPath();
			var ycoord = Can.height-lineno*(Can.height/numhlines);
			tctx.moveTo(0,ycoord);
			tctx.lineTo(Can.width,ycoord);
			tctx.stroke()

			tctx.fillStyle = '#081920';			

			tctx.fillRect(Can.width-30,ycoord-25,40,40);

			tctx.font = "14px Roboto";
			if (selectedClearanceLevel != 0 && selectedClearanceLevel== ((lineno)*vrtGraduation)+vrtMinLevel)
			{
				//tctx.lineWidth=2;
				tctx.fillStyle = '#0080FF';
			}
			else
			{
							tctx.lineWidth=1;
				tctx.fillStyle = '#e0e0e0';
		        tctx.strokeStyle = '#2b4952';		
			}

			tctx.fillText(String(lineno*vrtGraduation+vrtMinLevel),Can.width-25, ycoord-5);
			VRTLevelShapes.push({shapeX: Can.width-12, shapeY: ycoord-10, width: 25,height:15, level: lineno*vrtGraduation+vrtMinLevel});			
    	}    	    	
}
function populateVrt(Can)
{
		Canheight = Can.height - 30;
	    timeToLevel(100,300);
	    timeToLevel(150,100);
        const tctx = Can.getContext('2d');
    	var vrtTrackYpos;
    	VRTAnchorShapes = [];

    	if (hookedFlight >= 0)
    	{	    	
	    	if (bInteractionFound)
	    	{
		    	bInteractionFound=false;
	    		// YPos = level
	    		//closestPoints 
	    		for (let c=0; c < closestPoints.length; c++)
	    		{
	    		   	if (closestPoints[c].flight1 == hookedFlight){

	    			var interactionpointDeltaTimeMins = (closestPoints[c].p2[3]-simTime.getTime())/1000/60;				
 		  			var Xpos = ((interactionpointDeltaTimeMins/vrtTimeHorizonMins)*Can.width)+vrtCurrentPosOffset ;
 		  			var level = flightLevelAtTime(closestPoints[c].flight2, closestPoints[c].p2[3])
	    			var Ypos = Canheight-((level-vrtMinLevel)/(vrtMaxLevel-vrtMinLevel)*Canheight);
					let l1 = flightLevelAtTime(closestPoints[c].flight1, closestPoints[c].p1[3]);
	   				let l2 = flightLevelAtTime(closestPoints[c].flight2, closestPoints[c].p2[3]);
 		   			if (closestPoints[c].d != 0 && Xpos > vrtCurrentPosOffset)
 		   			{ 	
 		   				var distanceNm = haversineDistance(closestPoints[c].p1[1],
 		   												   closestPoints[c].p1[0],
 		   												   closestPoints[c].p2[1],
 		   												   closestPoints[c].p2[0]);

   						if (distanceNm < 5 && distanceNm >= 0.01){
							color="yellow";
   							if ((Math.abs(l1-l2) < 20) && distanceNm < 3 ){
								var color = "red";
							}	   				
    					drawInteractionSymbol(tctx,Xpos,Ypos,closestPoints[c].flight2,color);
    					bInteractionFound=true;
    					}
    				}
    				}
				}
	    	}
    		// draw large dot at the origin and height that the hooked aircraft
    		var currentLevel = trajectories[hookedFlight][0].level;
    		// pixels from origin (y zero pos = top of canvas)
    		vrtTrackYpos = Canheight-((currentLevel-vrtMinLevel)/(vrtMaxLevel-vrtMinLevel)*Canheight);
    		// draw current pos dot on first line
    		drawTriangle(tctx,vrtCurrentPosOffset,vrtTrackYpos,'#b0b0b0');
    		tctx.beginPath();
    		tctx.moveTo(vrtCurrentPosOffset ,vrtTrackYpos );
    		var pointLevel = 0;
    		if (trajectories[hookedFlight].length >= 1)
    		{
    			pointLevel = trajectories[hookedFlight][0].level;
    		}

    		// loop through trajectory to draw the vertical profile
    		for (let p = 1; p < trajectories[hookedFlight].length; p++)
    		{
				tctx.lineWidth = 2;
				tctx.setLineDash([]); 
				var pointDeltaTimeMins = (trajectories[hookedFlight][p].time-simTime)/1000/60;	
				if (pointDeltaTimeMins > 0 )
				{
					// draw points when its going to be visible in the VRT			
    			if (pointDeltaTimeMins < vrtTimeHorizonMins)
    			{
    				let normal_color = '#a0a0a0';
    				let high_rocd_color = '#ff0000';
    				let clearance_color = clearanceEventColours[trajectories[hookedFlight][p].cid];
    				color = normal_color;
    				if (Math.abs(trajectories[hookedFlight][p-1].rocd) > 2000)
    				{
    					color = high_rocd_color;
    				}
    				else
    				{
    					if (trajectories[hookedFlight][p].cid != -1){
    						//color = clearanceEventColours[trajectories[hookedFlight][p].cid];
    						color='#e0e0e0';
    					}
    				}
    			    pointLevel = trajectories[hookedFlight][p].level;
    				vrtTrackYpos = Canheight-((pointLevel-vrtMinLevel)/(vrtMaxLevel-vrtMinLevel)*Canheight);
    				// Xpos is ratio of point delta time along vrt in mins from sim time
    				var Xpos = ((pointDeltaTimeMins/vrtTimeHorizonMins)*Can.width)+vrtCurrentPosOffset ;
    				tctx.lineTo(Xpos,vrtTrackYpos );
			        tctx.strokeStyle = color;
					tctx.stroke();

					if (trajectories[hookedFlight][p].cid < 0){
						//drawVrtAnchor(tctx,Xpos,vrtTrackYpos,3,'rgb(255,255,255');
						//tctx.fillText(,Xpos-15, vrtTrackYpos;				

					}else{
				        tctx.strokeStyle = '#f0f0f0';
						drawVrtAnchor(tctx,Xpos,vrtTrackYpos,3,normal_color);
						if (trajectories[hookedFlight][p].name == "BOC"){
							tctx.beginPath();
							tctx.moveTo(Xpos, vrtTrackYpos);
					        tctx.setLineDash([2, 3]); // Create a dotted line pattern
							tctx.lineTo(Xpos,Canheight); 
							tctx.fillStyle = 'rgba(70,195,215,255)';
							tctx.strokeStyle = 'rgba(70,195,215,255)';
							tctx.stroke();
							let pointTime = new Date(trajectories[hookedFlight][p].time);
							let strTime = pointTime.toLocaleTimeString();
							tctx.fillText(strTime,Xpos-20, Canheight+10);
							tctx.beginPath();
						}				
					}
					// Draw fix vertical dashed lines at each point
					if (trajectories[hookedFlight][p].name != "TOC" && trajectories[hookedFlight][p].name != "BOC"){
		    			tctx.beginPath();
						tctx.moveTo(Xpos,0);
				        tctx.setLineDash([5, 2]); // Create a dotted line pattern
				        tctx.lineWidth=1;
						tctx.strokeStyle = normal_color;
						tctx.fillStyle = normal_color;
						//tctx.line
						//tctx.lineTo(Xpos,Canheight);	
						tctx.fillText(trajectories[hookedFlight][p].name,Xpos-15, 15);				
						tctx.stroke();
						tctx.beginPath();
					}
					tctx.moveTo(Xpos,vrtTrackYpos );										
    			}
    			else // interpolate slope of line if the next point is off the VRT
    			{
    				if (pointLevel> 0)
    				{
	    				// interpolate where level should be at max time horizon
	    			var ratio = vrtTimeHorizonMins/pointDeltaTimeMins;
	    			var levelEnd = pointLevel+((trajectories[hookedFlight][p].level-pointLevel)*ratio);
	    			vrtTrackYpos = Canheight-((levelEnd-vrtMinLevel)/(vrtMaxLevel-vrtMinLevel)*Canheight);
	    			Xpos = Can.width;
	    			tctx.lineTo(Xpos,vrtTrackYpos );
			        tctx.strokeStyle = color ;
					tctx.stroke();
					// Draw fix vertical dashed lines
					tctx.beginPath();
					tctx.moveTo(Xpos,0);
			        tctx.setLineDash([5, 2]); // Create a dotted line pattern
			        tctx.lineWidth=1;
					tctx.strokeStyle = '#c0c0c0';
					tctx.lineTo(Xpos,Canheight);					
					tctx.stroke();
					tctx.beginPath();

					tctx.moveTo(Xpos+10,vrtTrackYpos );

	    			}    				
    			}
    			}
    		}
			tctx.lineWidth=1;
			tctx.setLineDash([]); 			    		
    	}
}

function updateClearanceEventsForNewSpeed(){
	let ratio = originalSpeed/Number(document.getElementById('speed-input').value).toFixed();
	// update the clearance times depending on distance away
	
	if (clearanceEvents.has(hookedFlight))
	{
		var events = clearanceEvents.get(hookedFlight);
	
		for (let e = 0; e < events.length; e++)
		{
			var eventTime = new Date();
			var eventIssueTime = new Date();
			eventTime = setTimeFromString(eventTime,events[e].time);	
			eventIssueTime = setTimeFromString(eventIssueTime ,events[e].issue_time);	
			let eventTimeDeltaMs = eventTime.getTime()-simTime.getTime();
			let eventIssueTimeDeltaMs = eventIssueTime.getTime()-simTime.getTime();			
			let newEventTimeMs = simTime.getTime()+(ratio*eventTimeDeltaMs);
			let newEventIssueTimeMs = simTime.getTime()+(ratio*eventIssueTimeDeltaMs);
			let newEventTime = new Date(newEventTimeMs);
			let newEventIssueTime = new Date(newEventIssueTimeMs);
			events[e].time = newEventTime.toLocaleTimeString();
			events[e].issue_time = newEventIssueTime.toLocaleTimeString();						
		}
		
		populateClearanceTable(hookedFlight);    
	}
}
function SpeedChanged(){
	let bProbe = true;
	setSpeedClearance(hookedFlight, Number(document.getElementById('speed-input').value).toFixed(),bProbe);
	enableClearanceButtons(true);
	calculateTrajectoriesV2();
}

function headingChanged(){

	// called when the value changes on the input set probe to true
	let bProbe = true;
	setHeadingClearance(hookedFlight, Number(document.getElementById('heading-input').value).toFixed(),bProbe);
	enableClearanceButtons(true);
	calculateTrajectoriesV2();
}

function createClearanceTable()
{
	var clearanceEntryContainer = document.querySelector('.clearance-entry-container');

	// 1. Top of the clearance table current clearance information
	let clearanceEntryTable = document.createElement('table');
	clearanceEntryTable.setAttribute('class','clearance-entry-table');
	clearanceEntryTable.border = '0';
	clearanceEntryContainer.appendChild(clearanceEntryTable);
	let row1 = document.createElement('tr');
	
	let speedLabelCell = document.createElement('td');
	speedLabelCell.textContent = 'SPEED';
	speedLabelCell.setAttribute('class', 'clearanceIssueTimeLabelCell');
	row1.appendChild(speedLabelCell );
	
	let headingLabelCell = document.createElement('td');
	headingLabelCell.textContent = 'HEADING';
	headingLabelCell.setAttribute('class', 'clearanceIssueTimeLabelCell');
	row1.appendChild(headingLabelCell );

	let issueTimeLabelCell = document.createElement('td');
	issueTimeLabelCell.textContent = 'ISSUE TIME';
	issueTimeLabelCell.setAttribute('class', 'clearanceIssueTimeLabelCell');
	row1.appendChild(issueTimeLabelCell);

	let timeLabelCell = document.createElement('td');
	timeLabelCell .textContent = 'TIME';
	timeLabelCell .setAttribute('class', 'clearanceTimeLabelCell');
	row1.appendChild(timeLabelCell);
					
	let levelLabelCell = document.createElement('td');
	levelLabelCell.textContent = 'LEVEL';
	levelLabelCell.setAttribute('class', 'clearanceLevelLabelCell');
	row1.appendChild(levelLabelCell );			
	
	let enterCell = document.createElement('td');
	let enterButton = document.createElement('INPUT');
	enterButton.setAttribute('type',"button");
	enterButton.setAttribute('value',"Enter");
	enterButton.setAttribute('onClick',"enterClearance()");
	enterButton.setAttribute('class',"enter-button");
	enterButton.disabled = true;
	enterCell.appendChild(enterButton);
	row1.appendChild(enterCell );
	clearanceEntryTable.appendChild(row1);
		
	let row2 = document.createElement('tr');
	speedCell = document.createElement('td');
	let speedInputElement = document.createElement("input");
    speedInputElement.classList.add('level-input');
	speedInputElement.id = "speed-input";


	speedInputElement .addEventListener('change', function() {
				  SpeedChanged();
				});
		        speedInputElement.type = "number";
		        speedInputElement.width=50;
		        speedInputElement.min = 100;
		        speedInputElement.max = 450;
		        speedInputElement.step = 10;
   		        speedInputElement.value = 200;   				

   		        speedCell.appendChild(speedInputElement);

	row2.appendChild(speedCell );
	
	headingCell = document.createElement('td');
	let headingInputElement = document.createElement("input");
    headingInputElement.classList.add('level-input');
	headingInputElement.id = "heading-input";
	headingInputElement.style.width=50;


	headingInputElement.addEventListener('change', function() {
				  headingChanged();
				});
		        headingInputElement.type = "number";
		        headingInputElement.width=50;
		        headingInputElement.min = 0;
		        headingInputElement.max = 360;
		        headingInputElement.step = 5;
   		        headingInputElement.value = 200;   				

   		        headingCell.appendChild(headingInputElement);

	row2.appendChild(headingCell );

	

	let issueTimeCell = document.createElement('td');
	issueTimeCell.textContent = '0';
	issueTimeCell.setAttribute('class', 'clearanceIssueTimeCell');
	row2.appendChild(issueTimeCell);

	let timeCell = document.createElement('td');
	timeCell.textContent = '0';
	timeCell.setAttribute('class', 'clearanceTimeCell');
	row2.appendChild(timeCell);
	
	let levelCell = document.createElement('td');
	levelCell.textContent = '0';
	levelCell.setAttribute('class', 'clearanceLevelCell');
	row2.appendChild(levelCell );
	
	let cancelCell = document.createElement('td');
	let cancelButton = document.createElement('INPUT');
	cancelButton.setAttribute('type',"button");
	cancelButton.setAttribute('value',"Cancel");
	cancelButton.setAttribute('onClick',"cancelClearance()");
	cancelButton.setAttribute('class',"cancel-button");
	cancelButton.disabled = true;
	cancelCell.appendChild(cancelButton);
	row2.appendChild(cancelCell);
	clearanceEntryTable.appendChild(row2);

	
	clearanceEntryContainer.appendChild(clearanceEntryTable);
	let clearancesAllSwitch = document.createElement('label');
	clearancesAllSwitch.setAttribute('class','switch');


	// 2. Create the cleaqrances table and its content
	var clearanceTableContainer = document.querySelector('.clearance-table-container');            
	let clearancesTable = document.createElement('table');
	clearancesTable.border = '1'; // Set border attribute for the table

	// Create a header row
	let headerRow = document.createElement('tr');

	let headerCell1 = document.createElement('th');
	headerCell1.textContent = 'CALLSIGN';
	headerRow.appendChild(headerCell1);

	let headerCell2 = document.createElement('th');
	headerCell2.textContent = 'ISSUE TIME';
	headerRow.appendChild(headerCell2);
	
	let headerCell3 = document.createElement('th');
	headerCell3.textContent = 'TARGET TIME';
	headerRow.appendChild(headerCell3);

	let headerCell4 = document.createElement('th');
	headerCell4.textContent = 'LEVEL';
	headerRow.appendChild(headerCell4);

	let headerCell5 = document.createElement('th');
	headerCell5.textContent = '';
	headerRow.appendChild(headerCell5);

	clearancesTable.appendChild(headerRow);
	clearancesTable.setAttribute('class','clearance-table');
	clearancesTable.setAttribute('id','clearance-table');

	// 3. Append the table to the selected element
	clearanceTableContainer.appendChild(clearancesTable);
}
function enterClearance()
{
	// copy probe heading to actual heading if changed
	if (headingClearanceChanged()){
		let probeHeadingData = flightHeadingProbeClearances.get(hookedFlight);
		flightHeadingClearances.set(hookedFlight, {pos : probeHeadingData.probePos, heading : probeHeadingData.probeHeading});
	}

	// copy probe speed to actual speed if changed
	if (speedClearanceChanged()){
		let probeSpeed = flightSpeedProbeClearances.get(hookedFlight);
		flightSpeedClearances.set(hookedFlight,probeSpeed);
	}

	
	removeProbeEvent();
	if (validLevelClearance(false)){
		var clearanceTime = new Date(simTime.getTime());
		clearanceTime.setMinutes(clearanceTime.getMinutes()+selectedClearanceTime);
		var clearanceIssueTime = new Date(simTime.getTime());
		clearanceIssueTime.setMinutes(clearanceIssueTime.getMinutes()+selectedClearanceIssueTime);

		var newEvent = {issue_time 	: clearanceIssueTime.toLocaleTimeString(),
					time		: clearanceTime.toLocaleTimeString(), 
					level		: selectedClearanceLevel, probe: false}
		// add the event to the list of events - in time order
		if (clearanceEvents.has(hookedFlight))
		{
			var events = clearanceEvents.get(hookedFlight);
			var insertIndex = events.length;
			for (let e = 0; e < events.length; e++)
			{
				var eventDate = new Date();
				eventDate = setTimeFromString(eventDate, events[e].time)

				// insert newEvent before if the event time is greater
				if (eventDate.getTime() > clearanceTime.getTime())
				{
			    	insertIndex = e;
			    	break;
				}		
			}
	    	events.splice(insertIndex,0,newEvent);	
		}
		else
		{
			var events = [];
			events.push(newEvent);
			clearanceEvents.set(hookedFlight,events);
		}
	}
	bNewEvent = true;
	populateClearanceTable(hookedFlight);
 	cancelClearance(); 	
}
function removeProbeEvent()
{
	// remove probe event
	if (clearanceEvents.has(hookedFlight))
	{
		var events = clearanceEvents.get(hookedFlight);
		var insertIndex = events.length;
		for (let e = 0; e < events.length; e++)
		{
			if (events[e].probe == true)
			{
				events.splice(e,1);	
				bNewEvent = true;
				break;
			}				
		}
		
		if (events.length == 0){
			clearanceEvents.delete(hookedFlight);
		}
	}
	
	if (flightHeadingProbeClearances.has(hookedFlight))
	{
		flightHeadingProbeClearances.delete(hookedFlight);				
	}
	if (flightSpeedProbeClearances.has(hookedFlight))
	{
		flightSpeedProbeClearances.delete(hookedFlight);				
	}
}
function cancelClearance()
{
	selectedClearanceLevel = 0;
	selectedClearanceTime = 0;
	selectedClearanceIssueTime = 0;	
	selectedHeading = 0;
	selectedSpeed = 0;
	bSetClearanceIssueTime = true;
	removeProbeEvent();	
	calculateTrajectoriesV2();
	updateTracksAndTrajectories();
	populateCurrentClearanceDisplay();
	populateClearanceEntry(hookedFlight);
	enableClearanceButtons(false);
	refreshVrt(document.getElementById('top'));

}

function enableClearanceButtons(bEnabled)
{
	if (!speedClearanceChanged() && !headingClearanceChanged() && !validLevelClearance(true))
	{
		document.querySelector('.enter-button').disabled = true;
	}
	else
	{
		document.querySelector('.enter-button').disabled = !bEnabled;
	}
	document.querySelector('.cancel-button').disabled = !bEnabled;
}

function populateCurrentClearanceDisplay()
{
	if (selectedClearanceLevel != 0)	{
		document.querySelector('.clearanceLevelCell').textContent = selectedClearanceLevel;
	} else {
		document.querySelector('.clearanceLevelCell').textContent = "";
	}
	if (selectedClearanceTime != 0){
		document.querySelector('.clearanceTimeCell').textContent = selectedClearanceTime;
	} else {
		document.querySelector('.clearanceTimeCell').textContent = "";
	}
	if (selectedClearanceIssueTime != 0){
		document.querySelector('.clearanceIssueTimeCell').textContent = selectedClearanceIssueTime ;
	} else {
		document.querySelector('.clearanceIssueTimeCell').textContent = "";
	}
	

}

function populateClearanceEntry(flightid)
{
	speedInput = document.getElementById('speed-input');
	speedInput.value = Number(trackPositions[flightid].speed.toFixed());
	originalSpeed = Number(trackPositions[flightid].speed.toFixed());
	
	headingInput = document.getElementById('heading-input');
	headingInput.value = Number(trackPositions[flightid].bearing.toFixed());
	originalHeading = Number(trackPositions[flightid].bearing.toFixed());
}

function headingClearanceChanged(){
	return (Number(document.getElementById('heading-input').value) != originalHeading);
}
function speedClearanceChanged(){
	return (Number(document.getElementById('speed-input').value) != originalSpeed);
}

function populateClearanceTable(flightid)
{
    let clearanceTable = document.querySelector('.clearance-table');       
	var len = clearanceTable.rows.length;
	if (len > 1)
	{
		for (let r=1; r < len; r++)
		{
			clearanceTable.deleteRow(1);
		}
	}

	var sorted = getSortedClearanceEvents();
	for (let c = 0; c < sorted.length; c++)
	{	
		if (bShowAllEvents || sorted[c].flightid == hookedFlight)
			if (sorted[c].probe == false){
				let eventId = sorted[c].id;
				row = clearanceTable.insertRow();
				var cell0 = row.insertCell(0);
				cell0.innerHTML = flights[sorted[c].flightid].callsign;

				var cell1 = row.insertCell(1);
				var cell2 = row.insertCell(2);
				var cell3 = row.insertCell(3);							

				var celltrash = row.insertCell(4);
    			newImage = document.createElement('img');
				newImage.src = "trash.svg";
				newImage.style.width = '30px'; // Adjust size as needed
    			newImage.style.height = 'auto';
    			newImage.style.color='white';
    			newImage.setAttribute('class','plusminusbutton');
    			newImage.onclick = function() {
        		 DeleteClearance(eventId,flightid);
        		};
    			celltrash .appendChild(newImage);
    										
				var clearanceTime = new Date();
				clearanceTime = setTimeFromString(clearanceTime,sorted[c].time);
				var clearanceIssueTime = new Date();
				clearanceIssueTime = setTimeFromString(clearanceIssueTime,sorted[c].issue_time);

				if (sorted[c].flightid!=hookedFlight){
					cell0.style.color='grey';
					cell1.style.color='grey';
					cell2.style.color='grey';
					cell3.style.color='grey';
				}else{
					cell0.style.color='rgba(70,195,215,255)';
					cell1.style.color='rgba(70,195,215,255)';
					cell2.style.color='rgba(70,195,215,255)';					
					cell3.style.color='rgba(70,195,215,255)';					
				}
				// Create the main container div
				var customTimeInput = document.createElement('div');
				customTimeInput.classList.add('custom-time-input');

				// Create the decrement button
				var decrementITimeButton= document.createElement('button');
				decrementITimeButton.classList.add('decrement');
				decrementITimeButton.textContent = '-';

				var timeP = document.createElement('p');
				timeP.textContent = clearanceIssueTime.toLocaleTimeString();
		
				// Create the increment button
				var incrementITimeButton = document.createElement('button');
				incrementITimeButton .classList.add('increment');
				incrementITimeButton .textContent = '+';

				// Append the buttons and input to the container div
				customTimeInput.appendChild(timeP);
				customTimeInput.appendChild(decrementITimeButton);
				customTimeInput.appendChild(incrementITimeButton );
				cell1.appendChild(customTimeInput);
				let eventFlightId = sorted[c].flightid;

				// Add event listeners to the buttons
				incrementITimeButton.addEventListener('click', function() {
				  IncreaseClearanceIssueTime(eventId,eventFlightId);	
				});

				decrementITimeButton.addEventListener('click', function() {
				  DecreaseClearanceIssueTime(eventId,eventFlightId);	
				});
				// Append the entire custom number input div to the body (or any container)

				cell1.setAttribute('class',".clearance-table-issue-time");    
        						
// Create the main container div
				var customClearanceTimeInput = document.createElement('div');
				customClearanceTimeInput .classList.add('custom-time-input');

				// Create the decrement button
				var decrementCTimeButton= document.createElement('button');
				decrementCTimeButton.classList.add('decrement');
				decrementCTimeButton.textContent = '-';

				let timeCP = document.createElement('p');
				timeCP .textContent = clearanceTime.toLocaleTimeString();
		
				// Create the increment button
				var incrementCTimeButton = document.createElement('button');
				incrementCTimeButton .classList.add('increment');
				incrementCTimeButton .textContent = '+';

				// Append the buttons and input to the container div
				customClearanceTimeInput .appendChild(timeCP);
				customClearanceTimeInput .appendChild(decrementCTimeButton);
				customClearanceTimeInput .appendChild(incrementCTimeButton );
				cell2.appendChild(customClearanceTimeInput );

				// Add event listeners to the buttons
				incrementCTimeButton.addEventListener('click', function() {
				  IncreaseClearanceTime(eventId,eventFlightId);	
				});

				decrementCTimeButton.addEventListener('click', function() {
				  DecreaseClearanceTime(eventId,eventFlightId);	
				});

				cell2.setAttribute('class',".clearance-table-time");

				cell3.setAttribute('class',".clearance-table-level");
		        let inputElement = document.createElement("input");
                inputElement.classList.add('level-input');

				inputElement.id = flights[sorted[c].flightid].callsign+":"+eventId;


				inputElement.addEventListener('change', function() {
				  InputLevelChanged(inputElement.value, eventFlightId, eventId);				
				});
		        inputElement.type = "number";
		        inputElement.width=50;
		        inputElement.min = 10;
		        inputElement.max = 450;
		        inputElement.step = 10;
   		        inputElement.value = sorted[c].level;
   				if (sorted[c].flightid==hookedFlight){   					
	   		        inputElement.style.color = 'rgba(70,195,215,255)';
	   		    }
	   		    else{
	   		    	inputElement.style.color = 'grey';
	   		    }	   		    

   		        cell3.appendChild(inputElement );
   		        	        
			}	  	
	}			

}
function InputLevelChanged(evalue, fid, eid)
{
	var events = clearanceEvents.get(fid);
	let level = Number(evalue);
	events[eid].level = level;
	clearanceEvents.set(fid, events);
	bNewEvent = true;
	populateClearanceTable(hookedFlight);

}
function DeleteClearance(eventid,flightid)
{
	var events = clearanceEvents.get(flightid);
	events.splice(eventid,1);	
	bNewEvent = true;
	populateClearanceTable(hookedFlight);	
}

// If changing issues time, clearance time changes by the same amount
function IncreaseClearanceIssueTime(eid,fid){
	var events = clearanceEvents.get(fid);
	let	clearanceIssueTime = new Date();
	let clearanceTime = new Date();
	clearanceIssueTime = setTimeFromString(clearanceIssueTime, events[eid].issue_time);
	clearanceIssueTime.setTime(clearanceIssueTime.getTime() + 20*1000);
	clearanceTime = setTimeFromString(clearanceTime , events[eid].time);
	clearanceTime .setTime(clearanceTime .getTime() + 20*1000);
	events[eid].time = clearanceTime .toLocaleTimeString();
	events[eid].issue_time = clearanceIssueTime.toLocaleTimeString();	
	clearanceEvents.set(fid, events);
	bNewEvent = true;
	populateClearanceTable(hookedFlight);
}
function DecreaseClearanceIssueTime(eid,fid){
	var events = clearanceEvents.get(fid);
	let	clearanceIssueTime = new Date();
	let clearanceTime = new Date();
	clearanceIssueTime = setTimeFromString(clearanceIssueTime, events[eid].issue_time);
	clearanceIssueTime.setTime(clearanceIssueTime.getTime() - 20*1000);
	clearanceTime = setTimeFromString(clearanceTime , events[eid].time);
	clearanceTime.setTime(clearanceTime .getTime() - 20*1000);
	events[eid].time = clearanceTime.toLocaleTimeString();
	events[eid].issue_time = clearanceIssueTime.toLocaleTimeString();
	clearanceEvents.set(fid, events);
	bNewEvent = true;
	populateClearanceTable(hookedFlight);

}
function IncreaseClearanceTime(eid,fid){
	var events = clearanceEvents.get(fid);
	let	clearanceTime = new Date();
	clearanceTime = setTimeFromString(clearanceTime , events[eid].time);
	clearanceTime .setTime(clearanceTime .getTime() + 20*1000);
	events[eid].time = clearanceTime .toLocaleTimeString();
	clearanceEvents.set(fid, events);
	bNewEvent = true;
	populateClearanceTable(hookedFlight);

}
function DecreaseClearanceTime(eid,fid){
	var events = clearanceEvents.get(fid);
	let	clearanceTime = new Date();
	clearanceTime = setTimeFromString(clearanceTime , events[eid].time);
	clearanceTime .setTime(clearanceTime .getTime() - 20*1000);
	events[eid].time = clearanceTime.toLocaleTimeString();
	clearanceEvents.set(fid, events);
	bNewEvent = true;
	populateClearanceTable(hookedFlight);

}
function playpause(){

	let but = document.getElementById("playpause");
	if (bPlay == true){
		but.textContent = "Play";
		bPlay = false;
	}else{
		but.textContent = "Pause";
		bPlay = true;
	}
	
    //updateDataIntervalId = setInterval(updateData,1000);
   	//clearInterval(updateDataIntervalId);
}



function updateProbeEvent()
{
	var events = [];
	var bFound = false;

	var clearanceTime = new Date(simTime.getTime());
	var clearanceIssueTime = new Date(simTime.getTime());
	if (selectedClearanceTime == 0 || selectedClearanceIssueTime == 0){
		return;
	}else{
		clearanceTime.setMinutes(clearanceTime.getMinutes()+selectedClearanceTime);				
	}
	
	if (selectedClearanceIssueTime != 0){
		clearanceIssueTime.setMinutes(clearanceIssueTime.getMinutes()+selectedClearanceIssueTime);				
	}
	console.log(clearanceIssueTime.toLocaleTimeString(), clearanceTime.toLocaleTimeString());
	
	console.log(clearanceEvents);
	if (!validLevelClearance(true)){
		return;
	}	
	if (clearanceEvents.has(hookedFlight))
	{
		events = clearanceEvents.get(hookedFlight);					
		for (let e = 0; e < events.length; e++)
		{
			if (events[e].probe == true)
			{
				events[e].level = selectedClearanceLevel;				
				events[e].time = clearanceTime.toLocaleTimeString();
				events[e].issue_time = clearanceIssueTime.toLocaleTimeString();
				bNewEvent = true;
				bFound = true;

			}				
		}
		// clearance events but no probe events add to the event, dodgy assumption that 26 mins will be at the end
		if (!bFound && selectedClearanceLevel != 0)
		{
			events.push({issue_time	: clearanceIssueTime.toLocaleTimeString(),
						 time		: clearanceTime.toLocaleTimeString(), 
						 level		: selectedClearanceLevel,
						 probe		: true});
			bFound = true;
			bNewEvent = true;
		}
	}
	if (!bFound){
		if (selectedClearanceLevel != 0){			
			clearanceEvents.set(hookedFlight,[{issue_time	: clearanceIssueTime.toLocaleTimeString(),
											   time			: clearanceTime.toLocaleTimeString(),			
											   level		: selectedClearanceLevel,
											   probe		: true}]);
			bNewEvent = true;
		}
	}	
}

function getSortedClearanceEvents(){
	var sorted = [];
	
	let keys = Array.from(clearanceEvents.keys());
	for (k = 0; k < keys.length; k++)
	{	
		var events = clearanceEvents.get(keys[k]);
		for (let c=0; c < events.length; c++){
			events[c].flightid = keys[k];
			events[c].id = c;
			sorted.push(events[c]);
		}	
	}
	sorted.sort(function(a,b)
		{
			var ATime = new Date();
			ATime = setTimeFromString(ATime, a.time);
			var BTime = new Date();
			BTime = setTimeFromString(BTime, b.time);
			return ATime.getTime() - BTime.getTime();
		});
	return sorted;
}

function getSector(flightid, pos)
{
	var position = latLonToXY(pos.lng, pos.lat);
	var sector = -1;
	for (let s = 0; s < sectorData.features.length; s++)
	{
		var coords = sectorData.features[s].geometry.coordinates;
		var vertices = coords[0];
		
		var bInside = isPointInPolygon([position.x,position.y],vertices);
		if (bInside)
		{
			sector = s;
			break;
		}
	}
	return sector;
}

function isPointInPolygon(point, polygon) {
    const [x, y] = point;
    let isInside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var XYpoint = latLonToXY(polygon[i][1],polygon[i][0]);
        const [xi, yi] = [XYpoint.x, XYpoint.y];
      	XYpoint = latLonToXY(polygon[j][1],polygon[j][0]);
        const [xj, yj] = [XYpoint.x, XYpoint.y];

        const intersect = ((yi > y) !== (yj > y)) &&
                          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }

    return isInside;
}

// Example usage:
const polygon = [[1, 1], [1, 5], [5, 5], [5, 1]];
const point1 = [3, 3];  // Inside
const point2 = [6, 3];  // Outside

//console.log(isPointInPolygon(point1, polygon));  // true
//console.log(isPointInPolygon(point2, polygon));  // false

function orientation(p, q, r) {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (val === 0) return 0;  // collinear
    return (val > 0) ? 1 : 2; // 1: clockwise, 2: counterclockwise
}

function onSegment(p, q, r) {
    return q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
           q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]);
}

function doIntersect(p1, q1, p2, q2) {
    // Find the four orientations needed for the general and special cases
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    // General case
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }

    // Special Cases
    // p1, q1, and p2 are collinear and p2 lies on segment p1q1
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1, and q2 are collinear and q2 lies on segment p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2, and p1 are collinear and p1 lies on segment p2q2
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2, and q1 are collinear and q1 lies on segment p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    // If none of the cases apply, the line segments do not intersect
    return false;
}

// Example usage:
const line1Start = [1, 1];
const line1End = [10, 1];
const line2Start = [1, 2];
const line2End = [10, 2];
const line3Start = [5, 0];
const line3End = [5, 3];

//console.log(doIntersect(line1Start, line1End, line2Start, line2End)); // false
//console.log(doIntersect(line1Start, line1End, line3Start, line3End)); // true
function doesTrajectoryPenetrateSector(flightid)
{	 

}

function Update3Di(){
	if (hookedFlight >= 0){
		for (p = 0; p < trajectories[hookedFlight].length; p++){
			if (trajectories[hookedFlight][p].level = trajectories[hookedFlight][p+1].level){
			}
		}
	}
		
}
function Start()
{
	// Depending on the option selected, enable or disable certain events?
	// E.g. Emergency will enable emergency events
	clearInterval(onTickIntervalId);
	clearInterval(updateDataIntervalId);
	
	mode = document.getElementById('mode').value;
	if (mode == "CCD"){
		simTime = setTimeFromString(simTime, nineOclock);
		initFlights();
		clearanceEvents = deepCopyMap(initClearanceEvents);
		populateClearanceTable(-1);
		TDBShapes.clear();
		calculateInitialTrackPositions();
	   	calculateTrajectoriesV2();
	}
	else if (mode == "RAN")
	{
		simTime = setTimeFromString(simTime, nineOclock);
		GenerateRandomFlights();
		clearanceEvents = new Map();
		populateClearanceTable(-1);
		TDBShapes.clear();
		calculateInitialTrackPositions();
	   	calculateTrajectoriesV2();		
	}
	else if (mode == "ESS")
	{
		// reset the clock and add the default flights and clearance events
		simTime = setTimeFromString(simTime, nineOclock);
		initFlights();
		clearanceEvents = deepCopyMap(initClearanceEvents);
		// Setup emergency events and aircraft
		createEmergencyEvents();
		
		populateClearanceTable(-1);
		TDBShapes.clear();
		calculateInitialTrackPositions();
	   	calculateTrajectoriesV2();
		emergencyEventsIntervalId = setInterval(pollEmergencyEvents,1000);
		map.setView([51.08195849927352, -1.7997468147947484], 9);
		//hookedFlight = 2;

	}	
	else if (mode == "ECD"){
	// reset the clock and add the default flights and clearance events
		simTime = setTimeFromString(simTime, nineOclock);
		initFlights();
		// Setup emergency events and aircraft
		createConflictEvents();
		conflictEventsIntervalId = setInterval(pollConflictEvents,1000);

		populateClearanceTable(-1);
		TDBShapes.clear();
		calculateInitialTrackPositions();
	   	calculateTrajectoriesV2();

	}

	onTickIntervalId = setInterval(onTick,1000);
    updateDataIntervalId = setInterval(updateData,1000);

}



function highlightTDBEmergency(flightId){
	// create a buffer zone around TDB
	// TDB to show ROCD in red
}  
// Simplest way to handle heading clearances is by adding a fix
function setHeadingClearance(flightid, heading, probe){

	// Calculate a fix at position away based on current speed for 30 mins
	let pos = trajectories[flightid][0].coords;
	let newPos = calculateNewLatLonTimeSpeedBearing(pos.lat, pos.lng, 30/60, trajectories[flightid][0].speed, heading);			

	if (probe){
		if (flightHeadingProbeClearances.has(flightid)){
			flightHeadingProbeClearances.get(flightid).probeHeading = heading;
			flightHeadingProbeClearances.get(flightid).probePos = newPos;
		}
		else{
			flightHeadingProbeClearances.set(flightid,{probeHeading : heading, probePos: newPos});
		}		
	}else{
		if (flightHeadingClearances.has(flightid)){
			flightHeadingClearances.get(flightid).heading = heading;
			flightHeadingClearances.get(flightid).pos = newPos;
		}
		else{
			flightHeadingClearances.set(flightid,{heading : heading, pos: newPos});
		}	
	}	
}

function setSpeedClearance(flightid, speed, probe){
	
	if (probe){
		flightSpeedProbeClearances.set(flightid, Number(speed));
	}else{
		flightSpeedClearances.set(flightid, Number(speed));
	}	
}

document.addEventListener('keydown', function(event) {
    if (event.key == 'h'){
    	setHeadingClearance(hookedFlight,200,false);
    }
});

function validLevelClearance(checktimes){
	let bResult = false;
	if (selectedClearanceIssueTime != 0 && selectedClearanceTime != 0 && selectedClearanceLevel != 0){
		// perform some validity checking before accepting the clearance so we don't get
		// weird effects on the vrt
		if (checktimes){
			bResult = true;
			var clearanceTime = new Date(simTime.getTime());
			clearanceTime.setMinutes(clearanceTime.getMinutes()+selectedClearanceTime);
			var clearanceIssueTime = new Date(simTime.getTime());
			clearanceIssueTime.setMinutes(clearanceIssueTime.getMinutes()+selectedClearanceIssueTime);

			let sorted = getSortedClearanceEvents();
			for (let c = 0; c < sorted.length; c++)
			{	
				if (sorted[c].flightid == hookedFlight && sorted[c].probe == false)
				{
					let eventIssueTime = new Date();
					eventIssueTime = setTimeFromString(eventIssueTime, sorted[c].issue_time);
					let eventTime = new Date();
					eventTime = setTimeFromString(eventTime, sorted[c].time);
	
					if ((clearanceIssueTime.getTime() > eventIssueTime.getTime() && clearanceIssueTime.getTime() < eventTime.getTime()) ||
						(clearanceTime.getTime() > eventIssueTime.getTime() && clearanceTime.getTime() < eventTime.getTime()) ||
						clearanceIssueTime.getTime() < eventIssueTime.getTime() && clearanceTime.getTime() > eventTime.getTime())
					{
						bResult = false; 
					}	
				}
			}
		}else{
			bResult = true;
		}
	}
	
	return bResult;
}

function DirectRouteProbe(flightid, fix){
	directRouteFlight = flightid;
	directRouteFix = fix;
	bDirectRouteProbe = true;
	calculateTrajectoriesV2();

}

function ClearDirectRouteProbe(){
	directRouteFlight = -1;
	directRouteFix = "";
	bDirectRouteProbe = false;
	calculateTrajectoriesV2();
}