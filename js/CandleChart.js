function barChart() {

    var width;
    var height;
    var valueMin = 0;
    var valueMax = 0;
    var margin = {top: 20, right: 20, bottom: 30, left: 20};
    var chartClass = "chart";
    var barClass = "bar";
    var fillColor = "black";
    var padding = 50.;
    var nameKey = "name";
    var valueKey = "value";
    var topBarKey = "topBar";
    var bottomBarKey = "bottomBar";
    var title = "";
    var yLabel = "";
    var xLabel = "";
    var xTicks = undefined;
    var yTicks = undefined;
    var selectedCountry;

    var chart = function(selection) {
        selection.each(function(data,i) {

            data.sort(function(a, b){
                if(a[valueKey] < b[valueKey]) {
                     return -1;
                }
                if(a[valueKey] > b[valueKey]) {
                    return 1;
                }
                return 0;
            });

            //If not specified, set max to the max value in the data
            var vMax =  d3.max(data, function(d) { return +d[valueKey]; });
            var vMin =  d3.min(data, function(d) { return +d[valueKey]; });
            var topMax = d3.max(data, function(d) { return +d[topBarKey]; });
            var botMax = d3.max(data, function(d) { return +d[bottomBarKey]; });

            //Create Scales
            var nameScale = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1)
                .domain(data.map(function(d) { return d[nameKey]; }));

            var valueScale = d3.scale.linear()
                .range([0, height/3.])
                .domain([vMin, vMax]);

            var topValueScale = d3.scale.linear()
                .range([0, height/3.])
                .domain([valueMin, topMax]);

            var bottomValueScale = d3.scale.linear()
                .range([0, height/3.])
                .domain([valueMin, botMax]);

            //Create encapsulating SVG
            var svg = selection.append("svg")
                .attr("class", chartClass)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Initialized Axes
            var xAxis = d3.svg.axis();
            var yAxis = d3.svg.axis();

            //Set Ticks if specified
            if(xTicks != undefined){
                xAxis.ticks(xTicks);
            }
            if(yTicks != undefined) {
                yAxis.ticks(yTicks);
            }

            //Orient Axes
            xAxis.scale(nameScale)
                .orient("bottom");

            yAxis.scale(valueScale)
                .orient("left");

            //Create bars
            var enterSet = svg.selectAll(".bar")
                .data(data)
                .enter();

            //AppendTopBar
            enterSet.append("g")
                .attr("class", barClass)
                .attr("id", function(d){
                    return "Candle" + d[nameKey].replace(/\s/g, '');
                })
                .attr("fill", function(d,i){
                    if(d[nameKey] === selectedCountry){
                        return "rgba(1,1,1,1)";
                    }
                    return "#4F628E";
                })
                .append("rect")
                .attr("height", function (d) {
                    return topValueScale(d[topBarKey]);
                })
                .attr("width", width / (data.length) - padding)
                .attr("x", function(d, i){
                    return nameScale(d[nameKey]) + (padding/2.);
                })
                .attr("y", function(d) {
                    return 2*height/3 - valueScale(d[valueKey]) - topValueScale(d[topBarKey]);
                });

            enterSet.append("g")
                .attr("class", barClass)
                .attr("id", function(d){
                    return "Candle" + d[nameKey].replace(/\s/g, '');
                })
                .attr("fill", function(d,i){
                    if(d[nameKey] === selectedCountry){
                        return "rgba(1,1,1,1)";
                    }
                    return "#D4C26A";
                })
                .append("rect")
                .attr("height", function (d) {
                    return bottomValueScale(d[bottomBarKey]);
                })
                .attr("width", width / (data.length) - padding)
                .attr("x", function(d, i){
                    return nameScale(d[nameKey]) + (padding/2.);
                })
                .attr("y", function(d) {
                    return 2.*height/3. - valueScale(d[valueKey]);
                });

            var changeSelected = function(){
                console.log("Changing selected");
            };

            //Flip scale for proper axis labeling
            valueScale.range([height, 0]);


            //Append Axis
            /*
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);*/


            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("dy", ".71em")
                .style("text-anchor", "end");

            //Append Title
            svg.append("text")
                .attr("class", "title")
                .attr("x", (width / 2))
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .text(title);

            //Append Axis Labels
            svg.append("text")
                .attr("class", "x label")
                .attr("x", width/2)
                .attr("y", height + margin.bottom)
                .text(xLabel);

            svg.append("text")
                .attr("class", "y label")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x",0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(yLabel);

        })
    };

    chart.changeSelection = function(value){
        d3.selectAll("#"+selectedCountry).style("fill","rgba(255,255,255,0)");
        selectedCountry = "Candle" + value;
        var country = d3.selectAll("#"+selectedCountry);
        country.style("fill","rgba(0,0,0,1)");
    };

    chart.selectedCountry = function(value){
        if (!arguments.length) return selectedCountry;
        selectedCountry = value;
        return chart;
    };

    //Getters and Setters
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.chartClass = function(value) {
        if(!arguments.length) return chartClass;
        chartClass = value;
        return chart;
    };

    chart.barClass = function(value) {
        if(!arguments.length) return barClass;
        barClass = value;
        return chart;
    };

    chart.fillColor = function(value){
        if(!arguments.length) return fillColor;
        fillColor = value;
        return chart;
    };

    chart.orientation = function(value){
        if(!arguments.length) return orientation;
        orientation = value;
        return chart;
    };

    chart.padding = function(value){
        if(!arguments.length) return padding;
        padding = value;
        return chart;
    };

    chart.valueMin = function(value){
        if(!arguments.length) return valueMin;
        valueMin = value;
        return chart;
    };

    chart.valueMax = function(value){
        if(!arguments.length) return valueMax;
        valueMax = value;
        return chart;
    };

    chart.valueKey = function(value){
        if(!arguments.length) return valueKey;
        valueKey = value;
        return chart;
    };

    chart.topBarKey = function(value){
        if(!arguments.length) return topBarKey;
        topBarKey = value;
        return chart;
    };

    chart.bottomBarKey = function(value){
        if(!arguments.length) return bottomBarKey;
        bottomBarKey = value;
        return chart;
    };

    chart.nameKey = function(value){
        if(!arguments.length) return nameKey;
        nameKey = value;
        return chart;
    };

    chart.title = function(value){
        if(!arguments.length) return title;
        title = value;
        return chart;
    };

    chart.yLabel = function(value){
        if(!arguments.length) return yLabel;
        yLabel = value;
        return chart;
    };

    chart.xLabel = function(value){
        if(!arguments.length) return xLabel;
        xLabel = value;
        return chart;
    };

    chart.xTicks = function(value){
        if(!arguments.length) return xTicks;
        xTicks = value;
        return chart;
    };

    chart.yTicks = function(value){
        if(!arguments.length) return yTicks;
        yTicks = value;
        return chart;
    };

    //Margin Settings
    chart.margin = function(value) {
        if(!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.marginTop = function(value) {
        if(!arguments.length) return margin.top;
        margin.top = value;
        return chart;
    };

    chart.marginLeft = function(value) {
        if(!arguments.length) return margin.left;
        margin.left = value;
        return chart;
    };

    chart.marginBottom = function(value) {
        if(!arguments.length) return margin.bottom;
        margin.bottom = value;
        return chart;
    };

    chart.marginRight = function(value) {
        if(!arguments.length) return margin.right;
        margin.right = value;
        return chart;
    };

    return chart;
}
