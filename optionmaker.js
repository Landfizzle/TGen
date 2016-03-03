var optionA,
	optionB,
	optionC,
	optionD;
	
function findDistractors(answer) {
		
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

}

//assign options (The 3 incorrect, random nouns) to ABCD
	
function assignOption(theOptions) {
	


	if(theOptions.length<3) {
		console.log("there werent enough options returned. Trying next sentence"); 
		findSentence(theList); 
		return;
	}
	
	//sinceoptions are returned alphabetically, this should randomize them. Otherwise, the options will be limited to words that start with a or b, or some other "early" letter
	var count = theOptions.length;

	var num1 = Math.floor(Math.random() * count),
		num2 = Math.floor(Math.random() * count),
		num3 = Math.floor(Math.random() * count);

	while(num2 == num1) {num2 = Math.floor(Math.random() * count);}
	while(num3 == num1 || num3 == num2) {num3 = Math.floor(Math.random() * count);}
	
	optionA = theAnswer.word;
	optionB = theOptions[num1].word;
	optionC = theOptions[num2].word;
	optionD = theOptions[num3].word;
	
	randomizeOptions();
	
}

function randomizeOptions() {
	
	console.log("randomizeOptions() called");
	var A, B, C, D, spin, answer, finding = "A";
	
	console.log("A: " + optionA + "\nB: " + optionB + "\nC: " + optionC + "\nD: " + optionD);
	
	while(A == undefined || B == undefined || C == undefined || D == undefined) {
		spin = Math.ceil(Math.random()*4);
		if(finding=="A" && spin == 1) {A = optionA; finding = "B"; }
		if(finding=="A" && spin == 2) {B = optionA; finding = "B"; }
		if(finding=="A" && spin == 3) {C = optionA; finding = "B"; }
		if(finding=="A" && spin == 4) {D = optionA; finding = "B"; }
		
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
	
	printToScreen();

}









