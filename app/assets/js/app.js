var app = app || {};

app.main = (function(){

    var width  = window.innerWidth;
    var height = window.innerHeight;
    var svg;		// SVG object
    var courses;	// Course data loaded async with subject data

	/*------------------ CATEGORIES -------------------*/
	// Categories change from term to term. Think about how to handle arc updates
	var loadCategories = function(){
		d3.csv('assets/data/fall_2015_path_of_study.tsv', function(error, data) {
			if (error) return console.warn(error);
			console.log('Loaded categories:');
			console.log(data);
			console.log('Checking number of lines...');
			for(var i = 0; i < data.length; i++){
				data[i] = checkLines(data[i]);
			}
			console.log(data);
			displayCategories(data);
		});

		var checkLines = function(_obj){
			var obj = _obj;
			if(obj['path_of_study'].indexOf(' ') > -1){
				obj['1stLine'] = obj['path_of_study'].substring(0, obj['path_of_study'].indexOf(" "));
				obj['2ndLine'] = obj['path_of_study'].substring(obj['path_of_study'].indexOf(" ") + 1, obj['path_of_study'].length);
			}else{
				obj['1stLine'] = obj['path_of_study'];
			}
			return obj;
		};		
	};

	var displayCategories = function(dataset){

		// VARS
		var radius = 490/2;
		var arcWeight = (550 - 490)/2;
    	var anchors = [];	// Arcs coordinates; Will compute after drawing them

		// FUNCTIONS
		// D3's SVG shape helper function
		var arc = d3.svg.arc()
				    .outerRadius(radius)
				    .innerRadius(radius + arcWeight);

		// D3's data helper function
		var pie = d3.layout.pie()
				    .sort(null)
				    .value(function(d, i) { return 1; }); // Any value would do. We're just telling D3 that all arcs are equal
		// console.log(pie(dataset));

		svg = d3.select("body")
            .append("svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            ;

		var categoriesChart = svg.append("g")
			.attr('id', 'categories-chart')
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")")
			;
		
		// Each combo of arc and text will be inside this group
		var g = categoriesChart.selectAll(".arc")
			.data(pie(dataset))
			.enter()
			.append("g")
			.attr("class", "arc")
			;

		// Arcs
	  	var arcs = g.append("path")
			.attr("d", arc)
			.attr("id", function(d, i){
				return 'arc_' + i;
			})
			.style("fill", function(d, i){
				return 'hsla(180, 50%, 50%, ' + (i / 10) +')'	
			})
			.on('click', function(d, i){
				//
				var filterered = filterCoursesBy(d.data.path_of_study);
				displayCourses(filterered);
			})
			// Compute coords so we can draw the network later
			.each(function(d, i){
				var arcPosition = this.getPointAtLength(this.getTotalLength()*0.7);
				anchors.push({
					title: d.data.path_of_study,
					x: arcPosition.x,
					y: arcPosition.y
				});
			})
			;
		// console.log(anchors);

		// Labels
		// <text>
		var text = g.append("text")
		
			// <textPath>
			var textPath = text.append("textPath")		
			    .attr("xlink:href",	function(d, i){
			    	return '#arc_' + i;
			    })
			    .attr("startOffset", 35)
			    ;

				// <tspan> 1stLine
				textPath.append('tspan')
					.text(function(d, i){
							return d.data['1stLine'];
					})
					.attr("dy", function(d, i){
						if(!d.data.hasOwnProperty('2ndLine')){
							return arcWeight/2;
						}else{
							return arcWeight/3;
						}
					})
				// <tspan> 2ndLine
				.each(function(d){
					// console.log(d3.select(this));
					if(d.data.hasOwnProperty('2ndLine')){
						var parent = d3.select(this.parentNode);
						var firstLineWidth = this.parentNode.getComputedTextLength();
						parent.append('tspan')
							.text(function(d, i){
									return d.data['2ndLine'];
							})
							.each(function(d){
								var secondLineWidth = this.getComputedTextLength();
								d3.select(this).attr("dx", -(firstLineWidth + secondLineWidth)/2)
											   .attr("dy", arcWeight/3)
											   ;
							})
							;
					}
				})
				;

		// function getAnchors(arcs){
		// 	var anchors = [];
		// 	arcs.each(function(d, i){
		// 		// console.log(this);
		// 		var arcPosition = this.getPointAtLength(this.getTotalLength()*0.7);
		// 		anchors.push({
		// 			title: d.data.title,
		// 			x: arcPosition.x,
		// 			y: arcPosition.y
		// 		});
		// 		// // console.log(coords);
		// 		// categoriesChart.append('circle')
		// 		// 	.attr('cx', arcPosition.x)
		// 		// 	.attr('cy', arcPosition.y)
		// 		// 	.attr('r', 20)
		// 		// 	.attr('fill', 'black')
		// 		// ;
		// 	})
		// 	;
		// 	return anchors;
		// }
	}

	/*-------------------- COURSES --------------------*/
	var loadCourses = function(){
		d3.json('assets/data/lang_courses_fall_2015.json', function(error, data) {
			if (error) return console.warn(error);
			console.log('Loaded courses:');
			console.log(data);
			courses = data;
		});
	};

	var filterCoursesBy = function(pathOfStudy){
		var filteredCourses = [];
		for(var courseNumber in courses){
			if(courses[courseNumber]['path_of_study'].indexOf(pathOfStudy) > -1){
				// console.log(courses[courseNumber]['path_of_study']);
				filteredCourses.push({
					courseNumber: courseNumber,
					title: courses[courseNumber]['title'],
					path_of_study: courses[courseNumber]['path_of_study']
				});
			}
		}
		// console.log(filteredCourses);
		return filteredCourses;
	};

	var displayCourses = function(data, coords){
		console.log('Called displayCourses');
		// console.log(data);

		// Layout
		var radius = 12;
		var linkDist = width/7;

		// Data
		var nodes = data;
		var anchor = {};
		nodes.unshift(anchor);

		// Adding a radius to our objects
		for(var i = 0; i < nodes.length; i++){
			nodes[i]['radius'] = 12;
		};
		console.log(nodes);

		var links = [];
		for(var i = 1; i < nodes.length; i++){
			var obj = { source:0, target:i, value: 1 };
			links.push(obj);
		}
		console.log(links);

		var force = d3.layout.force()
		    .gravity(0.05)
		    .charge(function(d, i) {
		    	// Same as: if(i > 0) { 0 } else { 1000 }
		    	return i ? 0 : -1000;
		    	// Which means:
		    	// * the first node (anchor) will repel all other ones (-1000)
		    	// * the others don't repel each other
		    })
		    .nodes(nodes)
		    .links(links)
		    .linkDistance(linkDist)	// standard link length
		    .linkStrength(0.1)		// how flexible the links are
		    .size([width, height])
		    ;

		nodes[0].fixed = true;
		nodes[0].x = coords.x + width/2;
		nodes[0].y = coords.y + height/2;

		force.start();
		
		var coursesChart = svg.append("g")
			.attr('id', 'courses-chart')		
			;
	
		var circles = coursesChart.selectAll("circle")
			.data(nodes)
			.enter()
			.append("circle")
		    .attr("r", radius)
		    .attr("id", function(d, i){
		    	return d.title;
		    })		    
		    .style("fill", function(d, i){
		    	return i ? 'hsla(0, 50%, 50%, 0.5)' : 'black';
		    })
		    .on('click', function(d, i){
		    	console.log(d);
		    })
		    ;

		var link = coursesChart.selectAll(".link")
      		.data(links)
    		.enter()
    		.append("line")
      		.attr("class", "link")
      		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

		force.on("tick", function(e) {
			var q = d3.geom.quadtree(nodes),
				i = 0,
				n = nodes.length;

			while (++i < n) q.visit(collide(nodes[i]));

			coursesChart.selectAll("circle")
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });

			link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
		});	

		function collide(node) {
		  var r = node.radius + 16,
		      nx1 = node.x - r,
		      nx2 = node.x + r,
		      ny1 = node.y - r,
		      ny2 = node.y + r;
		  return function(quad, x1, y1, x2, y2) {
		    if (quad.point && (quad.point !== node)) {
		      var x = node.x - quad.point.x,
		          y = node.y - quad.point.y,
		          l = Math.sqrt(x * x + y * y),
		          r = node.radius + quad.point.radius;
		      if (l < r) {
		        l = (l - r) / l * .5;
		        node.x -= x *= l;
		        node.y -= y *= l;
		        quad.point.x += x;
		        quad.point.y += y;
		      }
		    }
		    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		  };
		}		    
	};	

	var init = function(){
		console.log('Called init');
		loadCategories();
		loadCourses();
	};

	return {
		init: init
	};
})();

/* Wait for all elements on the page to load */
window.addEventListener('DOMContentLoaded', app.main.init);