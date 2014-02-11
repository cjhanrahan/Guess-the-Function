var GF = {}



GF.MainInterface = {
		
		setUpQuiz: function() {
			//hide latex until it's done being processed
			GF.UserInterface.hideLatex();
			
			//initialize the state to the first question
			GF.QuizLogic.getChoices();
			GF.QuizLogic.pickAnswer();
			
			//write out the first problem
			GF.UserInterface.drawChart();
			GF.UserInterface.writeChoices();
			GF.UserInterface.writeQuesDialog();
			
			GF.bindUIEvents();
			//Tell MathJax to make the answer visible when as soon
			//as the LaTeX is done being processed
			MathJax.Hub.Queue(GF.UserInterface.showLatex);
		},
		
		newQuestion: function() {
			GF.QuizState.phase = 'question';
			GF.UserInterface.clearButtons();
			GF.QuizLogic.getChoices();
			GF.QuizLogic.pickAnswer();
			
			GF.UserInterface.drawChart();
			GF.UserInterface.writeChoices();
			GF.UserInterface.writeQuesDialog();
			GF.UserInterface.refreshLatex();
			GF.bindUIEvents();
		},

		
		guess: function(guessIndex) {
			GF.QuizLogic.guess(guessIndex);
		}
}




GF.Settings = {
		rightColor: '#00DD00',
		wrongColor: '#FF0000',
		
		min: -10,
		max: 10,
		delta: 0.1
}

GF.QuizState = {
		//either 'question' or 'answer'
		phase: 'question',
		//array of possible answers
		choices: [null, null, null, null],
		//index of right answer
		ansIndex: null,
		//jqplot object for the chart
		chartRef: null,
		//return the answer object 
		getAnswer: function() {
			return this.choices[this.ansIndex]
		},
		indexPicked: null
		


}

GF.QuizLogic = {
		//updates QuizState for start of a new question
		
		//pick four random functions
		getChoices: function(){
			
			//store all the own property values of MathFunctions 
			//in funcValues
			var funcNames = Object.keys(GF.MathFunctions);
			var currValue, funcValues = [];
			for(var i=0; i<funcNames.length; i++) {
				currValue = GF.MathFunctions[funcNames[i]];
				//push only if this isn't the same answer as
				//the last question
				if (currValue !== GF.QuizState.getAnswer())
					funcValues.push(currValue);
			}
			GF.QuizState.choices = GF.Utils.shuffleArray(funcValues, 4); 
		},
		
		//pick one of the choices to be defined as the right answer
		pickAnswer: function() {
			GF.QuizState.ansIndex = GF.Utils.randNum(GF.QuizState.choices.length);
		},
		
		guess: function(index) {
			GF.QuizState.indexPicked = index;
			GF.QuizState.phase = 'answer';
		}
		
}

GF.bindUIEvents = function() {
	var u = GF.UserInterface;
	$('.choice').each(function(indexPicked){
		//trigger UI events for guess
		$(this).click(function(eventObj) {
			if(GF.QuizState.phase === 'question') {
				GF.QuizState.phase = 'answer';
				//show UI events specific to right or wrong
				GF.UserInterface.guess(indexPicked);
				//show next question button
				 $('#nextQuestion').click(GF.MainInterface.newQuestion);
						
			}
		})
	});
}

GF.MathFunctions = {
		
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
		latex: 'f(x)=\\sqrt{x}'
	},

	twoToTheX: {
		fn: function(x) {return Math.pow(2,x);},
		str: '2^x',
		latex: 'f(x)=2^x'
	},
	
	absoluteValue: {
		fn: function(x) {return Math.abs(x);},
		str: '|x|',
		latex: 'f(x)=\\mid x \\mid'
	},
	
	sin: {
		fn: function(x) {return Math.sin(x)},
		str: 'sin(x)',
		latex: 'f(x)=\\sin(x)'
	},
	
	cos: {
		fn: function(x) {return Math.cos(x)},
		str: 'cos(x)',
		latex: 'f(x)=\\cos(x)'
	},
	
	tan: {
		fn: function(x) {return Math.tan(x)},
		str: 'tan(x)',
		latex: 'f(x)=\\tan(x)'
	}
}

GF.Utils = {

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



GF.UserInterface = {

	drawChart: function() {
		//get the function that will be the right answer
		var qs = GF.QuizState,
			s = GF.Settings,
			funcToDraw = qs.choices[qs.ansIndex];
		GF.QuizState.chartRef = this.plot([funcToDraw], s.min, s.max, s.delta);
		
	},
	
	writeChoices: function() {
		//write down the latex equation
		$('.choice').each(function(indexPicked, choice){
			$(this).text("\\(" + GF.QuizState.choices[indexPicked].latex + "\\)");
		});
		
			
		
	},
	
	writeQuesDialog: function(){
		$('#dialog').html("Which function has been graphed?");
	},
	
	showLatex: function() {
		$('.latex').fadeIn(500);
	},
	
	hideLatex: function() {
		$('.latex').hide();
	},
	
	
	//tell MathJax to reparse LaTeX markup
	refreshLatex: function() {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	},
	
	guess: function(indexPicked) {
		var u = GF.UserInterface;
		//show UI events specific to right/wrong answers
		var isRight = (indexPicked === GF.QuizState.ansIndex);
		isRight ? u.correctAns() : u.wrongAns(indexPicked);
		
		//add a next question button
		$('<button/>', {
			type: 'button',
			id: 'nextQuestion'
		}).text('Next Question')
		  .appendTo('#dialog')
	},
	
	//what to display if the right answer is picked
	correctAns: function() {
		//turn function green
		var chart = GF.QuizState.chartRef;
		chart.replot({seriesColors: [GF.Settings.rightColor]});
	
		//turn button green
		$('.choice').eq(GF.QuizState.ansIndex)
					.css('background-color', GF.Settings.rightColor);
		
		//print right answer dialogue
		$('#dialog').html("Correct! The right answer is "
				+ "<span style=\"color:" + GF.Settings.rightColor + "\">" +
						"\\(" + GF.QuizState.getAnswer().latex + "\\)</span>");
		this.refreshLatex();
	},
	
	//what to display if the wrong answer is picked
	wrongAns: function(indexPicked) {
		
		var s = GF.Settings,
			rightPoints
			wrongFunc = GF.QuizState.choices[indexPicked];

		//plot right answer and wrong answer on same graph
		GF.QuizState.chartRef = this.plot(
				[GF.QuizState.getAnswer(), wrongFunc],
				-10, 10, 0.1
		)
		//color the functions to make right/wrong clearer
		GF.QuizState.chartRef.replot({seriesColors: [GF.Settings.rightColor, GF.Settings.wrongColor]});
	
		//color the buttons to make right/wrong clear
		$('.choice').eq(GF.QuizState.ansIndex)
					.css('background-color', GF.Settings.rightColor);
		$('.choice').eq(indexPicked)
					.css('background-color', GF.Settings.wrongColor);
		
		//print message informing user of the right and wrong answer
		$('#dialog').html(
				"Whoops. The right answer is " +
				"<span style=\"color:" + GF.Settings.rightColor + "\">" +
				"\\(" + GF.QuizState.getAnswer().latex + "\\)</span>" +
				" but you chose " + "<span style=\"color:" + GF.Settings.wrongColor + "\">" +
				"\\(" + wrongFunc.latex + "\\)</span>."	
		);
		this.refreshLatex();
		
	},
	
	clearButtons: function(index) {
		$('.choice').css('background-color', '#FFFFFF')
	},
	
	generatePoints: function(mathFunc) {
		var s = GF.Settings,
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


	
	

