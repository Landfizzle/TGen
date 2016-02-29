const WORDNIK_API_KEY = "1706e28b8263086fd200e031a760a3d2c64f01948c34d3499";



//Results retrieved from ^^ on 2/26/16

var wordsInSentence = [],
	sentenceListIndex = 0,
	theList = [],
	sentenceToTest = "Incandiferous",
	theAnswer = {"position":12,
		"word":"indecision",
		"onlynoun":true,
		"frequency":64,
		"frequencyreturned":true,
		"onlynounreturned":true,
		"theanswer":true};
		
var findAnswerCalled = false;

function mouseClick() {
	
	update("status", sentenceListIndex);
	
	if(sentenceListIndex == 0) {
		getSentences();
	}  else {
		clearScreen();
		findSentence(theList);
	}
	
}

function begin() {
	clearScreen();
	
	
	getSentences();
	
}
		
function getSentences () {
	//NYT most popular from today
	var url = "http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/7.json?api-key=458160046a89adbe1794a152b13ef268:10:67481050";
	
	getData(url, buildListOfSentences);

} 

function buildListOfSentences(source) {
	console.log("buildListOfSentences() called with: " + source);
	
	theList = [];
	
	source.results.forEach(function(item, index) {
		theList.push(item.abstract);
	});
	
	if(theList!=undefined) {findSentence(theList);} else {alert("theList is empty");}
	
	console.log(theList);
}

function findSentence(listOfSentences) {
	console.log("findSentence called with: " + listOfSentences);
		
	var theSentence = listOfSentences[sentenceListIndex];
	
	clearScreen();
	
	sentenceListIndex++;
	//check if it is one sentence and lacks excess punctuation. return false if so,array if its usable		
	if(canUseSentence(theSentence)) {
		//Convert my sentence into a form compatible with the Wordnik API
		sentenceToTest = theSentence;
		format(theSentence);
		//attach metadata to the sentence (Frequency, onlynoun)
		assignDataToWords(wordsInSentence);
		return;} 
		else {
			console.log("sentence unusable, trying again");
			
			findSentence(listOfSentences);
	}
}



function format(sentence) {
	console.log("format() called with: " + sentence)
	//Return an array of objects. Each object contains the word and important info about it
	
	//Turn it into an array
	wordsInSentence = sentence.split(" ");
	
	//Turn each item into an object
	wordsInSentence.forEach(function(item, index) {
			wordsInSentence[index] = {"position": index,
			"word": item,
			"onlynoun": true,
			"frequency": 0,
			"frequencyreturned": false,
			"onlynounreturned": false,
			"theanswer": false
	}});
	
		//Punctuation handling on the Wordnik API is inconsistent. I can't just strip off all the punctuation, so these checks should fix those inconsistencies. The trickiest cases are apostrophes. Possessive apostrophes are not returned and can render a word unreadable by the API, and contracting apostrophes are necessary to identify the word. (Compare "party's" and "won't") 
		
		
	
	//Remove commas
	wordsInSentence.forEach(function(item, index) {
		
		var theWord = item.word;
		
		for(var i = 0;i < theWord.length; i ++) {
			if(theWord.charAt(i) == ",") {theWord = theWord.replace(",","");}
		}
			
		wordsInSentence[index].word = theWord;
		
	})	;
	
	//Remove the final period. Because I already ruled out using any sentences that might end in ! or ? I can just assume theres a period at the end. The other periods will be for titles and abbreviations, and I can keep those.
	wordsInSentence[wordsInSentence.length-1].word = wordsInSentence[wordsInSentence.length-1].word.replace(".","");
	
	//Apostrophes and capitals. I'm just going to get rid of any word with an apostrophe. I believe my original solution was correct but incompatible with inconsistent results from Wordnik
		
	wordsInSentence = wordsInSentence.filter(function(item) {
		var pattern = new RegExp("[’A-Z]");
		if(!pattern.test(item.word)) {return item}
	});

}

//One function to make all the API calls for necessary word info. (Frequency and if it is only a noun)

function assignDataToWords(array) {
	console.log("assignDataToWords called with " + array);
	
	//Get frequency. Im calling this with canonical turned off because  "pushed" != "push" and it causes problems with the checks. If I fixed that it would make it more accurate, though
	for(var i = 0; i < wordsInSentence.length; i ++) {
		var url = 
		"http://api.wordnik.com:80/v4/word.json/" + 
		wordsInSentence[i].word + 
		"/frequency?useCanonical=false&startYear=1960&endYear=2012&api_key=" + 
		WORDNIK_API_KEY;

		getData(url, assignFrequency);
	}
	

	//Figure out if the word is only a noun 
	for(var i = 0; i < wordsInSentence.length; i ++) {
		
		var url = 
		"http://api.wordnik.com:80/v4/word.json/" + 
		wordsInSentence[i].word + 		"/definitions?limit=200&includeRelated=false&sourceDictionaries=wiktionary&useCanonical=false&includeTags=false&api_key=" + 
		WORDNIK_API_KEY;

		getData(url, assignOnlyNoun);
	}
	
}

