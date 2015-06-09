d3.csv("data/countries.csv", function(sourceData){

    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var valueKey = "LifeExpectancy";
    var nameKey = "Country";
    var selectedCountry = undefined;
    var selectedContinent = undefined;

    var candleWidth = 960;
    var candleHeight = 500;

    var topBarKey = "BirthRate";
    var bottomBarKey = "DeathRate";

    var data = sourceData;
    var barData = data;

    var topBarColor = "#4F628E";
    var bottomBarColor = "#D4C26A";
    var barHighlight = "rgb(255,255,0)";

    function sortData(){
        barData = _.sortBy(barData, function(d){
            return +d[valueKey];
        });
        /*
        barData.sort(function(a, b){
            if(a[valueKey] < b[valueKey]) {
                return -1;
            }
            if(a[valueKey] > b[valueKey]) {
                return 1;
            }
            return 0;
        });*/
    }

    sortData();

    function drawMap() {
        //MAP
        var mapWidth = 960;
        var mapHeight = 500;
        var mapSelectColor = "rgb(255,255,0)";
        var mapUndefinedColor = "#9966FF";
		
        var projection = d3.geo.mercator().translate([(mapWidth / 2), (mapHeight - 200)]).scale(mapWidth / 2 / Math.PI);
		if(selectedContinent != undefined){
							
						if(selectedContinent == "Africa"){
							projection = d3.geo.mercator().translate([(mapWidth / 2.1), (mapHeight - 210)]).scale(mapWidth / 3);
						}
						else if(selectedContinent == "Asia"){
							projection = d3.geo.mercator().translate([(mapWidth / 10), (mapHeight - 110)]).scale(mapWidth / 3);
						}
						else if(selectedContinent == "Europe"){
							projection = d3.geo.mercator().translate([(mapWidth / 7.5), (mapHeight + 130)]).scale(mapWidth / 4);
						}
						else if(selectedContinent == "Oceania"){
							projection = d3.geo.mercator().translate([(-700), (mapHeight/2-250)]).scale(mapHeight);
						}
						else if(selectedContinent == "North America"){
							projection = d3.geo.mercator().translate([(750), (mapHeight+20)]).scale(mapWidth / 4);
						}
						else if(selectedContinent == "South America"){
							projection = d3.geo.mercator().translate([(700), (mapHeight-400)]).scale(mapWidth / 3);
						}
		
                    
                        }

        var mapSvg = d3.select("#map").append("svg")
            .attr("class", "mapSvg")
            .attr("width", mapWidth)
            .attr("height", mapHeight);

        var path = d3.geo.path()
            .projection(projection);

        var mapG = mapSvg.append("g");

        var vMax = d3.max(data, function (d) {
            return +d[valueKey];
        });
        var vMin = d3.min(data, function (d) {
            return +d[valueKey];
        });

        //offsets for tooltips
        var offsetL = document.getElementById('map').offsetLeft + 20;
        var offsetT = document.getElementById('map').offsetTop + 10;
        var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");

        var colorScale = d3.scale.linear()
            .range(["#310D0D", "white"])
            .domain([vMin, vMax]);

        d3.json("data/world-topo.json", function (error, world) {
            mapG.selectAll(".country")
                .data(topojson.feature(world, world.objects.countries).features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", function (d, i) {


                    var country = _.findWhere(data, {Country: d.properties.name});
                    if (country != undefined) {
                        if(selectedContinent != undefined){
		
                            if(country.Continent != selectedContinent) {
                                return "#3399FF";
                            }
                        }
                        return colorScale(country[valueKey]);
                    } else {
                        return mapUndefinedColor;
                    }
                })
                .attr("id", function (d, i) {
                    var name = d.properties.name.replace(/\s/g, '');
                    return name;
                })
                .on("mousemove", function (d, i) {

                    var mouse = d3.mouse(mapSvg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    var country = _.findWhere(data, {Country: d.properties.name});
                    var le = country ? country[valueKey] : undefined;
                    tooltip.classed("hidden", false).attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px").html(d.properties.name + " " + le)

                })
                .on("mouseout", function (d, i) {
                    tooltip.classed("hidden", true);
                })
                .on("mousedown", function (d, i) {

                    //Change previous selection back
                    if (selectedCountry != undefined) {
                        clearHighlightBar();
                        mapG.select("#" + selectedCountry[nameKey].replace(/\s/g, '')).style("fill", function (d, i) {
                            var country = _.findWhere(data, {Country: d.properties.name});
                            var le = country ? country[valueKey] : undefined;
                            if(selectedContinent != undefined){

                                if(country.Continent != selectedContinent) {
                                    return "#3399FF";
                                }
                            }
                            return colorScale(le);
                        });
                    }
                    var country = _.findWhere(data, {Country: d.properties.name});
                    var le = country ? country[valueKey] : undefined;

                    selectedCountry = country;
                    if (le !== undefined) {
                        var id = d.properties.name.replace(/\s/g, '');
                        mapG.select("#" + id).style("fill", mapSelectColor);
                       // console.log(id)
                    }
                    highlightBar();
                });

            clearMapHighlight = function(){
                if(selectedCountry != undefined) {
                    mapG.select("#" + selectedCountry[nameKey].replace(/\s/g, '')).style("fill", function (d, i) {
                        var country = _.findWhere(data, {Country: d.properties.name});
                        var le = country ? country[valueKey] : undefined;
                        if(selectedContinent != undefined){

                            if(country.Continent != selectedContinent) {
                                return "#3399FF";
                            }
                        }
                        return colorScale(le);
                    });
                }
            };

            highlightMap = function(){
                var country = selectedCountry;
                var le = country ? country[valueKey] : undefined;

                selectedCountry = country;
                if (le !== undefined) {
                    var id = selectedCountry[nameKey].replace(/\s/g, '');
                    mapG.select("#" + id).style("fill", mapSelectColor);
                   // console.log(id)
                }
            }
        });
    }

    var clearMapHighlight = function(){

    };

    var highlightMap = function(){

    };

    var clearHighlightBar = function(){
        if(selectedCountry != undefined) {
            var id = selectedCountry[nameKey].replace(/\s/g, '');
            d3.select("#TopCandle" + id).attr("fill", topBarColor);
            d3.select("#BottomCandle" + id).attr("fill", bottomBarColor);
        }
    };

    var highlightBar = function(){
        /*
        if(Math.random() > 0.5){
            filterBarData("Asia");
        } else if(Math.random() > 0.5){
            filterBarData("Europe");
        } else {
            filterBarData(undefined);
        }*/

        if(selectedCountry != undefined) {
            var id = selectedCountry[nameKey].replace(/\s/g, '');
            d3.select("#TopCandle" + id).attr("fill", barHighlight);
            d3.select("#BottomCandle" + id).attr("fill", barHighlight);
        }
    };

    var filterBarData = function(continent){

        barData = data;
        if(continent != undefined) {
            barData = _.filter(barData, function (d) {
                return d.Continent == continent;
            });
        }
        sortData();
    };

    function drawCandle() {

        //console.log("Drawing");

        d3.select(".candleSvg").remove();

        sortData();

        //Candle Chart
        var vMax = d3.max(barData, function (d) {
            return +d[valueKey];
        });
        var vMin = d3.min(barData, function (d) {
            return +d[valueKey];
        });
        var topMax = d3.max(barData, function (d) {
            return +d[topBarKey];
        });
        var botMax = d3.max(barData, function (d) {
            return +d[bottomBarKey];
        });

        var nameScale = d3.scale.ordinal()
            .rangeRoundBands([0, candleWidth], .1);
        var valueScale = d3.scale.linear()
            .range([0, candleHeight / 3.]);
        var topValueScale = d3.scale.linear()
            .range([0, candleHeight / 3.]);
        var bottomValueScale = d3.scale.linear()
            .range([0, candleHeight / 3.]);

        nameScale.domain(barData.map(function (d) {
            return d[nameKey];
        }));
        valueScale.domain([vMin, vMax]);
        topValueScale.domain([0, topMax]);
        bottomValueScale.domain([0, botMax]);


        var cSvg = d3.select("#candleChart").append("svg")
            .attr("class", "candleSvg")
            .attr("width", candleWidth + margin.left + margin.right)
            .attr("height", candleHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxis = d3.svg.axis()
            .scale(nameScale)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(valueScale);

        //Create bars
        var enterSet = cSvg.selectAll(".bar")
            .data(barData)
            .enter();

        var offsetL = document.getElementById('candleChart').offsetLeft + 70;
        var offsetT = document.getElementById('candleChart').offsetTop + 10;
        var tooltip = d3.select("#candleChart").append("div").attr("class", "tooltip hidden");

        //AppendTopBar
        enterSet.append("g")
            .attr("id", function (d) {
                return "TopCandle" + d[nameKey].replace(/\s/g, '');
            })
            .attr("fill", function (d, i) {
                if (d[nameKey] === selectedCountry) {
                    return "rgba(1,1,1,1)";
                }
                return topBarColor;
            })
            .append("rect")
            .attr("height", function (d) {
                return topValueScale(d[topBarKey]);
            })
            .attr("width", candleWidth / (barData.length))
            .attr("x", function (d, i) {
                return nameScale(d[nameKey]);
            })
            .attr("y", function (d) {
                return 2 * candleHeight / 3 - valueScale(d[valueKey]) - topValueScale(d[topBarKey]);
            })
            .on("mousemove", function (d, i) {

                var mouse = d3.mouse(cSvg.node()).map(function (d) {
                    return parseInt(d);
                });

                tooltip.classed("hidden", false).attr("style", "left:" + (mouse[0] + offsetL ) + "px;top:" + (mouse[1] + offsetT) + "px").html(d[nameKey] + " " + topBarKey + ": " + d[topBarKey]);

            })
            .on("mouseout", function (d, i) {
                tooltip.classed("hidden", true);
            })
            .on("mousedown", function (d, i) {

                //Change previous selection back
                if (selectedCountry != undefined) {
                    clearHighlightBar();
                    clearMapHighlight();
                }
                var country = d;
                var le = country ? country[valueKey] : undefined;

                selectedCountry = country;
                if (le !== undefined) {
                    highlightMap();

                }
                highlightBar();
            });

        //AppendBottomBar
        enterSet.append("g")
            .attr("id", function (d) {
                return "BottomCandle" + d[nameKey].replace(/\s/g, '');
            })
            .attr("fill", function (d, i) {
                if (d[nameKey] === selectedCountry) {
                    return "rgba(1,1,1,1)";
                }
                return bottomBarColor;
            })
            .append("rect")
            .attr("height", function (d) {
                return bottomValueScale(d[bottomBarKey]);
            })
            .attr("width", candleWidth / (barData.length))
            .attr("x", function (d, i) {
                return nameScale(d[nameKey]);
            })
            .attr("y", function (d) {
                return 2. * candleHeight / 3. - valueScale(d[valueKey]);
            })
            .on("mousemove", function (d, i) {

                var mouse = d3.mouse(cSvg.node()).map(function (d) {
                    return parseInt(d);
                });

                tooltip.classed("hidden", false).attr("style", "left:" + (mouse[0] + offsetL + 10) + "px;top:" + (mouse[1] + offsetT) + "px").html(d[nameKey] + " " + bottomBarKey + ": " + d[bottomBarKey]);

            })
            .on("mouseout", function (d, i) {
                tooltip.classed("hidden", true);
            })
            .on("mousedown", function (d, i) {

                //Change previous selection back
                if (selectedCountry != undefined) {
                    clearHighlightBar();
                    clearMapHighlight();
                }
                var country = d;
                var le = country ? country[valueKey] : undefined;

                selectedCountry = country;
                if (le !== undefined) {
                    highlightMap();

                }
                highlightBar();
            });

        valueScale.range([candleHeight/3., 0]);
        yAxis.ticks(2);

        cSvg.append("g")
            .attr("class", "candleAxis")
            .attr("transform", "translate(0," + candleHeight/3. + ")")
            .call(yAxis)
            .append("text")
            .attr("dy", ".71em")
            .style("text-anchor", "end");

    }

    function drawDropMenus() {
        d3.selectAll("select").remove();

        var options = ["BirthRate", "DeathRate", "Population", "Area","InfantMortality","LifeExpectancy","FertilityRate","UnemploymentRate"];

        var menu =  d3.select("#mainMenu")
            .append("select")
            .attr("id","topSelect")
            .on("change", function(){
                var index = this.selectedIndex;
                valueKey = options[index];
                redraw();
            })
            .selectAll("option")
            .data(options)
            .enter().append("option")
            .text(function(d) {return d});

        d3.select("#topSelect").property("selectedIndex", _.indexOf(options,valueKey));

        var topmenu = d3.select("#topMenu")
            .append("select")
            .attr("id","topMenuSelect")
            .on("change", function(){
                var index = this.selectedIndex;
                topBarKey = options[index];
                drawCandle();
            })
            .selectAll("option")
            .data(options)
            .enter().append("option")
            .text(function(d) {return d});

        d3.select("#topMenuSelect").property("selectedIndex", _.indexOf(options,topBarKey));

        var bottommenu = d3.select("#bottomMenu")
            .append("select")
            .attr("id","bottomMenuSelect")
            .on("change", function(){
                var index = this.selectedIndex;
                bottomBarKey = options[index];
                drawCandle();
            })
            .selectAll("option")
            .data(options)
            .enter().append("option")
            .text(function(d) {return d});

        d3.select("#bottomMenuSelect").property("selectedIndex", _.indexOf(options,bottomBarKey));
    }

    function drawNavMap() {

        var width = 500;
        var height = 250;

        var mygeo = d3.geo;

        var options = [
            {name: "Eckert III", projection: d3.geo.eckert3().scale(100)},
            {name: "Eckert IV", projection: d3.geo.eckert4().scale(100)},
            {name: "Wagner IV", projection: d3.geo.wagner4().scale(100)},
            {name: "Winkel Tripel", projection: d3.geo.winkel3().scale(100)}
        ];

        options.forEach(function (o) {
            o.projection.rotate([0, 0]).center([0, 0]);
        });


        var interval = setInterval(loop, 3000),
            i = 0,
            n = options.length - 1;


        var projection = options[i].projection;

        var path = d3.geo.path().projection(projection);

        var graticule = d3.geo.graticule();

        var svg = d3.select("#navMap").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id","nMap");


        svg.append("path")
            .datum(graticule)
            .attr("fill","rgba(0,0,0,0)")
            .attr("id", "graticule")
            .attr("d", path);


        var tooltip = d3.select("#navMap").append("div").attr("class", "tooltip hidden");

        var continents;

        d3.json("data/continent-geogame-110m.json", function (error, world) {

            var countries = topojson.feature(world, world.objects.countries);

            //feature collections only have type, id, and name so i would not sitck properties in there but i dont think its invalid!
            //http://geojson.org/geojson-spec.html#introduction
            var asia = {
                type: "FeatureCollection",
                name: "Asia",
                color: "#ffbb78",
                id: 1,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Asia";
                })
            };
            var africa = {
                type: "FeatureCollection",
                name: "Africa",
                color: "#2ca02c",
                id: 2,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Africa";
                })
            };
            var europe = {
                type: "FeatureCollection",
                name: "Europe",
                color: "#ff7f0e",
                id: 3,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Europe";
                })
            };
            var na = {
                type: "FeatureCollection",
                name: "North America",
                color: "#1f77b4",
                id: 4,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "North America";
                })
            };
            var sa = {
                type: "FeatureCollection",
                name: "South America",
                color: "#d62728",
                id: 5,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "South America";
                })
            };
            /*var antarctica = {
             type: "FeatureCollection",
             name: "Antarctica",
             color: "#98df8a",
             id: 6,
             features: countries.features.filter(function (d) {
             return d.properties.continent == "Antarctica";
             })
             };*/
            var oceania = {
                type: "FeatureCollection",
                name: "Oceania",
                color: "#aec7e8",
                id: 7,
                features: countries.features.filter(function (d) {
                    return d.properties.continent == "Oceania";
                })
            };
            //skipped: Seven seas (open ocean) - only applies to French Southern and Antarctic Lands

            continents = [asia, africa, europe, na, sa, oceania];


            //var continent = g.selectAll(".continent").data(continents);
            var continent = svg.selectAll(".continent").data(continents);

            continent.enter().insert("path")
                .attr("class", "continent")
                .attr("d", path)
                .attr("id", function (d, i) {
                    return d.name.replace(/\s/g, '');
                })
                .attr("title", function (d, i) {
                    return d.name;
                })
                .style("fill", function (d, i) {
                    return d.color;
                });



            var offsetL = document.getElementById('nMap').offsetLeft + 20;


            continent
                .on("mousemove", function (d, i) {
                    var offsetT = document.getElementById('nMap').offsetTop + 10;
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    tooltip
                        .classed("hidden", false)
                        .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT
                        ) + "px")
                        .html(d.name);
                })
                .on("mouseout", function (d, i) {
                    tooltip.classed("hidden", true)
                })
                .on("mousedown", function(d,i) {
                    d3.selectAll(".continent").classed("selected", false);
                    if(selectedContinent === d.name) {
                        selectedContinent = undefined;
                        filterBarData(undefined);
                        return redraw();
                       
                    }
                    d3.select("#"+ d.name.replace(/\s/g, '')).classed("selected", true);
                    filterBarData(d.name)
                    selectedContinent = d.name;
                    clearHighlightBar();
                    clearMapHighlight();
                    selectedCountry = undefined;	
                    redraw();
                });

        });


        function loop() {
        }

        function change() {
            clearInterval(interval);
            update(options[this.selectedIndex]);
        }

        function update(option) {
            svg.selectAll("path").transition()
                .duration(750)
                .attrTween("d", projectionTween(projection, projection = option.projection));
        }

        function projectionTween(projection0, projection1) {
            return function (d) {
                var t = 0;

                var projection = d3.geo.projection(project)
                    .scale(1)
                    .translate([width / 2, height/1.7]);

                path = d3.geo.path().projection(projection);

                function project(λ, φ) {
                    λ *= 180 / Math.PI, φ *= 180 / Math.PI;
                    var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
                    return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
                }

                return function (_) {
                    t = _;
                    return path(d);
                };
            };
        }
        update(options[0]);

    }


    function drawSPM(){

        d3.select(".scatterSVG").remove();


        var width = 960,
            size = 200,
            padding = 19.5;

        var x = d3.scale.linear()
            .range([padding / 2, size - padding / 2]);

        var y = d3.scale.linear()
            .range([size - padding / 2, padding / 2]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5);

        var color = d3.scale.category10();

        var traits = ["UnemploymentRate","HIV/AIDSAdult","HIV/AIDSDeath","HIV/AIDSLiving"];
        var domainByTrait = {},
            n = traits.length;

        traits.forEach(function(trait) {
            domainByTrait[trait] = d3.extent(barData, function(d) { return +d[trait]; });
        });

        xAxis.tickSize(size * n );
        yAxis.tickSize(-size * n);

        var svg = d3.select("#scatterPlot").append("svg")
            .attr("class", "scatterSVG")
            .attr("width", size * n + padding)
            .attr("height", size * n + padding + 20)
            .append("g")
            .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

        svg.selectAll(".x.axis")
            .data(traits)
            .enter().append("g")
            .attr("class", "x axis")
            .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
            .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

        svg.selectAll(".y.axis")
            .data(traits)
            .enter().append("g")
            .attr("class", "y axis")
            .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
            .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

        var cell = svg.selectAll(".cell")
            .data(cross(traits, traits))
            .enter().append("g")
            .attr("class", "cell")
            .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
            .each(plot);

        // Titles for the diagonal.
        cell.filter(function(d) { return d.i === d.j; }).append("text")
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .text(function(d) { return d.x; });

        function plot(p) {
            var cell = d3.select(this);

            x.domain(domainByTrait[p.x]);
            y.domain(domainByTrait[p.y]);

            cell.append("rect")
                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", size - padding)
                .attr("height", size - padding);

            cell.selectAll("circle")
                .data(barData)
                .enter().append("circle")
                .attr("cx", function(d) { return x(d[p.x]); })
                .attr("cy", function(d) { return y(d[p.y]); })
                .attr("r", 3)
                .style("fill", function(d) { return color(d.species); });
        }

        function cross(a, b) {
            var c = [], n = a.length, m = b.length, i, j;
            for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
            return c;
        }

        d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");

    }

    function drawAll(){
        d3.selectAll("svg").remove();
        drawMap();
        drawCandle();
        drawNavMap();
        drawDropMenus();
        drawSPM();
    }

    function redraw(){
		d3.select(".mapSvg").remove();
        drawMap();	
        drawCandle();
        drawSPM();
    }

    drawAll();
	//matrix();

});

