width = 1400;
height = 840;
marginVert = 20;
marginHor = 80;

var svg = d3.select("#svg1")
    .append('svg')
	.attr('width', width)
	.attr('height', height)
	.append('g')
	.attr('transform', 'translate(' + marginHor + ',' + marginVert + ')');

// i define variables for later use
var map = {}; 
var dataset = {};

// i put data in to the variables i just created
Promise.all([
    // the shapes of the countries
    d3.json("https://raw.githubusercontent.com/sandravizz/Analytical-System-Design-D3.js/main/Datasets/world_countries_geojson.geojson"),
    
    // the datapoints
    d3.csv("./terrorism.csv", function(data){
        return {
            country: data.country_txt,
            coord: [data.longitude, data.latitude]
            //date: parseTime(ddata.date), 
        }
    })
])
.then(function([countries, data]){
    dataset = data;
    map.features = countries.features; 	
    //console.log(map.features)
    console.log(dataset)

    draw();
});

const geoPath = d3.geoPath().projection(d3.geoNaturalEarth1().scale(220).translate([(width/2)-100, (height/2)]));

function draw() {     
	svg.selectAll("countries") 
		.data(map.features)
		.enter()
        .append("path")
		.attr("class","country")
		.attr("d", geoPath)  
		.style("stroke", "#ff00ff")  
}

var tooltip = d3.select("#svg1")
    .append("div")
    .attr("class", "tooltip") 


d3.select("g")
    .on("mousemove", function() {
        d3.select(this).selectAll("path.country")
            .on("mousemove", function() {    
                tooltip
                    .html("<b> " + this.__data__.properties.name+ "</b>")
                    .style("left", (d3.event.pageX - 30) + "px")		
                    .style("top", (d3.event.pageY - 30) + "px")
                    .style("opacity", 1);
            
                d3.select(this)
                    .style("fill", "#ff00ff")
                    .style("fill-opacity", 0.3);
            })
            .on("mouseleave", function() {
                d3.select(this)
                    .style("fill", "#000000")
                    .style("fill-opacity", 1)
                    .style("stroke", "#ff00ff");}) 
    })
    .on("mouseleave", function() { 
        tooltip
            .transition()	
            .delay(1000)	
            .duration(500)		
            .style("opacity", 0);
    });


