 /**
  given a distribution. dictionary of word to a probability. A number of distribution. 
  For lop over the existing topics. And then caluclate their divergence. Lowest dveergence. If this divergene is 
  lower than a threshold, this belong to the same topic. Mean of the vectors.
  **/
  this.topic_distribution = [{"fox" : {"fox" : 0.16, "hunt": 0.12}, {"parrot" : {"fly": 0.11, "you":0.02}}] 
  this.threshold = 0.0001;

  this.pickMinDivergence(divergences){
      var index_min_divergence = [];
      var min_divergence = []; 
      for (var i; i< divergences.length; i++){
        var min_div_sentence = Number.MAX_VALUE;
        var min_div_index = 0;

        for (var j; j<divergences[i].length; j++){
            var d = divergences[i][j];
            if (d < min_div_sentence){
              min_div_sentence = d;
              min_div_index = j;
            }
        }
        index_min_divergence.push(j); 
        min_divergence.push(min_div_sentence);
      }    
      return [index_min_divergence , min_divergence] ;
  }

  this.chooseTopic(thisSentenceDistributions){

    divergences = [];
    // Loop over the sentnece distributions
      for (var i; i<thisSentenceDistributions.length; i++){
        thisSentenceDivergence = [];
        // Loop over the topics
          for (var j; j<this.topic_distribution.length; j++){
              var d = KL(thisSentenceDistributions[i], this.topic_distribution[j]);
              thisSentenceDivergence.push(d);
          }
          divergences.push(thisSentenceDivergence);
      }

      min_divergences = pickMinDivergence(divergences);
      index_min_divergence , min_divergence = min_divergences[0], min_divergences[1];
      
  }

// // var text = 'Cats are small. Dogs are big. Cats like to chase mice. Dogs like to eat bones.';
// var text = 'fox rules blue moon. fox is blue jeans in butter. football is nice in shorts. football sucks when rains.';

// // Extract sentences.
// var documents = text.match( /[^\.!\?]+[\.!\?]+/g );
// console.log(text);
// console.log(documents);
// // Run LDA to get terms for 2 topics (5 terms each).
// var result = process(documents, 2, 2);
// console.log(result);
// // module.exports = process;
