/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 3 - CoinStats
 */

/************************************************ */
// line chart
var margin = { left: 80, right: 100, top: 50, bottom: 100 },
  height = 500 - margin.top - margin.bottom,
  width = 800 - margin.left - margin.right;

var selectedCountry;
var selectedVariable;
var filteredData = [];
var formattedData;

var svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
var g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var t = function () {
  return d3.transition().duration(1000);
};

var parseTime = d3.timeParse("%Y");
var formatTime = d3.timeFormat("/Y");
var bisectDate = d3.bisector(function (d) {
  return d.date;
}).left;

// Add the line for the first time
g.append("path")
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "grey")
  .attr("stroke-width", "3px");

// Labels
var xLabel = g
  .append("text")
  .attr("class", "x axisLabel")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Time");
var yLabel = g
  .append("text")
  .attr("class", "y axisLabel")
  .attr("transform", "rotate(-90)")
  .attr("y", -60)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Price (USD)");

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// X-axis
var xAxisCall = d3.axisBottom().ticks(4);
var xAxis = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")");

// Y-axis
var yAxisCall = d3.axisLeft();
var yAxis = g.append("g").attr("class", "y axis");

/************* Donut Chart *********************/

var donut_width = 400,
  donut_height = 300,
  donut_radius = Math.min(donut_width, donut_height) / 2;

//d3.scale.category20()
var donut_color = d3.scaleOrdinal(d3.schemePastel1);

//d3.layout.pie()
var pie = d3
  .pie()
  .value(function (d) {
    return d.count;
  })
  .sort(null);

var arc = d3
  .arc()
  .innerRadius(donut_radius - 80)
  .outerRadius(donut_radius - 20);

var donut_svg = d3
  .select("#donut-chart-area")
  .append("svg")
  .attr("width", donut_width)
  .attr("height", donut_height)
  .append("g")
  .attr(
    "transform",
    "translate(" + donut_width / 2 + "," + donut_height / 2 + ")"
  );

/************** end of Donut Chart ****************/

// Event listeners
$("#var-select").on("change", function () {
  update(formattedData);
});
$("#country-select").on("change", function () {
  update(formattedData);
});

// Add jQuery UI slider
$("#date-slider").slider({
  range: true,
  max: parseTime("1960").getTime(),
  min: parseTime("2020").getTime(),
  step: 86400000, // One day
  values: [parseTime("1960").getTime(), parseTime("2020").getTime()],
  slide: function (event, ui) {
    $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
    $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
    update();
  }
});

d3.json("data/wave1.json", function (error, data) {
  console.log(data);
  formattedData = data;

  update(data);

  // Init donut data
  var initDonutData = [{ degree: "Very important", count: "0" }];

  initDonutData.map(function (d) {
    d.count = +d.count;
    return d;
  });

  change(initDonutData);
});

var detailInfo = [];

/********************** line chart update ****************** */

