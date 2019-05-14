// VISUALIZATION VIEW 1: NETWORK CONNECTION

// set primary dimensions for the radial display
var diameter = 550;
var radius = diameter / 2;
var innerRadius = radius - 100;

// used to select the previous node highlighted in categories outer vis.
var that_vis_1;

// init the d3 cluster and use the above dimensions
var cluster = d3.cluster()
  .size([360, innerRadius])
  .separation(function(a, b) { return (a.parent == b.parent ? 1 : a.parent.parent == b.parent.parent ? 2 : 4); });

// curved lines will be used to represent node connections
var line = d3.line()
  .x(xAccessor)
  .y(yAccessor)
  .curve(d3.curveBundle.beta(0.7));

// select the svg container and set the dimensions
var svg = d3.select('#vis-1-container')
  .attr('width', diameter + 320)
  .attr('height', diameter + 105)
  .append('g')
  .attr('transform', 'translate(' + (radius + 28) + ',' + (radius+60) + ')');

// format numbers for the legend and tool tip
var formatBreachNumber = d3.format(",");

// initialize the node's tool-tip
tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0]);

svg.call(tip);

// get the vis-1 network connections data
d3.json('data/vis-1.json', function (error, graph) {
  if (error) throw error;

  var idToNode = {};

  // relate the data to the nodes needed for each category
  graph.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });

  // relate the links for the connections between nodes
  graph.links.forEach(function (e) {
    e.source = idToNode[e.source];
    e.target = idToNode[e.target];
  });

  // artifact from original code structure used to sort the data
  graph.nodes.forEach(function (n) {
    n.chapters = n.chapters.map(function (chaps) { return chaps.split('.').map(function (c) { return parseInt(c); }); });
    n.chapters.sort(chapterCompare).reverse();
    n.firstChapter = n.chapters[0].map(function (d) { return d.toString().length == 1 ? '0' + d.toString() : d.toString(); }).join('.');
    n.num_breaches = n.num_breaches;
  });

  // create a linear scale for the radius of each node based on the number of breaches per category
  var breaches_scale = d3.scaleLinear()
    .domain([d3.min(graph.nodes, function(d) {return d.num_breaches; }), d3.max(graph.nodes, function(d) {return d.num_breaches; })])
    .range([6, 12]);

  // create a color scale for each node to have a level of saturation based on the number of companies in the category
  red_brewer_scale = ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#cb181d"];

  var color_scale = d3.scaleQuantile().range(red_brewer_scale);

  red_brewer_scale.forEach(function(d) {
        boxRange = color_scale.invertExtent(d);
  })

  color_scale.domain([
      d3.min(graph.nodes, function(d) {return d.companies.length; }), d3.max(graph.nodes, function(d) { return d.companies.length; })
  ]);

  // init the annotations section with info on You, the patient
  $("#vis-1-annotation-category").html("There are 39 connections between You, the Patient, and other categories of companies.")
  $("#vis-1-annotation-company").html("94% of the 693 companies in the Payer (Insurer) category have been <span style='font-family:GothamBold'>breached</span>.")

  // sort nodes around the radial design based on the order found in the dataset
  var tree = cluster(d3.hierarchy(chapterHierarchy(graph.nodes)).sort(function(a, b) {
    if (a.data.hasOwnProperty('firstChapter') && b.data.hasOwnProperty('firstChapter'))
      return a.data.firstChapter.localeCompare(b.data.firstChapter);
    return a.data.name.localeCompare(b.data.name);
  }));

  var leaves = tree.leaves();

  // source and target connections are found
  var paths = graph.links.map(function (l) {
    var source = leaves.filter(function (d) { return d.data === l.source; })[0];
    var target = leaves.filter(function (d) { return d.data === l.target; })[0];
    return source.path(target);
  });

  // paths are created for the links from node to node
  var link = svg.selectAll('.link')
    .data(paths)
    .enter().append('path')
    .attr('class', 'link')
    .attr('d', function (d) { return line(d) })
    .on('mouseover', function (l) {
      // set the effects for mouseover and mouseout on each category node
      link
        .style('stroke', null)
        .style('stroke-opacity', null);
      d3.select(this)
        .style('stroke', '#d62333')
        .style('stroke-opacity', 1);
      node.selectAll('circle')

      node.filter(function (n) { return n === l[0] || n === l[l.length - 1]; })
        .selectAll('circle')
        .style('fill', 'black');
    })
    .on('mouseout', function (d) {
      link
        .style('stroke', null)
        .style('stroke-opacity', null);
      node.selectAll('circle')
        .style('fill', function(d) {
          return color_scale(d.data.companies.length)
        })
    });

  // create the div to hold the tooltip for main network categories
  var div = d3.select(".container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // create nodes for each category
  var node = svg.selectAll('.node')
    .data(tree.leaves())
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', function (d) { return 'translate(' + xAccessor(d) + ',' + yAccessor(d) + ')'; })
    .on('mouseover', function (d) {

      // set the effects for mouseover each node
      node.style('fill', null);
      d3.select(this).selectAll('circle').style('fill', 'black');
      var nodesToHighlight = paths.map(function (e) { return e[0] === d ? e[e.length-1] : e[e.length-1] === d ? e[0] : 0})
        .filter(function (d) { return d; });

      node.filter(function (d) { return nodesToHighlight.indexOf(d) >= 0; })
        .selectAll('circle')
        .style('fill', '#555');
      link
        .style('stroke-opacity', function (link_d) {
          return link_d[0] === d | link_d[link_d.length - 1] === d ? 1 : 0.1;
        })
        .style('stroke', function (link_d) {
          return link_d[0] === d | link_d[link_d.length - 1] === d ? '#d62333' : '#999999';
        });
    })
    .on('mouseout', function (d) {

      // on mouseout, we hide the tooltips and make opacity changes to present selectable points
      tip.hide()
      div.style("opacity", 0.0)

      link
        .style('stroke-opacity', null)
        .style('stroke', null);
      node.selectAll('circle')
        .style('fill', function(d) {
          return color_scale(d.data.companies.length)
        });
    });

  node.append('circle').attr('r', function(d) {

    // color scale based on the number of breaches
    return breaches_scale(d['data'].num_breaches)
  })
    .append('title') // append a title with the category name
    .text(function (d) { return d.data.name; });

    // fill the cirlcle based on the color scale for number of files breached
   svg.selectAll("circle").style("fill", function(d) {
    return color_scale(d.data.companies.length)
   })
   .style("stroke", "black");

    // on click, we update the company and category text annotations and remove the center pack chart
    node.on('click', function(d) {

      // console.log(this.__data__.data.id)
      var category_id = this.__data__.data.id

        // if the category is You, there are no companies, otherwise show the companies in the center pack chart
        if (category_id == "You, the Patient") {
          $('#vis-1-annotation-category').fadeTo(400, 0.0, function() { $(this).html("There are 39 connections between You, the Patient, and other categories of companies.").fadeTo(500, 1.0); });
          resetVis1();
          $("#vis-1-annotation-company").hide()
        } else {

          // remove the previous packChart, if there is one
          d3.select("#packChart").remove();
          d3.select(that_vis_1).style("stroke", "none")

          // lower opacity on all other nodes to highlight the one that was clicked
          d3.selectAll('.node').style("opacity", 0.6)
          d3.select(this).style("opacity", 1.0).style("stroke", "black")

          that_vis_1 = this;

          // show button to reset vis 1 since companies are now on display in the center
          $("#reset-vis-1").show();

          var nodesToHighlight = paths.map(function (e) { return e[0] === d ? e[e.length-1] : e[e.length-1] === d ? e[0] : 0})
        .filter(function (d) { return d; });

          // set the left side text annotation for category
            $('#vis-1-annotation-category').fadeTo(400, 0.0, function() { $(this).html("The " + d.data.id + " category had " + formatBreachNumber(d.data.num_breaches) +
        " total " + (formatBreachNumber(d.data.num_breaches) == 1 ? "file" : "files") + " <span style='font-family:GothamBold'>breached</span> based on " + nodesToHighlight.length + (nodesToHighlight.length === 1 ? " connection." : " connections." )).fadeTo(500, 1.0); });

        // create the center pack chart for companies
        createPackChart(d.data.companies);

        var arrayLength = d.data.companies.length;
        var positiveCounter = 0;
        for (var i = 0; i < arrayLength; i++) {
          if (d.data.companies[i].isBreached) {
            positiveCounter += 1
          }

        }
        // display the percentage of companies breached
        percentage = Math.round(positiveCounter/arrayLength * 100) + "%";

        if (percentage == "0%") {
          percentage = "None"
        }

        // update the left side annotation with companies breached info
        $('#vis-1-annotation-company').fadeTo(400, 0.0, function() { $(this).html(percentage + " of the " + d.data.companies.length + " companies in the " + d.data.id +
          " category have been <span style='font-family:GothamBold'>breached</span>." ).fadeTo(500, 1.0); });

                div .html("Category: <span style='color:#FFDB6D'>" + d.data.id + "</span>" +"<br><br>" +
        "Number of Files Breached: <span style='color:#ef3b2c'>" + formatBreachNumber(d.data.num_breaches) + "</span>" +"<br><br>" +
        "Number of Companies: <span style='color:#FFDB6D'>" + formatBreachNumber(d.data.companies.length) + "</span>" +"<br><br>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .style("opacity", 1.0);
        }
  })

  // add text of the company name
  node.append('text')
  .attr("class", "out-node-text")
    .attr('dy', '0.32em')
    .attr('x', function (d) { return d.x < 180 ? 13 : -13; })
    .style('text-anchor', function (d) { return d.x < 180 ? 'start' : 'end'; })
    .attr('transform', function (d) { return 'rotate(' + (d.x < 180 ? d.x - 90 : d.x + 90) + ')'; })
    .text(function (d) { return d.data.id; });

    // artifact from original code
  function chapterCompare (aChaps, bChaps) {
    if (aChaps[0] != bChaps[0])
      return bChaps[0] - aChaps[0];
    else if (aChaps[1] != bChaps[0])
      return bChaps[1] - aChaps[1];
    else if (aChaps[2] != bChaps[2])
      return bChaps[2] - aChaps[2];
    return 0;
  }

  //Draw the Rectangle (used as background) for the vis 1 legend
  var rectangle = svg.append("rect")
  .attr("class", "vis-1-legend-container")
  .attr("x", 350)
  .attr("y", -190)
  .attr("width", 530)
  .attr("height", 450);

// legend for the circle sizes
// legend module used: https://d3-legend.susielu.com/#size-line

  // legend title
  svg.append("text")
      .attr("class", "legend-title")
      .attr("x", function (d, i) {
      return 360
      })
      .attr("y",function (d, i) {return -160})
      .attr("font-size", "14px")
      .text("Number of Files Breached");

  var linearSize = d3.scaleLinear().domain([20000,7000000000]).range([7, 13]);

  var svgPack = d3.select("#vis-1-container");

  svgPack.append("g")
    .attr("class", "legendSize")
    .attr("transform", "translate(680, 200)");

  var legendSize = d3.legendSize()
    .scale(linearSize)
    .shape('circle')
    .shapePadding(15)
    .labelOffset(15)
     .labels(["30mil.","1.5bil.", "4bil.", "6bil.", "8bil."])
    .orient('horizontal');

  svgPack.select(".legendSize")
    .call(legendSize);

  // legend for the circle breaches
  // legend module used: https://d3-legend.susielu.com/#size-line

  // legend title
  svg.append("text")
      .attr("class", "legend-title")
      .attr("x", function (d, i) {
      return 380
      })
      .attr("y",function (d, i) {return 150})
      .attr("font-size", "14px")
      .text("Inner Circles Breached");

  //Draw the Circle
   var circle = svg.append("circle")
      .attr("cx", 410)
      .attr("cy", 190)
      .attr("r", 20)
      .attr("fill", "red");

  svg.append("text")
      .attr("class", "legend-title")
      .attr("x", function (d, i) {
      return 380
      })
      .attr("y",function (d, i) {return 225})
      .attr("font-size", "12px")
      .text("Breached");

  //Draw the Circle
  var circle = svg.append("circle")
    .attr("cx", 510)
    .attr("cy", 190)
    .attr("r", 20)
    .attr("fill", "rgb(49, 130, 189)");

  svg.append("text")
    .attr("class", "legend-title")
    .attr("x", function (d, i) {
    return 470
    })
    .attr("y",function (d, i) {return 225})
    .attr("font-size", "12px")
    .text("Not Breached");

  // create legend for color scale
  colorScale = color_scale;

  var legend = svg.selectAll(".legend")
      .data([0].concat(colorScale.quantiles()), function (d) {
      return d;
  });

  legend.enter()
      .append("g")
      .attr("class", "legend")
      .append("rect")
      .attr("x", function (d, i) {
          return 380
      })
      .attr("y",function (d, i) {return -40 + (30) * i})
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", function (d, i) {

          return red_brewer_scale[i]
      })
      .style("stroke", "darkgrey")

