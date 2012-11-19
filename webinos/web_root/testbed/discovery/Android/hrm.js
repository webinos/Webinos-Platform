$(document).ready(function() {
	_StopWatch = false;
	graphData = new Object();
	pulseSpan = document.getElementById('nmbrmainspan');
	speedSpan = document.getElementById('nmbr1span');
	distSpan = document.getElementById('nmbr2span');
	distUnit = document.getElementById('nmbr2p');
	distUnitChFlag = false;
	
	document.getElementById("loader").innerHTML = "";
	//tmp, something else will have to push data
	graphData.id = 0;
	pushGraphData = setInterval("generatePoints()", 1000);
	
	$('#timerstart').on("click", function(event){
		if(!_StopWatch) {
			_StopWatch = new StopWatch($('#h'), $('#m'), $('#s'), $('#ms'));
			_StopWatch.start();
			_Graph = new Graph(document.getElementById('canvas'));
			_Graph.start();
			//temp
			graphData.distance = 0;
			tmpupdate = setInterval('updateHTML()', 1000);
		} else {
			if (_StopWatch.isRunning()) {
				_StopWatch.stop();
				_Graph.stop();
				//tmp
				clearInterval(tmpupdate);
			} else {
				_StopWatch.start();
				_Graph.start();
				//tmp
				tmpupdate = setInterval('updateHTML()', 1000);
			}
		}
	});
});

//TEMP. (updateHTML() could be useful though)
function generatePoints() {
    if (typeof pulse != "undefined"){ //Temp hack to prevent event from causing exception on not loaded
	    graphData.id += 1;
	    var pulse = document.getElementById('nmbrmainspan');
	    graphData.pulse = pulse.innerHTML;
    }
};

function updateHTML() {
	var dist;
	//pulseSpan.innerHTML = graphData.pulse;
	//speedSpan.innerHTML = graphData.speed;
	if(graphData.distance > 1000) {
		dist = (Math.floor((graphData.distance/1000) * 100) / 100).toFixed(2);
		if(distUnitChFlag == false) {
			distUnit.innerHTML = 'km';
			distUnitChFlag = true;
		}
	} else {
		dist = graphData.distance;
	}
	distSpan.innerHTML = dist;
}
//END TEMP.

