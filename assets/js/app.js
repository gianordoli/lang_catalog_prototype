var app = app || {};

app.main = (function(){

    var width  = window.innerWidth;
    var height = window.innerHeight;

	// Categories change from term to term. Think about how to handle arc updates
	var loadCategories = function(){
		d3.csv('assets/data/fall_2015_path_of_study.tsv', function(error, data) {
			if (error) return console.warn(error);
			console.log('loaded:');
			console.log(data);
			displayCategories(data);
		});
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
	            .attr("height", window.innerHeight);

	var chart = svg.append("g")
	               .attr("transform", "translate(" + width/2 + "," + height/2 + ")");
	
	// Each combo of arc and text will be inside this group
	var g = chart.selectAll(".arc")
				.data(pie(dataset))
				.enter()
				.append("g")
				.attr("class", "arc");

	// Arcs
  	g.append("path")
		.attr("d", arc)
		.attr("id", function(d, i){
			return 'arc_' + i;
		})
		.style("fill", function(d, i){
			return 'rgba(0, 140, 200, ' + (i / 10) +')'	
		});

	// Labels
	var text = g.append("text")
				.attr("dy", arcWeight/2);
	
	// TO-DO: add '2nd_line: true/false' as a parameter to the data
	// so we can determine the text offset beforehand
	text.append("textPath")
	    .attr("xlink:href",	function(d, i){
	    	return '#arc_' + i;
	    })
	    // .attr("startOffset", "50%")
		.text(function(d, i) {
			var fullText = d.data.path_of_study;
			var txt = fullText;
			// If we have 2 words...
			if(fullText.indexOf(" ") > -1){
				txt = fullText.substring(0, fullText.indexOf(" "));
				
				var secondLineTxt = fullText.substring(fullText.indexOf(" ") + 1, fullText.length);
				var parent = d3.select(this.parentNode);
				appendSecondLine(parent, secondLineTxt, '#arc_' + i);
			}
			return txt;
		});	

	function appendSecondLine(parent, txt, arcId){
		parent.append("textPath")
		    .attr("xlink:href",	arcId)
			.text(txt);
	};			

	// // Add a text label.
	// var text = svg.append("text")
	//     .attr("x", 6)
	//     .attr("dy", 15);

// < text  text-anchor="middle">
//             <textPath  xlink:href="#tp3">CHANGE</textPath>
// </text>


	// chart.selectAll("arc")
	//     .data(dataset)
	//     .enter()
	//     .append("rect")
	//     .attr("x", function(d, i){
	//     	return xScale(i);
	//     })
	//     .attr("y", 0)
	//     .attr("height", 40)
	//     .attr("width",  xScale.rangeBand())
	//     .attr("fill", "rgba(0, 140, 200, 0.3)");

	// svg.selectAll(".arc")
	//       .data(pie(data))
	//     .enter().append("g")
	//       .attr("class", "arc");

	//   g.append("path")
	//       .attr("d", arc)
	//       .style("fill", function(d) { return color(d.data.age); });

	// chart.selectAll("circle")
	//     .data(dataset)
	//     .enter()
	//     .append("rect")
	//     .attr("x", function(d, i){
	//     	return xScale(i);
	//     })
	//     .attr("y", 0)
	//     .attr("height", 40)
	//     .attr("width",  xScale.rangeBand())
	//     .attr("fill", "rgba(0, 140, 200, 0.3)");

	// // Now appending the axes
	// chart.append("g")
	//     .attr("transform", "translate(0," + height + ")")
	//     .attr("class", "x axis")
	//     .call(xAxis)
	//     .append("text") // Label
	//     .attr("x", width)
	//     .attr("y", -6)
	//     .style("text-anchor", "end")
	//     .text("Income per person (GDP/capita, PPP$ inflation-adjusted)");

	// chart.append("g")
	//     .attr("class", "y axis")
	//     .call(yAxis)
	//     .append("text") // Label
	//     .attr("transform", "rotate(-90)")
	//     .attr("y", 12)
	//     .style("text-anchor", "end")
	//     .text("Life Expectancy (years)");;

	// // Creating the circles
	// chart.selectAll("circle")
	//     .data(dataset)
	//     .enter()
	//     .append("circle")
	//     .attr("r", 10)
	//     .attr("fill", "rgba(0, 140, 200, 0.3)")

	//     // Interaction
	//     .on("mouseover", function(d, i) {
	//         d3.select(this)
	//           .attr("fill", "red");

	//         // Tooltip
	//         var tooltipX = parseFloat(d3.select(this).attr("cx")) + 10;
	//         var tooltipY = parseFloat(d3.select(this).attr("cy")) + 10;

	//         chart.append("text")
	//             .attr("x", tooltipX)
	//             .attr("y", tooltipY)
	//             .text(d.country)
	//             .attr("id", "tooltip")
	//             .append("tspan")
	//             .attr("x", tooltipX)
	//             .attr("dy", 20)
	//             .text(d.life_expectancy + " years")
	//             .append("tspan")
	//             .attr("x", tooltipX)
	//             .attr("dy", 20)
	//             .text("GDP " + d.gdp);


	//     })
	//     .on("mouseout", function(d) {
	//             d3.select(this)
	//               .attr("fill", "rgba(0, 140, 200, 0.3)");
	            
	//             //Remove the tooltip
	//             d3.select("#tooltip").remove();                                  
	//     })                          

	//     // Initial state
	//     .attr("cx", function(d, i){
	//         return xScale(d.gdp)
	//     })
	//     .attr("cy", height)
	//     .style("opacity", 0)
	    
	//     // Transition
	//     .transition()
	//     .duration(2000)

	//     // Final state
	//     .attr("cx", function(d, i){ // Attention here! cx and cy
	//         return xScale(d.gdp);   // Easy!
	//     })
	//     .attr("cy", function(d, i){
	//         return yScale(d.life_expectancy)
	//     })
	//     .style("opacity", 1);   // This is css, not d3!
	};

	// var loadCourses = function(){
	// 	console.log('Called loadCourses');
	// 	d3.csv('assets/data/fall_2015_courses.tsv', function(error, data) {
	// 		if (error) return console.warn(error);
	// 		console.log('loaded:');
	// 		console.log(data);
	// 	});
	// };

	// var processCourses = function(){

	// };

	// var displayCourses = function(){

	// };

	var init = function(){
		console.log('Called init');
		loadCategories();
	};

	return {
		init: init
	};
})();

/* Wait for all elements on the page to load */
window.addEventListener('DOMContentLoaded', app.main.init);