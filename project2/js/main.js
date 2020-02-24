/*
*    main.js
*    Mastering Data Visualization with D3.js
*    6.7.0 - Adding a jQuery UI slider
*    Personal Pracitice

*/

/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

var margin = { left: 80, right: 20, top: 50, bottom: 100 };
var height = 500 - margin.top - margin.bottom;
var width = 800 - margin.left - margin.right;

var g = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left +
        ", " + margin.top + ")");

var x = d3.scaleLog()
    .domain([142, 150000])
    .range([0, width])
    .base(10)

var y = d3.scaleLinear()
    .domain([0, 90])
    .range([height, 0])

var area = d3.scaleLinear()
    .domain([2000, 1400000000])
    .range([25 * Math.PI, 1500 * Math.PI])

var continentColor = d3.scaleOrdinal(d3.schemePastel1);

var times = 0;
var interval;
var formattedData;

// Tooltip
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function (d) {
        var text = "<strong>Country:</strong> <span style='color:red'>" + d.country + "</span><br>";
        text += "<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>" + d.continent + "</span><br>";
        text += "<strong>Life Expectancy:</strong> <span style='color:red'>" + d3.format(".2f")(d.life_exp) + "</span><br>";
        text += "<strong>GDP Per Capita:</strong> <span style='color:red'>" + d3.format("$,.0f")(d.income) + "</span><br>";
        text += "<strong>Population:</strong> <span style='color:red'>" + d3.format(",.0f")(d.population) + "</span><br>";
        return text;
    });
g.call(tip);

//Scale
var xLabel = g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("fill", "grey")
    .text("GDP Per Capita ($)")

var yLable = g.append("text")
    .attr("x", -height / 2)
    .attr("y", -30)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("fill", "grey")
    .attr("transform", "rotate(-90)")
    .text("Life Expectancy")

var yearLable = g.append("text")
    .attr("x", 600)
    .attr("y", 320)
    .attr("font-size", "30px")
    .attr("text-anchor", "middle")
    .attr("fill", "grey")
    .text("1800")

var legend = g.append("g")
    .attr("transform", "translate(" + (width - 10) + "," + (height - 200) + ")");


var continents = ["europe", "asia", "americas", "africa"];

continents.forEach(function (continent, i) {
    var legendRow = legend.append("g")
        .attr("transform", "translate(0," + i * 20 + ")")

    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", continentColor(continent))

    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text(continent);
})

var xAxisCall = d3.axisBottom(x)
    .tickFormat(d3.format("$"))
    .tickValues([400, 4000, 40000])
g.append("g")
    .attr("class", "x Axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxisCall)


var yAxisCall = d3.axisLeft(y)
g.append("g")
    .attr("class", "y Axis")
    .call(yAxisCall)


d3.json("data/data.json").then(function (data) {

    console.log(data);


    // Clean data
    formattedData = data.map(function (year) {
        return year["countries"].filter(function (country) {
            var dataExists = (country.income && country.life_exp);
            return dataExists
        }).map(function (country) {
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;
        })
    });


    // Run the vis for the first time
    update(formattedData[0]);

})

$("#play-button")
    .on("click", function () {
        var button = $(this);
        if (button.text() == "Play") {
            button.text("Pause");
            interval = setInterval(step, 100)
        } else {
            button.text("Play");
            clearInterval(interval);
        }

    })

$("#reset-button")
    .on("click", function () {
        times = 0;
        update(formattedData[0]);
    })

$("#continent-select")
    .on("change", function () {
        update(formattedData[times]);
    })

$("#date-slider").slider({
    max: 2014,
    min: 1800,
    step: 1,
    slide: function (event, ui) {
        time = ui.value - 1800;
        update(formattedData[time]);
    }
})



function step() {
    // At the end of our data, loop back
    // update(formattedData[times]);
    // times = (times >= 214) ? 0 : times + 1;


    times = (times < 214) ? times + 1 : 0
    update(formattedData[times]);
    console.log(times)
}


function update(data) {

    var t = d3.transition().duration(100);

    var continent = $("#continent-select").val();

    var data = data.filter(function (d) {
        if (continent == "all") return true;
        else { return d.continent == continent; }
    })

    //DATA JOIN
    var circles = g.selectAll("circle")
        .data(data, function (d) {
            return d.country
        })

    //EXIT
    circles.exit()
        .transition(t)
        .attr("fill-opacity", 0)
        .remove()



    //UPDATE
    circles.transition(t)
        .attr("cx", function (d) { return x(d.income) })
        .attr("cy", function (d) { return y(d.life_exp) })
        .attr("r", function (d) {
            return Math.sqrt(area(d.population) / Math.PI)
        })

    //ENTER
    circles.enter().append("circle")

        .attr("r", 0)
        .attr("fil-opacity", 0)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .transition(t)
        .attr("cx", function (d) { return x(d.income) })
        .attr("cy", function (d) { return y(d.life_exp) })
        .attr("r", function (d) {
            return Math.sqrt(area(d.population) / Math.PI)
        })
        .attr("fill", function (d) { return continentColor(d.continent) })
        .attr("fill-opacity", 1)

    //Time label
    yearLable.text(+(times + 1800))
    $("#year")[0].innerHTML = +(times + 1800)

    //Slider bar
    $("#date-slider").slider("value", +(times + 1800))
}