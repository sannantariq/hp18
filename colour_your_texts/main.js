var context_win = 3;
var topic_dists = []
var prev_topic = 0;
var messages = new Array();

var context2colors = {0: "#44BEC7", 1: "#FFC300", 2: "#FA3C4C", 3: "#D696BB", 4: "#6699CC", 5: "#13CF13", 6: "#FF7E29", 7: "#E68585", 8: "#7646FF", 9: "#20CEF5",
		      10:"#67B868", 11:"#D4A88C", 12:"#FF5CA1", 13:"#A69FC7", 14:"#FA5C6B", 15:"#4C4F3E", 16:"#372B36", 17:"#07074C", 18:"#6D0000",19: "#032946",
		      20:"#6C6D00"};

var curr_contexts = new Set();
var context2keywords = {};

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

function getMax(dist){
    // console.log(dist);
    var maxVal = Number.MIN_VALUE;
    var term;
    for(var k in dist){
        if (dist[k] > maxVal){
            maxVal = dist[k];
            term = k;
        }
    }
    return term;
}

function rest_state() {
    context_win = 3;
    topic_dists = []
    prev_topic = 0;
    messages = new Array();
}

function extendMessage(msg, n){
    var split = msg.split(" ");
    var terms = []
    for(var i=0; i<split.length; i++){
        var exp_terms = Word2VecUtils.findSimilarWords(n, split[i]);
        for(var j=0; j < exp_terms.length; j++) terms.push(exp_terms[j][0]);
    }
    msg += terms.join(" ");
    return msg;
}

function process_stream(msg){
    // if(msg.split(" ").length < 3) return -1;
    //msg = extendMessage(msg, 5);
    // console.log(msg);
    messages.push(msg);
    if (messages.length >= context_win){
        ctx = messages.join('.');
        // console.log(ctx);
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
            return [0, getMax(topic_dists[0])];
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
                return [topic_dists.length - 1, getMax(topic_dists[topic_dists.length - 1])];
            }
            else{
                sum(topic_dists[min_idx], 0.75, dist, 0.25);
                prev_topic = min_idx;
                return [min_idx, getMax(topic_dists[min_idx])];
            }           
        }
    }
    else{
        return [-1, null];
    }
}


/*
This function will be used to create buttons for contexts
 */

function changeDivColor(divMessageElement){
    //console.log(divMessageElement);
    divMessageElementChild = divMessageElement.childNodes[0];
    aok = divMessageElementChild.getElementsByClassName('_aok')[0];
    aok.style.color="white";
    text = aok.querySelectorAll('._30h-,._58nk')[0].innerHTML;
    //console.log(text);
    //cluster = getClusterId(text);
    clusterLst = process_stream(text); //getCluster(21);
    cluster = clusterLst[0];
    keyword = clusterLst[1];
    curr_contexts.add(keyword);
    assignedColor = context2colors[cluster];
    divMessageElementChild.style.backgroundColor = context2colors[cluster];
}

setTimeout(startObserver, 5000);
var data = [];

function bigSubscriber(mutations) {
    var prev_observer = null;
    var first_mutation = mutations[0];
    var new_node = first_mutation.addedNodes[0].getElementsByClassName('_41ud')[0];
    var new_node_header = new_node.getElementsByClassName('_ih3')[0];
    var new_node_messages = new_node.querySelectorAll('.clearfix,._o46,._3erg,._29_7,.direction_ltr,.text_align_ltr');
    latest_message = new_node_messages[new_node_messages.length - 1];
    data.push(latest_message);

    if (prev_observer != null) {
        prev_observer.disconnect();
    }
    prev_observer = new MutationObserver(smallSubscriber);
    var config = {childList: true};
    prev_observer.observe(new_node, config);
    changeDivColor(latest_message);
}

function smallSubscriber(mutations) {
    parent = mutations[0].target;
    var new_node_messages = parent.querySelectorAll('.clearfix,._o46,._3erg,._29_7,.direction_ltr,.text_align_ltr')
    latest_message = new_node_messages[new_node_messages.length - 1];
    data.push(latest_message);
    changeDivColor(latest_message);
}
 
// pass in the target node, as well as the observer options
function startObserver () {
    // select the target node

    var target = document.querySelector('#js_1');
    //console.log(target)
    // var messages = target.getElementsByClassName('_1t_p clearfix')
    // console.log(messages)

    var observer = new MutationObserver(bigSubscriber);
    var last_message_target = target.getElementsByClassName('_41ud');
    last_message_target = last_message_target[last_message_target.length - 1];
    
    
    // configuration of the observer:
    var config = {childList: true};
    last_msg_observer = new MutationObserver(smallSubscriber);

    last_msg_observer.observe(last_message_target, config);
    observer.observe(target, config);
};