var bAutoConflictDetection = false;

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

// Calculate distance between 2 lat longs
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3440.065; // Earth's radius in nautical miles

    // Convert latitude and longitude from degrees to radians
    const a1 = toRadians(lat1);
    const a2 = toRadians(lat2);
    const d1 = toRadians(lat2 - lat1);
    const d2 = toRadians(lon2 - lon1);

    // Haversine formula
    const a = Math.sin(d1 / 2) * Math.sin(d1 / 2) +
              Math.cos(a1) * Math.cos(a2) *
              Math.sin(d2 / 2) * Math.sin(d2 / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in nautical miles
    const distance = R * c;
    return distance;
}
// Calculate coords from a given point, distance and bearing
function calculateNewLatLonDistanceBearing(lat1, lon1, distanceNm, bearing) {
    const R = 3440.065; // Earth's radius in nautical miles

    // Convert initial coordinates and bearing from degrees to radians
    let lat1Rad = toRadians(lat1);
    let lon1Rad = toRadians(lon1);
    let bearingRad = toRadians(bearing);

    // Calculate the new latitude
    let lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(distanceNm / R) +
                            Math.cos(lat1Rad) * Math.sin(distanceNm / R) * Math.cos(bearingRad));

    // Calculate the new longitude
    let lon2Rad = lon1Rad + Math.atan2(Math.sin(bearingRad) * Math.sin(distanceNm / R) * Math.cos(lat1Rad),
                                       Math.cos(distanceNm / R) - Math.sin(lat1Rad) * Math.sin(lat2Rad));

    // Convert the new coordinates from radians to degrees
    let lat2 = toDegrees(lat2Rad);
    let lon2 = toDegrees(lon2Rad);

    return { lat: lat2, lng: lon2 };
}
function calculateNewLatLonTimeSpeedBearing(lat, lon, timeHours, speedKnots, bearingDegrees) {
    const R = 3440.065; // Earth's radius in nautical miles

    // Convert input to radians
    let lat1 = toRadians(lat);
    let lon1 = toRadians(lon);
    let brng = toRadians(bearingDegrees);

    // Calculate distance traveled in nautical miles
    let distance = speedKnots * timeHours;

    // Calculate the new latitude
    let lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(distance / R) +
        Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng)
    );

    // Calculate the new longitude
    let lon2 = lon1 + Math.atan2(
        Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
        Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );

    // Convert the result back to degrees
    let newLat = toDegrees(lat2);
    let newLon = toDegrees(lon2);

    return {
        lat: newLat,
        lng: newLon
    };
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    // Convert latitude and longitude from degrees to radians
    let lat1Rad = toRadians(lat1);
    let lon1Rad = toRadians(lon1);
    let lat2Rad = toRadians(lat2);
    let lon2Rad = toRadians(lon2);

    // Calculate the difference in longitudes
    let deltaLon = lon2Rad - lon1Rad;

    // Calculate the bearing
    let y = Math.sin(deltaLon) * Math.cos(lat2Rad);
    let x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon);

    let bearingRad = Math.atan2(y, x);

    // Convert the bearing from radians to degrees
    let bearingDeg = toDegrees(bearingRad);

    // Normalize the bearing to a value between 0 and 360 degrees
    return (bearingDeg + 360) % 360;
}

// MTCD functions
function vectorSubtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
}

function dotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

function normSquared(v) {
    return dotProduct(v, v);
}

function calculateClosestPoints(P1, Q1, P2, Q2) {
    let d1 = vectorSubtract(Q1, P1);
    let d2 = vectorSubtract(Q2, P2);
    let r = vectorSubtract(P1, P2);
    let a = normSquared(d1);
    let e = normSquared(d2);
    let f = dotProduct(d2, r);
    
    let s, t;
    let c = dotProduct(d1, r);
    let b = dotProduct(d1, d2);
    
    let denom = a * e - b * b;
    
    if (denom !== 0) {
        s = (b * f - c * e) / denom;
    } else {
        s = 0;
    }
    
    t = (b * s + f) / e;
    
    let closestPoint1 = [
        P1[0] + s * d1[0],
        P1[1] + s * d1[1],
        P1[2] + s * d1[2],
        P1[3] + s * d1[3]
    ];
    
    let closestPoint2 = [
        P2[0] + t * d2[0],
        P2[1] + t * d2[1],
        P2[2] + t * d2[2],
        P2[3] + t * d2[3]
    ];
    
    return { closestPoint1, closestPoint2 };
}

function distanceBetweenPoints(p1, p2) {
    return Math.sqrt(
        Math.pow(p1[0] - p2[0], 2) +
        Math.pow(p1[1] - p2[1], 2) +
        Math.pow(p1[2] - p2[2], 2)
    );
}

function timeDifference(p1, p2) {
    return Math.abs(p1[3] - p2[3]);
}

var closestPoints = [];
function checkSegmentClose(P1, Q1, P2, Q2, f1, f2, spatialThreshold, timeThreshold) {
    let { closestPoint1, closestPoint2 } = calculateClosestPoints(P1, Q1, P2, Q2);
    
    let spatialDistance = distanceBetweenPoints(closestPoint1, closestPoint2);
    let timeDiff = timeDifference(closestPoint1, closestPoint2);
    if (spatialDistance <= spatialThreshold && timeDiff <= timeThreshold)
    {
    	// Level is divided by 10 at source to make the calculation more accurate, so multiply again 
    	closestPoint1[2]=closestPoint1[2]*10;
    	closestPoint2[2]=closestPoint2[2]*10;

	    closestPoints.push({p1: closestPoint1, flight1: f1, p2: closestPoint2, flight2: f2, d: spatialDistance});
	    return true;
	}
	else
	{
		return false;
	}
}

