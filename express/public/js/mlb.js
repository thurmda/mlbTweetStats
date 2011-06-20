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
		 $($('#timeline div')[0]).trigger('click');
	 }
	 var fetchHour = function(ev){
		 var hr = this.title.replace(/(.*) (\d\d:).*/,'$1T$2');
		 console.log('fetching hour :'+ hr);
		 socket.send('hour '+hr);
	 }
	 //graphs
	 
	 var safeSize = Math.min($(window).height(),$(window).width()) *.85,
	 	radius = safeSize/2,
	 	color = d3.scale.category20(),
	 	arc = d3.svg.arc().innerRadius(radius * .5).outerRadius(radius),
	 	donut = d3.layout.pie();

	 var render = function(d){
	     $("svg").remove();
		 var team, data = [];
		 var total = 0;
		 for(team in d){
			 data.push(d[team]);
			 total += d[team];
		 }

		 var vis = d3.select("body")
		   .append("svg:svg")
		   .data([data.sort(d3.descending)])
		   .attr("width", safeSize)
		   .attr("height", safeSize);
	
		 var arcs = vis.selectAll("g.arc")
		   .data(donut)
		   .enter().append("svg:g")
		   .attr("class", "arc")
		   .attr("transform", "translate(" + radius + "," + radius + ")");
	
		 var paths = arcs.append("svg:path")
		 	.attr("fill", function(d,i){return "hsl(" + (i * 8)  + ",80%,50%)";})
		 	.attr("d", arc);
	
			 paths.transition()
			 	.ease("bounce")
			 	.duration(2000)
			 	.attrTween("d", tweenPie);
				 function tweenPie(b) {
					 	b.innerRadius = 0;
					 	var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
					 	return function(t) {
					 		return arc(i(t));
					 	};
					 }			 
		 var txt = arcs.append("svg:text")
		 	.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		 	.attr("dy", ".35em")
		 	.attr("opacity", ".001")
		 	.attr("text-anchor", "middle")
		 	.attr("display", function(d) { return d.value/total > .02 ? null : "none"; })
		 	.text(function(d, i) { 
		 		
		 		return Math.floor(d.value); });
	
			 txt.transition()
			 	.delay(function(d, i) { return 2000 + i * 50; })
			     .duration(750)
			     .attr("opacity", "0.6");
//	setInterval(function(){
//		var i;
//		var tot = 0;
//		var TOT = 0;
//		for(i=0;i<data.length;i++){
//			data[i] += (-.5 + Math.random() ) * .32 * data[i];
//			tot += data[i]; 
//		}
//		vis.data(data);
//		arcs.transition();
//		var lastAngle = 0;
//		paths.transition()
//				.ease("bounce")
//			 	.duration(2000)			 	
//				 	.attrTween("d", tweenPie);
//					 function tweenPie(b,i) {
//						 var ang = 2 * Math.PI * (data[i] / tot);
//						 TOT += b.value;
//						 var angles = {
//								 startAngle: lastAngle,
//								 endAngle: lastAngle + ang}
//						 lastAngle = angles.endAngle;
//						 	var r = d3.interpolate({startAngle:b.startAngle,endAngle:b.endAngle}, angles);
//						 	return function(t) {
//						 		return arc(r(t));
//						 	};
//						 };
//		
//		txt
//		.data(data)
//		.text(function(d, i) { 
//			return  Math.floor(d); });
//		console.log('updated data');
//	},3000);
	}
});