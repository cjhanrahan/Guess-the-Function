$(document).ready(function() {
	
//	
//	$.jqplot('chartdiv', [[[1,2,3], [3.5, 12]]]);
	
	
	plot(function(x){return 2*x;},-10,10,1);
	
});
	
//plot a function by applying fOfX to points
//  from min to max, using delta as interval
function plot(mathFunc, min, max, delta){

	//populate array of discrete points to plot
	var points = [];
	for(var x=min; x<max; x+=delta) {
		points.push([x, mathFunc(x)]);
	}
	//push f(max) , even if not equal to min + a multiple of delta
	points.push([x, mathFunc(max)]);
	
	//populate array of tickmarks at integers
	var tickmarks = [];
	for (x=min; x<max; x++) {
		tickmarks.push(x);
	}
	
	//draw graph
	$.jqplot('chartdiv', [points], {
		//don't show discreteness of points
		series:[{showMarker:false}],
		//both axes contain the same range and tickmarks
		axesDefaults: {
			min: min,
			max: max,
			ticks: tickmarks
		},
		axes: {
			xaxis: {
				label: 'x'
			},
			yaxis: {
				label: 'f(x)'
			}
		},
		//limit axes to [min, max]
		
		//draw dashed lines for x=0, y=0
		canvasOverlay: {
			show: true,
			objects: [
		          // draws x = 0
		          {dashedHorizontalLine: {
		        	  name: 'xAxisLine',
		        	  y: 0,
		        	  lineWidth: 3,
		        	  color: 'rgb(80,80,80)',
		        	  shadow: false
		          }},
		          // draws y = 0
		          {dashedVerticalLine: {
		        	  name: 'yAxisLine',
		        	  x: 0,
		        	  lineWidth: 3,
		        	  color: 'rgb(80,80,80)',
	        		  shadow: false
		          }}
	          ]
		}
	});
	
}
	
	