function checkPolylinesClose(polyline1,polyline2,f1,f2, spatialThreshold, timeThreshold) {
    for (let i = 0; i < polyline1.length - 1; i++) {
        let P1 = polyline1[i];
        let Q1 = polyline1[i + 1];
        for (let j = 0; j < polyline2.length - 1; j++) {
            let P2 = polyline2[j];
            let Q2 = polyline2[j + 1];
            if (checkSegmentClose(P1, Q1, P2, Q2, f1,f2,spatialThreshold, timeThreshold)) {
                return true;
            }
        }
    }
    return false;
}

function checkMultiplePolylines(polylines, spatialThreshold, timeThreshold) {
    for (let i = 0; i < polylines.length; i++) {
        for (let j = i + 1; j < polylines.length; j++) {
            if (checkPolylinesClose(polylines[i], polylines[j], spatialThreshold, timeThreshold)) {
                return true;
            }
        }
    }
    return false;
}
var closestInteractionFlight2;
function probeTrajectories()
{
	closestPoints=[];
	let spatialThreshold = 0.01;
	let timeThreshold = 0;
    bInteractionFound= false;

 	// Create the polyline structure from trajectory array
	var polyline1 = [];
	for (let i = 0; i < trajectories.length; i++){
		polyline1 = [];
 		for (let pi=0;pi<trajectories[i].length;pi++)
 		{
 			polyline1.push([trajectories[i][pi].coords.lat,
 				trajectories[i][pi].coords.lng,
 				//trajectories[i][p].level/10,
 				10,
 				trajectories[i][pi].time.getTime()]);
 				//let Point = mapPointToRadarCanvas(radarCanvas, trajectories[i][pi].coords.lat, trajectories[i][pi].coords.lng);
	 			//polyline1.push([Point.x,Point.y,10,trajectories[i][pi].time.getTime()]);
 		}
 		
        for (let j = 0; j < trajectories.length; j++) 
        {
        	if (j != i)
         	{
       			var polyline2 = [];

          		for (let pj=0;pj<trajectories[j].length;pj++)
 		  		{
 			 		 polyline2.push([trajectories[j][pj].coords.lat,
 			 		 					trajectories[j][pj].coords.lng,
 			 		 					//trajectories[j][p].level/10,
 			 		 					10,
 			 		 					trajectories[j][pj].time.getTime()]);
 			 		//let Point2 = mapPointToRadarCanvas(radarCanvas, trajectories[j][pj].coords.lat, trajectories[j][pj].coords.lng);
	 			 	//polyline2.push([Point2.x,Point2.y,10,trajectories[j][pj].time.getTime()]);
 		  		}
		
          		if (checkPolylinesClose(polyline1, polyline2, i,j,spatialThreshold, timeThreshold))
          		{
        		  var toprightCanvas = document.getElementById('top');
        		  const tctx = toprightCanvas.getContext('2d');
      	
				  bInteractionFound= true;
          		}
          	}
        }
    }
    
    // Automatically detect for conflicts involving the same aircraft with two different aircraft
    // Dont bother doing this if there are any probed clearances
    if (bInteractionFound && bAutoConflictDetection && !validLevelClearance() && flightHeadingProbeClearances.size == 0 && flightSpeedProbeClearances.size == 0){
    	var iMap = new Map();
    	for (let a=0; a < closestPoints.length; a++){
    		f1 = closestPoints[a].flight1;
    		f2 = closestPoints[a].flight2;
    		let l1 = flightLevelAtTime(closestPoints[a].flight1, closestPoints[a].p1[3]);
	   		let l2 = flightLevelAtTime(closestPoints[a].flight2, closestPoints[a].p2[3]);

    		var distanceNm = haversineDistance(closestPoints[a].p1[1],closestPoints[a].p1[0],closestPoints[a].p2[1],closestPoints[a].p2[0]);
			if (distanceNm > 0.01 && distanceNm < 3 && (Math.abs(l1-l2) < 20))
			{
    			if (iMap.has(f1)){
    				iMap.get(f1).push(f2);
    			}else{
    				iMap.set(f1, [f2]);
    			}
    		}
    	}
        
    	interactionVectors = [];
		if (interactionVectors.length == 0)
		{
    		let keys = Array.from(iMap.keys());
			for (k = 0; k < keys.length; k++)
			{			
				var iflights = iMap.get(keys[k]);
				if (iflights.length > 1 && interactionVectors.length == 0)
				{
					console.log("more than 1");			
					for (let i = 0; i < iflights.length; i++)
					{ 
						interactionVectors.push([keys[k],iflights[i]]);				
					}				
				}
			}
    	}    	
    
    }
    	
	return bInteractionFound;	
}

// Used to calculate the flight level
function getFlightLevelAtTime(flightid, time){

	for (let p = 0; p < trajectories[flightid].length; p++){
		let point = trajectories[flightid][p];
		if (p != trajectories[flightid].length-1){
			let nextPoint = trajectories[flightid][p+1];
			if (time > point.time && time < nextPoint.time){
				let ratio = (time-point.time)/(nextPoint.time-point.time);
			}
		}
	}					
}


