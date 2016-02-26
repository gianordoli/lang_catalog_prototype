var jsonfile = require('jsonfile');

var fileName = 'original_data/Lang-Courses-2012_2015-Path_of_Study-xls.json';

var originalData = jsonfile.readFileSync(fileName);
// console.log(originalData);

var filteredData = [];
for(var i = 0; i < originalData.length; i++){
	var term = originalData[i]['TermDesc'];
	// console.log(term);
	if(term === 'Fall 2015'){
		filteredData.push(originalData[i]);
	}
}
// console.log(filteredData.length);

var courses = {};

for(var i = 0; i < filteredData.length; i++){

	var courseNumber = filteredData[i]['CourseNumber'];
	// console.log(courseNumber);
	
	// If the object doesn't have this class yet
	if(!courses.hasOwnProperty(courseNumber)){
 
		var newCourse = {
			title: filteredData[i]['CourseTitle'],
			pathOfStudy: [filteredData[i]['PathofStudy']]	// Creating an array here
		}		
		// console.log(newCourse);

		// Add new course to courses obj; the courseNumber will be its key
		courses[courseNumber] = newCourse;
	}

	// If the course has already been added,...
	else{
		
		var newPathOfStudy = filteredData[i]['PathofStudy'];
		console.log(courses[courseNumber]['pathOfStudy']);
		console.log('\t' + newPathOfStudy);

		// ... we need to check if this path of study is new
		if(courses[courseNumber]['pathOfStudy'].indexOf(newPathOfStudy) < 0){
			
			// and then add a new Path of Study to it
			courses[courseNumber]['pathOfStudy'].push(newPathOfStudy);
		}
	}
}

// console.log(courses);

jsonfile.writeFileSync('exported_data/lang_courses_fall_2015.json', courses);