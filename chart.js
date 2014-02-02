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
		rightColor: '#00CC00',
		wrongColor: '#CC0000'
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
		var  qs = QuizState;
		var funcToDraw = qs.choices[qs.ansIndex];
		QuizState.chartRef = this.plot(funcToDraw, -10, 10, 0.1);
		
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
		//turn function graph green
		
		//draw wrong choice graph
	},
	
	clearButtons: function(index) {
		$('.choice').css('background-color', '#FFFFFF')
	},
	
	// plot a function by applying fOfX to points
	// from min to max, using delta as interval
	plot: function(mathFunc, min, max, delta){
		
		// populate array of discrete points to plot
		var points = [],
			fn = mathFunc.fn;
		for(var x=min; x<max; x+=delta) {
			var fOfX = fn(x);
			// replace absurd off the chart numbers
			if(fOfX > 100)
				points.push([x, 100]);
			else if(fOfX < -100)
				points.push([x, -100]);
			else
				points.push([x, fn(x)]);
		}
		// push f(max) , even if not equal to min + a multiple of delta
		points.push([x, fn(max)]);
		
		// populate array of tickmarks at integers
		var tickmarks = [];
		for (x=min; x<max; x+=2) {
			tickmarks.push(x);
		}
		// push max , even if not equal to min + a multiple of delta
		tickmarks.push(max);
		
		// draw graph
		var chart = $.jqplot('chart', [points], {
			// don't show discreteness of points
			series:[{showMarker:false}],
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


	
	

