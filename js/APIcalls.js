const WORDNIK_API_KEY = "1706e28b8263086fd200e031a760a3d2c64f01948c34d3499";
var url;

var getSentences = function () {
	console.log("getSentences called");
	
	//NYT most popular from today
	url = "https://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/1.json?api-key=458160046a89adbe1794a152b13ef268:10:67481050";
	
	getData(url, buildListOfSentences);
};

var assignDataToWords = function() {
	console.log("assignDataToWords called");
	
	//Get frequency. Im calling this with canonical turned off because  "pushed" != "push" and it causes problems with the checks. If I fixed that it would make it more accurate, though
	wordsInSentence.forEach(function(item) {
		url = 
		"http://api.wordnik.com:80/v4/word.json/" + 
		item.word + 
		"/frequency?useCanonical=false&startYear=1960&endYear=2012&api_key=" + 
		WORDNIK_API_KEY;

		getData(url, assignFrequency);
	});
	

	//Figure out if the word is only a noun 
	wordsInSentence.forEach(function(item) {
		
		url = 
		"http://api.wordnik.com:80/v4/word.json/" + 
		item.word + 		"/definitions?limit=200&includeRelated=false&sourceDictionaries=wiktionary&useCanonical=false&includeTags=false&api_key=" + 
		WORDNIK_API_KEY;

		getData(url, assignOnlyNoun);
	});
};

var getData = function(url, callback, optional) {

			console.log("getData called");
			var 
			xhr = new XMLHttpRequest(),
			data;
			
			xhr.open("GET", url, true);
			xhr.send();
			
			xhr.onreadystatechange = function() {
				if(xhr.readyState===4 && xhr.status===200) {
					callback(JSON.parse(xhr.responseText), optional);
				}			
				if(xhr.readyState===4 && xhr.status!==200) {
					alert("There was an error (Most likely a connection time out error). The page will refresh. Please try again.");
					location.reload(true);
				}						
			};
	
};