function canUseSentence(string) {
	console.log("canUseSentence called with: " + string);
	var theLetters = string.toLowerCase().split(""),
		theWords = format(string),
		pattern = pattern = /[a-z.\s\,\’]/,
		canUseIt = true;
	
	for(var i = 0; i < theLetters.length; i++) {
		//Does it have punctuation besides ' , or .
		if(!pattern.test(theLetters[i])) {return false;}
		
		//Is it one sentence? (Are there titles like "Mr." or abbreviated acronyms?)
		//Doesn't catch "Mrs" because its three letters
		if(theLetters[i] == "." && i != theLetters.length-1) {
			var title = theLetters[i-2] + theLetters[i-1];
			if(title !="mr" && title != "ms" && title != "dr") {

				return false;
			}
		}
	}
		

	return true;	
	
}

function assignFrequency(data) {
	console.log("createArray called (Probably because data was returned)");
	var array = wordsInSentence;
			
	for (var i = 0; i < array.length; i++) {
			
		if(array[i].word == data.word) {
			
			array[i].frequencyreturned = true;
			array[i].frequency = data.totalCount;
			
		}
	
		//check if all the results are in
		var allReturned = true;

		for (var u = 0; u < array.length; u++) {
			if (array[u].frequencyreturned == false) {allReturned = false;}
		}
						
	}
	
	if(allReturned) {sentenceComplete(wordsInSentence);}
}

function assignOnlyNoun(data) {
	console.log("assignOnlyNoun called with: " + data[0].word);
	
	var array = wordsInSentence;
	
	array.forEach(function(arrayitem, arrayindex) {
		
		//make sure the result is not empty (Setup "else")
		if(data[0]!=undefined&&data[0].word!=undefined) {
			
			//match the word in the sentence to the server response
			if(array[arrayindex].word == data[0].word) {
			
				//flip the "returned" indicator to help signal when all results are returned
				array[arrayindex].onlynounreturned = true;
				
				//go through data.results to check if the word is only a noun
				data.forEach(function(dataitem, dataindex) {
					if(data[dataindex].partOfSpeech!="noun") {
						array[arrayindex].onlynoun = false;
					}
				});		
			}
		} else console.log("data[0] or data[0].word is undefined");

	});
	
		//check if all the results are in
		var allReturned = true;

		for (var u = 0; u < array.length; u++) {

			if (array[u].onlynounreturned == false) {allReturned = false;}
			
		}
						
	
	
	if(allReturned) {sentenceComplete(wordsInSentence);}
}

function getData(url, callback, optional) {

			//migrate to Wordnik
			console.log("getData called from: " + url + "\n with callback: " + callback);
			var 
			xhr = new XMLHttpRequest(),
			data;
			
			xhr.open("GET", url, true);
			xhr.send();
			
			xhr.onreadystatechange = function() {
				if(xhr.readyState==4 && xhr.status==200) {
					callback(JSON.parse(xhr.responseText), optional)
				}			
				if(xhr.readyState==4 && xhr.status!=200) {
					alert("x");
				}						
			}
	
}

function sentenceComplete(array) {
	var allReturned = true;
	//check if frequency and onlynoun are returned
	for(var i = 0; i < array.length; i++) {
		if(array[i].frequencyreturned == false || 
			array[i].onlynounreturned == false) {
				allReturned = false;}
	}
	
	if(allReturned && !findAnswerCalled) {
		findAnswerCalled = true;
		findAnswer(array);}
	
}

function findAnswer(array) {
	var lowestFrequency = 100000,
		rarestWord = "incandiferous";
		
	for(var i = 0; i < array.length; i ++) {
		if(array[i].frequency < lowestFrequency && array[i].onlynoun) {
			rarestWord = array[i].word;
			lowestFrequency = array[i].frequency;
		}		
	}
	
	for(var i = 0; i < array.length; i ++) {
		if(array[i].word == rarestWord) {
			array[i].theanswer = true;
			theAnswer = array[i];
		}		
	}
	
	//At this point the array is done. I have the word that should be tested.
	console.log("Everythings done! ");
	
	sentenceToTest = sentenceToTest.replace(theAnswer.word, "-------");
	document.getElementById("stem").innerHTML = sentenceToTest;
	
	//Move on to finding distractors
	findDistractors(theAnswer);
}

