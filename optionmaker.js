var optionA,
	optionB,
	optionC,
	optionD,
	theOptions;
	
var findDistractors = function(answer) {
		
		//these should only be initialized the first time the function is called (with the correct answer)
		//They establish the parameters for finding random nouns
		var frequencyMax = answer.frequency + 50, 
			frequencyMin = 50, // It causes problems with the API whenever this is above 50
			lettersMax = answer.word.length + 2, 
			lettersMin = answer.word.length - 2;
				
			if(answer.frequency + 50 <= 100) {frequencyMax = 100;} else {frequencyMax = answer.frequency + 50;}
			
			if(answer.word.length - 2 <= 4) {lettersMin  = 4;} else {lettersMin = answer.word.length - 2;}
			if(answer.word.length + 2 <= 6) {lettersMax  = 6;} else {lettersMax = answer.word.length + 2;}
			
			if(answer.word=="opportunities") {console.log(frequencyMax + " " + frequencyMin + " " + lettersMax + " " + lettersMin + " ");}
		var url = "http://api.wordnik.com:80/v4/words.json/randomWords?hasDictionaryDef=true&includePartOfSpeech=noun&minCorpusCount=1&maxCorpusCount=-1&" + 
			"minDictionaryCount=" + frequencyMin + 
			"&maxDictionaryCount=" + frequencyMax + 
			"&minLength=" + lettersMin + 
			"&maxLength=" + lettersMax + 
			"&limit=100&api_key=" + WORDNIK_API_KEY;
		
		getData(url, assignOption);

};

//assign options (The 3 incorrect, random nouns) to ABCD
	
var assignOption = function(theOptions) {

	if(theOptions.length<3) {
		console.log("there werent enough options returned. Trying next sentence"); 
		findSentence(theList); 
		return;
	}
	
	//since the random words are returned alphabetically, this should randomize them. Otherwise, the options will be limited to words that start with a or b, or some other "early" letter
	var count = theOptions.length;

	var num1 = Math.floor(Math.random() * count),
		num2 = Math.floor(Math.random() * count),
		num3 = Math.floor(Math.random() * count);

	while(num2 === num1) {num2 = Math.floor(Math.random() * count);}
	while(num3 === num1 || num3 === num2) {num3 = Math.floor(Math.random() * count);}

	//shuffle the answers using Underscore
	theOptions = [theAnswer.word, theOptions[num1].word, theOptions[num2].word, theOptions[num3].word];
	
	theOptions = _.shuffle(theOptions);
	
	optionA = theOptions[0];
	optionB = theOptions[1];
	optionC = theOptions[2];
	optionD = theOptions[3];
	
	//done!
	printToScreen();

};








