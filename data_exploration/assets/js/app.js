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

	var loadCourses = function(pathOfStudy, callback){
		
		console.log('loadCourses');

		d3.json('assets/data/lang_courses_fall_2015.json', function(error, data) {
			if (error) return console.warn(error);
			// console.log('Loaded courses:');
			// console.log(data);
			displayChart(pathOfStudy, data);
		});
	};	

	var displayChart = function(pathOfStudy, courses){

		console.log('displayChart');
		console.log(pathOfStudy);
		console.log(courses);
	    
	    var width  = window.innerWidth;
	    var height = window.innerHeight;

		svg = d3.select("body")
            .append("svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
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