legendData = legend.enter()

// create the legend for color scale based on number of files breached
var previous_value;
svg.selectAll(".legend").append("text")
    .attr("x", function (d, i) {
        return 410
    })
    .attr("y",function (d, i) {return -26 + (30) * i})
    .attr("font-size", "12px")
    .text(function (d, i) {
        var nextValue = true;

        if ((legendData._groups[0][i+1]) == undefined) {
            nextValue = false;
        }
        return formatBreachNumber(d) + "  to  " + (nextValue ? formatBreachNumber(legendData._groups[0][i+1].__data__ ): formatBreachNumber(d3.max(graph.nodes, function(d) { return d.companies.length; })));
    })
    .attr("fill", "black");

  // legend section for number of companies by size of outer nodes
  svg.append("text")
      .attr("class", "legend-title")
      .attr("x", function (d, i) {
      return 360
      })
      .attr("y",function (d, i) {return -55})
      .attr("font-size", "14px")
      .text("Number of Companies");
  });

// artificat from original code used to establish the root node
function chapterHierarchy (characters) {
  var hierarchy = {
    root: {name: 'root', children: []}
  };
  characters.forEach(function (c) {
    var chapter = c.firstChapter;
    var book = c.firstChapter.substring(0, c.firstChapter.lastIndexOf('.'));
    var volume = book.substring(0, book.lastIndexOf('.'));
    if (!hierarchy[volume]) {
      hierarchy[volume] = {name: volume, children: [], parent: hierarchy['root']};
      hierarchy['root'].children.push(hierarchy[volume]);
    }
    if (!hierarchy[book]) {
      hierarchy[book] = {name: book, children: [], parent: hierarchy[volume]};
      hierarchy[volume].children.push(hierarchy[book]);
    }
    if (!hierarchy[chapter]) {
      hierarchy[chapter] = {name: chapter, children: [], parent: hierarchy[book]};
      hierarchy[book].children.push(hierarchy[chapter]);
    }
    c.parent = hierarchy[chapter];
    hierarchy[chapter].children.push(c);
  });
  return hierarchy['root'];
}

