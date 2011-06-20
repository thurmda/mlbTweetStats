var TwitterNode = require('twitter-node').TwitterNode,
	mongodb = require('mongodb'),
	config = require('./lib/config.js'),
	tweets, metrics, stream,
	rxHashtags = /(#\w+)/g,	  
	txt2track = [];
for(team in config.teams){
	txt2track.push('#'+team);
}
function minuteKey(){
	return JSON.stringify(new Date()).substring(1,18)+'00';
}
var processTweet = function(tweet){
	var geo, hashtags,
		tweetLog = {
			ts : new Date(),
			ht : [],
			u : tweet.user.screen_name,
			txt : tweet.text
		}
	if(hashtags = tweetLog.txt.match(rxHashtags)){
		var teamMetricKeys = {};
		hashtags.forEach(function(ht){
			var lcHashtag = ht.toLowerCase().substring(1); 
			if(lcHashtag in config.teams){
				tweetLog.ht.push(lcHashtag);
				teamMetricKeys['team.'+lcHashtag] = 1;
			}
			});
		var t = JSON.stringify(tweet);
		if(geo = t.match(/[0-9.-]{8,},[0-9.-]{8,}/gi)){
			tweetLog.lc = geo;
		}
		console.log(JSON.stringify(tweetLog));
		tweets.insert(tweetLog);		
		metrics.update({t: minuteKey()}, {$inc: teamMetricKeys}, {upsert:true});
	}
}

new mongodb.Db('mlb', new mongodb.Server(config.mongodb.host, config.mongodb.port, {}),{})
	.open(function (error, client) {
		  if (error) throw error;
		  tweets = new mongodb.Collection(client, 'tweets');
		  metrics = new mongodb.Collection(client, 'metrics');
		  stream = new TwitterNode({
			  user: config.twitter.screen_name, 
			  password: config.twitter.password,
			  track: txt2track
			})
			  .addListener('error', function(error) {
				console.log(error.message);
			  })
			  .addListener('tweet', processTweet)
			  .addListener('end', function(resp) {
				  console.log("Twitter Stream ended... " + resp.statusCode);
			  })
			  .stream();
		});