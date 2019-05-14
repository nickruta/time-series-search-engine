Cartogram = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = [];
  this.filteredData = this.data;
  this.filteredData_time = this.data;
  this.filteredData_drop = this.data;

  // layout box adapted from http://code.minnpost.com/aranger/
  this.defaults = {
    el: '#map-container',
    layout: [[0,0,"AK"],[10,0,"ME"],[9,1,"VT"],[10,1,"NH"],[0,2,"WA"],[1,2,"ID"],[2,2,"MT"],[3,2,"ND"],[4,2,"MN"],[6,2,"MI"],[8,2,"NY"],[9,2,"MA"],[10,2,"RI"],[0,3,"OR"],[1,3,"UT"],[2,3,"WY"],[3,3,"SD"],[4,3,"IA"],[5,3,"WI"],[6,3,"IN"],[7,3,"OH"],[8,3,"PA"],[9,3,"NJ"],[10,3,"CT"],[0,4,"CA"],[1,4,"NV"],[2,4,"CO"],[3,4,"NE"],[4,4,"MO"],[5,4,"IL"],[6,4,"KY"],[7,4,"WV"],[8,4,"VA"],[9,4,"MD"],[10,4,"DE"],[1,5,"AZ"],[2,5,"NM"],[3,5,"KS"],[4,5,"AR"],[5,5,"TN"],[6,5,"NC"],[7,5,"SC"],[8,5,"DC"],[3,6,"OK"],[4,6,"LA"],[5,6,"MS"],[6,6,"AL"],[7,6,"GA"],[0,7,"HI"],[3,7,"TX"],[8,7,"FL"]],
    labels: {'AK': {'full': 'Alaska', 'short': 'AK', 'ap': 'Alaska'}, 'AL': {'full': 'Alabama', 'short': 'AL', 'ap': 'Ala.'}, 'AR': {'full': 'Arkansas', 'short': 'AR', 'ap': 'Ark.'}, 'AZ': {'full': 'Arizona', 'short': 'AZ', 'ap': 'Ariz.'}, 'CA': {'full': 'California', 'short': 'CA', 'ap': 'Calif.'}, 'CO': {'full': 'Colorado', 'short': 'CO', 'ap': 'Colo.'}, 'CT': {'full': 'Connecticut', 'short': 'CT', 'ap': 'Conn.'}, 'DC': {'full': 'District of Columbia', 'short': 'DC', 'ap': 'D.C.'}, 'DE': {'full': 'Delaware', 'short': 'DE', 'ap': 'Del.'}, 'FL': {'full': 'Florida', 'short': 'FL', 'ap': 'Fla.'}, 'GA': {'full': 'Georgia', 'short': 'GA', 'ap': 'Ga.'}, 'HI': {'full': 'Hawaii', 'short': 'HI', 'ap': 'Hawaii'}, 'IA': {'full': 'Iowa', 'short': 'IA', 'ap': 'Iowa'}, 'ID': {'full': 'Idaho', 'short': 'ID', 'ap': 'Idaho'}, 'IL': {'full': 'Illinois', 'short': 'IL', 'ap': 'Ill.'}, 'IN': {'full': 'Indiana', 'short': 'IN', 'ap': 'Ind.'}, 'KS': {'full': 'Kansas', 'short': 'KS', 'ap': 'Kan.'}, 'KY': {'full': 'Kentucky', 'short': 'KY', 'ap': 'Ky.'}, 'LA': {'full': 'Louisiana', 'short': 'LA', 'ap': 'La.'}, 'MA': {'full': 'Massachusetts', 'short': 'MA', 'ap': 'Mass.'}, 'MD': {'full': 'Maryland', 'short': 'MD', 'ap': 'Md.'}, 'ME': {'full': 'Maine', 'short': 'ME', 'ap': 'Maine'}, 'MI': {'full': 'Michigan', 'short': 'MI', 'ap': 'Mich.'}, 'MN': {'full': 'Minnesota', 'short': 'MN', 'ap': 'Minn.'}, 'MO': {'full': 'Missouri', 'short': 'MO', 'ap': 'Mo.'}, 'MS': {'full': 'Mississippi', 'short': 'MS', 'ap': 'Miss.'}, 'MT': {'full': 'Montana', 'short': 'MT', 'ap': 'Mont.'}, 'NC': {'full': 'North Carolina', 'short': 'NC', 'ap': 'N.C.'}, 'ND': {'full': 'North Dakota', 'short': 'ND', 'ap': 'N.D.'}, 'NE': {'full': 'Nebraska', 'short': 'NE', 'ap': 'Neb.'}, 'NH': {'full': 'New Hampshire', 'short': 'NH', 'ap': 'N.H.'}, 'NJ': {'full': 'New Jersey', 'short': 'NJ', 'ap': 'N.J.'}, 'NM': {'full': 'New Mexico', 'short': 'NM', 'ap': 'N.M.'}, 'NV': {'full': 'Nevada', 'short': 'NV', 'ap': 'Nev.'}, 'NY': {'full': 'New York', 'short': 'NY', 'ap': 'N.Y.'}, 'OH': {'full': 'Ohio', 'short': 'OH', 'ap': 'Ohio'}, 'OK': {'full': 'Oklahoma', 'short': 'OK', 'ap': 'Okla.'}, 'OR': {'full': 'Oregon', 'short': 'OR', 'ap': 'Ore.'}, 'PA': {'full': 'Pennsylvania', 'short': 'PA', 'ap': 'Pa.'}, 'RI': {'full': 'Rhode Island', 'short': 'RI', 'ap': 'R.I.'}, 'SC': {'full': 'South Carolina', 'short': 'SC', 'ap': 'S.C.'}, 'SD': {'full': 'South Dakota', 'short': 'SD', 'ap': 'S.D.'}, 'TN': {'full': 'Tennessee', 'short': 'TN', 'ap': 'Tenn.'}, 'TX': {'full': 'Texas', 'short': 'TX', 'ap': 'Texas'}, 'UT': {'full': 'Utah', 'short': 'UT', 'ap': 'Utah'}, 'VA': {'full': 'Virginia', 'short': 'VA', 'ap': 'Va.'}, 'VT': {'full': 'Vermont', 'short': 'VT', 'ap': 'Vt.'}, 'WA': {'full': 'Washington', 'short': 'WA', 'ap': 'Wash.'}, 'WI': {'full': 'Wisconsin', 'short': 'WI', 'ap': 'Wis.'}, 'WV': {'full': 'West Virginia', 'short': 'WV', 'ap': 'W.Va.'}, 'WY': {'full': 'Wyoming', 'short': 'WY', 'ap': 'Wyo.'} },
    labelStyle: 'short',
    index: 'value',
    indexType: 'numeric'
  };

  this.initVis();
};