// set angles of radial design
function xAccessor (d) {
  var angle = (d.x - 90) / 180 * Math.PI, radius = d.y;
  return radius * Math.cos(angle);
}
function yAccessor (d) {
  var angle = (d.x - 90) / 180 * Math.PI, radius = d.y;
  return radius * Math.sin(angle);
}

// VISUALIZATION VIEW 2: COMPANIES BREACHED PACK CHART

// this code is modified based on https://bl.ocks.org/john-guerra/0d81ccfd24578d5d563c55e785b3b40a
function createPackChart(companies_data) {

  // set initial dimensions for the pack chart
  var svg = d3.select('#vis-1-group').append("svg")
  .attr("id", "packChart")
  .attr('width', 300)
  .attr('height', 300)

  // initialize the node's tool-tip for inner circle companies
  tip_companies = d3.tip()
    .attr('class', 'd3-tip-companies')
    .offset([-5, 0]);

    // create the div to hold the tooltip for inner circle selection companies
  var div_tooltip = d3.select(".container").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  // hide network links
  d3.selectAll('.link').style("opacity", 0)

  // create a list of objects, one for each company name
  company_list = [];
  for (var i = 0; i < companies_data.length; i++) {
    // console.log(companies_data[i])
    temp_company_obj = new Object();
    temp_company_obj.name = companies_data[i]
    temp_company_obj.size = 20
    company_list.push(temp_company_obj);
  }
  companies_data_json = new Object();
  companies_data_json.name = "flare"
  companies_data_json.children = company_list;

  // set the size of the cluster and establish the d3 pack object
  var diameter = 300,
      format = d3.format(",d"),
      color = d3.scaleOrdinal(d3.schemeCategory20c);

  var bubble = d3.pack()
      .size([diameter, diameter])
      .padding(1.5);

  // select the pack chart are remove previous companies selection
  var tempSelect = d3.select("#packChart")
  tempSelect.selectAll("*").remove();

  var svg = d3.select("#packChart")
      .attr("class", "bubble");

  // init the tooltip
  svg.call(tip_companies);

  // get reference to the companies json data
  data = companies_data_json

  // init the hierarchy d3 object and sort data
  var root = d3.hierarchy(classes(data))
      .sum(function(d) { return d.value; })
      .sort(function(a, b) { return b.value - a.value; });

  bubble(root);

  // create nodes for each company
  var node = svg.selectAll(".node")
      .data(root.children)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  // draw svg circles for each company
  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) {

        // red nodes are breached, blue are non-breached
        if (d.data.className.isBreached) {
          return "red";
        } else {
        return color(d.data.packageName);
        }
      })
      .on("mouseover", function(d) {

        // handle special cases where no breached files are associated with a breach
        var files_breach_message = ''
        if (d.data.className.num_files_breached == '' || d.data.className.num_files_breached == 0) {
            files_breach_message = "No files associated with this breach."
          } else {
            files_breach_message = "# of Files Breached: <span style='color:#ef3b2c'>" + d.data.className.num_files_breached + "</span>" + "<br>"
          }

          // no message needed if it isn't a breach
          if (!d.data.className.isBreached) {
            files_breach_message = ''
          }

          // set the data and display the tooltip
          div_tooltip.html("Company Name: <span style='color:#FFDB6D'>" + d.data.className.company + "</span>" + "<br>" + (files_breach_message === '' ? '' : '<br>')
            + files_breach_message
             )
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("opacity", 1.0);
      })
      .on("mouseout", function(){
        div_tooltip.style("opacity", 0.0);
      })
      .on("click", function() {

        // on click of a company, we hide the inner pack chart
         d3.selectAll('.link').style("opacity", 1.0)
         d3.selectAll('.node').style("opacity", 1.0)

        // remove stroke on previously selected category node
         d3.select(that_vis_1).style("stroke", "none")

        var tempSelect = d3.select("#packChart")
        tempSelect.selectAll("*").remove();

        div_tooltip.style("opacity", 0.0);


        d3.select("#packChart").remove();

        // hide the vis 1 reset button at start (it only shows when companies are on display in the center)
        $("#reset-vis-1").hide();
      });

    // Returns a flattened hierarchy containing all leaf nodes under the root.
    function classes(root) {
      var classes = [];

      function recurse(name, node) {
        if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
        else classes.push({packageName: name, className: node.name, value: node.size});
      }

      recurse(null, root);
      return {children: classes};
    }
    d3.select(self.frameElement).style("height", diameter + "px");
}

// function created to reset the entire vis. to its original display state
function resetVis1() {
    // show network links
  d3.selectAll('.link').style("opacity", 1.0)

  // remove companies from center display
  d3.select("#packChart").remove();

  // category labels should return to full view
  d3.selectAll('.node').style("opacity", 1.0)
  d3.select(that_vis_1).style("stroke", "none")

  // hide the vis 1 reset button at start (it only shows when companies are on display in the center)
  $("#reset-vis-1").hide();

  // set initial text annotations
  // init the annotations section with info on You, the patient
  $("#vis-1-annotation-category").html("There are 39 connections between You, the Patient, and other categories of companies.")
  $("#vis-1-annotation-company").html("94% of the 693 companies in the Payer (Insurer) category have been <span style='font-family:GothamBold'>breached</span>.")
}
