queue()
  .defer(d3.csv,"data/ios.csv")
  .defer(d3.csv,"data/android.csv")
  .await(loadData);

ForceLayout = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.filter = "connections";

  this.initVis();
}

// initialize force layout
ForceLayout.prototype.initVis = function() {
  var vis = this;

  // margin convention
  vis.margin = { top: 0, right: 50, bottom: 0, left: 50 };

  // size settings
  vis.width = 425;
  vis.height = 450;
  vis.padding = 1.5; // separation between same-color circles
  vis.clusterPadding = 6; // separation between different-color circles
  vis.maxRadius = vis.height * 0.14;

  // create svg
  vis.svg = d3.select(vis.parentElement)
    .append('svg')
    .attr('height', vis.height)
    .attr('width', vis.width)
    .append('g').attr('transform', 'translate(' + vis.width / 2 + ',' + vis.height / 2 + ')');

  vis.g = vis.svg.append("g");

  // define the div for the tooltip
  vis.div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // define the div for the legend tooltip
  vis.div2 = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // create color scale
  vis.z = d3.scaleOrdinal().range(colorbrewer["YlOrRd"][8].slice(3, 8));

  // create set for categories
  vis.categorySet = new Set();

  // organize data by app category
  Object.keys(vis.data).forEach(function(k) {
    vis.categorySet.add(vis.data[k]["appCategory"]);
  });

  var counter = 1;
  vis.category = {};

  // assign numeric ids to each category
  vis.categorySet.forEach(function(c) {
    vis.category[c] = counter;
    counter += 1;
  });

  // create legend
  var legend = d3.select("#vis-3-legend-container").append("div")
    .attr("id", "vis-3-legend");

  // update legend
  vis.divs = legend.selectAll("div.color-container")
      .data(Object.keys(vis.category))
    .enter().append("div")
      .attr("class", "color-container");

  // add colored squares
  vis.divs.append("span")
      .attr("class", "color")
    .merge(vis.divs)
      .style("background-color", function(d) {
        return vis.z(vis.category[d]);
      });

  // add legend labels
  vis.divs.append("p")
    .attr("class", "color-text caption");

  d3.selectAll("#vis-3-legend p.color-text").each(function(d) {
    d3.select(this).text(d);
  });

  // create averages container
  vis.averageContainer = d3.select("#vis-3-average-container");

  vis.wrangleData();
}

