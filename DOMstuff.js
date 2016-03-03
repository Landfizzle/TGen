//Change text of a DOM element
function update(name, toDisplay) {
	document.getElementById(name).innerHTML = toDisplay;
}

function enable(name) {
	document.getElementById(name).disabled = false;
}

function disable(name) {
	document.getElementById(name).disabled = true;
}

//On clicking the start button
function mouseClick() {
	
	//Turn off the button to prevent button mashing and prematurely incrementing sentenceListIndex
	disable("start");
	
	//If the list of abstracts from NYT has been exhausted
	if(theList.length > 0 && sentenceListIndex >= theList.length) {
		alert("End of list. Page will refresh");
		location.reload(true);
		return;	
	}  
	
	//If it is the first click, build theList of sentences
	else if(sentenceListIndex == 0) {
		getSentences();
	}  
	
	//If it is not the first click, and not the end of the list, just move on to the next eligible sentence
	else {
		clearScreen();
		findSentence(theList);
	}
	
}
		

function clearScreen() {
	
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
	
}

//Put the options on the buttons and enable them
function printToScreen() {
				
		update("optionA", "(A) " + optionA);
		enable("optionA");
		
		update("optionB", "(B) " + optionB);
		enable("optionB");
		
		update("optionC", "(C) " + optionC);
		enable("optionC");
		
		update("optionD", "(D) " + optionD);
		enable("optionD");
}


//On clicking a button A-D, determine if the selection was correct or wrong
function checkAnswer(clicked) {
	switch(clicked) {
		case "A":
			if(optionA==theAnswer.word){				
				update("aResponse", "Correct!");
				enable("start");					
				//reset
			} else update("aResponse", "Wrong");
			break;
		case "B":
			if(optionB==theAnswer.word){				
				update("bResponse", "Correct!");
				enable("start");
				//reset
			} else update("bResponse", "Wrong");
			break;
		case "C":
			if(optionC==theAnswer.word){				
				update("cResponse", "Correct!");
				enable("start");
				//reset
			} else update("cResponse", "Wrong");
			break;
		case "D":
			if(optionD==theAnswer.word){				
				update("dResponse", "Correct!");
				enable("start");
				//reset
			} else update("dResponse", "Wrong");
			break;
	}		
}

