$(document).ready(function() {
	
//	
//	$.jqplot('chartdiv', [[[1,2,3], [3.5, 12]]]);
	
	
	
	
	//plot a function by applying fOfX to points
	//  from minX to maxX, using delta as interval
	function plot(fOfX, minX, maxX, delta){
	
		//array of discrete points to plot
		points = [];
		
		//populate points
		for(var i=minX; i<maxX; i+=delta) {
			points.push([i, fOfX(i)]);
		}
	
	  var grid = {
		        gridLineWidth: 1.5,
		        gridLineColor: 'rgb(235,235,235)',
		        drawGridlines: false
		    };
		
		//draw graph
		$.jqplot('chartdiv', [points], {
			//draw vertical lines for x=0, y=0
			canvasOverlay: {
				show: true,
				grid: grid,
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
	
	plot(function(x){return 2*x;},-1,1,0.1);
	
});
