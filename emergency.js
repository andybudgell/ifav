
var emergencyEvents = new Array();
var emergencyEvent1 = {time: "09:00:02",callsign: "ES001",type: "SMOKE IN COCKPIT", nearestAirport: "EGLL", suggestedAirports: ["EGLL","EGGD","EGHF"],route: ["OCK","EGLL"]};
var emergencyEvent2 = {time: "09:05:02",callsign: "ES002",type: "UNKNOWN HARDWARE FAILURE", nearestAirport: "EGBN", suggestedAirports: ["EGLL","EGGD","EGHF"],route: ["OCK","EGLL"]};

var emergencyFlightES1 = 
				{callsign: "ES001",startTime: "09:00:00",ifl: 300,initSpeed: 300,					
				  fixroute:[{name:"KAPEX"},
				  			{name:"EGBN"}]};
// simulate steep descent
var emergencyClearanceEventES1 = {issue_time:"09:00:2",time:"09:20:00",level:20,probe:false};

var emergencyFlightES2 = 
				{callsign: "ES002", startTime: "09:00:02",ifl: 280,initSpeed: 300,rfl: 0,cfl: 0,					
				  fixroute:[{name:"WELIN"},
							  {name:"SILVA"},
							  {name:"PEPIS"}]};
						
var emergencyFlightId = -1;;

function pollEmergencyEvents(){
	for (e = 0; e < emergencyEvents.length; e++){
		var etime = new Date();
		etime = setTimeFromString(etime, emergencyEvents[e].time);
		if ( simTime.getTime() >= etime.getTime()){
			createEmergencyPopup(structuredClone(emergencyEvents[e]));
			emergencyEvents.shift();
		}
	}	
}

// Steps in setting up Emergency events
// 1) Add the emergency events 
//    Add the aircraft event
//    Add the appropriate clearance event (e.g. steep descent event) to the event maps.
// 2) Show the emergency popup
// 
function createEmergencyEvents(){
	// Add aircraft to map	
	emergencyEvents = [];
	closeEmergencyPopup();
	let nextFlightId1 = flights.length;
	flights.push(emergencyFlightES1);
	flights.push(emergencyFlightES2);
	// add clearanceEvents here with correct flightid
	// comment out for now Matt T 26/9
	clearanceEvents.set(nextFlightId1,[emergencyClearanceEventES1]);
   	emergencyEvents.push(emergencyEvent1);
   	emergencyEvents.push(emergencyEvent2);

   	
}

function DivertToAirport(flightid, airport){
	flights[flightid].fixroute = [{name: airport, level:0,speed:500}];
	calculateTrajectoriesV2();
}



const movableDiv = document.createElement('div');
	movableDiv.style.width = '250px';
    movableDiv.style.height = '250px';
    movableDiv.style.position = 'absolute';
    movableDiv.style.top = '500px';
    movableDiv.style.left = '700px';
    movableDiv.style.border = '2px solid #333';
    movableDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    movableDiv.style.zIndex = 1010;
    movableDiv.id='es';
   	movableDiv.setAttribute('class','movableDiv');

    document.body.appendChild(movableDiv);
    
 // Create the title bar div
    const titleBar = document.createElement('div');
    titleBar.style.height = '30px';
    titleBar.style.padding = '5px';
    titleBar.style.cursor = 'grab';
    titleBar.style.display = 'flex';
    titleBar.style.alignItems = 'center';
    titleBar.style.justifyContent = 'space-between';
    titleBar.innerHTML = 'Title Bar - Drag me';
    titleBar.style.zIndex = 1010;
    titleBar.style.id = 'esHeader';
	titleBar.setAttribute('class','movableDivHeader');

    titleBar.id = 'esHeader';
    movableDiv.appendChild(titleBar);
     // Dragging functionality
    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - movableDiv.offsetLeft;
        offsetY = e.clientY - movableDiv.offsetTop;
        titleBar.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            movableDiv.style.left = `${e.clientX - offsetX}px`;
            movableDiv.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        titleBar.style.cursor = 'grab';
    });
    	document.getElementById('es').style.display='none';

function createEmergencyPopup(event){
	// create moveable div
	emergencyFlightId = getFlightId(event.callsign);
	let div = document.getElementById('es');
	div.style.display='inline';
	let divheader = document.getElementById('esHeader');
	divheader.innerHTML = event.callsign + ' EMERGENCY  ';;
	let closeBut = document.createElement('button');
	closeBut.id = "closeBut";
	closeBut.textContent = "X";
	closeBut.onclick = function(){
		closeEmergencyPopup();
	};
	divheader.appendChild(closeBut);		

	let	acTable = document.createElement('table');
	acTable.id = "emergencyTable";
	acTable.style.height = div.style.height;
	let reasonRow = document.createElement('tr');
	let reasonCell = document.createElement('td');
	reasonCell.textContent = event.type + ' ' + event.time;
	reasonCell.colSpan = 4;
	reasonRow.appendChild(reasonCell);		
	acTable.appendChild(reasonRow);	
	
	let divertToRow = document.createElement('tr');	
	let divertCell = document.createElement('td');
	divertCell.textContent = "Divert To";
	divertToRow.appendChild(divertCell);
	

	let divertAirportsCell = document.createElement('td');
	let divertAirportsMenu = document.createElement('select');
	let divertAirports = event.suggestedAirports;
	divertAirportsMenu.id = 'divertAirports';
	// Create options for the select menu
        divertAirports.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport;
            option.textContent = airport;
            divertAirportsMenu.appendChild(option);
    });
    divertAirportsCell.appendChild(divertAirportsMenu);
    divertToRow.appendChild(divertAirportsCell);
    
    prevbut = document.createElement('button');
    prevCell = document.createElement('td');
    prevbut.textContent = "Preview";
    prevbut.style.color='orange';
    prevbut.onclick = function() {
	    let airport = document.getElementById('divertAirports').value;
	    HookFlight(emergencyFlightId);
	   	DirectRouteProbe(emergencyFlightId,airport);       		
    };
    prevCell.appendChild(prevbut);
    divertToRow.appendChild(prevCell);
    
    
    testbut = document.createElement('button');
    testCell = document.createElement('td');
    testbut.textContent = "Accept";
    testbut.style.color='green';
    testbut.onclick = function() {
    			 ClearDirectRouteProbe();
    			 let airport = document.getElementById('divertAirports').value;
        		 DivertToAirport(emergencyFlightId,airport);
        		 closeEmergencyPopup();
    };
    testCell.appendChild(testbut);
    divertToRow.appendChild(testCell);
   	acTable.appendChild(divertToRow);	

		
	div.appendChild(acTable);

}	
	

function closeEmergencyPopup(){
	let esTable = document.getElementById('emergencyTable');
	if (esTable !== null){
		document.getElementById('es').style.display='none';	
		esTable.remove();
		emergencyFlightId = -1;
		ClearDirectRouteProbe();
	}
}

function isEmergency(){
	if (document.getElementById('es').style.display == 'none')
		return false;

return true;
}
	
		

