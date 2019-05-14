// Will be used to the save the loaded csv data
var allData = [];
var timelineData=[];
var tooltipData=[];

// Date parser to convert strings to date objects
var dateFormatter = d3.timeFormat("%Y-%m");
var dateParser = d3.timeParse("%Y-%m-%d");

// Variables for the visualization instances
var map, timeline;

queue()
    .defer(d3.csv,"data/date_count.csv")
    .defer(d3.csv,"data/breaches_webformat.csv")
    .defer(d3.csv,"data/timeline_highlights.csv")
    .await(loadData);

function loadData(error,countDate,breachData,highlightData) {
    // console.log(error);

    // Format Timeline Data
    timelineData = countDate.map(function (d) {

        var result = {
            time: dateParser(d.date),
            count: +d.count
        };

        return result;
    });

    //Format Breach Data
    for(ii=0 ; ii<breachData.length ; ii++){
        breachData[ii].date = dateParser(breachData[ii].date);
    };
    allData = breachData;

    //Format Highlight Data
    tooltipData = highlightData.map(function(d){
        var result = {
            time:dateParser(d.date),
            date: dateFormatter(dateParser(d.date)),
            event: d.event
        };

        return result;
    });

    createVis();
}

function createVis() {
    //  Create event handler
    var MyEventHandler = {};

    var map = new Cartogram("map-container", allData);

    var dropMenu = new DropDown("dropdown-menu2", allData,MyEventHandler);

    // Bind event handler for timeline selection
    $(MyEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd){
        map.onSelectionChange(rangeStart, rangeEnd);
    });

    // Bind event handler for dropdwon menu
    $(MyEventHandler).bind("dropdownChange",function(event, selection){
        map.onDropDownChange(selection);
        timeline.onDropDownChange();
    });

    //  Create visualization instances
    var timeline = new Timeline("timeline", timelineData,MyEventHandler,tooltipData);
}