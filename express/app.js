
/**
 * Module dependencies.
 */

var express = require('express'),
	io = require('socket.io'),
	mongodb = require('mongodb');

var tweets , metrics;

new mongodb.Db('mlb', new mongodb.Server("127.0.0.1", 27017, {}),{})
.open(function (error, client) {
	  if (error) throw error;
	  tweets = new mongodb.Collection(client, 'tweets');
	  metrics = new mongodb.Collection(client, 'metrics');
});

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
	  res.render('index', {
	    title: 'MLB Tweet Stats'
	  });
	});
app.get('/teams', function(req, res){
	  res.render('teams', {
		  title: 'Team Logos'		  
	  });
	});

app.get('/bar', function(req, res){
	  res.render('bar', {
		  title: 'Timeline'
	  });
	});

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);

var commandInterperter = function(mess){
	console.dir(mess);
	if(!(cmd = mess.match(/(\S+)/g)))
		return;
	console.dir(cmd);
	var minuteKey = function (){
		return JSON.stringify(new Date()).substring(1,18)+'00';
	}	
	var hourKey = function (){
		return JSON.stringify(new Date()).substring(1,15);
	}	
	var command = cmd[0];
	var response = {re: command};
	var client = this;
	var getMetrics = function(query, filter, client){
		metrics.find(query, filter).sort({t:1}).toArray(function(err, docs) {
		response.d = docs;
		client.send(response);
	  });
		
	}	
	switch (command) {
		case 'hello':
			getMetrics({t:new RegExp('^'+hourKey())},{_id:0}, client);
			break;
		case 'hour':
			getMetrics({t:new RegExp('^'+cmd[1])},{_id:0}, client);
			break;
		case 'range':
			//db.metrics.find({t:/2011-06-..T..:00:00/}, {_id:0, t:1})
			getMetrics({t:/^2011-..-..T..:00:00/},{_id:0, t:1}, client);
			break;
		default :
			response.err = 'unimplemented';
			client.send(response);
			break;
	}
}
//socket.io 
var socket = io.listen(app); 
socket.on('connection', function(client){ 
  client.on('message', commandInterperter ); 
}); 