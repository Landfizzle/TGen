var theSentence,
	//temporary dummy variable so I don't have to keep calling the API
	wordsInSentence = [],
		/*[{
			"position": 0,
			"word": "the",
			"onlynoun": false,
			"frequency": 7.48
		},
		{
			"position": 1,
			"word": "online",
			"onlynoun": false,
			"frequency": 4.04
		},
		{
			"position": 2,
			"word": "edition",
			"onlynoun": true,
			"frequency": 3.71
		},
		{
			"position": 3,
			"word": "of",
			"onlynoun": false,
			"frequency": 7.05
		},
		{
			"position": 4,
			"word": "the",
			"onlynoun": false,
			"frequency": 7.48
		},
		{
			"position": 5,
			"word": "daily",
			"onlynoun": false,
			"frequency": 4.3
		},
		{
			"position": 6,
			"word": "post",
			"onlynoun": false,
			"frequency": 4.57
		},
		{
			"position": 7,
			"word": "is",
			"onlynoun": false,
			"frequency": 7.03
		},
		{
			"position": 8,
			"word": "scheduled",
			"onlynoun": false,
			"frequency": 3.81
		},
		{
			"position": 9,
			"word": "to",
			"onlynoun": false,
			"frequency": 7.35
		},
		{
			"position": 10,
			"word": "launch",
			"onlynoun": false,
			"frequency": 4.23
		},
		{
			"position": 11,
			"word": "before",
			"onlynoun": false,
			"frequency": 5.86
		},
		{
			"position": 12,
			"word": "the",
			"onlynoun": false,
			"frequency": 7.48
		},
		{
			"position": 13,
			"word": "end",
			"onlynoun": false,
			"frequency": 5.5
		},
		{
			"position": 14,
			"word": "of",
			"onlynoun": false,
			"frequency": 7.05
		},
		{
			"position": 15,
			"word": "the",
			"onlynoun": false,
			"frequency": 7.48
		},
		{
			"position": 16,
			"word": "year",
			"onlynoun": true,
			"frequency": 5.54
		}], */

	/*dummyData = 
		{"word":"the",
		"rhymes":{"all":"-ə"},
		"results":[{"partOfSpeech":"definite article",
					"definition":"A word placed before nouns to limit or individualize their meaning."},
					{"partOfSpeech":"adverb",
					"definition":"By that; by how much; by so much; on that account; used before comparatives.",
					"examples":["the longer we continue in sin, the more difficult it is to reform"]}],
					"pronunciation":"ðʌ",
	"frequency":7.48}, */
	optionA,
	optionB,
	optionC,
	optionD;

function begin() {

	//Reset variables
	theSentence = "The online edition of The Daily Post is scheduled to launch before the end of the year.",
	
	wordsInSentence = [],

	optionA=undefined,
	optionB=undefined,
	optionC=undefined,
	optionD=undefined;
	
	//Clear DOM
	document.getElementById("optionA").innerHTML = "(A)";
	document.getElementById("optionB").innerHTML = "(B)";
	document.getElementById("optionC").innerHTML = "(C)";
	document.getElementById("optionD").innerHTML = "(D)";
	
	document.getElementById("optionA").disabled = true;
	document.getElementById("optionB").disabled = true;
	document.getElementById("optionC").disabled = true;
	document.getElementById("optionD").disabled = true;
	
	document.getElementById("aResponse").innerHTML = "&nbsp;";
	document.getElementById("bResponse").innerHTML = "&nbsp;";
	document.getElementById("cResponse").innerHTML = "&nbsp;";
	document.getElementById("dResponse").innerHTML = "&nbsp;";
	
	//Format the sentence for processing
	formatTheSentence(theSentence);
}
	
function formatTheSentence(theSentence) {

	
	//console.log("formatTheSentence called\n");
	
	//I need to create a check for bad sentences
	
	var theSentence = theSentence, placeHolder = "", pattern = /[a-z\s]/;
	
	theSentence = theSentence.toLowerCase();
	
	theSentence = theSentence.split("");

	//remove punctuation, looping by letter
	for(var i = 0; i < theSentence.length; i++) {
	
		if(pattern.test(theSentence[i])) {placeHolder += theSentence[i]}
	
	}
		
	theSentence = placeHolder;
	
	//build an array with the values I need for each word {word: frequency: part: position:}
	
	theSentence = theSentence.split(" ");
	////console.log(theSentence);
	//looping by word
	for(var i = 0; i < theSentence.length; i++) {
		wordsInSentence.push(
			{"position": i,
			"word": theSentence[i],
			"onlynoun": true,
			"frequency": 0,
			"returned": false
			});
		
	}
	//if(!badSentenceFlag)

	requestDataOnWords(wordsInSentence);	
	
	//skipping the API step to save my quota =)
	//assignDataToWord(dummyData, wordsInSentence);
	
}