function pad(num, size) { /* adds leading zeros */
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function StopWatch(hour, tmin, sec, mssec){
// USAGE:
// _StopWatch = new StopWatch($('#h'), $('#m'), $('#s'), $('#ms'));
// _StopWatch.start();
	
	var _myTimer_ms = null;
	var running = false;

	this.updateMS = function() {
		var mscount = 1+parseInt(mssec.text(), 10);
		if(mscount == 10) {
			mscount = 0;
			var seccount = 1+parseInt(sec.text(), 10);
			if(seccount == 60) {
				seccount = 0;
				var mincount = 1+parseInt(tmin.text(), 10);
				if (mincount == 60) {
					mincount = 0;
					hour.text( pad((1+parseInt(hour.text(), 10)), 2) );
				}
				tmin.text( pad((mincount), 2) );
			}
			sec.text( pad((seccount), 2) );
		}
		mssec.text( pad((mscount), 1) );
	};
	
	this.isRunning = function() { return running; };

	this.start = function() {
		_myTimer_ms = setInterval("_StopWatch.updateMS()", 100);
		running = true;
	};

	this.stop = function() {
		clearInterval(_myTimer_ms);
		running = false;
	};
}

function Graph(canvasElement) {
	var ctx;
	//line setup
	var lineWidth = 2;
	var lineColor = '#fff';
	var lineGlow = "white";
	var lineGlowSize = 10;
	//data containers
	var pulsePoints = new Array();
	var speedPoints = new Array();
	var gatheredDataLength = 0;
	var lastPushId = null;
	//scroll/display related
	var scrollStep = 0;
	var maxScrollStep = 4;
	var firstVisiblePointNumber = null;
	var startingX = startingY = 0;
	var wasPaused = false;
	var drawWhat = 'pulse';
	//graph data constraints
	var maxPulse = 120;
	var minPulse = 60;
	var medPulse = 80;
	var maxSpeed = 12;
	var minSpeed = 0;
	
	if (!canvasElement || !canvasElement.getContext)
		return;
	
	//graph setup
	canvasElement.width = window.innerWidth;
	var maxVisiblePoints = Math.floor(canvasElement.width / maxScrollStep) +2; //this will eliminate later off-screen drawing
	document.getElementById('pulseMed').style.top = Math.floor((1-((medPulse-minPulse)/(maxPulse-minPulse))) * canvasElement.height)+'%'; //background med. line
	
	ctx = canvasElement.getContext("2d");
	
	//those 2 are not really needed
	this.element = function() { return canvasElement; };
	this.context = function() { return ctx; };

	this.start = function() {
		//scrollStep * interval time below should somehow add up to the expected data update time
		drawGraph = setInterval("_Graph.doGraph()", 250);
	};

	this.stop = function() {
		clearInterval(drawGraph);
		//push a line to the array
		gatheredDataLength = pulsePoints.push('STOP');
		speedPoints.push('STOP');
	};
	
	this.doGraph = function() {
		
		ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
		
		if(graphData.id == 0) { //still no points = no drawing
			return;
		}
		
		scrollStep += 1;
		if(scrollStep == maxScrollStep) {
			scrollStep = 0;
		}
		
		if(!lastPushId || lastPushId != graphData.id) { //if new point in graphData, then push it to the graph array
			lastPushId = graphData.id;
			scrollStep = 0; //a bit of a hack
			gatheredDataLength = pulsePoints.push(graphData.pulse);
			speedPoints.push(graphData.speed);
		}
		
		if(gatheredDataLength < 2) { //at least 2 points to draw a line
			return;
		}
		
		if(gatheredDataLength > maxVisiblePoints) { //determine the first point that could be visible on the graph;
			firstVisiblePointNumber = gatheredDataLength - maxVisiblePoints;
		} else {
			firstVisiblePointNumber = 0;
		}
		
		this.drawGraph();
	};
	
	this.drawGraph = function() {

		

		//if(firstVisiblePointNumber == 0) {
			startingX = canvasElement.width - (((gatheredDataLength-2) * maxScrollStep) + scrollStep); //-2 to add a delay
		//	console.log('sx:' + startingX);
		//	console.log('ppl:' + gatheredDataLength + ', step:' + scrollStep + ', f:' + (((gatheredDataLength-2) * maxScrollStep) + scrollStep));
		//} else {
		//	startingX = 0 - scrollStep;
		//	console.log('sx:' + startingX);
		//}
		startingY = this.setPointWithinGraphLimits(minPulse, maxPulse, pulsePoints[firstVisiblePointNumber]);
		
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = lineColor;
		
//		ctx.moveTo(startingX, startingY);
		
		//ctx.moveTo(-4,20); //coś po pauzie
//		console.log("fvn:" + firstVisiblePointNumber + ", ppl:" + gatheredDataLength + ", sx:" + startingX);
		for(var j = firstVisiblePointNumber; j < gatheredDataLength; j++) { //+1 to have the coordinates to 2nd visible point = end line point
//			console.log(j + " - fvn:" + firstVisiblePointNumber + ", ppl:" + gatheredDataLength + ", sx:" + startingX);
			//if(firstVisiblePointNumber == 0) {
			if(pulsePoints[j] == 'STOP') {
				ctx.stroke();
				ctx.save();
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.strokeStyle = "#00154C";
				ctx.shadowBlur = null;
				ctx.moveTo(startingX + (maxScrollStep * j), canvasElement.height);
				ctx.lineTo(startingX + (maxScrollStep * j), 0);
				ctx.stroke();
				ctx.restore();
				ctx.beginPath();
				wasPaused = true;
			} else {
				if(wasPaused == true) {
					ctx.moveTo(startingX + (maxScrollStep * j), this.setPointWithinGraphLimits(minPulse, maxPulse, pulsePoints[j]));
					wasPaused = false;
				}
				ctx.lineTo(startingX + (maxScrollStep * j), this.setPointWithinGraphLimits(minPulse, maxPulse, pulsePoints[j]));
			}
			//} else {
			//	ctx.lineTo(startingX + (maxScrollStep * (j-maxVisiblePoints)), this.setPointWithinGraphLimits(minPulse, maxPulse, pulsePoints[j]));
			//}
		}
		ctx.shadowColor=lineGlow;
		ctx.shadowBlur=lineGlowSize;
		ctx.stroke();
		//ctx.closePath();
	};
	
	this.setPointWithinGraphLimits = function(min, max, input) {
		return Math.floor((1-((input-min)/(max-min))) * canvasElement.height);
	};
}


