/*
 * Timeline - Object constructor function (Inspired bu a lab from CS 171 2018)
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

Timeline = function(_parentElement, _data, _eventHandler, _tooltipData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler =_eventHandler;
    this.tooltipData = _tooltipData;

    this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

Timeline.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 50, right: 30, bottom: 30, left: 60 };

    vis.width = $("#" + "map-dashboard").width() - vis.margin.left - vis.margin.right;
    vis.height = vis.width*0.33 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // SVG clipping path
    vis.svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.customXAxis= function(g) {
        g.call(vis.xAxis);
        g.select(".domain").remove();
    };

    vis.yAxis = d3.axisLeft()
        .tickSize(-vis.width)
        .scale(vis.y);

    vis.customYAxis=function(g) {
        g.call(vis.yAxis);
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
        g.selectAll(".tick text").attr("x", -4).attr("dy", 0);
        g.select(".domain").remove();

    };

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Axis title
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Total reported breaches per month");

    // Append a path for the area function, so that it is later behind the brush overlay
    vis.timePath = vis.svg.append("path")
        .attr("class", "area area-time");

    // Define the D3 path generator
    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) {
            return vis.x(d.value.time);
        })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d.value.value); });

    // Initialize brushing component
    vis.currentBrushRegion = null;
    vis.brush = d3.brushX()
        .extent([[0,0],[vis.width, vis.height]])
        .on("brush", function() {
            // User just selected a specific region
            vis.currentBrushRegion = d3.event.selection;

            vis.currentBrushRegion = vis.currentBrushRegion.map(vis.x.invert);

            // 3. Trigger the event 'selectionChanged' of our event handler
            $(vis.eventHandler).trigger("selectionChanged", vis.currentBrushRegion);
        });

    // Append brush
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush")


    // Add highlights
    vis.highlight = vis.svg.append("g")
        .attr("class","line highlights");

    // define the div for the tooltip
    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}



/*
 * Data wrangling
 */

Timeline.prototype.wrangleData = function(){
    var vis = this;

    var dateParser2 = d3.timeParse("%Y-%m");

    //Bin by month
    for(ii= 0 ; ii< vis.data.length ; ii++){
        vis.data[ii].date  = dateFormatter(vis.data[ii].time)
    };

    var nest = d3.nest()
        .key(function(d) { return d.date; })
        .rollup(function(v){return{
            value: d3.sum(v,function(d){return d.count}),
            time: dateParser2(v[1].date)
        } })
        .entries(vis.data);


    vis.displayData = nest;

    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

Timeline.prototype.updateVis = function(){
    var vis = this;

    // Set domains
    var minMaxY= [0, d3.max(vis.displayData.map(function(d){ return d.value.value; }))];
    var minMaxX = d3.extent(vis.displayData.map(function(d){ return d.value.time; }));
    vis.y.domain(minMaxY);
    vis.x.domain(minMaxX);

    // Call brush component here
    vis.brushGroup.call(vis.brush);

    // set initial brushed area
    // brush x range is 0 to 640
    d3.select(".brush").call(vis.brush.move, [200, 440])

    vis.currentBrushRegion = [200, 440].map(vis.x.invert);

    // 3. Trigger the event 'selectionChanged' of our event handler
    $(vis.eventHandler).trigger("selectionChanged", vis.currentBrushRegion);


    // Call the area function and update the path
    // D3 uses each data point and passes it to the area function.
    // The area function translates the data into positions on the path in the SVG.
    vis.timePath
        .datum(vis.displayData)
        .attr("d", vis.area);


    //Draw highlight lines
    vis.highlight.selectAll('line').data(vis.tooltipData)
        .enter().append('line')
        .attr('x1',function(d){
            return vis.x(d.time);
    })
        .attr('y1',vis.y(0))
        .attr('x2',function(d){
        return vis.x(d.time);
    })
        .attr('y2',vis.y(minMaxY[1]))
        .attr("stroke","#fc8d59")
        .attr("stroke-width","3")
        .attr("stroke-linecap","round")
        .on("mouseover", function(d) {
            vis.div.transition()
                .duration(200)
                .style("opacity", .9);
            vis.div.html(`Date: <span style='color:#FFDB6D'>${d.date}</span><br><br>
                   Event: <span style='color:#FFDB6D'>${d.event}</span><br>`)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .style("max-width", 100);
        })
        .on("mouseout", function(d) {
            vis.div.transition()
                .duration(500)
                .style("opacity", 0)
        });

    vis.highlight.selectAll('circle').data(vis.tooltipData)
        .enter().append('circle')
        .attr('cx',function(d){
            return vis.x(d.time);
        })
        .attr('cy',vis.y(minMaxY[1]))
        .attr('r',5)
        .attr("fill","#fc8d59")
        .attr("stroke","none")
        .on("mouseover", function(d) {
        vis.div.transition()
            .duration(200)
            .style("opacity", .9);
        vis.div.html(`Date: <span style='color:#FFDB6D'>${d.date}</span><br><br>
                   Event: <span style='color:#FFDB6D'>${d.event}</span><br>`)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .style("max-width", "300px");;
    })
        .on("mouseout", function(d) {
            vis.div.transition()
                .duration(500)
                .style("opacity", 0)
        });


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.customXAxis);
    vis.svg.select(".y-axis").call(vis.customYAxis);
}

Timeline.prototype.onDropDownChange = function(){
    var vis = this;

    // Remove brush
    vis.brushGroup.remove();
    // Append brush
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush");

    vis.wrangleData();
};
