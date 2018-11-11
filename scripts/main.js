// var lda = requirejs(["lda/lib/index"], function(util) {});

// Example document.

// var jensen_shannon(){

// }
var text = [
	"hi",
	"hi",
	"How do we go to princeton?",
	"We should take greyhound.",
	"No, I say we go by air.",
	"Ok, fine.",
	"What should we have for dinner?",
	"Burger?",
	"Sure.",
	"Btw, Pittsburgh to Princeton costs $200.",
	"Thats, way too expensive!!",
	"Lets, do greyhound then."
]

// var text =[
// 	"Cats are small.",
// 	"Dogs are big.", 
// 	"Cats like to chase mice.",
// 	"Dogs like to eat bones."
// ]

context_win = 3;
topic_dists = []
var messages = []
for(var i=0; i<text.length; i++){
	msg = text[i];
	messages.push(msg);
	if (messages.length >= context_win){
		ctx = messages.join('.');
		console.log(ctx);
		var result = process(messages, 2, 3);
		console.log(result);
		messages.shift();
		// break;
	}
}
// Run LDA to get terms for 2 topics (5 terms each).
// var result = process(documents, 2, 5);

// console.log(result);
