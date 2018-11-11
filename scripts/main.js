// var lda = requirejs(["lda/lib/index"], function(util) {});

// Example document.

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

function kl(a, b){
	var div = 0;
	var eps = 1e-8;
	for(var k in a){
		var p = a[k];
		var q = 0;
		if (k in b){
			q = b[k]
			div -= p * math.log(q/p);	
		}	
	}
	return div;
}
function sum(a, m1, b, m2){
	var sum = {};
	for(var e1 in a){
		var p = a[e1];
		var q = 0;
		if (e1 in b){
			q = b[e1]			
		}
		sum[e1] = p*m1 + q*m2;
	}
	for(var e2 in b){
		var q = a[e2];
		if (!(e2 in b)){
			sum[e2] = q*m2;
		}		
	}
	return sum;
}
function jensen_shannon(a, b){
	var M = sum(a, 0.5, b, 0.5)
	// console.log(a);
	// console.log(b);
	// console.log(M);
	return 0.5 * kl(a, M) + kl(b, M)
}

function klAll(arr, b){
	var div = [];
	for (var a in arr){
		div.push(kl(a,b))
	}
	return b;
}
function argmin(a){
	var min = Number.MAX_VALUE;
	var idx = -1;

	for (var i=0; i < a.length; i++){
		if (a[i] < min){
			min = a[i];
			idx = i;
		}		
	}
	return [min, idx];
}


function process_stream(msg){
	messages.push(msg);
	if (messages.length >= context_win){
		ctx = messages.join('.');
		console.log(ctx);
		var result = process(messages, 2, 3);
		// console.log(result);	
		messages.shift();
		// console.log(sum(result[0],1,result[1],1))
		// console.log(topic_dists);
		if (topic_dists.length === 0) {
			topic_dists.push(result[0]);
			return 0;
		}
		else{
			var divs = [];
			for (var t of topic_dists){				
				divs.push(jensen_shannon(result[0], t));
			}
			var mins = argmin(divs);
			var min_idx = mins[1];
			var min_div = mins[0];
			console.log("min_div:" + min_div + " min_idx:"+min_idx)
			if (min_div > 0.34){
				topic_dists.push(result[0])
				return topic_dists.length - 1;
			}
			return min_idx;
		}
		// break;
	}
}

for(var i=0; i<text.length; i++){
	msg = text[i];	
	console.log(process_stream(msg));
}


// Run LDA to get terms for 2 topics (5 terms each).
// var result = process(documents, 2, 5);

// console.log(result);
