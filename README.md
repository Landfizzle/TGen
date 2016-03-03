# TGen

TGen creates questions similar to questions found on various English tests. 

The sentences are chosen from the NYTimes API, and the individual words are processed or retrieved from Wordnik API. The logic is basically: Find the rarest word in the sentence. If it is a noun and has no alternative definitions, then it will be the answer. Then 3 random nouns are chosen of similar rarity and length. 
