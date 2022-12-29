width = 1500;
height = 800;
marginVert = 20;
marginHor = 80;

var svg = d3.select("#svg1")
    .append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
    .attr("id","main_group")
	.attr("transform", "translate(" + marginHor + "," + marginVert + ")");
    
// create the tooltip variable
var tooltip = d3.select("#tooltip") 

var control = d3.select("#control")

// create the projecktion 
const projection = d3.geoNaturalEarth1().scale(220).translate([(width/2)-150, (height/2)]);

// create geo path
const geoPath = d3.geoPath().projection(projection);

// I define variables for later use
var map = {}; 
var dataset = {};

// I put data into the variables I just created
Promise.all([
    // the shapes of the countries
    d3.json("https://raw.githubusercontent.com/sandravizz/Analytical-System-Design-D3.js/main/Datasets/world_countries_geojson.geojson"),
    
    // the datapoints
    d3.csv("./terrorism.csv", function(data){
        return {
            country: data.country_txt,
            coord: [+data.longitude, +data.latitude],
            date: data.iyear + "/" + data.imonth + "/" + data.iday, 
            year: +data.iyear,
            type: data.attacktype1_txt,
            target: data.targtype1_txt
        }
    })
])
.then(function([countries, data]){
    dataset = data;
    map.features = countries.features; 	

    console.log(dataset);
    draw();
    drawAttacks(1970)
});

function draw() {  
    // draw the countries in the svg    
	svg.selectAll("countries") 
		.data(map.features)
		.enter()
        .append("path")
		.attr("class","country")
		.attr("d", geoPath) 
        .attr("stroke-width",0.4) 
		.style("stroke", "#ff00ff"); 
}

function drawAttacks(year) {
    ///* draw the terrorist attacks in the svg 
    svg.selectAll("terrorist attacks")
        .data(dataset.filter(function(d) { return (d.year == year) }))
        .enter()
        .append("circle")
        .attr("class", "attacks")
        .attr("cx", d => projection(d.coord)[0])
        .attr("cy", d => projection(d.coord)[1])
        .attr("r", 2.5)
        .attr("stroke-width",0.9)
        .style("stroke", "#00ff00");//*/
}

// this is the controls for the tool tip and it requires some additional explanation
// first I select the group containing all the countries
d3.select("#main_group")

    // I then execute a function when the mouse moves over the group    
    .on("mousemove", function() {

        //I change the position of the tooltip when the mouse moves
        tooltip
            .style("left", (d3.event.pageX - 30) + "px")		
            .style("top", (d3.event.pageY - 50) + "px")
            .style("opacity", 1);

        // I then select every individual country in the group 
        d3.select(this).selectAll("path.country")

            // I then execute another function when the mouse moves over the individual country
            // the reason I do it in two layers like this is because I only want the tooltip to disappear when the mouse isn't over any country
            // so I have one layer that detects if the mouse is over any of the countries and on that detects if it is over an individual country
            .on("mousemove", function() {    
                
                // this bit here writes the name of the country the mouse is currently on in the tool tip
                tooltip.html("<b> " + this.__data__.properties.name+ "</b>")
            
                // changes the color of the country the mouse is currently on
                d3.select(this)
                    .style("fill", "#ff00ff")
                    .style("fill-opacity", 0.3);
            })
            // changes the color back once the mouse leaves the country 
            .on("mouseleave", function() {
                d3.select(this)
                    .style("fill", "#000000")
                    .style("fill-opacity", 1)
                    .style("stroke", "#ff00ff");
            }); 
    })
    // removes the tooltip if the mouse isn't over any country 
    .on("mouseleave", function() { 
        tooltip
            .transition()	
            .delay(1000)	
            .duration(500)		
            .style("opacity", 0);
    });

// create the buttons
button = d3.select("#svg1").select("svg").append("g")
    .attr("id","buttons")
	.attr("transform", "translate(" + (140) + "," + (height - 30) + ")")

    button.append("text")
    .classed("txt", true)
    .attr("x", 0)
    .attr("y", 8)
    .text("YEAR :");


for(var i = 1970; i <= 2020; i++){
    if (i == 1970){
        var distx = 40;
        var disty = 0; 
    } else if (i == 1996) {
        d3.select(".button").style("fill","#ffffff")
        var distx = 40;
        var disty = 18; 
    }

    button.append("text")
        .classed("txt", true)
        .attr("x", distx + 10)
        .attr("y", disty)
        .text(i);

    button.append("circle")
        .classed("button", true)
        .attr("cx", distx)
        .attr("cy", -3 + disty)
        .attr("r", 6)
        .attr("id", i)
        .on("click", function() { 
            d3.selectAll(".button").style("fill","#000000");
            d3.select(this).style("fill","#ffffff");
            d3.selectAll(".attacks").remove();
            drawAttacks(this.id);
        });

    distx += 40
} 


