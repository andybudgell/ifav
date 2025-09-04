
var traEvents = new Array();
var traEvent1 = {time: "09:00:10",traId: 1, show: 1};
var traEvent2 = {time: "09:00:15",traId: 2, show: 1};
var traEvent3 = {time: "09:00:20",traId: 1, show: 0};
var traEvent4 = {time: "09:00:25",traId: 2, show: 0};
var traFlightES1 = 
				{callsign: "ES001",startTime: "09:00:00",ifl: 300,initSpeed: 300,					
				  fixroute:[{name:"KAPEX"},
				  			{name:"EGBN"}]};
// simulate steep descent
var traClearanceEventES1 = {issue_time:"09:00:2",time:"09:20:00",level:20,probe:false};

var traFlightES2 = 
				{callsign: "ES002", startTime: "09:00:02",ifl: 280,initSpeed: 300,rfl: 0,cfl: 0,					
				  fixroute:[{name:"WELIN"},
							  {name:"SILVA"},
							  {name:"PEPIS"}]};
						
var traFlightId = -1;;
const traLayersByName = {};

function polltraEvents(){
	for (e = 0; e < traEvents.length; e++){
		var etime = new Date();
		etime = setTimeFromString(etime, traEvents[e].time);
		if ( simTime.getTime() >= etime.getTime()){
			if (traEvents[e].show == 1){
				showTra(traEvents[e].traId);
				traEvents.shift();
			}else{
				hideTra(traEvents[e].traId);
				traEvents.shift();

			}
		}
	}	
}

// Steps in setting up tra events
// 1) Add the tra events 
//    Add the aircraft event
//    Add the appropriate clearance event (e.g. steep descent event) to the event maps.
// 2) Show the tra popup
// 
function createtraEvents(){
	// Add aircraft to map	
	traEvents = [];
	
	traData.features.forEach((feature,index) => {
		const name = feature.properties.name[0].text;
		const layer = L.geoJSON(feature, {
			style: {color: 'blue',
            weight: 2,
            fillColor: 'blue',
			fillOpacity: 1}
		});
		traLayersByName[index] = layer;

		});

   	traEvents.push(traEvent1);
   	traEvents.push(traEvent2);   
	traEvents.push(traEvent3);
   	traEvents.push(traEvent4);
}

function showTra(traId){
	
	traLayersByName[traId-1].addTo(map);
}

function hideTra(traId){
	map.removeLayer(traLayersByName[traId-1]);
}



