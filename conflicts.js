var interactionVectors = new Array();

// In this scenario two aircraft are both in conflict with the same aircraft
var conflictEvents = new Array();
var conflictEvent1 = {time: "09:02:10",ac1: "EIN72",ac2: "BAW123",ac3: "TAL123",suggestion: 2, times: ["9:14:20","9:20:15"]};
var conflictEvent2 = {time: "09:05:10",ac1: "TAL321",ac2: "RYR320",ac3: "TAL124",suggestion: 3, times: ["9:14:27","9:20:35"]};
var conflictEvent3 = {time: "09:08:10",ac1: "BAW124",ac2: "DAL53",ac3: "DAL52",suggestion: 0, times: ["9:16:10","9:18:24"]};
function createConflictEvents(){
	conflictEvents.push(conflictEvent1);
	conflictEvents.push(conflictEvent2);
	conflictEvents.push(conflictEvent3);
}

var tboSuggestions = new Array();



function pollConflictEvents(){
	for (e = 0; e < conflictEvents.length; e++){
		var etime = new Date();
		etime = setTimeFromString(etime, conflictEvents[e].time);
		if ( simTime.getTime() >= etime.getTime()){
			setUpInteractionVectors(conflictEvents[e]);
			popupInteractionDetails.push({flightid : getFlightId(conflictEvents[e].ac1),
															  ac1: getFlightId(conflictEvents[e].ac1), 
															  ac2: getFlightId(conflictEvents[e].ac2), 
															  distance: 1.8,
															  suggestion: conflictEvents[e].suggestion,
															  time: conflictEvents[e].times[0]});
			popupInteractionDetails.push({flightid : getFlightId(conflictEvents[e].ac1),
															  ac1: getFlightId(conflictEvents[e].ac1), 
															  ac2: getFlightId(conflictEvents[e].ac3), 
															  distance: 1.3,
															  suggestion: conflictEvents[e].suggestion,
															  time: conflictEvents[e].times[1] });


			populatePopup(true);
			conflictEvents.shift();
		}
	}	
}

function setUpInteractionVectors(event){	
	interactionVectors.push([getFlightId(event.ac1), getFlightId(event.ac2)]);
	interactionVectors.push([getFlightId(event.ac1), getFlightId(event.ac3)]);
}

var popupInteractionDetails = new Array();
var popupInteractionTable;

