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
	"Pittsburgh to Princeton costs $200.",
	"Thats, way too expensive!!",
	"Lets, do greyhound then."
]

// var text =[
// 	"Cats are small.",
// 	"Dogs are big.", 
// 	"Cats like to chase mice.",
// 	"Dogs like to eat bones."
// ]

var context_win = 3;
var topic_dists = []
var prev_topic = 0;
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
	var keys = []
	for(var k in a) keys.push(k);	
	for(var k in b) keys.push(k);	
	for (var k of keys){
		if (k in a) sum[k] = m1 * ((sum[k] || 0) + a[k]);		
		if (k in b) sum[k] = m2 * ((sum[k] || 0) + b[k]);
	}	
	return sum;
}
function jensen_shannon(a, b){
	var M = sum(a, 0.5, b, 0.5)
	// console.log(a);
	// console.log(b);
	// console.log(M);
	return 0.5 * (kl(a, M) + kl(b, M))
}

function klAll(arr, b){
	var div = [];
	for (var a in arr){
		div.push(kl(a,b))
	}
	return b;
}

function jsAll(arr, b){
	// console.log(arr);
	var div = [];
	for (var i=0; i<arr.length; i++){
		div.push(jensen_shannon(arr[i],b))
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

function argmax(a){
	var max = Number.MIN_VALUE;
	var idx = -1;

	for (var i=0; i < a.length; i++){
		if (a[i] > max){
			max = a[i];
			idx = i;
		}		
	}
	return [max, idx];
}


function softmin(arr, scale_idx, scale_factor) {
	var exp = [];
	var sm = [];
	var sum = 0;
	for (var v of arr){
		console.log(v);
		var e = Math.exp(-1 * v);
		exp.push(e);
		sum += e;
	}
	for (var i=0; i<exp.length; i++){
		if (scale_idx){
			if (i === scale_idx) sm.push(scale_factor * exp[i]/sum);
			else sm.push((1-scale_factor)/(exp.length-1) * exp[i]/sum);
		}
		else sm.push(exp[i]/sum);
	}
	return sm;
}

function rest_state() {
	context_win = 3;
	topic_dists = []
	prev_topic = 0;
	messages = new Array();
}

function process_stream(msg){
	// if(msg.split(" ").length < 3) return -1;
	messages.push(msg);
	if (messages.length >= context_win){
		ctx = messages.join('.');
		console.log(ctx);
		var result = process(messages, 2, 3);
		console.log(result);	
		messages.shift();
		// console.log(sum(result[0],1,result[1],1))
		console.log(topic_dists);
		var div0 = jsAll(topic_dists, result[0])
		var div1 = jsAll(topic_dists, result[1])
		var min_div0 = argmin(div0)[0];
		var min_div1 = argmin(div1)[0];
		var dist;
		
		if (min_div0 < min_div1) dist = result[0];
		else dist = result[1];

		// dist = result[0];

		if (topic_dists.length === 0) {
			topic_dists.push(dist);
			prev_topic = 0;
			return 0;
		}
		else{
			var divs = [];
			for (var t of topic_dists){				
				divs.push(jensen_shannon(dist, t));
			}
			// divs[prev_topic] *= 1/1.001;
			// console.log(divs);			
			// divs = softmin(divs);
			var mins = argmin(divs);
			var min_idx = mins[1];
			var min_div = mins[0];
			// var maxs = argmax(divs);

			console.log("min_div:" + min_div + " min_idx:"+min_idx)
			// console.log(softmin(divs));
			if (min_div > 0.34){
				topic_dists.push(dist)
				prev_topic = topic_dists.length - 1;
				return topic_dists.length - 1;
			}
			else{
				sum(topic_dists[min_idx], 0.75, dist, 0.25);
				prev_topic = min_idx;
				return min_idx;
			}			
		}
	}
	else{
		return -1;
	}
}

for(var i=0; i<text.length; i++){
	msg = text[i];	
	console.log(process_stream(msg));
}

// var d1 = {greyhound: 0.24, expensive: 0.23, princeton: 0.13};
// var d2 = {fine: 0.34, dinner: 0.33, air: 0.33};
// console.log(jensen_shannon(d2,d2));

// Run LDA to get terms for 2 topics (5 terms each).
// var result = process(documents, 2, 5);

// console.log(result);
