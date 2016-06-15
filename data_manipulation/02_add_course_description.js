var jsonfile = require('jsonfile');

var coursesWithoutDesc = jsonfile.readFileSync('exported_data/lang_courses_fall_2015.json');
// console.log(coursesWithoutDesc);

var coursesDesc = jsonfile.readFileSync('original_data/Lang-Courses-fall_2015-20160509-xls.json');
// console.log(coursesDesc);

var coursesWithDesc = [];
var c = 0;

for(var i = 0; i < coursesWithoutDesc.length; i++) {
	
	// New course object
	var course = coursesWithoutDesc[i];
	course['description'] = [];

	var subject_code = course['subject_code_course_number'].split(' ')[0];
	// console.log(subject_code);
	var course_number = course['subject_code_course_number'].split(' ')[1];
	// console.log(course_number);

	for(var j = 0; j < coursesDesc.length; j++) {
		// console.log(coursesDesc[j]['SubjectCode'] + ' ' + coursesDesc[j]['CourseNumber']);
		if(subject_code === coursesDesc[j]['SubjectCode']
			&& course_number === coursesDesc[j]['CourseNumber'].toString()
			&& coursesDesc[j]['CourseDescription'] !== null
			&& coursesDesc[j]['CourseDescription'] !== 'This course does not yet have a description.'
		   ) {
			console.log('Match ' + c);
			c++;
			// console.log(coursesDesc[j]['CourseDescription']);

			// Is this description different than the one we already have?
			if(course['description'].indexOf(coursesDesc[j]['CourseDescription']) < 0){
				course['description'].push(coursesDesc[j]['CourseDescription']);	
			}
		}
	}

	coursesWithDesc.push(course);
}

console.log(coursesWithDesc.length);

// Debug: are there courses with more than one description?
// for(var i = 0; i < coursesWithDesc.length; i++) {
// 	// console.log(coursesWithDesc[i]['description'].length);
// 	if(coursesWithDesc[i]['description'].length > 1){
// 		console.log('Duplicate');
// 	}
// }

jsonfile.writeFileSync('exported_data/lang_courses_with_desc_fall_2015.json', coursesWithDesc);


