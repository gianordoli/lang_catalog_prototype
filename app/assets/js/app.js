var app = app || {};

app.main = (function(){

    var width  = window.innerWidth;
    var height = window.innerHeight;
    var svg;		// SVG object
    var courses;	// Course data loaded async with subject data
    var filteredCourses; // Will keep track of user selections

	/*------------------ CATEGORIES -------------------*/
	// Categories change from term to term. Think about how to handle arc updates
	var loadPathsOfStudy = function(){
		// d3.csv('assets/data/fall_2015_path_of_study.tsv', function(error, data) {
		d3.json('assets/data/lang_paths_of_study_fall_2015.json', function(error, data) {			
			if (error) return console.warn(error);
			// console.log('Loaded categories:');
			// console.log(data);

			// 1. Converting to object
			var objData = [];
			for(var i = 0; i < data.length; i++){
				objData.push({
					path_of_study: data[i]
				})
			}

			// 2. Sorting alphabetically
			objData.sort(function(a, b){
			   return d3.ascending(a.path_of_study, b.path_of_study);
			});			
			
			// 3. Checking number of lines
			for(var i = 0; i < objData.length; i++){
				objData[i] = checkLines(objData[i]);
			}

			// console.log(data);
			displayCategories(objData);
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
			.attr('id', 'path-of-study-chart')
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")")
			;
		
		// Each combo of arc and text will be inside this group
		var g = categoriesChart.selectAll(".path-of-study")
			.data(pie(dataset))
			.enter()
			.append("g")
			.classed("path-of-study", true)
			;

		// Arcs
	  	var arcs = g.append("path")
			.attr("d", arc)
			.attr("id", function(d, i){
				return 'arc_' + i;
			})
			.on('click', function(d, i){

				// Toggle class
				d3.select(this).classed("selected", !d3.select(this).classed("selected"));
				
				// Filter data
				filteredCourses = _.filter(courses, function(o) {
					return o.path_of_study.indexOf(d.data.path_of_study) > -1;
				});

				// Display network
				displayCourses(anchors, d.data.path_of_study);
				
			})
			// Compute coords so we can draw the network later
			.each(function(d, i){
				var arcPosition = this.getPointAtLength(this.getTotalLength()*0.7);
				anchors.push({
					path_of_study: d.data.path_of_study,
					anchorX: arcPosition.x,
					anchorY: arcPosition.y,
					isAnchor: true
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
							return - arcWeight + arcWeight/2;
						}else{
							return - arcWeight + arcWeight/3;
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

		// Just a debug function, not really using it now
		function drawAnchors(){
			categoriesChart.selectAll("circle")
				.data(anchors)
				.enter()
				.append('circle')
				.attr('cx', function(d, i){
					return d.x;
				})
				.attr('cy', function(d, i){
					return d.y;
				})
				.attr('r', 20)
				.attr('fill', 'black')
			;
		}
	}

	/*-------------------- COURSES --------------------*/
	var loadCourses = function(){
		d3.json('assets/data/lang_courses_fall_2015.json', function(error, data) {
			if (error) return console.warn(error);
			// console.log('Loaded courses:');
			// console.log(data);
			courses = data;			// Won't change unless navigating to a different term
			filteredCourses = data; // Stores user's current selection
		});
	};

	// (list of courses, position of arcs, selected pathOfStudy)
	var displayCourses = function(anchors, selected){
		console.log('Called displayCourses');
		// console.log(data);
		// console.log(anchors);
		// console.log(selected);

		var radius, linkDist;	// LAYOUT
		var nodes, links;		// DATA
		var force;				// D3 force-directed layout
		var coursesChart;		// SVG object

		function setup(){
			
			radius = 12;
			linkDist = width/7;

			nodes = filteredCourses;

			// Prepending anchors to nodes array
			for(var i = anchors.length - 1; i >= 0; i --){
				nodes.unshift(anchors[i]);	
			}
			// console.log(nodes);

			// Adding a radius to our objects (for collision purposes)
			for(var i = 0; i < nodes.length; i++){
				// Anchors will have radius 1, so they don't
				// prevent courses from getting inside the main donut
				nodes[i]['radius'] = i < anchors.length ? 1 : radius;
			}					

			// CREATING THE LINKS
			links = [];
			// Loop through anchors
			for(var i = 0; i < anchors.length; i++){
				// Loop through nodes
				// (skip the anchors, which come first in the array)
				for(var j = anchors.length; j < nodes.length; j++){
					// Do this course (node) and this arc (anchor) share a path of study?
					if(nodes[j]['path_of_study'].indexOf(anchors[i]['path_of_study']) > -1){					
						var newLink = { source:j, target:i, value: 1 };
						links.push(newLink);

						// Highlight arc color
						d3.select('#arc_' + i).classed("linked", true);	
					}
				}
			}
			// console.log(links);			

			force = d3.layout.force()
			    .size([width, height])
			    .gravity(0.05)
			    .linkDistance(linkDist)	// standard link length
			    .linkStrength(0.1)		// how flexible the links are		    
			    .nodes(nodes)
			    .links(links)		    
			    // .charge(function(d, i) {
			    // 	// Anchors will repel, course nodes won't
			    // 	return i < anchors.length ? -100 : 0

			    // 	// return i ? 0 : -100 is the same as
			    // 	// if(i > 0) { 0 } else { 1000 }
			    // 	// Which means:
			    // 	// * the first node (anchor) will repel all other ones (-1000)
			    // 	// * the others don't repel each other
			    // })
			    ;			

			// Making our anchors fixed
			for(var i = 0; i < anchors.length; i++){
				// console.log(nodes[i]);
				nodes[i].fixed = true;
				nodes[i].x = nodes[i].anchorX + width/2;
				nodes[i].y = nodes[i].anchorY + height/2;
			}

			// Appending the actual SVG objects
			coursesChart = svg.append("g")
				.attr('id', 'courses-chart')		
				;			
		}

		function update(){

			var link = coursesChart.selectAll(".link")
	      		.data(links)
	    		.enter()
	    		.append("line")
	      		.classed("link", function(d, i){
	      			// Links to the selected anchor won't be visible
	      			return d.target.path_of_study != selected;
	      		})
	      		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

			var circles = coursesChart.selectAll("circle")
				.data(nodes)
				.enter()
				.append("circle")
			    .attr("r", radius)
			    .attr("id", function(d, i){
			    	return d.title;
			    })
			    .attr('class', function(d, i){
			    	// Anchors won't be visible
					return i > anchors.length ? 'course' : 'anchor';
			    })
			    .on('click', function(d, i){
			    	console.log(d.path_of_study.length);
			    	console.log(d.path_of_study);
			    })
			    ;

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

			// Initializing calculations
			force.start();
		}

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

		setup();
		update();
	};	

	var init = function(){
		console.log('Called init');
		loadPathsOfStudy();
		loadCourses();
	};

	return {
		init: init
	};
})();

/* Wait for all elements on the page to load */
window.addEventListener('DOMContentLoaded', app.main.init);