// Populate the conflict window popup with interaction details
function populatePopup(force){
if (popupInteractionDetails.length >= 1 || force == true)
{
	if (conflictPopup.style.display=='none'){
			
		if (popupInteractionDetails.length >= 1){
			const l1 = document.getElementById('conflictdata');
			// remove table data
			if (l1 !== null){
				document.getElementById('conflictsTable').remove();
				l1.remove();
				document.getElementById('actionsTable').remove();
			}
			let mainProtagonist = flights[popupInteractionDetails[0].ac1].callsign;
			let label = document.createElement('label');
			label.id = "conflictdata";
   			label.setAttribute('class','popupTextStyle');
			label.innerHTML = mainProtagonist + " interacting with:";
			conflictPopup.appendChild(label);

			popupInteractionTable= document.createElement('table');
			popupInteractionTable.id = "conflictsTable";
			//popupInteractionTable.style.height = conflictPopup.style.height;
			for (let i = 0; i < popupInteractionDetails.length; i++)
			{
				let interaction = popupInteractionDetails[i];
				let interactionRow = document.createElement('tr');
				let callsignCell = document.createElement('td');
				callsignCell.innerHTML = flights[interaction.ac2].callsign;
				let timeCell = document.createElement('td');
				timeCell.innerHTML = interaction.time;
				let distanceCell = document.createElement('td');
				distanceCell.innerHTML = interaction.distance;
				
				interactionRow.appendChild(callsignCell);
				interactionRow.appendChild(timeCell);
				interactionRow.appendChild(distanceCell);
				popupInteractionTable.appendChild(interactionRow );	
			}
						

			let suggestedRow = document.createElement('tr');						
			let suggestedCell = document.createElement('td');
			suggestedCell.colSpan = 3;
   			suggestedCell.setAttribute('class','popupTextStyle');
			suggestedCell.innerHTML = "Suggested action: ";
			suggestedRow.appendChild(suggestedCell);
			popupInteractionTable.appendChild(suggestedRow);
			conflictPopup.appendChild(popupInteractionTable);
			
			let actionsTable = document.createElement('table');
			actionsTable.id = "actionsTable";
			let actionRow = document.createElement('tr');							
			let action1 = document.createElement('td');	
			enterbut = document.createElement('button');
		    enterCell = document.createElement('td');
		    enterbut.textContent = "Accept";
		    enterbut.style.color='green';
		    enterbut.id = "enter1";
		    enterbut.disabled = true;
		    previewbut = document.createElement('button');
		    previewCell = document.createElement('td');
		    previewbut.textContent = "Preview";
		    previewbut.style.color='orange';
		    previewbut.id = "preview1";
		    previewbut.disabled = false;
			
			// randomise whether its a heading or speed suggestion
			let x = getRandomNumber(2,3);
			let hd = getRandomNumber(5,15);
			let sd = getRandomNumber(10,40);
			let ld = getRandomNumber(1,2)*10;
			let suggestedHeading = 0;
			let suggestedSpeed = 0;
			let suggestedLevel = 250;
			let flightid = popupInteractionDetails[0].flightid;
			action1.innerHTML = "No suggested action";
			let numActions = 1;

			if (popupInteractionDetails.length > 0){
				let suggestion = popupInteractionDetails[0].suggestion;
				if (popupInteractionDetails > 1){
					let suggestion = popupInteractionDetails[1].suggestion;
				}
				// Prepped conflict events have specific suggestions, whereas auto conflict detections are randomised.
				if (suggestion == 0){
					if (mode.startsWith("UC1")){
						suggestion = 4;
						numActions = 3;
					}
					else {
						suggestion = x;
					}
				}
				if (suggestion  == 2){						
					suggestedHeading = +trackPositions[popupInteractionDetails[0].flightid].bearing.toFixed()+Number(sd);			
					action1.innerHTML = "Change heading to "+suggestedHeading;
					previewbut.onclick = function() {						
						HookFlight(flightid);
						removeProbeEvent();
						document.getElementById('heading-input').value = suggestedHeading;
						headingChanged();
						enterbut.disabled = false;
					};
					enterbut.onclick = function() {												
						enterClearance();
						closeConflictPopup();
				    };
				}else if (suggestion  == 1){
					suggestedSpeed = +trackPositions[popupInteractionDetails[0].flightid].speed.toFixed()+Number(sd);			
					action1.innerHTML = "Change speed to "+suggestedSpeed;
					previewbut.onclick = function() {						
						HookFlight(flightid);
						removeProbeEvent();
						document.getElementById('speed-input').value = suggestedSpeed;
						SpeedChanged(); 
						enterbut.disabled = false; 			 			
				    };
				    enterbut.onclick = function() {												
						enterClearance();
						closeConflictPopup();
				    };				    
				}else if (suggestion  ==3){
					//suggestedLevel = +trackPositions[popupInteractionDetails[0].flightid].level.toFixed()+Number(ld);
					action1.innerHTML = "Change level to "+suggestedLevel;
					previewbut.onclick = function() {						
						HookFlight(flightid);
						removeProbeEvent();
						selectedClearanceIssueTime = 1;
						selectedClearanceTime = 10;
						selectedClearanceLevel =suggestedLevel;
						levelClearanceProbeChanged(); 
						enterbut.disabled = false; 			 			
				    };
				    enterbut.onclick = function() {												
						enterClearance();
						closeConflictPopup();
				    };
				 }
				 else if (suggestion == 4){
					 const enterButtons = [];
					 const previewButtons = [];
					 
					 let action1Row = document.createElement('tr');							
					 let action1Text = document.createElement('td');	
					 suggestedLevel = trackPositions[popupInteractionDetails[0].flightid].level+10;
					 action1Text.innerHTML = "Change level to "+suggestedLevel;
					 enterbut = document.createElement('button');
					 enterCell = document.createElement('td');
					 enterbut.textContent = "Accept";
					 enterbut.style.color='green';
					 enterbut.id = "enter1";
					 enterbut.disabled = true;
					 enterbut.onclick = function() {												
						enterClearance();
						closeConflictPopup();
				     };
					 enterButtons.push(enterbut);
					 
					 previewbut = document.createElement('button');
					 previewCell = document.createElement('td');
					 previewbut.textContent = "Preview";
					 previewbut.style.color='orange';
					 previewbut.id = "preview1";
					 previewbut.disabled = false;
					 previewButtons.push(previewbut);
					 					 
					 previewbut.onclick = function() {						
						HookFlight(flightid);
						removeProbeEvent();
						selectedClearanceIssueTime = 1;
						selectedClearanceTime = 5;
						selectedClearanceLevel =suggestedLevel;
						levelClearanceProbeChanged(); 
						enterbut.disabled = false; 			 			
				    };
					action1Text.colSpan = 2;
					action1Row.appendChild(action1Text);
					previewButtonCell = document.createElement('td');
					previewButtonCell.appendChild(previewbut);
					action1Row.appendChild(previewButtonCell);
					enterButtonCell = document.createElement('td');
					enterButtonCell.appendChild(enterbut);
					action1Row.appendChild(enterButtonCell);
					actionsTable.appendChild(action1Row);					
					
					// Suggestion 2
					let action2Row = document.createElement('tr');							
					let action2Text = document.createElement('td');
					
					action2Text.innerHTML = "Change Heading to "+suggestedLevel;
					 enterbut2 = document.createElement('button');
					 enterCell2 = document.createElement('td');
					 enterbut2.textContent = "Accept";
					 enterbut2.style.color='green';
					 enterbut2.id = "enter2";
					 enterbut2.disabled = true;
					 enterbut2.onclick = function() {												
						enterClearance();
						closeConflictPopup();
				     };
					 enterButtons.push(enterbut2);
				     suggestedHeading = +trackPositions[popupInteractionDetails[0].flightid].bearing.toFixed()+Number(sd);			
					 action2Text.innerHTML = "Change heading to "+suggestedHeading;
					 previewbut2 = document.createElement('button');
					 previewCel2 = document.createElement('td');
					 previewbut2.textContent = "Preview";
					 previewbut2.style.color='orange';
					 previewbut2.id = "preview2";
					 previewbut2.disabled = false;
					 previewButtons.push(previewbut2);
					 previewbut2.onclick = function() {						
						HookFlight(flightid);
						removeProbeEvent();
						document.getElementById('heading-input').value = suggestedHeading;
						headingChanged();
						enterbut2.disabled = false;
					 };					 				
					 action2Text.colSpan = 2;
					action2Row.appendChild(action2Text);
					previewButtonCell2 = document.createElement('td');
					previewButtonCell2.appendChild(previewbut2);
					action2Row.appendChild(previewButtonCell2);
					enterButtonCell2 = document.createElement('td');
					enterButtonCell2.appendChild(enterbut2);
					action2Row.appendChild(enterButtonCell2);
					actionsTable.appendChild(action2Row);	
					
					// Suggestion 3
					let action3Row = document.createElement('tr');							
					let action3Text = document.createElement('td');
					action3Text.innerHTML = "Change Heading to "+suggestedLevel;
					 enterbut3 = document.createElement('button');
					 enterCell3 = document.createElement('td');
					 enterbut3.textContent = "Accept";
					 enterbut3.style.color='green';
					 enterbut3.id = "enter3";
					 enterbut3.disabled = true;
					 enterbut3.onclick = function() {												
						enterClearance();
						closeConflictPopup();
				     };
					 enterButtons.push(enterbut3);
				     suggestedHeading = +trackPositions[popupInteractionDetails[0].flightid].bearing.toFixed()+Number(sd);			
					 action3Text.innerHTML = "Change heading to "+suggestedHeading;
					 previewbut3 = document.createElement('button');
					 previewCel3 = document.createElement('td');
					 previewbut3.textContent = "Preview";
					 previewbut3.style.color='orange';
					 previewbut3.id = "preview3";
					 previewbut3.disabled = false;
					 previewButtons.push(previewbut3);
					 previewbut3.onclick = function() {						
						HookFlight(flightid);
						removeProbeEvent();
						document.getElementById('heading-input').value = suggestedHeading;
						headingChanged();
						enterbut3.disabled = false;
					 };					 				
					 action3Text.colSpan = 2;
					action3Row.appendChild(action3Text);
					previewButtonCell3 = document.createElement('td');
					previewButtonCell3.appendChild(previewbut3);
					action3Row.appendChild(previewButtonCell3);
					enterButtonCell3 = document.createElement('td');
					enterButtonCell3.appendChild(enterbut3);
					action3Row.appendChild(enterButtonCell3);
					actionsTable.appendChild(action3Row);	
					

					// Suggestion 4
					let action4Row = document.createElement('tr');							
					let action4Text = document.createElement('td');
					action4Text.innerHTML = "Change ROCD to "+suggestedLevel;
					 enterbut4 = document.createElement('button');
					 enterCell4 = document.createElement('td');
					 enterbut4.textContent = "Accept";
					 enterbut4.style.color='green';
					 enterbut4.id = "enter4";
					 enterbut4.disabled = true;
					 enterbut4.onclick = function() {												
						enterClearance();
						closeConflictPopup();
				     };
					 enterButtons.push(enterbut4);
					 let trackCurrentLevel = trackPositions[popupInteractionDetails[0].flightid].level;
					 let hypotheticalNextLevel = trackCurrentLevel+20;
					 var itime = new Date();
					 itime = setTimeFromString(itime, popupInteractionDetails[0].time);
					 let simTimeMS = simTime.getTime();
					 let interactionTimeMS = itime.getTime();
														
					 let timeDiffMs = interactionTimeMS-simTimeMS;
					 let timeDiffMins = timeDiffMs/(1000*60);
   					 currentROCD = Math.round((hypotheticalNextLevel*100-trackCurrentLevel*100)/(timeDiffMins));

					 action4Text.innerHTML = "Change ROCD to "+currentROCD;
					 previewbut4 = document.createElement('button');
					 previewCel4 = document.createElement('td');
					 previewbut4.textContent = "Preview";
					 previewbut4.style.color='orange';
					 previewbut4.id = "preview4";
					 previewbut4.disabled = false;
					 previewButtons.push(previewbut4);
					 previewbut4.onclick = function() {						
						HookFlight(flightid);
						removeProbeEvent();
						selectedClearanceIssueTime = 1;
						selectedClearanceTime = timeDiffMins;
						selectedClearanceLevel = hypotheticalNextLevel;
						levelClearanceProbeChanged(); 
						enterbut4.disabled = false;
					 };					 				
					 action4Text.colSpan = 2;
					action4Row.appendChild(action4Text);
					previewButtonCell4 = document.createElement('td');
					previewButtonCell4.appendChild(previewbut4);
					action4Row.appendChild(previewButtonCell4);
					enterButtonCell4 = document.createElement('td');
					enterButtonCell4.appendChild(enterbut4);
					action4Row.appendChild(enterButtonCell4);
					actionsTable.appendChild(action4Row);	


					
					 
					conflictPopup.appendChild(actionsTable);	

					
					
				 }

			}
			if (numActions == 1){
				action1.colSpan = 3;	
				actionRow.appendChild(action1);
				actionsTable.appendChild(actionRow);							
			
				let buttonRow = document.createElement('tr');									    
				previewCell.appendChild(previewbut);
				buttonRow.appendChild(previewCell);
				enterCell.appendChild(enterbut);
				buttonRow.appendChild(enterCell);   			
				actionsTable.appendChild(buttonRow);
				conflictPopup.appendChild(actionsTable);	
			}

		}
	
		conflictPopup.style.display='inline';
	}
}
}
// Should be called regularly as the canvas 
// 
function showInteractionVectors() {
	 
 	 popupInteractionDetails = [];

	 for (let v = 0; v < interactionVectors.length; v++){
		for (let a = 0; a < interactionVectors[v].length; a++){
			let flightid = interactionVectors[v][a]; 
			let colour = 'white';
			if (a == 0){
				colour = 'red';				
			}
			var p1 = mapPointToRadarCanvas(radarCanvas, trackPositions[flightid].coords.lat, trackPositions[flightid].coords.lng);								
				
			// Show highlight around TDB is appropriate colour
			if (p1.x > 0 && p1.y > 0 && p1.x < radarCanvas.width && p1.y < radarCanvas.height){    					    		
				rctx.beginPath();
	 			//rctx.setLineDash([]);
	 			//rctx.strokeStyle = colour;
	      	  //rctx.lineWidth = 2;
	      	  //rctx.strokeRect(p1.x , p1.y-11, tdbWidth+1, tdbHeight)
	    	
			
				const tdbAngleRadians = (90 * Math.PI) / 180;
				let tdbCentreX = p1.x+(80*Math.sin(tdbAngleRadians ));
				let tdbCentreY = p1.y-(80*Math.cos(tdbAngleRadians ));
				let tdbX = tdbCentreX-(tdbWidth/2);
				let tdbY = tdbCentreY-(tdbHeight/2);	    			
    			

				// Optionally, you can also draw a rectangle outline
				rctx.setLineDash([]);
				rctx.strokeStyle = colour;
				rctx.lineWidth = 2;
				rctx.strokeRect(tdbX,tdbY, tdbWidth+1, tdbHeight)
			}	
       		rctx.beginPath();
       		rctx.setLineDash([4, 1]); // Create a dotted line pattern
   			var p0 = mapPointToRadarCanvas(radarCanvas, trajectories[flightid][0].coords.lat, trajectories[flightid][0].coords.lng);
       		rctx.moveTo(p0.x, p0.y);
       		for (let p = 0; p < trajectories[flightid ].length; p++)
       		{
       			var p1 = mapPointToRadarCanvas(radarCanvas, trajectories[flightid][p].coords.lat, trajectories[flightid][p].coords.lng);
       			rctx.lineTo(p1.x, p1.y);
				rctx.lineWidth=1;		
    	    	rctx.strokeStyle = colour;
       			rctx.stroke();
       			rctx.stroke();					
       		}
			
    	
   		} 
   		for (let c=0; c < closestPoints.length; c++)
   			{
   				// slightly roundabout way to filter out the closest point relevant to this interaction vector
   				if (closestPoints[c].flight1 == interactionVectors[v][0] && 
   		    		closestPoints[c].flight2 == interactionVectors[v][1])
   				{
   					var point2 = mapPointToRadarCanvas(radarCanvas,closestPoints[c].p2[1],closestPoints[c].p2[0]);
   					var point1 = mapPointToRadarCanvas(radarCanvas,closestPoints[c].p1[1],closestPoints[c].p1[0]);
   				   				
	   				let f1 = flightLevelAtTime(closestPoints[c].flight2, closestPoints[c].p2[3]);
	   				let f2 = flightLevelAtTime(closestPoints[c].flight1, closestPoints[c].p2[3]);
					var distanceNm = haversineDistance(closestPoints[c].p1[1],closestPoints[c].p1[0],closestPoints[c].p2[1],closestPoints[c].p2[0]);

					if (simTime.getTime() < closestPoints[c].p1[3])
					{
   						if (distanceNm > 0.01 && distanceNm < 5){
							color="yellow";
   							if ((Math.abs(f1-f2) < 20) && distanceNm < 3 ){
								var color = "red";
								drawInteractionSymbol(rctx,point2.x,point2.y,closestPoints[c].flight2,color);
								bInteractionFound=true;
								popupInteractionDetails.push({flightid : closestPoints[c].flight1,
															  ac1: closestPoints[c].flight1, 
															  ac2: closestPoints[c].flight2, 
															  distance: distanceNm.toFixed(2),
															  suggestion: 0,
															  time: new Date(closestPoints[c].p2[3]).toLocaleTimeString() });
								}					   				
   						}
   					}
   		 		}									
			} 
 	}
 
 	// Show and populate the conflict window
 	populatePopup(false);
}

