var app = app || {};

app.main = (function(){

	/*------------------ CATEGORIES -------------------*/
	var loadPathsOfStudy = function(callback){

		console.log('loadPathsOfStudy');

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

			callback(objData);
		});
	};

	var loadCourses = function(pathsOfStudy, callback){
		
		console.log('loadCourses');

		d3.json('assets/data/lang_courses_fall_2015.json', function(error, data) {
			if (error) return console.warn(error);
			// console.log('Loaded courses:');
			// console.log(data);
			displayChart(pathsOfStudy, data);
		});
	};	

	var displayChart = function(pathsOfStudy, courses){

		console.log('displayChart');
		console.log(pathsOfStudy);
		console.log(courses);
	    
        var margin = {top: 100, right: 100, bottom: 100, left: 300};
        var width  = window.innerWidth - margin.left - margin.right;
        var height = window.innerHeight - margin.top - margin.bottom;

	    var xScale = d3.scale.ordinal()	    
	    	.rangeRoundBands([0, width])
	    	.domain(pathsOfStudy.map(function(obj){
	    		return obj.path_of_study;
	    	}))	    	
	    	;

	    var yScale = d3.scale.ordinal()
	    	.rangeRoundBands([0, height])
	    	.domain(courses.map(function(obj){
	    		return obj.title;
	    	}))	    	
	    	;

        var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.tickFormat(d3.format("g"))
			;

        var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left")
			;

		var svg = d3.select("body")
            .append("svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            ;

        var chart = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   //      chart.append("g")
			// .attr("class", "x axis")
			// .attr("transform", "translate(0," + height + ")")
			// .call(xAxis)
   //         ;

   //      chart.append("g")
			// .attr("class", "y axis")                
			// .call(yAxis)
			// ;

		var course = chart.selectAll('g')
			.data(courses)
			.enter()
			.append('g')
			.attr('x', function(d, i){
				console.log(d);
			})
		    .attr("transform", function(d, i) {
		    	return "translate(0, "+yScale(d.title)+")";
		    });
			;

		var squares = course.selectAll('rect')
			.data(function(d){
				// console.log(d);
				return d.path_of_study;
			})
			.enter()
			.append('rect')
			.attr('x', function(d, i){
				console.log(d);
				return xScale(d);
				// return i* 10;
			})
			.attr("width", xScale.rangeBand())
			.attr('height', yScale.rangeBand())
			;


	}
	

	var init = function(){
		console.log('Called init');
		loadPathsOfStudy(function(data){
			loadCourses(data);
		});
		
	};

	return {
		init: init,
		// selected: selected,
		// updateGraph: updateGraph
	};
})();

/* Wait for all elements on the page to load */
window.addEventListener('DOMContentLoaded', app.main.init);