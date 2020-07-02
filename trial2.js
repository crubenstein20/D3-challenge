//trial.js
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 110
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var chart = d3
    .select("#scatter")
    .append("div")
    .classed("chart", true);

var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty"
var chosenYAxis = "healthcare"

// create x scales based on which x label viewer selects
function xScale(totalData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(totalData, d => d[chosenXAxis]) * 0.8,
        d3.max(totalData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
    return xLinearScale;
};

// create y scales based on which y label viewer selects
function yScale(totalData, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(totalData, d => d[chosenYAxis]) * 0.8,
        d3.max(totalData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
    return yLinearScale;
}

// function to update the x-axis when clicked
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
};

// function to update the y-axis when clicked
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(2000)
        .call(leftAxis);
    return yAxis;
};

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(2000)
        .attr('cx', data => newXScale(data[chosenXAxis]))
        .attr('cy', data => newYScale(data[chosenYAxis]))
    return circlesGroup;
};

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(2000)
        .attr('x', d => newXScale(d[chosenXAxis]))
        .attr('y', d => newYScale(d[chosenYAxis]));
    return textGroup
};

function styleX(value, chosenXAxis) {
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    else if (chosenXAxis === 'age') {
        return `${value} years`;
    }
    else {
        return `${value}`;
    }
};

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        var xLabel = "Median Age:";
    }
    else {
        var xLabel = "Median Income:";
    }

    if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare:";
    }
    else if (chosenYAxis === "obesity") {
        var yLabel = "Obese:";
    }
    else {
        yLabel = "Smokes:";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -40])
        .html(function(d) {
        return (`<strong>${d.state}</strong><br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    return circlesGroup;
};

d3.csv("./data.csv").then(function(totalData) {
    console.log(totalData);

    totalData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.income = +data.income;
        data.obesity = +data.obesity;
    });

    var xLinearScale = xScale(totalData, chosenXAxis);
    var yLinearScale = yScale(totalData, chosenYAxis)
    
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(totalData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "10")
        .attr("opacity", ".6")

    var textGroup = chartGroup.selectAll('.stateText')
        .data(totalData)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function(d){return d.abbr});

    //create group for 3 x-axis
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var poverty = xlabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("(%) in Poverty");

    var age = xlabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)");

    var household = xlabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)");

    //append y-axis
    var ylabelsGroup = chartGroup.append('g')
        .attr("transform", `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcare = ylabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 30)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    var smokes = ylabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 40)
        .attr("x", 0)
        .attr("dx", "1em")
        .attr("value", "smokes")
        .text("Smokes (%)");

    var obese = ylabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 60)
        .attr("x", 0)
        .attr("dx", "1em")
        .attr("value", "obesity")
        .text("Obesity (%)");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;
                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(totalData, chosenXAxis);
                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                //update circle text
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    poverty
                        .classed("active", true)
                        .classed("inactive", false);
                    age
                        .classed("active", false)
                        .classed("inactive", true);
                    household
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    poverty
                        .classed("active", false)
                        .classed("inactive", true);
                    age
                        .classed("active", true)
                        .classed("inactive", false);
                    household
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    poverty
                        .classed("active", false)
                        .classed("inactive", true);
                    age
                        .classed("active", false)
                        .classed("inactive", true);
                    household
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        }); 
    ylabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // replaces chosenXAxis with value
                chosenYAxis = value;
                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(totalData, chosenYAxis);
                // updates x axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);
                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                //update circle texts
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcare
                        .classed("active", true)
                        .classed("inactive", false);
                    smokes
                        .classed("active", false)
                        .classed("inactive", true);
                    obese
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    healthcare
                        .classed("active", false)
                        .classed("inactive", true);
                    smokes
                        .classed("active", true)
                        .classed("inactive", false);
                    obese
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcare
                        .classed("active", false)
                        .classed("inactive", true);
                    smokes
                        .classed("active", false)
                        .classed("inactive", true);
                    obese
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        }); 
})/*.catch(function(error) {
    console.log(error);
});*/

//d3.select(window).on("resize", makeResponsive);