/*
function matrix() { 
var margin = {top: 10, right: 40, bottom: 30, left: 70},
    width = 300- margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;


//population vs hiv death


// setup x 
var xValue = function(d) { return d["Population"] ;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(3);
	


// setup y
var yValue = function(d) { return d["HIV/AIDSDeath"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);


// add svg element to the div
var svg = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the body
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("data/countries.csv", function(error, data) {


  data.forEach(function(d) {
    d["HIV/AIDSDeath"] = +d["HIV/AIDSDeath"];
   d["Population"]  = +d["Population"] ;
   d["Continent"];
     //console.log(d);
  });

  //domain spicification
  xScale.domain([d3.min(data, xValue)-1, 100000000]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Population");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 7)
      .attr("dy", ".80em")
      .style("text-anchor", "end")
      .text("HIV/AIDSDeath");

  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", "dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(400)
               .style("opacity", 1);
          tooltip.html(d["Country"] + "<br/> (" + xValue(d) 
	        + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

 
  
});



//    death rate vs hiv/aids death


// setup x 
var xValue2 = function(d) { return d["DeathRate"] ;}, // data -> value
    xScale2 = d3.scale.linear().range([0, width]), // value -> display
    xMap2 = function(d) { return xScale2(xValue2(d));}, // data -> display
    xAxis2 = d3.svg.axis().scale(xScale2).orient("bottom").ticks(5);


// setup y
var yValue2 = function(d) { return d["HIV/AIDSDeath"];},  
    yScale2 = d3.scale.linear().range([height, 0]),  
    yMap2 = function(d) { return yScale2(yValue2(d));},  
    yAxis2 = d3.svg.axis().scale(yScale2).orient("left").ticks(5);


// add the graph canvas to body
var svg2 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// load data
d3.csv("data/countries.csv", function(error, data) {


  data.forEach(function(d) {
    d["DeathRate"] = +d["DeathRate"];
   d["Population"]  = +d["Population"] ;
   d["Continent"];
     //console.log(d);
  });
// domain spicification
  xScale2.domain([d3.min(data, xValue2)-1,d3.max(data, xValue2)+1]);
  yScale2.domain([d3.min(data, yValue2)-1, d3.max(data, yValue2)+1]);

  // x-axis
  svg2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis2)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Death rate");

  // y-axis
  svg2.append("g")
      .attr("class", "y axis")
      .call(yAxis2)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("HIV/AIDSDeath");

  // draw dot
  svg2.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("cx", xMap2)
      .attr("cy", yMap2)
      .style("fill", "dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(400)
               .style("opacity", .8);
          tooltip.html(d["Country"] + "<br/> (" + xValue2(d) 
	        + ", " + yValue2(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(300)
               .style("opacity", 0);
      });

 
  
});


//life epectency vs hiv death


// setup x 
var xValue3 = function(d) { return d["LifeExpectancy"] ;}, // data -> value
    xScale3 = d3.scale.linear().range([0, width]), // value -> display
    xMap3 = function(d) { return xScale3(xValue3(d));}, // data -> display
    xAxis3 = d3.svg.axis().scale(xScale3).orient("bottom").ticks(5);


// setup y
var yValue3 = function(d) { return d["HIV/AIDSDeath"];}, // data -> value
    yScale3 = d3.scale.linear().range([height, 0]), // value -> display
    yMap3 = function(d) { return yScale3(yValue3(d));}, // data -> display
    yAxis3 = d3.svg.axis().scale(yScale3).orient("left").ticks(5);

// add the graph canvas the body
var svg3 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// load data
d3.csv("data/countries.csv", function(error, data) {

 
  data.forEach(function(d) {
    d["LifeExpectancy"] = +d["LifeExpectancy"];
   d["HIV/AIDSDeath"]  = +d["HIV/AIDSDeath"] ;
   d["Continent"];
     //console.log(d);
  });

  xScale3.domain([d3.min(data, xValue3)-1,d3.max(data, xValue3)+1]);
  yScale3.domain([d3.min(data, yValue3)-1, d3.max(data, yValue3)+1]);

  // x-axis
  svg3.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis3)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("LifeExpectancy");

  // y-axis
  svg3.append("g")
      .attr("class", "y axis")
      .call(yAxis3)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("HIV/AIDSDeath");

  // draw dot
  svg3.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("cx", xMap3)
      .attr("cy", yMap3)
      .style("fill", "dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .8);
          tooltip.html(d["Country"] + "<br/> (" + xValue3(d) 
	        + ", " + yValue3(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", 0);
      });


});



//HIV/AIDSLiving vs hiv death


// setup x 
var xValue9 = function(d) { return d["HIV/AIDSLiving"] ;}, // data -> value
    xScale9 = d3.scale.linear().range([0, width]), // value -> display
    xMap9 = function(d) { return xScale9(xValue9(d));}, // data -> display
    xAxis9 = d3.svg.axis().scale(xScale9).orient("bottom").ticks(3);
	


// setup y
var yValue9 = function(d) { return d["HIV/AIDSDeath"];}, // data -> value
    yScale9 = d3.scale.linear().range([height, 0]), // value -> display
    yMap9 = function(d) { return yScale9(yValue9(d));}, // data -> display
    yAxis9 = d3.svg.axis().scale(yScale9).orient("left").ticks(3);


// add svg element to the div
var svg9 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the body
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("data/countries.csv", function(error, data) {


  data.forEach(function(d) {
    d["HIV/AIDSDeath"] = +d["HIV/AIDSDeath"];
   d["HIV/AIDSLiving"]  = +d["HIV/AIDSLiving"] ;
   d["Continent"];
     //console.log(d);
  });

  //domain spicification
  xScale9.domain([d3.min(data, xValue9)-1, d3.max(data, xValue9)+1]);
  yScale9.domain([d3.min(data, yValue9)-1, d3.max(data, yValue9)+1]);

  // x-axis
  svg9.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis9)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("HIV/AIDSLiving");

  // y-axis
  svg9.append("g")
      .attr("class", "y axis")
      .call(yAxis9)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 7)
      .attr("dy", ".80em")
      .style("text-anchor", "end")
      .text("HIV/AIDSDeath");

  // draw dots
  svg9.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("cx", xMap9)
      .attr("cy", yMap9)
      .style("fill", "dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(400)
               .style("opacity", 1);
          tooltip.html(d["Country"] + "<br/> (" + xValue9(d) 
	        + ", " + yValue9(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

 
  
});


//population vs hiv living


// setup x 
var xValue5 = function(d) { return d["Population"] ;}, 
    xScale5 = d3.scale.linear().range([0, width]), 
    xMap5 = function(d) { return xScale5(xValue5(d));} 
    xAxis5 = d3.svg.axis().scale(xScale5).orient("bottom").ticks(3);
 

// setup y
var yValue5 = function(d) { return d["HIV/AIDSLiving"];}, // data -> value
    yScale5 = d3.scale.linear().range([height, 0]), // value -> display
    yMap5 = function(d) { return yScale5(yValue5(d));}, // data -> display
    yAxis5 = d3.svg.axis().scale(yScale5).orient("left").ticks(3);


// add the graph canvas to the body 
var svg5 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {


  data.forEach(function(d) {
    d["DeathRate"] = +d["DeathRate"];
   d["Population"]  = +d["Population"] ;
   d["Continent"];
     //console.log(d);
  });

// domain spicification
  xScale5.domain([d3.min(data, xValue5)-1,d3.max(data, xValue5)+1]);
  yScale5.domain([d3.min(data, yValue5)-1, 5000000]);

  // x-axis
  svg5.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis5)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Population");

  // y-axis
  svg5.append("g")
      .attr("class", "y axis")
      .call(yAxis5)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("HIV/AIDSLiving");

  // draw dots
  svg5.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("cx", xMap5)
      .attr("cy", yMap5)
      .style("fill", "dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue5(d) 
	        + ", " + yValue5(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });
});

// death rate vs HIV living


// setup x 
var xValue6 = function(d) { return d["DeathRate"] ;}, // data -> value
    xScale6 = d3.scale.linear().range([0, width]), // value -> display
    xMap6 = function(d) { return xScale6(xValue6(d));}, // data -> display
    xAxis6 = d3.svg.axis().scale(xScale6).orient("bottom").ticks(5);


// setup y
var yValue6 = function(d) { return d["HIV/AIDSLiving"];}, // data -> value
    yScale6 = d3.scale.linear().range([height, 0]), // value -> display
    yMap6 = function(d) { return yScale6(yValue6(d));}, // data -> display
    yAxis6 = d3.svg.axis().scale(yScale6).orient("left").ticks(5);


// add the graph canvas to the body of the webpage
var svg6 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {


  data.forEach(function(d) {
    d["DeathRate"] = +d["DeathRate"];
   d["Population"]  = +d["Population"] ;
   d["Continent"];
     //console.log(d);
  });

  // domain spicification
  xScale6.domain([d3.min(data, xValue6)-1,d3.max(data, xValue6)+1]);
  yScale6.domain([d3.min(data, yValue6)-1, 5500000]);

  // x-axis
  svg6.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis6)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Death Rate");

  // y-axis
  svg6.append("g")
      .attr("class", "y axis")
      .call(yAxis6)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".9 em")
      .style("text-anchor", "end")
      .text("HIV/AIDSLiving");

  // draw dots
  svg6.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("cx", xMap6)
      .attr("cy", yMap6)
      .style("fill", "dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue6(d) 
	        + ", " + yValue6(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", 0);
      });
  
});



//	life expectncey vs hiv living


// setup x 
var xValue4 = function(d) { return d["LifeExpectancy"] ;}, // data -> value
    xScale4 = d3.scale.linear().range([0, width]), // value -> display
    xMap4 = function(d) { return xScale4(xValue4(d));}, // data -> display
    xAxis4 = d3.svg.axis().scale(xScale4).orient("bottom").ticks(5);


// setup y
var yValue4 = function(d) { return d["HIV/AIDSLiving"];}, // data -> value
    yScale4 = d3.scale.linear().range([height, 0]), // value -> display
    yMap4 = function(d) { return yScale4(yValue4(d));}, // data -> display
    yAxis4 = d3.svg.axis().scale(yScale4).orient("left").ticks(5);


// add the graph canvas to the body 
var svg4 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
    d["HIV/AIDSLiving"] = +d["HIV/AIDSLiving"];
   d["LifeExpectancy"]  = +d["LifeExpectancy"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale4.domain([d3.min(data, xValue4)-1,d3.max(data, xValue4)+1]);
  yScale4.domain([d3.min(data, yValue4)-1, 5500000]);

  // x-axis
  svg4.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis4)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("LifeExpectancy");

  // y-axis
  svg4.append("g")
      .attr("class", "y axis")
      .call(yAxis4)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("HIV/AIDSLiving");

  // draw dots
  svg4.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap4)
      .attr("cy", yMap4)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue4(d) 
	        + ", " + yValue4(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  
});
// hiv death vs hiv living 

// setup x 
var xValue12 = function(d) { return d["HIV/AIDSDeath"];}, // data -> value
    xScale12 = d3.scale.linear().range([0, width]), // value -> display
    xMap12 = function(d) { return xScale12(xValue12(d));}, // data -> display
    xAxis12 = d3.svg.axis().scale(xScale12).orient("bottom").ticks(3);
	


// setup y
var yValue12= function(d) { return d["HIV/AIDSLiving"];}, // data -> value
    yScale12 = d3.scale.linear().range([height, 0]), // value -> display
    yMap12 = function(d) { return yScale12(yValue12(d));}, // data -> display
    yAxis12 = d3.svg.axis().scale(yScale12).orient("left").ticks(3);


// add svg element to the div
var svg12 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the body
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("data/countries.csv", function(error, data) {


  data.forEach(function(d) {
    d["HIV/AIDSDeath"] = +d["HIV/AIDSDeath"];
   d["HIV/AIDSLiving"]  = +d["HIV/AIDSLiving"] ;
   d["Continent"];
     //console.log(d);
  });

  //domain spicification
  xScale12.domain([d3.min(data, xValue9)-1, d3.max(data, xValue12)+1]);
  yScale12.domain([d3.min(data, yValue9)-1, d3.max(data, yValue12)+1]);

  // x-axis
  svg12.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis12)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("HIV/AIDSDeath");

  // y-axis
  svg12.append("g")
      .attr("class", "y axis")
      .call(yAxis12)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 7)
      .attr("dy", ".80em")
      .style("text-anchor", "end")
      .text("HIV/AIDSLiving");

  // draw dots
  svg12.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("cx", xMap12)
      .attr("cy", yMap12)
      .style("fill", "dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(400)
               .style("opacity", 1);
          tooltip.html(d["Country"] + "<br/> (" + xValue12(d) 
	        + ", " + yValue12(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

 
  
});

// poulation vs death rate


// setup x 
var xValue7 = function(d) { return d["DeathRate"] ;},  
    xScale7 = d3.scale.linear().range([0, width]), // value -> display
    xMap7 = function(d) { return xScale7(xValue7(d));}, 
    xAxis7 = d3.svg.axis().scale(xScale7).orient("bottom").ticks(5);


// setup y
var yValue7 = function(d) { return d["Population"];},
    yScale7 = d3.scale.linear().range([height, 0]), // value -> display
    yMap7 = function(d) { return yScale7(yValue7(d));}, // data -> display
    yAxis7 = d3.svg.axis().scale(yScale7).orient("left").ticks(5);


// add the graph canvas to the body 
var svg7 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
    d["DeathRate"] = +d["DeathRate"];
   d["Population"]  = +d["Population"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale7.domain([d3.min(data, xValue7)-1,d3.max(data, xValue7)+1]);
  yScale7.domain([d3.min(data, yValue7)-1, 600000000]);

  // x-axis
  svg7.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis7)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Deth rate");

  // y-axis
  svg7.append("g")
      .attr("class", "y axis")
      .call(yAxis7)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("population");

  // draw dots
  svg7.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap7)
      .attr("cy", yMap7)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue7(d) 
	        + ", " + yValue7(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  
});


// population vs life_expextency
// setup x 
var xValue8 = function(d) { return d["LifeExpectancy"] ;},  
    xScale8 = d3.scale.linear().range([0, width]), // value -> display
    xMap8 = function(d) { return xScale8(xValue8(d));}, 
    xAxis8 = d3.svg.axis().scale(xScale8).orient("bottom").ticks(5);


// setup y
var yValue8 = function(d) { return d["Population"];},
    yScale8 = d3.scale.linear().range([height, 0]), // value -> display
    yMap8 = function(d) { return yScale7(yValue7(d));}, // data -> display
    yAxis8 = d3.svg.axis().scale(yScale7).orient("left").ticks(5);


// add the graph canvas to the body 
var svg8 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
    d["LifeExpectancy"] = +d["LifeExpectancy"];
   d["Population"]  = +d["Population"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale8.domain([d3.min(data, xValue8)-1,d3.max(data, xValue8)+1]);
  yScale8.domain([d3.min(data, yValue8)-1, 600000000]);

  // x-axis
  svg8.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis8)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("LifeExpectancy");

  // y-axis
  svg8.append("g")
      .attr("class", "y axis")
      .call(yAxis8)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("population");

  // draw dots
  svg8.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap8)
      .attr("cy", yMap8)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue8(d) 
	        + ", " + yValue8(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  
});

//population vs hiv/living

var xValue10 = function(d) { return d["HIV/AIDSLiving"] ;},  
    xScale10 = d3.scale.linear().range([0, width]), 
    xMap10 = function(d) { return xScale10(xValue10(d));}, 
    xAxis10 = d3.svg.axis().scale(xScale10).orient("bottom").ticks(3);


// setup y
var yValue10 = function(d) { return d["Population"];},
    yScale10 = d3.scale.linear().range([height, 0]), // value -> display
    yMap10 = function(d) { return yScale10(yValue10(d));}, // data -> display
    yAxis10 = d3.svg.axis().scale(yScale10).orient("left").ticks(5);


// add the graph canvas to the body 
var svg10 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
    d["LifeExpectancy"] = +d["LifeExpectancy"];
   d["Population"]  = +d["Population"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale10.domain([d3.min(data, xValue10)-1,d3.max(data, xValue10)+1]);
  yScale10.domain([d3.min(data, yValue10)-1, 600000000]);

  // x-axis
  svg10.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis10)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("HIV Living");

  // y-axis
  svg10.append("g")
      .attr("class", "y axis")
      .call(yAxis10)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("population");

  // draw dots
  svg10.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap10)
      .attr("cy", yMap10)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue10(d) 
	        + ", " + yValue10(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  
});

// population vs hiv death


var xValue11= function(d) { return d["HIV/AIDSDeath"] ;},  
    xScale11 = d3.scale.linear().range([0, width]), 
    xMap11 = function(d) { return xScale11(xValue11(d));}, 
    xAxis11 = d3.svg.axis().scale(xScale11).orient("bottom").ticks(3);


// setup y
var yValue11 = function(d) { return d["Population"];},
    yScale11 = d3.scale.linear().range([height, 0]), // value -> display
    yMap11 = function(d) { return yScale11(yValue11(d));}, // data -> display
    yAxis11 = d3.svg.axis().scale(yScale11).orient("left").ticks(5);


// add the graph canvas to the body 
var svg11 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
    d["HIV/AIDSDeath"] = +d["HIV/AIDSDeath"];
   d["Population"]  = +d["Population"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale11.domain([d3.min(data, xValue11)-1,d3.max(data, xValue11)+1]);
  yScale11.domain([d3.min(data, yValue11)-1, 600000000]);

  // x-axis
  svg11.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis11)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("HIV DEATH");

  // y-axis
  svg11.append("g")
      .attr("class", "y axis")
      .call(yAxis11)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("population");

  // draw dots
  svg11.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap11)
      .attr("cy", yMap11)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue11(d) 
	        + ", " + yValue11(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  
});
//death rate vs population 

var xValue13= function(d) { return d["Population"];},  
    xScale13 = d3.scale.linear().range([0, width]), 
    xMap13 = function(d) { return xScale13(xValue13(d));}, 
    xAxis13 = d3.svg.axis().scale(xScale13).orient("bottom").ticks(3);


// setup y
var yValue13 = function(d) { return d["DeathRate"];},
    yScale13 = d3.scale.linear().range([height, 0]), // value -> display
    yMap13 = function(d) { return yScale13(yValue13(d));}, // data -> display
    yAxis13 = d3.svg.axis().scale(yScale13).orient("left").ticks(5);


// add the graph canvas to the body 
var svg13 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
    d["Population"] = +d["Population"];
   d["DeathRate"]  = +d["DeathRate"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale13.domain([d3.min(data, xValue13)-1,1000000000]);
  yScale13.domain([d3.min(data, yValue13)-1, d3.max(data, yValue13)]);

  // x-axis
  svg13.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis13)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("population");

  // y-axis
  svg13.append("g")
      .attr("class", "y axis")
      .call(yAxis13)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 16)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Death rate");

  // draw dots
  svg13.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap13)
      .attr("cy", yMap13)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue13(d) 
	        + ", " + yValue13(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  
});

// hiv death vs death rate
var xValue14= function(d) { return d["HIV/AIDSDeath"];},  
    xScale14 = d3.scale.linear().range([0, width]), 
    xMap14 = function(d) { return xScale14(xValue14(d));}, 
    xAxis14 = d3.svg.axis().scale(xScale14).orient("bottom").ticks(3);


// setup y
var yValue14 = function(d) { return d["DeathRate"];},
    yScale14 = d3.scale.linear().range([height, 0]), // value -> display
    yMap14 = function(d) { return yScale14(yValue14(d));}, // data -> display
    yAxis14 = d3.svg.axis().scale(yScale14).orient("left").ticks(5);


// add the graph canvas to the body 
var svg14 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
   d["HIV/AIDSDeath"] = +d["HIV/AIDSDeath"];
   d["DeathRate"]  = +d["DeathRate"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale14.domain([d3.min(data, xValue14)-1,d3.max(data, xValue14)]);
  yScale14.domain([d3.min(data, yValue14)-1, d3.max(data, yValue14)]);

  // x-axis
  svg14.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis14)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("HIV Death");

  // y-axis
  svg14.append("g")
      .attr("class", "y axis")
      .call(yAxis14)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Death rate");

  // draw dots
  svg14.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap14)
      .attr("cy", yMap14)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue14(d) 
	        + ", " + yValue14(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  
});

// death rate vs hivliving
var xValue15= function(d) { return d["HIV/AIDSLiving"];},  
    xScale15 = d3.scale.linear().range([0, width]), 
    xMap15 = function(d) { return xScale15(xValue15(d));}, 
    xAxis15 = d3.svg.axis().scale(xScale15).orient("bottom").ticks(3);


// setup y
var yValue15 = function(d) { return d["DeathRate"];},
    yScale15 = d3.scale.linear().range([height, 0]), // value -> display
    yMap15 = function(d) { return yScale15(yValue15(d));}, // data -> display
    yAxis15 = d3.svg.axis().scale(yScale15).orient("left").ticks(5);


// add the graph canvas to the body 
var svg15 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
   d["HIV/AIDSLiving"] = +d["HIV/AIDSLiving"];
   d["DeathRate"]  = +d["DeathRate"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale15.domain([d3.min(data, xValue15)-1,d3.max(data, xValue15)]);
  yScale15.domain([d3.min(data, yValue15)-1, d3.max(data, yValue15)]);

  // x-axis
  svg15.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis15)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Hiv Living");

  // y-axis
  svg15.append("g")
      .attr("class", "y axis")
      .call(yAxis15)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Death rate");

  // draw dots
  svg15.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap15)
      .attr("cy", yMap15)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue15(d) 
	        + ", " + yValue15(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  
});

// death rate vs life expectencey 
var xValue16= function(d) { return d["LifeExpectancy"];},  
    xScale16 = d3.scale.linear().range([0, width]), 
    xMap16 = function(d) { return xScale16(xValue16(d));}, 
    xAxis16 = d3.svg.axis().scale(xScale16).orient("bottom").ticks(3);


// setup y
var yValue16 = function(d) { return d["DeathRate"];},
    yScale16 = d3.scale.linear().range([height, 0]), // value -> display
    yMap16 = function(d) { return yScale16(yValue16(d));}, // data -> display
    yAxis16 = d3.svg.axis().scale(yScale16).orient("left").ticks(5);


// add the graph canvas to the body 
var svg16 = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("data/countries.csv", function(error, data) {

  data.forEach(function(d) {
   d["LifeExpectancy"] = +d["LifeExpectancy"];
   d["DeathRate"]  = +d["DeathRate"] ;
   d["Continent"];
     //console.log(d);
  });
// domain requirment for the axis
  xScale16.domain([d3.min(data, xValue16)-1,d3.max(data, xValue16)]);
  yScale16.domain([d3.min(data, yValue16)-1, d3.max(data, yValue16)]);

  // x-axis
  svg16.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis16)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Life expextency");

  // y-axis
  svg16.append("g")
      .attr("class", "y axis")
      .call(yAxis16)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Death rate");

  // draw dots
  svg16.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap16)
      .attr("cy", yMap16)
      .style("fill","dodgerblue") 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Country"] + "<br/> (" + xValue16(d) 
	        + ", " + yValue16(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

  
});
*/

