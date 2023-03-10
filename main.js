width = 1600;
height = 800;
marginVert = 20;
marginHor = 80;

var time = d3.timeParse("%d-%m-%Y"); 

var colorScale = d3.scaleLinear().domain([1,10]).range(["#00ffff", "#00ff00"])

var svg = d3.select("#svg1")
    .append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
    .attr("id","main_group")
	.attr("transform", "translate(" + marginHor + "," + marginVert + ")");
    
// create the tooltip variable
var tooltip = d3.select("#tooltip"); 

// create the projecktion 
const projection = d3.geoNaturalEarth1().scale(220).translate([(width/2)-210, (height/2)]);

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
            coord: [+data.longitude, +data.latitude],
            date: time(data.iday + "-" + data.imonth + "-" + data.iyear), 
            date_string: data.iday + "/" + data.imonth + "/" + data.iyear,
            year: +data.iyear,
            type: data.attacktype1_txt,
            type_num: +data.attacktype1,
            target: data.targtype1_txt
        }
    })
])
.then(function([countries, data]){
    dataset = data;
    map.features = countries.features; 	

    console.log(dataset);
    draw();
    drawAttacks(1970);
    drawTimeline(1970);
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
        .attr("r", 3)
        .attr("stroke-width",0.9)
        .style("stroke", d => colorScale(d.type_num));
}

function drawTimeline(curent_year){

    d3.select(".axis").remove()
    d3.selectAll(".time_circles").remove()

    var yScale = d3.scaleTime()
        .domain([time("01-01-"+curent_year), time("31-12-"+curent_year)])
        .range([50, height-50])

    var timeLine = d3.axisLeft(yScale)
        .ticks(12)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(5);

    d3.select("#svg1").select("svg")
        .append("g")
        .classed("axis",true)
        .attr("transform", "translate("+(width - 240)+" , 0)")
        .call(timeLine);

    d3.selectAll("g.axis .domain, g.axe g.tick line")
        .style("stroke", "#ff00ff");

    d3.selectAll("g.axis g.tick text")
        .style("font-size", "9px")
        .style("color", "#ff00ff");

    svg.selectAll("events")
        .data(dataset.filter(function(d) { return (d.year == curent_year) }))
        .enter()
        .append("circle")
        .attr("class", "time_circles")
        .attr("cx", d => d.type_num * 8 + width - 260)
        .attr("cy", d => yScale(d.date) - 12)
        .attr("r", 3)
        .style("stroke",  d => colorScale(d.type_num));
}

// this is the controls for the tool tip and it requires some additional explanation
// first I select the group containing all the countries
d3.select("#main_group")

    // I then execute a function when the mouse moves over the group    
    .on("mousemove", function() {

        //I change the position of the tooltip when the mouse moves
        tooltip		
            .style("top", (d3.event.pageY - 50) + "px")
            .style("opacity", 1);

        // I then select every individual country in the group 
        d3.select(this).selectAll("path.country")

            // I then execute another function when the mouse moves over the individual country
            // the reason I do it in two layers like this is because I only want the tooltip to disappear when the mouse isn't over any country
            // so I have one layer that detects if the mouse is over any of the countries and on that detects if it is over an individual country
            .on("mousemove", function() {   
                
                tooltip.style("left", (d3.event.pageX - 50) + "px")
                
                // this bit here writes the name of the country the mouse is currently on in the tool tip
                tooltip.html("<b> " + this.__data__.properties.name + "</b>");
            
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
            
        d3.select(this).selectAll("circle.attacks")
            .on("mousemove", function() { 
                
                tooltip.style("left", (d3.event.pageX + 5) + "px")
                
                tooltip.html(
                    "<b id='text1' style='font-size:11px'>Type: " + this.__data__.type + 
                    "</b><br><b  id='text2' style='font-size:11px'>Target: "+this.__data__.target+
                    "</b><br><b  id='text3' style='font-size:11px'>Date: "+this.__data__.date_string+"</b>"
                );
            })
    })
    // removes the tooltip if the mouse isn't over any country 
    .on("mouseleave", function() { 
        tooltip.style("opacity", 0);
    });

// create the buttons
button = d3.select("#svg1").select("svg").append("g")
    .attr("id","buttons")
	.attr("transform", "translate(" + (140) + "," + (height - 30) + ")");

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
        d3.select(".button").style("fill","#ffffff");
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
            drawTimeline(this.id);
        });

    distx += 40;
} 