var jsonfile = require('jsonfile');

var originalData = jsonfile.readFileSync('original_data/Lang-Courses-2012_2015-Path_of_Study-xls.json');
// console.log(originalData);

// 1. Filtering by Fall 2015
var filteredData = [];
for(var i = 0; i < originalData.length; i++){
	var term = originalData[i]['TermDesc'];
	// console.log(term);
	if(term === 'Fall 2015'){
		filteredData.push(originalData[i]);
	}
}
// console.log(filteredData.length);

// 2. Aggregate sessions into courses
var courses = {};

for(var i = 0; i < filteredData.length; i++){

	var courseNumber = filteredData[i]['CourseNumber'];
	// console.log(courseNumber);
	
	// If the object doesn't have this class yet
	if(!courses.hasOwnProperty(courseNumber)){
 
		var newCourse = {
			title: filteredData[i]['CourseTitle'],
			path_of_study: [filteredData[i]['PathofStudy']]	// Creating an array here
		}		
		// console.log(newCourse);

		// Add new course to courses obj; the courseNumber will be its key
		courses[courseNumber] = newCourse;
	}

	// If the course has already been added,...
	else{
		
		var newPathOfStudy = filteredData[i]['PathofStudy'];
		// console.log(courses[courseNumber]['path_of_study']);
		// console.log('\t' + newPathOfStudy);

		// ... we need to check if this path of study is new
		if(courses[courseNumber]['path_of_study'].indexOf(newPathOfStudy) < 0){
			
			// If so, add it to the course
			courses[courseNumber]['path_of_study'].push(newPathOfStudy);
		}
	}
}

// console.log(courses);

// 3. Replacing wrong path of study
var replacementList = jsonfile.readFileSync('original_data/replacement_list.json');
// console.log(replaceList);

// Loop through all courses
for(var courseNumber in courses){
	// Loop through replacement list
	for(var key in replacementList){
		var index = courses[courseNumber]['path_of_study'].indexOf(key);
		// Is there a course to be replaced?
		if(index > -1){
			// If the replacement hasn't been added yet, add it
			if(courses[courseNumber]['path_of_study'].indexOf(replacementList[key]) < 0){
				courses[courseNumber]['path_of_study'].splice(index, 1, replacementList[key]);
			// Otherwise, just remove the wrong path_of_study
			}else{
				courses[courseNumber]['path_of_study'].splice(index, 1);
			}
		}
	}
}
// jsonfile.writeFileSync('exported_data/lang_courses_fall_2015.json', courses);

// 4. Convert courses object to array
var coursesArray = [];
for(var courseNumber in courses){
	var newObj = courses[courseNumber]; 
	newObj['course_number'] = courseNumber;
	coursesArray.push(newObj);
}
// console.log(coursesArray);
jsonfile.writeFileSync('exported_data/lang_courses_fall_2015.json', coursesArray);


/*---------- CATEGORIES ----------*/
// 5. Generate categories file
var pathsOfStudy = [];
for(var courseNumber in courses){
	for(var i = 0; i < courses[courseNumber]['path_of_study'].length; i++){
		if(pathsOfStudy.indexOf(courses[courseNumber]['path_of_study'][i]) < 0){
			pathsOfStudy.push(courses[courseNumber]['path_of_study'][i]);
		}
	}
}
// console.log(pathsOfStudy);
jsonfile.writeFileSync('exported_data/lang_paths_of_study_fall_2015.json', pathsOfStudy);