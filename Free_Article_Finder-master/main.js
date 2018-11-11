
var results = document.getElementsByClassName('gs_r');

var callback = function(mutationsList, observer) {
    for(var mutation of mutationsList) {
        console.log(mutation)
        if (mutation.type == 'childList') {
            var nodes = mutation.addedNodes;
            for(var node of nodes){
                console.log(node)
                var observer = new MutationObserver(callback);
                var config = { childList: true };
                observer.observe(node, config);
            }
            console.log('A child node has been added or removed.');
        }
        else if (mutation.type == 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};

document.onreadystatechange = function () {
    console.log(document.readyState)
    if (document.readyState === "complete") {
        console.log(document.getElementsByClassName('_aok'));
        setTimeout(function(){ 
            var d = document.querySelector('#js_1');
            console.log(d);
            var observer = new MutationObserver(callback);
            var config = { childList: true };
            observer.observe(d, config);
        }, 3000);        
    }
}

for(var i = 0; i < results.length; i++) {
    var link = results[i]
    if(link.getElementsByClassName('gs_ri')[0]) {
        link = link.getElementsByClassName('gs_ri')[0].getElementsByClassName('gs_rt')[0]

        injectLoad(i)
        if(link.getElementsByTagName('a')[0])
            checkFreedom(link.getElementsByTagName('a')[0].getAttribute('href'), i)
        else
            removeLoad(i)
    }
}

function checkFreedom(link, index) {
	chrome.runtime.sendMessage({
		method: 'GET',
		action: 'xhttp',
		url: link,
        data: ""
    }, function (response) {
        /*
        var div = document.createElement('div');
        div.innerHTML = response;
        */
        var criterias = ['Introduction', 'Methods', 'General procedure', 'Discussion', 'Results', 'Conclusions']

        var found = 0
        criterias.forEach(function(e) {
            found += searchCriteria(response, e)
        });

        found += 3*searchCriteria(response, "Download PDF")

        //If the article is found to be valid, include the free next to it
        injectFreedom(index, (found/(criterias.length + 1))*100)

        removeLoad(index)
	});
}

function searchCriteria(site, criteria) {
    return (site.search(criteria) != -1) ? 1 : 0;
}

function injectLoad(index) {
    var results = document.getElementsByClassName('gs_r');
    var cur = results[index].getElementsByClassName('gs_ri')[0].getElementsByClassName('gs_rt')[0]

    cur.innerHTML = "<img src='" + chrome.extension.getURL('ripple.gif') + "'/>" + cur.innerHTML;
}

function removeLoad(index, chance) {
    var results = document.getElementsByClassName('gs_r');
    var cur = results[index].getElementsByClassName('gs_ri')[0].getElementsByClassName('gs_rt')[0]
    var child = cur.getElementsByTagName('img')

    cur.removeChild(child[0])
}

function injectFreedom(index, chance) {
    var results = document.getElementsByClassName('gs_r');
    var cur = results[index].getElementsByClassName('gs_ri')[0].getElementsByClassName('gs_rt')[0]
    if(chance > 99)
        chance = 99 
    else if(!chance)
        chance = 1

    cur.innerHTML = "<h3 style='color: red; font-size: 20px;'><strong>~" + chance.toFixed(0) + "% chance this article is free~ </strong></h3>" + cur.innerHTML;
}