function update(data) {
  /******************* line chart update ***********/
  // Get selected variable
  selectedCountry = $("#country-select").val();
  selectedVariable = $("#var-select").val();
  console.log(selectedCountry);
  console.log(selectedVariable);

  // Filter year
  var detailYear;
  // Filter data by country;
  filteredData = data.map(function (year) {
    return year["countries"].filter(function (country) {
      return country.country == selectedCountry;
    });
  });
  console.log("filter data by country");
  console.log(filteredData);

  // Filter data by variable based on filtered country
  detailInfo = [];

  filteredData.map(function (country) {
    return country.filter(function (variable) {
      variable[selectedVariable]["Very important"] = +variable[
        selectedVariable
      ]["Very important"];
      variable[selectedVariable]["Rather important"] = +variable[
        selectedVariable
      ]["Rather important"];
      variable[selectedVariable]["Not very important"] = +variable[
        selectedVariable
      ]["Not very important"];
      variable[selectedVariable]["Not at all important"] = +variable[
        selectedVariable
      ]["Not at all important"];
      variable[selectedVariable]["No answer"] = +variable[selectedVariable][
        "No answer"
      ];
      variable[selectedVariable]["Don´t know"] = +variable[selectedVariable][
        "Don´t know"
      ];
      variable[selectedVariable]["number"] = +variable[selectedVariable][
        "number"
      ];
      variable[selectedVariable]["year"] = +variable[selectedVariable]["year"];

      detailInfo.push(variable[selectedVariable]);
      return variable;
    });
  });
  console.log("filter variable by variable based on filtered country");
  console.log(detailInfo);

  // var donutTryData = [
  //     { "degree": "East", "count": "53245" },
  //     { "degree": "West", "count": "28479" },
  //     { "degree": "South", "count": "19697" },
  //     { "degree": "North", "count": "24037" },
  //     { "degree": "Central", "count": "40245" }
  // ];
  // donutTryData.map(function (d) {
  //     d.count = +d.count;
  //     return d
  // })

  // Update scales
  var x = d3
    .scaleLinear()
    .domain([1985, 2015])
    .range([0, width]);

  var y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  // Update axes
  xAxisCall.scale(x);
  xAxis.transition(t()).call(xAxisCall);
  yAxisCall.scale(y);
  yAxis.transition(t()).call(yAxisCall);

  //Line Path
  line = d3
    .line()
    .x(function (d) {
      return x(d["year"]);
    })
    .y(function (d) {
      return y(d["Very important"]);
    });

  // Update our line path
  g.select(".line")
    .transition(t)
    .attr("d", line(detailInfo));

  // Circle
  //DATA JOIN
  var circles = g.selectAll("circle").data(detailInfo);
  console.log("detailInfo");
  console.log(detailInfo);

  //EXIT
  circles
    .exit()
    .transition(t)
    .attr("fill-opacity", 0)
    .remove();

  //UPDATE
  circles
    .transition(t)
    .attr("cx", function (d) {
      return x(d["year"]);
    })
    .attr("cy", function (d) {
      return y(d["Very important"]);
    })
    .attr("r", "10");

  //ENTER
  circles
    .enter()
    .append("circle")
    .attr("r", 0)
    .attr("fil-opacity", 0)
    .transition(t)
    .attr("cx", function (d) {
      console.log("update circle");
      console.log(d["year"]);
      return x(d["year"]);
    })
    .attr("cy", function (d) {
      console.log(y(d["Very important"]));
      return y(d["Very important"]);
    })
    .attr("r", "10")
    .attr("fill", "red")
    .attr("fill-opacity", 1);

  // Clear old tooltips
  d3.select(".focus").remove();
  d3.select(".overlay").remove();

  // Tooltip code
  var focus = g
    .append("g")
    .attr("class", "focus")
    .style("display", "none");
  focus
    .append("line")
    .attr("class", "x-hover-line hover-line")
    .attr("y1", 0)
    .attr("y2", height);
  focus
    .append("line")
    .attr("class", "y-hover-line hover-line")
    .attr("x1", 0)
    .attr("x2", width);
  focus.append("circle").attr("r", 5);
  focus
    .append("text")
    .attr("x", 15)
    .attr("dy", ".31em");
  svg
    .append("rect")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function () {
      focus.style("display", null);
    })
    .on("mouseout", function () {
      focus.style("display", "none");
    })
    .on("mousemove", mousemove)
    .on("click", function () {
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(detailInfo, x0, 1),
        d0 = detailInfo[i - 1],
        d1 = detailInfo[i],
        d = d1 && d0 ? (x0 - d0.year > d1.year - x0 ? d1 : d0) : 0;
      var donutData = [];

      console.log("==============");
      console.log(d);
      var a = Object.keys(d).join(" "); // "name1 name2"
      console.log(a);
      Object.keys(d).filter(function (key) {
        if (key == "year" || key == "number") {
          console.log("lalalal");
        } else {
          var donutDataElement = {};
          donutDataElement.degree = key;
          donutDataElement.count = d[key];
          donutData.push(donutDataElement);
        }
      });
      change(donutData);

      console.log("donutData");
      console.log(donutData);
    });

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(detailInfo, x0, 1),
      d0 = detailInfo[i - 1],
      d1 = detailInfo[i],
      d = d1 && d0 ? (x0 - d0.year > d1.year - x0 ? d1 : d0) : 0;

    focus.attr(
      "transform",
      "translate(" + x(d.year) + "," + y(d["Very important"]) + ")"
    );
    focus.select("text").text(function () {
      return d3.format(".2%")(d["Very important"].toFixed(2) / 100);
    });
    focus.select(".x-hover-line").attr("y2", height - y(d["Very important"]));
    focus.select(".y-hover-line").attr("x2", -x(d.year));
    console.log("what is d");
    console.log(d);
  }

  // Update y-axis label
  var newText;
  if (selectedVariable == "work") {
    newText = "Work Importance: Average Percentage";
  } else if (selectedVariable == "friends") {
    newText = "Friends Importantance: Average Percentage";
  } else {
    newText = "Leisure Time Importance: Average Percentage";
  }
  yLabel.text(newText);

  // Donut Try Data

  var donutData = [];
  var donutDataElement = {};
  donutDataElement.degree = "Very Important";
  donutDataElement.count = detailInfo[0]["Very important"];
  donutData.push(donutDataElement);
  // console.log("donutDataElement");
  // console.log(donutDataElement);
  // console.log("detailInfo");
  // console.log(detailInfo);

  // var initDonutData = [
  //     { "degree": " ", "count": " " },
  // ];

  // donutTryData.map(function (d) {
  //     d.count = +d.count;
  //     return d
  // })

  // change(initDonutData);
}