//Call the Words API and retrieve data 

function requestDataOnWords(array) {//Currently only retrieving frequency. I still need to retrieve part of speech
	//console.log("requestDataOnWords called");

	//make an API call to determine frequency and part of speech of each word. I don't think it's possible to fetch this information in one request.
	
	for(var i = 0; i < array.length; i++) {
		var theWord = array[i].word;	
		
		$.ajax({
			url: 'https://wordsapiv1.p.mashape.com/words/' + theWord, // The URL to the API. You can get this in the API page of the API you intend to consume
			type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
			data: {}, // Additional parameters here
			dataType: 'json',
			success: function(data) {assignDataToWord(data, array);},
			error: function(err) { alert(err); },
			beforeSend: function(xhr) {
			xhr.setRequestHeader("X-Mashape-Authorization", "ahIVxzexrJmshIjB3DsqKwyiNQUpp1ZgepCjsnXfyo2BHPrC5m"); // Enter here your Mashape key
			}
			});


	}
	
}

//Add metadata to each word

function assignDataToWord(data, array) { 
	
	// I want to create an "assignValue" function to handle adding any value to any array, but I'm stumped on accessing nested objects through a function argument. "frequency.zipf"? 
	
	

	//console.log("assignDataToWord called\n");	
					
	//In this loop, I need to extract frequency, and check if the part of a speech is a noun AND there are no alternative definitions
	////console.log(data.frequency);
	
	for(var i = 0; i < array.length; i++) {
		
		//match the word in the sentence to the server response
		if(array[i].word == data.word) {
			array[i].frequency = data.frequency;
			
			//flip the "returned" indicator to help signal when all results are returned
			array[i].returned = true;
			
			//go through data.results to check if the word is only a noun
			if(data.results!=undefined) {
				for(var x = 0; x < data.results.length; x++) {
					if(data.results[x].partOfSpeech!="noun") {
						array[i].onlynoun = false;
					}
				}
			} else array[i].onlynoun = false;
			
		}
	}

	findRarestWord(array);
	
}

//locate the rarest word in the sentence to test

function findRarestWord(array) {
	var rarestWord = "", rarestWordFrequency = 9, allDataReturned = true;

	for(var i = 0; i < array.length; i++) {

		if(array[i].frequency <= rarestWordFrequency) {
			rarestWordFrequency = array[i].frequency;
			rarestWord = array[i];
			}
	
		if(array[i].returned==false){allDataReturned = false;}
	
	}

	//i need to confirm the whole sentence has been checked before sending this request. I could add a counter to look for all words in the sentence being returned
	if(allDataReturned) {
		if(itsAGoodOption(rarestWord)) {
			//extract the answer from the sentence
			theSentence = theSentence.replace(rarestWord.word, "------");
			console.log(rarestWord)
			console.log(theSentence);
			assignOption(rarestWord);
			findDistractors(rarestWord);
		} // else findSentence();
	}
	
}

	
//determine if the option is acceptable
	
function itsAGoodOption(theWord) {
	
	//if(!theWord.onlynoun || theWord.appearsTwice || theWord.properNoun || theWord.frequency < 3 || theWord.length < 4) {return false} else
	return true;
	
}

//find a new option

function findDistractors(theOption) {

	//these should only be initialized the first time the function is called (with the correct answer)
		var frequencyMax = theOption.frequency + .25, 
			frequencyMin = theOption.frequency - .25, 
			lettersMax = theOption.word.length + 2, 
			lettersMin = theOption.word.length - 2;
	
	////console.log("frequencyMax: " + frequencyMax + "\nfrequencyMin: " + frequencyMin + "\nletersMax: " + lettersMax + "\nlettersMin: " + lettersMin);
	//make an API call requesting words of a comparable difficulty. 
	//https://wordsapiv1.p.mashape.com/words/?frequencymax=6&frequencymin=4&hasDetails=hasDetails&lettersMax=5&lettersmin=7&limit=100&page=1&partofspeech=noun

	$.ajax({
			url: 'https://wordsapiv1.p.mashape.com/words/?random=true', // The URL to the API. You can get this in the API page of the API you intend to consume
			type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
			data: {
				"frequencyMax": frequencyMax,
				"frequencyMin": frequencyMin,
				"lettersMax": lettersMax,
				"lettersMin": lettersMin,
				"partOfSpeech": "noun"
			}, // Additional parameters here
			dataType: 'json',
			success: function(data) {if(itsAGoodOption(data)){assignOption(data)} else findDistractors();},
			error: function(err) { alert(err); },
			beforeSend: function(xhr) {
			xhr.setRequestHeader("X-Mashape-Authorization", "ahIVxzexrJmshIjB3DsqKwyiNQUpp1ZgepCjsnXfyo2BHPrC5m"); // Enter here your Mashape key
			}
			});


}