// initialize visualization (static content, e.g. SVG area or axes)
Cartogram.prototype.initVis = function() {
  var vis = this;

  vis.margin = {top: 60, right: 0, bottom: 30, left: 0};

  vis.width = $("#" + "map-dashboard").width()*0.75 - vis.margin.left - vis.margin.right;
  vis.height = vis.width*0.88 - vis.margin.top - vis.margin.bottom;

  // draw SVG area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  // set color scales
  vis.color = d3.scaleQuantile();

  // initialize legend title
  vis.legendTitle = vis.svg.append("text")
    .attr("class","legend-title");

  // define the div for the tooltip
  vis.div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  vis.wrangleData();
};

Cartogram.prototype.wrangleData = function() {
  var vis = this;

  // counts number of states
  var grabCounts = function(state_lab) {
    var count = 0;
    for (ii = 0; ii < vis.filteredData.length; ii++) {
      if (vis.filteredData[ii].state === vis.defaults.labels[state_lab].full) {
        count++;
      }
    }
    return count;
  };

  // format into display data
  vis.displayData= vis.defaults.layout.map(function(geo) {
    return {
      x: geo[0],
      y: geo[1],
      box: geo[2],
      data: grabCounts(geo[2])
    };
  });

  vis.updateVis();
};

// update sequence (enter, update, exit). Parameters needed only for certain updates
Cartogram.prototype.updateVis = function() {
  var vis = this;

  var checkZero = d3.max(vis.displayData,function(d) {
    return d.data;
  });

  if(d3.max(vis.displayData,function(d) {
    return d.data;}) < 6) {
    vis.color.range(colorbrewer.OrRd[d3.max(vis.displayData,function(d) {return d.data;}) + 1]);
  } else {
    vis.color.range(colorbrewer.OrRd[6]);
  }
    vis.color.domain([0,Math.log(d3.max(vis.displayData,function(d) {
      return d.data;
    }))]);

  // add legend data
  var quant_cutoff = vis.color.quantiles();

  if((Math.trunc(Math.exp(quant_cutoff[0]))) ===1 || checkZero === 0) {
    vis.displayData.push({
      x:2,
      y:9.5,
      box:"" + 0,
      data:0
    });
  } else {
    vis.displayData.push({
      x:2,
      y:9.5,
      box:0 + "-" + (Math.trunc(Math.exp(quant_cutoff[0]))), data:0
    });
  }

  // draw adaptive labels for legend
  for(ii = 0 ; ii < 6 ; ii++) {
    if(ii < quant_cutoff.length) {
      if(ii === (quant_cutoff.length - 1)) {
        if(vis.displayData[ 51 + ii].box === ("" + Math.trunc(Math.exp(quant_cutoff[ii])))) {
          var box = ">"+(Math.trunc(Math.exp(quant_cutoff[ii])) + 1);
        } else {
          var box = ">" + Math.trunc(Math.exp(quant_cutoff[ii]));
        }
      } else {
        if(vis.displayData[51 + ii].box === ("" + Math.trunc(Math.exp(quant_cutoff[ii])))) {
          var box = ""+(Math.trunc(Math.exp(quant_cutoff[ii]))+1);
        } else {
          if(vis.displayData[51 + ii].box === ("" + Math.trunc(Math.exp(quant_cutoff[ii + 1])) -1) || checkZero === 0) {
            var box = ""+Math.trunc(Math.exp(quant_cutoff[ii]));
          } else {
            var box = Math.trunc(Math.exp(quant_cutoff[ii])) + "-" + (Math.trunc(Math.exp(quant_cutoff[ii + 1])));
          }
        }
      }
      vis.displayData.push({
          x:2 + ii + 1,
          y:9.5,
          box:box ,
          data: Math.exp(quant_cutoff[ii] + 0.1)
      })
    } else {
      vis.displayData.push({
        x:2 + ii + 1,
        y:9.5,
        box:box ,
        data: 999
      })
    }
  }

  // draw carthogram
  vis.size = vis.boxDimensions();

  // join data
  vis.boxes = vis.svg.selectAll("g")
    .data(vis.displayData);

  // enter data
  vis.dataEnter = vis.boxes.enter()
    .append("g")
    .merge(vis.boxes);

  vis.dataEnter.append("rect");
  vis.dataEnter.append("text");

  // enter and update
  vis.boxRect = vis.dataEnter.select("rect")
    .on("mouseover", function(d) {
      if(d.data !== 999) {
        vis.div.transition()
          .duration(200)
          .style("opacity", .9);
        vis.div.html(`State: <span style='color:#FFDB6D'>${vis.defaults.labels[d.box].full}</span><br><br>
           Number of Reported Breaches: <span style='color:#FFDB6D'>${d.data}</span><br>`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      }
    })
    .on("mouseout", function(d) {
      if(d.data !== 999) {
        vis.div.transition()
          .duration(500)
          .style("opacity", 0)
      }
    })
    .transition()
    .duration(500)
    .attr("x", function(d) {
      return vis.size.xScale(d.x);
    })
    .attr("y", function(d) {
      return vis.size.yScale(d.y);
    })
    .attr("width", vis.size.boxWidth)
    .attr("height", function(d, i) {
      if (i > 50) {
        return vis.size.boxWidth * 0.5
      } else {
        return vis.size.boxWidth
      }
    })
    .attr("class", "box-rect")
    .attr("fill",function(d) {
      if (d.data === 999) {
        return 'white';
      } else {
        return vis.color(Math.log(d.data));
      }
    })
    .attr("stroke",function(d){
      return 'white'
    });

  vis.boxText = vis.dataEnter.select("text")
    .on("mouseover", function(d) {
      if(d.data !== 999) {
        vis.div.transition()
          .duration(200)
          .style("opacity", .9);
        vis.div.html(`State: <span style='color:#FFDB6D'>${vis.defaults.labels[d.box].full}</span><br><br>
                      Number of Reported Breaches: <span style='color:#FFDB6D'>${d.data}</span><br>`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      }
    })
    .on("mouseout", function(d) {
      if(d.data !== 999) {
        vis.div.transition()
          .duration(500)
          .style("opacity", 0)
      }
    })
    .transition()
    .duration(500)
    .attr("x", function(d) {
      return vis.size.xScale(d.x) + vis.size.boxWidth / 2;
    })
    .attr("y", function(d, i) {
      if (i > 50) {
        return vis.size.yScale(d.y) + vis.size.boxWidth / 4 + 3;
      } else {
        return vis.size.yScale(d.y) + vis.size.boxWidth / 2 + 3;
      }
    })
    .text(function(d) {
      if (d.data===999) {
      } else {
        return d.box;
      }
    })
    .attr('text-anchor','middle')
    .attr('font-weight','800')
    .attr('fill',function(d) {
      if(vis.color(Math.log(d.data)) === "#e34a33" || vis.color(Math.log(d.data)) === "#b30000") {
        return '#eaeaea';
      } else {
        return  '#333333';
      }
    });

  vis.legendTitle
    .attr("x",vis.size.xScale(2))
    .attr("y",vis.size.yScale(9.3))
    .attr("font-size","11px")
    .text('Total number of breaches per state :');

  vis.boxes.exit().remove();
};

// filter original unfiltered data depending on selected time period (brush)
Cartogram.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
  var vis = this;

  vis.filteredData_time = vis.filteredData_drop.filter(function(d) {
    return d.date >= selectionStart && d.date <= selectionEnd;
  });

  vis.filteredData = vis.filteredData_time;

  vis.wrangleData();
};

// filter original unfiltered data depending on selection from drop down menu
Cartogram.prototype.onDropDownChange = function(selection) {
  var vis = this;

  if(selection === 'All') {
    vis.filteredData_drop = vis.data
  } else {
    vis.filteredData_drop = vis.data.filter(function(d) {
      return d.cat_name === selection;
    });
  }

  vis.filteredData = vis.filteredData_drop;

  vis.wrangleData();
};

// draw carthogram and calculates box dimensions
Cartogram.prototype.boxDimensions = function() {
  var boxesWide = d3.extent(this.displayData, function(d) { return d.x; });
  var boxesTall = d3.extent(this.displayData, function(d) { return d.y; });
  this.boxesWide = boxesWide[1] - boxesWide[0] + 4 ;
  this.boxesTall = boxesTall[1] - boxesTall[0] ;
  this.ratio = this.boxesTall/this.boxesWide;

  var xScale = d3.scaleLinear()
    .domain([0, this.boxesWide])
    .range([0,this.width]);

  var yScale = d3.scaleLinear()
    .domain([0, this.boxesTall])
    .range([0, this.height]);

  var boxWidth = this.width/this.boxesWide;

  return {xScale: xScale, yScale: yScale, boxWidth: boxWidth};
};

// drop down menu
DropDown = function(_parentElement, _data, _eventHandler ) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.eventHandler =_eventHandler;

  this.createMenu();
};

// initialize visualization (static content, e.g. SVG area or axes)
DropDown.prototype.createMenu = function() {
  var vis = this;

  // nest data by category
  var nest = d3.nest()
    .key(function(d) {
      return d.cat_name;
    })
    .entries(vis.data);

  nest.sort(function(a,b) {
    return d3.ascending(a.key, b.key)
  });

  nest.unshift({key:'All'});

  // Create a dropdown menu
  vis.dropMenu = d3.select("#" + this.parentElement);
  vis.dropMenu
    .selectAll("a.dropdown-item")
    .data(nest)
    .enter()
    .append("a")
    .attr("class", "dropdown-item")
    .attr("href", "#")
    .attr("data-key", function(d) {
      return d.key;
    })
    .html(function(d) {
      return d.key;
    });

  // add listener for changes to Bootstrap dropdown
  var a = document.getElementById(this.parentElement).getElementsByTagName("a");

  for (var i = 0; i < a.length; i++) {
    a[i].addEventListener("click", function(e) {
      // prevent default link behavior
      e.preventDefault();

      // update filter value
      document.getElementById("dropdownMenuButton").innerHTML = this.innerHTML;
      $(vis.eventHandler).trigger("dropdownChange", this.dataset.key);
    })
  }
};