function change(donutTryData) {
  console.log(donutTryData);

  var degree = donutTryData;
  var path = donut_svg.selectAll("path");

  var data0 = path.data(),
    data1 = pie(degree);
  console.log("degree");
  console.log(degree);

  // JOIN elements with new data.
  path = path.data(data1, key);

  // EXIT old elements from the screen.
  path
    .exit()
    .datum(function (d, i) {
      return findNeighborArc(i, data1, data0, key) || d;
    })
    .transition()
    .duration(750)
    .attrTween("d", arcTween)
    .remove();

  // UPDATE elements still on the screen.
  path
    .transition()
    .duration(750)
    .attrTween("d", arcTween);

  // ENTER new elements in the array.
  path
    .enter()
    .append("path")
    .each(function (d, i) {
      this._current = findNeighborArc(i, data0, data1, key) || d;
    })
    .attr("fill", function (d) {
      return donut_color(d.data.degree);
    })
    .on("mouseover", mouseover)
    .transition()
    .duration(750)
    .attrTween("d", arcTween);

  // Add the mouseleave handler to the donut circle
  donut_svg.on("mouseleave", mouseleave);
}

function key(d) {
  return d.data.degree;
}

function findNeighborArc(i, data0, data1, key) {
  var d;
  return (d = findPreceding(i, data0, data1, key))
    ? { startAngle: d.endAngle, endAngle: d.endAngle }
    : (d = findFollowing(i, data0, data1, key))
      ? { startAngle: d.startAngle, endAngle: d.startAngle }
      : null;
}

// Find the element in data0 that joins the highest preceding element in data1.
function findPreceding(i, data0, data1, key) {
  var m = data0.length;
  while (--i >= 0) {
    var k = key(data1[i]);
    for (var j = 0; j < m; ++j) {
      if (key(data0[j]) === k) return data0[j];
    }
  }
}

// Find the element in data0 that joins the lowest following element in data1.
function findFollowing(i, data0, data1, key) {
  var n = data1.length,
    m = data0.length;
  while (++i < n) {
    var k = key(data1[i]);
    for (var j = 0; j < m; ++j) {
      if (key(data0[j]) === k) return data0[j];
    }
  }
}

function arcTween(d) {
  var i = d3.interpolate(this._current, d);
  this._current = i(1);
  return function (t) {
    return arc(i(t));
  };
}

function mouseover(d) {
  console.log("mouseover!jaja");
  console.log(d);
  var currentSegment = [];
  currentSegment.unshift(d);

  // Display the explanation in the center
  d3.select("#explanation").style("visibility", "");

  // Display the value in the center
  d3.select("#percentage").text(d.value);

  // Display the description in the center
  d3.select("#description").text(d.data.degree);

  // Fade all the segment
  donut_svg.selectAll("path").style("opacity", 0.4);

  // Hight the current segment
  donut_svg
    .selectAll("path")
    .filter(function (d) {
      return currentSegment.indexOf(d) >= 0;
    })
    .style("opacity", 1);
}

function mouseleave(d) {
  console.log("mouseleave!");

  // Hide the explanation
  d3.select("#explanation")
    .transition()
    .duration(500)
    .style("visibility", "hidden");

  // Set each segment to full opacity
  d3.selectAll("path")
    .transition()
    .duration(500)
    .style("opacity", 1);
}