// data wrangling
ForceLayout.prototype.wrangleData = function() {
  var vis = this;

  vis.values = {};
  vis.top = {};

  vis.categorySet.forEach(function(c) {
    vis.values[c] = [];
    vis.top[c] = [];
  });

  // organize numeric data values by category
  Object.keys(vis.data).forEach(function(k) {
    vis.values[vis.data[k]["appCategory"]].push(vis.data[k][vis.filter]);
    vis.top[vis.data[k]["appCategory"]].push({ value: vis.data[k][vis.filter], app: k });
  });

  // find top apps by numeric value
  Object.keys(vis.top).forEach(function(k) {
    vis.top[k].sort(function(a, b) {
      return b.value - a.value;
    });

    // create HTML string for top apps
    vis.top[k] = vis.top[k].slice(0, 5).map(function(curr) {
      return `<span>${curr.app} (${curr.value})</span><br>`
    }).join("");
  });

  // create tooltip for legend labels
  vis.divs.on("mouseover", function(d) {
    vis.div2.transition()
        .duration(200)
        .style("opacity", .9);
    vis.div2.html(`Category: <span class='tooltip-text'>${d}</span><br><br>
                   Apps: <span class='tooltip-text'>${vis.values[d].length}</span><br><br>
                   Average: <span class='tooltip-text'>${vis.averages[d]}</span><br><br>
                   Top Apps<br><span class='tooltip-text tooltip-margin'>${vis.top[d]}</span>`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
  .on("mouseout", function(d) {
    vis.div2.transition()
      .duration(500)
      .style("opacity", 0)
  });

  vis.averages = {};

  // get averages for each category
  vis.categorySet.forEach(function(c) {
    vis.averages[c] = math.mean(vis.values[c]);
  });

  // update the visualization
  vis.updateVis();
}

// drawing function
ForceLayout.prototype.updateVis = function() {
  var vis = this;

  var n = Object.keys(vis.data).length; // total number of nodes
  var m = vis.categorySet.length; // number of distinct clusters
  var clusters = new Array(m);

  // radius scale for nodes
  var radiusScale = d3.scaleLinear()
    .domain(d3.extent(Object.keys(vis.data), (k) => { return +vis.data[k][vis.filter]} ))
    .range([4, vis.maxRadius]);

  // create node objects with size and data
  var nodes = Object.keys(vis.data).map((k) => {
    // scale radius to fit on the screen
    var scaledRadius  = radiusScale(+vis.data[k][vis.filter]),
        forcedCluster = vis.category[vis.data[k]["appCategory"]];

    // add cluster id and radius to array
    d = {
      cluster     : forcedCluster,
      r           : scaledRadius,
      app         : k,
      connections : parseFloat(vis.data[k][vis.filter]),
      appCategory : vis.data[k]["appCategory"]
    };
    // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
    if (!clusters[forcedCluster] || (scaledRadius > clusters[forcedCluster].r)) clusters[forcedCluster] = d;

    return d;
  });

  // select all circles
  var circles = vis.g
      .datum(nodes)
    .selectAll('.circle-node')
      .data(d => d);

  // merge circles and call drag functions
  var circlesMerge = circles
    .enter()
    .append('circle')
      .attr('class', 'circle-node')
      .attr('stroke-width', 0.5)
      .attr('stroke', '#ffffff')
      .text("dsf")
    .merge(circles)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // select all text
  var text = vis.g
      .datum(nodes)
    .selectAll('.text-node')
      .data(d => d);

  // merge text and call drag functions
  var textMerge = text
    .enter().append('text')
      .attr("class", "text-node")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) {
       var returnString = '';

       if (d.r > 20) {
         returnString = d.app.replace(' (Android)', '').replace(' (iOS)', '');

         return returnString.length < 10 ? returnString : returnString.slice(0, 7) + '...';
       } else {
         return '';
       }
     })
    .merge(text)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // create tooltips for circles
  circlesMerge
    // add tooltips to each circle
    .on("mouseover", function(d) {
        vis.div.transition()
            .duration(200)
            .style("opacity", .9);
        vis.div.html(`App: <span style='color:#FFDB6D'>${d.app}</span><br><br>
                   Category: <span style='color:#FFDB6D'>${d.appCategory}</span><br><br>
                   ${vis.filter !== 'connections' ? 'Third-Party ' : ''}Connections: <span style='color:#FFDB6D'>${d.connections}</span><br>
                  `)
            .style("left", (d3.event.pageX + 50) + "px")
            .style("top", (d3.event.pageY - 50) + "px");
        })
    .on("mouseout", function(d) {
      vis.div.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // create tooltips for text
  textMerge
    // add tooltips to text
    .on("mouseover", function(d) {
          vis.div.transition()
              .duration(200)
              .style("opacity", .9);
          vis.div.html(`App: <span style='color:#FFDB6D'>${d.app}</span><br><br>
                     Category: <span style='color:#FFDB6D'>${d.appCategory}</span><br><br>
                     ${vis.filter !== 'connections' ? 'Third-Party ' : ''}Connections: <span style='color:#FFDB6D'>${d.connections}</span><br>
                    `)
              .style("left", (d3.event.pageX + 50) + "px")
              .style("top", (d3.event.pageY - 50) + "px");
          })
      .on("mouseout", function(d) {
        vis.div.transition()
          .duration(500)
          .style("opacity", 0);
      });

  // create transitions for circle size and color
  circlesMerge
    .transition()
    .duration(1000)
    .attr('r', (d) => d.r)
    .attr('fill', (d) => vis.z(d.cluster));

  circles.exit().remove();

  // update averages title
  d3.select("#units-title").text(`Average Number of ${vis.filter !== 'connections' ? 'Third-Party' : 'Total'} Domains Receiving Data`);

  // update averages
  var averageText = vis.averageContainer.selectAll("h1.average")
    .data(Object.keys(vis.category), function(d) {
      return vis.averages[d];
    });

  var format = d3.format(",d");

  // create average text and transitions between numbers
  averageText
    .enter().append("h1")
      .attr("class", "average")
      .style("color", function(d) {
        return vis.z(vis.category[d]);
      })
    .merge(averageText)
    .transition()
    .duration(1000)
    .on("start", function repeat() {
      d3.active(this)
          .tween("text", function(d) {
            var that = d3.select(this),
                i = d3.interpolateNumber(that.text().replace(/,/g, ""), vis.averages[d]);
            return function(t) { that.text(format(i(t))); };
          })
        .transition()
          .delay(1000)
          .on("start", repeat);
    });

  // create the clustering/collision force simulation
  var simulation = d3.forceSimulation(nodes)
    .velocityDecay(0.1)
    .force("x", d3.forceX().strength(.0005))
    .force("y", d3.forceY().strength(.0005))
    .force("collide", collide)
    .force("cluster", clustering)
    .on("tick", ticked);

  function ticked() {
    circlesMerge
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);
    textMerge
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y);
  }

  // drag functions used for interactivity
  function dragstarted(d) {
    console.log(d)
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // implementations of custom forces
  function clustering(alpha) {
      nodes.forEach(function(d) {
        var cluster = clusters[d.cluster];
        if (cluster === d) return;
        var x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y),
            r = d.r + cluster.r;
        if (l !== r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          cluster.x += x;
          cluster.y += y;
        }
      });
  }

  function collide(alpha) {
    var quadtree = d3.quadtree()
        .x((d) => d.x)
        .y((d) => d.y)
        .addAll(nodes);

    nodes.forEach(function(d) {
      var r = d.r + vis.maxRadius + Math.max(vis.padding, vis.clusterPadding),
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {

        if (quad.data && (quad.data !== d)) {
          var x = d.x - quad.data.x,
              y = d.y - quad.data.y,
              l = Math.sqrt(x * x + y * y),
              r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? vis.padding : vis.clusterPadding);
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.data.x += x;
            quad.data.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    });
  }
}

ForceLayout.prototype.updateFilter = function(filter) {
  var vis = this;

  vis.filter = filter;

  vis.wrangleData();
};

// adapted from https://bl.ocks.org/Thanaporn-sk/c7f74cb5051a0cdf6cf077a9db332dfb
function loadData(error, ios, android) {
  var data = {};

  function processRow(type) {
    return function(datum) {
      var app = `${datum["App"]} (${type})`;

      // filter out categories not related to medical and health apps
      if (["Photo & Video",
           "Navigation",
           "Business",
           "Games",
           "Shopping",
           "Travel & Local",
           "Communication"].indexOf(datum["AppCategory"]) > -1) {
        return;
      }

      if (!(app in data)) {
        data[app] = {
          appCategory: datum["AppCategory"],
          categories: {},
          connections: new Set(),
          thirdPartyConnections: new Set()
        };
      }

      var category = datum["Category"];

      // organize by category of connection
      if (category) {
        if (!(category in data[app]["categories"])) {
          data[app]["categories"][category] = 0;
        }

        data[app]["categories"][category] += 1;
      }

      // add domain to set for app
      data[app]["connections"].add(`${datum["Category"]}-${datum["App_HOST"]}`);

      // add third-party domain to set if applicable
      if (datum["Third_party"]) {
        data[app]["thirdPartyConnections"].add(`${datum["Category"]}-${datum["App_HOST"]}`);
      }
    };
  }

  // process both iOS and android apps
  ios.forEach(processRow("iOS"));
  android.forEach(processRow("Android"));

  // count total number of connections and third-party connections
  Object.keys(data).forEach(function(key) {
    data[key]["connections"] = data[key]["connections"].size;
    data[key]["thirdPartyConnections"] = data[key]["thirdPartyConnections"].size;
  });

  // initialize force layout
  var forceLayout = new ForceLayout("#vis-3-area", data);

  // add listener for changes to Bootstrap dropdown
  var a = document.getElementById("dropdown-menu").getElementsByTagName("a");

  for (var i = 0; i < a.length; i++) {
    a[i].addEventListener("click", function(e) {
      // prevent default link behavior
      e.preventDefault();

      // update filter value
      document.getElementById("dropdownMenuButton3").innerHTML = this.innerHTML;
      forceLayout.updateFilter(this.dataset.key);
    })
  }
};
