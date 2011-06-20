var socket = new io.Socket(); //in global scope to make console access easy in dev 
$(function(){	
		var hello = function(){socket.send('range');}
		var bye = function(){ console.log('dis'); }
		var recieve = function(data){
			if(!data || !data.re){
				console.log('?????');
				console.dir(data);
				return;
			}
			console.log(data.re);
			switch(data.re){
			case 'hello':
			case 'hour':
				if(data.d)
					render(mapData(data));
				break;
			case 'range':
				renderTimeline(data);
				break;
			default:
				console.dir(data);
				break;
			}
		}
		socket.connect();
		 socket.on('connect', hello); 
		 socket.on('message', recieve); 
		 socket.on('disconnect', bye);
	
	 var mapData = function(data){
		 var team, d = {};
		 
		 for(var i=0; i<data.d.length; i++){
			 var m = data.d[i];
			 for(team in m.team){
				 if(d[team]){
					 d[team] += m.team[team];
				 }else{
					 d[team] = m.team[team];
				 }
			 }
		 }
		 console.dir(d);
		 return d;
	 }

	 var renderTimeline = function(data){
		 console.dir(data);
		 $('#timeline').html('');
		 for(var i=0; i<data.d.length; i++){
			$('#timeline').append('<div title="'+data.d[i].t.replace(/(.*)T(\d\d:00).*/,'$1 $2')+'"></div>')
		 }
		 $('#timeline div').click(fetchHour);
	 }
	 var fetchHour = function(ev){
		 
		 var hr = this.title.replace(/(.*) (\d\d:).*/,'$1T$2');
		 console.log('fetching hour :'+ hr);
		 socket.send('hour '+hr);
	 }

	 
	 
	 var w = $(window).width() - 16,
	 	 h = $(window).height(),
	 	 bh = h * .8,
	 	 bw = .96 * w / 30;

	 var x = d3.scale.linear()
	 	.domain([0, 1])
	 	.range([0, bw]);
	 var y = d3.scale.linear()
	 	.domain([0, 100])
		.rangeRound([0, bh]);
	 
	 var chart = d3.select("body")
	   .append("svg:svg")
	   .attr("class", "chart")
	   .attr("width", w )
	   .attr("height", h - 100);	 
	 var data = [];
	 for(var i = 0; i<30; i++) data.push({team:'', value:0});
	 chart.selectAll("rect")
     .data()
     .enter().append("svg:rect")
     .attr("x", function(d, i) { return x(i) - .5; })
     .attr("y", function(d) { return bh - y(d.value) - .5; })
     .attr("width", bw)
     .attr("height", function(d) { return y(d.value); });
	 
	 function render (d){
	     $("svg").remove();
		 var team, data = [],total = 0;
	 }	 
	 
});