//assign options to ABCD
	
function assignOption(theOption) {
	console.log(theOption);
	//fill in options so A is always the correct answer, when D has a value moves on to randomizing the options. Variables should be set according to the correct answer
	
	//"year" is completing first multiple times and steam rolling through this process. Need to rethink this part... I could fill them by checking the other options first...
	if(theOption!=optionA&&theOption!=optionB&&theOption!=optionC&&theOption!=optionD) {	
		if(optionA==undefined) {optionA = theOption; findDistractors(optionA); return;}
		if(optionB==undefined) {optionB = theOption; findDistractors(optionA); return;}
		if(optionC==undefined) {optionC = theOption; findDistractors(optionA); return;}
		if(optionD==undefined) {optionD = theOption; randomizeOptions();}
	}	
}

function randomizeOptions() {
	var A, B, C, D, spin, theAnswer, finding = "A";
	
	while(A == undefined || B == undefined || C == undefined || D == undefined) {
		spin = Math.ceil(Math.random()*4);
		if(finding=="A" && spin == 1) {A = optionA; theAnswer = 1; finding = "B"; }
		if(finding=="A" && spin == 2) {B = optionA; theAnswer = 2; finding = "B"; }
		if(finding=="A" && spin == 3) {C = optionA; theAnswer = 3; finding = "B"; }
		if(finding=="A" && spin == 4) {D = optionA; theAnswer = 4; finding = "B"; }
		
		if(finding=="B" && spin == 1 && A == undefined) {A = optionB; finding = "C"; }
		if(finding=="B" && spin == 2 && B == undefined) {B = optionB; finding = "C"; }
		if(finding=="B" && spin == 3 && C == undefined) {C = optionB; finding = "C"; }
		if(finding=="B" && spin == 4 && D == undefined) {D = optionB; finding = "C"; }
		
		if(finding=="C" && spin == 1 && A == undefined) {A = optionC; finding = "D"; }
		if(finding=="C" && spin == 2 && B == undefined) {B = optionC; finding = "D"; }
		if(finding=="C" && spin == 3 && C == undefined) {C = optionC; finding = "D"; }
		if(finding=="C" && spin == 4 && D == undefined) {D = optionC; finding = "D"; }
		
		if(finding=="D" && A == undefined) {A = optionD; finding = "D"; }
		if(finding=="D" && B == undefined) {B = optionD; finding = "D"; }
		if(finding=="D" && C == undefined) {C = optionD; finding = "D"; }
		if(finding=="D" && D == undefined) {D = optionD; finding = "D"; }
	}
	
	optionA = A;
	optionB = B;
	optionC = C;
	optionD = D;

	if(theAnswer==1){optionA.answer=true;}
	if(theAnswer==2){optionB.answer=true;}
	if(theAnswer==3){optionC.answer=true;}
	if(theAnswer==4){optionD.answer=true;}
	
	printToScreen();

}

function printToScreen() {
	
		document.getElementById("stem").innerHTML = theSentence;
		
		document.getElementById("optionA").innerHTML = "(A) " + optionA.word;
		document.getElementById("optionA").disabled = false;
		
		document.getElementById("optionB").innerHTML = "(B) " + optionB.word;
		document.getElementById("optionB").disabled = false;
		
		document.getElementById("optionC").innerHTML = "(C) " + optionC.word;
		document.getElementById("optionC").disabled = false;
		
		document.getElementById("optionD").innerHTML = "(D) " + optionD.word;
		document.getElementById("optionD").disabled = false;
		
				
}


function checkAnswer(clicked) {
	switch(clicked) {
		case "A":
			if(optionA.answer){
				document.getElementById("aResponse").innerHTML = "Correct!";
				//reset
			} else document.getElementById("aResponse").innerHTML = "Wrong";
			break;
		case "B":
			if(optionB.answer){
				document.getElementById("bResponse").innerHTML = "Correct!";
				//reset
			} else document.getElementById("bResponse").innerHTML = "Wrong";
			break;
		case "C":
			if(optionC.answer){
				document.getElementById("cResponse").innerHTML = "Correct!";
				//reset
			} else document.getElementById("cResponse").innerHTML = "Wrong";
			break;
		case "D":
			if(optionD.answer){
				document.getElementById("dResponse").innerHTML = "Correct!";
				//reset
			} else document.getElementById("dResponse").innerHTML = "Wrong";
			break;
		
	}
		
}