function AutoDetectionChanged(){
	bAutoConflictDetection= document.getElementById("auto").checked;
}

const conflictPopup = document.createElement('div');
	conflictPopup.style.width = '300px';
    conflictPopup.style.height = '350px';
    conflictPopup.style.position = 'absolute';
    conflictPopup.style.top = '100px';
    conflictPopup.style.left = '500px';
    conflictPopup.style.border = '2px solid #333';
    conflictPopup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    conflictPopup.style.zIndex = 1010;
    conflictPopup.id='cf';
   	conflictPopup.setAttribute('class','movableDiv');

    document.body.appendChild(conflictPopup);
    
 // Create the title bar div
    const conflictPopupTitlebar = document.createElement('div');
    conflictPopupTitlebar.style.height = '30px';
    conflictPopupTitlebar.style.padding = '5px';
    conflictPopupTitlebar.style.cursor = 'grab';
    conflictPopupTitlebar.style.display = 'flex';
    conflictPopupTitlebar.style.alignItems = 'center';
    conflictPopupTitlebar.style.justifyContent = 'space-between';
    conflictPopupTitlebar.innerHTML = 'CONFLICT RESOLUTION REQUEST';
    conflictPopupTitlebar.style.zIndex = 1010;
    conflictPopupTitlebarid = 'cfHeader';
	conflictPopupTitlebar.setAttribute('class','movableDivHeader');

    conflictPopup.appendChild(conflictPopupTitlebar);
    
    let closeBut = document.createElement('button');
	closeBut.id = "cfcloseBut";
	closeBut.textContent = "X";
	closeBut.onclick = function(){
		closeConflictPopup();
	};
	conflictPopupTitlebar.appendChild(closeBut);

     // Dragging functionality
    let isDraggingCf = false;
    let CfoffsetX, CfoffsetY;

    conflictPopupTitlebar.addEventListener('mousedown', (e) => {
        isDraggingCf = true;
        CfoffsetX = e.clientX - conflictPopup.offsetLeft;
        CfoffsetY = e.clientY - conflictPopup.offsetTop;
        conflictPopupTitlebar.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDraggingCf) {
            conflictPopup.style.left = `${e.clientX - CfoffsetX}px`;
            conflictPopup.style.top = `${e.clientY - CfoffsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingCf = false;
        conflictPopupTitlebar.style.cursor = 'grab';
    });
    // Hide the conflict popup
   	conflictPopup.style.display='none';

function closeConflictPopup(){
	document.getElementById('cf').style.display='none';
	removeProbeEvent();
	interactionVectors = [];
	popupInteractionDetails = [];

}


