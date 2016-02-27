var app = app || {};

app.main = (function(){

    var width  = window.innerWidth;
    var height = window.innerHeight;
    var courses;

	/*------------------ CATEGORIES -------------------*/
	// Categories change from term to term. Think about how to handle arc updates
	var loadCategories = function(){
		d3.csv('assets/data/fall_2015_path_of_study.tsv', function(error, data) {
			if (error) return console.warn(error);
			console.log('loaded:');
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

		var svg = d3.select("body")
		            .append("svg")
		            .attr("width", window.innerWidth)
		            .attr("height", window.innerHeight)
		            ;

		var chart = svg.append("g")
		               .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
		               ;
		
		// Each combo of arc and text will be inside this group
		var g = chart.selectAll(".arc")
					.data(pie(dataset))
					.enter()
					.append("g")
					.attr("class", "arc")
					;

		// Arcs
	  	g.append("path")
			.attr("d", arc)
			.attr("id", function(d, i){
				return 'arc_' + i;
			})
			.style("fill", function(d, i){
				return 'hsla(180, 50%, 50%, ' + (i / 10) +')'	
			})
			.on('click', function(d, i){
				filterCoursesBy(d.data.path_of_study);
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
	}

	/*-------------------- COURSES --------------------*/
	var loadCourses = function(){
		d3.json('assets/data/lang_courses_fall_2015.json', function(error, data) {
			if (error) return console.warn(error);
			console.log('loaded:');
			console.log(data);
			courses = data;
		});
	};

	var displayCourses = function(obj){

	};

	var filterCoursesBy = function(pathOfStudy){
		var filteredCourses = {};
		for(var courseNumber in courses){
			if(courses[courseNumber]['path_of_study'].indexOf(pathOfStudy) > -1){
				// console.log(courses[courseNumber]['path_of_study']);
				filteredCourses[courseNumber] = courses[courseNumber];
			}
		}
		// console.log(filteredCourses);
		return filteredCourses;
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