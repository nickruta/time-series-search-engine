queue()
  .defer(d3.csv,"data/cost_full_record_by_state.csv")
  .await(loadData);

Bar = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.filter = "ascending";

  this.initVis();
}

Bar.prototype.initVis = function() {
  var vis = this;

  // set margin
  vis.margin = { top: 30, right: 50, bottom: 50, left: 80 };
  vis.width = 400 - vis.margin.left - vis.margin.right;
  vis.height = 400 - vis.margin.top - vis.margin.bottom;

  // create SVG
  vis.svg = d3.select("#vis-4-area").append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  // define the div for the tooltip
  vis.div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // set ranges
  vis.x = d3.scaleBand()
    .range([20 , vis.width])
    .paddingInner(0.2)

  vis.y = d3.scaleLinear()
    .range([vis.height, 0])

  // axes
  vis.xAxis = d3.axisBottom()
    .tickSizeOuter(0)
    .scale(vis.x);

  vis.yAxis = d3.axisLeft()
    .scale(vis.y);

  // create group elements for axes
  vis.xAxisGroup = vis.svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0, " + vis.height + ")");

  vis.yAxisGroup = vis.svg.append("g")
    .attr("class", "axis y-axis");

  // create x-axis label
  var x2DX = vis.width / 2;
  var x2DY = vis.margin.bottom - 5;

  vis.xAxisGroup.append("text")
    .attr("stroke", "black")
    .attr("transform", "translate(" + x2DX + ", " + x2DY + ")")
    .text("U.S. States");

  // create y-axis label
  var y2DX = (-vis.height / 2);
  var y2DY = 20 - vis.margin.left;

  vis.yAxisGroup.append("text")
    .attr("class", "y-label")
    .attr("stroke", "black")
    .attr("transform", "rotate(270) translate(" + y2DX + ", " + y2DY + ")")
    .text("Total Amount Sold ($)");

  vis.wrangleData();
};

// data wrangling
Bar.prototype.wrangleData = function() {
  var vis = this;

  // sort data
  vis.displayData = vis.data.sort(function(a, b) {
    return vis.filter === "ascending" ? b.amount_pop - a.amount_pop : a.amount_pop - b.amount_pop;
  }).slice(0, 10);

  vis.updateVis();
}

Bar.prototype.updateVis = function() {
    var vis = this;

    // update order of x domain
    vis.x.domain(vis.displayData.map(function(d) { return d.abbreviation; }));
    vis.y.domain([0, d3.max(vis.displayData, function(d) { return d.amount_pop; })]);

    vis.bar = vis.svg.selectAll("rect")
      .data(vis.displayData);

    vis.bar.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", "rgb(227, 26, 28)")
      .merge(vis.bar)
        // add tooltips to each circle
        .on("mouseover", function(d) {
            vis.div.transition()
                .duration(200)
                .style("opacity", .9);
            vis.div.html(`Discharge Price: <span style='color:#FFDB6D'>$${d3.format(",")(d.amount_pop)}</span>`)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          vis.div.transition()
            .duration(500)
            .style("opacity", 0)
        })
        .transition()
        .duration(800)
        .attr("x", function(d) { return vis.x(d.abbreviation); })
        .attr("width", vis.x.bandwidth())
        .attr("y", function(d) { return vis.y(d.amount_pop); })
        .attr("height", function(d) { return vis.height - vis.y(d.amount_pop); });

    var formatSuffix = d3.format(".2s");

    vis.bar.append("text")
      .attr("text-anchor", "end")
      .attr("x", function(d){ return vis.x(d.abbreviation) + vis.x.bandwidth()/2 + 6;})
      .attr("y", function(d) { return vis.y(d.amount_pop) - 6; })
      .attr("dx", ".35em")
      .text(function(d) { return formatSuffix(d.amount_pop);});

    // update axes
    vis.svg.select(".x-axis")
      .transition()
      .duration(800)
      .call(vis.xAxis);

    vis.svg.select(".y-axis")
      .transition()
      .duration(800)
      .call(vis.yAxis);
}

Bar.prototype.updateFilter = function(filter) {
  var vis = this;

  vis.filter = filter;

  vis.wrangleData();
}

// initialize data
function loadData(error, data) {
  // turn numeric values into numbers
  data.forEach(function(d){
    d.amount_pop = +d.amount_pop;
  });

  // filter nan
  data = data.filter(function(d){
    if (isNaN(d.amount_pop)) {
      return false;
    }

    d.amount_pop = parseInt(d.amount_pop, 10);
    return true;
  });

  var barGraph = new Bar("#vis-4-area", data);

  // add listener for changes to Bootstrap dropdown
  var selection = document.getElementById("dropdown-menu4").getElementsByTagName("a");

  for (var i = 0; i < selection.length; i++) {
    selection[i].addEventListener("click", function(e) {
      // prevent default link behavior
      e.preventDefault();

      // update filter value
      document.getElementById("dropdownMenuButton4").innerHTML = this.innerHTML;
      barGraph.updateFilter(this.dataset.key); // change function name
    })
  }
}