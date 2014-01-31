$(document).ready(function() {
	var m = MathFunctions,
		ut = Utils,
		ui = UserInterface;
	var mathFunc = ut.getRandProp(MathFunctions);
	var points = ui.plot(mathFunc.fn,-10,10,0.1);
	$('body').append('<h1>'+mathFunc.str+'</h1>');
});

var MathFunctions = {
		
		//Base Functions://
		
		//y = f(x)
		identity: {
			fn: function(x) {return x;},
			str: 'x'
		},
		
		square: {
			fn: function(x) {return x*x;},
			str: 'x^2'
		},
		
		cube: {
			fn: function(x) {return x*x*x;},
			str: 'x^3'
		},
		
		oneOverX: {
			fn: function(x) {return 1/x;},
			str: '1/x'
		}
	
//		//generate adecorator for mathFunc based on a random multiple
//		genRandomFunc: function(mathFunc, maxMultiple) {
//			multiple = Utils.randNonzero(10,true);
//			return function(x){
//				return multiple * mathFunc(x);
//			}
//		}
}

var Utils = {

		// pick a random property of an object
		getRandProp: function(obj) {
			var propNames = Object.keys(obj);
			var propIndex = Math.random() * propNames.length << 0;
			return obj[propNames[propIndex]];
		}
		
//		randNonzero: function(max, allowNegative){
//			//integers from 1 to max inclusive
//			var value = Math.floor(Math.random()*(max-1)) + 1;
//			//no need to generate sign
//			if(!allowNegative) 
//				return value;
//			sign = Math.random();
//			//generate sign
//			if(sign > 0.5)
//				return value;
//			else
//				return -value;
//		}
}



var UserInterface = {
		//plot a function by applying fOfX to points
		//  from min to max, using delta as interval
		
		plot: function(mathFunc, min, max, delta){

			//populate array of discrete points to plot
			var points = [];
			for(var x=min; x<max; x+=delta) {
				var fOfX = mathFunc(x);
				//replace absurd off the chart numbers
				if(fOfX > 100)
					points.push([x, 100]);
				else if(fOfX < -100)
					points.push([x, -100]);
				else
					points.push([x, mathFunc(x)]);
			}
			//push f(max) , even if not equal to min + a multiple of delta
			points.push([x, mathFunc(max)]);
			
			//populate array of tickmarks at integers
			var tickmarks = [];
			for (x=min; x<max; x++) {
				tickmarks.push(x);
			}
			//push max , even if not equal to min + a multiple of delta
			tickmarks.push(max);
			
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
			return points;
		}
}

	
	

