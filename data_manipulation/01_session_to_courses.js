var jsonfile = require('jsonfile');

// var originalData = jsonfile.readFileSync('original_data/Lang-Courses-2012_2015-Path_of_Study-xls.json');
// var originalData = jsonfile.readFileSync('original_data/Lang-Courses-2012_2016-Path_of_Study-txt.json');
var originalData = jsonfile.readFileSync('original_data/Lang-Courses-2015-Path_of_Study-txt.json');
// console.log(originalData);

// 1. Filtering by Fall 2015
var filteredData = [];
for(var i = 0; i < originalData.length; i++){
	// var term = originalData[i]['TermDesc'];
	var term = originalData[i]['TermCode'];
	// console.log(term);
	if(term === 'Fall 2015'){
	// if(term === 'Fall 2015' || term === 'Spring 2015' || term === 'Summer 2015'){
		filteredData.push(originalData[i]);
	}
}
console.log(filteredData.length);

for(var i = 0; i < filteredData.length; i++){
	if(filteredData[i]['CourseNumber'] === 2030){
		console.log(filteredData[i]);
	}
}

// 2. Aggregate sessions into courses
var courses = {};

for(var i = 0; i < filteredData.length; i++){

	var SubjectCodeCourseNumber = filteredData[i]['SubjectCode'] + " " + filteredData[i]['CourseNumber'];
	// console.log(SubjectCodeCourseNumber);
	
	// If the object doesn't have this class yet
	if(!courses.hasOwnProperty(SubjectCodeCourseNumber)){
 
		var newCourse = {
			title: filteredData[i]['CourseTitle'],
			path_of_study: [filteredData[i]['PathofStudy']]	// Creating an array here
		};
		// console.log(newCourse);

		// Add new course to courses obj; the SubjectCodeCourseNumber will be its key
		courses[SubjectCodeCourseNumber] = newCourse;
	}

	// If the course has already been added,...
	else{
		
		var newPathOfStudy = filteredData[i]['PathofStudy'];
		// console.log(courses[SubjectCodeCourseNumber]['path_of_study']);
		// console.log('\t' + newPathOfStudy);

		// ... we need to check if this path of study is new
		if(courses[SubjectCodeCourseNumber]['path_of_study'].indexOf(newPathOfStudy) < 0){
			
			// If so, add it to the course
			courses[SubjectCodeCourseNumber]['path_of_study'].push(newPathOfStudy);
		}
	}
}
// console.log(courses['2030']);
// console.log(courses);

// 3. Ignore courses that are not based on particular curriculum
var stopList = ['Research Prac 2: Ind Sr. Proj', 'Research Prac 2: Coll Sr. Proj', 'Honors Thesis', 'Ind Senior Project', 'Ind Senior Prject', 'Ind Senior Work', 'Independent Study', 'Collaborative Senior Project', 'Senior Work', 'First Year Workshop', 'Collaborative Senior Pro', 'Ind Senior Work', 'Ind Senior Prject'];
for(var SubjectCodeCourseNumber in courses){
	if(stopList.indexOf(courses[SubjectCodeCourseNumber]['title']) > -1){
		// console.log(courses[SubjectCodeCourseNumber]);
		delete courses[SubjectCodeCourseNumber]
	}
}


// 4. Replacing wrong path of study
var replacementList = jsonfile.readFileSync('original_data/lang_catalog_replacement_list.json');
// console.log(replaceList);

// Loop through all courses
for(var SubjectCodeCourseNumber in courses){
	// Loop through replacement list
	for(var key in replacementList){
		var index = courses[SubjectCodeCourseNumber]['path_of_study'].indexOf(key);
		// Is there a course to be replaced?
		if(index > -1){
			// The replacement is an Array, so...
			for(var i = 0; i < replacementList[key].length; i++){
				
				// If the replacement hasn't been added yet, add it
				if(courses[SubjectCodeCourseNumber]['path_of_study'].indexOf(replacementList[key][i]) < 0){
					courses[SubjectCodeCourseNumber]['path_of_study'].splice(index, 1, replacementList[key][i]);
				// Otherwise, just remove the wrong path_of_study
				}else{
					courses[SubjectCodeCourseNumber]['path_of_study'].splice(index, 1);
				}
			}
		}
	}
}
// jsonfile.writeFileSync('exported_data/lang_courses_fall_2015.json', courses);

// 5. Convert courses object to array
var coursesArray = [];
for(var SubjectCodeCourseNumber in courses){
	var newObj = courses[SubjectCodeCourseNumber]; 
	newObj['subject_code_course_number'] = SubjectCodeCourseNumber;
	coursesArray.push(newObj);
}
// console.log(coursesArray);
jsonfile.writeFileSync('exported_data/lang_courses_fall_2015.json', coursesArray);
// jsonfile.writeFileSync('exported_data/lang_courses_2015.json', coursesArray);


/*---------- CATEGORIES ----------*/
// 6. Generate categories file
var pathsOfStudy = [];
for(var SubjectCodeCourseNumber in courses){
	for(var i = 0; i < courses[SubjectCodeCourseNumber]['path_of_study'].length; i++){
		if(pathsOfStudy.indexOf(courses[SubjectCodeCourseNumber]['path_of_study'][i]) < 0){
			pathsOfStudy.push(courses[SubjectCodeCourseNumber]['path_of_study'][i]);
		}
	}
}
// console.log(pathsOfStudy);
jsonfile.writeFileSync('exported_data/lang_paths_of_study_fall_2015.json', pathsOfStudy);
// jsonfile.writeFileSync('exported_data/lang_paths_of_study_2015.json', pathsOfStudy);