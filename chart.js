$(document).ready(function() {
	
	//hide latex until it's done being processed
	UserInterface.hideLatex();
	
	//initialize the state to the first question
	QuizLogic.getChoices();
	QuizLogic.pickAnswer();
	
	//write out the first problem
	UserInterface.drawChart();
	UserInterface.writeChoices();
	UserInterface.writeAnswer();
		
	//Tell MathJax to make the answer visible when as soon
	//as the LaTeX is done being processed
	MathJax.Hub.Queue(UserInterface.showLatex);
	
});

var MainInterface = {
		newQuestion: function() {
			
			UserInterface.clearButtons();
			QuizLogic.getChoices();
			QuizLogic.pickAnswer();
			
			UserInterface.drawChart();
			UserInterface.writeChoices();
			UserInterface.writeAnswer();
			UserInterface.refreshLatex();
		},

		guess: function(guessIndex) {
			QuizState.phase = 'a';
			if(guessIndex === QuizState.ansIndex) {
				
			}
			else {
				
			}
		}
}

var Settings = {
		rightColor: '#00FF00',
		wrongColor: '#FF0000',
		
		min: -10,
		max: 10,
		delta: 0.1
}

var QuizState = {
		//either 'q' for question or 'a' for answer
		phase: 'q',
		//array of possible answers
		choices: [null, null, null, null],
		//index of right answer
		ansIndex: null,
		//jqplot object for the chart
		chartRef: null,
		//return the answer object 
		getAnswer: function() {
			return this.choices[this.ansIndex]
		}

}

var QuizLogic = {
		//updates QuizState for start of a new question
		
		//pick four random functions
		getChoices: function(){
			
			//store all the own property values of MathFunctions 
			//in funcValues
			var funcNames = Object.keys(MathFunctions);
			var currValue, funcValues = [];
			for(var i=0; i<funcNames.length; i++) {
				currValue = MathFunctions[funcNames[i]];
				//push only if this isn't the same answer as
				//the last question
				if (currValue !== QuizState.getAnswer())
					funcValues.push(currValue);
			}
			QuizState.choices = Utils.shuffleArray(funcValues, 4); 
		},
		
		//pick one of the choices to be defined as the right answer
		pickAnswer: function() {
			QuizState.ansIndex = Utils.randNum(QuizState.choices.length);
		}
		
		
}

var MathFunctions = {
		
	identity: {
		fn: function(x) {return x;},
		str: 'x',
		latex: 'f(x)=x'
	},
	
	square: {
		fn: function(x) {return x*x;},
		str: 'x^2',
		latex: 'f(x)=x^2'
	},
	
	cube: {
		fn: function(x) {return x*x*x;},
		str: 'x^3',
		latex: 'f(x)=x^3'
	},
	
	oneOverX: {
		fn: function(x) {return 1/x;},
		str: '1/x',
		latex: 'f(x)=\\frac{1}{x}'
	},
	
	sqrt: {
		fn: function(x) {return Math.sqrt(x);},
		str: 'sqrt(x)',
		latex: '\\sqrt{x}'
	}

}

var Utils = {

		//random number from 0 to n-1
		randNum: function(n) {
			return Math.random() * n << 0;
		},
		
		//shuffle an array using the Fisher-Yates algorithm,
		//and then return the first n elements
		shuffleArray: function(array, n) {
			for(var i=array.length-1; i >= 0; i--) {
				var j = this.randNum(i);
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
			return array.slice(0,n);
		},
		
		// pick a random property of an object
		getRandProp: function(obj) {
			var propNames = Object.keys(obj);
			var propIndex = this.randNum(propNames.length);
			return obj[propNames[propIndex]];
		}
}



var UserInterface = {

	drawChart: function() {
		//get the function that will be the right answer
		var qs = QuizState,
			s = Settings,
			funcToDraw = qs.choices[qs.ansIndex];
		QuizState.chartRef = this.plot([funcToDraw], s.min, s.max, s.delta);
		
	},
	
	writeChoices: function() {
		$('.choice').text(function(index, text){
			return "$$" + QuizState.choices[index].latex + "$$";
		});
	},
	
	writeAnswer: function(){
		$('#answer').text("$$" + QuizState.getAnswer().latex + "$$");
	},
	
	showLatex: function() {
		$('.latex').fadeIn(500);
	},
	
	hideLatex: function() {
		$('.latex').hide();
	},
	
	refreshLatex: function() {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
		console.log('ahh refreshing');
	},
	
	correctAns: function() {
		//turn function green
		var chart = QuizState.chartRef;
		chart.replot({seriesColors: [Settings.rightColor]});
	
		//turn button green
		$('.choice').eq(QuizState.ansIndex)
					.css('background-color', Settings.rightColor);
	},
	
	wrongAns: function(index) {
		
		var s = Settings,
			rightPoints
			wrongFunc = QuizState.choices[index];

		//plot right answer and wrong answer on same graph
		QuizState.chartRef = this.plot(
				[QuizState.getAnswer(), wrongFunc],
				-10, 10, 0.1
		)
		//color the functions to make right/wrong clearer
		QuizState.chartRef.replot({seriesColors: [Settings.rightColor, Settings.wrongColor]});
	
		//color the buttons to make right/wrong clear
		$('.choice').eq(QuizState.ansIndex)
					.css('background-color', Settings.rightColor);
		$('.choice').eq(index)
					.css('background-color', Settings.wrongColor);
		
	},
	
	clearButtons: function(index) {
		$('.choice').css('background-color', '#FFFFFF')
	},
	
	generatePoints: function(mathFunc) {
		var s = Settings,
			points = [],
			fn = mathFunc.fn;
		
		for(var x=s.min; x<s.max; x+=s.delta) {
			var fOfX = fn(x);
			// replace absurd and off the chart numbers
			var tooFar = 10 * s.max;
			if(fOfX > tooFar)
				points.push([x, tooFar]);
			else if(fOfX < -tooFar)
				points.push([x, -tooFar]);
			else
				points.push([x, fn(x)]);
		}
		// push f(max) , even if not equal to min + a multiple of delta
		points.push([x, fn(s.max)]);
		
		return points;
	},
	
	// plot a function by applying fOfX to points
	// from min to max, using delta as interval
	//
	// returns a chart
	plot: function(mathFuncs, min, max, delta){		
		
		var points, pointsArray = [];
		for(var i=0; i<mathFuncs.length; i++) {
			points = this.generatePoints(mathFuncs[i]);
			pointsArray.push(points);
		}
		

		// populate array of tickmarks at integers
		var tickmarks = [];
		for (x=min; x<max; x+=2) {
			tickmarks.push(x);
		}
		// push max , even if not equal to min + a multiple of delta
		tickmarks.push(max);
		
		// draw graph
		var chart = $.jqplot('chart', pointsArray, {
			// don't show discreteness of points
			seriesDefaults:{
				lineWidth: 4,
				showMarker:false},
			// both axes contain the same range and tickmarks
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
			
			// draw dashed lines for x=0, y=0
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
		return chart;
	},

}


	
	

