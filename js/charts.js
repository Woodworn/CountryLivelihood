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
            if (selectedContinent != undefined) {


                if (d.Continent != selectedContinent){
                    return undefined;
                }
            }
            return +d[valueKey];
        });
        var vMin = d3.min(data, function (d) {
            if (selectedContinent != undefined) {


                if (d.Continent != selectedContinent){
                    return undefined;
                }
            }
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
            d3.selectAll("#Dot" + id).style("fill",dotColor);
        }
    };

    var highlightBar = function(){
        if(selectedCountry != undefined) {
            var id = selectedCountry[nameKey].replace(/\s/g, '');
            d3.select("#TopCandle" + id).attr("fill", barHighlight);
            d3.select("#BottomCandle" + id).attr("fill", barHighlight);
            d3.selectAll("#Dot" + id).style("fill","red");
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

        var options = ["BirthRate", "DeathRate", "Population", "Area","InfantMortality","LifeExpectancy","FertilityRate","UnemploymentRate","PopulationDensity"];

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

    var dotColor = "#1f77b4";
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

        var traits = ["UnemploymentRate","PopulationDensity","HIV/AIDSAdult","HIV/AIDSDeath","HIV/AIDSLiving"];
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
                .attr("id",function (d) {
                    return "Dot" + d[nameKey].replace(/\s/g, '');
                })
                .attr("cx", function(d) { return x(d[p.x]); })
                .attr("cy", function(d) { return y(d[p.y]); })
                .attr("r", 3)
                .style("fill", function(d) {
                    return dotColor;
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

});