//Update a DOM element
function update(name, toDisplay) {
	document.getElementById(name).innerHTML = toDisplay;
}
//Keeping this to return in the (unlikely) event that 
var dummyData = {
	"status" : "OK",
	"copyright" : "Copyright (c) 2016 The New York Times Company. All Rights Reserved.",
	"num_results" : 858,
	"results" : [{
			"url" : "http:\/\/www.nytimes.com\/interactive\/2016\/02\/24\/arts\/hollywood-diversity-inclusion.html",
			"adx_keywords" : "",
			"column" : "",
			"section" : "Arts",
			"byline" : "By MELENA RYZIK",
			"type" : "Interactive",
			"title" : "What It\u2019s Really Like to Work in Hollywood (*If you\u2019re not a straight white man.)",
			"abstract" : "The statistics are unequivocal: Women and minorities are vastly underrepresented in front of and behind the camera. Here, 27 industry players reveal the stories behind the numbers.",
			"published_date" : "2016-02-24",
			"source" : "The New York Times",
			"id" : 100000004212302,
			"asset_id" : 100000004212302,
			"views" : 1,
			"des_facet" : ["MOVIES", "TELEVISION"],
			"org_facet" : "",
			"per_facet" : ["KALING, MINDY", "ROBERTS, JULIA", "PIERCE, WENDELL", "LONGORIA, EVA", "CHEN, JOAN", "ESMAIL, SAM", "JEONG, KEN (1969- )", "SMOLLETT, JUSSIE (1983- )", "SMITS, JIMMY", "KUSAMA, KARYN"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Clockwise from top left, Mindy Kaling, Jussie Smollett, Julia Roberts, Jimmy Smits, Eva Longoria and Wendell Pierce.",
					"copyright" : "Brinson+Banks for The New York Times; Top center, Taylor Glascock for The New York Times; Above right, Ryan Pfluger for The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 683,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/arts\/28VOICESWEB-3X2\/28VOICESWEB-3X2-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/us\/politics\/republican-race-puts-paul-ryan-and-donald-trump-on-collision-course.html",
			"adx_keywords" : "Presidential Election of 2016;Trump, Donald J;Ryan, Paul D Jr;House of Representatives;Republican Party;United States Politics and Government",
			"column" : "",
			"section" : "U.S.",
			"byline" : "By JENNIFER STEINHAUER",
			"type" : "Article",
			"title" : "Republican Race Puts Donald Trump and Paul Ryan on Collision Course",
			"abstract" : "As Mr. Trump inches closer to being the party\u2019s presidential nominee, Republicans fear he won\u2019t back the conservative agenda pushed by Mr. Ryan, the House speaker.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004230468,
			"asset_id" : 100000004230468,
			"views" : 2,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016", "UNITED STATES POLITICS AND GOVERNMENT"],
			"org_facet" : ["HOUSE OF REPRESENTATIVES", "REPUBLICAN PARTY"],
			"per_facet" : ["TRUMP, DONALD J", "RYAN, PAUL D JR"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "If Donald J. Trump were elected president, the House speaker, Paul D. Ryan, would not find a like mind in the White House.",
					"copyright" : "Jim Wilson\/The New York Times; Doug Mills\/The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 683,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/23\/us\/LISTY-trump_ryan\/LISTY-trump_ryan-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/28\/magazine\/what-google-learned-from-its-quest-to-build-the-perfect-team.html",
			"adx_keywords" : "Productivity;Google Inc;Group Work;Teams;Julia Rozovsky;Silicon Valley (Calif)",
			"column" : "The Work Issue",
			"section" : "Magazine",
			"byline" : "By CHARLES DUHIGG",
			"type" : "Article",
			"title" : "What Google Learned From Its Quest to Build the Perfect Team",
			"abstract" : "New research reveals surprising truths about why some work groups thrive and others falter.",
			"published_date" : "2016-02-28",
			"source" : "The New York Times",
			"id" : 100000004221524,
			"asset_id" : 100000004221524,
			"views" : 3,
			"des_facet" : "",
			"org_facet" : ["GOOGLE INC"],
			"per_facet" : ["JULIA ROZOVSKY"],
			"geo_facet" : ["SILICON VALLEY (CALIF)"],
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "",
					"copyright" : "Illustration by James Graham",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-copy-square320-v3.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-thumbStandard-v2.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-copy-articleInline-v2.jpg",
							"format" : "Normal",
							"height" : 209,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-sfSpan-v2.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-copy-jumbo-v2.jpg",
							"format" : "Jumbo",
							"height" : 1024,
							"width" : 930
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-copy-superJumbo-v2.jpg",
							"format" : "superJumbo",
							"height" : 1492,
							"width" : 1354
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-copy-square640-v3.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-thumbLarge-v2.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-copy-mediumThreeByTwo210-v3.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/28\/magazine\/28mag-teams1-copy\/28mag-teams1-copy-mediumThreeByTwo440-v3.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/us\/politics\/donald-trump-path.html",
			"adx_keywords" : "Trump, Donald J;Presidential Election of 2016;Republican Party",
			"column" : "",
			"section" : "U.S.",
			"byline" : "By ALEXANDER BURNS",
			"type" : "Article",
			"title" : "Donald Trump Keeps Winning. Here\u2019s What Could Make Him Lose.",
			"abstract" : "His path to the Republican presidential nomination appears wider than ever, but it could contain pitfalls and roadblocks.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004230864,
			"asset_id" : 100000004230864,
			"views" : 4,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016"],
			"org_facet" : ["REPUBLICAN PARTY"],
			"per_facet" : ["TRUMP, DONALD J"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Donald J. Trump on Tuesday in Las Vegas after he won the Nevada caucuses.",
					"copyright" : "Ruth Fremson\/The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-articleInline.jpg",
							"format" : "Normal",
							"height" : 118,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 636,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1271,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/25TRUMPlisty\/25TRUMPlisty-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/technology\/personaltech\/tips-and-myths-about-extending-smartphone-battery-life.html",
			"adx_keywords" : "Batteries;Smartphones;Wirecutter, The;Apple Inc;Android (Operating System)",
			"column" : "Tech Fix",
			"section" : "Technology",
			"byline" : "By BRIAN X. CHEN",
			"type" : "Article",
			"title" : "Tips and Myths About Extending Smartphone Battery Life",
			"abstract" : "We teamed up with The Wirecutter to determine the best methods for preventing your phone from going dark.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004224440,
			"asset_id" : 100000004224440,
			"views" : 5,
			"des_facet" : ["BATTERIES", "SMARTPHONES", "ANDROID (OPERATING SYSTEM)"],
			"org_facet" : ["WIRECUTTER, THE", "APPLE INC"],
			"per_facet" : "",
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "",
					"copyright" : "Minh Uong\/The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-square320-v2.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-thumbStandard-v2.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-articleInline.jpg",
							"format" : "Normal",
							"height" : 134,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-sfSpan-v4.jpg",
							"format" : "Large",
							"height" : 279,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 723,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1446,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-square640-v2.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-thumbLarge-v2.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-mediumThreeByTwo210-v2.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25FLOATERREFER\/25FLOATERREFER-mediumThreeByTwo440-v2.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/opinion\/the-secret-side-of-donald-trump.html",
			"adx_keywords" : "Presidential Election of 2016;Trump, Donald J;Health Insurance and Managed Care;Republican Party;Medicare",
			"column" : "Op-Ed Columnist",
			"section" : "Opinion",
			"byline" : "By GAIL COLLINS",
			"type" : "Article",
			"title" : "The Secret Side of Donald Trump",
			"abstract" : "A never-ending search for the least-bad Republican.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004230630,
			"asset_id" : 100000004230630,
			"views" : 6,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016", "HEALTH INSURANCE AND MANAGED CARE"],
			"org_facet" : ["REPUBLICAN PARTY"],
			"per_facet" : ["TRUMP, DONALD J"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "",
					"copyright" : "Earl Wilson\/The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2014\/11\/01\/opinion\/collins-circular\/collins-circular-thumbStandard-v5.png",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2014\/11\/01\/opinion\/collins-circular\/collins-circular-articleInline-v5.png",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2014\/11\/01\/opinion\/collins-circular\/collins-circular-jumbo-v5.png",
							"format" : "Jumbo",
							"height" : 228,
							"width" : 342
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2014\/11\/01\/opinion\/collins-circular\/collins-circular-superJumbo-v5.png",
							"format" : "superJumbo",
							"height" : 228,
							"width" : 342
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2014\/11\/01\/opinion\/collins-circular\/collins-circular-thumbLarge-v7.png",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2014\/11\/01\/opinion\/collins-circular\/collins-circular-mediumThreeByTwo210-v5.png",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/opinion\/senate-republicans-lose-their-minds-on-a-supreme-court-seat.html",
			"adx_keywords" : "Editorials;United States Politics and Government;Obama, Barack;Scalia, Antonin;Senate;Republican Party;McConnell, Mitch;Supreme Court (US)",
			"column" : "Editorial",
			"section" : "Opinion",
			"byline" : "By THE EDITORIAL BOARD",
			"type" : "Article",
			"title" : "Senate Republicans Lose Their Minds on a Supreme Court Seat",
			"abstract" : "Republicans have parked themselves so far to the right for so many years that it\u2019s not clear if they can hear how deranged they sound.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004229487,
			"asset_id" : 100000004229487,
			"views" : 7,
			"des_facet" : ["EDITORIALS", "UNITED STATES POLITICS AND GOVERNMENT"],
			"org_facet" : ["SENATE", "REPUBLICAN PARTY", "SUPREME COURT (US)"],
			"per_facet" : ["OBAMA, BARACK", "SCALIA, ANTONIN", "MCCONNELL, MITCH"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "",
					"copyright" : "Ji Lee",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-articleInline.jpg",
							"format" : "Normal",
							"height" : 236,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-sfSpan.jpg",
							"format" : "Large",
							"height" : 490,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 1024,
							"width" : 826
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1199,
							"width" : 966
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25thu1\/25thu1-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/26\/us\/politics\/donald-trump-taps-foreign-work-force-for-his-florida-club.html",
			"adx_keywords" : "Foreign Workers;Labor and Jobs;Immigration and Emigration;Visas;Trump, Donald J;Florida;Palm Beach (Fla);Presidential Election of 2016",
			"column" : "",
			"section" : "U.S.",
			"byline" : "By CHARLES V. BAGLI and MEGAN TWOHEY",
			"type" : "Article",
			"title" : "Donald Trump to Foreign Workers for Florida Club: You\u2019re Hired",
			"abstract" : "Aided by an oft-debated visa program, Mr. Trump\u2019s resort frequently aims to hire temporary guest workers from Romania and other nations.",
			"published_date" : "2016-02-26",
			"source" : "The New York Times",
			"id" : 100000004223124,
			"asset_id" : 100000004223124,
			"views" : 8,
			"des_facet" : ["FOREIGN WORKERS", "LABOR AND JOBS", "IMMIGRATION AND EMIGRATION"],
			"org_facet" : "",
			"per_facet" : ["TRUMP, DONALD J"],
			"geo_facet" : ["FLORIDA", "PALM BEACH (FLA)"],
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Donald J. Trump\u2019s Mar-a-Lago Club in Palm Beach, Fla.",
					"copyright" : "Ryan Stone for The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 683,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26MARALAGO\/26MARALAGO-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/interactive\/2016\/02\/24\/business\/distress-cities-counties.html",
			"adx_keywords" : "",
			"column" : "",
			"section" : "Business Day",
			"byline" : "By KARL RUSSELL",
			"type" : "Interactive",
			"title" : "In an Improving Economy, Places in Distress",
			"abstract" : "As the most prosperous communities in the United States have gotten richer since the end of the Great Recession in 2009, economic conditions in many distressed areas have deteriorated even further.",
			"published_date" : "2016-02-24",
			"source" : "The New York Times",
			"id" : 100000004231738,
			"asset_id" : 100000004231738,
			"views" : 9,
			"des_facet" : ["UNITED STATES ECONOMY"],
			"org_facet" : "",
			"per_facet" : "",
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "",
					"copyright" : "",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-square320-v2.png",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-thumbStandard-v2.png",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-articleInline.png",
							"format" : "Normal",
							"height" : 135,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-sfSpan.png",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-jumbo.png",
							"format" : "Jumbo",
							"height" : 727,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-superJumbo.png",
							"format" : "superJumbo",
							"height" : 1454,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-square640-v2.png",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-thumbLarge-v2.png",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-mediumThreeByTwo210.png",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/24\/business\/distress-cities-counties-1456358471839\/distress-cities-counties-1456358471839-mediumThreeByTwo440.png",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/technology\/apple-is-said-to-be-working-on-an-iphone-even-it-cant-hack.html",
			"adx_keywords" : "Apple Inc;Privacy;Computer Security;Surveillance of Citizens by Government;San Bernardino, Calif, Shooting (2015);iPhone;Software;Federal Bureau of Investigation;Justice Department",
			"column" : "",
			"section" : "Technology",
			"byline" : "By MATT APUZZO and KATIE BENNER",
			"type" : "Article",
			"title" : "Apple Is Said to Be Trying to Make It Harder to Hack iPhones",
			"abstract" : "Concerned about the government\u2019s insistence that it break into a terrorist\u2019s phone, the company wants to take that power out of its own hands.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004231267,
			"asset_id" : 100000004231267,
			"views" : 10,
			"des_facet" : ["COMPUTER SECURITY", "SURVEILLANCE OF CITIZENS BY GOVERNMENT", "SAN BERNARDINO, CALIF, SHOOTING (2015)", "SOFTWARE"],
			"org_facet" : ["APPLE INC", "FEDERAL BUREAU OF INVESTIGATION", "JUSTICE DEPARTMENT"],
			"per_facet" : "",
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "New York police officers stood guard during a demonstration outside the Apple store on Fifth Avenue on Tuesday.					",
					"copyright" : "Jewel Samad\/Agence France-Presse \u2014 Getty Images",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-articleInline.jpg",
							"format" : "Normal",
							"height" : 133,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 716,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1432,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/business\/25security1\/25security1-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/opinion\/campaign-stops\/what-is-marco-rubio-waiting-for.html",
			"adx_keywords" : "Presidential Election of 2016;Rubio, Marco;Trump, Donald J;Cruz, Ted;Republican Party;Polls and Public Opinion;Primaries and Caucuses",
			"column" : "Op-Ed Columnist",
			"section" : "Opinion",
			"byline" : "By ROSS DOUTHAT",
			"type" : "Article",
			"title" : "What Is Marco Rubio Waiting For?",
			"abstract" : "Maybe he has a strategy for making the not-Trump case, but time\u2019s running out.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004231449,
			"asset_id" : 100000004231449,
			"views" : 11,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016"],
			"org_facet" : ["REPUBLICAN PARTY"],
			"per_facet" : ["RUBIO, MARCO", "TRUMP, DONALD J", "CRUZ, TED"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Marco Rubio at a rally in Franklin, Tenn.",
					"copyright" : "Joe Buglewicz for The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 683,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25douthatWeb\/25douthatWeb-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/nyregion\/babysitter-tortured-staten-island-boy-who-died-prosecutors-say.html",
			"adx_keywords" : "Child Abuse and Neglect;Murders, Attempted Murders and Homicides;Children and Childhood;Sex Crimes;Staten Island (NYC);Fields, Gloria (1985- )",
			"column" : "",
			"section" : "N.Y. \/ Region",
			"byline" : "By RICK ROJAS and REBECCA WHITE",
			"type" : "Article",
			"title" : "Babysitter Tortured Staten Island Boy Who Died, Prosecutors Say",
			"abstract" : "Gloria Fields is accused of subjecting Anthony Delgado, a toddler, to hours of physical and sexual abuse while he was left in her care.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004231187,
			"asset_id" : 100000004231187,
			"views" : 12,
			"des_facet" : ["CHILD ABUSE AND NEGLECT", "MURDERS, ATTEMPTED MURDERS AND HOMICIDES", "CHILDREN AND CHILDHOOD", "SEX CRIMES"],
			"org_facet" : "",
			"per_facet" : ["FIELDS, GLORIA (1985- )"],
			"geo_facet" : ["STATEN ISLAND (NYC)"],
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Anthony Delgado",
					"copyright" : "",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BABYSITTER-2\/25BABYSITTER-2-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BABYSITTER-2\/25BABYSITTER-2-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BABYSITTER-2\/25BABYSITTER-2-articleInline.jpg",
							"format" : "Normal",
							"height" : 269,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BABYSITTER-2\/25BABYSITTER-2-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BABYSITTER-2\/25BABYSITTER-2-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 578,
							"width" : 409
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BABYSITTER-2\/25BABYSITTER-2-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 578,
							"width" : 409
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BABYSITTER-2\/25BABYSITTER-2-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BABYSITTER-2\/25BABYSITTER-2-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/26\/nyregion\/mother-of-girl-berated-in-video-assails-success-academys-response.html",
			"adx_keywords" : "Education (K-12);Success Academy Charter Schools;Miranda, Nadya;Moskowitz, Eva S",
			"column" : "",
			"section" : "N.Y. \/ Region",
			"byline" : "By KATE TAYLOR",
			"type" : "Article",
			"title" : "Mother of Girl Berated in Video Assails Success Academy\u2019s Response",
			"abstract" : "Nadya Miranda said officials of the charter school focused on defending the teacher and its public image, with little concern for her daughter\u2019s welfare.",
			"published_date" : "2016-02-26",
			"source" : "The New York Times",
			"id" : 100000004226750,
			"asset_id" : 100000004226750,
			"views" : 13,
			"des_facet" : ["EDUCATION (K-12)"],
			"org_facet" : ["SUCCESS ACADEMY CHARTER SCHOOLS"],
			"per_facet" : ["MIRANDA, NADYA", "MOSKOWITZ, EVA S"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Nadya Miranda, 23, is the mother of a student whose treatment by an angry teacher at Success Academy in Cobble Hill, Brooklyn, was surreptitiously videotaped. Ms. Miranda has withdrawn her daughter from the school.",
					"copyright" : "Kirsten Luce for The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 682,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1364,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25SUCCESS1\/25SUCCESS1-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/opinion\/campaign-stops\/clinton-sanders-and-southern-voters.html",
			"adx_keywords" : "Presidential Election of 2016;Blacks;Sanders, Bernard;Clinton, Hillary Rodham;Democratic Party;South Carolina;Southern States (US);Primaries and Caucuses",
			"column" : "Op-Ed Columnist",
			"section" : "Opinion",
			"byline" : "By CHARLES M. BLOW",
			"type" : "Article",
			"title" : "Clinton, Sanders and Southern Voters",
			"abstract" : "A regional preference creates a cultural barrier for one candidate and a built-in advantage for the other.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004231674,
			"asset_id" : 100000004231674,
			"views" : 14,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016", "BLACKS"],
			"org_facet" : ["DEMOCRATIC PARTY"],
			"per_facet" : ["SANDERS, BERNARD", "CLINTON, HILLARY RODHAM"],
			"geo_facet" : ["SOUTH CAROLINA", "SOUTHERN STATES (US)"],
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Bernie Sanders arriving in South Carolina on Tuesday.",
					"copyright" : "Sam Hodgson for The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 682,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25blowWeb\/25blowWeb-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/interactive\/2016\/us\/elections\/primary-calendar-and-results.html",
			"adx_keywords" : "",
			"column" : "",
			"section" : "U.S.",
			"byline" : "By WILSON ANDREWS, KITTY BENNETT and ALICIA PARLAPIANO",
			"type" : "Interactive",
			"title" : "2016 Primary Results and Calendar",
			"abstract" : "The 2016 primaries and caucuses have begun. See results and upcoming primary dates.",
			"published_date" : "2016-02-24",
			"source" : "The New York Times",
			"id" : 100000003627564,
			"asset_id" : 100000003627564,
			"views" : 15,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016", "ELECTIONS", "PRIMARIES AND CAUCUSES", "UNITED STATES POLITICS AND GOVERNMENT"],
			"org_facet" : "",
			"per_facet" : "",
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "",
					"copyright" : "",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-square320-v6.png",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-thumbStandard-v6.png",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-articleInline-v6.png",
							"format" : "Normal",
							"height" : 119,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-sfSpan-v6.png",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-jumbo-v6.png",
							"format" : "Jumbo",
							"height" : 639,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-superJumbo-v6.png",
							"format" : "superJumbo",
							"height" : 678,
							"width" : 1086
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-square640-v4.png",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-thumbLarge-v6.png",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-mediumThreeByTwo210-v6.png",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2015\/04\/14\/us\/elections\/primary-calendar-and-results-1429026715315\/primary-calendar-and-results-1429026715315-mediumThreeByTwo440-v6.png",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/upshot\/john-kasich-republican-nomination.html",
			"adx_keywords" : "Presidential Election of 2016;Rubio, Marco;Kasich, John R;Republican Party;Bush, Jeb",
			"column" : "The Upshot",
			"section" : "The Upshot",
			"byline" : "By KEVIN QUEALY",
			"type" : "Article",
			"title" : "Lessons From Game Theory: What Keeps Kasich in the Race?",
			"abstract" : "The two remaining mainstream candidates \u2014 Marco Rubio and Mr. Kasich \u2014 are living out a problem studied for decades in game theory.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004204586,
			"asset_id" : 100000004204586,
			"views" : 16,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016"],
			"org_facet" : ["REPUBLICAN PARTY"],
			"per_facet" : ["RUBIO, MARCO", "KASICH, JOHN R", "BUSH, JEB"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "",
					"copyright" : "Tamara Shopsin",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-square320-v2.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-articleInline-v2.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-sfSpan-v2.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-jumbo.gif",
							"format" : "Jumbo",
							"height" : 683,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-superJumbo-v3.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-square640-v2.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/16\/upshot\/16up-gametheory\/16up-gametheory-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/opinion\/the-party-of-no-way.html",
			"adx_keywords" : "Supreme Court (US);Scalia, Antonin;Obama, Barack;Republican Party;Senate;Constitution (US);Appointments and Executive Changes;Presidential Election of 2016;United States Politics and Government",
			"column" : "Op-Ed Columnist",
			"section" : "Opinion",
			"byline" : "By NICHOLAS KRISTOF",
			"type" : "Article",
			"title" : "The Party of \u2018No Way!\u2019",
			"abstract" : "The G.O.P. used to be serious and prudent, but today it\u2019s less about governing than about obstructing.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004230631,
			"asset_id" : 100000004230631,
			"views" : 17,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016", "UNITED STATES POLITICS AND GOVERNMENT"],
			"org_facet" : ["SUPREME COURT (US)", "REPUBLICAN PARTY", "SENATE"],
			"per_facet" : ["SCALIA, ANTONIN", "OBAMA, BARACK"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Protesters outside the Supreme Court opposed G.O.P. plans to ignore a nomination to replace Justice Antonin Scalia this year.",
					"copyright" : "Doug Mills\/The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 683,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/opinion\/25kristof\/25kristof-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/25\/nyregion\/move-to-dismiss-brownsville-rape-case-charges.html",
			"adx_keywords" : "Sex Crimes;Brooklyn (NYC);Brownsville (Brooklyn, NY);Thompson, Kenneth P",
			"column" : "",
			"section" : "N.Y. \/ Region",
			"byline" : "By AL BAKER",
			"type" : "Article",
			"title" : "Prosecutors Will Move to Dismiss Charges in Brownsville Rape Case",
			"abstract" : "The effort to drop the case against five teenagers accused of attacking an 18-year-old woman came primarily as the victim\u2019s credibility as a witness fell apart, officials said.",
			"published_date" : "2016-02-25",
			"source" : "The New York Times",
			"id" : 100000004230170,
			"asset_id" : 100000004230170,
			"views" : 18,
			"des_facet" : ["SEX CRIMES"],
			"org_facet" : "",
			"per_facet" : ["THOMPSON, KENNETH P"],
			"geo_facet" : ["BROOKLYN (NYC)", "BROWNSVILLE (BROOKLYN, NY)"],
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Five teenage boys were accused of attacking an 18-year-old woman at the Osborn Playground in Brownsville in January.",
					"copyright" : "Kevin Hagen for The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 682,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/nyregion\/25BROWNSVILLE\/25BROWNSVILLE-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/26\/opinion\/mrs-clinton-show-voters-those-transcripts.html",
			"adx_keywords" : "United States Politics and Government;Presidential Election of 2016;Clinton, Hillary Rodham;Banking and Financial Institutions;Goldman Sachs Group Inc",
			"column" : "Editorial",
			"section" : "Opinion",
			"byline" : "By THE EDITORIAL BOARD",
			"type" : "Article",
			"title" : "Mrs. Clinton, Show Voters Those Transcripts",
			"abstract" : "Voters are entitled to know what Mrs. Clinton said in paid speeches to industry groups, and stonewalling on this will only damage her.",
			"published_date" : "2016-02-26",
			"source" : "The New York Times",
			"id" : 100000004233156,
			"asset_id" : 100000004233156,
			"views" : 19,
			"des_facet" : ["UNITED STATES POLITICS AND GOVERNMENT", "PRESIDENTIAL ELECTION OF 2016"],
			"org_facet" : ["GOLDMAN SACHS GROUP INC"],
			"per_facet" : ["CLINTON, HILLARY RODHAM"],
			"geo_facet" : "",
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "",
					"copyright" : "Ji Lee",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-articleInline.jpg",
							"format" : "Normal",
							"height" : 236,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-sfSpan.jpg",
							"format" : "Large",
							"height" : 490,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 1024,
							"width" : 826
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1199,
							"width" : 967
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/26\/opinion\/26fri1\/26fri1-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}, {
			"url" : "http:\/\/www.nytimes.com\/2016\/02\/26\/us\/politics\/ted-cruz-texas.html",
			"adx_keywords" : "Cruz, Ted;Presidential Election of 2016;Texas;Primaries and Caucuses;Republican Party;Abbott, Gregory W (1957- );Trump, Donald J;Rubio, Marco",
			"column" : "",
			"section" : "U.S.",
			"byline" : "By MATT FLEGENHEIMER",
			"type" : "Article",
			"title" : "Ted Cruz Fights in Texas, Hoping It Won\u2019t Be His Alamo",
			"abstract" : "The \u201cSuper Tuesday\u201d voting states have always been at the center of Mr. Cruz\u2019s campaign strategy, and now Texas is at the forefront of that plan.",
			"published_date" : "2016-02-26",
			"source" : "The New York Times",
			"id" : 100000004231810,
			"asset_id" : 100000004231810,
			"views" : 20,
			"des_facet" : ["PRESIDENTIAL ELECTION OF 2016"],
			"org_facet" : ["REPUBLICAN PARTY"],
			"per_facet" : ["CRUZ, TED", "ABBOTT, GREGORY W (1957- )", "TRUMP, DONALD J", "RUBIO, MARCO"],
			"geo_facet" : ["TEXAS"],
			"media" : [{
					"type" : "image",
					"subtype" : "photo",
					"caption" : "Senator Ted Cruz greeted supporters at a campaign rally in Houston on Wednesday.",
					"copyright" : "Eric Thayer for The New York Times",
					"media-metadata" : [{
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-square320.jpg",
							"format" : "square320",
							"height" : 320,
							"width" : 320
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-thumbStandard.jpg",
							"format" : "Standard Thumbnail",
							"height" : 75,
							"width" : 75
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-articleInline.jpg",
							"format" : "Normal",
							"height" : 127,
							"width" : 190
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-sfSpan.jpg",
							"format" : "Large",
							"height" : 263,
							"width" : 395
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-jumbo.jpg",
							"format" : "Jumbo",
							"height" : 683,
							"width" : 1024
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-superJumbo.jpg",
							"format" : "superJumbo",
							"height" : 1365,
							"width" : 2048
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-square640.jpg",
							"format" : "square640",
							"height" : 640,
							"width" : 640
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-thumbLarge.jpg",
							"format" : "Large Thumbnail",
							"height" : 150,
							"width" : 150
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-mediumThreeByTwo210.jpg",
							"format" : "mediumThreeByTwo210",
							"height" : 140,
							"width" : 210
						}, {
							"url" : "http:\/\/static01.nyt.com\/images\/2016\/02\/25\/us\/26CRUZTEXASweb2\/26CRUZTEXASweb2-mediumThreeByTwo440.jpg",
							"format" : "mediumThreeByTwo440",
							"height" : 293,
							"width" : 440
						}
					]
				}
			]
		}
	]
};