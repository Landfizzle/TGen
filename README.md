# TGen

TGen creates questions similar to questions found on various English tests. 

The sentences are chosen from the NYTimes API, and the individual words are processed or retrieved from Wordnik API. The logic is basically: Find the rarest word in the sentence. If it is a noun and has no alternative definitions, then it will be the answer. Then 3 random nouns are chosen of similar rarity and length. 

Origin story:
As my job I wrote ESL tests for the past year. Part of my work was writing questions similar to the ones TGen creates. I was curious if I could automate that part of my day.

--
Round 2!


Changelog:

All function declarations have been replaced with function expressions.
The switch statement in checkAnswer in the DOMstuff file has been replaced with an object literal method.
For loops have been replaced with map, reduce, filter or forEach where appropriate.
The shuffle algorithm has been condensed to one function and trimmed by about twenty lines, thanks to Underscore.

This is the feedback from Hack Reactor.

Consider using function expressions over declarations in JS. Take a look at this article
https://javascriptweblog.wordpress.com/2010/07/06/function-declarations-vs-function-expressions/
Switch statements are not best practice. Use an object literal pattern to lookup values (your MC answer file)
https://toddmotto.com/deprecating-the-switch-statement-for-object-literals/
If you’re ever creating an array from a collection, use map or reduce. If you’re filtering, use…filter.
Your shuffle algorithm can be made more elegant. Have you considered using underscore’s native shuffle method?
http://underscorejs.org/#shuffle
