// var lda = requirejs(["lda/lib/index"], function(util) {});

// Example document.

function kl(a, b){
	var div = 0;
	for(var k in a){
		var p = a[k];
		if (k in b){
			var q = b[k]
			div -= p * math.log(q/p);
		}
	}
	return div
}

function jensen_shannon(a, b){
	return 0.5 * kl(a, b) + kl(b, a)
}

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
var messages = new Array();


function process_stream(msg){
	messages.push(msg);
	if (messages.length >= context_win){
		ctx = messages.join('.');
		console.log(ctx);
		var result = process(messages, 2, 3);
		console.log(result);
		console.log(kl(result[0], result[1]));
		messages.shift();
		// break;
	}
}

for(var i=0; i<text.length; i++){
	msg = text[i];	
	process_stream(msg)
}


// Run LDA to get terms for 2 topics (5 terms each).
// var result = process(documents, 2, 5);

// console.log(result);
