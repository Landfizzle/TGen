//Change text of a DOM element
var update = function(name, toDisplay) {
	document.getElementById(name).innerHTML = toDisplay;
};

var enable = function(name) {
	document.getElementById(name).disabled = false;
};

var disable = function(name) {
	document.getElementById(name).disabled = true;
};

//On clicking the start button
var mouseClick = function() {
	
	//Turn off the button to prevent button mashing and prematurely incrementing sentenceListIndex
	disable("start");
	
	//If the list of abstracts from NYT has been exhausted
	if(theList.length > 0 && sentenceListIndex >= theList.length) {
		alert("End of list. Page will refresh");
		location.reload(true);
		return;	
	}  
	
	//If it is the first click, build theList of sentences
	else if(sentenceListIndex === 0) {
		getSentences();
	}  
	
	//If it is not the first click, and not the end of the list, just move on to the next eligible sentence
	else {
		clearScreen();
		findSentence(theList);
	}
	
};
		

var clearScreen = function() {
	
	//initialize variables
	findAnswerCalled = false;
	
	optionA=undefined;
	optionB=undefined;
	optionC=undefined;
	optionD=undefined;
	
	//Clear DOM
	update("stem", "&nbsp;");
	
	update("optionA", "(A)");
	update("optionB", "(B)");
	update("optionC", "(C)");
	update("optionD", "(D)");
	
	disable("optionA");
	disable("optionB");
	disable("optionC");
	disable("optionD");
	
	update("aResponse", "&nbsp;");
	update("bResponse", "&nbsp;");
	update("cResponse", "&nbsp;");
	update("dResponse", "&nbsp;");
	
};

//Put the options on the buttons and enable them
var printToScreen = function() {
				
		update("optionA", "(A) " + optionA);
		enable("optionA");
		
		update("optionB", "(B) " + optionB);
		enable("optionB");
		
		update("optionC", "(C) " + optionC);
		enable("optionC");
		
		update("optionD", "(D) " + optionD);
		enable("optionD");
};


//On clicking a button A-D, determine if the selection was correct or wrong
var checkAnswer = function(clicked) {
	
	//this object literal method replaced my original switch statement
	var buttons = {
		'A': function() {
			if(optionA===theAnswer.word) {
				update('aResponse', "Correct!");
				enable('start');
			}
			else {
				update('aResponse', "Wrong");
			}
		},
		'B': function() {
			if(optionB===theAnswer.word) {
				update('bResponse', "Correct!");
				enable('start');
			}
			else {
				update('bResponse', "Wrong");
			}
		},
		'C': function() {
			if(optionC===theAnswer.word) {
				update('cResponse', "Correct!");
				enable('start');
			}
			else {
				update('cResponse', "Wrong");
			}
		},
		'D': function() {
			if(optionD===theAnswer.word) {
				update('dResponse', "Correct!");
				enable('start');
			}
			else {
				update('dResponse', "Wrong");
			}
		}
	};
	
	buttons[clicked]();
};

