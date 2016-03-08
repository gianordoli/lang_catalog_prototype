var app = app || {};

app.main = (function(){

    var width  = window.innerWidth;
    var height = window.innerHeight;
    var svg;		// SVG object
    var courses;	// Course data loaded async with subject data
    
    var prevFilter	= [];	// Will keep track of user selections
    
    var selected	= [];	// Paths of study selected by user
    var anchors		= [];	// Arc coordinates; used as 'anchors' on the network graph;
    					 	// Will compute after drawing them.

	var graph;	// Network graph with courses;

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
			displayPathsOfStudy(objData);
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

	var displayPathsOfStudy = function(dataset){

		// VARS
		var radius = 490/2;
		var arcWeight = (550 - 490)/2;

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

		var pathOfStudyChart = svg.append("g")
			.attr('id', 'path-of-study-chart')
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")")
			;
		
		// Each combo of arc and text will be inside this group
		var g = pathOfStudyChart.selectAll(".path-of-study")
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

				// Add/remove from selected list
				var n = selected.indexOf(d.data.path_of_study);
				if(n < 0){
					selected.push(d.data.path_of_study);	
				}else{
					selected.splice(n, 1);
				}
				updateGraph();
			})
			;

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

		function getAnchors(_arcs){

			console.log('getAnchors()');

			// Compute coords so we can draw the network later
			_arcs.each(function(d, i){
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
		}		

		// Just a debug function, not really using it now
		function drawAnchors(){

			console.log('drawAnchors()');

			pathOfStudyChart.selectAll("circle")
				.data(anchors)
				.enter()
				.append('circle')
				.attr('cx', function(d, i){
					console.log(d);
					return d.anchorX;
				})
				.attr('cy', function(d, i){
					return d.anchorY;
				})
				.attr('r', 20)
				.attr('fill', 'black')
			;
		}

		getAnchors(arcs);
		drawGraph();
	}

	/*-------------------- COURSES --------------------*/
	var loadCourses = function(){
		d3.json('assets/data/lang_courses_fall_2015.json', function(error, data) {
			if (error) return console.warn(error);
			// console.log('Loaded courses:');
			// console.log(data);
			courses = data;			// Won't change unless navigating to a different term
		});
	};

	// The donut 'communicates' with the graph through these 2 functions
	function drawGraph(){

		console.log('drawGraph()');

		graph = new myGraph();

		// debugLinks();

		// Debugging, not really using this now
		function debugLinks(){
			var source = '[{"title":"Rvolution & Pop Media in Hist","path_of_study":["Global Studies"],"course_number":"910"},{"title":"Documentary Self","path_of_study":["The Arts","Culture & Media","Economics","Literary Studies","Journalism + Design","Religious Studies","Screen Studies"],"course_number":"920"},{"title":"The Spiritual Autobiography","path_of_study":["Global Studies","Anthropology","Contemporary Music","Journalism + Design","Psychology","Education Studies","The Arts","Liberal Arts","Literary Studies","Culture & Media","Economics","History","Sociology","Theater","Religious Studies","Interdisciplinary Science","Philosophy","Social Inquiry","Politics"],"course_number":"1000"},{"title":"Reading Poetry","path_of_study":["The Arts","Interdisciplinary Science"],"course_number":"1002"},{"title":"Fantastic Short Fiction","path_of_study":["Economics"],"course_number":"1003"},{"title":"Self and Social Structure","path_of_study":["Liberal Arts"],"course_number":"1008"},{"title":"Fundamentals of Western Music","path_of_study":["Contemporary Music","Screen Studies"],"course_number":"1010"}]';
			var sourceData = JSON.parse(source);
			console.log(sourceData);
			var i = 0;
			var test = setInterval(function(){
				// if(i < 3){
				if(i < sourceData.length){
					console.log('add node');
					graph.addNode(sourceData[i]);
					i++;
				}else{
					clearInterval(test);
				}
			}, 1000);
		}
	};

	function updateGraph(){
		
		var newFilter = _.filter(courses, function(o) {
			var nMatches = 0;
			for(var i = 0; i < selected.length; i++){
				if(o.path_of_study.indexOf(selected[i]) > -1){
					nMatches ++;
				}
			}
			return nMatches === selected.length && selected.length > 0;
		});
		// console.log('newFilter: ' + newFilter.length);
		// console.log(newFilter);
		// console.log('prevFilter: ' + prevFilter.length);
		// console.log(prevFilter);

		// Remove nodes
		if(prevFilter.length > newFilter.length){
			var diff = _.differenceBy(prevFilter, newFilter, 'course_number');
			if(diff.length > 0){
				for(var i = 0; i < diff.length; i++){
					graph.removeNode(diff[i]['id']);
				}
			}
		}

		// Add nodes
		else{	
			for(var i = 0; i < newFilter.length; i++){
				graph.addNode(newFilter[i]);
			}
		}

		prevFilter = newFilter;
	}	

	// (list of courses, position of arcs, selected pathOfStudy)
	function myGraph(){

		var newGraph = {};
		
		console.log('myGraph()');
		// console.log(data);
		// console.log(anchors);
		// console.log(selected);

		var radius, linkDist;	// LAYOUT
		var nodes, links;		// DATA
		var force;				// D3 force-directed layout
		var coursesChart;		// SVG object

		var setup = function(){

			console.log('myGraph.setup()');
			
			radius = 12;
			linkDist = width/10;
			nodes = [];
			links = [];
			force = d3.layout.force()
				.nodes(nodes)
				.links(links)
				;
			coursesChart = svg.append("g")
				.attr('id', 'courses-chart')		
				;				

			// Adding anchors to nodes
			for(var i = 0; i < anchors.length; i++){
				newGraph.addNode(anchors[i]);
			}
			// newGraph.updateLinks();

			update();
		}

		/*---------- PUBLIC ----------*/
        newGraph.addNode = function(obj) {
        	obj = addIdToNode(obj);		// Anchor id: path_of_study; Course id: course_number
        	obj = addRadiusToNode(obj);

        	// Before really updating the graph, let's check if this add haven't been yet added
        	if(findNodeIndexById(obj.id) === undefined){
	            nodes.push(obj);

	        	if (obj.isAnchor) {			// We need to make anchors fixed
	        		obj = fixAnchor(obj)
	        	}else{						// And add links to courses
					addLinks(obj);
					// console.log(links);
	        	}

	            update();
        	}
        };

        newGraph.removeNode = function(id){
            var i = 0;
            var nodeIndex = findNodeIndexById(id);
            // Remove links; gotta use a while, because the size of the array will change
            while (i < links.length) {
                if ((links[i]['source']['index'] === nodeIndex) || (links[i]['target']['index'] === nodeIndex)) {
                    links.splice(i, 1);
                }
                else i++;
            }
            nodes.splice(findNodeIndexById(id), 1);
            update();
        }

		/*---------- PRIVATE ---------*/
        var addIdToNode = function(_obj){
        	var obj = _obj;
        	obj.id = obj.isAnchor ? obj.path_of_study : obj.course_number;
        	return obj;
        };

		var addRadiusToNode = function(_obj){
			var obj = _obj;
			obj['radius'] = obj.isAnchor ? 1 : radius;
			return obj;
		};

		var addLinkCountToNode = function(_obj){
			var obj = _obj;
			obj['link_count'] = 0;
			return obj;
		};

		var fixAnchor = function(_obj){
			var obj = _obj;
			// console.log(nodes[i]);
			obj.fixed = true;
			obj.x = obj.anchorX + width/2;
			obj.y = obj.anchorY + height/2;
			// console.log(nodes[i]);
			return obj;
		};

        var findNodeIndexById = function (id) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) {
                    return i;
                }
            }
        };

		var addLinks = function(obj){
			if(!obj.isAnchor){
				// Loop through anchors
				for(var i = 0; i < anchors.length; i++){
					
					if(obj['path_of_study'].indexOf(anchors[i]['path_of_study']) > -1){
						
						var sourceIndex = findNodeIndexById(obj['course_number']);			// Course
						var targetIndex = findNodeIndexById(anchors[i]['path_of_study']);	// Anchor
						// console.log(sourceIndex);
						var newLink = { source: sourceIndex,
										target: targetIndex,
										value: 1 };
						links.push(newLink);

						// Highlight arc color
						// d3.select('#arc_' + targetIndex).classed("linked", true);
					}					
				}
			}
		}

		var update = function(){
			
			// console.log('myGraph.update()');

			var linkSelection = coursesChart.selectAll('line')
	      		.data(links);

	      	var linkEnter = linkSelection.enter()
	    		.append("line")
	      		.classed("from-selected", function(d, i){
	      			// Links to the selected anchor won't be visible
	      			var isFromSelected = false;
	      			for(var i = 0; i < selected.length; i++){
	      				console.log(nodes[d.target]['path_of_study']);
	      				if(nodes[d.target]['path_of_study'] === selected[i]){
	      					isFromSelected = true;
	      					break;
	      				}
	      			}
	      			return isFromSelected;
	      		})
	      		.style("stroke-width", function(d) { return Math.sqrt(d.value); })
	      		;

	      	linkSelection.exit()
	      		.remove()
	      		;

			var nodeSelection = coursesChart.selectAll("circle")
				.data(nodes);

			var nodeEnter = nodeSelection.enter()
				.append("circle")
			    .attr("r", radius)
			    .attr("id", function(d, i){
			    	return d.title;
			    })
			    .attr('class', function(d, i){
			    	// return 'course';
			    	// Anchors won't be visible
					return d.isAnchor ? 'anchor' : 'course';
			    })
			    .on('click', function(d, i){
			    	// console.log(d.path_of_study.length);
			    	// console.log(d.path_of_study);
			    	// newGraph.removeNode(d.id);
			    	console.log(d);
			    })
	      		// .each(function(d, i){	
	      		// 	if(!d.isAnchor){
	      		// 		// Let's make nodes show up somewhere inside the donut
	      		// 		// Otherwise they might get stuck outside
	      		// 		var iniX = width/2 + Math.round(Math.random()*200) * (Math.random() < 0.5 ? -1 : 1);
	      		// 		var iniY = height/2 + Math.round(Math.random()*200) * (Math.random() < 0.5 ? -1 : 1);
		      	// 		d.x = iniX;
		      	// 		d.y = iniY;
		      	// 		d.px = iniX;
		      	// 		d.py = iniY;
	      		// 	}
	      		// })			    
			    ;

			nodeSelection.exit()
				.remove()
				;

			force.on("tick", function(e) {
				var q = d3.geom.quadtree(nodes),
					i = 0,
					n = nodes.length;

				while (++i < n) q.visit(collide(nodes[i]));

                nodeSelection.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });

				linkSelection.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
			});

			force.size([width, height])
			    .gravity(0.08)			// force towards center
			    .linkDistance(linkDist)	// standard link length
			    .linkStrength(0.1)		// how flexible the links are
			    ;

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

		return newGraph;
	};	

	var init = function(){
		console.log('Called init');
		loadPathsOfStudy();
		loadCourses();
	};

	return {
		init: init,
		selected: selected,
		updateGraph: updateGraph
	};
})();

/* Wait for all elements on the page to load */
window.addEventListener('DOMContentLoaded', app.main.init);